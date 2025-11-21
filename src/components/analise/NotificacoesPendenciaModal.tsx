import React, { useState } from 'react';
import { X, Bell, Plus, Eye, Edit2, Send, XCircle, CheckCircle, FileText } from 'lucide-react';
import { toast } from 'react-toastify';

interface NotificacoesPendenciaModalProps {
  processoId: string;
  numeroProcesso: string;
  onClose: () => void;
}

interface Notificacao {
  id: string;
  numero: string;
  autor: string;
  dataCriacao: string;
  situacao: 'Aberta' | 'Enviada' | 'Respondida' | 'Resolvida' | 'Não Atendida' | 'Cancelada';
  prazo: number;
  pendencias: string[];
}

const mockNotificacoes: Notificacao[] = [
  {
    id: '1',
    numero: 'NOT-2025-001',
    autor: 'João Silva',
    dataCriacao: '2025-11-18',
    situacao: 'Enviada',
    prazo: 15,
    pendencias: ['Apresentar Certidão de Registro do Imóvel atualizada', 'Apresentar ART/RRT']
  },
  {
    id: '2',
    numero: 'NOT-2025-002',
    autor: 'Maria Santos',
    dataCriacao: '2025-11-20',
    situacao: 'Aberta',
    prazo: 30,
    pendencias: ['Complementar documentação sobre sistema de tratamento']
  }
];

