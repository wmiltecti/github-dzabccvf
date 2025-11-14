# 🎯 Índice de Features - Licenciamento Ambiental Frontend

> Catálogo organizado de todas as funcionalidades implementadas no sistema.

---

## 🔍 Busca e Seleção

### Busca de Imóvel
**Arquivo:** `src/pages/inscricao/ImovelPage.tsx`  
**API:** `src/lib/api/property.ts` → `searchImoveis()`  
**Data:** 2025-11-04  
**Tags:** `#search` `#modal` `#debounce` `#property`

**Funcionalidade:**
- Modal em 2 etapas: busca → confirmação
- Debounce de 500ms
- Busca por CAR, Matrícula, Município ou Endereço
- Validação mínima de 3 caracteres
- Fallback Supabase se API falhar
- Exibição em tabela com badges coloridos por tipo

**Padrão de uso:**
```typescript
import { searchImoveis } from '../../lib/api/property';

const result = await searchImoveis(searchTerm);
// result.data: SearchImovelResult[]
// result.error: ServiceError | null
```

**Endpoints:**
- `GET /imoveis/buscar?q={query}` (HTTP API)
- Fallback: Supabase `properties` table

---

## 📝 Fluxo de Solicitação (6 Steps)

### Step 1: Participantes
**Arquivo:** `src/pages/inscricao/ParticipantesPage.tsx`  
**Tags:** `#participants` `#workflow`

**Funcionalidade:**
- Seleção de participantes (PF/PJ)
- Tipo: Requerente, Procurador, Técnico
- Validação: mínimo 1 requerente

---

### Step 2: Imóvel
**Arquivo:** `src/pages/inscricao/ImovelPage.tsx`  
**Tags:** `#property` `#search` `#required`

**Funcionalidade:**
- Busca de imóvel cadastrado
- Exibição de dados: CAR, Matrícula, Coordenadas
- Validação: obrigatório para prosseguir

---

### Step 3: Atividade
**Arquivo:** `src/pages/inscricao/EmpreendimentoPage.tsx`  
**Tags:** `#activity` `#enterprise`

**Funcionalidade:**
- Seleção de atividade do empreendimento
- Lista de atividades disponíveis
- Vinculação ao processo

**Renomeação:** "Empreendimento" → "Atividade" (04/11/2025)

---

### Step 4: Formulário (FormWizard)
**Arquivo:** `src/pages/inscricao/FormularioPage.tsx`  
**Componente:** `src/components/FormWizard.tsx`  
**Data:** 2025-11-04  
**Tags:** `#formwizard` `#integration` `#7-substeps`

**Funcionalidade:**
- Wrapper que integra FormWizard no fluxo principal
- Recebe processoId do InscricaoContext
- 7 sub-etapas internas:
  1. Características
  2. Recursos e Energia
  3. Uso de Água
  4. Combustíveis
  5. Resíduos
  6. Outras Informações
  7. Revisão Interna

**Integração:**
```typescript
<FormWizard 
  processoId={processoId}  // Externo, não cria novo
  onComplete={() => navigate('/inscricao/documentacao')}
/>
```

---

### Step 5: Documentação
**Arquivo:** `src/pages/inscricao/DocumentacaoPage.tsx`  
**Data:** 2025-11-04  
**Tags:** `#upload` `#documents` `#validation`

**Funcionalidade:**
- Upload de documentos obrigatórios e opcionais
- 6 tipos de documentos predefinidos
- Progress tracking por documento
- Validação de arquivo (tamanho, tipo)

**Documentos:**
- ✅ Obrigatórios: RG/CPF, Comprovante Endereço, Declaração
- ⭕ Opcionais: Procuração, Planta, ART

**Status:** ⚠️ UI completa, backend pendente

---

### Step 6: Revisão
**Arquivo:** `src/pages/inscricao/RevisaoPage.tsx`  
**Tags:** `#review` `#summary` `#submit`

**Funcionalidade:**
- Resumo de todos os dados preenchidos
- Validação final
- Submissão do processo

**Pendente:** Adicionar resumo de Formulário e Documentação

---

## 🎨 Componentes Reutilizáveis

### InscricaoStepper
**Arquivo:** `src/components/InscricaoStepper.tsx`  
**Tags:** `#ui` `#navigation` `#stepper`

**Funcionalidade:**
- Indicador visual de progresso
- 6 steps com ícones
- Navegação por clique (steps anteriores)
- Estado: concluído, atual, pendente

**Atualização 04/11/2025:**
- Expandido de 4 para 6 steps
- Adicionados: Formulário (FileText), Documentação (Upload)

---

### FormWizard
**Arquivo:** `src/components/FormWizard.tsx`  
**Tags:** `#wizard` `#multi-step` `#form`

**Props (após refatoração 04/11/2025):**
```typescript
interface FormWizardProps {
  processoId?: string;           // Opcional: usar processo existente
  onComplete?: () => void;       // Callback após conclusão
}
```

**Funcionalidade:**
- 7 etapas de formulário detalhado
- Validação por etapa
- Salvamento automático
- Navegação back/next

**Mudança importante:**
- Antes: Sempre criava novo processo
- Depois: Aceita processoId externo

---

### InscricaoLayout
**Arquivo:** `src/components/InscricaoLayout.tsx`  
**Tags:** `#layout` `#routing` `#context`

**Funcionalidade:**
- Layout wrapper para fluxo de solicitação
- Provê InscricaoContext (processoId)
- Roteamento entre steps
- Validação de navegação

