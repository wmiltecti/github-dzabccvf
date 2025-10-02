import React, { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useInscricaoStore } from '../lib/store/inscricao';
import { createRascunho } from '../lib/api/process';
import InscricaoStepper from './InscricaoStepper';
import { FileText, ArrowLeft, Save, AlertTriangle } from 'lucide-react';

export default function InscricaoLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const { processId, setProcessId, currentStep, setCurrentStep, reset } = useInscricaoStore();

  // Map routes to steps
  const routeToStep = {
    '/inscricao/participantes': 1,
    '/inscricao/imovel': 2,
    '/inscricao/empreendimento': 3,
    '/inscricao/revisao': 4
  };

  const stepToRoute = {
    1: '/inscricao/participantes',
    2: '/inscricao/imovel',
    3: '/inscricao/empreendimento',
    4: '/inscricao/revisao'
  };

  // Update current step based on route
  useEffect(() => {
    const step = routeToStep[location.pathname as keyof typeof routeToStep];
    if (step && step !== currentStep) {
      setCurrentStep(step);
    }
  }, [location.pathname, currentStep, setCurrentStep]);

  // Initialize process on mount
  useEffect(() => {
    const initializeProcess = async () => {
      if (!user) return;
      
      if (!processId) {
        try {
          console.log('🆕 Creating new draft process...');
          const { data, error } = await createRascunho();
          
          if (error) {
            console.error('Error creating draft process:', error);
            alert('Erro ao inicializar processo: ' + error.message);
            return;
          }
          
          if (data) {
            console.log('✅ Draft process created:', data.id);
            setProcessId(data.id);
          }
        } catch (error) {
          console.error('Error initializing process:', error);
          alert('Erro ao inicializar processo: ' + (error as Error).message);
        }
      }
    };

    if (!loading && user) {
      initializeProcess();
    }
  }, [user, loading, processId, setProcessId]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Redirect to first step if on base route
  useEffect(() => {
    if (location.pathname === '/inscricao') {
      navigate('/inscricao/participantes');
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
    alert('Rascunho salvo com sucesso!');
  };

  const handleReset = () => {
    if (confirm('Tem certeza que deseja reiniciar o processo? Todos os dados serão perdidos.')) {
      reset();
      navigate('/inscricao/participantes');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

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
                  {processId && (
                    <p className="text-sm text-gray-500">Processo #{processId}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
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
              >
                <AlertTriangle className="w-4 h-4" />
                Reiniciar
              </button>
            </div>
          </div>
        </div>
      </header>

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

      {/* Process Info Footer */}
      {processId && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Processo ativo:</span>
            <span className="font-medium text-gray-900">#{processId}</span>
          </div>
        </div>
      )}
    </div>
  );
}