import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AdminService, LicenseType, LicenseTypeDocument } from '../../services/adminService';
import LicenseTypeDocumentsRepeater from './LicenseTypeDocumentsRepeater';

interface LicenseTypeFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  item?: LicenseType | null;
  onSave: () => void;
}

interface FormData {
  abbreviation: string;
  name: string;
  validity_period: number | string;
  time_unit: 'meses' | 'anos' | '';
  description: string;
  depends_on_license_type_id: string;
}

interface DocumentItem {
  documentation_template_id: string;
  is_required: boolean;
  tempId?: string;
}

export default function LicenseTypeForm({
  isOpen,
  onClose,
  title,
  item,
  onSave
}: LicenseTypeFormProps) {
  const [formData, setFormData] = useState<FormData>({
    abbreviation: '',
    name: '',
    validity_period: '',
    time_unit: '',
    description: ''
  });
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [availableLicenseTypes, setAvailableLicenseTypes] = useState<LicenseType[]>([]);

  useEffect(() => {
    loadAvailableLicenseTypes();

    if (item) {
      setFormData({
        abbreviation: item.abbreviation || '',
        name: item.name || '',
        validity_period: item.validity_period || '',
        time_unit: item.time_unit || '',
        description: item.description || '',
        depends_on_license_type_id: item.depends_on_license_type_id || ''
      });

      // Load existing documents for this license type
      if (item.id) {
        loadLicenseTypeDocuments(item.id);
      }
    } else {
      setFormData({
        abbreviation: '',
        name: '',
        validity_period: '',
        time_unit: '',
        description: '',
        depends_on_license_type_id: ''
      });
      setDocuments([]);
    }
  }, [item]);

  const loadAvailableLicenseTypes = async () => {
    try {
      const types = await AdminService.getAll<LicenseType>('license_types', true);
      setAvailableLicenseTypes(types);
    } catch (error) {
      console.error('Error loading license types:', error);
      toast.error('Erro ao carregar tipos de licença');
    }
  };

  const loadLicenseTypeDocuments = async (licenseTypeId: string) => {
    try {
      setLoadingDocuments(true);
      const docs = await AdminService.getLicenseTypeDocuments(licenseTypeId);

      const docItems: DocumentItem[] = docs.map(doc => ({
        documentation_template_id: doc.documentation_template_id,
        is_required: doc.is_required
      }));

      setDocuments(docItems);
    } catch (error: any) {
      console.warn('Warning: Could not load documents (table may not exist):', error);
      // If table doesn't exist, just set empty array - don't show error to user
      if (error.code === 'PGRST205' || error.code === '42P01') {
        setDocuments([]);
      } else {
        toast.error('Erro ao carregar documentos do tipo de licença');
      }
    } finally {
      setLoadingDocuments(false);
    }
  };

  if (!isOpen) return null;

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.abbreviation.trim()) {
      toast.error('Sigla/Abreviação é obrigatória');
      return false;
    }
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return false;
    }
    if (!formData.validity_period || Number(formData.validity_period) <= 0) {
      toast.error('Prazo de validade deve ser maior que zero');
      return false;
    }
    if (!formData.time_unit) {
      toast.error('Unidade de tempo é obrigatória');
      return false;
    }

    // Validate documents
    const hasEmptyDocuments = documents.some(doc => !doc.documentation_template_id);
    if (hasEmptyDocuments) {
      toast.error('Todos os documentos devem ter um tipo selecionado');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const dataToSave = {
        abbreviation: formData.abbreviation.trim(),
        name: formData.name.trim(),
        validity_period: Number(formData.validity_period),
        time_unit: formData.time_unit,
        description: formData.description.trim(),
        depends_on_license_type_id: formData.depends_on_license_type_id || null
      };

      let licenseTypeId: string;

      if (item?.id) {
        // Update existing license type
        const { data, error } = await supabase
          .from('license_types')
          .update(dataToSave)
          .eq('id', item.id)
          .select()
          .single();

        if (error) throw error;
        licenseTypeId = item.id;
      } else {
        // Create new license type
        const { data, error } = await supabase
          .from('license_types')
          .insert(dataToSave)
          .select()
          .single();

        if (error) throw error;
        licenseTypeId = data.id;
      }

      // Update documents relationships
      const validDocuments = documents.filter(doc => doc.documentation_template_id);
      if (validDocuments.length > 0) {
        try {
          await AdminService.updateLicenseTypeDocuments(licenseTypeId, validDocuments);
        } catch (docError: any) {
          console.warn('Warning: Could not save documents (table may not exist):', docError);
          // Don't fail the entire operation if documents can't be saved
        }
      }

      toast.success(item?.id ? 'Tipo de licença atualizado com sucesso!' : 'Tipo de licença criado com sucesso!');
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving license type:', error);

      if (error.code === '23505') {
        toast.error('Já existe um tipo de licença com esta sigla ou nome');
      } else {
        toast.error('Erro ao salvar tipo de licença: ' + (error.message || 'Erro desconhecido'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Sigla/Abreviação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sigla/Abreviação
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.abbreviation}
                onChange={(e) => handleInputChange('abbreviation', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: LP, LI, LO"
                required
              />
            </div>

            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo da Licença
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Licença Prévia"
                required
              />
            </div>

            {/* Prazo de Validade e Unidade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prazo de Validade
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="number"
                  value={formData.validity_period}
                  onChange={(e) => handleInputChange('validity_period', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 5"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidade de Tempo
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  value={formData.time_unit}
                  onChange={(e) => handleInputChange('time_unit', e.target.value as 'meses' | 'anos')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="meses">Meses</option>
                  <option value="anos">Anos</option>
                </select>
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descrição detalhada do tipo de licença"
                rows={4}
              />
            </div>

            {/* Dependência de Licença */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Depende de outro tipo de licença
                <span className="text-gray-500 text-xs ml-2">(Opcional)</span>
              </label>
              <select
                value={formData.depends_on_license_type_id}
                onChange={(e) => handleInputChange('depends_on_license_type_id', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Nenhuma dependência</option>
                {availableLicenseTypes
                  .filter(type => type.id !== item?.id)
                  .map(type => (
                    <option key={type.id} value={type.id}>
                      {type.abbreviation} - {type.name}
                    </option>
                  ))}
              </select>
              <p className="mt-2 text-sm text-gray-500">
                Selecione um tipo de licença que deve ser obtido antes deste.
                Exemplo: "Licença de Instalação" pode depender de "Licença Prévia".
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-6" />

            {/* Documents Repeater */}
            {loadingDocuments ? (
              <div className="flex items-center justify-center p-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-gray-600">Carregando documentos...</span>
              </div>
            ) : (
              <LicenseTypeDocumentsRepeater
                licenseTypeId={item?.id}
                value={documents}
                onChange={setDocuments}
              />
            )}
      </form>

      {/* Footer */}
      <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  );
}
