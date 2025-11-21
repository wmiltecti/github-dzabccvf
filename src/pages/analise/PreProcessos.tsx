import React, { useState } from 'react';
import { FileText, Search, Filter, Eye, CheckSquare } from 'lucide-react';
import { toast } from 'react-toastify';

interface PreProcesso {
  id: string;
  numero: string;
  requerente: string;
  atividade: string;
  dataEntrada: string;
  situacao: string;
}

const mockPreProcessos: PreProcesso[] = [
  {
    id: '1',
    numero: 'PRE-2025-001',
    requerente: 'Empresa ABC Ltda',
    atividade: 'Indústria de Alimentos',
    dataEntrada: '2025-11-15',
    situacao: 'Aguardando Formação'
  },
  {
    id: '2',
    numero: 'PRE-2025-002',
    requerente: 'Construtora XYZ S/A',
    atividade: 'Construção Civil',
    dataEntrada: '2025-11-18',
    situacao: 'Documentação Incompleta'
  },
  {
    id: '3',
    numero: 'PRE-2025-003',
    requerente: 'Agropecuária Delta',
    atividade: 'Criação de Suínos',
    dataEntrada: '2025-11-20',
    situacao: 'Aguardando Formação'
  }
];

export default function PreProcessos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [processos] = useState<PreProcesso[]>(mockPreProcessos);

  const handleFormar = (processo: PreProcesso) => {
    toast.success(`Formando processo ${processo.numero}`);
  };

  const handleDetalhes = (processo: PreProcesso) => {
    toast.info(`Visualizando detalhes do processo ${processo.numero}`);
  };

  const filteredProcessos = processos.filter(p =>
    p.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.requerente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.atividade.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Pré-processos</p>
                <p className="text-2xl font-bold text-gray-900">{processos.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Aguardando Formação</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {processos.filter(p => p.situacao === 'Aguardando Formação').length}
                </p>
              </div>
              <CheckSquare className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Documentação Incompleta</p>
                <p className="text-2xl font-bold text-red-600">
                  {processos.filter(p => p.situacao === 'Documentação Incompleta').length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-red-600" />
            </div>
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
                    Data de Entrada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Situação
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
                        <span className="text-sm text-gray-900">{processo.atividade}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {new Date(processo.dataEntrada).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          processo.situacao === 'Aguardando Formação'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {processo.situacao}
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
