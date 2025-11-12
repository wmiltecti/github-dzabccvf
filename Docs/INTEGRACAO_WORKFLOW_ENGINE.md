# Integração com Workflow Engine - Documentação

**Branch:** `sp4-task3276-implementacao-motor-bmpn`  
**Data:** 2025-11-11

## 📋 Resumo das Implementações

### 1️⃣ **Cliente de Workflow API** (`src/services/workflowApi.ts`)

Cliente HTTP para comunicação com o motor de workflow BPMN.

#### Funções Implementadas:

```typescript
startWorkflowForLicense(processId: string): Promise<StartWorkflowResponse>
```
- **POST** `/workflow/instances/start`
- Inicia workflow para processo de licenciamento
- Body: `{ template_code: 'LICENCIAMENTO_AMBIENTAL_COMPLETO', target_type: 'LICENSE_PROCESS', target_id: processId }`
- Retorna: `{ instanceId, currentStep: { id, key, label, path } }`

```typescript
getCurrentStep(instanceId: string): Promise<GetCurrentStepResponse>
```
- **GET** `/workflow/instances/{instanceId}/current-step`
- Busca o step atual de uma instância
- Retorna: `{ status, step: { id, key, label, path } }`

```typescript
completeStep(instanceId: string, stepId: string, payload?: any): Promise<CompleteStepResponse>
```
- **POST** `/workflow/instances/{instanceId}/steps/{stepId}/complete`
- Completa um step e avança para o próximo
- Retorna: `{ status, nextStep: { id, key, label, path } | null }`

---

### 2️⃣ **Extensão do Store/Context** (`src/lib/store/inscricao.ts`)

#### Novas Propriedades:
```typescript
interface InscricaoStore {
  // Workflow Engine
  workflowInstanceId: string | null;
  currentStepId: string | null;
  currentStepKey: string | null;
  // ...
}
```

#### Novas Actions:
```typescript
setWorkflowInstance(instanceId: string, stepId: string, stepKey: string)
```
- Define a instância do workflow e step atual
- Usado após iniciar o workflow

```typescript
setCurrentStepFromEngine(stepId: string, stepKey: string)
```
- Atualiza apenas o step atual (sem alterar instanceId)
- Usado ao avançar entre steps

#### Limpeza Garantida:
- ✅ `reset()` - limpa tudo incluindo workflow
- ✅ `startNewInscricao()` - limpa workflow mas mantém userId
- ✅ Persistência automática no localStorage

---

### 3️⃣ **Context de Inscrição** (`src/contexts/InscricaoContext.tsx`)

Agora expõe as informações do workflow:

```typescript
interface InscricaoContextType {
  processoId: string | null;
  workflowInstanceId: string | null;
  currentStepId: string | null;
  currentStepKey: string | null;
}
```

**Acessível em todas as páginas do wizard:**
- ParticipantesPage
- ImovelPage
- EmpreendimentoPage
- FormularioPage
- DocumentacaoPage
- RevisaoPage

---

### 4️⃣ **Inicialização do Workflow** (`src/components/InscricaoWizard.tsx`)

#### Fluxo Implementado:

```
1. Criar processo (license_processes)
   ↓
2. Criar dados gerais iniciais
   ↓
3. Iniciar workflow engine → startWorkflowForLicense(processoId)
   ↓
4. Salvar instância no store → setWorkflowInstance(instanceId, stepId, stepKey)
   ↓
5. Renderizar step inicial definido pelo engine
```

#### Código de Inicialização:

```typescript
// 3. Iniciar o workflow engine
const workflowResponse = await startWorkflowForLicense(newProcessoId);

// 4. Salvar instância do workflow no store
setWorkflowInstance(
  workflowResponse.instanceId,
  workflowResponse.currentStep.id,
  workflowResponse.currentStep.key
);

// 5. O step inicial agora vem do backend via currentStep.path
```

---

## 🎨 Stepper Dinâmico

### Implementação (`src/components/InscricaoStepper.tsx`)

O stepper agora é **100% dinâmico** e busca as etapas do backend:

#### Fluxo de Carregamento:

