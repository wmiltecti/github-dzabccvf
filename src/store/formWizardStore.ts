import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FormData {
  step1?: any;
  step2?: any;
  step3?: any;
  step4?: any;
  step5?: any;
  step6?: any;
}

interface FormWizardStore {
  currentStep: number;
  formData: FormData;
  processoId: string | null;
  protocoloInterno?: string;
  numeroProcessoExterno?: string | null;
  isOfflineMode: boolean;
  setCurrentStep: (step: number) => void;
  updateStepData: (step: number, data: any) => void;
  clearFormData: () => void;
  nextStep: () => void;
  previousStep: () => void;
  setProcessoId: (id: string) => void;
  setProtocoloInterno: (protocolo: string) => void;
  setNumeroProcessoExterno: (numero: string | null) => void;
  setOfflineMode: (isOffline: boolean) => void;
  resetProcesso: () => void;
}

export const useFormWizardStore = create<FormWizardStore>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      formData: {},
      processoId: null,
      protocoloInterno: undefined,
      numeroProcessoExterno: undefined,
      isOfflineMode: false,

      setCurrentStep: (step: number) => set({ currentStep: step }),

      updateStepData: (step: number, data: any) =>
        set((state) => ({
          formData: {
            ...state.formData,
            [`step${step}`]: { ...state.formData[`step${step}` as keyof FormData], ...data }
          }
        })),

      clearFormData: () => set({ formData: {}, currentStep: 1 }),

      nextStep: () => set((state) => ({
        currentStep: Math.min(state.currentStep + 1, 6)
      })),

      previousStep: () => set((state) => ({
        currentStep: Math.max(state.currentStep - 1, 1)
      })),

      setProcessoId: (id: string) => set({ processoId: id }),

      setProtocoloInterno: (protocolo: string) => set({ protocoloInterno: protocolo }),

      setNumeroProcessoExterno: (numero: string | null) => set({ numeroProcessoExterno: numero }),

      setOfflineMode: (isOffline: boolean) => set({ isOfflineMode: isOffline }),

      resetProcesso: () => set({
        processoId: null,
        formData: {},
        currentStep: 1,
        protocoloInterno: undefined,
        numeroProcessoExterno: undefined,
        isOfflineMode: false
      })
    }),
    {
      name: 'form-wizard-storage',
    }
  )
);
