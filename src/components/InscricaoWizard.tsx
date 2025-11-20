import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInscricaoStore } from '../lib/store/inscricao';
import { criarProcesso } from '../services/processosService';
import { getUserId } from '../utils/authToken';
import { InscricaoProvider } from '../contexts/InscricaoContext';
import { EnterpriseProvider } from '../contexts/EnterpriseContext';
import InscricaoStepper from './InscricaoStepper';
import { FileText, Save, AlertTriangle, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import http from '../lib/api/http';
import EmpreendimentoPageNew from '../pages/inscricao/EmpreendimentoPageNew';
import ParticipantesPage from '../pages/inscricao/ParticipantesPage';
import LicencaSolicitadaPage from '../pages/inscricao/LicencaSolicitadaPage';
import RevisaoPage from '../pages/inscricao/RevisaoPage';
import ConfirmDialog from './ConfirmDialog';
import { startWorkflowForLicense } from '../services/workflowApi';

export default function InscricaoWizard() {
  const navigate = useNavigate();
  const { 
    currentStep, 
    setCurrentStep, 
    reset, 
    startNewInscricao,
    setWorkflowInstance,
    setProcessId: setProcessIdInStore
  } = useInscricaoStore();

  const [processoId, setProcessoId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [confirmNewOpen, setConfirmNewOpen] = useState(false);

  const isCreatingProcesso = useRef(false);

  useEffect(() => {
    const initializeProcesso = async () => {
      if (processoId) {
        console.log('✅ [InscricaoWizard] Processo já existe:', processoId);
        setIsInitializing(false);
        return;
      }

      if (isCreatingProcesso.current) {
        console.log('🔒 [InscricaoWizard] Já está criando processo, aguardando...');
        return;
      }

      console.log('🚀 [InscricaoWizard] Iniciando criação de novo processo...');
      setIsInitializing(true);
      isCreatingProcesso.current = true;

      try {
        // 1. Criar o processo de licenciamento
        const userId = getUserId();
        if (!userId) {
          console.error('❌ [InscricaoWizard] Usuário não autenticado');
          toast.error('Usuário não autenticado');
          setIsInitializing(false);
          isCreatingProcesso.current = false;
          return;
        }
        
        console.log('👤 [InscricaoWizard] UserId:', userId);
        
        const newProcessoId = await criarProcesso(userId);
        console.log('✅ Processo criado na API (id remoto):', newProcessoId);

        // 2. Criar dados gerais iniciais
        console.log('📝 Criando dados gerais iniciais...');
        await http.put(`/processos/${newProcessoId}/dados-gerais`, {
          processo_id: newProcessoId
        });
        console.log('✅ Dados gerais criados');

        // 3. Tentar iniciar o workflow engine (opcional)
        console.log('🔧 Tentando iniciar workflow engine...');
        try {
          const workflowResponse = await startWorkflowForLicense(newProcessoId);
          console.log('✅ Workflow iniciado:', workflowResponse);

          // Salvar instância do workflow no store
          setWorkflowInstance(
            workflowResponse.instanceId,
            workflowResponse.currentStep.id,
            workflowResponse.currentStep.key
          );
          console.log('✅ Workflow instance salva no store');
        } catch (workflowError: any) {
          console.warn('⚠️ Workflow engine não disponível, continuando em modo manual:', workflowError.message);
          // Continua sem workflow engine - modo manual
        }

        // 4. Salvar processoId no store (CRÍTICO para as páginas acessarem)
        setProcessIdInStore(String(newProcessoId));
        console.log('✅ ProcessId salvo no store:', newProcessoId);
        
        setProcessoId(newProcessoId);
        
        toast.success('Processo iniciado com sucesso!');
      } catch (error: any) {
        console.error('❌ Erro ao criar processo:', error);
        toast.error(error?.message || 'Erro ao inicializar processo');
      } finally {
        setIsInitializing(false);
        isCreatingProcesso.current = false;
      }
    };

    initializeProcesso();
  }, [setWorkflowInstance, setProcessIdInStore]);

  const handleStepClick = (step: number) => {
    // ⚠️ DEPRECATED: Não usar mais setCurrentStep manual
    // O fluxo agora é controlado pelo workflow engine
    // TODO: Integrar com completeStep() do workflowApi
    console.warn('⚠️ handleStepClick ainda usando setCurrentStep manual - migrar para workflow engine');
    setCurrentStep(step);
  };

  const handleSaveDraft = () => {
    toast.success('Rascunho salvo com sucesso!');
  };

  const handleReset = () => {
    setConfirmResetOpen(true);
  };

  const confirmReset = () => {
    reset();
    setProcessoId(null);
    toast.info('Processo reiniciado');
    window.location.reload();
  };

  const handleNewInscricao = () => {
    setConfirmNewOpen(true);
  };

  const confirmNewInscricao = () => {
    startNewInscricao();
    setProcessoId(null);
    toast.info('Nova inscrição iniciada');
    window.location.reload();
  };

  const renderCurrentStep = () => {
    // Nova ordem: Empreendimento → Partícipes → Licença solicitada → Revisão
    switch (currentStep) {
      case 1:
        return <EmpreendimentoPageNew />;
      case 2:
        return <ParticipantesPage />;
      case 3:
        return <LicencaSolicitadaPage />;
      case 4:
        return <RevisaoPage />;
      default:
        return <EmpreendimentoPageNew />;
    }
  };

  if (isInitializing || !processoId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando processo...</p>
        </div>
      </div>
    );
  }

  return (
    <InscricaoProvider processoId={processoId}>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Nova Inscrição</h1>
              {processoId && (
                <p className="text-sm text-gray-500">Processo #{processoId}</p>
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

      {/* Stepper */}
      <InscricaoStepper
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px]">
        <EnterpriseProvider>
          <InscricaoProvider processoId={processoId}>
            {renderCurrentStep()}
          </InscricaoProvider>
        </EnterpriseProvider>
      </div>

      {/* Process Info Footer */}
      {processoId && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Processo ativo:</span>
            <span className="font-medium text-gray-900">#{processoId}</span>
          </div>
        </div>
      )}

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
    </InscricaoProvider>
  );
}