```typescript
useEffect(() => {
  // 1. Buscar steps do template
  const templateSteps = await getTemplateSteps('LICENCIAMENTO_AMBIENTAL_COMPLETO');
  
  // 2. Buscar histórico de steps completados (se houver instância)
  if (workflowInstanceId) {
    const history = await getInstanceStepHistory(workflowInstanceId);
    setCompletedStepIds(history.completedSteps);
  }
}, [workflowInstanceId]);
```

#### Determinação de Status:

```typescript
const getStepStatus = (step: WorkflowStep, stepIndex: number) => {
  // 1. Completado? (está no histórico)
  if (completedStepIds.includes(step.id)) return 'completed';
  
  // 2. É o atual? (step.key === currentStepKey)
  if (step.key === currentStepKey) return 'current';
  
  // 3. Está antes do atual? (por índice)
  const currentIndex = steps.findIndex(s => s.key === currentStepKey);
  if (stepIndex < currentIndex) return 'completed';
  
  // 4. Está depois? 
  if (stepIndex > currentIndex) return 'disabled';
  
  return 'upcoming';
};
```

#### Features:

- ✅ **Busca dinâmica** de steps do template no backend
- ✅ **Histórico** de steps completados por instância
- ✅ **Status visual** baseado em `currentStepKey` do contexto
- ✅ **Ícones mapeados** por key (`PARTICIPANTES` → Users, `IMOVEL` → Home, etc.)
- ✅ **Loading skeleton** durante carregamento
- ✅ **Fallback automático** para steps hardcoded se backend falhar
- ✅ **Cores e estados**:
  - Verde = completado
  - Azul = atual
  - Cinza = futuro/desabilitado

#### Endpoints Necessários (Backend):

```typescript
// 1. Listar steps do template
GET /workflow/templates/{templateCode}/steps
Response: { steps: WorkflowStep[] }

// 2. Histórico de steps da instância
GET /workflow/instances/{instanceId}/step-history
Response: { completedSteps: string[], currentStepId: string }
```

---

## 🚧 Migrações Pendentes

### ⚠️ Controle de Navegação

**Atual (Deprecated):**
```typescript
setCurrentStep(1);  // Manual numérico
setCurrentStep(2);
setCurrentStep(3);
```

**Futuro (Workflow Engine):**
```typescript
// Ao completar um step
const response = await completeStep(instanceId, stepId, formData);
if (response.nextStep) {
  setCurrentStepFromEngine(response.nextStep.id, response.nextStep.key);
  navigate(response.nextStep.path);
}
```

### ⚠️ Renderização de Steps

**Atual:**
```typescript
switch (currentStep) {
  case 1: return <ParticipantesPage />;
  case 2: return <ImovelPage />;
  // ...
}
```

**Futuro:**
```typescript
switch (currentStepKey) {
  case 'PARTICIPANTES': return <ParticipantesPage />;
  case 'IMOVEL': return <ImovelPage />;
  case 'EMPREENDIMENTO': return <EmpreendimentoPage />;
  // ...
}
```

---

## � Especificação de Endpoints do Backend

### 1. Iniciar Workflow

**Endpoint:** `POST /workflow/instances/start`

**Request Body:**
```json
{
  "template_code": "LICENCIAMENTO_AMBIENTAL_COMPLETO",
  "target_type": "LICENSE_PROCESS",
  "target_id": "12345"
}
```

**Response (201):**
```json
{
  "instance_id": "wf-inst-789",
  "current_step": {
    "id": "step-001",
    "key": "PARTICIPANTES",
    "label": "Participantes",
    "path": "/inscricao/participantes"
  }
}
```

### 2. Obter Step Atual

**Endpoint:** `GET /workflow/instances/{instanceId}/current-step`

**Response (200):**
```json
{
  "status": "IN_PROGRESS",
  "step": {
    "id": "step-002",
    "key": "IMOVEL",
    "label": "Imóvel",
    "path": "/inscricao/imovel"
  }
}
```

### 3. Completar Step

**Endpoint:** `POST /workflow/instances/{instanceId}/steps/{stepId}/complete`

