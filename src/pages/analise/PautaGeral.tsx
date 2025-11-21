import React, { useState } from 'react';
import { ClipboardList, Search, Filter, Eye, UserCheck } from 'lucide-react';
import { toast } from 'react-toastify';

interface ProcessoPauta {
  id: string;
  numero: string;
  requerente: string;
  atividade: string;
  tipoLicenca: string;
  dataFormacao: string;
  prioridade: 'Alta' | 'Média' | 'Baixa';
}

const mockProcessosPauta: ProcessoPauta[] = [
  {
    id: '1',
    numero: 'PROC-2025-045',
    requerente: 'Indústria Metalúrgica Beta',
    atividade: 'Fabricação de Peças Metálicas',
    tipoLicenca: 'LO - Licença de Operação',
    dataFormacao: '2025-11-10',
    prioridade: 'Alta'
  },
  {
    id: '2',
    numero: 'PROC-2025-046',
    requerente: 'Mineradora Gamma Ltda',
    atividade: 'Extração de Minérios',
    tipoLicenca: 'LP - Licença Prévia',
    dataFormacao: '2025-11-12',
    prioridade: 'Média'
  },
  {
    id: '3',
    numero: 'PROC-2025-047',
    requerente: 'Frigorífico Omega',
    atividade: 'Abate de Bovinos',
    tipoLicenca: 'LI - Licença de Instalação',
    dataFormacao: '2025-11-14',
    prioridade: 'Alta'
  },
  {
    id: '4',
    numero: 'PROC-2025-048',
    requerente: 'Posto Combustível Sigma',
    atividade: 'Comércio de Combustíveis',
    tipoLicenca: 'LAU - Licença Ambiental Única',
    dataFormacao: '2025-11-16',
    prioridade: 'Baixa'
  }
];

export default function PautaGeral() {
  const [searchTerm, setSearchTerm] = useState('');
  const [processos] = useState<ProcessoPauta[]>(mockProcessosPauta);

  const handleAssumir = (processo: ProcessoPauta) => {
    toast.success(`Assumindo análise do processo ${processo.numero}`);
  };

  const handleDetalhes = (processo: ProcessoPauta) => {
    toast.info(`Visualizando detalhes do processo ${processo.numero}`);
  };

  const filteredProcessos = processos.filter(p =>
    p.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.requerente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.atividade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'Alta':
        return 'bg-red-100 text-red-800';
      case 'Média':
        return 'bg-yellow-100 text-yellow-800';
      case 'Baixa':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
                    Tipo de Licença
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Formação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProcessos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
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
                        <span className="text-sm text-gray-900">{processo.tipoLicenca}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {new Date(processo.dataFormacao).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPrioridadeColor(processo.prioridade)}`}>
                          {processo.prioridade}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAssumir(processo)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                            title="Assumir processo"
                          >
                            <UserCheck className="w-4 h-4" />
                            Assumir
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
