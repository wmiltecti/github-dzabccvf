import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useInscricaoStore } from '../../../lib/store/inscricao';
import FormWizard from '../../../components/FormWizard';
import { getStepSubprocess, completeSubprocessStep, WorkflowStep } from '../../../services/workflowApi';

/**
 * Página Formulário para Workflow Engine (Motor BPMN)
 * 
 * 🔄 Cópia EXATA da FormularioPage.tsx original com adaptações mínimas:
 * - Usa APENAS useInscricaoStore (remove useInscricaoContext)
 * - handleNext() já chama completeStep() do workflow engine
 * - Mantém 100% do layout e funcionalidades aprovadas em produção
 * - Suporta subprocess (Aba1-6 do formulário)
 * 
 * ✅ Layout validado pelo usuário e já em produção
 */
export default function FormularioWorkflowPageMotor() {
  const navigate = useNavigate();
  
  // Zustand store - pega TODOS os dados (processo + workflow + subprocess)
  const { 
    processId: processoId,
    workflowInstanceId, 
    currentStepId,
    subprocessInstanceId: contextSubprocessId,
    setCurrentStep, 
    setSubprocessInstance, 
    clearSubprocess,
    setCurrentStepFromEngine 
  } = useInscricaoStore();
  
  // Estado local para controle do subprocess
  const [localSubprocessId, setLocalSubprocessId] = useState<string | null>(null);
  const [subprocessCurrentStep, setSubprocessCurrentStep] = useState<WorkflowStep | null>(null);
  const [isLoadingSubprocess, setIsLoadingSubprocess] = useState(true);

  // Detecta se o passo FORMULARIO possui um subprocesso ativo
  useEffect(() => {
    const checkForSubprocess = async () => {
      console.log('🔍 [FormularioPage] Verificando subprocesso...', { 
        workflowInstanceId, 
        currentStepId 
      });

      if (!workflowInstanceId || !currentStepId) {
        console.log('⚠️ [FormularioPage] Workflow não inicializado, usando modo local');
        setIsLoadingSubprocess(false);
        return;
      }

      try {
        const subprocessInfo = await getStepSubprocess(workflowInstanceId, currentStepId);
        
        if (subprocessInfo.has_subprocess && subprocessInfo.subprocess_instance_id) {
          console.log('✅ [FormularioPage] Subprocesso detectado:', subprocessInfo);
          
          // Salva no store global
          setSubprocessInstance(
            subprocessInfo.subprocess_instance_id,
            subprocessInfo.subprocess_current_step?.id || '',
            subprocessInfo.subprocess_current_step?.key || ''
          );
          
          // Salva no estado local
          setLocalSubprocessId(subprocessInfo.subprocess_instance_id);
          setSubprocessCurrentStep(subprocessInfo.subprocess_current_step || null);
        } else {
          console.log('ℹ️ [FormularioPage] Nenhum subprocesso ativo, usando modo local');
          clearSubprocess();
        }
      } catch (error) {
        console.error('❌ [FormularioPage] Erro ao verificar subprocesso:', error);
        // Em caso de erro, continua em modo local
      } finally {
        setIsLoadingSubprocess(false);
      }
    };

    checkForSubprocess();
  }, [workflowInstanceId, currentStepId, setSubprocessInstance, clearSubprocess]);

  const handleComplete = async () => {
    console.log('📝 [FormularioPage] Formulário completado');
    
    // Se tem subprocesso ativo, completa o passo do subprocesso
    if (localSubprocessId && subprocessCurrentStep?.id) {
      console.log('🔄 [FormularioPage] Completando passo do subprocesso:', {
        subprocessId: localSubprocessId,
        stepId: subprocessCurrentStep.id
      });

      try {
        const response = await completeSubprocessStep(
          localSubprocessId, 
          subprocessCurrentStep.id,
          { completed: true } // Payload indicando conclusão do formulário
        );

        console.log('✅ [FormularioPage] Subprocesso completado:', response);

        // Backend automaticamente completa o passo pai FORMULARIO
        // e retorna o próximo passo
        if (response.nextStep) {
          setCurrentStepFromEngine(response.nextStep.id, response.nextStep.key);
          navigate(response.nextStep.path);
        } else if (response.status === 'FINISHED') {
          console.log('🎉 [FormularioPage] Workflow finalizado!');
          // Navega para página de conclusão ou dashboard
          navigate('/dashboard');
        }

        // Limpa o subprocesso do estado
        clearSubprocess();
        setLocalSubprocessId(null);
        setSubprocessCurrentStep(null);

      } catch (error) {
        console.error('❌ [FormularioPage] Erro ao completar subprocesso:', error);
        alert('Erro ao completar o formulário. Tente novamente.');
        return;
      }
    } else {
      // Modo local/fallback: navegação tradicional
      console.log('ℹ️ [FormularioPage] Modo local, navegando tradicionalmente');
      if (window.location.pathname.includes('/inscricao/')) {
        navigate('/inscricao/documentacao');
      } else {
        setCurrentStep(5);
      }
    }
  };

  const handleBack = () => {
    if (window.location.pathname.includes('/inscricao/')) {
      navigate('/inscricao/empreendimento');
    } else {
      setCurrentStep(3);
    }
  };

  // Mostra loading enquanto aguarda processoId
  if (!processoId) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900">Inicializando processo...</h3>
          <p className="text-gray-600">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  // Mostra loading enquanto verifica subprocesso
  if (isLoadingSubprocess) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900">Verificando subprocesso...</h3>
          <p className="text-gray-600">Preparando formulário</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header com botão voltar */}
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Atividade
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Formulário de Licenciamento</h2>
        <p className="text-gray-600">
          Preencha as informações detalhadas sobre recursos, energia, água, resíduos e outras informações.
        </p>
      </div>

      {/* FormWizard integrado */}
      <FormWizard 
        processoId={processoId ? String(processoId) : undefined}
        onComplete={handleComplete}
        // Futuros props para controle de subprocesso (opcional):
        // subprocessInstanceId={localSubprocessId}
        // subprocessCurrentStep={subprocessCurrentStep}
      />
    </div>
  );
}
