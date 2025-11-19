import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { X, Save, Activity, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import * as activityLicenseService from '../../services/activityLicenseService';

interface ActivityFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  item?: any;
  onSave: () => void;
}

interface LicenseType {
  id: string;
  abbreviation: string;
  name: string;
}

interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
}

interface EnterpriseSize {
  id: string;
  name: string;
}

interface PollutionPotential {
  id: string;
  name: string;
}

export default function ActivityForm({
  isOpen,
  onClose,
  title,
  item,
  onSave
}: ActivityFormProps) {
  const [formData, setFormData] = useState<any>({
    code: '',
    name: '',
    description: '',
    pollution_potential_id: '',
    measurement_unit: '',
    license_types: [],
    documents: [],
    ranges: [{
      enterprise_size_id: '',
      range_name: 'Porte 1',
      range_start: null,
      range_end: null
    }]
  });

  const [enterpriseSizeRangesCounter, setEnterpriseSizeRangesCounter] = useState(1);
  
  const [loading, setLoading] = useState(false);
  const [licenseTypes, setLicenseTypes] = useState<LicenseType[]>([]);
  const [documentTemplates, setDocumentTemplates] = useState<DocumentTemplate[]>([]);
  const [enterpriseSizes, setEnterpriseSizes] = useState<EnterpriseSize[]>([]);
  const [pollutionPotentials, setPollutionPotentials] = useState<PollutionPotential[]>([]);

  const measurementUnits = [
    'Unidade',
    'Hectare (ha)',
    'Metro quadrado (m²)',
    'Metro cúbico (m³)',
    'Litro (L)',
    'Quilograma (kg)',
    'Tonelada (t)',
    'Megawatt (MW)',
    'Quilowatt (kW)',
    'Cabeças (animais)',
    'Metros lineares (m)',
    'Quilômetros (km)'
  ];

  useEffect(() => {
    if (isOpen) {
      loadDropdownData();
      loadEnterpriseSizes();
    }
  }, [isOpen]);

  useEffect(() => {
    if (item) {
      setFormData({
        code: item.code?.toString() || '',
        name: item.name || '',
        description: item.description || '',
        pollution_potential_id: item.pollution_potential_id || '',
        measurement_unit: item.measurement_unit || '',
        license_types: [],
        documents: [],
        ranges: [{
          enterprise_size_id: '',
          range_name: 'Porte 1',
          range_start: null,
          range_end: null
        }]
      });

      if (item.id) {
        loadActivityRelationships(item.id);
      }
    } else {
      setFormData({
        code: '',
        name: '',
        description: '',
        pollution_potential_id: '',
        measurement_unit: '',
        license_types: [],
        documents: [],
        ranges: [{
          enterprise_size_id: '',
          range_name: 'Porte 1',
          range_start: null,
          range_end: null
        }]
      });
      setEnterpriseSizeRangesCounter(1);
    }
  }, [item]);

  const loadEnterpriseSizes = async () => {
    try {
      // Tentar carregar da API primeiro
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      console.log('🔍 Carregando portes da API:', `${apiUrl}/enterprise-sizes`);
      
      const response = await fetch(`${apiUrl}/enterprise-sizes`);
      if (response.ok) {
        const portes = await response.json();
        console.log('✅ Portes carregados da API:', portes);
        setEnterpriseSizes(portes);
      } else {
        throw new Error(`API retornou status ${response.status}`);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar portes da API, usando Supabase como fallback:', error);
      
      // Fallback: Carregar do Supabase
      try {
        const { data: enterpriseSizesData, error: enterpriseSizesError } = await supabase
          .from('enterprise_sizes')
          .select('id, name')
          .eq('is_active', true)
          .order('name');

        if (enterpriseSizesError) throw enterpriseSizesError;
        console.log('✅ Portes carregados do Supabase:', enterpriseSizesData);
        setEnterpriseSizes(enterpriseSizesData || []);
      } catch (supabaseError) {
        console.error('❌ Erro ao carregar portes do Supabase:', supabaseError);
        toast.error('Erro ao carregar portes do empreendimento');
      }
    }
  };

  const loadDropdownData = async () => {
    try {
      // Carregar dados em paralelo usando API REST
      const [licenseTypesData, documentsData] = await Promise.all([
        activityLicenseService.getLicenseTypes(),
        activityLicenseService.getDocumentTemplates(),
      ]);

      setLicenseTypes(licenseTypesData || []);
      setDocumentTemplates(documentsData || []);

      // Load pollution potentials (manter Supabase por enquanto)
      const { data: pollutionPotentialsData, error: pollutionPotentialsError } = await supabase
        .from('pollution_potentials')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (pollutionPotentialsError) throw pollutionPotentialsError;
      setPollutionPotentials(pollutionPotentialsData || []);

    } catch (error) {
      console.error('Error loading dropdown data:', error);
      toast.error('Erro ao carregar dados: ' + (error as Error).message);
    }
  };

  const loadActivityRelationships = async (activityId: string) => {
    try {
      // Usar endpoint combinado da API REST para carregar tudo de uma vez
      const config = await activityLicenseService.getActivityLicenseConfig(activityId);

      // Transformar dados da API para o formato esperado pelo formulário
      const licenseTypes = config.license_types.map(lt => ({
        license_type_id: lt.license_type_id,
        is_required: lt.is_required
      }));

      const documents = config.documents.map(doc => ({
        template_id: doc.template_id,
        is_required: doc.is_required
      }));

      // Load ranges from API
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      const rangesResponse = await fetch(`${apiUrl}/activities/${activityId}/ranges`);
      let ranges = [];
      
      if (rangesResponse.ok) {
        ranges = await rangesResponse.json();
      }

      // Se não houver ranges, inicializar com uma faixa vazia
      if (ranges.length === 0) {
        ranges = [{
          enterprise_size_id: '',
          range_name: 'Porte 1',
          range_start: null,
          range_end: null
        }];
      }

      setFormData(prev => ({
        ...prev,
        license_types: licenseTypes,
        documents: documents,
        ranges: ranges
      }));

      // Atualizar contador baseado no número de ranges carregados
      setEnterpriseSizeRangesCounter(ranges.length);

    } catch (error) {
      console.error('Error loading activity relationships:', error);
      toast.error('Erro ao carregar dados da atividade');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddEnterpriseSizeRange = () => {
    const newCounter = enterpriseSizeRangesCounter + 1;
    setEnterpriseSizeRangesCounter(newCounter);
    
    setFormData((prev: any) => ({
      ...prev,
      ranges: [...prev.ranges, {
        enterprise_size_id: '',
        range_name: `Porte ${newCounter}`,
        range_start: null,
        range_end: null
      }]
    }));
  };

  const handleRemoveEnterpriseSizeRange = (index: number) => {
    if (formData.ranges.length === 1) {
      toast.warning('Deve haver pelo menos um porte configurado');
      return;
    }
    
    setFormData((prev: any) => ({
      ...prev,
      ranges: prev.ranges.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleEnterpriseSizeRangeChange = (index: number, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      ranges: prev.ranges.map((range: any, i: number) =>
        i === index ? { ...range, [field]: value } : range
      )
    }));
  };

  const validateRanges = (): boolean => {
    for (const range of formData.ranges) {
      if (range.range_start !== null && range.range_end !== null) {
        const start = parseFloat(range.range_start);
        const end = parseFloat(range.range_end);
        if (end < start) {
          toast.error('Faixa final não pode ser menor que a faixa inicial');
          return false;
        }
      }
    }
    return true;
  };

  const handleLicenseTypeToggle = (licenseTypeId: string) => {
    setFormData(prev => {
      const existingIndex = prev.license_types.findIndex(
        (lt: any) => lt.license_type_id === licenseTypeId
      );
      
      if (existingIndex >= 0) {
        // Remove if exists
        return {
          ...prev,
          license_types: prev.license_types.filter(
            (lt: any) => lt.license_type_id !== licenseTypeId
          )
        };
      } else {
        // Add if doesn't exist
        return {
          ...prev,
          license_types: [
            ...prev.license_types,
            { license_type_id: licenseTypeId, is_required: true }
          ]
        };
      }
    });
  };

  const handleDocumentToggle = (documentId: string) => {
    setFormData(prev => {
      const existingIndex = prev.documents.findIndex(
        (doc: any) => doc.template_id === documentId
      );
      
      if (existingIndex >= 0) {
        // Remove if exists
        return {
          ...prev,
          documents: prev.documents.filter(
            (doc: any) => doc.template_id !== documentId
          )
        };
      } else {
        // Add if doesn't exist
        return {
          ...prev,
          documents: [
            ...prev.documents,
            { template_id: documentId, is_required: true }
          ]
        };
      }
    });
  };

  const handleDocumentRequiredToggle = (documentId: string) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.map((doc: any) =>
        doc.template_id === documentId
          ? { ...doc, is_required: !doc.is_required }
          : doc
      )
    }));
  };

  const validateForm = () => {
    if (!formData.code) {
      toast.error('Código da atividade é obrigatório');
      return false;
    }
    if (!formData.name) {
      toast.error('Nome da atividade é obrigatório');
      return false;
    }
    if (formData.license_types.length === 0) {
      toast.error('Selecione pelo menos um tipo de licença');
      return false;
    }
    if (!formData.pollution_potential_id) {
      toast.error('Selecione o potencial poluidor');
      return false;
    }

    // Validar portes/faixas
    const hasValidRange = formData.ranges.some((range: any) => range.enterprise_size_id);
    if (!hasValidRange) {
      toast.error('Configure pelo menos um porte do empreendimento');
      return false;
    }

    if (!validateRanges()) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const activityData = {
        code: parseFloat(formData.code),
        name: formData.name,
        description: formData.description || null,
        pollution_potential_id: formData.pollution_potential_id,
        measurement_unit: formData.measurement_unit || null
      };

      let activityId: string;
      const apiUrl = import.meta.env.VITE_API_BASE_URL;

      if (item?.id) {
        // Update existing activity
        const { data, error } = await supabase
          .from('activities')
          .update(activityData)
          .eq('id', item.id)
          .select()
          .single();
        
        if (error) {
          if (error.code === '23505') {
            throw new Error('Já existe uma atividade com este código ou nome.');
          }
          throw error;
        }
        
        activityId = data.id;
        toast.success('Atividade atualizada com sucesso!');
      } else {
        // Create new activity
        const { data, error } = await supabase
          .from('activities')
          .insert(activityData)
          .select()
          .single();
        
        if (error) {
          if (error.code === '23505') {
            throw new Error('Já existe uma atividade com este código ou nome.');
          }
          throw error;
        }
        
        activityId = data.id;
        toast.success('Atividade criada com sucesso!');
      }

      // Salvar faixas usando endpoint /bulk com fallback para Supabase
      console.log('📤 Enviando ranges para API:', formData.ranges);
      
      try {
        const rangesPayload = { 
          activity_id: activityId,
          ranges: formData.ranges 
        };
        console.log('📦 Payload completo:', JSON.stringify(rangesPayload, null, 2));
        
        const rangesResponse = await fetch(`${apiUrl}/activities/${activityId}/ranges/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rangesPayload)
        });

        if (!rangesResponse.ok) {
          throw new Error(`API falhou com status ${rangesResponse.status}`);
        }
        
        console.log('✅ Ranges salvos na API com sucesso');
      } catch (apiError) {
        console.warn('⚠️ Erro ao salvar ranges na API, usando Supabase como fallback:', apiError);
        
        // Fallback: salvar diretamente no Supabase
        // Primeiro, deletar ranges existentes
        await supabase
          .from('activity_enterprise_size_ranges')
          .delete()
          .eq('activity_id', activityId);
        
        // Inserir novos ranges
        if (formData.ranges.length > 0) {
          const rangesForSupabase = formData.ranges.map((range: any) => ({
            activity_id: activityId,
            enterprise_size_id: range.enterprise_size_id,
            range_name: range.range_name,
            range_start: range.range_start,
            range_end: range.range_end
          }));
          
          const { error: rangesError } = await supabase
            .from('activity_enterprise_size_ranges')
            .insert(rangesForSupabase);
          
          if (rangesError) {
            throw new Error(`Erro ao salvar ranges no Supabase: ${rangesError.message}`);
          }
          
          console.log('✅ Ranges salvos no Supabase com sucesso');
        }
      }

      // Salvar tipos de licença usando API REST com bulk operation
      try {
        // Primeiro, deletar relacionamentos existentes via Supabase
        // (A API ainda não tem endpoint para limpar tudo)
        await supabase
          .from('activity_license_types')
          .delete()
          .eq('activity_id', activityId);

        // Depois, adicionar novos usando bulk API
        if (formData.license_types.length > 0) {
          const licenseTypesToAdd = formData.license_types.map((lt: any) => ({
            license_type_id: lt.license_type_id,
            is_required: lt.is_required
          }));

          await activityLicenseService.addLicenseTypesBulk(activityId, licenseTypesToAdd);
          console.log('✅ Tipos de licença salvos via API REST');
        }
      } catch (apiError) {
        console.error('❌ Erro ao salvar tipos de licença via API:', apiError);
        throw apiError;
      }

      // Salvar documentos usando API REST com bulk operation
      try {
        // Primeiro, deletar relacionamentos existentes via Supabase
        await supabase
          .from('activity_documents')
          .delete()
          .eq('activity_id', activityId);

        // Depois, adicionar novos usando bulk API
        if (formData.documents.length > 0) {
          const documentsToAdd = formData.documents.map((doc: any) => ({
            template_id: doc.template_id,
            is_required: doc.is_required
          }));

          await activityLicenseService.addDocumentsBulk(activityId, documentsToAdd);
          console.log('✅ Documentos salvos via API REST');
        }
      } catch (apiError) {
        console.error('❌ Erro ao salvar documentos via API:', apiError);
        throw apiError;
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving activity:', error);
      const errorMessage = error instanceof Error ? error.message : 
                          typeof error === 'string' ? error : 
                          JSON.stringify(error);
      toast.error('Erro ao salvar atividade: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código da Atividade <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: 1.1, 1.56, 2.3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Atividade <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Extração de areia"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Descrição detalhada da atividade"
            />
          </div>

          {/* Classification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidade de Medida
              </label>
              <select
                value={formData.measurement_unit}
                onChange={(e) => handleInputChange('measurement_unit', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione a unidade...</option>
                {measurementUnits.map(unit => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Potencial Poluidor <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.pollution_potential_id}
                onChange={(e) => handleInputChange('pollution_potential_id', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecione o potencial...</option>
                {pollutionPotentials.map(potential => (
                  <option key={potential.id} value={potential.id}>
                    {potential.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Enterprise Size Ranges - Repeatable Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Configuração de Porte e Faixas <span className="text-red-500">*</span>
              </label>
            </div>

            {formData.ranges.map((range: any, index: number) => (
              <div key={index} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    {range.range_name}
                  </span>
                  {formData.ranges.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEnterpriseSizeRange(index)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Remover porte"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Porte do Empreendimento <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={range.enterprise_size_id}
                      onChange={(e) => handleEnterpriseSizeRangeChange(index, 'enterprise_size_id', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      required
                    >
                      <option value="">Selecione o porte...</option>
                      {enterpriseSizes.map(size => (
                        <option key={size.id} value={size.id}>
                          {size.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Faixa Inicial
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={range.range_start || ''}
                      onChange={(e) => handleEnterpriseSizeRangeChange(index, 'range_start', e.target.value ? parseFloat(e.target.value) : null)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Ex: 0"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Faixa Final
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={range.range_end || ''}
                      onChange={(e) => handleEnterpriseSizeRangeChange(index, 'range_end', e.target.value ? parseFloat(e.target.value) : null)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Ex: 1000"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddEnterpriseSizeRange}
              className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar outro porte
            </button>
          </div>

          {/* License Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipos de Licença Aplicáveis <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {licenseTypes.map(licenseType => {
                const isSelected = formData.license_types.some(
                  (lt: any) => lt.license_type_id === licenseType.id
                );
                return (
                  <label
                    key={licenseType.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleLicenseTypeToggle(licenseType.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">
                        {licenseType.abbreviation}
                      </span>
                      <p className="text-xs text-gray-500">{licenseType.name}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Documents */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Documentos Exigidos
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {documentTemplates.map(document => {
                const selectedDoc = formData.documents.find(
                  (doc: any) => doc.template_id === document.id
                );
                const isSelected = !!selectedDoc;
                
                return (
                  <div
                    key={document.id}
                    className={`flex items-center justify-between p-3 border rounded-lg ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <label className="flex items-center cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleDocumentToggle(document.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-3 flex-1">
                        <span className="text-sm font-medium text-gray-900">
                          {document.name}
                        </span>
                        <p className="text-xs text-gray-500">{document.description}</p>
                      </div>
                    </label>
                    
                    {isSelected && (
                      <label className="flex items-center ml-3">
                        <input
                          type="checkbox"
                          checked={selectedDoc.is_required}
                          onChange={() => handleDocumentRequiredToggle(document.id)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="ml-2 text-xs text-red-600 font-medium">
                          Obrigatório
                        </span>
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">Atenção</h4>
                <p className="text-sm text-yellow-800 mt-1">
                  Não é permitido criar atividades com código ou nome duplicados. 
                  Certifique-se de selecionar pelo menos um tipo de licença aplicável.
                </p>
              </div>
            </div>
          </div>
        </form>

      {/* Footer */}
      <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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