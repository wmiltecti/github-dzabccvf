import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInscricaoStore } from '../../lib/store/inscricao';
import { useInscricaoContext } from '../../contexts/InscricaoContext';
import { FileText, ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import { completeStep } from '../../services/workflowApi';

export default function LicencaSolicitadaPage() {
  const navigate = useNavigate();
  const { 
    workflowInstanceId,
    currentStepId,
    currentStepKey
  } = useInscricaoContext();
  const { setCurrentStep, setCurrentStepFromEngine } = useInscricaoStore();
  
  const [formData, setFormData] = useState({
    tipo_licenca: '',
    descricao_atividade: '',
    area_total: '',
    capacidade_producao: '',
    numero_funcionarios: '',
    horario_funcionamento: '',
    possui_licenca_anterior: 'nao',
    numero_licenca_anterior: '',
    validade_licenca_anterior: '',
    orgao_emissor: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tiposLicenca = [
    { value: '', label: 'Selecione o tipo de licença' },
    { value: 'LP', label: 'LP - Licença Prévia' },
    { value: 'LI', label: 'LI - Licença de Instalação' },
    { value: 'LO', label: 'LO - Licença de Operação' },
    { value: 'LAS', label: 'LAS - Licença Ambiental Simplificada' },
    { value: 'LAU', label: 'LAU - Licença de Ampliação ou Urgência' },
    { value: 'RENOVACAO_LO', label: 'Renovação de LO' },
    { value: 'RENOVACAO_LI', label: 'Renovação de LI' }
  ];

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpa erro do campo ao editar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.tipo_licenca) {
      newErrors.tipo_licenca = 'Selecione o tipo de licença';
    }

    if (!formData.descricao_atividade) {
      newErrors.descricao_atividade = 'Descrição da atividade é obrigatória';
    }

    if (formData.possui_licenca_anterior === 'sim' && !formData.numero_licenca_anterior) {
      newErrors.numero_licenca_anterior = 'Informe o número da licença anterior';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePrevious = () => {
    setCurrentStep(1); // Volta para Partícipes
  };

  const handleNext = async () => {
    if (!validateForm()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);

    try {
      // Se estiver usando workflow engine
      if (workflowInstanceId && currentStepId) {
        await completeStep(workflowInstanceId, currentStepId, {
          licenca: formData
        });
        
        toast.success('Licença solicitada salva!');
        setCurrentStep(4); // Avança para Documentação
      } else {
        // Modo local (sem workflow engine)
        toast.success('Licença solicitada salva!');
        setCurrentStep(4);
      }
    } catch (error: any) {
      console.error('Erro ao salvar licença:', error);
      toast.error('Erro ao salvar: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Licença Solicitada</h2>
        </div>
        <p className="text-gray-600">
          Informe qual tipo de licença será solicitada e os dados da atividade
        </p>
      </div>

      {/* Formulário */}
      <div className="space-y-6">
        {/* Tipo de Licença */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Licença <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.tipo_licenca}
            onChange={(e) => handleChange('tipo_licenca', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.tipo_licenca ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {tiposLicenca.map(tipo => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
            ))}
          </select>
          {errors.tipo_licenca && (
            <p className="text-red-500 text-sm mt-1">{errors.tipo_licenca}</p>
          )}
        </div>

        {/* Descrição da Atividade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição da Atividade <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.descricao_atividade}
            onChange={(e) => handleChange('descricao_atividade', e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.descricao_atividade ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Descreva detalhadamente a atividade que será licenciada..."
          />
          {errors.descricao_atividade && (
            <p className="text-red-500 text-sm mt-1">{errors.descricao_atividade}</p>
          )}
        </div>

        {/* Dados da Atividade */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área Total (m²)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.area_total}
              onChange={(e) => handleChange('area_total', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 5000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacidade de Produção
            </label>
            <input
              type="text"
              value={formData.capacidade_producao}
              onChange={(e) => handleChange('capacidade_producao', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 100 ton/mês"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Funcionários
            </label>
            <input
              type="number"
              value={formData.numero_funcionarios}
              onChange={(e) => handleChange('numero_funcionarios', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 50"
            />
          </div>
        </div>

        {/* Horário de Funcionamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Horário de Funcionamento
          </label>
          <input
            type="text"
            value={formData.horario_funcionamento}
            onChange={(e) => handleChange('horario_funcionamento', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: 07:00 às 18:00 (segunda a sexta)"
          />
        </div>

        {/* Licença Anterior */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Licença Anterior</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Possui licença anterior para esta atividade?
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="possui_licenca_anterior"
                  value="sim"
                  checked={formData.possui_licenca_anterior === 'sim'}
                  onChange={(e) => handleChange('possui_licenca_anterior', e.target.value)}
                  className="mr-2"
                />
                Sim
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="possui_licenca_anterior"
                  value="nao"
                  checked={formData.possui_licenca_anterior === 'nao'}
                  onChange={(e) => handleChange('possui_licenca_anterior', e.target.value)}
                  className="mr-2"
                />
                Não
              </label>
            </div>
          </div>

          {formData.possui_licenca_anterior === 'sim' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número da Licença <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.numero_licenca_anterior}
                  onChange={(e) => handleChange('numero_licenca_anterior', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.numero_licenca_anterior ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: 12345/2023"
                />
                {errors.numero_licenca_anterior && (
                  <p className="text-red-500 text-sm mt-1">{errors.numero_licenca_anterior}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Validade
                </label>
                <input
                  type="date"
                  value={formData.validade_licenca_anterior}
                  onChange={(e) => handleChange('validade_licenca_anterior', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Órgão Emissor
                </label>
                <input
                  type="text"
                  value={formData.orgao_emissor}
                  onChange={(e) => handleChange('orgao_emissor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: IBAMA, CETESB"
                />
              </div>
            </div>
          )}
        </div>

        {/* Informação sobre documentos */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-800">
                <strong>Importante:</strong> Os documentos específicos necessários para o tipo de licença selecionado 
                serão requisitados na próxima etapa (Documentação).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botões de Navegação */}
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
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? 'Salvando...' : 'Próximo'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
