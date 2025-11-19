import React from 'react';
import { ArrowLeft, FileText, Calendar, Hash, SortAsc, Info, Workflow, Tag, Mail, AlertCircle } from 'lucide-react';

interface ProcessTypeViewProps {
  item: any;
  onBack: () => void;
}

export default function ProcessTypeView({ item, onBack }: ProcessTypeViewProps) {
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

      {/* Process Type Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{item.name}</h2>
              {item.abbreviation && (
                <p className="text-blue-100">Sigla: {item.abbreviation}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Fluxo e Categoria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fluxo */}
            {item.fluxo && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Workflow className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-purple-900">Fluxo</label>
                    <p className="text-lg font-semibold text-purple-700 capitalize">
                      {item.fluxo}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Categoria do Processo */}
            {item.categoria_processo && (
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Tag className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-indigo-900">Categoria do Processo</label>
                    <p className="text-lg font-semibold text-indigo-700 capitalize">
                      {item.categoria_processo}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Basic Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Default Deadline */}
            {item.default_deadline_days && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-900">Prazo Padrão</label>
                    <p className="text-xl font-bold text-blue-600">
                      {item.default_deadline_days} dias
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Display Order */}
            {item.display_order !== null && item.display_order !== undefined && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <SortAsc className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-green-900">Ordem de Exibição</label>
                    <p className="text-xl font-bold text-green-600">
                      {item.display_order}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Prazos Adicionais */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              Prazos e Limites
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Prazo Cumprimento Ofício */}
              {item.prazo_cumprimento_oficio_dias && (
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <label className="text-xs font-medium text-orange-900">Prazo Cumprimento Ofício</label>
                  </div>
                  <p className="text-2xl font-bold text-orange-700">
                    {item.prazo_cumprimento_oficio_dias}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">dias</p>
                </div>
              )}

              {/* Prazo Confirmação E-mail */}
              {item.prazo_confirmacao_email_dias && (
                <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-5 h-5 text-cyan-600" />
                    <label className="text-xs font-medium text-cyan-900">Prazo Confirmação E-mail</label>
                  </div>
                  <p className="text-2xl font-bold text-cyan-700">
                    {item.prazo_confirmacao_email_dias}
                  </p>
                  <p className="text-xs text-cyan-600 mt-1">dias</p>
                </div>
              )}

              {/* Limite Ofícios Pendências */}
              {item.limite_oficios_pendencias && (
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-5 h-5 text-red-600" />
                    <label className="text-xs font-medium text-red-900">Limite Ofícios Pendências</label>
                  </div>
                  <p className="text-2xl font-bold text-red-700">
                    {item.limite_oficios_pendencias}
                  </p>
                  <p className="text-xs text-red-600 mt-1">ofícios</p>
                </div>
              )}
            </div>
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
            {item.abbreviation && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sigla</label>
                <p className="text-sm text-gray-900 mt-1 font-semibold">{item.abbreviation}</p>
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
              Sobre os Tipos de Processo
            </h4>
            <p className="text-sm text-blue-800">
              Os tipos de processo definem as diferentes categorias de licenciamento ambiental.
              O prazo padrão é utilizado como referência para a análise dos processos.
              A ordem de exibição determina como os tipos aparecem nas listas e formulários.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
