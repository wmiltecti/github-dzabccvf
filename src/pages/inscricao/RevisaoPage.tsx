import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInscricaoStore } from '../../lib/store/inscricao';
import { FileCheck, ArrowLeft, Send, Users, Home, Building, CheckCircle, AlertTriangle } from 'lucide-react';

// use o mesmo client do restante do app
import { supabase } from '../../lib/supabase';

// Services centralizados
import { linkProperty, getParticipants, linkActivity } from '../../lib/api/process';

export default function RevisaoPage() {
  const navigate = useNavigate();
  const {
    processId,
    propertyId,
    participants,
    property,
    titles,
    atividadeId,
    reset,
  } = useInscricaoStore();

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!processId) {
      alert('Erro: Processo não encontrado');
      return;
    }

    setSubmitting(true);
    try {
      // 0) Usuário atual (UUID p/ comparar com created_by)
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) throw new Error('Usuário não autenticado');

      // 1) Vincula imóvel ao processo (id bigint)
      if (propertyId) {
        const { error: linkError } = await linkProperty(processId, propertyId);
        if (linkError) throw new Error('Erro ao vincular imóvel: ' + linkError.message);
      }

      // 2) Valida participantes no BD
      const partsRes = await getParticipants(processId);
      if (partsRes.error) throw new Error(partsRes.error.message);
      const parts = partsRes.data || [];
      const hasReq = parts.some((p: any) => (p.role ?? '').toUpperCase() === 'REQUERENTE');
      const procuradorSemProc = parts.some(
        (p: any) => (p.role ?? '').toUpperCase() === 'PROCURADOR' && !p.procuracao_file_id
      );
      if (!hasReq) throw new Error('É obrigatório ter 1 Requerente.');
      if (procuradorSemProc) throw new Error('Procurador exige upload da procuração (PDF).');

      // 3) Carrega processo (bigint id) p/ checar dono e campos
      let { data: proc, error: gErr } = await supabase
        .from('license_processes')
        .select('id, user_id, company_id, activity, status')
        .eq('id', processId)
        .single();
      if (gErr) throw new Error(gErr.message);

      if (proc.user_id !== user.id) {
        throw new Error('Você não é o criador deste processo.');
      }
      if (!proc.company_id) throw new Error('Empresa não vinculada ao processo.');

      // 4) Se a atividade está no store mas ainda não foi gravada no BD, grava agora
      if (!proc.activity && atividadeId) {
        const { error: linkActErr } = await linkActivity(processId, atividadeId);
        if (linkActErr) throw new Error('Erro ao vincular atividade: ' + linkActErr.message);

        // recarrega o processo após gravar a atividade
        const refetch = await supabase
          .from('license_processes')
          .select('id, user_id, company_id, activity, status')
          .eq('id', processId)
          .single();
        if (refetch.error) throw new Error(refetch.error.message);
        proc = refetch.data;
      }

      if (!proc.activity) throw new Error('Atividade não selecionada.');

      // 5) Atualiza status do processo (evite license_processes aqui)
      const { error: updErr } = await supabase
        .from('license_processes')
        .update({
          status: 'submitted',
          progress: 25,
        })
        .eq('id', processId);
      if (updErr) throw new Error('Erro ao finalizar inscrição: ' + updErr.message);

      alert('Inscrição submetida com sucesso!');
      reset();
      navigate('/');
    } catch (error) {
      console.error('Error submitting inscription:', error);
      alert('Erro ao submeter inscrição: ' + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/inscricao/empreendimento');
  };

  const mockActivity = atividadeId
    ? {
        id: atividadeId,
        code: '1.1',
        name: 'Extração de areia',
        description: 'Extração de areia em leito de rio',
      }
    : null;

  const getRoleText = (role: string) => {
    switch (role) {
      case 'REQUERENTE':
        return 'Requerente';
      case 'PROCURADOR':
        return 'Procurador';
      case 'RESP_TECNICO':
        return 'Responsável Técnico';
      default:
        return role;
    }
  };

  const allStepsComplete =
    participants.length > 0 &&
    participants.some((p) => p.role === 'REQUERENTE') &&
    !!propertyId &&
    !!atividadeId;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Revisão e Submissão</h2>
        <p className="text-gray-600">Revise todas as informações antes de submeter o processo para análise.</p>
      </div>

      <div className="space-y-8">
        {/* Resumo */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center gap-2">
            <FileCheck className="w-5 h-5" />
            Resumo do Processo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-800">Processo ID:</span>
              <span className="ml-2 text-blue-700">#{processId}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Status:</span>
              <span className="ml-2 text-blue-700">Rascunho</span>
            </div>
          </div>
        </div>

        {/* Participantes */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Participantes ({participants.length})
          </h3>

          {participants.length > 0 ? (
            <div className="space-y-3">
              {participants.map((participant, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {participant.type === 'PF' ? participant.nome : participant.razao_social}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {participant.type}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          {getRoleText(participant.role)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {participant.type === 'PF' ? participant.cpf : participant.cnpj}
                      </p>
                      {participant.email && <p className="text-sm text-gray-500">{participant.email}</p>}
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 border border-gray-200 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-600">Nenhum participante adicionado</p>
            </div>
          )}
        </div>

        {/* Imóvel */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Home className="w-5 h-5" />
            Imóvel
          </h3>

          {property && propertyId ? (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-medium text-gray-900">Tipo: {property.kind}</span>
                  <p className="text-sm text-gray-600">
                    {property.address?.municipio}/{property.address?.uf}
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Endereço:</span>
                  <p className="text-gray-600">
                    {property.address?.logradouro}, {property.address?.numero}
                    <br />
                    {property.address?.municipio}/{property.address?.uf}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Coordenadas:</span>
                  <p className="text-gray-600">
                    {property.utm_lat && property.utm_long ? (
                      <>UTM: {property.utm_lat}, {property.utm_long}</>
                    ) : property.dms_lat && property.dms_long ? (
                      <>DMS: {property.dms_lat}, {property.dms_long}</>
                    ) : (
                      'Não informadas'
                    )}
                  </p>
                </div>
              </div>

              {titles.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="font-medium text-gray-700">Títulos de Propriedade:</span>
                  <div className="mt-2 space-y-1">
                    {titles.map((title, index) => (
                      <p key={index} className="text-sm text-gray-600">
                        Matrícula {title.matricula} - {title.nome_cartorio}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 border border-gray-200 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-600">Imóvel não configurado</p>
            </div>
          )}
        </div>

        {/* Atividade */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Building className="w-5 h-5" />
            Atividade do Empreendimento
          </h3>

          {mockActivity ? (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">{mockActivity.name}</span>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {mockActivity.code}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{mockActivity.description}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </div>
          ) : (
            <div className="text-center py-6 border border-gray-200 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-600">Atividade não selecionada</p>
            </div>
          )}
        </div>

        {/* Validação final */}
        <div
          className={`rounded-lg p-4 ${
            allStepsComplete ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className="flex items-start space-x-2">
            {allStepsComplete ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <div>
              {allStepsComplete ? (
                <>
                  <h4 className="font-medium text-green-900">Inscrição pronta para submissão</h4>
                  <p className="text-sm mt-1 text-green-800">
                    Todas as informações obrigatórias foram preenchidas. Você pode submeter a inscrição para análise.
                  </p>
                </>
              ) : (
                <>
                  <h4 className="font-medium text-red-900">Inscrição incompleta</h4>
                  <p className="text-sm mt-1 text-red-800">Complete todas as etapas antes de submeter a inscrição.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handleBack}
          className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar: Empreendimento
        </button>

        <button
          onClick={handleSubmit}
          disabled={!allStepsComplete || submitting}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submetendo Inscrição...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submeter Inscrição
            </>
          )}
        </button>
      </div>
    </div>
  );
}