**Request Body (opcional):**
```json
{
  "totalParticipantes": 2,
  "hasRequerente": true
}
```

**Response (200):**
```json
{
  "status": "IN_PROGRESS",
  "next_step": {
    "id": "step-003",
    "key": "EMPREENDIMENTO",
    "label": "Empreendimento",
    "path": "/inscricao/empreendimento"
  },
  "subprocess_instance_id": null
}
```

**Response quando é último step (200):**
```json
{
  "status": "FINISHED",
  "next_step": null
}
```

### 4. Obter Steps do Template

**Endpoint:** `GET /workflow/templates/{templateCode}/steps`

**Response (200):**
```json
{
  "steps": [
    {
      "id": "step-001",
      "key": "PARTICIPANTES",
      "label": "Participantes",
      "path": "/inscricao/participantes",
      "order": 1
    },
    {
      "id": "step-002",
      "key": "IMOVEL",
      "label": "Imóvel",
      "path": "/inscricao/imovel",
      "order": 2
    },
    // ...
  ]
}
```

### 5. Obter Histórico de Steps

**Endpoint:** `GET /workflow/instances/{instanceId}/step-history`

**Response (200):**
```json
{
  "completed_steps": [
    {
      "step_id": "step-001",
      "step_key": "PARTICIPANTES",
      "completed_at": "2025-11-11T10:30:00Z",
      "payload": {
        "totalParticipantes": 2,
        "hasRequerente": true
      }
    }
  ]
}
```

### 6. Verificar Subprocesso

**Endpoint:** `GET /workflow/instances/{instanceId}/steps/{stepId}/subprocess`

**Response quando tem subprocesso (200):**
```json
{
  "has_subprocess": true,
  "subprocess_instance_id": "subwf-456",
  "subprocess_template": "FORMULARIO_DETALHADO",
  "subprocess_current_step": {
    "id": "substep-001",
    "key": "STEP_1_CARACTERISTICAS",
    "label": "Características",
    "path": "/inscricao/formulario#step1"
  }
}
```

**Response quando não tem subprocesso (200):**
```json
{
  "has_subprocess": false
}
```

**Response quando endpoint não existe (404):**
Frontend faz fallback para `{ has_subprocess: false }`

### 7. Completar Step de Subprocesso

**Endpoint:** `POST /workflow/instances/{subprocessInstanceId}/steps/{stepId}/complete`

**Request Body (opcional):**
```json
{
  "data": { ... }
}
```

**Response (200):**
```json
{
  "status": "IN_PROGRESS",
  "next_step": {
    "id": "substep-002",
    "key": "STEP_2_RECURSOS_ENERGIA",
    "label": "Recursos e Energia",
    "path": "/inscricao/formulario#step2"
  }
}
```

**Response quando é último step do subprocesso (200):**
```json
{
  "status": "FINISHED",
  "next_step": {
    "id": "step-005",
    "key": "DOCUMENTACAO",
    "label": "Documentação",
    "path": "/inscricao/documentacao"
  }
}
```
_Nota: Ao completar o último step do subprocesso, o backend automaticamente completa o step pai (FORMULARIO) e retorna o próximo step do workflow principal._

---

## �📊 Exemplo de Uso Completo

### Em uma Página do Wizard:

```typescript
import { useInscricaoContext } from '../../contexts/InscricaoContext';
import { useInscricaoStore } from '../../lib/store/inscricao';
import { completeStep } from '../../services/workflowApi';

function ParticipantesPage() {
  const { workflowInstanceId, currentStepId } = useInscricaoContext();
  const { setCurrentStepFromEngine } = useInscricaoStore();
  const navigate = useNavigate();

  const handleNext = async () => {
    try {
      // Completar step atual
      const response = await completeStep(
        workflowInstanceId!,
        currentStepId!,
        { participantes: [...] }  // payload opcional
      );

      if (response.nextStep) {
        // Atualizar store com próximo step
        setCurrentStepFromEngine(
          response.nextStep.id,
          response.nextStep.key
        );
        
        // Navegar para próxima rota definida pelo engine
        navigate(response.nextStep.path);
      } else {
        // Workflow completo
        toast.success('Processo finalizado!');
      }
    } catch (error) {
      toast.error('Erro ao avançar step');
    }
  };

  return (
    <div>
      <h1>Participantes</h1>
      {/* formulário */}
      <button onClick={handleNext}>Próximo</button>
    </div>
  );
}
```

