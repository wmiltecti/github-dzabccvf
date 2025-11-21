import React, { useState } from 'react';
import { FileText, Search, Filter, Eye, CheckSquare, ArrowLeft, Building2, Calendar, User, FileCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import PreProcessoFormalizacao from '../../components/PreProcessoFormalizacao';

interface PreProcesso {
  id: string;
  numero: string;
  requerente: string;
  atividadePrimaria: string;
  situacao: string;
  dataSolicitacao: string;
  responsavelTecnico?: string;
  empreendimento?: {
    numero: string;
    nome: string;
    atividades: string[];
  };
  documentos?: {
    id: string;
    nome: string;
    tipo: string;
    url: string;
    status?: 'pendente' | 'aceito' | 'recusado';
    motivoRecusa?: string;
  }[];
}

const mockPreProcessos: PreProcesso[] = [
  {
    id: '1',
    numero: 'PRE-2025-001',
    requerente: 'Empresa ABC Ltda',
    atividadePrimaria: 'Indústria de Alimentos',
    dataSolicitacao: '2025-11-15',
    situacao: 'Aguardando Análise',
    responsavelTecnico: 'João Silva - CREA 12345',
    empreendimento: {
      numero: 'EMP-2025-001',
      nome: 'Fábrica de Laticínios ABC',
      atividades: ['Indústria de Alimentos', 'Processamento de Leite', 'Armazenamento']
    },
    documentos: [
      { id: '1', nome: 'Requerimento.pdf', tipo: 'Requerimento', url: '/docs/req1.pdf', status: 'pendente' },
      { id: '2', nome: 'Comprovante_Pagamento.pdf', tipo: 'Comprovante de Pagamento', url: '/docs/pag1.pdf', status: 'pendente' },
      { id: '3', nome: 'Projeto_Basico.pdf', tipo: 'Projeto Básico', url: '/docs/proj1.pdf', status: 'pendente' },
      { id: '4', nome: 'Memorial_Descritivo.pdf', tipo: 'Memorial Descritivo', url: '/docs/mem1.pdf', status: 'pendente' }
    ]
  },
  {
    id: '2',
    numero: 'PRE-2025-002',
    requerente: 'Construtora XYZ S/A',
    atividadePrimaria: 'Construção Civil',
    dataSolicitacao: '2025-11-18',
    situacao: 'Aguardando Análise',
    responsavelTecnico: 'Maria Santos - CREA 67890',
    empreendimento: {
      numero: 'EMP-2025-002',
      nome: 'Condomínio Residencial Portal',
      atividades: ['Construção Civil', 'Terraplenagem', 'Infraestrutura']
    },
    documentos: [
      { id: '5', nome: 'Requerimento.pdf', tipo: 'Requerimento', url: '/docs/req2.pdf', status: 'pendente' },
      { id: '6', nome: 'Comprovante_Pagamento.pdf', tipo: 'Comprovante de Pagamento', url: '/docs/pag2.pdf', status: 'pendente' },
      { id: '7', nome: 'ART.pdf', tipo: 'ART/RRT', url: '/docs/art2.pdf', status: 'pendente' }
    ]
  },
  {
    id: '3',
    numero: 'PRE-2025-003',
    requerente: 'Agropecuária Delta',
    atividadePrimaria: 'Criação de Suínos',
    dataSolicitacao: '2025-11-20',
    situacao: 'Aguardando Análise',
    responsavelTecnico: 'Carlos Oliveira - CRMV 11223',
    empreendimento: {
      numero: 'EMP-2025-003',
      nome: 'Granja Suína Delta',
      atividades: ['Criação de Suínos', 'Sistema de Tratamento de Efluentes']
    },
    documentos: [
      { id: '8', nome: 'Requerimento.pdf', tipo: 'Requerimento', url: '/docs/req3.pdf', status: 'pendente' },
      { id: '9', nome: 'Comprovante_Pagamento.pdf', tipo: 'Comprovante de Pagamento', url: '/docs/pag3.pdf', status: 'pendente' }
    ]
  }
];

export default function PreProcessos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [processos] = useState<PreProcesso[]>(mockPreProcessos);
  const [processoSelecionado, setProcessoSelecionado] = useState<PreProcesso | null>(null);
  const [mostrandoFormalizacao, setMostrandoFormalizacao] = useState(false);
  const [mostrandoDetalhes, setMostrandoDetalhes] = useState(false);

  const handleFormar = (processo: PreProcesso) => {
    setProcessoSelecionado(processo);
    setMostrandoFormalizacao(true);
  };

  const handleDetalhes = (processo: PreProcesso) => {
    setProcessoSelecionado(processo);
    setMostrandoDetalhes(true);
  };

  const handleFormalizar = (processoId: string, setorId: string) => {
    console.log(`Processo ${processoId} formalizado para setor ${setorId}`);
  };

  const handleRecusar = (processoId: string) => {
    console.log(`Processo ${processoId} recusado`);
  };

  const handleVoltar = () => {
    setMostrandoFormalizacao(false);
    setProcessoSelecionado(null);
  };

  const handleVoltarDetalhes = () => {
    setMostrandoDetalhes(false);
    setProcessoSelecionado(null);
  };

  const filteredProcessos = processos.filter(p =>
    p.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.requerente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.atividadePrimaria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (mostrandoFormalizacao && processoSelecionado) {
    return (
      <PreProcessoFormalizacao
        preProcesso={processoSelecionado}
        onVoltar={handleVoltar}
        onFormalizar={handleFormalizar}
        onRecusar={handleRecusar}
      />
    );
  }

  if (mostrandoDetalhes && processoSelecionado) {
    return <PreProcessoDetalhes processo={processoSelecionado} onVoltar={handleVoltarDetalhes} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Pré-processos</h1>
          </div>
          <p className="text-gray-600">
            Processos aguardando formação para análise
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
                    Atividade Primária
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Situação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Solicitação
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
                      Nenhum pré-processo encontrado
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{processo.atividadePrimaria}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {processo.situacao}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {new Date(processo.dataSolicitacao).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleFormar(processo)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                            title="Formar processo"
                          >
                            <CheckSquare className="w-4 h-4" />
                            Formar
                          </button>
                          <button
                            onClick={() => handleDetalhes(processo)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
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
    </div>
  );
}

interface PreProcessoDetalhesProps {
  processo: PreProcesso;
  onVoltar: () => void;
}

function PreProcessoDetalhes({ processo, onVoltar }: PreProcessoDetalhesProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={onVoltar}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para listagem
          </button>
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Detalhes do Pré-processo</h1>
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
                <label className="text-sm text-gray-500">Número</label>
                <p className="text-base font-medium text-gray-900">{processo.numero}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Requerente</label>
                <p className="text-base font-medium text-gray-900">{processo.requerente}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Atividade Primária</label>
                <p className="text-base font-medium text-gray-900">{processo.atividadePrimaria}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Situação</label>
                <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  {processo.situacao}
                </span>
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
                Empreendimento
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Número do Empreendimento</label>
                  <p className="text-base font-medium text-gray-900">{processo.empreendimento.numero}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Nome</label>
                  <p className="text-base font-medium text-gray-900">{processo.empreendimento.nome}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-2 block">Atividades</label>
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
              </div>
            </div>
          )}

          {processo.documentos && processo.documentos.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                <FileCheck className="w-5 h-5" />
                Documentos Anexados
              </h2>
              <div className="space-y-3">
                {processo.documentos.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.nome}</p>
                        <p className="text-xs text-gray-500">{doc.tipo}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.status && (
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            doc.status === 'aceito'
                              ? 'bg-green-100 text-green-800'
                              : doc.status === 'recusado'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {doc.status === 'aceito' ? 'Aceito' : doc.status === 'recusado' ? 'Recusado' : 'Pendente'}
                        </span>
                      )}
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Visualizar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
