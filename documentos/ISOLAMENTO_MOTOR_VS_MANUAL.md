# 🔐 Isolamento entre Motor BPMN e Fluxo Manual

**REGRA DE OURO**: Alterações no Motor NÃO podem quebrar o Manual, e vice-versa.

---

## 📋 Mapeamento de Componentes

### ✅ FLUXO MANUAL (Layout-based, usa InscricaoContext)

**Wizard/Layout:**
- `InscricaoWizard.tsx` - Wizard modal standalone (DEPENDE de InscricaoProvider)
- `InscricaoLayout.tsx` - Layout com rotas (/inscricao/*) (DEPENDE de InscricaoProvider)
- `InscricaoStepper.tsx` - Stepper visual (USA useInscricaoContext)

**Páginas (dentro de /inscricao/):**
- `ParticipantesPage.tsx` - USA useInscricaoContext
- `ImovelPage.tsx` - USA useInscricaoContext
- `EmpreendimentoPage.tsx` - USA useInscricaoContext
- `FormularioPage.tsx` - USA useInscricaoContext
- `DocumentacaoPage.tsx` - USA useInscricaoContext
- `RevisaoPage.tsx` - USA useInscricaoContext

**Dependências:**
- ✅ REQUER `InscricaoProvider` envolvendo componentes
- ✅ REQUER `processoId` válido antes de renderizar Provider
- ✅ USA `useInscricaoContext()` para acessar dados

---

### ✅ FLUXO MOTOR BPMN (Workflow-based, NÃO usa InscricaoContext)

**Wizard/Layout:**
- `InscricaoWizardMotor.tsx` - Wizard controlado 100% pelo backend
- `InscricaoStepperMotor.tsx` - Stepper visual isolado (NÃO USA contexto)

**Páginas (dentro de /inscricao/workflow/):**
- `ParticipantesWorkflowPageMotor.tsx` - USA APENAS useInscricaoStore
- `ImovelWorkflowPageMotor.tsx` - USA APENAS useInscricaoStore
- `EmpreendimentoWorkflowPageMotor.tsx` - USA APENAS useInscricaoStore
- `FormularioWorkflowPageMotor.tsx` - USA APENAS useInscricaoStore
- *(DocumentacaoWorkflowPageMotor.tsx - A IMPLEMENTAR)*
- *(RevisaoWorkflowPageMotor.tsx - A IMPLEMENTAR)*

**Dependências:**
- ❌ NÃO USA `InscricaoProvider`
- ❌ NÃO USA `useInscricaoContext()`
- ✅ USA APENAS `useInscricaoStore()` (Zustand global)
- ✅ USA `workflowApi` para comunicação com backend

---

## 🚨 Pontos de Atenção para Evitar Quebra

### 1. InscricaoProvider (APENAS Manual)
```tsx
// ✅ CORRETO - Manual
<InscricaoProvider processoId={processoId}>
  <InscricaoStepper />
  <Outlet />
</InscricaoProvider>

// ❌ NUNCA fazer no Motor
<InscricaoWizardMotor>
  <InscricaoProvider> {/* ❌ Motor NÃO precisa disso */}
</InscricaoWizardMotor>
```

### 2. useInscricaoContext (APENAS Manual)
```tsx
// ✅ CORRETO - Páginas Manuais
const { processoId } = useInscricaoContext();

// ❌ NUNCA fazer no Motor
// ParticipantesWorkflowPageMotor.tsx
const { processoId } = useInscricaoContext(); // ❌ Motor usa Store
```

### 3. useInscricaoStore (Usado por AMBOS)
```tsx
// ✅ CORRETO - Ambos podem usar
const { processId, setProcessId } = useInscricaoStore();

