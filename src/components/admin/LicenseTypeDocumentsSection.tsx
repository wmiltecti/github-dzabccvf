import React from 'react';
import { Plus, Trash2, FileText, AlertCircle } from 'lucide-react';

interface DocumentItem {
  template_id: string;
  is_required: boolean;
}

interface LicenseTypeBlock {
  license_type_id: string;
  documents: DocumentItem[];
}

interface LicenseType {
  id: string;
  abbreviation: string;
  name: string;
}

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
}

interface LicenseTypeDocumentsSectionProps {
  licenseTypes: LicenseType[];
  documentTemplates: DocumentTemplate[];
  value: LicenseTypeBlock[];
  onChange: (blocks: LicenseTypeBlock[]) => void;
}

export default function LicenseTypeDocumentsSection({
  licenseTypes,
  documentTemplates,
  value,
  onChange
}: LicenseTypeDocumentsSectionProps) {

  const handleAddLicenseType = () => {
    const newBlock: LicenseTypeBlock = {
      license_type_id: '',
      documents: []
    };
    onChange([...value, newBlock]);
  };

  const handleRemoveLicenseType = (index: number) => {
    const newBlocks = value.filter((_, i) => i !== index);
    onChange(newBlocks);
  };

  const handleLicenseTypeChange = (index: number, licenseTypeId: string) => {
    const newBlocks = [...value];
    newBlocks[index] = {
      ...newBlocks[index],
      license_type_id: licenseTypeId
    };
    onChange(newBlocks);
  };

  const handleAddDocument = (blockIndex: number) => {
    const newBlocks = [...value];
    newBlocks[blockIndex].documents.push({
      template_id: '',
      is_required: false
    });
    onChange(newBlocks);
  };

  const handleRemoveDocument = (blockIndex: number, docIndex: number) => {
    const newBlocks = [...value];
    newBlocks[blockIndex].documents = newBlocks[blockIndex].documents.filter((_, i) => i !== docIndex);
    onChange(newBlocks);
  };

  const handleDocumentChange = (blockIndex: number, docIndex: number, field: keyof DocumentItem, fieldValue: any) => {
    const newBlocks = [...value];
    newBlocks[blockIndex].documents[docIndex] = {
      ...newBlocks[blockIndex].documents[docIndex],
      [field]: fieldValue
    };
    onChange(newBlocks);
  };

  const getAvailableLicenseTypes = (currentLicenseTypeId?: string) => {
    const selectedIds = value
      .map(block => block.license_type_id)
      .filter(id => id && id !== currentLicenseTypeId);

    return licenseTypes.filter(lt =>
      !selectedIds.includes(lt.id) || lt.id === currentLicenseTypeId
    );
  };

  const getAvailableDocuments = (blockIndex: number, currentDocId?: string) => {
    const block = value[blockIndex];
    const selectedIds = block.documents
      .map(doc => doc.template_id)
      .filter(id => id && id !== currentDocId);

    return documentTemplates.filter(dt =>
      !selectedIds.includes(dt.id) || dt.id === currentDocId
    );
  };

  const getLicenseTypeName = (licenseTypeId: string) => {
    const lt = licenseTypes.find(l => l.id === licenseTypeId);
    return lt ? `${lt.abbreviation} - ${lt.name}` : '';
  };

  const getDocumentName = (docId: string) => {
    const doc = documentTemplates.find(d => d.id === docId);
    return doc?.name || '';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Tipos de Licença Aplicáveis <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={handleAddLicenseType}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar Tipo de Licença
        </button>
      </div>

      {value.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">Nenhum tipo de licença adicionado</p>
          <p className="text-sm text-gray-500">
            Clique em "Adicionar Tipo de Licença" para começar
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {value.map((block, blockIndex) => {
            const availableLicenseTypes = getAvailableLicenseTypes(block.license_type_id);
            const hasLicenseTypeError = !block.license_type_id;

            return (
              <div
                key={blockIndex}
                className={`border-2 rounded-lg p-4 ${
                  hasLicenseTypeError ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                }`}
              >
                {/* Header - Tipo de Licença */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Licença <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={block.license_type_id}
                      onChange={(e) => handleLicenseTypeChange(blockIndex, e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        hasLicenseTypeError ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Selecione o tipo de licença...</option>
                      {availableLicenseTypes.map(lt => (
                        <option key={lt.id} value={lt.id}>
                          {lt.abbreviation} - {lt.name}
                        </option>
                      ))}
                    </select>
                    {hasLicenseTypeError && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Selecione um tipo de licença
                      </p>
                    )}
                  </div>

                  {/* Botão Remover Tipo de Licença */}
                  <button
                    type="button"
                    onClick={() => handleRemoveLicenseType(blockIndex)}
                    className="flex-shrink-0 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors mt-7"
                    title="Remover tipo de licença"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Documentos Exigidos */}
                <div className="ml-4 pl-4 border-l-2 border-gray-300">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-600">
                      Documentos Exigidos
                    </label>
                    <button
                      type="button"
                      onClick={() => handleAddDocument(blockIndex)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      disabled={!block.license_type_id}
                    >
                      <Plus className="w-3 h-3" />
                      Adicionar Documento
                    </button>
                  </div>

                  {block.documents.length === 0 ? (
                    <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
                      <p className="text-sm text-gray-500">Nenhum documento adicionado</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {block.documents.map((doc, docIndex) => {
                        const availableDocs = getAvailableDocuments(blockIndex, doc.template_id);
                        const hasDocError = !doc.template_id;

                        return (
                          <div
                            key={docIndex}
                            className={`border rounded-lg p-3 bg-gray-50 ${
                              hasDocError ? 'border-red-300' : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <div className="flex-1 space-y-2">
                                {/* Seletor de Documento */}
                                <select
                                  value={doc.template_id}
                                  onChange={(e) => handleDocumentChange(blockIndex, docIndex, 'template_id', e.target.value)}
                                  className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-sm ${
                                    hasDocError ? 'border-red-300' : 'border-gray-300'
                                  }`}
                                >
                                  <option value="">Selecione o documento...</option>
                                  {availableDocs.map(dt => (
                                    <option key={dt.id} value={dt.id}>
                                      {dt.name}
                                    </option>
                                  ))}
                                </select>

                                {/* Checkbox Obrigatório */}
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id={`required-${blockIndex}-${docIndex}`}
                                    checked={doc.is_required}
                                    onChange={(e) => handleDocumentChange(blockIndex, docIndex, 'is_required', e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <label
                                    htmlFor={`required-${blockIndex}-${docIndex}`}
                                    className="text-xs text-gray-700 cursor-pointer select-none"
                                  >
                                    Documento obrigatório
                                  </label>
                                  {doc.is_required && (
                                    <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">
                                      Obrigatório
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Botão Remover Documento */}
                              <button
                                type="button"
                                onClick={() => handleRemoveDocument(blockIndex, docIndex)}
                                className="flex-shrink-0 p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Remover documento"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Resumo do Bloco */}
                {block.license_type_id && block.documents.length > 0 && (
                  <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-2">
                    <p className="text-xs text-blue-700">
                      {block.documents.length} documento(s) • {' '}
                      {block.documents.filter(d => d.is_required).length} obrigatório(s)
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Resumo Geral */}
      {value.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                {value.length} {value.length === 1 ? 'tipo de licença configurado' : 'tipos de licença configurados'}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Total de documentos: {value.reduce((sum, block) => sum + block.documents.length, 0)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
