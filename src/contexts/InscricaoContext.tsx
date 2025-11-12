import React, { createContext, useContext } from 'react';
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

export function InscricaoProvider({ 
  children, 
  processoId 
}: { 
  children: React.ReactNode; 
  processoId: string | null;
}) {
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
