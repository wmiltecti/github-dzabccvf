import React, { useState, useEffect } from 'react';
import {
  FileText,
  Zap,
  Droplet,
  Fuel,
  Trash2,
  Info,
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import StepCaracteristicasEmpreendimento from './licenciamento/StepCaracteristicasEmpreendimento';
import { useFormWizardStore } from '../store/formWizardStore';
import { getUserId } from '../utils/authToken';
import { criarProcesso, upsertDadosGerais } from '../services/processosService';

interface Step {
  id: number;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
}

const steps: Step[] = [
  {
    id: 1,
    name: 'Características',
    description: 'Características gerais do empreendimento',
    icon: FileText
  },
  {
    id: 2,
    name: 'Recursos e Energia',
    description: 'Recursos naturais e energia',
    icon: Zap
  },
  {
    id: 3,
    name: 'Água',
    description: 'Abastecimento e uso de água',
    icon: Droplet
  },
  {
    id: 4,
    name: 'Combustíveis',
    description: 'Combustíveis e armazenamento',
    icon: Fuel
  },
  {
    id: 5,
    name: 'Resíduos',
    description: 'Gestão de resíduos',
    icon: Trash2
  },
  {
    id: 6,
    name: 'Outras Informações',
    description: 'Informações complementares',
    icon: Info
  }
];

const saveStep = (stepNumber: number, data: any) => {
  console.log(`💾 Salvando dados da etapa ${stepNumber}:`, data);
  console.log(`📊 Timestamp: ${new Date().toISOString()}`);
};

export default function FormWizardLicenciamento() {
  const { processoId, setProcessoId } = useFormWizardStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [stepData, setStepData] = useState<Record<number, any>>({});
  const [isInitializing, setIsInitializing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const progress = (currentStep / steps.length) * 100;

  useEffect(() => {
    const initializeProcesso = async () => {
      if (!processoId) {
        setIsInitializing(true);
        try {
          const userId = getUserId();
          if (!userId) {
            toast.error('Usuário não autenticado');
            return;
          }

          const newProcessoId = await criarProcesso(userId);
          setProcessoId(newProcessoId);

          if (newProcessoId.startsWith('local-')) {
            console.log('🔸 Processo criado em modo local:', newProcessoId);
            toast.info('Modo offline: dados serão salvos localmente');
          } else {
            console.log('✅ Processo criado na API:', newProcessoId);
          }
        } catch (error: any) {
          console.error('Erro ao criar processo:', error);
          toast.error(error.message || 'Erro ao inicializar processo');
        } finally {
          setIsInitializing(false);
        }
      }
    };

    initializeProcesso();
  }, [processoId, setProcessoId]);

  const handleNext = async () => {
    if (currentStep < steps.length) {
      if (currentStep === 1) {
        await saveStepToAPI(currentStep, stepData[currentStep] || {});
      } else {
        saveStep(currentStep, stepData[currentStep] || {});
      }

      if (!isSaving) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep1Data = (data: any): string[] => {
    const errors: string[] = [];

    if (!data.codigoCNAE) {
      errors.push('Código CNAE é obrigatório');
    }

    if (!data.numeroEmpregados || parseInt(data.numeroEmpregados) < 0) {
      errors.push('Número de empregados é obrigatório e deve ser maior ou igual a zero');
    }

    if (!data.possuiLicencaAnterior) {
      errors.push('É obrigatório informar se possui licença anterior');
    }

    if (data.possuiLicencaAnterior === 'sim') {
      if (!data.licencaAnterior?.tipo) {
        errors.push('Tipo de licença anterior é obrigatório');
      }
      if (!data.licencaAnterior?.numero) {
        errors.push('Número da licença anterior é obrigatório');
      }
      if (!data.licencaAnterior?.ano) {
        errors.push('Ano de emissão da licença é obrigatório');
      } else {
        const ano = parseInt(data.licencaAnterior.ano);
        const anoAtual = new Date().getFullYear();
        if (ano < 1900 || ano > anoAtual) {
          errors.push(`Ano de emissão deve estar entre 1900 e ${anoAtual}`);
        }
      }
      if (!data.licencaAnterior?.validade) {
        errors.push('Data de validade da licença é obrigatória');
      }
    }

    return errors;
  };

  const saveStepToAPI = async (stepNumber: number, data: any) => {
    if (stepNumber !== 1 || !processoId) {
      saveStep(stepNumber, data);
      return;
    }

    console.log('🚀 Iniciando salvamento dos dados gerais...');
    console.log('📝 Processo ID:', processoId);
    console.log('📊 Dados do formulário:', data);

    const validationErrors = validateStep1Data(data);
    if (validationErrors.length > 0) {
      console.error('⚠️ Erros de validação:', validationErrors);
      toast.error(`Dados incompletos: ${validationErrors.join(', ')}`);
      return;
    }

    console.log('✓ Validação de dados passou com sucesso');

    setIsSaving(true);
    try {
      const payload: any = {
        porte: data.porte || null,
        potencial_poluidor: data.potencialPoluidor || null,
        cnae_codigo: data.codigoCNAE || null,
        cnae_descricao: data.descricaoCNAE || null,
        numero_empregados: data.numeroEmpregados ? parseInt(data.numeroEmpregados) : null,
        possui_licenca_anterior: data.possuiLicencaAnterior === 'sim' ? true : data.possuiLicencaAnterior === 'nao' ? false : null,
      };

      if (data.licencaAnterior && data.possuiLicencaAnterior === 'sim') {
        payload.licenca_tipo = data.licencaAnterior.tipo || null;
        payload.licenca_numero = data.licencaAnterior.numero || null;
        payload.licenca_ano = data.licencaAnterior.ano ? parseInt(data.licencaAnterior.ano) : null;
        payload.licenca_validade = data.licencaAnterior.validade || null;
      }

      console.log('📤 Payload a ser enviado para API:', payload);
      console.log('⏰ Timestamp:', new Date().toISOString());

      const response = await upsertDadosGerais(processoId, payload);

      console.log('✅ Dados salvos com sucesso na API!');
      console.log('📨 Response da API:', response);

      saveStep(stepNumber, data);

      if (response && (response as any).protocolo_interno) {
        toast.success(`✓ Dados salvos! Protocolo: ${(response as any).protocolo_interno}`);
      } else {
        toast.success('✓ Dados salvos com sucesso!');
      }
    } catch (error: any) {
      console.error('❌ Erro ao salvar dados gerais:', error);
      console.error('📋 Stack trace:', error.stack);
      toast.error(error.message || 'Erro ao salvar dados');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (currentStep === 1) {
      try {
        await saveStepToAPI(currentStep, stepData[currentStep] || {});
      } catch (error) {
        return;
      }
    } else {
      saveStep(currentStep, stepData[currentStep] || {});
      console.log('💾 Salvando rascunho de todas as etapas:', stepData);
      toast.success('Rascunho salvo com sucesso!');
    }
  };

  const updateStepData = (data: any) => {
    setStepData(prev => ({
      ...prev,
      [currentStep]: { ...(prev[currentStep] || {}), ...data }
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <StepCaracteristicasEmpreendimento data={stepData[1]} onChange={updateStepData} />;
      case 2:
        return <RecursosEnergiaStep data={stepData[2]} updateData={updateStepData} />;
      case 3:
        return <AguaStep data={stepData[3]} updateData={updateStepData} />;
      case 4:
        return <CombustiveisStep data={stepData[4]} updateData={updateStepData} />;
      case 5:
        return <ResiduosStep data={stepData[5]} updateData={updateStepData} />;
      case 6:
        return <OutrasInformacoesStep data={stepData[6]} updateData={updateStepData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Formulário de Licenciamento Ambiental
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Etapa {currentStep} de {steps.length}
              </p>
            </div>
            <button
              onClick={handleSaveDraft}
              disabled={isSaving || isInitializing}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progresso</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-green-600 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Steps Navigation */}
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <div
                  key={step.id}
                  className="flex items-center flex-1"
                >
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`
                        w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all
                        ${isCompleted
                          ? 'bg-green-600 border-green-600 text-white'
                          : isActive
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-white border-gray-300 text-gray-400'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="mt-2 text-center hidden md:block">
                      <p className={`text-xs font-medium ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {step.name}
                      </p>
                    </div>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 ${
                      step.id < currentStep ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {steps[currentStep - 1].name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {steps[currentStep - 1].description}
            </p>
          </div>

          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          <div className="text-sm text-gray-600">
            Etapa {currentStep} de {steps.length}
          </div>

          <button
            onClick={handleNext}
            disabled={currentStep === steps.length || isSaving || isInitializing}
            className="flex items-center gap-2 px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : currentStep === steps.length ? (
              'Concluído'
            ) : (
              <>
                Avançar
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function RecursosEnergiaStep({ data, updateData }: { data: any; updateData: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fonte de Energia Principal
        </label>
        <select
          value={data?.fonteEnergia || ''}
          onChange={(e) => updateData({ fonteEnergia: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Selecione...</option>
          <option value="rede_publica">Rede Pública</option>
          <option value="geracao_propria">Geração Própria</option>
          <option value="solar">Solar</option>
          <option value="eolica">Eólica</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Consumo Médio Mensal (kWh)
        </label>
        <input
          type="number"
          value={data?.consumo || ''}
          onChange={(e) => updateData({ consumo: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="0"
        />
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.energiaRenovavel || false}
            onChange={(e) => updateData({ energiaRenovavel: e.target.checked })}
            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <span className="text-sm text-gray-700">Utiliza fontes de energia renovável</span>
        </label>
      </div>
    </div>
  );
}

function AguaStep({ data, updateData }: { data: any; updateData: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fonte de Abastecimento
        </label>
        <select
          value={data?.fonteAgua || ''}
          onChange={(e) => updateData({ fonteAgua: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Selecione...</option>
          <option value="rede_publica">Rede Pública</option>
          <option value="poco_artesiano">Poço Artesiano</option>
          <option value="captacao_superficial">Captação Superficial</option>
          <option value="cisterna">Cisterna</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Consumo Médio Mensal (m³)
        </label>
        <input
          type="number"
          value={data?.consumoAgua || ''}
          onChange={(e) => updateData({ consumoAgua: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sistema de Tratamento de Efluentes
        </label>
        <select
          value={data?.tratamentoEfluentes || ''}
          onChange={(e) => updateData({ tratamentoEfluentes: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Selecione...</option>
          <option value="rede_publica">Rede Pública de Esgoto</option>
          <option value="fossa_septica">Fossa Séptica</option>
          <option value="estacao_tratamento">Estação de Tratamento Própria</option>
          <option value="nao_possui">Não Possui</option>
        </select>
      </div>
    </div>
  );
}

function CombustiveisStep({ data, updateData }: { data: any; updateData: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={data?.utilizaCombustivel || false}
            onChange={(e) => updateData({ utilizaCombustivel: e.target.checked })}
            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <span className="text-sm font-medium text-gray-700">Utiliza ou armazena combustíveis</span>
        </label>
      </div>

      {data?.utilizaCombustivel && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Combustível
            </label>
            <select
              value={data?.tipoCombustivel || ''}
              onChange={(e) => updateData({ tipoCombustivel: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Selecione...</option>
              <option value="gasolina">Gasolina</option>
              <option value="diesel">Diesel</option>
              <option value="etanol">Etanol</option>
              <option value="gnv">GNV</option>
              <option value="glp">GLP</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacidade de Armazenamento (litros)
            </label>
            <input
              type="number"
              value={data?.capacidadeArmazenamento || ''}
              onChange={(e) => updateData({ capacidadeArmazenamento: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sistema de Contenção
            </label>
            <textarea
              value={data?.sistemaContencao || ''}
              onChange={(e) => updateData({ sistemaContencao: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Descreva o sistema de contenção e segurança..."
            />
          </div>
        </>
      )}
    </div>
  );
}

function ResiduosStep({ data, updateData }: { data: any; updateData: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipos de Resíduos Gerados
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data?.residuosComuns || false}
              onChange={(e) => updateData({ residuosComuns: e.target.checked })}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Resíduos Comuns</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data?.residuosReciclaveis || false}
              onChange={(e) => updateData({ residuosReciclaveis: e.target.checked })}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Resíduos Recicláveis</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data?.residuosPerigosos || false}
              onChange={(e) => updateData({ residuosPerigosos: e.target.checked })}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Resíduos Perigosos</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Volume Mensal Estimado (kg)
        </label>
        <input
          type="number"
          value={data?.volumeResiduos || ''}
          onChange={(e) => updateData({ volumeResiduos: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Destinação dos Resíduos
        </label>
        <textarea
          value={data?.destinacaoResiduos || ''}
          onChange={(e) => updateData({ destinacaoResiduos: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Descreva como os resíduos são destinados..."
        />
      </div>
    </div>
  );
}

function OutrasInformacoesStep({ data, updateData }: { data: any; updateData: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Licenças Ambientais Anteriores
        </label>
        <textarea
          value={data?.licencasAnteriores || ''}
          onChange={(e) => updateData({ licencasAnteriores: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Informe licenças anteriores, se houver..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Medidas de Controle Ambiental
        </label>
        <textarea
          value={data?.medidasControle || ''}
          onChange={(e) => updateData({ medidasControle: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Descreva as medidas de controle ambiental implementadas..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observações Adicionais
        </label>
        <textarea
          value={data?.observacoes || ''}
          onChange={(e) => updateData({ observacoes: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Informações adicionais relevantes..."
        />
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-green-900">Pronto para finalizar</h3>
            <p className="text-sm text-green-700 mt-1">
              Você completou todas as etapas do formulário. Revise as informações e clique em "Salvar Rascunho"
              para guardar seus dados ou "Avançar" para concluir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
