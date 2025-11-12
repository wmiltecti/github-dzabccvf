/**
 * Páginas Workflow - Integradas com Motor BPMN
 * 
 * 🔄 CÓPIAS EXATAS das páginas originais com adaptações mínimas:
 * - ParticipantesWorkflowPage.tsx <- ParticipantesPage.tsx
 * - ImovelWorkflowPage.tsx <- ImovelPage.tsx
 * - EmpreendimentoWorkflowPage.tsx <- EmpreendimentoPage.tsx
 * - FormularioWorkflowPage.tsx <- FormularioPage.tsx
 * 
 * ✅ Mantêm 100% do layout e funcionalidades aprovadas em produção
 * 
 * Única mudança significativa:
 * - Usam useInscricaoStore ao invés de useInscricaoContext
 * - handleNext() já chama completeStep() do workflow engine
 * 
 * São renderizadas dinamicamente por InscricaoWizardMotor.tsx
 */

export { default as ParticipantesWorkflowPage } from './ParticipantesWorkflowPage';
export { default as ImovelWorkflowPage } from './ImovelWorkflowPage';
export { default as EmpreendimentoWorkflowPage } from './EmpreendimentoWorkflowPage';
export { default as FormularioWorkflowPage } from './FormularioWorkflowPage';

// Futuras páginas (se necessário):
// export { default as DocumentacaoWorkflowPage } from './DocumentacaoWorkflowPage';
// export { default as RevisaoWorkflowPage } from './RevisaoWorkflowPage';
