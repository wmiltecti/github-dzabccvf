import React from 'react';
import { Users, Home, Building, FileText, Upload, FileCheck, CheckCircle } from 'lucide-react';

// Steps fixos para o Motor (mesma estrutura do original aprovado)
const MOTOR_STEPS = [
  { id: 1, key: 'participantes', label: 'Participantes', icon: Users },
  { id: 2, key: 'imovel', label: 'Imóvel', icon: Home },
  { id: 3, key: 'empreendimento', label: 'Empreendimento', icon: Building },
  { id: 4, key: 'formulario', label: 'Formulário', icon: FileText },
  { id: 5, key: 'documentacao', label: 'Documentação', icon: Upload },
  { id: 6, key: 'revisao', label: 'Revisão', icon: FileCheck }
];

interface InscricaoStepperMotorProps {
  currentStep: number;  // 1-based (1 = Participantes, 2 = Imóvel, etc)
  completedSteps?: number[];  // Array de steps completados
  onStepClick?: (step: number) => void;
}

/**
 * Stepper visual para o InscricaoWizardMotor
 * Layout IDÊNTICO ao InscricaoStepper.tsx aprovado em produção
 * Não usa contextos - recebe tudo via props
 */
export default function InscricaoStepperMotor({ 
  currentStep, 
  completedSteps = [],
  onStepClick 
}: InscricaoStepperMotorProps) {
  
  const getStepStatus = (stepNumber: number) => {
    // stepNumber é 1-based (1, 2, 3...)
    
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
            {MOTOR_STEPS.map((step, stepIdx) => {
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
                  {stepIdx !== MOTOR_STEPS.length - 1 && (
                    <li>
                      <span
                        className={`text-base sm:text-xl leading-none transition-colors duration-300 ${
                          stepIdx < (currentStep - 1)
                            ? 'text-green-600'
                            : 'text-gray-300'
                        }`}
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
