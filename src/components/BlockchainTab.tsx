import React from 'react';
import { Link2, Search, Calendar, User } from 'lucide-react';

interface BlockchainTabProps {
  process: any;
}

export default function BlockchainTab({ process }: BlockchainTabProps) {
  const mockBlockchainData = {
    dataRegistro: '11/11/2025',
    usuario: process?.analyst_name || '111.111.111-11',
    hashBlockchain: '000b0949159157062566d6d4bf8964f670c2955a7cf727324d537cf6997e6795f',
    orcoDeMilltec: '12345'
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Link2 className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Blockchain</h3>
            <p className="text-sm text-blue-700 mt-1">
              Registro imutável e transparente do processo de licenciamento ambiental
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 uppercase">Declaração de Uso</h3>
            <span className="text-xs text-gray-500">Registro Blockchain</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data Registro
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Usuário
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    Hash Blockchain
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Orco de Milltec
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider w-24">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{mockBlockchainData.dataRegistro}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{mockBlockchainData.usuario}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded border border-gray-200 break-all">
                      {mockBlockchainData.hashBlockchain}
                    </code>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm text-gray-900">{mockBlockchainData.orcoDeMilltec}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Buscar na blockchain"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Verificar hash"
                    >
                      <Link2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Informações do Processo</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Protocolo:</span>
                <span className="font-mono text-gray-900">{process?.protocol_number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-gray-900">{process?.status}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Data de Submissão:</span>
                <span className="text-gray-900">
                  {process?.submit_date ? new Date(process.submit_date).toLocaleDateString('pt-BR') : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Validação Blockchain</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Registro Verificado</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Hash Válido</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Integridade Confirmada</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-yellow-900">Modo de Demonstração</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Os dados de blockchain exibidos são simulados para fins de demonstração.
              Em produção, estes dados serão obtidos da rede blockchain real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
