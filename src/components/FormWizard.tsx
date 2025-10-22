import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Loader2,
  Wand2
} from 'lucide-react';
import { useFormWizardStore } from '../store/formWizardStore';
import { saveStep, saveDraft } from '../services/formWizardService';
import Step1Caracteristicas from './Step1Caracteristicas';
import Step2RecursosEnergia from './Step2RecursosEnergia';
import Step2Combustiveis from './Step2Combustiveis';
import Step3UsoAgua from './Step3UsoAgua';
import Step4Residuos from './Step4Residuos';
import Step5OutrasInfo from './Step5OutrasInfo';

interface Step {
  id: number;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
}

const steps: Step[] = [
  {
    id: 1,
    name: 'Características do Empreendimento',
    description: 'Informações sobre o empreendimento',
    icon: FileText
  },
  {
    id: 2,
    name: 'Uso de Recursos e Energia',
    description: 'Combustíveis e fontes de energia',
    icon: Zap
  },
  {
    id: 3,
    name: 'Uso de Água',
    description: 'Consumo, origem e efluentes',
    icon: Droplet
  },
  {
    id: 4,
    name: 'Combustíveis',
    description: 'Controle de combustíveis',
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
  },
  {
    id: 7,
    name: 'Finalização',
    description: 'Revisão e conclusão',
    icon: CheckCircle
  }
];