// Motor: Usa para workflow + processoId
// Manual: Pode usar para estado compartilhado (opcional)
```

### 4. Criação de Processo

**Manual (InscricaoLayout.tsx):**
```tsx
useEffect(() => {
  const newProcessoId = await criarProcesso(userId);
  await http.put(`/processos/${newProcessoId}/dados-gerais`, { processo_id });
  setProcessoId(newProcessoId); // Local state
}, []);
```

**Motor (InscricaoWizardMotor.tsx):**
```tsx
const initializeWorkflow = async () => {
  const newProcessoId = await criarProcesso(userId);
  await http.put(`/processos/${newProcessoId}/dados-gerais`, { processo_id });
  await startWorkflowForLicense(newProcessoId); // ✅ Inicia workflow
  setProcessId(String(newProcessoId)); // ✅ Zustand store
};
```

---

## ✅ Checklist de Validação

Antes de fazer qualquer alteração, responda:

### Mudança no Manual:
- [ ] Está alterando apenas componentes SEM sufixo "Motor"?
- [ ] Está usando `InscricaoProvider` corretamente?
- [ ] Não está removendo/alterando `useInscricaoContext()`?
- [ ] Testou navegação: Nova Solicitação → Participantes → Imóvel?

### Mudança no Motor:
- [ ] Está alterando apenas componentes COM sufixo "Motor"?
- [ ] NÃO está adicionando `InscricaoProvider`?
- [ ] Está usando APENAS `useInscricaoStore()`?
- [ ] Testou: Processos Motor → Novo Processo Motor → Workflow?

### Mudança em Ambos (shared):
- [ ] Está alterando `useInscricaoStore` (Zustand)?
- [ ] Testou AMBOS os fluxos após mudança?
- [ ] Verificou que ambos ainda funcionam independentemente?

---

## 🐛 Problemas Comuns e Soluções

### Erro: "useInscricaoContext must be used within InscricaoProvider"

**Causa**: Componente Manual sem Provider envolvendo.

**Solução Manual**:
```tsx
// InscricaoLayout.tsx
<InscricaoProvider processoId={processoId}>
  <InscricaoStepper />  {/* Precisa estar DENTRO */}
  <Outlet />
