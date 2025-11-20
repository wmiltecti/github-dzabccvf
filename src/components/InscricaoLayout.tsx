import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useInscricaoStore } from '../lib/store/inscricao';
import { criarProcesso } from '../services/processosService';
import { getUserId } from '../utils/authToken';
import { InscricaoProvider } from '../contexts/InscricaoContext';
import InscricaoStepper from './InscricaoStepper';
import { FileText, ArrowLeft, Save, AlertTriangle, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import http from '../lib/api/http';
import ConfirmDialog from './ConfirmDialog';
import NotificationBell from './notifications/NotificationBell';
import { useAuth } from '../contexts/AuthContext';

export default function InscricaoLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentStep, setCurrentStep, reset, startNewInscricao, setCurrentStepFromEngine } = useInscricaoStore();
  
  // State LOCAL (como no FormWizard) - não usa Zustand para processoId
  const [processoId, setProcessoId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [confirmNewOpen, setConfirmNewOpen] = useState(false);

  // Flag para evitar criação duplicada de processo no StrictMode
  const isCreatingProcesso = useRef(false);

  // Map routes to steps and keys
  const routeToStep = {
    '/inscricao/empreendimento': { step: 1, key: 'EMPREENDIMENTO' },
    '/inscricao/participantes': { step: 2, key: 'PARTICIPANTES' },
    '/inscricao/licenca': { step: 3, key: 'LICENCA' },
    '/inscricao/revisao': { step: 4, key: 'REVISAO' }
  };

  const stepToRoute = {
    1: '/inscricao/empreendimento',
    2: '/inscricao/participantes',
    3: '/inscricao/licenca',
    4: '/inscricao/revisao'
  };

  // Update current step and key based on route
  useEffect(() => {
    const stepData = routeToStep[location.pathname as keyof typeof routeToStep];
    if (stepData) {
      setCurrentStep(stepData.step);
      // Atualiza o currentStepKey no store para o stepper funcionar corretamente
      setCurrentStepFromEngine('step-' + stepData.step, stepData.key);
      console.log('🔄 Atualizando step para rota:', location.pathname, '→', stepData);
    }
  }, [location.pathname]);

  // Criar processo ao montar o componente - EXATAMENTE IGUAL AO FORMWIZARD
  useEffect(() => {
    const initializeProcesso = async () => {
      if (processoId) return; // se já tem, sai
      
      // Evita criação duplicada no StrictMode (React executa useEffect 2x em dev)
      if (isCreatingProcesso.current) {
        console.log('🔒 [InscricaoLayout] Já está criando processo, aguardando...');
        return;
      }

      setIsInitializing(true);
      isCreatingProcesso.current = true;
      
      try {
        const userId = getUserId();
        if (!userId) {
          toast.error('Usuário não autenticado');
          return;
        }
        const newProcessoId = await criarProcesso(userId);
        console.log('✅ Processo criado na API (id remoto):', newProcessoId);
        
        // Criar dados gerais vazios para permitir adicionar participantes
        console.log('📝 Criando dados gerais iniciais...');
        await http.put(`/processos/${newProcessoId}/dados-gerais`, {
          processo_id: newProcessoId
        });
        console.log('✅ Dados gerais criados');
        
        setProcessoId(newProcessoId);
      } catch (error: any) {
        console.error('Erro ao criar processo:', error);
        toast.error(error?.message || 'Erro ao inicializar processo');
      } finally {
        setIsInitializing(false);
        isCreatingProcesso.current = false;
      }
    };

    initializeProcesso();
  }, []); // Executa apenas uma vez ao montar

  // Redirect to first step if on base route
  useEffect(() => {
    if (location.pathname === '/inscricao' || location.pathname === '/inscricao/') {
      navigate('/inscricao/empreendimento', { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleStepClick = (step: number) => {
    const route = stepToRoute[step as keyof typeof stepToRoute];
    if (route) {
      navigate(route);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleSaveDraft = () => {
    // TODO: Implement save draft functionality
    toast.success('Rascunho salvo com sucesso!');
  };

  const handleReset = () => {
    setConfirmResetOpen(true);
  };

  const confirmReset = () => {
    reset();
    setProcessoId(null);
    navigate('/inscricao/empreendimento');
    toast.info('Processo reiniciado');
    window.location.reload();
  };

  const handleNewInscricao = () => {
    setConfirmNewOpen(true);
  };

  const confirmNewInscricao = () => {
    startNewInscricao();
    setProcessoId(null);
    navigate('/inscricao/empreendimento');
    toast.info('Nova inscrição iniciada');
    window.location.reload();
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

  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Voltar ao dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
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
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Notificações */}
              {user && <NotificationBell userId={user.id} />}
              
              <button
                onClick={handleNewInscricao}
                className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
                title="Iniciar nova inscrição (mantém usuário)"
              >
                <Plus className="w-4 h-4" />
                Nova Inscrição
              </button>
              <button
                onClick={handleSaveDraft}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Salvar Rascunho
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                title="Reiniciar processo (limpa tudo)"
              >
                <AlertTriangle className="w-4 h-4" />
                Reiniciar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Provider envolve TUDO que usa contexto (Stepper + Pages) */}
      <InscricaoProvider processoId={processoId}>
        {/* Stepper */}
        <InscricaoStepper 
          currentStep={currentStep} 
          onStepClick={handleStepClick}
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px]">
            <Outlet />
          </div>
        </main>
      </InscricaoProvider>

      {/* Process Info Footer */}
      {processoId && (
        <>
          <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Processo ativo:</span>
              <span className="font-medium text-gray-900">#{processoId}</span>
            </div>
          </div>
          
          {/* DEBUG Panel - abaixo do processo ativo */}
          <div className="fixed bottom-20 right-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-3 max-w-md">
            <div className="text-xs">
              <div className="font-bold text-yellow-900 mb-1">🔍 DEBUG - Informações do Sistema</div>
              <div className="text-yellow-800">
                <strong>Processo ID:</strong> {processoId}
              </div>
            </div>
          </div>
        </>
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
  );
}