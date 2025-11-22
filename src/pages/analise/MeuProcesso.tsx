import React, { useState } from 'react';
import { FolderOpen, Search, Filter, ArrowRightLeft, FileCheck, Eye, ArrowLeft, Building2, Calendar, User, MapPin, Phone, Mail, Briefcase, DollarSign, Factory, FileText, ChevronRight, ChevronLeft, Check, Home, AlertCircle, Menu, X, Award } from 'lucide-react';
import { toast } from 'react-toastify';
import TramitarModal from '../../components/analise/TramitarModal';
import PendenciaManager from '../../components/analise/PendenciaManager';
import NotificacoesPendenciaModal from '../../components/analise/NotificacoesPendenciaModal';
import TramitacoesModal from '../../components/analise/TramitacoesModal';
import EmissaoLicenca from './EmissaoLicenca';

interface MeuProcessoItem {
  id: string;
  numero: string;
  requerente: string;
  atividade: string;
  situacao: string;
  etapa: string;
  dataSolicitacao: string;
  responsavelTecnico?: string;
  tipoProcesso?: string;
  empreendimento?: {
    numero: string;
    nome: string;
    atividades: string[];
  };
}

const mockMeusProcessos: MeuProcessoItem[] = [
  {
    id: '1',
    numero: 'PROC-2025-023',
    requerente: 'Curtume Industrial São João',
    atividade: 'Curtimento de Couros',
    situacao: 'Em Análise',
    etapa: 'Análise Técnica',
    dataSolicitacao: '2025-11-08',
    responsavelTecnico: 'João Silva - CREA 12345',
    tipoProcesso: 'Licenciamento Ambiental',
    empreendimento: {
      numero: 'EMP-2025-020',
      nome: 'Curtume Industrial São João',
      atividades: ['Curtimento de Couros', 'Tratamento de Efluentes']
    }
  },
  {
    id: '2',
    numero: 'PROC-2025-031',
    requerente: 'Madeireira Florestal Ltda',
    atividade: 'Beneficiamento de Madeira',
    situacao: 'Pendente',
    etapa: 'Análise Documental',
    dataSolicitacao: '2025-11-12',
    responsavelTecnico: 'Maria Santos - CREA 67890',
    tipoProcesso: 'Licenciamento Ambiental',
    empreendimento: {
      numero: 'EMP-2025-021',
      nome: 'Madeireira Florestal',
      atividades: ['Beneficiamento de Madeira', 'Secagem']
    }
  },
  {
    id: '3',
    numero: 'PROC-2025-038',
    requerente: 'Granja Avícola Delta',
    atividade: 'Criação de Aves',
    situacao: 'Em Análise',
    etapa: 'Vistoria Técnica',
    dataSolicitacao: '2025-11-15',
    responsavelTecnico: 'Carlos Oliveira - CRMV 11223',
    tipoProcesso: 'Licenciamento Ambiental',
    empreendimento: {
      numero: 'EMP-2025-022',
      nome: 'Granja Avícola Delta',
      atividades: ['Criação de Aves', 'Compostagem']
    }
  }
];