</InscricaoProvider>
```

**Solução Motor**: Motor NÃO deve ter esse erro. Se aparecer, componente Motor está usando `useInscricaoContext()` indevidamente.

---

### Erro 409 ao adicionar participante

**Causa**: Processo não criado no banco antes do workflow.

**Solução**:
```tsx
// ✅ SEMPRE criar processo ANTES de iniciar workflow
const newProcessoId = await criarProcesso(userId);
await http.put(`/processos/${newProcessoId}/dados-gerais`, { processo_id });
await startWorkflowForLicense(newProcessoId); // Só depois
```

---

### Motor não avança para próximo step

**Causa**: Backend não retornando `nextStep` ou frontend não atualizando estado.

**Solução**:
```tsx
const response = await completeStep(workflowInstanceId, stepId);
if (response.nextStep) {
  setCurrentStep(response.nextStep); // ✅ Atualiza estado local
  setWorkflowInstance(...); // ✅ Atualiza Zustand
}
```

---

## 📊 Arquitetura Visual

```
┌─────────────────────────────────────────────────────────────┐
│                     FLUXO MANUAL                            │
│  (Layout-based, usa React Context)                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  InscricaoLayout.tsx (Router)                               │
│  │                                                           │
│  └─> InscricaoProvider (Context)                            │
│       │                                                      │
│       ├─> InscricaoStepper (visual)                         │
│       │                                                      │
│       └─> <Outlet /> (React Router)                         │
│            │                                                 │
│            ├─> ParticipantesPage.tsx                        │
│            ├─> ImovelPage.tsx                               │
│            ├─> EmpreendimentoPage.tsx                       │
│            ├─> FormularioPage.tsx                           │
│            ├─> DocumentacaoPage.tsx                         │
│            └─> RevisaoPage.tsx                              │
│                                                             │
│  ✅ USA: InscricaoContext + useInscricaoContext()           │
│  ✅ Navegação: React Router (/inscricao/*)                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   FLUXO MOTOR BPMN                          │
│  (Workflow-based, controlado pelo backend)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  InscricaoWizardMotor.tsx (Wizard único)                    │
│  │                                                           │
│  ├─> InscricaoStepperMotor (visual isolado)                │
│  │                                                           │
│  └─> renderCurrentStep() (switch/case)                      │
│       │                                                      │
│       ├─> ParticipantesWorkflowPageMotor.tsx                │
│       ├─> ImovelWorkflowPageMotor.tsx                       │
│       ├─> EmpreendimentoWorkflowPageMotor.tsx               │
│       ├─> FormularioWorkflowPageMotor.tsx                   │
│       ├─> DocumentacaoWorkflowPageMotor.tsx (TODO)          │
│       └─> RevisaoWorkflowPageMotor.tsx (TODO)               │
│                                                             │
│  ❌ NÃO USA: InscricaoContext                               │
│  ✅ USA: useInscricaoStore (Zustand)                        │
│  ✅ USA: workflowApi (startWorkflow, completeStep)          │
│  ✅ Navegação: Backend controla (nextStep)                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  SHARED (Ambos usam)                        │
├─────────────────────────────────────────────────────────────┤
│  - useInscricaoStore (Zustand)                              │
│  - criarProcesso() service                                  │
│  - http client                                              │
│  - processosService                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testes de Regressão

### Testar Fluxo Manual
1. Dashboard → Nova Solicitação
2. Adicionar participante
3. Próximo → Imóvel
4. Próximo → Empreendimento
5. Validar que NÃO aparece erro de contexto

### Testar Fluxo Motor
1. Dashboard → Processos Motor → Novo Processo Motor
2. Adicionar participante
3. Validar que workflow avança automaticamente
4. Validar que NÃO aparece erro 409

---

## 📝 Histórico de Quebras e Correções

### 2025-11-12: InscricaoProvider fora de lugar no Manual
**Problema**: `InscricaoStepper` estava FORA do `InscricaoProvider` no `InscricaoLayout.tsx`

**Erro**: "useInscricaoContext must be used within InscricaoProvider"

**Correção**:
```tsx
// ❌ ANTES
<InscricaoStepper />
<InscricaoProvider>
  <Outlet />
</InscricaoProvider>

// ✅ DEPOIS
<InscricaoProvider processoId={processoId}>
  <InscricaoStepper />
  <Outlet />
</InscricaoProvider>
```

---

### 2025-11-12: 409 Conflict ao adicionar participante no Motor
**Problema**: Workflow iniciado com string 'new' ao invés de UUID válido

**Erro**: 409 Conflict - "Processo não existe no banco"

**Correção**:
```tsx
// ✅ Criar processo ANTES de iniciar workflow
const newProcessoId = await criarProcesso(userId);
await http.put(`/processos/${newProcessoId}/dados-gerais`, { processo_id });
await startWorkflowForLicense(newProcessoId); // UUID válido
```

---

### 2025-11-12: Navigate() causando redirecionamento para landing page no Motor
**Problema**: Páginas Motor usando `navigate(response.nextStep.path)` após completeStep()

**Erro**: Ao clicar "Próximo" (Imóvel → Empreendimento), redirecionava para landing page ao invés de renderizar próximo componente

**Causa Raiz**: Motor BPMN NÃO usa React Router. O `InscricaoWizardMotor` renderiza componentes diretamente via `renderCurrentStep()`. Chamar `navigate()` quebra o fluxo.

**Correção**:
```tsx
// ❌ ANTES (errado no Motor)
const response = await completeStep(workflowInstanceId, currentStepId);
setCurrentStepFromEngine(response.nextStep.id, response.nextStep.key);
navigate(response.nextStep.path); // ❌ Motor NÃO usa Router!

// ✅ DEPOIS (correto no Motor)
const response = await completeStep(workflowInstanceId, currentStepId);
setCurrentStepFromEngine(response.nextStep.id, response.nextStep.key);
// ✅ Motor: InscricaoWizardMotor detecta mudança no store e renderiza próximo step
console.log('🧭 Próximo step atualizado no store:', response.nextStep.key);
```

**Arquivos Corrigidos**:
- `ImovelWorkflowPageMotor.tsx` - Removido `navigate()` após completeStep
- `EmpreendimentoWorkflowPageMotor.tsx` - Removido `navigate()` após completeStep
- `FormularioWorkflowPageMotor.tsx` - Removido `navigate()` após completeSubprocessStep

**Validação**: Motor agora avança Imóvel → Empreendimento → Formulário sem redirecionar para landing page

---

## 📞 Contato para Dúvidas

Se precisar modificar componentes compartilhados ou tiver dúvida sobre isolamento, **SEMPRE** testar ambos os fluxos antes de commitar.

**Regra de Ouro**: Se tocou no Manual, teste o Motor. Se tocou no Motor, teste o Manual.
