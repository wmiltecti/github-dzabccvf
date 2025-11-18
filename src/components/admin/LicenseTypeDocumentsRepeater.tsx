import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, AlertCircle } from 'lucide-react';
import { AdminService, DocumentationTemplate } from '../../services/adminService';
import { toast } from 'react-toastify';

interface DocumentItem {
  id?: string;
  documentation_template_id: string;
  is_required: boolean;
  tempId?: string;
}

interface LicenseTypeDocumentsRepeaterProps {
  licenseTypeId?: string;
  value: DocumentItem[];
  onChange: (documents: DocumentItem[]) => void;
}

export default function LicenseTypeDocumentsRepeater({
  licenseTypeId,
  value,
  onChange
}: LicenseTypeDocumentsRepeaterProps) {
  const [availableDocuments, setAvailableDocuments] = useState<DocumentationTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailableDocuments();
  }, []);

  const loadAvailableDocuments = async () => {
    try {
      setLoading(true);
      const docs = await AdminService.getAll<DocumentationTemplate>('documentation_templates', false);
      setAvailableDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Erro ao carregar documentos disponíveis');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = () => {
    const newDocument: DocumentItem = {
      documentation_template_id: '',
      is_required: false,
      tempId: `temp-${Date.now()}`
    };
    onChange([...value, newDocument]);
  };

  const handleRemoveDocument = (index: number) => {
    const newDocuments = value.filter((_, i) => i !== index);
    onChange(newDocuments);
  };

  const handleDocumentChange = (index: number, field: keyof DocumentItem, fieldValue: any) => {
    const newDocuments = [...value];
    newDocuments[index] = {
      ...newDocuments[index],
      [field]: fieldValue
    };
    onChange(newDocuments);
  };

  const getAvailableDocumentsForSelect = (currentDocId?: string) => {
    const selectedIds = value
      .map(doc => doc.documentation_template_id)
      .filter(id => id && id !== currentDocId);

    return availableDocuments.filter(doc =>
      !selectedIds.includes(doc.id) || doc.id === currentDocId
    );
  };

  const getDocumentName = (docId: string) => {
    const doc = availableDocuments.find(d => d.id === docId);
    return doc?.name || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Carregando documentos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Documentação Necessária
        </label>
        <button
          type="button"
          onClick={handleAddDocument}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar Documento
        </button>
      </div>

      {value.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">Nenhum documento adicionado</p>
          <p className="text-sm text-gray-500">
            Clique em "Adicionar Documento" para começar
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {value.map((doc, index) => {
            const availableForThisSelect = getAvailableDocumentsForSelect(doc.documentation_template_id);
            const hasError = !doc.documentation_template_id && value.length > 1;

            return (
              <div
                key={doc.tempId || doc.id || index}
                className={`border rounded-lg p-4 bg-white ${
                  hasError ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 pt-2">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    {/* Documento Selector */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Documento
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        value={doc.documentation_template_id}
                        onChange={(e) => handleDocumentChange(index, 'documentation_template_id', e.target.value)}
                        className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          hasError ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Selecione o documento...</option>
                        {availableForThisSelect.map(availableDoc => (
                          <option key={availableDoc.id} value={availableDoc.id}>
                            {availableDoc.name}
                          </option>
                        ))}
                      </select>
                      {hasError && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          Selecione um documento
                        </p>
                      )}
                    </div>

                    {/* Checkbox Obrigatório */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`required-${index}`}
                        checked={doc.is_required}
                        onChange={(e) => handleDocumentChange(index, 'is_required', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor={`required-${index}`}
                        className="text-sm font-medium text-gray-700 cursor-pointer select-none"
                      >
                        Documento obrigatório
                      </label>
                      {doc.is_required && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">
                          Obrigatório
                        </span>
                      )}
                    </div>

                    {/* Document Description (if selected) */}
                    {doc.documentation_template_id && (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-sm text-gray-600">
                          {availableDocuments.find(d => d.id === doc.documentation_template_id)?.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {availableDocuments
                            .find(d => d.id === doc.documentation_template_id)
                            ?.document_types.map(type => (
                              <span
                                key={type}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                              >
                                {type}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveDocument(index)}
                    className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remover documento"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {value.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                {value.length} {value.length === 1 ? 'documento configurado' : 'documentos configurados'}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {value.filter(d => d.is_required).length} obrigatório(s) • {' '}
                {value.filter(d => !d.is_required).length} opcional(is)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
