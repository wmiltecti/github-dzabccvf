import React from 'react';
import { Building, Users, FileText, CheckCircle } from 'lucide-react';

// Steps do fluxo de Inscrição/Processo
const INSCRICAO_STEPS = [
  { id: 1, key: 'EMPREENDIMENTO', label: 'Empreendimento', icon: Building },
  { id: 2, key: 'PARTICIPANTES', label: 'Partícipes', icon: Users },
  { id: 3, key: 'LICENCA', label: 'Licença solicitada', icon: FileText },
  { id: 4, key: 'REVISAO', label: 'Revisão', icon: CheckCircle },
];

interface InscricaoStepperSimpleProps {
  currentStep: number;  // 1-based (1 = Empreendimento, 2 = Partícipes, etc)
  completedSteps?: number[];  // Array de steps completados
  onStepClick?: (step: number) => void;
}

/**
 * Stepper simples para Inscrição
 * Segue o mesmo padrão do EmpreendimentoStepper
 */
export default function InscricaoStepperSimple({
  currentStep,
  completedSteps = [],
  onStepClick
}: InscricaoStepperSimpleProps) {

  const getStepStatus = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber)) {
      return 'completed';
    }

    if (stepNumber === currentStep) {
      return 'current';
    }

    if (stepNumber < currentStep) {
      return 'completed';
    }

    return 'upcoming';
  };

  const getStepStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          container: 'cursor-pointer',
          circle: 'bg-green-600 text-white border-green-600',
          text: 'text-green-600'
        };
      case 'current':
        return {
          container: 'cursor-pointer',
          circle: 'bg-blue-600 text-white border-blue-600',
          text: 'text-blue-600 font-semibold'
        };
      case 'upcoming':
        return {
          container: 'cursor-pointer',
          circle: 'bg-white text-gray-600 border-gray-300',
          text: 'text-gray-600'
        };
      default:
        return {
          container: '',
          circle: 'bg-white text-gray-600 border-gray-300',
          text: 'text-gray-600'
        };
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-2 sm:px-4 lg:px-6 py-3 sm:py-4">
      <nav aria-label="Progress">
        <div className="overflow-x-auto overflow-y-hidden stepper-scroll pb-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}>
          <ol className="flex items-center justify-center gap-1 sm:gap-2 min-w-max mx-auto">
            {INSCRICAO_STEPS.map((step, stepIdx) => {
              const status = getStepStatus(step.id);
              const styles = getStepStyles(status);
              const Icon = step.icon;

              return (
                <React.Fragment key={step.id}>
                  <li className="flex items-center gap-1 sm:gap-2">
                    {/* Step Content */}
                    <div
                      className={`flex items-center gap-1 sm:gap-2 ${styles.container}`}
                      onClick={() => {
                        if (onStepClick) {
                          console.log('🖱️ Click no step:', step.key, status);
                          onStepClick(step.id);
                        }
                      }}
                    >
                      {/* Circle com Ícone */}
                      <div
                        className={`
                          flex items-center justify-center
                          w-7 h-7 sm:w-8 sm:h-8
                          border-2 rounded-full
                          transition-all duration-200
                          ${styles.circle}
                        `}
                      >
                        {status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                      </div>

                      {/* Label */}
                      <span className={`text-xs sm:text-sm whitespace-nowrap ${styles.text}`}>
                        {step.label}
                      </span>
                    </div>
                  </li>

                  {/* Connector Arrow */}
                  {stepIdx < INSCRICAO_STEPS.length - 1 && (
                    <li className="flex items-center">
                      <span
                        className={`
                          text-lg sm:text-xl
                          transition-all duration-200
                          ${status === 'completed' ? 'text-green-700' : 'text-gray-300'}
                        `}
                        style={{ color: status === 'completed' ? 'darkgreen' : undefined }}
                      >
                        ➤
                      </span>
                    </li>
                  )}
                </React.Fragment>
              );
            })}
          </ol>
        </div>
      </nav>
    </div>
  );
}