**Rotas (atualizado 04/11/2025):**
```typescript
/inscricao/participantes  → Step 1
/inscricao/imovel         → Step 2
/inscricao/empreendimento → Step 3
/inscricao/formulario     → Step 4 ⭐ NOVO
/inscricao/documentacao   → Step 5 ⭐ NOVO
/inscricao/revisao        → Step 6
```

---

## 📊 State Management

### InscricaoStore (Zustand)
**Arquivo:** `src/lib/store/inscricao.ts`  
**Tags:** `#state` `#zustand` `#validation`

**State:**
```typescript
{
  processoId: string | null,        // UUID do processo
  participants: Participant[],
  property: Property | undefined,
  propertyId: number | undefined,
  activity: Activity | undefined,
  currentStep: number
}
```

**Métodos principais:**
- `setProcessoId(id: string)`
- `setProperty(data: Property)`
- `setPropertyId(id: number)`
- `isStepComplete(step: number): boolean`
- `canProceedToStep(step: number): boolean`

**Validação expandida (04/11/2025):**
- Step 4: TODO - Verificar se FormWizard foi completado
- Step 5: TODO - Verificar documentos obrigatórios
- Step 6: Todos os anteriores completos

---

## 🔌 API Integration

### HTTP Client
**Arquivo:** `src/lib/api/http.ts`  
**Tags:** `#api` `#axios` `#http`

**Configuração:**
```typescript
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});
```

**Uso padrão:**
```typescript
// GET
const response = await http.get('/endpoint');
const data = response.data;

// POST
const response = await http.post('/endpoint', payload);

// PUT
await http.put(`/endpoint/${id}`, payload);

// DELETE
await http.delete(`/endpoint/${id}`);
```

**Refatoração:** 03/11/2025 - Migração de fetch para axios

---

### Endpoints Principais

#### Processos
**Arquivo:** `src/lib/api/processos.ts`

- `POST /processos/` - Criar novo processo
- `GET /processos/{id}` - Buscar processo
- `PUT /processos/{id}` - Atualizar processo
- `DELETE /processos/{id}` - Deletar processo

#### Imóveis
**Arquivo:** `src/lib/api/property.ts`

- `GET /imoveis/buscar?q={query}` - Buscar imóveis
- `POST /properties/` - Criar imóvel
- `GET /properties/{id}` - Buscar imóvel

#### Pessoas
**Arquivo:** `src/lib/api/people.ts`

- `GET /pessoas-fisicas/buscar?q={query}`
- `GET /pessoas-juridicas/buscar?q={query}`

---

## 🎨 UI/UX Patterns

### Modal em 2 Etapas
**Exemplo:** `ImovelPage.tsx`

**Pattern:**
```typescript
type ModalStep = 'search' | 'confirm';
const [modalStep, setModalStep] = useState<ModalStep>('search');

// Step 1: Search
if (modalStep === 'search') { /* ... */ }

// Step 2: Confirm
if (modalStep === 'confirm') { /* ... */ }
```

**Uso:** Evita seleção acidental, melhor UX

---

### Debounce Pattern
**Exemplo:** `ImovelPage.tsx`

**Pattern:**
```typescript
useEffect(() => {
  if (searchTerm.length < 3) return;
  
  const timeoutId = setTimeout(async () => {
    await searchFunction(searchTerm);
  }, 500);
  
  return () => clearTimeout(timeoutId);
}, [searchTerm]);
```

**Uso:** Evita chamadas excessivas à API durante digitação

---

### Badge Colorido por Tipo
**Exemplo:** `ImovelPage.tsx`

**Pattern:**
```typescript
const getBadgeColor = (tipo: string) => {
  switch (tipo) {
    case 'URBANO': return 'bg-blue-100 text-blue-800';
    case 'RURAL': return 'bg-green-100 text-green-800';
    case 'LINEAR': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
```

**Uso:** Identificação visual rápida de categorias

---

## 📚 Documentação Relacionada

### Por Problema
- **Timeout na API** → [`REFATORACAO_API_URLS.md`](./REFATORACAO_API_URLS.md)
- **Configuração inicial** → [`README.md`](../README.md)
- **Deploy produção** → [`PRODUCTION_SETUP.md`](../PRODUCTION_SETUP.md)

### Por Feature
- **Recursos/Energia** → [`ALTERACOES_ABA2_RECURSOS_ENERGIA.md`](./ALTERACOES_ABA2_RECURSOS_ENERGIA.md)
- **Outras Informações** → [`IMPLEMENTACAO_ABA6_OUTRAS_INFORMACOES.md`](../IMPLEMENTACAO_ABA6_OUTRAS_INFORMACOES.md)
- **Modo Offline** → [`MODO_OFFLINE.md`](../MODO_OFFLINE.md)

---

## 🔖 Tags Índice

- `#search` - Funcionalidades de busca
- `#modal` - Modais e dialogs
- `#workflow` - Fluxos de processo
- `#api` - Integração com API
- `#validation` - Validações de dados
- `#ui` - Componentes de interface
- `#state` - Gerenciamento de estado
- `#refactoring` - Refatorações
- `#critical-fix` - Correções críticas
- `#upload` - Upload de arquivos
- `#debounce` - Padrão debounce

---

**Última atualização:** 04/11/2025  
**Total de features:** 15+  
**Status geral:** 🟢 Operacional
