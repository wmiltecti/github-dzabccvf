import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, AlertCircle, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

interface ActivityViewProps {
  item: any;
  onBack: () => void;
}

interface LicenseTypeDocument {
  license_type_id: string;
  template_id: string;
  is_required: boolean;
  license_types?: {
    id: string;
    name: string;
    abbreviation: string;
  };
  documentation_templates?: {
    id: string;
    name: string;
    description: string;
  };
}

interface EnterpriseSizeRange {
  enterprise_size_id: string;
  min_value: number | null;
  max_value: number | null;
  enterprise_sizes?: {
    id: string;
    name: string;
  };
}

export default function ActivityView({ item, onBack }: ActivityViewProps) {
  const [licenseTypeDocuments, setLicenseTypeDocuments] = useState<LicenseTypeDocument[]>([]);
  const [enterpriseSizeRanges, setEnterpriseSizeRanges] = useState<EnterpriseSizeRange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRelatedData();
  }, [item.id]);

  const loadRelatedData = async () => {
    setLoading(true);
    try {
      // Load license type documents
      const { data: docData, error: docError } = await supabase
        .from('activity_license_type_documents')
        .select(`
          license_type_id,
          template_id,
          is_required,
          license_types (
            id,
            name,
            abbreviation
          ),
          documentation_templates (
            id,
            name,
            description
          )
        `)
        .eq('activity_id', item.id);

      if (docError) throw docError;
      setLicenseTypeDocuments(docData || []);

      // Load enterprise size ranges
      const { data: sizeData, error: sizeError } = await supabase
        .from('activity_enterprise_size_ranges')
        .select(`
          enterprise_size_id,
          min_value,
          max_value,
          enterprise_sizes (
            id,
            name
          )
        `)
        .eq('activity_id', item.id);

      if (sizeError) {
        console.warn('Erro ao carregar faixas de porte:', sizeError);
        setEnterpriseSizeRanges([]);
      } else {
        setEnterpriseSizeRanges(sizeData || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados relacionados:', error);
      toast.error('Erro ao carregar dados da atividade');
    } finally {
      setLoading(false);
    }
  };

  // Group documents by license type
  const documentsByLicenseType = licenseTypeDocuments.reduce((acc, doc) => {
    const licenseTypeId = doc.license_type_id;
    if (!acc[licenseTypeId]) {
      acc[licenseTypeId] = {
        licenseType: doc.license_types,
        documents: []
      };
    }
    acc[licenseTypeId].documents.push(doc);
    return acc;
  }, {} as Record<string, { licenseType: any; documents: LicenseTypeDocument[] }>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">Carregando...</span>
      </div>
    );
  }

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

      {/* Activity Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{item.name}</h2>
              <p className="text-blue-100">Código: {item.code}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Potencial Poluidor</label>
              <p className="text-gray-900 font-medium">
                {item.pollution_potentials?.name || 'Não informado'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Unidade de Medida</label>
              <p className="text-gray-900 font-medium">{item.measurement_unit || 'Não informado'}</p>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div>
              <label className="text-sm font-medium text-gray-500">Descrição</label>
              <p className="text-gray-900 mt-1">{item.description}</p>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <div className="mt-1">
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                item.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {item.is_active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise Size Ranges */}
      {enterpriseSizeRanges.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Faixas de Porte do Empreendimento
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {enterpriseSizeRanges.map((range, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {range.enterprise_sizes?.name || 'Porte não especificado'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {range.min_value !== null && range.max_value !== null ? (
                        <>De {range.min_value} até {range.max_value} {item.measurement_unit || ''}</>
                      ) : range.min_value !== null ? (
                        <>A partir de {range.min_value} {item.measurement_unit || ''}</>
                      ) : range.max_value !== null ? (
                        <>Até {range.max_value} {item.measurement_unit || ''}</>
                      ) : (
                        'Sem faixa definida'
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* License Type Documents */}
      {Object.keys(documentsByLicenseType).length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Documentos por Tipo de Licença
            </h3>
          </div>
          <div className="p-6 space-y-6">
            {Object.values(documentsByLicenseType).map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">
                      {group.licenseType?.abbreviation || '?'}
                    </span>
                  </div>
                  {group.licenseType?.name || 'Tipo de Licença não especificado'}
                </h4>
                <div className="ml-10 space-y-2">
                  {group.documents.map((doc, docIndex) => (
                    <div
                      key={docIndex}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {doc.documentation_templates?.name || 'Documento não especificado'}
                        </p>
                        {doc.documentation_templates?.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {doc.documentation_templates.description}
                          </p>
                        )}
                      </div>
                      <div>
                        {doc.is_required ? (
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            Obrigatório
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            Opcional
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum documento configurado
            </h3>
            <p className="text-gray-500">
              Esta atividade ainda não possui documentos associados aos tipos de licença.
            </p>
          </div>
        </div>
      )}

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
    </div>
  );
}