export default function MeuProcesso() {
  const [searchTerm, setSearchTerm] = useState('');
  const [processos] = useState<MeuProcessoItem[]>(mockMeusProcessos);
  const [processoSelecionado, setProcessoSelecionado] = useState<MeuProcessoItem | null>(null);
  const [showTramitarModal, setShowTramitarModal] = useState(false);
  const [mostrandoAnalise, setMostrandoAnalise] = useState(false);
  const [mostrandoDetalhes, setMostrandoDetalhes] = useState(false);
  const [mostrandoEmissaoLicenca, setMostrandoEmissaoLicenca] = useState(false);

  const handleTramitar = (processo: MeuProcessoItem) => {
    setProcessoSelecionado(processo);
    setShowTramitarModal(true);
  };

  const handleAnalise = (processo: MeuProcessoItem) => {
    setProcessoSelecionado(processo);
    setMostrandoAnalise(true);
  };

  const handleDetalhes = (processo: MeuProcessoItem) => {
    setProcessoSelecionado(processo);
    setMostrandoDetalhes(true);
  };

  const handleEmissaoLicenca = (processo: MeuProcessoItem) => {
    setProcessoSelecionado(processo);
    setMostrandoEmissaoLicenca(true);
  };

  const filteredProcessos = processos.filter(p =>
    p.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.requerente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.atividade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSituacaoColor = (situacao: string) => {
    switch (situacao) {
      case 'Em Análise':
        return 'bg-blue-100 text-blue-800';
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Aguardando Vistoria':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (mostrandoAnalise && processoSelecionado) {
    return (
      <AnaliseView
        processo={processoSelecionado}
        onVoltar={() => {
          setMostrandoAnalise(false);
          setProcessoSelecionado(null);
        }}
      />
    );
  }

  if (mostrandoDetalhes && processoSelecionado) {
    return (
      <MeuProcessoDetalhes
        processo={processoSelecionado}
        onVoltar={() => {
          setMostrandoDetalhes(false);
          setProcessoSelecionado(null);
        }}
      />
    );
  }

  if (mostrandoEmissaoLicenca && processoSelecionado) {
    return (
      <EmissaoLicenca
        processoId={processoSelecionado.id}
        numeroProcesso={processoSelecionado.numero}
        onVoltar={() => {
          setMostrandoEmissaoLicenca(false);
          setProcessoSelecionado(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FolderOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Minha Pauta</h1>
          </div>
          <p className="text-gray-600">
            Processos sob sua responsabilidade para análise técnica
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por número, requerente ou atividade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requerente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Atividade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Situação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Etapa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProcessos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Você não possui processos atribuídos no momento
                    </td>
                  </tr>
                ) : (
                  filteredProcessos.map((processo) => (
                    <tr key={processo.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {processo.numero}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{processo.requerente}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{processo.atividade}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSituacaoColor(processo.situacao)}`}>
                          {processo.situacao}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{processo.etapa}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTramitar(processo)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-sm rounded-lg transition-colors"
                            title="Tramitar processo"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                            Tramitar
                          </button>
                          <button
                            onClick={() => handleAnalise(processo)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                            title="Analisar processo"
                          >
                            <FileCheck className="w-4 h-4" />
                            Análise
                          </button>
                          <button
                            onClick={() => handleDetalhes(processo)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                            Detalhes
                          </button>
                          <button
                            onClick={() => handleEmissaoLicenca(processo)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                            title="Emitir Licença"
                          >
                            <Award className="w-4 h-4" />
                            Emitir Licença
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showTramitarModal && processoSelecionado && (
        <TramitarModal
          processo={processoSelecionado}
          onClose={() => {
            setShowTramitarModal(false);
            setProcessoSelecionado(null);
          }}
          onTramitar={(dados) => {
            console.log('Tramitando processo:', dados);
            toast.success('Processo tramitado com sucesso!');
            setShowTramitarModal(false);
            setProcessoSelecionado(null);
          }}
        />
      )}
    </div>
  );
}

interface AnaliseViewProps {
  processo: MeuProcessoItem;
  onVoltar: () => void;
}

type Etapa = 'imovel' | 'empreendimento' | 'caracterizacao' | 'documentacao' | 'analise_geo';

const etapas: { id: Etapa; label: string; icon: React.ReactNode }[] = [
  { id: 'imovel', label: 'Imóvel', icon: <Home className="w-5 h-5" /> },
  { id: 'empreendimento', label: 'Empreendimento', icon: <Building2 className="w-5 h-5" /> },
  { id: 'caracterizacao', label: 'Caracterização', icon: <FileText className="w-5 h-5" /> },
  { id: 'documentacao', label: 'Documentação', icon: <FolderOpen className="w-5 h-5" /> },
  { id: 'analise_geo', label: 'Análise Geo', icon: <MapPin className="w-5 h-5" /> }
];

function AnaliseView({ processo, onVoltar }: AnaliseViewProps) {
  const [etapaAtual, setEtapaAtual] = useState<Etapa>('imovel');
  const [showPendenciaManager, setShowPendenciaManager] = useState(false);
  const [showNotificacoes, setShowNotificacoes] = useState(false);
  const [showTramitacoes, setShowTramitacoes] = useState(false);
  const [showOpcoes, setShowOpcoes] = useState(false);
  const [etapasConcluidas, setEtapasConcluidas] = useState<Set<Etapa>>(new Set());

  const etapaIndex = etapas.findIndex(e => e.id === etapaAtual);
  const todasEtapasConcluidas = etapas.every(etapa => etapasConcluidas.has(etapa.id));

  const handleProxima = () => {
    if (etapaIndex < etapas.length - 1) {
      setEtapaAtual(etapas[etapaIndex + 1].id);
    }
  };

  const handleAnterior = () => {
    if (etapaIndex > 0) {
      setEtapaAtual(etapas[etapaIndex - 1].id);
    }
  };

  const handleConcluirEtapa = () => {
    setEtapasConcluidas(prev => new Set(prev).add(etapaAtual));
    toast.success(`Etapa ${etapas[etapaIndex].label} concluída com sucesso!`);

    if (etapaIndex < etapas.length - 1) {
      setEtapaAtual(etapas[etapaIndex + 1].id);
    }
  };

  const handleConcluirAnalise = () => {
    toast.success('Análise concluída com sucesso!');
    onVoltar();
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

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <FileCheck className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Análise de Processo</h3>
                <p className="text-sm text-gray-600">
                  {processo.numero} - {processo.requerente}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-xs text-gray-500">Número:</span>
                <p className="text-sm font-medium text-gray-900">{processo.numero}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Tipo de Processo:</span>
                <p className="text-sm font-medium text-gray-900">{processo.tipoProcesso || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Situação:</span>
                <p className="text-sm font-medium text-gray-900">{processo.situacao}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Etapa:</span>
                <p className="text-sm font-medium text-gray-900">{processo.etapa}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Requerente:</span>
                <p className="text-sm font-medium text-gray-900">{processo.requerente}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Data da Solicitação:</span>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(processo.dataSolicitacao).toLocaleDateString('pt-BR')}
                </p>
              </div>
              {processo.empreendimento && (
                <>
                  <div>
                    <span className="text-xs text-gray-500">Empreendimento:</span>
                    <p className="text-sm font-medium text-gray-900">{processo.empreendimento.nome}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Nº Empreendimento:</span>
                    <p className="text-sm font-medium text-gray-900">{processo.empreendimento.numero}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Wizard Progress */}
          <div className="bg-white p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {etapas.map((etapa, idx) => {
                const isConcluida = etapasConcluidas.has(etapa.id);
                const isAtual = etapaAtual === etapa.id;
                const isAcessivel = idx === 0 || etapasConcluidas.has(etapas[idx - 1].id);

                return (
                  <React.Fragment key={etapa.id}>
                    <div className="flex flex-col items-center">
                      <button
                        onClick={() => isAcessivel && setEtapaAtual(etapa.id)}
                        disabled={!isAcessivel}
                        className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                          isConcluida
                            ? 'bg-green-600 text-white'
                            : isAtual
                            ? 'bg-blue-600 text-white'
                            : isAcessivel
                            ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isConcluida ? (
                          <Check className="w-6 h-6" />
                        ) : (
                          etapa.icon
                        )}
                      </button>
                      <span className={`mt-2 text-xs font-medium ${
                        isAtual ? 'text-blue-600' : isConcluida ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {etapa.label}
                      </span>
                    </div>
                    {idx < etapas.length - 1 && (
                      <div className={`flex items-center justify-center mx-3 text-2xl transition-colors ${
                        etapasConcluidas.has(etapa.id) ? 'text-green-600' : 'text-gray-300'
                      }`}>
                        ➤
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-end">

            <div className="relative">
              <button
                onClick={() => setShowOpcoes(!showOpcoes)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <Menu className="w-4 h-4" />
                Opções
              </button>
              {showOpcoes && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <button
                    onClick={() => {
                      setShowTramitacoes(true);
                      setShowOpcoes(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-200"
                  >
                    Tramitações
                  </button>
                  <button
                    onClick={() => {
                      setShowNotificacoes(true);
                      setShowOpcoes(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Notificações de Pendência
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 min-h-[400px]">
            <EtapaConteudo etapa={etapaAtual} processo={processo} />

            {/* Botão de Concluir Etapa */}
            <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleConcluirEtapa}
                disabled={etapasConcluidas.has(etapaAtual)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-colors ${
                  etapasConcluidas.has(etapaAtual)
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <Check className="w-5 h-5" />
                {etapasConcluidas.has(etapaAtual) ? 'Etapa Concluída' : 'Concluir Etapa'}
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAnterior}
                  disabled={etapaIndex === 0}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                    etapaIndex === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>
                <button
                  onClick={handleProxima}
                  disabled={etapaIndex === etapas.length - 1}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                    etapaIndex === etapas.length - 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                  }`}
                >
                  Próxima
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPendenciaManager(true)}
                  className="flex items-center gap-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                >
                  <AlertCircle className="w-4 h-4" />
                  Registro de Pendência
                </button>
                <button
                  onClick={handleConcluirAnalise}
                  disabled={!todasEtapasConcluidas}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                    todasEtapasConcluidas
                      ? 'bg-teal-700 hover:bg-teal-800 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={!todasEtapasConcluidas ? 'Conclua todas as etapas para finalizar a análise' : ''}
                >
                  <Check className="w-4 h-4" />
                  Concluir Análise
                </button>
                <button
                  onClick={onVoltar}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPendenciaManager && (
        <PendenciaManager
          processoId={processo.id}
          etapaAtual={etapas[etapaIndex].label}
          onClose={() => setShowPendenciaManager(false)}
        />
      )}

      {showNotificacoes && (
        <NotificacoesPendenciaModal
          processoId={processo.id}
          numeroProcesso={processo.numero}
          onClose={() => setShowNotificacoes(false)}
        />
      )}

      {showTramitacoes && (
        <TramitacoesModal
          processoId={processo.id}
          numeroProcesso={processo.numero}
          onClose={() => setShowTramitacoes(false)}
        />
      )}
    </div>
  );
}

function EtapaConteudo({ etapa, processo }: { etapa: Etapa; processo: MeuProcessoItem }) {
  switch (etapa) {
    case 'imovel':
      return (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Dados do Imóvel</h4>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <p className="text-sm text-gray-600">
              Aqui serão exibidos todos os campos do cadastro de imóvel do processo.
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500">Endereço:</span>
                <p className="text-sm text-gray-900">Rua Exemplo, 123</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Município:</span>
                <p className="text-sm text-gray-900">Cidade Exemplo</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Área Total:</span>
                <p className="text-sm text-gray-900">10.000 m²</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Matrícula:</span>
                <p className="text-sm text-gray-900">12345</p>
              </div>
            </div>
          </div>
        </div>
      );

    case 'empreendimento':
      return (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Dados do Empreendimento</h4>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h5 className="text-sm font-semibold text-gray-700 mb-3">Dados Gerais</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500">Nome:</span>
                  <p className="text-sm text-gray-900">{processo.empreendimento?.nome || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Número:</span>
                  <p className="text-sm text-gray-900">{processo.empreendimento?.numero || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h5 className="text-sm font-semibold text-gray-700 mb-3">Atividades</h5>
              <div className="flex flex-wrap gap-2">
                {processo.empreendimento?.atividades.map((ativ, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full border border-blue-300"
                  >
                    {ativ}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h5 className="text-sm font-semibold text-gray-700 mb-3">Shapes e Mapas</h5>
              <p className="text-sm text-gray-600">
                Visualização de shapes, mapas e consultas espaciais será implementada aqui.
              </p>
            </div>
          </div>
        </div>
      );

    case 'caracterizacao':
      return (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Caracterização</h4>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-4">
              Informações dos formulários de caracterização do empreendimento.
            </p>
            <div className="space-y-4">
              <div className="border-b border-gray-300 pb-3">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Recursos e Energia</h5>
                <p className="text-sm text-gray-600">Dados sobre consumo energético e recursos utilizados.</p>
              </div>
              <div className="border-b border-gray-300 pb-3">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Uso de Água</h5>
                <p className="text-sm text-gray-600">Informações sobre captação e uso de recursos hídricos.</p>
              </div>
              <div className="border-b border-gray-300 pb-3">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Resíduos</h5>
                <p className="text-sm text-gray-600">Dados sobre geração e destinação de resíduos.</p>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Outras Informações</h5>
                <p className="text-sm text-gray-600">Informações complementares do empreendimento.</p>
              </div>
            </div>
          </div>
        </div>
      );

    case 'documentacao':
      return (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Documentação</h4>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h5 className="text-sm font-semibold text-gray-700 mb-3">Documentos do Processo</h5>
              <p className="text-sm text-gray-600">
                Listagem de todos os documentos anexados ao processo.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h5 className="text-sm font-semibold text-gray-700 mb-3">Documentos dos Partícipes</h5>
              <p className="text-sm text-gray-600">
                Listagem dos partícipes e seus respectivos documentos.
              </p>
            </div>
          </div>
        </div>
      );

    case 'analise_geo':
      return (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Análise Georreferenciada</h4>

          {/* GeoFront Iframe */}
          <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
            <iframe
              src={`https://geofront-frontend.onrender.com/index-refactored-ro.html?processo=${processo.numero}`}
              width="100%"
              height="800px"
              style={{ border: 'none' }}
              title="GeoFront - Análise Georreferenciada"
            />
          </div>

          {/* Seção de Consultas */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Consultas</h3>

            <div className="space-y-6">
              {/* Unidades de Conservação ICMBio */}
              <div>
                <div className="bg-gray-50 px-4 py-2 border border-gray-300">
                  <h4 className="text-sm font-semibold text-gray-900 text-center">Unidades de Conservação ICMBio</h4>
                </div>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-white border-b border-gray-300">
                      <th className="border-r border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700">Nome</th>
                      <th className="border-r border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700">Grupo</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Área da Sobreposição</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-50">
                      <td className="border-r border-gray-300 px-3 py-3 text-sm text-gray-600">Nada Encontrado</td>
                      <td className="border-r border-gray-300 px-3 py-3 text-sm text-gray-600 text-center">---</td>
                      <td className="px-3 py-3 text-sm text-gray-600 text-center">---</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Unidades de Conservação Estaduais */}
              <div>
                <div className="bg-gray-50 px-4 py-2 border border-gray-300">
                  <h4 className="text-sm font-semibold text-gray-900 text-center">Unidades de Conservação Estaduais</h4>
                </div>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-white border-b border-gray-300">
                      <th className="border-r border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700">Nome</th>
                      <th className="border-r border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700">Grupo</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Área da Sobreposição</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-50">
                      <td className="border-r border-gray-300 px-3 py-3 text-sm text-gray-600">Nada Encontrado</td>
                      <td className="border-r border-gray-300 px-3 py-3 text-sm text-gray-600 text-center">---</td>
                      <td className="px-3 py-3 text-sm text-gray-600 text-center">---</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Zonas de Amortecimento */}
              <div>
                <div className="bg-gray-50 px-4 py-2 border border-gray-300">
                  <h4 className="text-sm font-semibold text-gray-900 text-center">Zonas de Amortecimento de Unidades de Conservação Estaduais</h4>
                </div>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-white border-b border-gray-300">
                      <th className="border-r border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700">Nome</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Área da Sobreposição</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-50">
                      <td className="border-r border-gray-300 px-3 py-3 text-sm text-gray-600">Nada Encontrado</td>
                      <td className="px-3 py-3 text-sm text-gray-600 text-center">---</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Unidades de Conservação Municipais */}
              <div>
                <div className="bg-gray-50 px-4 py-2 border border-gray-300">
                  <h4 className="text-sm font-semibold text-gray-900 text-center">Unidades de Conservação Municipais</h4>
                </div>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-white border-b border-gray-300">
                      <th className="border-r border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700">Nome</th>
                      <th className="border-r border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700">Grupo</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Área da Sobreposição</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-50">
                      <td className="border-r border-gray-300 px-3 py-3 text-sm text-gray-600">Nada Encontrado</td>
                      <td className="border-r border-gray-300 px-3 py-3 text-sm text-gray-600 text-center">---</td>
                      <td className="px-3 py-3 text-sm text-gray-600 text-center">---</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Embargos IBAMA */}
              <div>
                <div className="bg-gray-50 px-4 py-2 border border-gray-300">
                  <h4 className="text-sm font-semibold text-gray-900 text-center">Embargos IBAMA</h4>
                </div>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-white border-b border-gray-300">
                      <th className="border-r border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700">Descrição da Infração</th>
                      <th className="border-r border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700">Área de Sobreposição</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Data do Embargo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-50">
                      <td className="border-r border-gray-300 px-3 py-3 text-sm text-gray-600">Nada Encontrado</td>
                      <td className="border-r border-gray-300 px-3 py-3 text-sm text-gray-600 text-center">---</td>
                      <td className="px-3 py-3 text-sm text-gray-600 text-center">---</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Embargos ICMBio */}
              <div>
                <div className="bg-gray-50 px-4 py-2 border border-gray-300">
                  <h4 className="text-sm font-semibold text-gray-900 text-center">Embargos ICMBio</h4>
                </div>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-white border-b border-gray-300">
                      <th className="border-r border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700">Descrição da Infração</th>
                      <th className="border-r border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700">Área de Sobreposição</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Data do Embargo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-50">
                      <td className="border-r border-gray-300 px-3 py-3 text-sm text-gray-600">Nada Encontrado</td>
                      <td className="border-r border-gray-300 px-3 py-3 text-sm text-gray-600 text-center">---</td>
                      <td className="px-3 py-3 text-sm text-gray-600 text-center">---</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Embargos Estaduais */}
              <div>
                <div className="bg-gray-50 px-4 py-2 border border-gray-300">
                  <h4 className="text-sm font-semibold text-gray-900 text-center">Embargos Estaduais</h4>
                </div>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-white border-b border-gray-300">
                      <th className="border-r border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700">Área da Sobreposição</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Data do Embargo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-50">
                      <td className="border-r border-gray-300 px-3 py-3 text-sm text-gray-600">Nada Encontrado</td>
                      <td className="px-3 py-3 text-sm text-gray-600 text-center">---</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Terras Indígenas */}
              <div>
                <div className="bg-gray-50 px-4 py-2 border border-gray-300">
                  <h4 className="text-sm font-semibold text-gray-900 text-center">Terras Indígenas</h4>
                </div>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-white border-b border-gray-300">
                      <th className="border-r border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700">Nome</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Área da Sobreposição</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-50">
                      <td className="border-r border-gray-300 px-3 py-3 text-sm text-gray-600">Nada Encontrado</td>
                      <td className="px-3 py-3 text-sm text-gray-600 text-center">---</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Desmatamento PRODES */}
              <div>
                <div className="bg-gray-50 px-4 py-2 border border-gray-300">
                  <h4 className="text-sm font-semibold text-gray-900 text-center">Desmatamento PRODES</h4>
                </div>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-white border-b border-gray-300">
                      <th className="border-r border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700">Data da Detecção</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Área da Sobreposição</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-50">
                      <td className="border-r border-gray-300 px-3 py-3 text-sm text-gray-600">Nada Encontrado</td>
                      <td className="px-3 py-3 text-sm text-gray-600 text-center">---</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}

interface MeuProcessoDetalhesProps {
  processo: MeuProcessoItem;
  onVoltar: () => void;
}

function MeuProcessoDetalhes({ processo, onVoltar }: MeuProcessoDetalhesProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={onVoltar}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para minha pauta
          </button>
          <div className="flex items-center gap-3 mb-2">
            <FolderOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Detalhes do Processo</h1>
          </div>
          <p className="text-gray-600">{processo.numero}</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Informações Gerais
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-500">Número do Processo</label>
                <p className="text-base font-medium text-gray-900">{processo.numero}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Requerente</label>
                <p className="text-base font-medium text-gray-900">{processo.requerente}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Atividade Principal</label>
                <p className="text-base font-medium text-gray-900">{processo.atividade}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Situação</label>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  processo.situacao === 'Em Análise' ? 'bg-blue-100 text-blue-800' :
                  processo.situacao === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {processo.situacao}
                </span>
              </div>
              <div>
                <label className="text-sm text-gray-500">Etapa</label>
                <p className="text-base font-medium text-gray-900">{processo.etapa}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data de Solicitação
                </label>
                <p className="text-base font-medium text-gray-900">
                  {new Date(processo.dataSolicitacao).toLocaleDateString('pt-BR')}
                </p>
              </div>
              {processo.responsavelTecnico && (
                <div>
                  <label className="text-sm text-gray-500 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Responsável Técnico
                  </label>
                  <p className="text-base font-medium text-gray-900">{processo.responsavelTecnico}</p>
                </div>
              )}
              {processo.tipoProcesso && (
                <div>
                  <label className="text-sm text-gray-500">Tipo de Processo</label>
                  <p className="text-base font-medium text-gray-900">{processo.tipoProcesso}</p>
                </div>
              )}
            </div>
          </div>

          {processo.empreendimento && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Dados do Empreendimento
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-gray-500">Número do Empreendimento</label>
                    <p className="text-base font-medium text-gray-900">{processo.empreendimento.numero}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Nome do Empreendimento</label>
                    <p className="text-base font-medium text-gray-900">{processo.empreendimento.nome}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-500 mb-2 block">Atividades do Empreendimento</label>
                  <div className="flex flex-wrap gap-2">
                    {processo.empreendimento.atividades.map((atividade, idx) => (
                      <span
                        key={idx}
                        className="inline-flex px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full border border-blue-300"
                      >
                        {atividade}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Localização do Empreendimento
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-xs text-gray-500">Endereço</label>
                      <p className="text-sm text-gray-900">Av. Principal, 3000</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Bairro</label>
                      <p className="text-sm text-gray-900">Zona Industrial</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Cidade/UF</label>
                      <p className="text-sm text-gray-900">Curitiba - PR</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">CEP</label>
                      <p className="text-sm text-gray-900">80230-123</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Coordenadas</label>
                      <p className="text-sm text-gray-900">-25.4284° S, -49.2733° W</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Factory className="w-4 h-4" />
                    Características do Empreendimento
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-xs text-gray-500">Porte</label>
                      <p className="text-sm text-gray-900">Médio Porte</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Potencial Poluidor</label>
                      <p className="text-sm text-gray-900">Médio</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Área Total</label>
                      <p className="text-sm text-gray-900">5.000 m²</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Área Construída</label>
                      <p className="text-sm text-gray-900">3.200 m²</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Informações Operacionais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-xs text-gray-500">Número de Funcionários</label>
                      <p className="text-sm text-gray-900">85 colaboradores</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Horário de Funcionamento</label>
                      <p className="text-sm text-gray-900">06:00 às 18:00 (Seg-Sáb)</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Capacidade Produtiva</label>
                      <p className="text-sm text-gray-900">1.200 unidades/dia</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Data de Início Operação</label>
                      <p className="text-sm text-gray-900">20/08/2019</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
              <User className="w-5 h-5" />
              Dados do Requerente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-500">Nome/Razão Social</label>
                <p className="text-base font-medium text-gray-900">{processo.requerente}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">CPF/CNPJ</label>
                <p className="text-base font-medium text-gray-900">34.567.890/0001-23</p>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <label className="text-sm text-gray-500">Telefone</label>
                  <p className="text-base font-medium text-gray-900">(41) 3345-6789</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <label className="text-sm text-gray-500">E-mail</label>
                  <p className="text-base font-medium text-gray-900">contato@processo.com.br</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Informações da Licença Solicitada
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-500">Tipo de Licença</label>
                <p className="text-base font-medium text-gray-900">Licença de Operação (LO)</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Prazo Solicitado</label>
                <p className="text-base font-medium text-gray-900">48 meses</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Valor da Taxa</label>
                <p className="text-base font-medium text-gray-900">R$ 4.200,00</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Status do Pagamento</label>
                <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                  Pago
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