---

## 🎯 Próximos Passos

1. **Migrar botões "Próximo"** das páginas para usar `completeStep()`
2. **Atualizar InscricaoStepper** para ler steps do workflow engine
3. **Remover lógica manual** de navegação numérica (1,2,3...)
4. **Implementar backend** dos endpoints de workflow
5. **Testar fluxo completo** end-to-end

---

## 6️⃣ **Suporte a Subprocessos (Subfluxos)** 

### Visão Geral

Alguns passos do workflow principal podem ter **subprocessos** associados. Por exemplo, o passo `FORMULARIO` pode ter um subfluxo que controla os passos internos do FormWizard (Step1, Step2, Step3, Step4, Step5).

### Novas Funções API (`workflowApi.ts`)

```typescript
getStepSubprocess(instanceId: string, stepId: string): Promise<SubprocessInfo>
```
- **GET** `/workflow/instances/{instanceId}/steps/{stepId}/subprocess`
- Verifica se o step atual possui um subprocesso ativo
- Retorna: `{ has_subprocess, subprocess_instance_id?, subprocess_template?, subprocess_current_step? }`
- **Fallback**: Se endpoint não existir, retorna `{ has_subprocess: false }`

```typescript
completeSubprocessStep(subprocessInstanceId: string, stepId: string, payload?: any): Promise<CompleteStepResponse>
```
- **POST** `/workflow/instances/{subprocessInstanceId}/steps/{stepId}/complete`
- Completa um passo do subprocesso
- Quando o último passo do subprocesso é completado, o backend automaticamente completa o passo pai
- Retorna: `{ status, nextStep, subprocess_instance_id? }`

### Extensão do Store

```typescript
interface InscricaoStore {
  // Subprocesso
  subprocessInstanceId: string | null;
  subprocessCurrentStepId: string | null;
  subprocessCurrentStepKey: string | null;
  
  // Actions
  setSubprocessInstance: (instanceId: string, stepId: string, stepKey: string) => void;
  clearSubprocess: () => void;
}
```

### Implementação no FormularioPage

**1. Detecção de Subprocesso (useEffect):**

```typescript
useEffect(() => {
  const checkForSubprocess = async () => {
    if (!workflowInstanceId || !currentStepId) return;
    
    const subprocessInfo = await getStepSubprocess(workflowInstanceId, currentStepId);
    
    if (subprocessInfo.has_subprocess) {
      setSubprocessInstance(
        subprocessInfo.subprocess_instance_id,
        subprocessInfo.subprocess_current_step?.id,
        subprocessInfo.subprocess_current_step?.key
      );
    }
  };
  
  checkForSubprocess();
}, [workflowInstanceId, currentStepId]);
```

**2. Conclusão com Subprocesso:**

```typescript
const handleComplete = async () => {
  if (localSubprocessId && subprocessCurrentStep?.id) {
    // Completa passo do subprocesso
    const response = await completeSubprocessStep(
      localSubprocessId, 
      subprocessCurrentStep.id,
      { completed: true }
    );
    
    // Backend auto-completa o passo pai FORMULARIO
    if (response.nextStep) {
      setCurrentStepFromEngine(response.nextStep.id, response.nextStep.key);
      navigate(response.nextStep.path);
    }
    
    clearSubprocess();
  } else {
    // Fallback: navegação tradicional
    navigate('/inscricao/documentacao');
  }
};
```

### Diagrama de Fluxo

```
Workflow Principal:
  PARTICIPANTES → IMOVEL → EMPREENDIMENTO → FORMULARIO → DOCUMENTACAO → REVISAO

Subprocesso do FORMULARIO:
  FORMULARIO (pai)
    ├─ STEP_1_CARACTERISTICAS
    ├─ STEP_2_RECURSOS_ENERGIA
    ├─ STEP_3_USO_AGUA
    ├─ STEP_4_RESIDUOS
    └─ STEP_5_OUTRAS_INFO → (ao completar, completa FORMULARIO pai automaticamente)
```

