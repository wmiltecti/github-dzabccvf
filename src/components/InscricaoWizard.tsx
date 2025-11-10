import React, { useEffect, useRef, useState } from 'react';
import { useInscricaoStore } from '../lib/store/inscricao';
import { criarProcesso } from '../services/processosService';
import { getUserId } from '../utils/authToken';
import { InscricaoProvider } from '../contexts/InscricaoContext';
import InscricaoStepper from './InscricaoStepper';
import { FileText, Save, AlertTriangle, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import http from '../lib/api/http';
import ParticipantesPage from '../pages/inscricao/ParticipantesPage';
import ImovelPage from '../pages/inscricao/ImovelPage';
import EmpreendimentoPage from '../pages/inscricao/EmpreendimentoPage';
import FormularioPage from '../pages/inscricao/FormularioPage';
import DocumentacaoPage from '../pages/inscricao/DocumentacaoPage';
import RevisaoPage from '../pages/inscricao/RevisaoPage';

export default function InscricaoWizard() {
  const { currentStep, setCurrentStep, reset, startNewInscricao } = useInscricaoStore();

  const [processoId, setProcessoId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const isCreatingProcesso = useRef(false);

  useEffect(() => {
    const initializeProcesso = async () => {
      if (processoId) return;

      if (isCreatingProcesso.current) {
        console.log('🔒 [InscricaoWizard] Já está criando processo, aguardando...');
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
  }, []);

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const handleSaveDraft = () => {
    toast.success('Rascunho salvo com sucesso!');
  };

  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja reiniciar o processo? Todos os dados serão perdidos.')) {
      reset();
      setProcessoId(null);
      toast.info('Processo reiniciado');
      window.location.reload();
    }
  };

  const handleNewInscricao = () => {
    if (window.confirm('Deseja iniciar uma nova inscrição? Os dados atuais serão perdidos.')) {
      startNewInscricao();
      setProcessoId(null);
      toast.info('Nova inscrição iniciada');
      window.location.reload();
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <ParticipantesPage />;
      case 2:
        return <ImovelPage />;
      case 3:
        return <EmpreendimentoPage />;
      case 4:
        return <FormularioPage />;
      case 5:
        return <DocumentacaoPage />;
      case 6:
        return <RevisaoPage />;
      default:
        return <ParticipantesPage />;
    }
  };

  if (isInitializing) {
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
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
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

        <div className="flex items-center space-x-2">
          <button
            onClick={handleNewInscricao}
            className="px-3 py-1.5 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1.5"
            title="Iniciar nova inscrição (mantém usuário)"
          >
            <Plus className="w-4 h-4" />
            Nova Inscrição
          </button>
          <button
            onClick={handleSaveDraft}
            className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            Salvar Rascunho
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1.5"
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
        <InscricaoProvider processoId={processoId}>
          {renderCurrentStep()}
        </InscricaoProvider>
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
    </div>
  );
}
