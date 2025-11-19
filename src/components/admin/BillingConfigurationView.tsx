import React from 'react';
import { ArrowLeft, DollarSign, Info, Calendar, FileText } from 'lucide-react';

interface BillingConfigurationViewProps {
  item: any;
  onBack: () => void;
}

export default function BillingConfigurationView({ item, onBack }: BillingConfigurationViewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

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

      {/* Billing Configuration Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{item.name}</h2>
              <p className="text-green-100">Configuração de Cobrança</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-2">Nome</label>
            <p className="text-lg text-gray-900 font-semibold">{item.name}</p>
          </div>

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

          {/* Financial Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Base Fee */}
            {item.base_fee !== null && item.base_fee !== undefined && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <label className="text-sm font-medium text-green-900">Taxa Base</label>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(item.base_fee)}
                </p>
              </div>
            )}

            {/* Variable Fee */}
            {item.variable_fee !== null && item.variable_fee !== undefined && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <label className="text-sm font-medium text-blue-900">Taxa Variável</label>
                </div>
                <p className="text-2xl font-bold text-blue-700">
                  {formatCurrency(item.variable_fee)}
                </p>
              </div>
            )}
          </div>

          {/* Additional Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Calculation Method */}
            {item.calculation_method && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <label className="text-sm font-medium text-gray-700">Método de Cálculo</label>
                </div>
                <p className="text-gray-900 font-medium">{item.calculation_method}</p>
              </div>
            )}

            {/* Default Deadline Days */}
            {item.default_deadline_days && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <label className="text-sm font-medium text-gray-700">Prazo Padrão</label>
                </div>
                <p className="text-gray-900 font-medium">
                  {item.default_deadline_days} dias
                </p>
              </div>
            )}
          </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">ID</label>
              <p className="text-sm text-gray-900 font-mono mt-1 break-all">{item.id}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</label>
              <p className="text-sm text-gray-900 mt-1">{item.name}</p>
            </div>
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
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-green-900 mb-1">
              Sobre as Configurações de Cobrança
            </h4>
            <p className="text-sm text-green-800">
              As configurações de cobrança definem os valores e métodos de cálculo aplicados
              aos diferentes tipos de serviços e licenças ambientais. Elas incluem taxas base,
              taxas variáveis, métodos de cálculo e prazos padrão para pagamento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