### Comportamento Esperado

1. Usuário entra no passo FORMULARIO
2. Frontend chama `getStepSubprocess(instanceId, stepId)`
3. Se houver subprocesso:
   - Store armazena `subprocess_instance_id`
   - FormWizard pode ser controlado pelo subprocesso (futuro)
   - Ao completar, chama `completeSubprocessStep()`
4. Se não houver subprocesso:
   - Modo local/tradicional
   - Navegação manual entre os steps

### Características

- ✅ **Opcional**: Se backend não retornar subprocesso, usa modo local
- ✅ **Fallback**: Se endpoint não existir, graceful degradation
- ✅ **Auto-limpeza**: `clearSubprocess()` ao sair do passo
- ✅ **Persistência**: Subprocesso salvo no Zustand store
- ✅ **Loading States**: Indicador visual durante verificação

---

## ✅ Checklist de Implementação

- [x] Criar cliente de workflow API (`workflowApi.ts`)
  - [x] `startWorkflowForLicense()`
  - [x] `getCurrentStep()`
  - [x] `completeStep()`
  - [x] `getTemplateSteps()` - Lista steps do template
  - [x] `getInstanceStepHistory()` - Histórico de steps completados
  - [x] `getStepSubprocess()` - Detecta subprocesso em um step
  - [x] `completeSubprocessStep()` - Completa passo de subprocesso
- [x] Estender store com propriedades de workflow
- [x] Estender context para expor workflow
- [x] Integrar inicialização do workflow no wizard
- [x] Migrar botões "Próximo" para usar `completeStep()`
  - [x] ParticipantesPage.tsx
  - [x] ImovelPage.tsx
  - [x] EmpreendimentoPage.tsx
  - [x] FormularioPage.tsx (com suporte a subprocesso)
  - [ ] DocumentacaoPage.tsx
  - [ ] RevisaoPage.tsx (finalização do processo)
- [x] Implementar suporte a subprocessos
  - [x] Estender store com propriedades de subprocess
  - [x] Adicionar funções `setSubprocessInstance()` e `clearSubprocess()`
  - [x] Estender context para expor subprocess
  - [x] Implementar detecção de subprocess no FormularioPage
  - [x] Implementar conclusão via `completeSubprocessStep()`
  - [x] Loading states durante verificação
  - [ ] Integrar subprocess com FormWizard interno (futuro)
- [x] Atualizar stepper para usar steps do engine
  - [x] Busca steps do template dinamicamente
  - [x] Busca histórico de steps completados
  - [x] Renderização dinâmica baseada em `currentStepKey`
  - [x] Loading skeleton durante carregamento
  - [x] Fallback para steps hardcoded se backend falhar
- [ ] Remover `setCurrentStep()` manual
- [ ] Implementar backend dos endpoints
- [ ] Testes E2E do fluxo completo

---

## 📝 Notas Importantes

### Workflow Principal
- ⚠️ **Não usar mais `setCurrentStep(1,2,3...)`** - controlado pelo engine
- ✅ **Sempre usar `completeStep()`** para avançar no fluxo
- ✅ **Primeiro step vem do backend** via `currentStep.path`
- ✅ **Workflow persiste no localStorage** automaticamente
- ✅ **Limpeza garantida** em `reset()` e `startNewInscricao()`

### Subprocessos
- ✅ **Subprocessos são opcionais** - se backend não retornar, usa modo local
- ✅ **Detecção automática** via `getStepSubprocess()` ao entrar no step
- ✅ **Graceful degradation** - se endpoint não existir, continua funcionando
- ✅ **Auto-conclusão do pai** - ao completar último step do subprocess, pai é completado automaticamente
- ✅ **Limpeza automática** - `clearSubprocess()` ao sair do step ou completar
- 🔄 **Estado separado** - subprocess tem seu próprio `instance_id`, `step_id`, `step_key`

---

**Autor:** GitHub Copilot  
**Revisão:** Necessária após implementação do backend
