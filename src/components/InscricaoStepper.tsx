import React, { useEffect, useState } from 'react';
import { Users, Home, Building, FileText, Upload, FileCheck, CheckCircle, Circle } from 'lucide-react';
import { useInscricaoStore } from '../lib/store/inscricao';
import { useInscricaoContext } from '../contexts/InscricaoContext';
import { getTemplateSteps, getInstanceStepHistory, WorkflowStep } from '../services/workflowApi';

// ⚠️ FALLBACK: Steps hardcoded para uso quando backend não estiver disponível
const FALLBACK_STEPS = [
  { id: '1', key: 'EMPREENDIMENTO', label: 'Empreendimento', path: '/inscricao/empreendimento' },
  { id: '2', key: 'PARTICIPANTES', label: 'Partícipes', path: '/inscricao/participantes' },
  { id: '3', key: 'LICENCA', label: 'Licença solicitada', path: '/inscricao/licenca' },
  { id: '4', key: 'REVISAO', label: 'Revisão', path: '/inscricao/revisao' }
];

// Mapeamento de keys para ícones
const STEP_ICONS: Record<string, React.ComponentType<any>> = {
  'EMPREENDIMENTO': Building,
  'PARTICIPANTES': Users,
  'LICENCA': FileText,
  'DOCUMENTACAO': Upload,
  'REVISAO': FileCheck
};

interface InscricaoStepperProps {
  currentStep: number;  // ⚠️ DEPRECATED: será removido quando migração estiver completa
  onStepClick?: (step: number) => void;  // ⚠️ DEPRECATED
}

export default function InscricaoStepper({ currentStep, onStepClick }: InscricaoStepperProps) {
  const { isStepComplete, canProceedToStep } = useInscricaoStore();
  const { workflowInstanceId, currentStepKey } = useInscricaoContext();
  
  const [steps, setSteps] = useState<WorkflowStep[]>(FALLBACK_STEPS);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar steps do template e histórico
  useEffect(() => {
    const loadSteps = async () => {
      try {
        // 1. Tentar buscar steps do template (opcional)
        const templateSteps = await getTemplateSteps('LICENCIAMENTO_AMBIENTAL_COMPLETO');
        setSteps(templateSteps);
        console.log('✅ Steps carregados do backend:', templateSteps);

        // 2. Se tiver instância ativa, buscar histórico
        if (workflowInstanceId) {
          const history = await getInstanceStepHistory(workflowInstanceId);
          setCompletedStepIds(history.completedSteps);
          console.log('✅ Histórico de steps:', history);
        }
      } catch (error) {
        console.warn('⚠️ Workflow engine não disponível, usando modo manual:', error);
        setSteps(FALLBACK_STEPS);
      } finally {
        setLoading(false);
      }
    };

    loadSteps();
  }, [workflowInstanceId]);

  const getStepStatus = (step: WorkflowStep, stepIndex: number) => {
    // 1. Encontra o índice do step atual
    const currentIndex = steps.findIndex(s => s.key === currentStepKey);

    // 2. Se é o step atual (baseado na key do contexto)
    if (step.key === currentStepKey) {
      return 'current';
    }

    // 3. Se está antes do step atual (pela ordem no array) - já foi completado
    if (currentIndex !== -1 && stepIndex < currentIndex) {
      return 'completed';
    }

    // 4. Se step foi explicitamente completado (está no histórico do workflow engine)
    if (completedStepIds.includes(step.id)) {
      return 'completed';
    }

    // 5. Se está depois do step atual - ainda não acessível
    if (currentIndex !== -1 && stepIndex > currentIndex) {
      return 'upcoming';
    }

    // 6. Fallback: upcoming
    return 'upcoming';
  };

  const getStepStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          container: 'cursor-pointer',
          circle: 'bg-green-600 text-white border-green-600',
          text: 'text-green-600',
          description: 'text-green-500'
        };
      case 'current':
        return {
          container: 'cursor-pointer',
          circle: 'bg-blue-600 text-white border-blue-600',
          text: 'text-blue-600 font-semibold',
          description: 'text-blue-500'
        };
      case 'upcoming':
        return {
          container: 'cursor-pointer',
          circle: 'bg-white text-gray-600 border-gray-300',
          text: 'text-gray-600',
          description: 'text-gray-500'
        };
      case 'disabled':
        return {
          container: 'cursor-not-allowed opacity-50',
          circle: 'bg-gray-100 text-gray-400 border-gray-200',
          text: 'text-gray-400',
          description: 'text-gray-400'
        };
      default:
        return {
          container: '',
          circle: 'bg-white text-gray-600 border-gray-300',
          text: 'text-gray-600',
          description: 'text-gray-500'
        };
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-2 sm:px-4 lg:px-6 py-3 sm:py-4">
      <nav aria-label="Progress">
        <div className="overflow-x-auto overflow-y-hidden stepper-scroll pb-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}>
          <ol className="flex items-center justify-center gap-1 sm:gap-2 min-w-max mx-auto">
            {loading ? (
              // Loading skeleton
              <li className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
              </li>
            ) : (
              steps.map((step, stepIdx) => {
                const status = getStepStatus(step, stepIdx);
                const styles = getStepStyles(status);
                const Icon = STEP_ICONS[step.key] || Circle;  // Busca ícone pelo key, fallback Circle

                return (
                  <React.Fragment key={step.id}>
                    <li className="flex items-center gap-1 sm:gap-2">
                      {/* Step Content */}
                      <div
                        className={`flex items-center gap-1 sm:gap-2 ${styles.container}`}
                        onClick={() => {
                          // TODO: Implementar navegação por click quando backend permitir
                          console.log('🖱️ Click no step:', step.key, status);
                        }}
                      >
                        {/* Step Circle */}
                        <div className={`
                          w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200
                          ${styles.circle}
                        `}>
                          {status === 'completed' ? (
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : status === 'current' ? (
                            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          ) : (
                            <span className="text-xs sm:text-sm font-medium">{stepIdx + 1}</span>
                          )}
                        </div>

                        {/* Step Text */}
                        <p className={`text-xs sm:text-sm font-medium whitespace-nowrap ${styles.text}`}>
                          {step.label}
                        </p>
                      </div>
                    </li>

                    {/* Connector Arrow */}
                    {stepIdx !== steps.length - 1 && (
                      <li>
                        <span
                          className={`text-base sm:text-xl leading-none transition-colors duration-300 ${
                            stepIdx < steps.findIndex(s => s.key === currentStepKey)
                              ? 'text-green-800'
                              : 'text-gray-300'
                          }`}
                        >
                          ➤
                        </span>
                      </li>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </ol>
        </div>
      </nav>
    </div>
  );
}