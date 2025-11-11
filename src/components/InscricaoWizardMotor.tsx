import { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useInscricaoStore } from '../lib/store/inscricao';
import { 
  startWorkflowForLicense, 
  getCurrentStep, 
  completeStep,
  WorkflowStep 
} from '../services/workflowApi';

// Páginas do wizard
import ParticipantesPage from '../pages/inscricao/ParticipantesPage';
import ImovelPage from '../pages/inscricao/ImovelPage';
import EmpreendimentoPage from '../pages/inscricao/EmpreendimentoPage';
import FormularioPage from '../pages/inscricao/FormularioPage';
// import DocumentacaoPage from '../pages/inscricao/DocumentacaoPage';
// import RevisaoPage from '../pages/inscricao/RevisaoPage';

interface InscricaoWizardMotorProps {
  onClose: () => void;
  processoId?: string; // Se fornecido, retoma workflow existente
}

/**
 * Wizard de Inscrição controlado 100% pelo Workflow Engine (Motor BPMN)
 * 
 * Fluxo:
 * 1. Cria processo no banco
 * 2. Chama POST /workflow/instances/start
 * 3. Backend retorna step inicial (participantes)
 * 4. Cada "Próximo" chama POST /workflow/instances/{id}/steps/{stepId}/complete
 * 5. Backend avança para próximo step automaticamente
 * 6. Frontend apenas renderiza o step atual retornado pelo backend
 */
