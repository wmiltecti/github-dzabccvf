import React, { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useInscricaoStore } from '../lib/store/inscricao';

interface InscricaoContextType {
  processoId: string | null;
  // Workflow Engine
  workflowInstanceId: string | null;
  currentStepId: string | null;
  currentStepKey: string | null;
  // Subprocess
  subprocessInstanceId: string | null;
  subprocessCurrentStepId: string | null;
  subprocessCurrentStepKey: string | null;
}

const InscricaoContext = createContext<InscricaoContextType | undefined>(undefined);

// Mapeamento de rotas para steps (FONTE ÚNICA DE VERDADE)
const ROUTE_TO_STEP_MAP = {
  '/inscricao/empreendimento': { step: 1, key: 'EMPREENDIMENTO' },
  '/inscricao/participantes': { step: 2, key: 'PARTICIPANTES' },
  '/inscricao/licenca': { step: 3, key: 'LICENCA' },
  '/inscricao/revisao': { step: 4, key: 'REVISAO' }
} as const;

export function InscricaoProvider({
  children,
  processoId
}: {
  children: React.ReactNode;
  processoId: string | null;
}) {
  const location = useLocation();
  const setCurrentStepFromEngine = useInscricaoStore(state => state.setCurrentStepFromEngine);
  const setCurrentStep = useInscricaoStore(state => state.setCurrentStep);

  // 🔥 CRITICAL: Sincroniza o store com a rota IMEDIATAMENTE
  useEffect(() => {
    const stepData = ROUTE_TO_STEP_MAP[location.pathname as keyof typeof ROUTE_TO_STEP_MAP];
    if (stepData) {
      console.log('🎯 [InscricaoContext] Sincronizando step com rota:', location.pathname, '→', stepData.key);
      setCurrentStep(stepData.step);
      setCurrentStepFromEngine('step-' + stepData.step, stepData.key);
    }
  }, [location.pathname, setCurrentStep, setCurrentStepFromEngine]);

  // Busca os dados do workflow do Zustand store
  const workflowInstanceId = useInscricaoStore(state => state.workflowInstanceId);
  const currentStepId = useInscricaoStore(state => state.currentStepId);
  const currentStepKey = useInscricaoStore(state => state.currentStepKey);

  // Busca os dados do subprocess do Zustand store
  const subprocessInstanceId = useInscricaoStore(state => state.subprocessInstanceId);
  const subprocessCurrentStepId = useInscricaoStore(state => state.subprocessCurrentStepId);
  const subprocessCurrentStepKey = useInscricaoStore(state => state.subprocessCurrentStepKey);

  return (
    <InscricaoContext.Provider 
      value={{ 
        processoId,
        workflowInstanceId,
        currentStepId,
        currentStepKey,
        subprocessInstanceId,
        subprocessCurrentStepId,
        subprocessCurrentStepKey
      }}
    >
      {children}
    </InscricaoContext.Provider>
  );
}

export function useInscricaoContext() {
  const context = useContext(InscricaoContext);
  if (context === undefined) {
    throw new Error('useInscricaoContext must be used within InscricaoProvider');
  }
  return context;
}
