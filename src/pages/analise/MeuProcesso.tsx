import React, { useState } from 'react';
import { FolderOpen, Search, Filter, FileCheck } from 'lucide-react';
import { toast } from 'react-toastify';

interface MeuProcessoItem {
  id: string;
  numero: string;
  requerente: string;
  atividade: string;
  tipoLicenca: string;
  dataAssumido: string;
  prazoAnalise: string;
  situacaoAnalise: 'Em Análise' | 'Pendente de Informações' | 'Aguardando Vistoria';
  diasRestantes: number;
}

const mockMeusProcessos: MeuProcessoItem[] = [
  {
    id: '1',
    numero: 'PROC-2025-023',
    requerente: 'Curtume Industrial São João',
    atividade: 'Curtimento de Couros',
    tipoLicenca: 'LO - Licença de Operação',
    dataAssumido: '2025-11-08',
    prazoAnalise: '2025-12-08',
    situacaoAnalise: 'Em Análise',
    diasRestantes: 17
  },
  {
    id: '2',
    numero: 'PROC-2025-031',
    requerente: 'Madeireira Florestal Ltda',
    atividade: 'Beneficiamento de Madeira',
    tipoLicenca: 'LI - Licença de Instalação',
    dataAssumido: '2025-11-12',
    prazoAnalise: '2025-12-12',
    situacaoAnalise: 'Pendente de Informações',
    diasRestantes: 21
  },
  {
    id: '3',
    numero: 'PROC-2025-038',
    requerente: 'Granja Avícola Delta',
    atividade: 'Criação de Aves',
    tipoLicenca: 'LP - Licença Prévia',
    dataAssumido: '2025-11-15',
    prazoAnalise: '2025-12-15',
    situacaoAnalise: 'Aguardando Vistoria',
    diasRestantes: 24
  }
];

export default function MeuProcesso() {
  const [searchTerm, setSearchTerm] = useState('');
  const [processos] = useState<MeuProcessoItem[]>(mockMeusProcessos);

  const handleAnalisar = (processo: MeuProcessoItem) => {
    toast.success(`Abrindo análise do processo ${processo.numero}`);
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
      case 'Pendente de Informações':
        return 'bg-yellow-100 text-yellow-800';
      case 'Aguardando Vistoria':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrazoColor = (dias: number) => {
    if (dias <= 7) return 'text-red-600 font-bold';
    if (dias <= 15) return 'text-yellow-600 font-semibold';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FolderOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Meu Processo</h1>
          </div>
          <p className="text-gray-600">
            Processos sob sua responsabilidade para análise técnica
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
                    Data Assumido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prazo Análise
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
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
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
                        <span className="text-sm text-gray-900">{processo.tipoLicenca}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {new Date(processo.dataAssumido).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-500">
                            {new Date(processo.prazoAnalise).toLocaleDateString('pt-BR')}
                          </span>
                          <span className={`text-xs ${getPrazoColor(processo.diasRestantes)}`}>
                            {processo.diasRestantes} dias restantes
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSituacaoColor(processo.situacaoAnalise)}`}>
                          {processo.situacaoAnalise}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleAnalisar(processo)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                          title="Analisar processo"
                        >
                          <FileCheck className="w-4 h-4" />
                          Analisar
                        </button>
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
