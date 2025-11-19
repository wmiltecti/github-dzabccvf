import React from 'react';
import { ArrowLeft, Building2, Info } from 'lucide-react';

interface EnterpriseSizeViewProps {
  item: any;
  onBack: () => void;
}

export default function EnterpriseSizeView({ item, onBack }: EnterpriseSizeViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>
      </div>

      {/* Enterprise Size Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{item.name}</h2>
              <p className="text-blue-100">Porte do Empreendimento</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-2">Nome</label>
            <p className="text-lg text-gray-900 font-semibold">{item.name}</p>
          </div>

          {/* Code */}
          {item.code && (
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-2">Código</label>
              <p className="text-lg text-gray-900 font-mono font-semibold">{item.code}</p>
            </div>
          )}

          {/* Description */}
          {item.description && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Info className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Descrição</label>
                  <p className="text-gray-900 leading-relaxed">{item.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-2">Status</label>
            <div>
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                item.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {item.is_active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">ID</label>
              <p className="text-sm text-gray-900 font-mono mt-1 break-all">{item.id}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</label>
              <p className="text-sm text-gray-900 mt-1">{item.name}</p>
            </div>
            {item.code && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Código</label>
                <p className="text-sm text-gray-900 mt-1 font-semibold font-mono">{item.code}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Criado em:</span>
            <span className="ml-2 text-gray-900">
              {new Date(item.created_at).toLocaleString('pt-BR')}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Atualizado em:</span>
            <span className="ml-2 text-gray-900">
              {new Date(item.updated_at).toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      </div>

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              Sobre os Portes de Empreendimento
            </h4>
            <p className="text-sm text-blue-800">
              Os portes de empreendimento definem a classificação do tamanho das empresas
              de acordo com critérios estabelecidos pela legislação ambiental. Essa classificação
              é importante para determinar os procedimentos e exigências específicas de licenciamento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
