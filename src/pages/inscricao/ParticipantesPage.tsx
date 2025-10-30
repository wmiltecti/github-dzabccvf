import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInscricaoStore } from '../../lib/store/inscricao';
import { createPF, createPJ, getByCpfCnpj } from '../../lib/api/people';
import { uploadProcuracao } from '../../lib/api/docs';
import { Users, Plus, CreditCard as Edit, Trash2, User, Building, FileText, ArrowRight, AlertTriangle, Zap, X } from 'lucide-react';
import type { Participant } from '../../types/inscription';
import { upsertParticipant, getParticipants, removeParticipant as removeParticipantDb } from '../../lib/api/process';

export default function ParticipantesPage() {
  const navigate = useNavigate();

  const {
    participants,
    setParticipants,
    removeParticipant, // fallback local (só se não houver dados mínimos para apagar no BD)
    // updateParticipant, // não vamos usar no fluxo BD-first
    processId: pid,     // <- alias local
    isStepComplete,
    canProceedToStep,
  } = useInscricaoStore();

  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Participant>({
    type: 'PF',
    role: 'REQUERENTE',
  });
  const [loading, setLoading] = useState(false);
  const [procuracaoFile, setProcuracaoFile] = useState<File | null>(null);

  // ---- helpers ----
  async function syncParticipantsFromDb(procId: number) {
    const res = await getParticipants(procId);
    if (res.error) throw new Error(res.error.message);
    setParticipants(res.data || []);
  }

  React.useEffect(() => {
    (async () => {
      try {
        if (pid) await syncParticipantsFromDb(pid);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [pid]);

  // Mock data para testes manuais
  const mockDataPF = {
    type: 'PF' as const,
    role: 'REQUERENTE' as const,
    cpf: '123.456.789-00',
    nome: 'João Silva Santos',
    sexo: 'M',
    nacionalidade: 'Brasileira',
    estado_civil: 'Casado',
    profissao: 'Engenheiro Ambiental',
    celular: '(11) 99999-8888',
    email: 'joao.silva@email.com',
  };

  const mockDataPJ = {
    type: 'PJ' as const,
    role: 'REQUERENTE' as const,
    cnpj: '12.345.678/0001-90',
    razao_social: 'Empresa Ambiental Ltda',
    inscricao_estadual: '123.456.789.012',
    celular: '(11) 3333-4444',
    email: 'contato@empresaambiental.com.br',
  };

  const mockDataProcurador = {
    type: 'PF' as const,
    role: 'PROCURADOR' as const,
    cpf: '987.654.321-00',
    nome: 'Maria Oliveira Costa',
    sexo: 'F',
    nacionalidade: 'Brasileira',
    estado_civil: 'Solteiro',
    profissao: 'Advogada',
    celular: '(11) 88888-7777',
    email: 'maria.oliveira@advocacia.com.br',
  };

  const mockDataRespTecnico = {
    type: 'PF' as const,
    role: 'RESP_TECNICO' as const,
    cpf: '456.789.123-00',
    nome: 'Carlos Eduardo Pereira',
    sexo: 'M',
    nacionalidade: 'Brasileira',
    estado_civil: 'Divorciado',
    profissao: 'Engenheiro Florestal',
    celular: '(11) 77777-6666',
    email: 'carlos.pereira@consultoria.com.br',
  };

  const fillMockData = () => {
    const hasRequerente = participants.some((p) => p.role === 'REQUERENTE');
    const hasProcurador = participants.some((p) => p.role === 'PROCURADOR');
    const hasRespTecnico = participants.some((p) => p.role === 'RESP_TECNICO');

    let mockData: Participant;
    if (!hasRequerente) mockData = mockDataPF as any;
    else if (!hasProcurador) mockData = mockDataProcurador as any;
    else if (!hasRespTecnico) mockData = mockDataRespTecnico as any;
    else mockData = mockDataPJ as any;

    setFormData(mockData);
  };

  const handleAddParticipant = () => {
    setEditingIndex(null);
    setFormData({ type: 'PF', role: 'REQUERENTE' } as Participant);
    setShowForm(true);
  };

  const handleEditParticipant = (index: number) => {
    setEditingIndex(index);
    setFormData(participants[index] as Participant);
    setShowForm(true);
  };

  const handleRemoveParticipant = async (index: number) => {
    if (!pid) return alert('processId não encontrado.');
    if (!confirm('Tem certeza que deseja remover este participante?')) return;

    try {
      const p = participants[index] as any;
      if (!p?.id || !p.role) {
        // Sem dados mínimos → remove só local
        removeParticipant(index);
        return;
      }
      const { error } = await removeParticipantDb(pid, p.id, p.role);
      if (error) throw new Error(error.message);

      await syncParticipantsFromDb(pid);
    } catch (e: any) {
      console.error(e);
      alert('Erro ao remover participante: ' + e.message);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!pid) throw new Error('processId não encontrado. Reabra a inscrição.');

      // 1) Validação mínima
      if (formData.type === 'PF') {
        if (!formData.cpf || !formData.nome) {
          throw new Error('CPF e nome são obrigatórios para pessoa física');
        }
      } else {
        if (!formData.cnpj || !formData.razao_social) {
          throw new Error('CNPJ e razão social são obrigatórios para pessoa jurídica');
        }
      }

      // 2) Verifica/Cria pessoa no BD
      const cpfCnpj = formData.type === 'PF' ? formData.cpf! : formData.cnpj!;
      let personId: number;

      const { data: existingPerson } = await getByCpfCnpj(cpfCnpj);
      if (existingPerson?.id) {
        personId = existingPerson.id;
      } else {
        const createResult = formData.type === 'PF'
          ? await createPF(formData as any)
          : await createPJ(formData as any);
        if (createResult.error) throw new Error(createResult.error.message);
        personId = createResult.data.id;
      }

      // 3) Upload da procuração (se PROCURADOR)
      let procuracaoPath: string | null = null;
      if (formData.role === 'PROCURADOR') {
        if (!procuracaoFile) throw new Error('Procurador exige upload da procuração (PDF).');
        const { data: up, error: upErr } = await uploadProcuracao(pid, procuracaoFile);
        if (upErr) throw new Error('Erro no upload da procuração: ' + upErr.message);
        procuracaoPath = up!.path;
      }

      // 4) Vincula participante no BD (idempotente)
      const { error: linkErr } = await upsertParticipant(pid, {
        personId,
        role: formData.role as any,
        procuracao_file_id: procuracaoPath ?? undefined,
      });
      if (linkErr) throw new Error(linkErr.message);

      // 5) Sincroniza store a partir do BD
      await syncParticipantsFromDb(pid);

      // 6) Fecha modal e limpa estados
      setShowForm(false);
      setEditingIndex(null);
      setProcuracaoFile(null);
      alert('Participante salvo com sucesso!');
    } catch (error) {
      console.error('Error saving participant:', error);
      alert('Erro ao salvar participante: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (canProceedToStep(2)) {
      navigate('/inscricao/imovel');
    }
  };

  const getParticipantIcon = (role: string) => {
    switch (role) {
      case 'REQUERENTE':
        return <User className="w-5 h-5 text-blue-600" />;
      case 'PROCURADOR':
        return <FileText className="w-5 h-5 text-purple-600" />;
      case 'RESP_TECNICO':
        return <Building className="w-5 h-5 text-green-600" />;
      default:
        return <User className="w-5 h-5 text-gray-600" />;
    }
  };

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

  const hasRequerente = participants.some((p) => p.role === 'REQUERENTE');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Participantes do Processo</h2>
        <p className="text-gray-600">
          Adicione o requerente, procurador (se houver) e responsável técnico do empreendimento.
        </p>
      </div>

      {/* Lista */}
      <div className="space-y-4 mb-6">
        {participants.map((participant, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getParticipantIcon(participant.role)}
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">
                      {participant.type === 'PF' ? participant.nome : participant.razao_social}
                    </h3>
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
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditParticipant(index)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRemoveParticipant(index)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {participants.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum participante adicionado</h3>
            <p className="text-gray-500 mb-4">Adicione pelo menos um requerente para continuar</p>
          </div>
        )}
      </div>

      {/* Botão adicionar */}
      <div className="mb-6">
        <button
          onClick={handleAddParticipant}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Adicionar Participante
        </button>
      </div>

      {/* Aviso requerente */}
      {!hasRequerente && participants.length > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900">Requerente obrigatório</h4>
              <p className="text-sm text-yellow-800 mt-1">
                É necessário adicionar pelo menos um participante com o papel de "Requerente" para continuar.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navegação */}
      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={!isStepComplete(1)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          Próximo: Imóvel
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingIndex !== null ? 'Editar' : 'Adicionar'} Participante
                </h3>
                <button
                  type="button"
                  onClick={fillMockData}
                  className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  title="Preencher com dados de exemplo"
                >
                  <Zap className="w-4 h-4" />
                  Dados de Exemplo
                </button>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Tipo e Papel */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Pessoa</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as 'PF' | 'PJ' }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="PF">Pessoa Física</option>
                    <option value="PJ">Pessoa Jurídica</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Papel no Processo</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value as any }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="REQUERENTE">Requerente</option>
                    <option value="PROCURADOR">Procurador</option>
                    <option value="RESP_TECNICO">Responsável Técnico</option>
                  </select>
                </div>
              </div>

              {/* Dados da Pessoa */}
              {formData.type === 'PF' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CPF *</label>
                      <input
                        type="text"
                        value={formData.cpf || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, cpf: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="000.000.000-00"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                      <input
                        type="text"
                        value={formData.nome || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Nome completo"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sexo</label>
                      <select
                        value={formData.sexo || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, sexo: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Selecione...</option>
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estado Civil</label>
                      <select
                        value={formData.estado_civil || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, estado_civil: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Selecione...</option>
                        <option value="Solteiro">Solteiro(a)</option>
                        <option value="Casado">Casado(a)</option>
                        <option value="Divorciado">Divorciado(a)</option>
                        <option value="Viúvo">Viúvo(a)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nacionalidade</label>
                      <input
                        type="text"
                        value={formData.nacionalidade || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, nacionalidade: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Ex: Brasileira"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profissão</label>
                      <input
                        type="text"
                        value={formData.profissao || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, profissao: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Ex: Engenheiro"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ *</label>
                      <input
                        type="text"
                        value={formData.cnpj || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, cnpj: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="00.000.000/0000-00"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Razão Social *</label>
                      <input
                        type="text"
                        value={formData.razao_social || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, razao_social: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Razão social da empresa"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Inscrição Estadual</label>
                    <input
                      type="text"
                      value={formData.inscricao_estadual || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, inscricao_estadual: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Inscrição estadual"
                    />
                  </div>
                </div>
              )}

              {/* Contato */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Celular</label>
                  <input
                    type="text"
                    value={formData.celular || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, celular: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>

              {/* Procuração */}
              {formData.role === 'PROCURADOR' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Procuração (PDF) *</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setProcuracaoFile(e.target.files?.[0] || null)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required={formData.role === 'PROCURADOR'}
                  />
                  {procuracaoFile && (
                    <p className="text-sm text-green-600 mt-1">Arquivo selecionado: {procuracaoFile.name}</p>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {loading ? 'Salvando...' : editingIndex !== null ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
