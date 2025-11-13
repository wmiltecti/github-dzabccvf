import { useState, useEffect, useRef } from 'react';
import { Building, Save, AlertTriangle, Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { useEmpreendimentoStore } from '../lib/store/empreendimento';
import EmpreendimentoStepper from './EmpreendimentoStepper';
import ConfirmDialog from './ConfirmDialog';

// Páginas do wizard de Empreendimento (serão criadas)
import ImovelEmpreendimentoPage from '../pages/empreendimento/ImovelEmpreendimentoPage';
import DadosGeraisEmpreendimentoPage from '../pages/empreendimento/DadosGeraisEmpreendimentoPage';
import AtividadesEmpreendimentoPage from '../pages/empreendimento/AtividadesEmpreendimentoPage';
import CaracterizacaoEmpreendimentoPage from '../pages/empreendimento/CaracterizacaoEmpreendimentoPage';
import DocumentacaoEmpreendimentoPage from '../pages/empreendimento/DocumentacaoEmpreendimentoPage';

interface EmpreendimentoWizardMotorProps {
  onClose?: () => void;
  empreendimentoId?: string; // Se fornecido, retoma workflow existente
  asModal?: boolean; // Se true, renderiza como modal. Se false, renderiza inline
}

/**
 * Wizard de Empreendimento controlado por Workflow Engine
 * 
 * Fluxo: Imóvel → Dados Gerais → Atividades → Caracterização → Documentação
 * 
 * Segue o mesmo padrão do InscricaoWizardMotor
 */
export default function EmpreendimentoWizardMotor({ 
  onClose, 
  empreendimentoId, 
  asModal = false 
}: EmpreendimentoWizardMotorProps) {
  // Zustand store
  const { 
    currentStep: currentStepNumber,
    reset,
    setEmpreendimentoId
  } = useEmpreendimentoStore();
  
  // Proteção contra execução dupla (React Strict Mode)
  const initRef = useRef(false);
  
  // Estado da UI
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [confirmNewOpen, setConfirmNewOpen] = useState(false);

  /**
   * Inicializa o workflow ao abrir o wizard
   */
  useEffect(() => {
    if (initRef.current) {
      console.log('⚠️ initializeEmpreendimento já foi chamado, pulando execução duplicada');
      return;
    }
    
    initRef.current = true;
    console.log('✅ Primeira execução de initializeEmpreendimento');
    initializeEmpreendimento();
  }, []);

  /**
   * Inicia workflow de empreendimento
   */
  const initializeEmpreendimento = async () => {
    console.log('🚀 initializeEmpreendimento INICIADO');
    setIsInitializing(true);
    setError(null);

    try {
      console.log('🔧 Iniciando workflow de empreendimento...');
      
      // TODO: Implementar chamada ao backend para criar empreendimento
      // Por enquanto, apenas inicializa localmente
      
      // Gera ID temporário
      const newEmpreendimentoId = `emp_${Date.now()}`;
      console.log('✅ Empreendimento criado:', newEmpreendimentoId);

      setEmpreendimentoId(newEmpreendimentoId);
      toast.success('Novo empreendimento iniciado!');
    } catch (error: any) {
      console.error('❌ Erro ao inicializar empreendimento:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao iniciar empreendimento';
      setError(errorMessage);
      toast.error('Erro ao iniciar empreendimento: ' + errorMessage);
    } finally {
      setIsInitializing(false);
    }
  };

  /**
   * Avança para o próximo step
   */
  const handleNext = async (stepData?: any) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`📤 Avançando do step ${currentStepNumber}`, stepData);
      
      // TODO: Implementar validação e salvamento no backend
      
      // Por enquanto, apenas avança localmente
      toast.success(`Step ${currentStepNumber} salvo!`);
      
      // Se não for o último step, avança
      if (currentStepNumber < 5) {
        useEmpreendimentoStore.setState({ currentStep: currentStepNumber + 1 });
      } else {
        // Último step - finalizar
        toast.success('✅ Empreendimento finalizado com sucesso!');
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      }
    } catch (error: any) {
      console.error('❌ Erro ao avançar step:', error);
      setError(error.message || 'Erro ao avançar step');
      toast.error('Erro ao avançar: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Volta para o step anterior
   */
  const handlePrevious = () => {
    if (currentStepNumber > 1) {
      useEmpreendimentoStore.setState({ currentStep: currentStepNumber - 1 });
      toast.info(`Voltando para step ${currentStepNumber - 1}`);
    }
  };

  /**
   * Renderiza o componente da página atual baseado no step
   */
  const renderCurrentStep = () => {
    console.log('🎯 Renderizando step:', currentStepNumber);

    switch (currentStepNumber) {
      case 1:
        return <ImovelEmpreendimentoPage onNext={handleNext} onPrevious={handlePrevious} />;
      case 2:
        return <DadosGeraisEmpreendimentoPage onNext={handleNext} onPrevious={handlePrevious} />;
      case 3:
        return <AtividadesEmpreendimentoPage onNext={handleNext} onPrevious={handlePrevious} />;
      case 4:
        return <CaracterizacaoEmpreendimentoPage onNext={handleNext} onPrevious={handlePrevious} />;
      case 5:
        return <DocumentacaoEmpreendimentoPage onNext={handleNext} onPrevious={handlePrevious} />;
      default:
        return (
          <div className="p-8 text-center">
            <p className="text-red-600">
              ⚠️ Step não implementado: {currentStepNumber}
            </p>
          </div>
        );
    }
  };

  /**
   * Handlers de ações
   */
  const handleStepClick = (step: number) => {
    console.log('🖱️ Click no step:', step);
    useEmpreendimentoStore.setState({ currentStep: step });
  };

  const handleSaveDraft = () => {
    toast.success('Rascunho salvo com sucesso!');
  };

  const handleReset = () => {
    setConfirmResetOpen(true);
  };

  const confirmReset = () => {
    reset();
    toast.info('Empreendimento reiniciado');
    if (onClose) {
      onClose();
    } else {
      window.location.reload();
    }
  };

  const handleNewEmpreendimento = () => {
    setConfirmNewOpen(true);
  };

  const confirmNewEmpreendimento = () => {
    reset();
    toast.info('Novo empreendimento iniciado');
    if (onClose) {
      onClose();
    } else {
      window.location.reload();
    }
  };

  /**
   * Renderiza tela de loading inicial
   */
  if (isInitializing) {
    const loadingContent = (
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Inicializando empreendimento...</p>
      </div>
    );

    if (asModal) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
            {loadingContent}
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {loadingContent}
      </div>
    );
  }

  /**
   * Conteúdo do wizard
   */
  const wizardContent = (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Building className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Novo Empreendimento</h1>
            {empreendimentoId && (
              <p className="text-sm text-gray-500">ID: {empreendimentoId}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-2 w-full xl:w-auto">
          <button
            onClick={handleNewEmpreendimento}
            className="px-3 py-1.5 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-1.5"
            title="Iniciar novo empreendimento"
          >
            <Plus className="w-4 h-4" />
            Novo Empreendimento
          </button>
          <button
            onClick={handleSaveDraft}
            className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            Salvar Rascunho
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
            title="Reiniciar empreendimento"
          >
            <AlertTriangle className="w-4 h-4" />
            Reiniciar
          </button>
        </div>
      </div>

      {/* Stepper */}
      <EmpreendimentoStepper
        currentStep={currentStepNumber}
        onStepClick={handleStepClick}
      />

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-[600px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Processando...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[600px]">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Erro</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={initializeEmpreendimento}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        ) : (
          renderCurrentStep()
        )}
      </div>

      {/* Dialogs de Confirmação */}
      <ConfirmDialog
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={confirmReset}
        title="Reiniciar Empreendimento"
        message="Tem certeza que deseja reiniciar o empreendimento? Todos os dados serão perdidos."
        confirmText="Sim, Reiniciar"
        cancelText="Cancelar"
      />

      <ConfirmDialog
        isOpen={confirmNewOpen}
        onClose={() => setConfirmNewOpen(false)}
        onConfirm={confirmNewEmpreendimento}
        title="Novo Empreendimento"
        message="Deseja iniciar um novo empreendimento? Os dados atuais serão perdidos."
        confirmText="Sim, Iniciar Novo"
        cancelText="Cancelar"
      />
    </div>
  );

  /**
   * Se asModal=true, envolve o conteúdo em um modal flutuante
   * Se asModal=false, retorna conteúdo inline
   */
  if (asModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-gray-50 rounded-lg shadow-2xl w-full max-w-7xl my-8">
          <div className="max-h-[90vh] overflow-y-auto p-6">
            {wizardContent}
          </div>
        </div>
      </div>
    );
  }

  return wizardContent;
}
