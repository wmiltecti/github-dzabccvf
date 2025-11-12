import http from '../lib/api/http';

// ============================================
// TYPES
// ============================================

export interface WorkflowStep {
  id: string;
  key: string;
  label: string;
  path: string;
}

export interface StartWorkflowResponse {
  instanceId: string;
  currentStep: WorkflowStep;
}

export interface GetCurrentStepResponse {
  status: string;
  step: WorkflowStep;
}

export interface CompleteStepResponse {
  status: string;
  nextStep: WorkflowStep | null;
  subprocess_instance_id?: string;  // ID do subprocesso (se houver)
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Inicia uma instância de workflow para um processo de licenciamento
 * @param processId - ID do processo de licenciamento
 * @returns Dados da instância criada e step inicial
 */
export async function startWorkflowForLicense(processId: string): Promise<StartWorkflowResponse> {
  try {
    const response = await http.post<StartWorkflowResponse>('/workflow/instances/start', {
      template_code: 'LICENCIAMENTO_AMBIENTAL_COMPLETO',
      target_type: 'LICENSE_PROCESS',
      target_id: processId
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Erro ao iniciar workflow:', error);
    throw new Error(
      error?.response?.data?.message || 
      error?.message || 
      'Erro ao iniciar workflow'
    );
  }
}

/**
 * Obtém o step atual de uma instância de workflow
 * @param instanceId - ID da instância de workflow
 * @returns Status e dados do step atual
 */
export async function getCurrentStep(instanceId: string): Promise<GetCurrentStepResponse> {
  try {
    const response = await http.get<GetCurrentStepResponse>(
      `/workflow/instances/${instanceId}/current-step`
    );

    return response.data;
  } catch (error: any) {
    console.error('❌ Erro ao buscar step atual:', error);
    throw new Error(
      error?.response?.data?.message || 
      error?.message || 
      'Erro ao buscar step atual do workflow'
    );
  }
}

/**
 * Completa um step do workflow e avança para o próximo
 * @param instanceId - ID da instância de workflow
 * @param stepId - ID do step a ser completado
 * @param payload - Dados opcionais a serem enviados
 * @returns Status e dados do próximo step (se houver)
 */
export async function completeStep(
  instanceId: string, 
  stepId: string, 
  payload?: any
): Promise<CompleteStepResponse> {
  try {
    const response = await http.post<CompleteStepResponse>(
      `/workflow/instances/${instanceId}/steps/${stepId}/complete`,
      payload || {}
    );

    return response.data;
  } catch (error: any) {
    console.error('❌ Erro ao completar step:', error);
    throw new Error(
      error?.response?.data?.message || 
      error?.message || 
      'Erro ao completar step do workflow'
    );
  }
}

/**
 * Lista todos os steps de um template de workflow
 * @param templateCode - Código do template (ex: 'LICENCIAMENTO_AMBIENTAL_COMPLETO')
 * @returns Lista de steps do template ordenados
 */
export async function getTemplateSteps(templateCode: string): Promise<WorkflowStep[]> {
  try {
    const response = await http.get<{ steps: WorkflowStep[] }>(
      `/workflow/templates/${templateCode}/steps`
    );

    return response.data.steps;
  } catch (error: any) {
    console.error('❌ Erro ao buscar steps do template:', error);
    throw new Error(
      error?.response?.data?.message || 
      error?.message || 
      'Erro ao buscar steps do template'
    );
  }
}

/**
 * Obtém o histórico de steps completados de uma instância
 * @param instanceId - ID da instância de workflow
 * @returns Lista de steps completados
 */
export async function getInstanceStepHistory(instanceId: string): Promise<{
  completedSteps: string[];  // Array de step IDs completados
  currentStepId: string;
}> {
  try {
    const response = await http.get<{
      completedSteps: string[];
      currentStepId: string;
    }>(`/workflow/instances/${instanceId}/step-history`);

    return response.data;
  } catch (error: any) {
    console.error('❌ Erro ao buscar histórico de steps:', error);
    throw new Error(
      error?.response?.data?.message || 
      error?.message || 
      'Erro ao buscar histórico de steps'
    );
  }
}

// ============================================
// SUBPROCESSOS (SUBFLUXOS)
// ============================================

/**
 * Verifica se um step tem um subprocesso ativo
 * @param instanceId - ID da instância de workflow principal
 * @param stepId - ID do step a verificar
 * @returns Dados do subprocesso (se existir)
 */
export async function getStepSubprocess(
  instanceId: string, 
  stepId: string
): Promise<{
  has_subprocess: boolean;
  subprocess_instance_id?: string;
  subprocess_template?: string;
  subprocess_current_step?: WorkflowStep;
}> {
  try {
    const response = await http.get<{
      has_subprocess: boolean;
      subprocess_instance_id?: string;
      subprocess_template?: string;
      subprocess_current_step?: WorkflowStep;
    }>(`/workflow/instances/${instanceId}/steps/${stepId}/subprocess`);

    return response.data;
  } catch (error: any) {
    console.error('❌ Erro ao verificar subprocesso:', error);
    // Retorna fallback se endpoint não existir
    return { has_subprocess: false };
  }
}

/**
 * Completa um step de um subprocesso
 * Quando o último step do subprocesso é completado, o step do processo pai também é marcado como completo
 * @param subprocessInstanceId - ID da instância do subprocesso
 * @param stepId - ID do step do subprocesso
 * @param payload - Dados opcionais
 * @returns Status e próximo step (do subprocesso ou do processo pai)
 */
export async function completeSubprocessStep(
  subprocessInstanceId: string,
  stepId: string,
  payload?: any
): Promise<CompleteStepResponse> {
  try {
    const response = await http.post<CompleteStepResponse>(
      `/workflow/instances/${subprocessInstanceId}/steps/${stepId}/complete`,
      payload || {}
    );

    return response.data;
  } catch (error: any) {
    console.error('❌ Erro ao completar step do subprocesso:', error);
    throw new Error(
      error?.response?.data?.message || 
      error?.message || 
      'Erro ao completar step do subprocesso'
    );
  }
}
