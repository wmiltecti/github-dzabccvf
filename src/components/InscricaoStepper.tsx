import React from 'react';
import { Users, Home, Building, FileCheck, CheckCircle, Circle } from 'lucide-react';
import { useInscricaoStore } from '../lib/store/inscricao';

interface Step {
  id: number;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  path: string;
}

const steps: Step[] = [
  {
    id: 1,
    name: 'Participantes',
    description: 'Requerente, procurador e responsável técnico',
    icon: Users,
    path: '/inscricao/participantes'
  },
  {
    id: 2,
    name: 'Imóvel',
    description: 'Localização e características do imóvel',
    icon: Home,
    path: '/inscricao/imovel'
  },
  {
    id: 3,
    name: 'Empreendimento',
    description: 'Atividade e detalhes do projeto',
    icon: Building,
    path: '/inscricao/empreendimento'
  },
  {
    id: 4,
    name: 'Revisão',
    description: 'Conferir dados e finalizar',
    icon: FileCheck,
    path: '/inscricao/revisao'
  }
];

interface InscricaoStepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export default function InscricaoStepper({ currentStep, onStepClick }: InscricaoStepperProps) {
  const { isStepComplete, canProceedToStep } = useInscricaoStore();

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) {
      return isStepComplete(stepId) ? 'completed' : 'incomplete';
    } else if (stepId === currentStep) {
      return 'current';
    } else {
      return canProceedToStep(stepId) ? 'upcoming' : 'disabled';
    }
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
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <nav aria-label="Progress">
        <ol className="flex items-center justify-center gap-2 max-w-4xl mx-auto">
          {steps.map((step, stepIdx) => {
            const status = getStepStatus(step.id);
            const styles = getStepStyles(status);
            const Icon = step.icon;

            return (
              <React.Fragment key={step.id}>
                <li className="flex items-center gap-2">
                  {/* Step Content */}
                  <div
                    className={`flex items-center gap-2 ${styles.container}`}
                    onClick={() => {
                      if (status !== 'disabled' && onStepClick) {
                        onStepClick(step.id);
                      }
                    }}
                  >
                    {/* Step Circle */}
                    <div className={`
                      w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200
                      ${styles.circle}
                    `}>
                      {status === 'completed' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : status === 'current' ? (
                        <Icon className="w-4 h-4" />
                      ) : (
                        <span className="text-sm font-medium">{step.id}</span>
                      )}
                    </div>

                    {/* Step Text */}
                    <p className={`text-sm font-medium whitespace-nowrap ${styles.text}`}>
                      {step.name}
                    </p>
                  </div>
                </li>

                {/* Connector Arrow */}
                {stepIdx !== steps.length - 1 && (
                  <li>
                    <span
                      className={`text-xl leading-none transition-colors duration-300 ${
                        getStepStatus(step.id + 1) === 'completed' ||
                        getStepStatus(step.id + 1) === 'current'
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
          })}
        </ol>
      </nav>
    </div>
  );
}