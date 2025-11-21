import React, { useState } from 'react';
import { ArrowLeft, FileText, Check, XCircle, Eye, CheckCircle, AlertCircle, Building2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface Documento {
  id: string;
  nome: string;
  tipo: string;
  url: string;
  status?: 'pendente' | 'aceito' | 'recusado';
  motivoRecusa?: string;
}

interface Empreendimento {
  numero: string;
  nome: string;
  atividades: string[];
}

interface PreProcesso {
  id: string;
  numero: string;
  requerente: string;
  dataSolicitacao: string;
  responsavelTecnico?: string;
  empreendimento?: Empreendimento;
  documentos?: Documento[];
}

interface PreProcessoFormalizacaoProps {
  preProcesso: PreProcesso;
  onVoltar: () => void;
  onFormalizar: (processoId: string, setorId: string) => void;
  onRecusar: (processoId: string) => void;
}

export default function PreProcessoFormalizacao({
  preProcesso,
  onVoltar,
  onFormalizar,
  onRecusar
}: PreProcessoFormalizacaoProps) {
  const [documentos, setDocumentos] = useState<Documento[]>(preProcesso.documentos || []);
  const [motivosRecusa, setMotivosRecusa] = useState<Record<string, string>>({});
  const [showSetorModal, setShowSetorModal] = useState(false);
  const [docVisualizando, setDocVisualizando] = useState<Documento | null>(null);

  const handleAceitarDocumento = (docId: string) => {
    setDocumentos(prev =>
      prev.map(doc =>
        doc.id === docId
          ? { ...doc, status: 'aceito', motivoRecusa: undefined }
          : doc
      )
    );
    const newMotivos = { ...motivosRecusa };
    delete newMotivos[docId];
    setMotivosRecusa(newMotivos);
  };

  const handleRecusarDocumento = (docId: string, motivo: string) => {
    if (!motivo.trim()) {
      toast.error('O motivo da recusa é obrigatório');
      return;
    }
    setDocumentos(prev =>
      prev.map(doc =>
        doc.id === docId
          ? { ...doc, status: 'recusado', motivoRecusa: motivo }
          : doc
      )
    );
  };

  const handleAceitarTodos = () => {
    setDocumentos(prev =>
      prev.map(doc => ({ ...doc, status: 'aceito', motivoRecusa: undefined }))
    );
    setMotivosRecusa({});
    toast.success('Todos os documentos foram aceitos');
  };

  const handleRecusarTodos = () => {
    const todosComMotivo = documentos.every(doc => {
      const motivo = motivosRecusa[doc.id];
      return motivo && motivo.trim().length > 0;
    });

    if (!todosComMotivo) {
      toast.error('É necessário informar o motivo da recusa para todos os documentos');
      return;
    }

    setDocumentos(prev =>
      prev.map(doc => ({
        ...doc,
        status: 'recusado',
        motivoRecusa: motivosRecusa[doc.id]
      }))
    );
    toast.info('Todos os documentos foram recusados');
  };

  const handleClickRecusar = () => {
    const temDocumentoRecusado = documentos.some(doc => doc.status === 'recusado');

    if (!temDocumentoRecusado) {
      toast.error('É necessário recusar pelo menos um documento');
      return;
    }

    const documentosRecusados = documentos.filter(doc => doc.status === 'recusado');
    const todosComMotivo = documentosRecusados.every(doc => doc.motivoRecusa && doc.motivoRecusa.trim().length > 0);

    if (!todosComMotivo) {
      toast.error('Todos os documentos recusados devem ter motivo preenchido');
      return;
    }

    if (window.confirm('Tem certeza que deseja recusar este pré-processo? Esta ação enviará notificação aos partícipes.')) {
      onRecusar(preProcesso.id);
      toast.success('Pré-processo recusado. Notificações enviadas aos partícipes.');
      onVoltar();
    }
  };

  const handleClickFormalizar = () => {
    const todosAceitos = documentos.every(doc => doc.status === 'aceito');

    if (!todosAceitos) {
      toast.error('Todos os documentos devem estar aceitos para formalizar o processo');
      return;
    }

    setShowSetorModal(true);
  };

  const handleSelecionarSetor = (setorId: string) => {
    onFormalizar(preProcesso.id, setorId);
    toast.success('Processo formalizado e enviado para a pauta geral');
    setShowSetorModal(false);
    onVoltar();
  };

  const handleVisualizarDocumento = (doc: Documento) => {
    setDocVisualizando(doc);
  };

  const statusCounts = {
    aceito: documentos.filter(d => d.status === 'aceito').length,
    recusado: documentos.filter(d => d.status === 'recusado').length,
    pendente: documentos.filter(d => !d.status || d.status === 'pendente').length
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onVoltar}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para Pré-processos
          </button>

          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-gray-700" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Formalização de Pré-processo</h1>
              <p className="text-gray-600 text-sm mt-1">{preProcesso.numero}</p>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg border border-gray-300">
                <CheckCircle className="w-4 h-4" />
                {statusCounts.aceito} Aceitos
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg border border-gray-300">
                <XCircle className="w-4 h-4" />
                {statusCounts.recusado} Recusados
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg border border-gray-300">
                <AlertCircle className="w-4 h-4" />
                {statusCounts.pendente} Pendentes
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClickRecusar}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Recusar Pré-processo
              </button>
              <button
                onClick={handleClickFormalizar}
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Formalizar
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Informações do Processo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2">
                Informações Básicas
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500">Número:</span>
                  <p className="text-sm font-medium text-gray-900">{preProcesso.numero}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Requerente:</span>
                  <p className="text-sm font-medium text-gray-900">{preProcesso.requerente}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Data da Solicitação:</span>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(preProcesso.dataSolicitacao).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                {preProcesso.responsavelTecnico && (
                  <div>
                    <span className="text-xs text-gray-500">Responsável Técnico:</span>
                    <p className="text-sm font-medium text-gray-900">{preProcesso.responsavelTecnico}</p>
                  </div>
                )}
              </div>
            </div>

            {preProcesso.empreendimento && (
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Empreendimento
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-gray-500">Número:</span>
                    <p className="text-sm font-medium text-gray-900">{preProcesso.empreendimento.numero}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Nome:</span>
                    <p className="text-sm font-medium text-gray-900">{preProcesso.empreendimento.nome}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Atividades:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {preProcesso.empreendimento.atividades.map((atividade, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border border-gray-300"
                        >
                          {atividade}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Documentos */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Documentos para Análise</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAceitarTodos}
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-800 text-white text-sm rounded-lg transition-colors"
                >
                  Aceitar Todos
                </button>
                <button
                  onClick={handleRecusarTodos}
                  className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                >
                  Recusar Todos
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {documentos.map((doc) => (
                <div key={doc.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <FileText className="w-10 h-10 text-gray-400 mt-1 flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{doc.nome}</h4>
                          <p className="text-xs text-gray-500 mt-1">{doc.tipo}</p>

                          {doc.status && (
                            <div className="mt-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${
                                doc.status === 'aceito'
                                  ? 'bg-gray-100 text-gray-700 border-gray-300'
                                  : doc.status === 'recusado'
                                  ? 'bg-gray-100 text-gray-700 border-gray-300'
                                  : 'bg-gray-50 text-gray-600 border-gray-200'
                              }`}>
                                {doc.status === 'aceito' && <CheckCircle className="w-3 h-3" />}
                                {doc.status === 'recusado' && <XCircle className="w-3 h-3" />}
                                {doc.status === 'aceito' ? 'Aceito' : doc.status === 'recusado' ? 'Recusado' : 'Pendente'}
                              </span>
                            </div>
                          )}

                          {doc.status === 'recusado' && doc.motivoRecusa && (
                            <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700">
                              <strong>Motivo:</strong> {doc.motivoRecusa}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleVisualizarDocumento(doc)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
                            title="Visualizar documento"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleAceitarDocumento(doc.id)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
                            title="Aceitar documento"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {doc.status !== 'recusado' && (
                        <div className="mt-3">
                          <div className="flex items-start gap-2">
                            <textarea
                              placeholder="Motivo da recusa (obrigatório para recusar)"
                              value={motivosRecusa[doc.id] || ''}
                              onChange={(e) => setMotivosRecusa({ ...motivosRecusa, [doc.id]: e.target.value })}
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                              rows={2}
                            />
                            <button
                              onClick={() => handleRecusarDocumento(doc.id, motivosRecusa[doc.id] || '')}
                              className="px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white text-sm rounded-lg transition-colors whitespace-nowrap"
                            >
                              Recusar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Seleção de Setor */}
      {showSetorModal && (
        <SetorSelectionModal
          onSelect={handleSelecionarSetor}
          onClose={() => setShowSetorModal(false)}
        />
      )}

      {/* Modal de Visualização de Documento */}
      {docVisualizando && (
        <DocumentoVisualizacaoModal
          documento={docVisualizando}
          onClose={() => setDocVisualizando(null)}
        />
      )}
    </div>
  );
}

interface SetorSelectionModalProps {
  onSelect: (setorId: string) => void;
  onClose: () => void;
}

function SetorSelectionModal({ onSelect, onClose }: SetorSelectionModalProps) {
  const setores = [
    { id: '1', nome: 'Setor de Licenciamento Industrial' },
    { id: '2', nome: 'Setor de Licenciamento Rural' },
    { id: '3', nome: 'Setor de Infraestrutura' },
    { id: '4', nome: 'Setor de Recursos Hídricos' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-gray-300">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Selecione o Setor</h3>
          <p className="text-sm text-gray-600 mt-1">Escolha para qual pauta geral o processo será direcionado</p>
        </div>
        <div className="p-6 space-y-2">
          {setores.map((setor) => (
            <button
              key={setor.id}
              onClick={() => onSelect(setor.id)}
              className="w-full px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <p className="text-sm font-medium text-gray-900">{setor.nome}</p>
            </button>
          ))}
        </div>
        <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

interface DocumentoVisualizacaoModalProps {
  documento: Documento;
  onClose: () => void;
}

function DocumentoVisualizacaoModal({ documento, onClose }: DocumentoVisualizacaoModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-300">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{documento.nome}</h3>
            <p className="text-sm text-gray-500">{documento.tipo}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Visualizador de documento</p>
            <p className="text-sm text-gray-500 mt-2">URL: {documento.url}</p>
            <p className="text-xs text-gray-400 mt-4">
              Em produção, aqui será exibido o conteúdo do documento
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
