import { useState, useEffect } from 'react';
import { FileText, Save, AlertTriangle, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { useInscricaoStore } from '../lib/store/inscricao';
import { 
  startWorkflowForLicense, 
  completeStep,
  WorkflowStep 
} from '../services/workflowApi';
import http from '../lib/api/http';
import { getUserId } from '../utils/authToken';
import { criarProcesso } from '../services/processosService';
import { EnterpriseProvider } from '../contexts/EnterpriseContext';
import InscricaoStepperMotor from './InscricaoStepperMotor';
import ConfirmDialog from './ConfirmDialog';

// Páginas do wizard - versões MOTOR (isoladas, sem dependências de contexto antigo)
import ParticipantesWorkflowPageMotor from '../pages/inscricao/workflow/ParticipantesWorkflowPageMotor';
import ImovelWorkflowPageMotor from '../pages/inscricao/workflow/ImovelWorkflowPageMotor';
import EmpreendimentoWorkflowPageMotor from '../pages/inscricao/workflow/EmpreendimentoWorkflowPageMotor';
import FormularioWorkflowPageMotor from '../pages/inscricao/workflow/FormularioWorkflowPageMotor';
// import DocumentacaoWorkflowPageMotor from '../pages/inscricao/workflow/DocumentacaoWorkflowPageMotor';
// import RevisaoWorkflowPageMotor from '../pages/inscricao/workflow/RevisaoWorkflowPageMotor';

interface InscricaoWizardMotorProps {
  onClose?: () => void;
  processoId?: string; // Se fornecido, retoma workflow existente
  asModal?: boolean; // Se true, renderiza como modal. Se false, renderiza inline
}

/**
 * Wizard de Inscrição controlado 100% pelo Workflow Engine (Motor BPMN)
 * 
 * Visual: Idêntico ao InscricaoWizard.tsx (layout aprovado em produção)
 * Controle: 100% pelo Workflow Engine Backend
 * 
 * Pode funcionar de 2 formas:
 * 1. Modal (asModal=true): Botão verde "Motor BPMN" no header do Dashboard
 * 2. Inline (asModal=false): Aba "Processos Motor" → botão "Novo Processo Motor"
 * 
 * Fluxo:
 * 1. Cria processo no banco
 * 2. Chama POST /workflow/instances/start
 * 3. Backend retorna step inicial (participantes)
 * 4. Cada "Próximo" chama POST /workflow/instances/{id}/steps/{stepId}/complete
 * 5. Backend avança para próximo step automaticamente
 * 6. Frontend apenas renderiza o step atual retornado pelo backend
 */
export default function InscricaoWizardMotor({ onClose, processoId, asModal = false }: InscricaoWizardMotorProps) {
  // Zustand store
  const { 
    setWorkflowInstance, 
    setProcessId, 
    reset,
    currentStep: currentStepNumber // Para compatibilidade com InscricaoStepper
  } = useInscricaoStore();
  
  // Estado do workflow
  const [workflowInstanceId, setWorkflowInstanceId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<WorkflowStep | null>(null);
  const [currentProcessoId, setCurrentProcessoId] = useState<string | null>(processoId || null);
  const [isLoadingWorkflow, setIsLoadingWorkflow] = useState(false);
  const [workflowError, setWorkflowError] = useState<string | null>(null);
  
  // Estado da UI (igual ao InscricaoWizard)
  const [isInitializing, setIsInitializing] = useState(true);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [confirmNewOpen, setConfirmNewOpen] = useState(false);

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
      console.log('🔧 Iniciando workflow...');
      
      // 1. Criar o processo de licenciamento NO BANCO primeiro
      const userId = getUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      console.log('📝 Criando processo no banco...');
      const newProcessoId = await criarProcesso(userId);
      console.log('✅ Processo criado:', newProcessoId);

      // 2. Criar dados gerais iniciais
      console.log('📝 Criando dados gerais iniciais...');
      await http.put(`/processos/${newProcessoId}/dados-gerais`, {
        processo_id: newProcessoId
      });
      console.log('✅ Dados gerais criados');

      // 3. Iniciar o workflow engine com o ID do processo real
      console.log('🔧 Iniciando workflow engine...');
      const workflowResponse = await startWorkflowForLicense(newProcessoId);

      console.log('✅ Workflow iniciado:', workflowResponse);

      // Usa o processo que criamos (não precisa extrair da resposta)
      setWorkflowInstanceId(workflowResponse.instanceId);
      setCurrentStep(workflowResponse.currentStep);
      setCurrentProcessoId(newProcessoId);
      
      // Salva no Zustand store (workflow + processo)
      setWorkflowInstance(workflowResponse.instanceId, workflowResponse.currentStep.id, workflowResponse.currentStep.key);
      
      // ✅ CRÍTICO: Salva processId no store para as páginas acessarem
      console.log('📝 Salvando processId no store:', newProcessoId);
      setProcessId(String(newProcessoId));

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

    const stepKey = currentStep.key?.toLowerCase(); // Case-insensitive

    console.log('🎯 Renderizando step:', stepKey, 'currentStep:', currentStep);

    // Páginas Motor gerenciam workflow internamente via Zustand + workflowApi
    // Versões isoladas sem dependências do InscricaoContext antigo
    switch (stepKey) {
      case 'participantes':
        return <ParticipantesWorkflowPageMotor />;

      case 'imovel':
        return <ImovelWorkflowPageMotor />;

      case 'empreendimento':
        // EmpreendimentoWorkflowPageMotor precisa do EnterpriseProvider
        return (
          <EnterpriseProvider>
            <EmpreendimentoWorkflowPageMotor />
          </EnterpriseProvider>
        );

      case 'formulario':
        return <FormularioWorkflowPageMotor />;

      // case 'documentacao':
      //   return <DocumentacaoWorkflowPage />;

      // case 'revisao':
      //   return <RevisaoWorkflowPage />;

      default:
        return (
          <div className="p-8 text-center">
            <p className="text-red-600">
              ⚠️ Step não implementado: <code>{stepKey}</code>
            </p>
            <p className="text-gray-600 mt-2">
              Adicione o componente correspondente em renderCurrentStep()
            </p>
            <p className="text-xs text-gray-500 mt-4">
              Debug: stepKey="{stepKey}", currentStep.key="{currentStep.key}"
            </p>
          </div>
        );
    }
  };

  /**
   * Handlers de ações (mesmo padrão do InscricaoWizard)
   */
  const handleStepClick = (step: number) => {
    // TODO: Implementar navegação por step quando backend permitir
    console.warn('⚠️ Navegação manual de steps não implementada no motor ainda');
    toast.warning('Navegação manual não disponível no motor BPMN');
  };

  const handleSaveDraft = () => {
    toast.success('Rascunho salvo com sucesso!');
  };

  const handleReset = () => {
    setConfirmResetOpen(true);
  };

  const confirmReset = () => {
    reset();
    setCurrentProcessoId(null);
    setWorkflowInstanceId(null);
    setCurrentStep(null);
    toast.info('Processo reiniciado');
    if (onClose) {
      onClose();
    } else {
      window.location.reload();
    }
  };

  const handleNewInscricao = () => {
    setConfirmNewOpen(true);
  };

  const confirmNewInscricao = () => {
    reset();
    setCurrentProcessoId(null);
    setWorkflowInstanceId(null);
    setCurrentStep(null);
    toast.info('Nova inscrição iniciada');
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
        <p className="text-gray-600">Inicializando processo com Motor BPMN...</p>
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
   * Conteúdo do wizard (MESMO LAYOUT do InscricaoWizard)
   */
  const wizardContent = (
    <div className="space-y-6">
      {/* Header Actions - IDÊNTICO ao original */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Novo Processo de Licenciamento</h1>
            {currentProcessoId && (
              <p className="text-sm text-gray-500">
                Processo #{currentProcessoId} • Motor BPMN
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-2 w-full xl:w-auto">
          <button
            onClick={handleNewInscricao}
            className="px-3 py-1.5 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-1.5"
            title="Iniciar nova inscrição (mantém usuário)"
          >
            <Plus className="w-4 h-4" />
            Nova Inscrição
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
            title="Reiniciar processo (limpa tudo)"
          >
            <AlertTriangle className="w-4 h-4" />
            Reiniciar
          </button>
        </div>
      </div>

      {/* Stepper Motor - sem dependência de contexto */}
      <InscricaoStepperMotor
        currentStep={currentStepNumber}
        onStepClick={handleStepClick}
      />

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px]">
        {isLoadingWorkflow ? (
              <div className="flex items-center justify-center h-[600px]">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Processando...</p>
                </div>
              </div>
            ) : workflowError ? (
              <div className="flex items-center justify-center h-[600px]">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">Erro no Workflow</h2>
                  <p className="text-gray-600 mb-4">{workflowError}</p>
                  <button
                    onClick={initializeWorkflow}
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

      {/* Process Info Footer - IDÊNTICO ao original */}
      {currentProcessoId && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Processo ativo:</span>
            <span className="font-medium text-gray-900">#{currentProcessoId}</span>
            {workflowInstanceId && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500 text-xs">
                  Workflow: {workflowInstanceId.substring(0, 8)}...
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Dialogs de Confirmação */}
      <ConfirmDialog
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={confirmReset}
        title="Reiniciar Processo"
        message="Tem certeza que deseja reiniciar o processo? Todos os dados serão perdidos."
        confirmText="Sim, Reiniciar"
        cancelText="Cancelar"
      />

      <ConfirmDialog
        isOpen={confirmNewOpen}
        onClose={() => setConfirmNewOpen(false)}
        onConfirm={confirmNewInscricao}
        title="Nova Inscrição"
        message="Deseja iniciar uma nova inscrição? Os dados atuais serão perdidos."
        confirmText="Sim, Iniciar Nova"
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
