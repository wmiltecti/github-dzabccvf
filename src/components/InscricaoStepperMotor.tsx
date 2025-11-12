import React from 'react';
import { Users, Home, Building, FileText, Upload, FileCheck, CheckCircle, Circle } from 'lucide-react';

// Steps fixos para o Motor (não usa backend de workflow)
const MOTOR_STEPS = [
  { id: '1', key: 'PARTICIPANTES', label: 'Participantes', icon: Users },
  { id: '2', key: 'IMOVEL', label: 'Imóvel', icon: Home },
  { id: '3', key: 'EMPREENDIMENTO', label: 'Empreendimento', icon: Building },
  { id: '4', key: 'FORMULARIO', label: 'Formulário', icon: FileText },
  { id: '5', key: 'DOCUMENTACAO', label: 'Documentação', icon: Upload },
  { id: '6', key: 'REVISAO', label: 'Revisão', icon: FileCheck }
];

interface InscricaoStepperMotorProps {
  currentStep: number;  // 1-based (1 = Participantes, 2 = Imóvel, etc)
  completedSteps?: number[];  // Array de steps completados
  onStepClick?: (step: number) => void;
}

/**
 * Stepper visual para o InscricaoWizardMotor
 * Não usa contextos - recebe tudo via props
 */
export default function InscricaoStepperMotor({ 
  currentStep, 
  completedSteps = [],
  onStepClick 
}: InscricaoStepperMotorProps) {
  
  const getStepStatus = (stepIndex: number) => {
    const stepNumber = stepIndex + 1;
    
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
          text: 'text-green-600',
          description: 'text-green-500'
        };
      case 'current':
        return {
          container: 'cursor-pointer',
          circle: 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-100',
          text: 'text-blue-600 font-semibold',
          description: 'text-blue-500'
        };
      case 'upcoming':
        return {
          container: 'cursor-not-allowed opacity-60',
          circle: 'bg-gray-200 text-gray-400 border-gray-300',
          text: 'text-gray-400',
          description: 'text-gray-400'
        };
      default:
        return {
          container: 'cursor-not-allowed opacity-40',
          circle: 'bg-gray-100 text-gray-300 border-gray-200',
          text: 'text-gray-300',
          description: 'text-gray-300'
        };
    }
  };

  const handleStepClick = (stepIndex: number) => {
    const stepNumber = stepIndex + 1;
    const status = getStepStatus(stepIndex);
    
    // Permitir clicar em steps completados ou no atual
    if ((status === 'completed' || status === 'current') && onStepClick) {
      onStepClick(stepNumber);
    }
  };

  return (
    <div className="w-full py-6 px-2 sm:px-4">
      {/* Desktop: Horizontal */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between relative">
          {MOTOR_STEPS.map((step, index) => {
            const status = getStepStatus(index);
            const styles = getStepStyles(status);
            const Icon = step.icon;
            const isLastStep = index === MOTOR_STEPS.length - 1;

            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step */}
                <div 
                  className={`flex flex-col items-center ${styles.container} transition-all`}
                  onClick={() => handleStepClick(index)}
                >
                  {/* Circle Icon */}
                  <div className={`w-14 h-14 rounded-full border-2 ${styles.circle} flex items-center justify-center transition-all relative z-10 bg-white`}>
                    {status === 'completed' ? (
                      <CheckCircle className="w-7 h-7" />
                    ) : status === 'current' ? (
                      <Icon className="w-7 h-7" />
                    ) : (
                      <Circle className="w-7 h-7" />
                    )}
                  </div>
                  
                  {/* Label */}
                  <div className="mt-3 text-center">
                    <div className={`text-sm font-medium ${styles.text} transition-colors`}>
                      {step.label}
                    </div>
                    <div className={`text-xs ${styles.description} mt-0.5`}>
                      Step {index + 1} de {MOTOR_STEPS.length}
                    </div>
                  </div>
                </div>

                {/* Connector Line */}
                {!isLastStep && (
                  <div className="flex-1 h-0.5 mx-2 relative" style={{ top: '-35px' }}>
                    <div 
                      className={`h-full transition-colors ${
                        getStepStatus(index + 1) !== 'upcoming' 
                          ? 'bg-green-600' 
                          : 'bg-gray-300'
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile/Tablet: Vertical */}
      <div className="lg:hidden">
        <div className="space-y-4">
          {MOTOR_STEPS.map((step, index) => {
            const status = getStepStatus(index);
            const styles = getStepStyles(status);
            const Icon = step.icon;
            const isLastStep = index === MOTOR_STEPS.length - 1;

            return (
              <div key={step.id} className="relative">
                <div 
                  className={`flex items-center gap-4 ${styles.container}`}
                  onClick={() => handleStepClick(index)}
                >
                  {/* Circle Icon */}
                  <div className={`w-12 h-12 rounded-full border-2 ${styles.circle} flex items-center justify-center transition-all flex-shrink-0`}>
                    {status === 'completed' ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : status === 'current' ? (
                      <Icon className="w-6 h-6" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </div>
                  
                  {/* Label */}
                  <div className="flex-1">
                    <div className={`text-base font-medium ${styles.text}`}>
                      {step.label}
                    </div>
                    <div className={`text-sm ${styles.description}`}>
                      Step {index + 1} de {MOTOR_STEPS.length}
                    </div>
                  </div>
                </div>

                {/* Connector Line (Vertical) */}
                {!isLastStep && (
                  <div className="absolute left-6 top-12 w-0.5 h-4 -mb-4">
                    <div 
                      className={`w-full h-full transition-colors ${
                        getStepStatus(index + 1) !== 'upcoming' 
                          ? 'bg-green-600' 
                          : 'bg-gray-300'
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
