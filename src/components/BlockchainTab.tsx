import React from 'react';
import { ExternalLink, Link2 } from 'lucide-react';
import { BLOCKCHAIN_PARAMS } from '../lib/parameters';

interface BlockchainTabProps {
  process: any;
}

export default function BlockchainTab({ process }: BlockchainTabProps) {
  const mockBlockchainData = {
    dataRegistro: '11/11/2025',
    usuario: process?.analyst_name || '111.111.111-11',
    hashBlockchain: '000b0949159157062566d6d4bf8964f670c2955a7cf727324d537cf6997e6795f'
  };

  const blockchainUrl = `${BLOCKCHAIN_PARAMS.blockchainExplorerUrl}${mockBlockchainData.hashBlockchain}`;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Link2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 text-base">Blockchain</h3>
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
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Data Registro
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Hash Blockchain
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Blockchain Miltec
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
                  <code className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded border border-gray-200 break-all">
                    {mockBlockchainData.hashBlockchain}
                  </code>
                </td>
                <td className="px-6 py-4 text-center">
                  <a
                    href={blockchainUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    title="Consultar no Blockchain Miltec"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Consultar
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
