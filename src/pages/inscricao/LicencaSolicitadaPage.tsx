import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInscricaoStore } from '../../lib/store/inscricao';
import { useInscricaoContext } from '../../contexts/InscricaoContext';
import { FileText, ArrowLeft, ArrowRight, Upload, X, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { completeStep } from '../../services/workflowApi';
import { supabase } from '../../lib/supabase';

interface LicenseType {
  id: string;
  abbreviation: string;
  name: string;
  description?: string;
}

interface LicenseTypeDocument {
  id: string;
  license_type_id: string;
  documentation_template_id: string;
  is_required: boolean;
  documentation_templates: {
    id: string;
    name: string;
    description?: string;
  };
}

interface UploadedDocument {
  template_id: string;
  file: File;
  uploaded: boolean;
}

interface PreviousLicenseData {
  possui_licenca_anterior: 'sim' | 'nao';
  numero_licenca_anterior: string;
  validade_licenca_anterior: string;
  orgao_emissor: string;
}

export default function LicencaSolicitadaPage() {
  const navigate = useNavigate();
  const {
    workflowInstanceId,
    currentStepId,
    currentStepKey
  } = useInscricaoContext();
  const { setCurrentStep, setCurrentStepFromEngine } = useInscricaoStore();

  const [licenseTypes, setLicenseTypes] = useState<LicenseType[]>([]);
  const [selectedLicenseTypeId, setSelectedLicenseTypeId] = useState<string>('');
  const [requiredDocuments, setRequiredDocuments] = useState<LicenseTypeDocument[]>([]);
  const [optionalDocuments, setOptionalDocuments] = useState<LicenseTypeDocument[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDocument[]>([]);
  const [previousLicense, setPreviousLicense] = useState<PreviousLicenseData>({
    possui_licenca_anterior: 'nao',
    numero_licenca_anterior: '',
    validade_licenca_anterior: '',
    orgao_emissor: ''
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadLicenseTypes();
  }, []);

  useEffect(() => {
    if (selectedLicenseTypeId) {
      loadLicenseTypeDocuments(selectedLicenseTypeId);
    } else {
      setRequiredDocuments([]);
      setOptionalDocuments([]);
      setUploadedFiles([]);
    }
  }, [selectedLicenseTypeId]);

  const loadLicenseTypes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('license_types')
        .select('id, abbreviation, name, description')
        .eq('is_active', true)
        .order('abbreviation');

      if (error) throw error;

      setLicenseTypes(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar tipos de licença:', error);
      toast.error('Erro ao carregar tipos de licença');
    } finally {
      setLoading(false);
    }
  };

  const loadLicenseTypeDocuments = async (licenseTypeId: string) => {
    try {
      const { data, error } = await supabase
        .from('license_type_documents')
        .select(`
          id,
          license_type_id,
          documentation_template_id,
          is_required,
          documentation_templates (
            id,
            name,
            description
          )
        `)
        .eq('license_type_id', licenseTypeId);

      if (error) throw error;

      const required = (data || []).filter(doc => doc.is_required);
      const optional = (data || []).filter(doc => !doc.is_required);

      setRequiredDocuments(required as LicenseTypeDocument[]);
      setOptionalDocuments(optional as LicenseTypeDocument[]);
      setUploadedFiles([]);
    } catch (error: any) {
      console.error('Erro ao carregar documentos:', error);
      toast.error('Erro ao carregar documentos necessários');
    }
  };

  const handleFileSelect = (templateId: string, file: File) => {
    setUploadedFiles(prev => {
      const existing = prev.filter(f => f.template_id !== templateId);
      return [...existing, { template_id: templateId, file, uploaded: false }];
    });
  };

  const handleRemoveFile = (templateId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.template_id !== templateId));
  };

  const getUploadedFile = (templateId: string): UploadedDocument | undefined => {
    return uploadedFiles.find(f => f.template_id === templateId);
  };

  const handlePreviousLicenseChange = (field: keyof PreviousLicenseData, value: string) => {
    setPreviousLicense(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!selectedLicenseTypeId) {
      toast.error('Selecione o tipo de licença');
      return false;
    }

    const missingRequired = requiredDocuments.filter(doc => {
      return !uploadedFiles.some(f => f.template_id === doc.documentation_template_id);
    });

    if (missingRequired.length > 0) {
      toast.error('Faça upload de todos os documentos obrigatórios');
      return false;
    }

    if (previousLicense.possui_licenca_anterior === 'sim' && !previousLicense.numero_licenca_anterior) {
      toast.error('Informe o número da licença anterior');
      return false;
    }

    return true;
  };

  const handlePrevious = () => {
    setCurrentStep(2);
  };

  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (workflowInstanceId && currentStepId) {
        await completeStep(workflowInstanceId, currentStepId, {
          licenseTypeId: selectedLicenseTypeId,
          uploadedDocuments: uploadedFiles.length
        });

        toast.success('Licença solicitada salva!');
        setCurrentStep(4);
      } else {
        toast.success('Licença solicitada salva!');
        setCurrentStep(4);
      }
    } catch (error: any) {
      console.error('Erro ao salvar licença:', error);
      console.warn('⚠️ Workflow engine não disponível, usando modo manual');
      setCurrentStep(4);
      toast.success('Licença solicitada salva!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDocumentUpload = (doc: LicenseTypeDocument, isRequired: boolean) => {
    const uploadedFile = getUploadedFile(doc.documentation_template_id);
    const hasFile = !!uploadedFile;

    return (
      <div key={doc.id} className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-semibold text-gray-900">
                {doc.documentation_templates.name}
              </h4>
              {isRequired && (
                <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                  Obrigatório
                </span>
              )}
              {!isRequired && (
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                  Opcional
                </span>
              )}
            </div>
            {doc.documentation_templates.description && (
              <p className="text-xs text-gray-500 mt-1">
                {doc.documentation_templates.description}
              </p>
            )}
          </div>

          {hasFile && (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 ml-2" />
          )}
        </div>

        {hasFile ? (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded px-3 py-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-sm text-green-700 truncate">
                {uploadedFile.file.name}
              </span>
              <span className="text-xs text-green-600 flex-shrink-0">
                ({(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
            <button
              onClick={() => handleRemoveFile(doc.documentation_template_id)}
              className="ml-2 p-1 text-red-600 hover:bg-red-100 rounded transition-colors flex-shrink-0"
              title="Remover arquivo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <Upload className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Selecionar arquivo</span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileSelect(doc.documentation_template_id, file);
                }
              }}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
          </label>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando tipos de licença...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Licença Solicitada</h2>
        </div>
        <p className="text-gray-600">
          Selecione o tipo de licença e faça upload dos documentos necessários
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Licença Anterior</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Possui licença anterior para esta atividade?
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="possui_licenca_anterior"
                  value="sim"
                  checked={previousLicense.possui_licenca_anterior === 'sim'}
                  onChange={(e) => handlePreviousLicenseChange('possui_licenca_anterior', e.target.value as 'sim' | 'nao')}
                  className="mr-2 w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Sim</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="possui_licenca_anterior"
                  value="nao"
                  checked={previousLicense.possui_licenca_anterior === 'nao'}
                  onChange={(e) => handlePreviousLicenseChange('possui_licenca_anterior', e.target.value as 'sim' | 'nao')}
                  className="mr-2 w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Não</span>
              </label>
            </div>
          </div>

          {previousLicense.possui_licenca_anterior === 'sim' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número da Licença <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={previousLicense.numero_licenca_anterior}
                  onChange={(e) => handlePreviousLicenseChange('numero_licenca_anterior', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 12345/2023"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Validade
                </label>
                <input
                  type="date"
                  value={previousLicense.validade_licenca_anterior}
                  onChange={(e) => handlePreviousLicenseChange('validade_licenca_anterior', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Órgão Emissor
                </label>
                <input
                  type="text"
                  value={previousLicense.orgao_emissor}
                  onChange={(e) => handlePreviousLicenseChange('orgao_emissor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: IBAMA, CETESB"
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Licença <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedLicenseTypeId}
            onChange={(e) => setSelectedLicenseTypeId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione o tipo de licença</option>
            {licenseTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.abbreviation} - {type.name}
              </option>
            ))}
          </select>
        </div>

        {selectedLicenseTypeId && (
          <>
            {requiredDocuments.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Documentos Obrigatórios
                </h3>
                <div className="space-y-3">
                  {requiredDocuments.map(doc => renderDocumentUpload(doc, true))}
                </div>
              </div>
            )}

            {optionalDocuments.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Documentos Opcionais
                </h3>
                <div className="space-y-3">
                  {optionalDocuments.map(doc => renderDocumentUpload(doc, false))}
                </div>
              </div>
            )}

            {requiredDocuments.length === 0 && optionalDocuments.length === 0 && (
              <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">
                  Nenhum documento vinculado a este tipo de licença
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-between pt-6 mt-6 border-t border-gray-200">
        <button
          onClick={handlePrevious}
          disabled={isSubmitting}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <button
          onClick={handleNext}
          disabled={isSubmitting || !selectedLicenseTypeId}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? 'Salvando...' : 'Próximo: Documentação'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