export default function NotificacoesPendenciaModal({
  processoId,
  numeroProcesso,
  onClose
}: NotificacoesPendenciaModalProps) {
  const [view, setView] = useState<'lista' | 'nova' | 'detalhes' | 'encerrar'>('lista');
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>(mockNotificacoes);
  const [notificacaoSelecionada, setNotificacaoSelecionada] = useState<Notificacao | null>(null);
  const [prazo, setPrazo] = useState(15);
  const [novaPendencia, setNovaPendencia] = useState('');
  const [pendenciasNovas, setPendenciasNovas] = useState<string[]>([]);
  const [motivoNaoAtendido, setMotivoNaoAtendido] = useState('');
  const [tipoEncerramento, setTipoEncerramento] = useState<'atendido' | 'nao_atendido' | null>(null);

  const getSituacaoColor = (situacao: string) => {
    switch (situacao) {
      case 'Aberta':
        return 'bg-gray-100 text-gray-800';
      case 'Enviada':
        return 'bg-blue-100 text-blue-800';
      case 'Respondida':
        return 'bg-yellow-100 text-yellow-800';
      case 'Resolvida':
        return 'bg-green-100 text-green-800';
      case 'Não Atendida':
        return 'bg-red-100 text-red-800';
      case 'Cancelada':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAdicionarPendencia = () => {
    if (!novaPendencia.trim()) {
      toast.warning('Digite o texto da pendência');
      return;
    }
    setPendenciasNovas([...pendenciasNovas, novaPendencia]);
    setNovaPendencia('');
  };

  const handleRemoverPendencia = (index: number) => {
    setPendenciasNovas(pendenciasNovas.filter((_, idx) => idx !== index));
  };

  const handleSalvarNova = () => {
    if (pendenciasNovas.length === 0) {
      toast.warning('Adicione pelo menos uma pendência');
      return;
    }

    const novaNotificacao: Notificacao = {
      id: Date.now().toString(),
      numero: `NOT-2025-${String(notificacoes.length + 1).padStart(3, '0')}`,
      autor: 'Técnico Atual',
      dataCriacao: new Date().toISOString(),
      situacao: 'Aberta',
      prazo,
      pendencias: [...pendenciasNovas]
    };

    setNotificacoes([...notificacoes, novaNotificacao]);
    setPendenciasNovas([]);
    setPrazo(15);
    toast.success('Notificação criada com sucesso!');
    setView('lista');
  };

  const handleEnviar = (notificacao: Notificacao) => {
    if (confirm('Deseja realmente enviar esta notificação? O processo sairá da sua pauta.')) {
      setNotificacoes(
        notificacoes.map(n =>
          n.id === notificacao.id ? { ...n, situacao: 'Enviada' } : n
        )
      );
      toast.success('Notificação enviada com sucesso!');
    }
  };

  const handleCancelar = (notificacao: Notificacao) => {
    if (notificacao.situacao !== 'Aberta') {
      toast.error('Apenas notificações abertas podem ser canceladas');
      return;
    }

    if (confirm('Deseja realmente cancelar a notificação selecionada?')) {
      setNotificacoes(
        notificacoes.map(n =>
          n.id === notificacao.id ? { ...n, situacao: 'Cancelada' } : n
        )
      );
      toast.success('Notificação cancelada com sucesso!');
    }
  };

  const handleEncerrar = () => {
    if (!notificacaoSelecionada) return;

    if (tipoEncerramento === 'nao_atendido' && !motivoNaoAtendido.trim()) {
      toast.warning('Informe o motivo para não atendido');
      return;
    }

    const novaSituacao = tipoEncerramento === 'atendido' ? 'Resolvida' : 'Não Atendida';
    setNotificacoes(
      notificacoes.map(n =>
        n.id === notificacaoSelecionada.id ? { ...n, situacao: novaSituacao } : n
      )
    );

    toast.success(`Notificação encerrada como ${novaSituacao}`);
    setView('lista');
    setNotificacaoSelecionada(null);
    setTipoEncerramento(null);
    setMotivoNaoAtendido('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Notificações de Pendência (Ofício)</h3>
              <p className="text-sm text-gray-600">Processo: {numeroProcesso}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {view === 'lista' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Notificações do Processo</h4>
                <button
                  onClick={() => setView('nova')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nova Notificação
                </button>
              </div>

              {notificacoes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">Nenhuma notificação registrada para este processo</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Autor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Criação</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Situação</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {notificacoes.map((notif) => (
                        <tr key={notif.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{notif.numero}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{notif.autor}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(notif.dataCriacao).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSituacaoColor(notif.situacao)}`}>
                              {notif.situacao}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setNotificacaoSelecionada(notif);
                                  setView('detalhes');
                                }}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Detalhes"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {notif.situacao === 'Aberta' && (
                                <>
                                  <button
                                    onClick={() => toast.info('Função de edição será implementada')}
                                    className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                                    title="Editar"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleEnviar(notif)}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                    title="Enviar"
                                  >
                                    <Send className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleCancelar(notif)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Cancelar"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              {(notif.situacao === 'Enviada' || notif.situacao === 'Respondida') && (
                                <button
                                  onClick={() => {
                                    setNotificacaoSelecionada(notif);
                                    setView('encerrar');
                                  }}
                                  className="p-1.5 text-teal-600 hover:bg-teal-50 rounded transition-colors"
                                  title="Encerrar"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {view === 'nova' && (
            <div className="space-y-6">
              <button
                onClick={() => {
                  setView('lista');
                  setPendenciasNovas([]);
                  setPrazo(15);
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                ← Voltar à listagem
              </button>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prazo de Cumprimento (dias)
                </label>
                <input
                  type="number"
                  value={prazo}
                  onChange={(e) => setPrazo(Number(e.target.value))}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adicionar Pendências
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={novaPendencia}
                    onChange={(e) => setNovaPendencia(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdicionarPendencia()}
                    placeholder="Digite a pendência e pressione Enter"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={handleAdicionarPendencia}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {pendenciasNovas.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Pendências Adicionadas:</h5>
                  <div className="space-y-2">
                    {pendenciasNovas.map((pend, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="flex-1 text-sm text-gray-900">{pend}</span>
                        <button
                          onClick={() => handleRemoverPendencia(idx)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setView('lista');
                    setPendenciasNovas([]);
                    setPrazo(15);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvarNova}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          )}

          {view === 'detalhes' && notificacaoSelecionada && (
            <div className="space-y-6">
              <button
                onClick={() => {
                  setView('lista');
                  setNotificacaoSelecionada(null);
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                ← Voltar à listagem
              </button>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-4 border-b border-gray-300 pb-2">
                  Detalhes da Notificação
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Número da Notificação:</span>
                    <p className="text-sm font-medium text-gray-900">{notificacaoSelecionada.numero}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Data de Criação:</span>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(notificacaoSelecionada.dataCriacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Prazo de Cumprimento:</span>
                    <p className="text-sm font-medium text-gray-900">{notificacaoSelecionada.prazo} dias</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Técnico Responsável:</span>
                    <p className="text-sm font-medium text-gray-900">{notificacaoSelecionada.autor}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Situação:</span>
                    <p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSituacaoColor(notificacaoSelecionada.situacao)}`}>
                        {notificacaoSelecionada.situacao}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h5 className="text-sm font-semibold text-gray-700 mb-3">Listagem de Pendências</h5>
                <div className="space-y-2">
                  {notificacaoSelecionada.pendencias.map((pend, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{idx + 1}.</span>
                      <span className="text-sm text-gray-900">{pend}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {view === 'encerrar' && notificacaoSelecionada && (
            <div className="space-y-6">
              <button
                onClick={() => {
                  setView('lista');
                  setNotificacaoSelecionada(null);
                  setTipoEncerramento(null);
                  setMotivoNaoAtendido('');
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                ← Voltar à listagem
              </button>

              <h4 className="text-lg font-semibold text-gray-900">
                Encerrar Notificação {notificacaoSelecionada.numero}
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Como deseja encerrar esta notificação?
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="tipoEncerramento"
                        checked={tipoEncerramento === 'atendido'}
                        onChange={() => setTipoEncerramento('atendido')}
                        className="w-4 h-4 text-green-600"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Atendido</span>
                        <p className="text-xs text-gray-600">As pendências foram cumpridas satisfatoriamente</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="tipoEncerramento"
                        checked={tipoEncerramento === 'nao_atendido'}
                        onChange={() => setTipoEncerramento('nao_atendido')}
                        className="w-4 h-4 text-red-600"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Não Atendido</span>
                        <p className="text-xs text-gray-600">As pendências não foram cumpridas adequadamente</p>
                      </div>
                    </label>
                  </div>
                </div>

                {tipoEncerramento === 'nao_atendido' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motivo <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      value={motivoNaoAtendido}
                      onChange={(e) => setMotivoNaoAtendido(e.target.value)}
                      rows={4}
                      placeholder="Descreva o motivo pelo qual a notificação não foi atendida..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setView('lista');
                    setNotificacaoSelecionada(null);
                    setTipoEncerramento(null);
                    setMotivoNaoAtendido('');
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEncerrar}
                  disabled={!tipoEncerramento}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    tipoEncerramento
                      ? 'bg-teal-700 hover:bg-teal-800 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Encerrar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
