import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Tipos para o fluxo de Empreendimento
export interface EmpreendimentoProperty {
  id?: number;
  nome?: string;
  matricula?: string;
  area?: number;
  endereco?: string;
  municipio?: string;
  bairro?: string;
  car_codigo?: string;
}

export interface EmpreendimentoDadosGerais {
  nome_empreendimento?: string;
  descricao?: string;
  tipo?: string;
  porte?: string; // Mantido aqui para compatibilidade com store
  investimento?: number;
  // ... outros campos conforme necessário
}

export interface EmpreendimentoAtividade {
  id?: number;
  nome?: string;
  tipo?: string;
  descricao?: string;
  // ... outros campos conforme necessário
}

export interface EmpreendimentoCaracterizacao {
  recursos_hidricos?: boolean;
  area_preservacao?: boolean;
  impacto_ambiental?: string;
  medidas_mitigadoras?: string;
  // ... outros campos conforme necessário
}

export interface EmpreendimentoState {
  empreendimentoId: string | null;
  propertyId: number | null;
  property: EmpreendimentoProperty | null;
  dadosGerais: EmpreendimentoDadosGerais | null;
  atividades: EmpreendimentoAtividade[];
  caracterizacao: EmpreendimentoCaracterizacao | null;
  currentStep: number;
  isEmpreendimentoInitializing: boolean;
}

interface EmpreendimentoStore extends EmpreendimentoState {
  // Workflow Engine
  workflowInstanceId: string | null;
  currentStepId: string | null;
  currentStepKey: string | null;
  
  // Actions
  setEmpreendimentoId: (id: string) => void;
  setPropertyId: (id: number) => void;
  setProperty: (property: EmpreendimentoProperty) => void;
  setDadosGerais: (dados: EmpreendimentoDadosGerais) => void;
  setAtividades: (atividades: EmpreendimentoAtividade[]) => void;
  addAtividade: (atividade: EmpreendimentoAtividade) => void;
  removeAtividade: (index: number) => void;
  setCaracterizacao: (caracterizacao: EmpreendimentoCaracterizacao) => void;
  setCurrentStep: (step: number) => void;
  setEmpreendimentoInitializing: (initializing: boolean) => void;
  reset: () => void;
  startNewEmpreendimento: () => void;
  loadEmpreendimento: (empreendimentoId: string) => void;
  
  // Workflow Engine Actions
  setWorkflowInstance: (instanceId: string, stepId: string, stepKey: string) => void;
  setCurrentStepFromEngine: (stepId: string, stepKey: string) => void;
}

const initialState: EmpreendimentoState = {
  empreendimentoId: null,
  propertyId: null,
  property: null,
  dadosGerais: null,
  atividades: [],
  caracterizacao: null,
  currentStep: 1,
  isEmpreendimentoInitializing: false
};

const initialStoreState = {
  ...initialState,
  workflowInstanceId: null,
  currentStepId: null,
  currentStepKey: null
};

export const useEmpreendimentoStore = create<EmpreendimentoStore>()(
  persist(
    (set, get) => ({
      ...initialStoreState,

      // Actions
      setEmpreendimentoId: (id: string) => {
        console.log('📝 [Empreendimento Store] Setting empreendimentoId:', id);
        set({ empreendimentoId: id, isEmpreendimentoInitializing: false });
      },

      setPropertyId: (id: number) => set({ propertyId: id }),

      setProperty: (property: EmpreendimentoProperty) => set({ property }),

      setDadosGerais: (dados: EmpreendimentoDadosGerais) => set({ dadosGerais: dados }),

      setAtividades: (atividades: EmpreendimentoAtividade[]) => set({ atividades }),

      addAtividade: (atividade: EmpreendimentoAtividade) =>
        set(state => ({ atividades: [...state.atividades, atividade] })),

      removeAtividade: (index: number) =>
        set(state => ({
          atividades: state.atividades.filter((_, i) => i !== index)
        })),

      setCaracterizacao: (caracterizacao: EmpreendimentoCaracterizacao) => 
        set({ caracterizacao }),

      setCurrentStep: (step: number) => set({ currentStep: step }),

      setEmpreendimentoInitializing: (initializing: boolean) => 
        set({ isEmpreendimentoInitializing: initializing }),

      // Workflow Engine Actions
      setWorkflowInstance: (instanceId: string, stepId: string, stepKey: string) => {
        console.log('🔧 [Empreendimento Store] Setting workflow instance:', { instanceId, stepId, stepKey });
        set({ 
          workflowInstanceId: instanceId,
          currentStepId: stepId,
          currentStepKey: stepKey
        });
      },

      setCurrentStepFromEngine: (stepId: string, stepKey: string) => {
        console.log('🔧 [Empreendimento Store] Updating current step from engine:', { stepId, stepKey });
        set({ 
          currentStepId: stepId,
          currentStepKey: stepKey
        });
      },

      reset: () => {
        console.log('🔄 [Empreendimento Store] Resetting store');
        set(initialStoreState);
      },

      startNewEmpreendimento: () => {
        console.log('✨ [Empreendimento Store] Starting new empreendimento');
        set({
          ...initialStoreState,
          currentStep: 1
        });
      },

      loadEmpreendimento: (empreendimentoId: string) => {
        console.log('📂 [Empreendimento Store] Loading empreendimento:', empreendimentoId);
        set({ 
          empreendimentoId,
          isEmpreendimentoInitializing: true
        });
      }
    }),
    {
      name: 'empreendimento-storage',
      partialize: (state) => ({
        empreendimentoId: state.empreendimentoId,
        propertyId: state.propertyId,
        property: state.property,
        dadosGerais: state.dadosGerais,
        atividades: state.atividades,
        caracterizacao: state.caracterizacao,
        currentStep: state.currentStep,
        workflowInstanceId: state.workflowInstanceId,
        currentStepId: state.currentStepId,
        currentStepKey: state.currentStepKey
      })
    }
  )
);
