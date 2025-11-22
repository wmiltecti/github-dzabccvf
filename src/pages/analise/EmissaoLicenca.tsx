import React, { useState } from 'react';
import { ArrowLeft, FileText, Plus, Eye, Edit, Trash2, X, Upload, AlertCircle, Check } from 'lucide-react';
import { toast } from 'react-toastify';

interface Licenca {
  id: string;
  numero?: string;
  situacao: 'Rascunho' | 'Emitida' | 'Cancelada' | 'Suspensa' | 'Vencida';
  validade?: string;
  dataCriacao: string;
}

interface Condicionante {
  id: string;
  texto: string;
  dataCriacao: string;
}

interface EmissaoLicencaProps {
  processoId: string;
  numeroProcesso: string;
  onVoltar: () => void;
}

export default function EmissaoLicenca({ processoId, numeroProcesso, onVoltar }: EmissaoLicencaProps) {
  const [licencas, setLicencas] = useState<Licenca[]>([]);
  const [condicionantes, setCondicionantes] = useState<Condicionante[]>([]);
  const [showCondicionantesMenu, setShowCondicionantesMenu] = useState(false);
  const [showCadastrarCondicionante, setShowCadastrarCondicionante] = useState(false);
  const [showVerCondicionantes, setShowVerCondicionantes] = useState(false);
  const [novaCondicionante, setNovaCondicionante] = useState('');
  const [condicionanteEditando, setCondicionanteEditando] = useState<string | null>(null);
  const [textoEditando, setTextoEditando] = useState('');
  const [showRascunhoViewer, setShowRascunhoViewer] = useState(false);
  const [rascunhoAtual, setRascunhoAtual] = useState<Licenca | null>(null);
  const [showCancelarModal, setShowCancelarModal] = useState(false);
  const [licencaCancelar, setLicencaCancelar] = useState<Licenca | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [documentoCancelamento, setDocumentoCancelamento] = useState<File | null>(null);
  const [showSuspenderModal, setShowSuspenderModal] = useState(false);
  const [licencaSuspender, setLicencaSuspender] = useState<Licenca | null>(null);
  const [motivoSuspensao, setMotivoSuspensao] = useState('');

  const getSituacaoColor = (situacao: Licenca['situacao']) => {
    switch (situacao) {
      case 'Rascunho':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'Emitida':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Cancelada':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Suspensa':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Vencida':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const handleEmitirRascunho = () => {
    const notificacoesPendentes = false;
    const etapasConcluidas = true;

    if (notificacoesPendentes) {
      toast.error('Não é possível emitir um rascunho de licença com notificações de pendência abertas.');
      return;
    }

    if (!etapasConcluidas) {
      toast.error('Conclua a análise de todas as etapas do processo antes de emitir o rascunho da licença.');
      return;
    }

    const novoRascunho: Licenca = {
      id: Date.now().toString(),
      situacao: 'Rascunho',
      dataCriacao: new Date().toISOString()
    };

    setLicencas([...licencas, novoRascunho]);
    setRascunhoAtual(novoRascunho);
    setShowRascunhoViewer(true);
    toast.success('Rascunho gerado com sucesso!');
  };

  const handleDescartarRascunho = (licencaId: string) => {
    setLicencas(licencas.filter(l => l.id !== licencaId));
    setRascunhoAtual(null);
    setShowRascunhoViewer(false);
    toast.info('Rascunho descartado.');
  };

  const handleEmitirLicenca = (rascunho: Licenca) => {
    const notificacoesPendentes = false;
    const etapasConcluidas = true;

    if (notificacoesPendentes) {
      toast.error('Não é possível emitir a licença com notificações de pendência abertas.');
      return;
    }

    if (!etapasConcluidas) {
      toast.error('Conclua a análise de todas as etapas do processo antes de emitir a licença.');
      return;
    }

    const numeroLicenca = `0000001/${new Date().getFullYear()}`;
    const dataValidade = new Date();
    dataValidade.setFullYear(dataValidade.getFullYear() + 2);

    const licencaEmitida: Licenca = {
      ...rascunho,
      numero: numeroLicenca,
      situacao: 'Emitida',
      validade: dataValidade.toISOString().split('T')[0]
    };

    setLicencas(licencas.map(l => l.id === rascunho.id ? licencaEmitida : l));
    setShowRascunhoViewer(false);
    toast.success('Licença emitida com sucesso!');
  };

  const handleCancelarLicenca = (licenca: Licenca) => {
    if (licenca.situacao !== 'Emitida') {
      toast.error('Só é possível cancelar licenças com situação "Emitida".');
      return;
    }
    setLicencaCancelar(licenca);
    setShowCancelarModal(true);
  };

  const confirmarCancelamento = () => {
    if (!motivoCancelamento.trim()) {
      toast.error('O motivo do cancelamento é obrigatório.');
      return;
    }

    if (licencaCancelar) {
      const licencaCancelada: Licenca = {
        ...licencaCancelar,
        situacao: 'Cancelada'
      };

      setLicencas(licencas.map(l => l.id === licencaCancelar.id ? licencaCancelada : l));
      setShowCancelarModal(false);
      setMotivoCancelamento('');
      setDocumentoCancelamento(null);
      setLicencaCancelar(null);
      toast.success('Licença cancelada com sucesso!');
    }
  };

  const handleSuspenderLicenca = (licenca: Licenca) => {
    if (licenca.situacao !== 'Emitida') {
      toast.error('Só é possível suspender licenças com situação "Emitida".');
      return;
    }
    setLicencaSuspender(licenca);
    setShowSuspenderModal(true);
  };

  const confirmarSuspensao = () => {
    if (!motivoSuspensao.trim()) {
      toast.error('O motivo da suspensão é obrigatório.');
      return;
    }

    if (licencaSuspender) {
      const licencaSuspensa: Licenca = {
        ...licencaSuspender,
        situacao: 'Suspensa'
      };

      setLicencas(licencas.map(l => l.id === licencaSuspender.id ? licencaSuspensa : l));
      setShowSuspenderModal(false);
      setMotivoSuspensao('');
      setLicencaSuspender(null);
      toast.success('Licença suspensa com sucesso!');
    }
  };

  const handleAdicionarCondicionante = () => {
    if (!novaCondicionante.trim()) {
      toast.error('Digite o texto da condicionante.');
      return;
    }

    const condicionante: Condicionante = {
      id: Date.now().toString(),
      texto: novaCondicionante,
      dataCriacao: new Date().toISOString()
    };

    setCondicionantes([...condicionantes, condicionante]);
    setNovaCondicionante('');
    setShowCadastrarCondicionante(false);
    toast.success('Condicionante adicionada com sucesso!');
  };

  const handleEditarCondicionante = (id: string) => {
    const condicionante = condicionantes.find(c => c.id === id);
    if (condicionante) {
      setCondicionanteEditando(id);
      setTextoEditando(condicionante.texto);
    }
  };

  const handleSalvarEdicao = () => {
    if (!textoEditando.trim()) {
      toast.error('O texto da condicionante não pode estar vazio.');
      return;
    }

    setCondicionantes(
      condicionantes.map(c =>
        c.id === condicionanteEditando
          ? { ...c, texto: textoEditando }
          : c
      )
    );

    setCondicionanteEditando(null);
    setTextoEditando('');
    toast.success('Condicionante atualizada com sucesso!');
  };

  const handleExcluirCondicionante = (id: string) => {
    setCondicionantes(condicionantes.filter(c => c.id !== id));
    toast.info('Condicionante excluída.');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={onVoltar}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para minha pauta
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Emissão de Licença</h2>
              <p className="text-sm text-gray-600 mt-1">Processo: {numeroProcesso}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleEmitirRascunho}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Emitir Rascunho
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowCondicionantesMenu(!showCondicionantesMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Condicionantes
                </button>

                {showCondicionantesMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={() => {
                        setShowCadastrarCondicionante(true);
                        setShowCondicionantesMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-200"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Cadastrar Nova
                    </button>
                    <button
                      onClick={() => {
                        setShowVerCondicionantes(true);
                        setShowCondicionantesMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4 inline mr-2" />
                      Ver Condicionantes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Listagem de Licenças</h3>

            {licencas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhuma licença emitida</p>
                <p className="text-sm mt-1">Clique em "Emitir Rascunho" para começar</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-white">
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Número
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Situação
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Validade
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {licencas.map((licenca) => (
                      <tr key={licenca.id} className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                          {licenca.numero || '---'}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <span
                            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getSituacaoColor(
                              licenca.situacao
                            )}`}
                          >
                            {licenca.situacao}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                          {licenca.validade
                            ? new Date(licenca.validade).toLocaleDateString('pt-BR')
                            : '---'}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="flex items-center gap-2">
                            {licenca.situacao === 'Rascunho' && (
                              <>
                                <button
                                  onClick={() => {
                                    setRascunhoAtual(licenca);
                                    setShowRascunhoViewer(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-700 p-1"
                                  title="Visualizar"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDescartarRascunho(licenca.id)}
                                  className="text-red-600 hover:text-red-700 p-1"
                                  title="Descartar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {licenca.situacao === 'Emitida' && (
                              <>
                                <button
                                  onClick={() => handleCancelarLicenca(licenca)}
                                  className="text-red-600 hover:text-red-700 text-xs px-2 py-1 border border-red-300 rounded hover:bg-red-50"
                                  title="Cancelar Licença"
                                >
                                  Cancelar
                                </button>
                                <button
                                  onClick={() => handleSuspenderLicenca(licenca)}
                                  className="text-yellow-600 hover:text-yellow-700 text-xs px-2 py-1 border border-yellow-300 rounded hover:bg-yellow-50"
                                  title="Suspender Licença"
                                >
                                  Suspender
                                </button>
                              </>
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
        </div>
      </div>

      {showCadastrarCondicionante && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Condicionantes Específicas</h3>
              <button
                onClick={() => {
                  setShowCadastrarCondicionante(false);
                  setNovaCondicionante('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <textarea
                value={novaCondicionante}
                onChange={(e) => setNovaCondicionante(e.target.value)}
                placeholder="Digite o texto da condicionante específica..."
                className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowCadastrarCondicionante(false);
                  setNovaCondicionante('');
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdicionarCondicionante}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {showVerCondicionantes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Condicionantes Cadastradas</h3>
              <button
                onClick={() => setShowVerCondicionantes(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {condicionantes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Nenhuma condicionante cadastrada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {condicionantes.map((condicionante) => (
                    <div
                      key={condicionante.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      {condicionanteEditando === condicionante.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={textoEditando}
                            onChange={(e) => setTextoEditando(e.target.value)}
                            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setCondicionanteEditando(null);
                                setTextoEditando('');
                              }}
                              className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={handleSalvarEdicao}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Salvar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <p className="text-sm text-gray-700 flex-1">{condicionante.texto}</p>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleEditarCondicionante(condicionante.id)}
                              className="text-blue-600 hover:text-blue-700 p-1"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleExcluirCondicionante(condicionante.id)}
                              className="text-red-600 hover:text-red-700 p-1"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setShowVerCondicionantes(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {showRascunhoViewer && rascunhoAtual && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Visualização do Rascunho</h3>
              <button
                onClick={() => setShowRascunhoViewer(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                <span className="text-8xl font-bold text-gray-500 rotate-[-45deg]">RASCUNHO</span>
              </div>

              <div className="relative z-10 space-y-6">
                <div className="text-center border-b border-gray-300 pb-6">
                  <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                    GOVERNO DO ESTADO DE RONDÔNIA<br />
                    SECRETÁRIA DO ESTADO DE DESENVOLVIMENTO AMBIENTAL<br />
                    COORDENADORIA DE LICENCIAMENTO E MONITORAMENTO AMBIENTAL
                  </p>
                </div>

                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    LICENÇA DE OPERAÇÃO Nº 0000001/{new Date().getFullYear()}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Data de Emissão: {new Date().toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Validade: {new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700 leading-relaxed text-justify">
                    A Secretaria do Estado de Desenvolvimento Ambiental (SEDAM), no uso das suas atribuições
                    que lhe são conferidas pela Lei Estadual n° 3.686 de 08 de Dezembro de 2015, expede a
                    presente <strong>Licença de Operação</strong>.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-semibold text-gray-500">REQUERENTE:</span>
                      <p className="text-sm text-gray-900">Empresa Exemplo Ltda</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-500">MUNICÍPIO:</span>
                      <p className="text-sm text-gray-900">Porto Velho - RO</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-gray-500">ENDEREÇO DO IMÓVEL:</span>
                    <p className="text-sm text-gray-900">Rua Exemplo, 123, Bairro Centro</p>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-gray-500">ATIVIDADE PRIMÁRIA:</span>
                    <p className="text-sm text-gray-900">Extração de areia, cascalho ou pedregulho</p>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-gray-500">ÁREA TOTAL DO EMPREENDIMENTO:</span>
                    <p className="text-sm text-gray-900">10.000 m²</p>
                  </div>
                </div>

                {condicionantes.length > 0 && (
                  <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                    <h4 className="text-sm font-bold text-gray-900 mb-3">CONDICIONANTES:</h4>
                    <ul className="space-y-2">
                      {condicionantes.map((cond, idx) => (
                        <li key={cond.id} className="text-sm text-gray-700">
                          {idx + 1}. {cond.texto}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="border-t border-gray-300 pt-6 mt-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="text-center">
                      <div className="border-t border-gray-400 pt-2 mt-16">
                        <p className="text-xs text-gray-600">Coordenador</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="border-t border-gray-400 pt-2 mt-16">
                        <p className="text-xs text-gray-600">Secretário</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center text-xs text-gray-500 mt-6">
                  <p>Código de Validação: ABC123XYZ789</p>
                  <p className="mt-2">QR Code: [QR CODE PLACEHOLDER]</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between p-6 border-t border-gray-200">
              <button
                onClick={() => handleDescartarRascunho(rascunhoAtual.id)}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
              >
                Descartar Rascunho
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRascunhoViewer(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Fechar
                </button>
                <button
                  onClick={() => handleEmitirLicenca(rascunhoAtual)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Emitir Licença
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCancelarModal && licencaCancelar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h3 className="text-xl font-semibold text-gray-900">Cancelar Licença</h3>
              </div>
              <button
                onClick={() => {
                  setShowCancelarModal(false);
                  setMotivoCancelamento('');
                  setDocumentoCancelamento(null);
                  setLicencaCancelar(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Motivo do Cancelamento <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={motivoCancelamento}
                  onChange={(e) => setMotivoCancelamento(e.target.value)}
                  placeholder="Descreva o motivo do cancelamento..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Documentação (opcional)
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Selecionar Arquivo
                    <input
                      type="file"
                      onChange={(e) => setDocumentoCancelamento(e.target.files?.[0] || null)}
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                    />
                  </label>
                  {documentoCancelamento && (
                    <span className="text-sm text-gray-600">{documentoCancelamento.name}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowCancelarModal(false);
                  setMotivoCancelamento('');
                  setDocumentoCancelamento(null);
                  setLicencaCancelar(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarCancelamento}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuspenderModal && licencaSuspender && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <h3 className="text-xl font-semibold text-gray-900">Suspender Licença</h3>
              </div>
              <button
                onClick={() => {
                  setShowSuspenderModal(false);
                  setMotivoSuspensao('');
                  setLicencaSuspender(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Motivo da Suspensão <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={motivoSuspensao}
                  onChange={(e) => setMotivoSuspensao(e.target.value)}
                  placeholder="Descreva o motivo da suspensão..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowSuspenderModal(false);
                  setMotivoSuspensao('');
                  setLicencaSuspender(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarSuspensao}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Confirmar Suspensão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
