import React, { useState } from 'react';
import { ArrowLeft, FileText, Eye, X, Upload, AlertCircle, Check, Download, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface Licenca {
  id: string;
  numero?: string;
  tipo: string;
  situacao: 'Rascunho' | 'Emitida' | 'Cancelada' | 'Suspensa' | 'Vencida';
  validade?: string;
  dataCriacao: string;
  dataEmissao?: string;
}

interface ProcessoMock {
  requerente: string;
  endereco: string;
  municipio: string;
  atividadePrimaria: string;
  atividadesSecundarias: string[];
  areaTotal: string;
}

interface EmissaoLicencaProps {
  processoId: string;
  numeroProcesso: string;
  onVoltar: () => void;
}

const processoMockData: ProcessoMock = {
  requerente: 'Curtume Industrial São João Ltda',
  endereco: 'Rua das Indústrias, 1250, Bairro Industrial',
  municipio: 'Porto Velho - RO',
  atividadePrimaria: 'Curtimento de Couros e Peles',
  atividadesSecundarias: ['Tratamento de Efluentes Industriais', 'Estação de Tratamento de Águas'],
  areaTotal: '25.000 m²'
};

export default function EmissaoLicenca({ processoId, numeroProcesso, onVoltar }: EmissaoLicencaProps) {
  const [licencas, setLicencas] = useState<Licenca[]>([]);
  const [showRascunhoViewer, setShowRascunhoViewer] = useState(false);
  const [rascunhoAtual, setRascunhoAtual] = useState<Licenca | null>(null);
  const [showCancelarModal, setShowCancelarModal] = useState(false);
  const [licencaCancelar, setLicencaCancelar] = useState<Licenca | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [documentoCancelamento, setDocumentoCancelamento] = useState<File | null>(null);
  const [showSuspenderModal, setShowSuspenderModal] = useState(false);
  const [licencaSuspender, setLicencaSuspender] = useState<Licenca | null>(null);
  const [motivoSuspensao, setMotivoSuspensao] = useState('');
  const [tipoLicenca] = useState('LO');

  const condicionantes = [
    { id: '1', texto: 'O empreendimento deverá manter sistema de tratamento de efluentes em perfeito funcionamento.' },
    { id: '2', texto: 'Realizar monitoramento trimestral da qualidade das águas residuárias.' },
    { id: '3', texto: 'Implementar programa de gerenciamento de resíduos sólidos conforme PNRS.' }
  ];

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

    const rascunhoExistente = licencas.find(l => l.situacao === 'Rascunho');
    if (rascunhoExistente) {
      toast.warning('Já existe um rascunho para este processo. Descarte-o antes de criar um novo.');
      return;
    }

    const novoRascunho: Licenca = {
      id: Date.now().toString(),
      tipo: tipoLicenca,
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

    if (!rascunho || rascunho.situacao !== 'Rascunho') {
      toast.error('É necessário ter um rascunho válido para emitir a licença.');
      return;
    }

    if (notificacoesPendentes) {
      toast.error('Não é possível emitir a licença com notificações de pendência abertas.');
      return;
    }

    if (!etapasConcluidas) {
      toast.error('Conclua a análise de todas as etapas do processo antes de emitir a licença.');
      return;
    }

    const proximoNumero = (licencas.filter(l => l.numero).length + 1).toString().padStart(7, '0');
    const numeroLicenca = `${proximoNumero}/${new Date().getFullYear()}`;
    const dataValidade = new Date();
    dataValidade.setFullYear(dataValidade.getFullYear() + 2);

    const licencaEmitida: Licenca = {
      ...rascunho,
      numero: numeroLicenca,
      situacao: 'Emitida',
      validade: dataValidade.toISOString().split('T')[0],
      dataEmissao: new Date().toISOString().split('T')[0]
    };

    setLicencas(licencas.map(l => l.id === rascunho.id ? licencaEmitida : l));
    setShowRascunhoViewer(false);
    setRascunhoAtual(null);
    toast.success('Licença emitida com sucesso! Número: ' + numeroLicenca);
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
                                  onClick={() => toast.info('Download da licença em desenvolvimento')}
                                  className="text-green-600 hover:text-green-700 p-1"
                                  title="Baixar Licença"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
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
                            {(licenca.situacao === 'Cancelada' || licenca.situacao === 'Suspensa') && (
                              <button
                                onClick={() => toast.info(`Download da licença ${licenca.situacao.toLowerCase()} com marca d'água`)}
                                className="text-gray-600 hover:text-gray-700 text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1"
                                title={`Baixar Licença ${licenca.situacao}`}
                              >
                                <Download className="w-3 h-3" />
                                Baixar
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
        </div>
      </div>

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
                    {rascunhoAtual.tipo === 'LO' ? 'LICENÇA DE OPERAÇÃO' :
                     rascunhoAtual.tipo === 'LP' ? 'LICENÇA PRÉVIA' :
                     rascunhoAtual.tipo === 'LI' ? 'LICENÇA DE INSTALAÇÃO' : 'LICENÇA'} Nº {rascunhoAtual.numero || '0000001'}/{new Date().getFullYear()}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Data de Emissão: {rascunhoAtual.dataEmissao ? new Date(rascunhoAtual.dataEmissao).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Validade: {rascunhoAtual.validade ? new Date(rascunhoAtual.validade).toLocaleDateString('pt-BR') : new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700 leading-relaxed text-justify">
                    A Secretaria do Estado de Desenvolvimento Ambiental (SEDAM), no uso das suas atribuições
                    que lhe são conferidas pela Lei Estadual n° 3.686 de 08 de Dezembro de 2015, expede a
                    presente <strong>{rascunhoAtual.tipo === 'LO' ? 'Licença de Operação' :
                     rascunhoAtual.tipo === 'LP' ? 'Licença Prévia' :
                     rascunhoAtual.tipo === 'LI' ? 'Licença de Instalação' : 'Licença'}</strong>.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-semibold text-gray-500">REQUERENTE:</span>
                      <p className="text-sm text-gray-900">{processoMockData.requerente}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-500">MUNICÍPIO:</span>
                      <p className="text-sm text-gray-900">{processoMockData.municipio}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-gray-500">ENDEREÇO DO IMÓVEL:</span>
                    <p className="text-sm text-gray-900">{processoMockData.endereco}</p>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-gray-500">ATIVIDADE PRIMÁRIA:</span>
                    <p className="text-sm text-gray-900">{processoMockData.atividadePrimaria}</p>
                  </div>

                  {processoMockData.atividadesSecundarias.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500">ATIVIDADES SECUNDÁRIAS:</span>
                      <ul className="text-sm text-gray-900 list-disc list-inside">
                        {processoMockData.atividadesSecundarias.map((ativ, idx) => (
                          <li key={idx}>{ativ}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <span className="text-xs font-semibold text-gray-500">ÁREA TOTAL DO EMPREENDIMENTO:</span>
                    <p className="text-sm text-gray-900">{processoMockData.areaTotal}</p>
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
