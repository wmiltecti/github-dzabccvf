import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InscricaoState, Participant, Property, PropertyTitle } from '../../types/inscription';

interface InscricaoStore extends InscricaoState {
  // Actions
  setProcessId: (id: number) => void;
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
  isProcessInitializing: false
};

export const useInscricaoStore = create<InscricaoStore>()(
  persist(
    (set, get) => ({
      ...initialStoreState,

      // Actions
      setProcessId: (id: number) => set({ processId: id, isProcessInitializing: false }),

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

      reset: () => set(initialStoreState),

      // Computed
      isStepComplete: (step: number) => {
        const state = get();
        switch (step) {
          case 1: // Participantes
            return state.participants.length > 0 && 
                   state.participants.some(p => p.role === 'REQUERENTE');
          case 2: // Imóvel
            return !!state.property && !!state.propertyId;
          case 3: // Empreendimento
            return !!state.atividadeId;
          case 4: // Revisão
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
        propertyId: state.propertyId,
        participants: state.participants,
        property: state.property,
        titles: state.titles,
        atividadeId: state.atividadeId,
        currentStep: state.currentStep
      })
    }
  )
);