export default function FormWizard() {
  const { currentStep, formData, setCurrentStep, updateStepData, nextStep, previousStep } = useFormWizardStore();
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveMessage, setSaveMessage] = React.useState('');

  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    nextStep();
  };

  const handleBack = () => {
    previousStep();
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setSaveMessage('Salvando rascunho...');

    const result = await saveDraft(currentStep, formData);

    setIsSaving(false);

    if (result.error) {
      setSaveMessage('Erro ao salvar rascunho');
    } else {
      setSaveMessage('Rascunho salvo com sucesso!');
    }

    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleStepDataChange = (data: any) => {
    updateStepData(currentStep, data);
  };

  const handleFillMockData = () => {
    const mockData = getMockDataForStep(currentStep);
    updateStepData(currentStep, mockData);
    setSaveMessage('Dados de exemplo preenchidos!');
    setTimeout(() => setSaveMessage(''), 2000);
  };

  const getMockDataForStep = (step: number) => {
    switch (step) {
      case 1:
        return {
          area: '5000',
          porte: 'Médio Porte',
          potencialPoluidor: 'Médio',
          cnaeCodigo: '1011-2/01',
          cnaeDescricao: 'Frigorífico - abate de bovinos',
          possuiLicencaAnterior: 'sim',
          licencaTipo: 'LO',
          licencaNumero: '12345/2023',
          licencaAno: '2023',
          licencaValidade: '2025-12-31',
          numeroEmpregados: '150',
          horarioInicio: '07:00',
          horarioFim: '17:00'
        };
      case 2:
        return {
          usaLenha: 'sim',
          lenhaQuantidade: '250',
          lenhaCeprof: 'CEPROF-12345',
          possuiCaldeira: 'sim',
          caldeiraAlturaChamine: '15',
          possuiFornos: 'sim',
          fornosSistemaCaptacao: 'Sistema de filtros ciclônicos com lavadores de gases',
          combustiveis: [
            {
              id: '1',
              tipoFonte: 'Lenha',
              equipamento: 'Caldeira Principal',
              quantidade: '250',
              unidade: 'm³'
            },
            {
              id: '2',
              tipoFonte: 'Gás Natural',
              equipamento: 'Forno Industrial 1',
              quantidade: '500',
              unidade: 'm³'
            },
            {
              id: '3',
              tipoFonte: 'Eletricidade',
              equipamento: 'Linha de Produção',
              quantidade: '2.5',
              unidade: 'MW'
            }
          ]
        };
      case 3:
        return {
          origens: ['Rede Pública', 'Poço Artesiano'],
          consumoHumano: '50',
          consumoOutros: '150',
          volumeDespejo: '180',
          destinoFinal: 'Corpo Receptor',
          outorgas: [
            {
              id: '1',
              tipo: 'Captação Subterrânea',
              numero: 'OUT-987654/2023',
              validade: '2026-12-31',
              vazao: '100'
            },
            {
              id: '2',
              tipo: 'Lançamento de Efluentes',
              numero: 'OUT-123456/2023',
              validade: '2027-06-30',
              vazao: '180'
            }
          ]
        };
      case 4:
        return {
          combustiveis: [
            {
              id: crypto.randomUUID(),
              tipoFonte: 'ENERGIA_ELETRICA',
              equipamento: 'Motor Principal 500 MW',
              quantidade: 1200.50,
              unidade: 'MWH'
            },
            {
              id: crypto.randomUUID(),
              tipoFonte: 'GLP',
              equipamento: 'Caldeira Auxiliar',
              quantidade: 350.00,
              unidade: 'KG'
            },
            {
              id: crypto.randomUUID(),
              tipoFonte: 'OLEO',
              equipamento: 'Gerador de Emergência',
              quantidade: 500.75,
              unidade: 'KG'
            }
          ]
        };
      case 5:
        return {
          residuosGrupoA: [
            {
              id: '1',
              tipo: 'Resíduos Infectantes',
              quantidade: '150',
              destino: 'Autoclave'
            },
            {
              id: '2',
              tipo: 'Materiais Perfurocortantes',
              quantidade: '50',
              destino: 'Incineração'
            }
          ],
          residuosGrupoB: [
            {
              id: '1',
              tipo: 'Medicamentos Vencidos',
              quantidade: '80',
              destino: 'Empresa Especializada'
            }
          ],
          residuosGerais: [
            {
              id: '1',
              categoria: 'Sólidos',
              tipo: 'Papel e Papelão',
              origem: 'Área administrativa',
              tratamento: 'Não possui tratamento',
              destino: 'Reciclagem',
              quantidade: '300'
            },
            {
              id: '2',
              categoria: 'Líquidos',
              tipo: 'Efluente Industrial',
              origem: 'Setor de produção',
              tratamento: 'ETE',
              destino: 'Corpo Receptor',
              quantidade: '500'
            }
          ]
        };
      case 6:
        return {
          respostas: {
            usaRecursosNaturais: true,
            geraEfluentesLiquidos: true,
            geraEmissoesAtmosfericas: true,
            geraResiduosSolidos: true,
            geraRuidosVibracao: false,
            localizadoAreaProtegida: false,
            necessitaSupressaoVegetacao: false,
            interfereCursoAgua: false,
            armazenaSubstanciaPerigosa: true,
            possuiPlanoEmergencia: true
          },
          outrasInformacoes: 'O empreendimento já possui certificação ISO 14001 e realiza auditorias ambientais anuais. Todas as medidas de controle ambiental estão implementadas e em operação conforme legislação vigente.'
        };
      case 7:
        return {
          observacoes: 'Todos os procedimentos ambientais estão em conformidade com a legislação vigente. A empresa mantém certificações atualizadas e realiza auditorias periódicas.'
        };
      default:
        return {};
    }
  };

  const renderStepContent = () => {
    const stepKey = `step${currentStep}` as keyof typeof formData;
    const data = formData[stepKey];

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 1 && <Step1Caracteristicas data={data} onChange={handleStepDataChange} unidadeMedida="m²" />}
          {currentStep === 2 && <Step2RecursosEnergia data={data} onChange={handleStepDataChange} />}
          {currentStep === 3 && <Step3UsoAgua data={data} onChange={handleStepDataChange} />}
          {currentStep === 4 && <Step2Combustiveis data={data} onChange={handleStepDataChange} />}
          {currentStep === 5 && <Step4Residuos data={data} onChange={handleStepDataChange} />}
          {currentStep === 6 && <Step5OutrasInfo data={data} onChange={handleStepDataChange} />}
          {currentStep === 7 && <Step6Content data={data} onChange={handleStepDataChange} />}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Formulário Wizard</h1>
              <p className="text-sm text-gray-500 mt-1">
                Etapa {currentStep} de {steps.length}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleFillMockData}
                className="flex items-center gap-2 px-4 py-2 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Wand2 className="w-4 h-4" />
                Preencher
              </button>
              <button
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar Rascunho
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progresso</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-green-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Save Message */}
          <AnimatePresence>
            {saveMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-center text-green-600 font-medium"
              >
                {saveMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Steps Navigation */}
          <div className="flex items-center justify-between mt-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentStep(step.id)}
                      className={`
                        w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer
                        ${
                          isCompleted
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
                    </motion.div>
                    <div className="mt-2 text-center hidden md:block">
                      <p
                        className={`text-xs font-medium ${
                          isActive
                            ? 'text-blue-600'
                            : isCompleted
                            ? 'text-green-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {step.name}
                      </p>
                    </div>
                  </div>
                  {idx < steps.length - 1 && (
                    <motion.div
                      className={`h-0.5 flex-1 mx-2 ${
                        step.id < currentStep ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
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
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </motion.button>

          <div className="text-sm text-gray-600">
            Etapa {currentStep} de {steps.length}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            disabled={currentStep === steps.length}
            className="flex items-center gap-2 px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === steps.length ? (
              'Concluído'
            ) : (
              <>
                Avançar
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function Step1Content({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
        <input
          type="text"
          value={data?.nome || ''}
          onChange={(e) => onChange({ ...data, nome: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Digite seu nome completo"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
          type="email"
          value={data?.email || ''}
          onChange={(e) => onChange({ ...data, email: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="seu@email.com"
        />
      </div>
    </div>
  );
}

function Step2Content({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Recurso
        </label>
        <select
          value={data?.tipoRecurso || ''}
          onChange={(e) => onChange({ ...data, tipoRecurso: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Selecione...</option>
          <option value="solar">Energia Solar</option>
          <option value="eolica">Energia Eólica</option>
          <option value="hidreletrica">Hidrelétrica</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Consumo Mensal (kWh)
        </label>
        <input
          type="number"
          value={data?.consumo || ''}
          onChange={(e) => onChange({ ...data, consumo: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="0"
        />
      </div>
    </div>
  );
}

function Step3Content({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fonte de Água
        </label>
        <select
          value={data?.fonteAgua || ''}
          onChange={(e) => onChange({ ...data, fonteAgua: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Selecione...</option>
          <option value="rede">Rede Pública</option>
          <option value="poco">Poço Artesiano</option>
          <option value="captacao">Captação Superficial</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Consumo Mensal (m³)
        </label>
        <input
          type="number"
          value={data?.consumoAgua || ''}
          onChange={(e) => onChange({ ...data, consumoAgua: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="0"
        />
      </div>
    </div>
  );
}

function Step4Content({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={data?.utilizaCombustivel || false}
            onChange={(e) => onChange({ ...data, utilizaCombustivel: e.target.checked })}
            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Utiliza combustíveis
          </span>
        </label>
      </div>
      {data?.utilizaCombustivel && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Combustível
          </label>
          <select
            value={data?.tipoCombustivel || ''}
            onChange={(e) => onChange({ ...data, tipoCombustivel: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Selecione...</option>
            <option value="gasolina">Gasolina</option>
            <option value="diesel">Diesel</option>
            <option value="etanol">Etanol</option>
          </select>
        </div>
      )}
    </div>
  );
}

function Step5Content({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Volume de Resíduos (kg/mês)
        </label>
        <input
          type="number"
          value={data?.volumeResiduos || ''}
          onChange={(e) => onChange({ ...data, volumeResiduos: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Destinação
        </label>
        <textarea
          value={data?.destinacao || ''}
          onChange={(e) => onChange({ ...data, destinacao: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Descreva a destinação dos resíduos..."
        />
      </div>
    </div>
  );
}

function Step6Content({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observações Finais
        </label>
        <textarea
          value={data?.observacoes || ''}
          onChange={(e) => onChange({ ...data, observacoes: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Informações adicionais..."
        />
      </div>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-green-900">Formulário Completo</h3>
            <p className="text-sm text-green-700 mt-1">
              Você completou todas as etapas. Clique em "Salvar Rascunho" para salvar ou
              revise as informações anteriores.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
