import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InscricaoState, Participant, Property, PropertyTitle } from '../../types/inscription';

interface InscricaoStore extends InscricaoState {
  // User info (para auditoria)
  userId: string | null;
  
  // Workflow Engine
  workflowInstanceId: string | null;
  currentStepId: string | null;
  currentStepKey: string | null;
  
  // Subprocesso (Subfluxo)
  subprocessInstanceId: string | null;
  subprocessCurrentStepId: string | null;
  subprocessCurrentStepKey: string | null;
  
  // Actions
  setProcessId: (id: string) => void;
  setUserId: (id: string) => void;
  setPropertyId: (id: number) => void;
  setParticipants: (participants: Participant[]) => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (index: number) => void;
  updateParticipant: (index: number, participant: Participant) => void;
  setProperty: (property: Property) => void;
  setTitles: (titles: PropertyTitle[]) => void;
  addTitle: (title: PropertyTitle) => void;
  removeTitle: (index: number) => void;
  setAtividadeId: (id: number) => void;
  setCurrentStep: (step: number) => void;
  setProcessInitializing: (initializing: boolean) => void;
  reset: () => void;
  startNewInscricao: () => void; // Limpa tudo para nova solicitação
  loadInscricao: (processId: string) => void; // Carrega solicitação existente
  
  // Workflow Engine Actions
  setWorkflowInstance: (instanceId: string, stepId: string, stepKey: string) => void;
  setCurrentStepFromEngine: (stepId: string, stepKey: string) => void;
  
  // Subprocess Actions
  setSubprocessInstance: (instanceId: string, stepId: string, stepKey: string) => void;
  clearSubprocess: () => void;

  // Computed
  isStepComplete: (step: number) => boolean;
  canProceedToStep: (step: number) => boolean;
  isProcessInitializing: boolean;
}

const initialState: InscricaoState = {
  processId: null,
  propertyId: null,
  participants: [],
  property: null,
  titles: [],
  atividadeId: null,
  currentStep: 1
};

const initialStoreState = {
  ...initialState,
  userId: null,
  isProcessInitializing: false,
  // Workflow Engine
  workflowInstanceId: null,
  currentStepId: null,
  currentStepKey: null,
  // Subprocesso
  subprocessInstanceId: null,
  subprocessCurrentStepId: null,
  subprocessCurrentStepKey: null
};

export const useInscricaoStore = create<InscricaoStore>()(
  persist(
    (set, get) => ({
      ...initialStoreState,

      // Actions
      setProcessId: (id: string) => {
        console.log('📝 [Store] Setting processId:', id);
        set({ processId: id, isProcessInitializing: false });
      },

      setUserId: (id: string) => {
        console.log('👤 [Store] Setting userId:', id);
        set({ userId: id });
      },

      setPropertyId: (id: number) => set({ propertyId: id }),

      setParticipants: (participants: Participant[]) => set({ participants }),

      addParticipant: (participant: Participant) =>
        set(state => ({ participants: [...state.participants, participant] })),

      removeParticipant: (index: number) =>
        set(state => ({
          participants: state.participants.filter((_, i) => i !== index)
        })),

      updateParticipant: (index: number, participant: Participant) =>
        set(state => ({
          participants: state.participants.map((p, i) => i === index ? participant : p)
        })),

      setProperty: (property: Property) => set({ property }),

      setTitles: (titles: PropertyTitle[]) => set({ titles }),

      addTitle: (title: PropertyTitle) =>
        set(state => ({ titles: [...state.titles, title] })),

      removeTitle: (index: number) =>
        set(state => ({
          titles: state.titles.filter((_, i) => i !== index)
        })),

      setAtividadeId: (id: number) => set({ atividadeId: id }),

      setCurrentStep: (step: number) => set({ currentStep: step }),

      setProcessInitializing: (initializing: boolean) => set({ isProcessInitializing: initializing }),

      // Workflow Engine Actions
      setWorkflowInstance: (instanceId: string, stepId: string, stepKey: string) => {
        console.log('🔧 [Store] Setting workflow instance:', { instanceId, stepId, stepKey });
        set({ 
          workflowInstanceId: instanceId,
          currentStepId: stepId,
          currentStepKey: stepKey
        });
      },

      setCurrentStepFromEngine: (stepId: string, stepKey: string) => {
        console.log('🔧 [Store] Updating current step from engine:', { stepId, stepKey });
        set({ 
          currentStepId: stepId,
          currentStepKey: stepKey
        });
      },

      // Subprocess Actions
      setSubprocessInstance: (instanceId: string, stepId: string, stepKey: string) => {
        console.log('🔄 [Store] Setting subprocess instance:', { instanceId, stepId, stepKey });
        set({ 
          subprocessInstanceId: instanceId,
          subprocessCurrentStepId: stepId,
          subprocessCurrentStepKey: stepKey
        });
      },

      clearSubprocess: () => {
        console.log('🔄 [Store] Clearing subprocess');
        set({ 
          subprocessInstanceId: null,
          subprocessCurrentStepId: null,
          subprocessCurrentStepKey: null
        });
      },

      reset: () => {
        console.log('🔄 [Store] Resetting all state');
        set(initialStoreState);
      },

      // Nova inscrição: limpa tudo exceto userId
      startNewInscricao: () => {
        const currentUserId = get().userId;
        console.log('🆕 [Store] Starting new inscription, keeping userId:', currentUserId);
        set({
          ...initialStoreState,
          userId: currentUserId, // Mantém o userId para auditoria
          processId: null,
          isProcessInitializing: false,
          // Limpa workflow
          workflowInstanceId: null,
          currentStepId: null,
          currentStepKey: null,
          // Limpa subprocess
          subprocessInstanceId: null,
          subprocessCurrentStepId: null,
          subprocessCurrentStepKey: null
        });
      },

      // Carregar inscrição existente
      loadInscricao: (processId: string) => {
        console.log('📂 [Store] Loading existing inscription:', processId);
        set({ 
          processId,
          currentStep: 1,
          isProcessInitializing: false
        });
        // Aqui você pode adicionar lógica para carregar dados do backend
      },

      // Computed
      isStepComplete: (step: number) => {
        const state = get();
        switch (step) {
          case 1: // Participantes
            return state.participants.length > 0 && 
                   state.participants.some(p => p.role === 'REQUERENTE');
          case 2: // Imóvel
            return !!state.property && !!state.propertyId;
          case 3: // Atividade
            return !!state.atividadeId;
          case 4: // Formulário
            // TODO: Adicionar validação se formulário foi preenchido
            return true; // Por enquanto sempre true
          case 5: // Documentação
            // TODO: Adicionar validação se docs foram enviados
            return true; // Por enquanto sempre true
          case 6: // Revisão
            return true; // Always complete if reached
          default:
            return false;
        }
      },
      
      canProceedToStep: (step: number) => {
        const state = get();
        if (step <= 1) return true;
        
        // Check if previous steps are complete
        for (let i = 1; i < step; i++) {
          if (!state.isStepComplete(i)) return false;
        }
        return true;
      }
    }),
    {
      name: 'inscricao-storage',
      partialize: (state) => ({
        processId: state.processId,
        userId: state.userId, // Persiste userId para auditoria
        propertyId: state.propertyId,
        participants: state.participants,
        property: state.property,
        titles: state.titles,
        atividadeId: state.atividadeId,
        currentStep: state.currentStep,
        // Workflow Engine
        workflowInstanceId: state.workflowInstanceId,
        currentStepId: state.currentStepId,
        currentStepKey: state.currentStepKey
      })
    }
  )
);