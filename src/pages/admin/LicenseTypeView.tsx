import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle, FileText, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import { AdminService, LicenseType, LicenseTypeDocument } from '../../services/adminService';
import AdminLayout from '../../components/admin/AdminLayout';

export default function LicenseTypeView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [licenseType, setLicenseType] = useState<LicenseType | null>(null);
  const [documents, setDocuments] = useState<LicenseTypeDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadLicenseType();
      loadDocuments();
    }
  }, [id]);

  const loadLicenseType = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getById<LicenseType>('license_types', id!);
      setLicenseType(data);
    } catch (error) {
      console.error('Error loading license type:', error);
      toast.error('Erro ao carregar tipo de licença');
      navigate('/admin/license-types');
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const docs = await AdminService.getLicenseTypeDocuments(id!);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <AdminLayout activeSection="license-types" onSectionChange={() => {}}>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Carregando...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!licenseType) {
    return (
      <AdminLayout activeSection="license-types" onSectionChange={() => {}}>
        <div className="text-center py-12">
          <p className="text-gray-600">Tipo de licença não encontrado</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeSection="license-types" onSectionChange={() => {}}>
      <div className="p-6 h-full overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleBack}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Visualizar Tipo de Licença</h1>
              <p className="text-sm text-gray-500 mt-1">Detalhes completos do tipo de licença</p>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              licenseType.is_active
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {licenseType.is_active ? 'Ativo' : 'Inativo'}
            </span>
          </div>

          {/* Main Info Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sigla */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Sigla/Abreviação
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {licenseType.abbreviation}
                </p>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Tipo da Licença
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {licenseType.name}
                </p>
              </div>

              {/* Prazo de Validade */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Prazo de Validade
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {licenseType.validity_period} {licenseType.time_unit}
                </p>
              </div>

              {/* Created At */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data de Criação
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(licenseType.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>

              {/* Description */}
              {licenseType.description && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Descrição
                  </label>
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {licenseType.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Documentação Necessária
              </h2>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Nenhum documento configurado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc, index) => (
                  <div
                    key={doc.id || index}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">
                            {doc.documentation_templates?.name || 'Documento'}
                          </h3>
                          {doc.is_required && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">
                              <CheckCircle className="w-3 h-3" />
                              Obrigatório
                            </span>
                          )}
                          {!doc.is_required && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                              Opcional
                            </span>
                          )}
                        </div>
                        {doc.documentation_templates?.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {doc.documentation_templates.description}
                          </p>
                        )}
                        {doc.documentation_templates?.document_types && (
                          <div className="flex flex-wrap gap-1">
                            {doc.documentation_templates.document_types.map((type) => (
                              <span
                                key={type}
                                className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            {documents.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    <strong>{documents.length}</strong> {documents.length === 1 ? 'documento' : 'documentos'} configurado(s)
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-red-600">
                      <strong>{documents.filter(d => d.is_required).length}</strong> obrigatório(s)
                    </span>
                    <span className="text-gray-600">
                      <strong>{documents.filter(d => !d.is_required).length}</strong> opcional(is)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">ID:</span>
                <p className="text-gray-900 font-mono text-xs mt-1">{licenseType.id}</p>
              </div>
              <div>
                <span className="text-gray-500">Criado em:</span>
                <p className="text-gray-900 mt-1">
                  {new Date(licenseType.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Atualizado em:</span>
                <p className="text-gray-900 mt-1">
                  {new Date(licenseType.updated_at).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