export default function InscricaoWizardMotor({ onClose, processoId }: InscricaoWizardMotorProps) {
  // Zustand store actions
  const setWorkflowInstance = useInscricaoStore(state => state.setWorkflowInstance);
  
  // Estado do workflow
  const [workflowInstanceId, setWorkflowInstanceId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<WorkflowStep | null>(null);
  const [currentProcessoId, setCurrentProcessoId] = useState<string | null>(processoId || null);
  const [isLoadingWorkflow, setIsLoadingWorkflow] = useState(false);
  const [workflowError, setWorkflowError] = useState<string | null>(null);
  
  // Estado da UI
  const [isInitializing, setIsInitializing] = useState(true);

  /**
   * Inicializa o workflow ao abrir o wizard
   */
  useEffect(() => {
    initializeWorkflow();
  }, []);

  /**
   * Inicia workflow (backend cria processo automaticamente)
   */
  const initializeWorkflow = async () => {
    setIsInitializing(true);
    setWorkflowError(null);

    try {
      console.log('� Iniciando workflow...');
      
      // Chama backend para iniciar workflow
      // Backend cria o processo automaticamente se não existir
      const workflowResponse = await startWorkflowForLicense(processoId || 'new');

      console.log('✅ Workflow iniciado:', workflowResponse);

      // Extrai processo_id da resposta se vier (pode estar em qualquer campo)
      const processId = (workflowResponse as any).processId || 
                       (workflowResponse as any).processo_id || 
                       workflowResponse.instanceId;
      
      setWorkflowInstanceId(workflowResponse.instanceId);
      setCurrentStep(workflowResponse.currentStep);
      setCurrentProcessoId(processId);
      
      // Salva no Zustand store
      setWorkflowInstance(workflowResponse.instanceId, workflowResponse.currentStep.id, workflowResponse.currentStep.key);

      toast.success('Workflow iniciado com sucesso!');
    } catch (error: any) {
      console.error('❌ Erro ao inicializar workflow:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao iniciar workflow';
      setWorkflowError(errorMessage);
      toast.error('Erro ao iniciar workflow: ' + errorMessage);
    } finally {
      setIsInitializing(false);
    }
  };

  /**
   * Avança para o próximo step (chama completeStep no backend)
   */
  const handleNext = async (stepData?: any) => {
    if (!workflowInstanceId || !currentStep) {
      toast.error('Workflow não inicializado');
      return;
    }

    setIsLoadingWorkflow(true);
    setWorkflowError(null);

    try {
      console.log(`📤 Completando step: ${currentStep.key}`, stepData);

      // Chama backend para completar step atual
      const response = await completeStep(
        workflowInstanceId,
        currentStep.id,
        stepData
      );

      console.log('✅ Step completado:', response);

      // Verifica se há próximo step
      if (response.nextStep) {
        setCurrentStep(response.nextStep);
        toast.success(`Avançado para: ${response.nextStep.label}`);
      } else {
        // Workflow finalizado
        toast.success('✅ Workflow finalizado com sucesso!');
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error: any) {
      console.error('❌ Erro ao avançar step:', error);
      setWorkflowError(error.message || 'Erro ao avançar step');
      toast.error('Erro ao avançar: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsLoadingWorkflow(false);
    }
  };

  /**
   * Volta para o step anterior (não implementado no motor ainda)
   */
  const handlePrevious = () => {
    toast.warning('Voltar step não implementado no motor ainda');
    // TODO: Implementar endpoint /workflow/instances/{id}/steps/{stepId}/back
  };

  /**
   * Monitora mudanças no Zustand store para atualizar o step atual
   */
  useEffect(() => {
    if (!workflowInstanceId) return;

    // Atualiza step local quando mudar no store
    const unsubscribe = useInscricaoStore.subscribe((state) => {
      if (state.currentStepKey && state.currentStepKey !== currentStep?.key) {
        // Step mudou - atualizar
        setCurrentStep({
          id: state.currentStepId || '',
          key: state.currentStepKey,
          label: state.currentStepKey,
          path: `/inscricao/${state.currentStepKey}`
        });
      }
    });

    return unsubscribe;
  }, [workflowInstanceId, currentStep]);

  /**
   * Renderiza o componente da página atual baseado no step.key
   */
  const renderCurrentStep = () => {
    if (!currentStep || !currentProcessoId) return null;

    const stepKey = currentStep.key;

    // Páginas gerenciam workflow internamente via Zustand + workflowApi
    // Não precisamos passar onNext/onPrevious
    switch (stepKey) {
      case 'participantes':
        return <ParticipantesPage />;

      case 'imovel':
        return <ImovelPage />;

      case 'empreendimento':
        return <EmpreendimentoPage />;

      case 'formulario':
        return <FormularioPage />;

      // case 'documentacao':
      //   return <DocumentacaoPage />;

      // case 'revisao':
      //   return <RevisaoPage />;

      default:
        return (
          <div className="p-8 text-center">
            <p className="text-red-600">
              ⚠️ Step não implementado: <code>{stepKey}</code>
            </p>
            <p className="text-gray-600 mt-2">
              Adicione o componente correspondente em renderCurrentStep()
            </p>
          </div>
        );
    }
  };

  /**
   * Renderiza tela de loading inicial
   */
  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <h2 className="text-xl font-bold text-gray-800">Inicializando Workflow...</h2>
            <p className="text-gray-600 text-center">
              Criando processo e iniciando motor BPMN
            </p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Renderiza tela de erro
   */
  if (workflowError && !currentStep) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Erro ao Inicializar</h2>
            <p className="text-gray-600 text-center">{workflowError}</p>
            <div className="flex space-x-3 w-full">
              <button
                onClick={initializeWorkflow}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Tentar Novamente
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Renderiza wizard principal
   */
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Nova Inscrição (Motor BPMN)
              </h2>
              <p className="text-sm text-blue-100">
                {currentStep ? currentStep.label : 'Carregando...'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        {currentStep && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">
                Step Atual: <code className="bg-gray-200 px-2 py-1 rounded">{currentStep.key}</code>
              </span>
              {workflowInstanceId && (
                <span className="text-gray-500 text-xs">
                  Instance: {workflowInstanceId.substring(0, 8)}...
                </span>
              )}
            </div>
            {/* TODO: Buscar todos os steps do template e mostrar progresso visual */}
          </div>
        )}

        {/* Erro durante navegação */}
        {workflowError && currentStep && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">⚠️ Erro</p>
            <p className="text-red-600 text-sm">{workflowError}</p>
          </div>
        )}

        {/* Content - Página atual do workflow */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingWorkflow ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-gray-600">Processando...</p>
              </div>
            </div>
          ) : (
            renderCurrentStep()
          )}
        </div>

        {/* Footer - Debug Info (remover em produção) */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 space-y-1">
            <div>🔧 Workflow Instance: {workflowInstanceId || 'N/A'}</div>
            <div>📍 Current Step: {currentStep?.key || 'N/A'} ({currentStep?.id || 'N/A'})</div>
            <div>🚀 Path: {currentStep?.path || 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
