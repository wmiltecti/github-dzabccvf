/**
 * Páginas Workflow - Integradas com Motor BPMN
 * 
 * Estas páginas foram criadas especificamente para trabalhar com o Workflow Engine.
 * Elas:
 * - Acessam Zustand store para obter workflowInstanceId e currentStepId
 * - Chamam completeStep() para avançar o workflow
 * - Passam dados do formulário para o backend via workflow
 * - São renderizadas dinamicamente por InscricaoWizardMotor
 */

export { default as ParticipantesWorkflowPage } from './ParticipantesWorkflowPage';
export { default as ImovelWorkflowPage } from './ImovelWorkflowPage';
export { default as EmpreendimentoWorkflowPage } from './EmpreendimentoWorkflowPage';
export { default as FormularioWorkflowPage } from './FormularioWorkflowPage';

// Pendente implementação:
// export { default as DocumentacaoWorkflowPage } from './DocumentacaoWorkflowPage';
// export { default as RevisaoWorkflowPage } from './RevisaoWorkflowPage';
