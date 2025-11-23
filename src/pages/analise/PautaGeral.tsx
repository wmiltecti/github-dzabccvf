import React, { useState } from 'react';
import { ClipboardList, Search, Filter, Eye, UserCheck, X, Building2, ArrowLeft, Calendar, User, FileText, MapPin, Phone, Mail, Briefcase, DollarSign, Factory } from 'lucide-react';
import { toast } from 'react-toastify';

interface ProcessoPauta {
  id: string;
  numero: string;
  requerente: string;
  atividade: string;
  situacao: string;
  etapa: string;
  dataSolicitacao: string;
  responsavelTecnico?: string;
  empreendimento?: {
    numero: string;
    nome: string;
    atividades: string[];
  };
}

const mockProcessosPauta: ProcessoPauta[] = [
  {
    id: '1',
    numero: 'LP/001/2025',
    requerente: 'Indústria Metalúrgica Beta',
    atividade: 'Fabricação de Peças Metálicas',
    situacao: 'Aguardando Distribuição',
    etapa: 'Análise Técnica',
    dataSolicitacao: '2025-11-10',
    responsavelTecnico: 'João Silva - CREA 12345',
    empreendimento: {
      numero: 'EMP-2025-010',
      nome: 'Indústria Metalúrgica Beta',
      atividades: ['Fabricação de Peças Metálicas', 'Fundição', 'Usinagem']
    }
  },
  {
    id: '2',
    numero: 'LI/001/2025',
    requerente: 'Mineradora Gamma Ltda',
    atividade: 'Extração de Minérios',
    situacao: 'Aguardando Distribuição',
    etapa: 'Análise Técnica',
    dataSolicitacao: '2025-11-12',
    responsavelTecnico: 'Maria Santos - CREA 67890',
    empreendimento: {
      numero: 'EMP-2025-011',
      nome: 'Mineradora Gamma',
      atividades: ['Extração de Minérios', 'Beneficiamento']
    }
  },
  {
    id: '3',
    numero: 'LO/001/2025',
    requerente: 'Frigorífico Omega',
    atividade: 'Abate de Bovinos',
    situacao: 'Aguardando Distribuição',
    etapa: 'Análise Técnica',
    dataSolicitacao: '2025-11-14',
    responsavelTecnico: 'Carlos Oliveira - CRMV 11223',
    empreendimento: {
      numero: 'EMP-2025-012',
      nome: 'Frigorífico Omega',
      atividades: ['Abate de Bovinos', 'Processamento de Carnes']
    }
  },
  {
    id: '4',
    numero: 'LP/002/2025',
    requerente: 'Posto Combustível Sigma',
    atividade: 'Comércio de Combustíveis',
    situacao: 'Aguardando Distribuição',
    etapa: 'Análise Técnica',
    dataSolicitacao: '2025-11-16',
    responsavelTecnico: 'Ana Costa - CREA 33445',
    empreendimento: {
      numero: 'EMP-2025-013',
      nome: 'Posto Combustível Sigma',
      atividades: ['Comércio de Combustíveis', 'Lavagem de Veículos']
    }
  }
];

