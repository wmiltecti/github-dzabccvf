import React, { useState } from 'react';
import { FolderOpen, Search, Filter, ArrowRightLeft, FileCheck, Eye, ArrowLeft, Building2, Calendar, User, MapPin, Phone, Mail, Briefcase, DollarSign, Factory, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import TramitarModal from '../../components/analise/TramitarModal';
import AnaliseModal from '../../components/analise/AnaliseModal';

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
  const [showAnaliseModal, setShowAnaliseModal] = useState(false);
  const [mostrandoDetalhes, setMostrandoDetalhes] = useState(false);

  const handleTramitar = (processo: MeuProcessoItem) => {
    setProcessoSelecionado(processo);
    setShowTramitarModal(true);
  };

  const handleAnalise = (processo: MeuProcessoItem) => {
    setProcessoSelecionado(processo);
    setShowAnaliseModal(true);
  };

  const handleDetalhes = (processo: MeuProcessoItem) => {
    setProcessoSelecionado(processo);
    setMostrandoDetalhes(true);
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

      {showAnaliseModal && processoSelecionado && (
        <AnaliseModal
          processo={processoSelecionado}
          onClose={() => {
            setShowAnaliseModal(false);
            setProcessoSelecionado(null);
          }}
        />
      )}
    </div>
  );
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