export default function PautaGeral() {
  const [searchTerm, setSearchTerm] = useState('');
  const [processos, setProcessos] = useState<ProcessoPauta[]>(mockProcessosPauta);
  const [processoSelecionado, setProcessoSelecionado] = useState<ProcessoPauta | null>(null);
  const [showAssumirModal, setShowAssumirModal] = useState(false);
  const [mostrandoDetalhes, setMostrandoDetalhes] = useState(false);

  const handleAssumir = (processo: ProcessoPauta) => {
    setProcessoSelecionado(processo);
    setShowAssumirModal(true);
  };

  const handleConfirmarAssumir = () => {
    if (processoSelecionado) {
      setProcessos(prev => prev.filter(p => p.id !== processoSelecionado.id));
      toast.success(`Processo ${processoSelecionado.numero} assumido com sucesso!`);
      setShowAssumirModal(false);
      setProcessoSelecionado(null);
    }
  };

  const handleDetalhes = (processo: ProcessoPauta) => {
    setProcessoSelecionado(processo);
    setMostrandoDetalhes(true);
  };

  const filteredProcessos = processos.filter(p =>
    p.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.requerente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.atividade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (mostrandoDetalhes && processoSelecionado) {
    return (
      <ProcessoPautaDetalhes
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardList className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Pauta Geral</h1>
          </div>
          <p className="text-gray-600">
            Processos formados aguardando distribuição para análise
          </p>
        </div>

        {/* Search and Filters */}
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

        {/* Table */}
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
                      Nenhum processo encontrado na pauta
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
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {processo.situacao}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{processo.etapa}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAssumir(processo)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-sm rounded-lg transition-colors"
                            title="Assumir processo"
                          >
                            <UserCheck className="w-4 h-4" />
                            Assumir
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

      {/* Modal de Confirmação de Assumir */}
      {showAssumirModal && processoSelecionado && (
        <AssumirProcessoModal
          processo={processoSelecionado}
          onConfirmar={handleConfirmarAssumir}
          onCancelar={() => {
            setShowAssumirModal(false);
            setProcessoSelecionado(null);
          }}
        />
      )}
    </div>
  );
}

interface AssumirProcessoModalProps {
  processo: ProcessoPauta;
  onConfirmar: () => void;
  onCancelar: () => void;
}

function AssumirProcessoModal({ processo, onConfirmar, onCancelar }: AssumirProcessoModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <UserCheck className="w-6 h-6 text-teal-700" />
            <h3 className="text-xl font-semibold text-gray-900">Assumir Processo</h3>
          </div>
          <button
            onClick={onCancelar}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm text-gray-600">
            Revise as informações do processo antes de assumir a análise:
          </p>

          {/* Informações do Processo */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 border-b border-gray-300 pb-2">
              Informações do Processo
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500">Número:</span>
                <p className="text-sm font-medium text-gray-900">{processo.numero}</p>
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
              {processo.responsavelTecnico && (
                <div>
                  <span className="text-xs text-gray-500">Responsável Técnico:</span>
                  <p className="text-sm font-medium text-gray-900">{processo.responsavelTecnico}</p>
                </div>
              )}
            </div>
          </div>

          {/* Informações do Empreendimento */}
          {processo.empreendimento && (
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 border-b border-gray-300 pb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Empreendimento
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500">Número:</span>
                  <p className="text-sm font-medium text-gray-900">{processo.empreendimento.numero}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Nome:</span>
                  <p className="text-sm font-medium text-gray-900">{processo.empreendimento.nome}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Atividades:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {processo.empreendimento.atividades.map((atividade, idx) => (
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

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onCancelar}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            Confirmar e Assumir
          </button>
        </div>
      </div>
    </div>
  );
}

interface ProcessoPautaDetalhesProps {
  processo: ProcessoPauta;
  onVoltar: () => void;
}

function ProcessoPautaDetalhes({ processo, onVoltar }: ProcessoPautaDetalhesProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={onVoltar}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para pauta geral
          </button>
          <div className="flex items-center gap-3 mb-2">
            <ClipboardList className="w-8 h-8 text-blue-600" />
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
                <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
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
                      <p className="text-sm text-gray-900">Rua Industrial, 500</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Bairro</label>
                      <p className="text-sm text-gray-900">Distrito Industrial</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Cidade/UF</label>
                      <p className="text-sm text-gray-900">Belo Horizonte - MG</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">CEP</label>
                      <p className="text-sm text-gray-900">30123-456</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Coordenadas</label>
                      <p className="text-sm text-gray-900">-19.9167° S, -43.9345° W</p>
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
                      <p className="text-sm text-gray-900">Grande Porte</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Potencial Poluidor</label>
                      <p className="text-sm text-gray-900">Alto</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Área Total</label>
                      <p className="text-sm text-gray-900">15.000 m²</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Área Construída</label>
                      <p className="text-sm text-gray-900">8.500 m²</p>
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
                      <p className="text-sm text-gray-900">120 colaboradores</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Horário de Funcionamento</label>
                      <p className="text-sm text-gray-900">24 horas (turnos)</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Capacidade Produtiva</label>
                      <p className="text-sm text-gray-900">2.000 unidades/dia</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Data de Início Operação</label>
                      <p className="text-sm text-gray-900">10/01/2018</p>
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
                <p className="text-base font-medium text-gray-900">23.456.789/0001-12</p>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <label className="text-sm text-gray-500">Telefone</label>
                  <p className="text-base font-medium text-gray-900">(31) 3234-5678</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <label className="text-sm text-gray-500">E-mail</label>
                  <p className="text-base font-medium text-gray-900">contato@industria.com.br</p>
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
                <p className="text-base font-medium text-gray-900">Licença de Instalação (LI)</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Prazo Solicitado</label>
                <p className="text-base font-medium text-gray-900">36 meses</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Valor da Taxa</label>
                <p className="text-base font-medium text-gray-900">R$ 8.500,00</p>
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
