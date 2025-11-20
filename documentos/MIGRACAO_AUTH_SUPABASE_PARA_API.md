# Migração de Autenticação: Supabase Auth → API de Negócios

**Data:** 20/11/2025  
**Status:** 📋 PLANEJAMENTO - Aguardando análise e definição de prioridades  
**Branch:** task-activities

---

## 📊 Contexto

A aplicação está em transição de usar **Supabase Auth** para usar **autenticação própria via API de Negócios (FastAPI + Postgres 9.x)**.

### Estado Atual
- ✅ Login funciona via API de Negócios (`/auth/login`)
- ✅ Token salvo em `auth_token` no localStorage
- ✅ Dados do usuário salvos em `auth_user` no localStorage
- ⚠️ Várias funcionalidades ainda tentam usar `supabase.auth.getUser()`
- ⚠️ Queries diretas ao Supabase continuam funcionando

---

## 🎯 Funcionalidades por Status

### ✅ **FUNCIONANDO (Sem necessidade de alteração)**

#### 1. Autenticação Básica
- Login via `/auth/login` do backend
- Logout (limpa localStorage)
- Exibição do nome do usuário no Dashboard
- Navegação entre páginas

#### 2. CRUD de Administração
- **Atividades** (usando API REST + fallback Supabase)
- Tipos de Licença
- Documentos Templates
- Potenciais Poluidores
- Portes de Empreendimento
- Todos usam queries diretas `supabase.from()` (não dependem de auth)

#### 3. Navegação Geral
- Dashboard principal
- Menu lateral
- Rotas públicas e protegidas

---

### 🔴 **CRÍTICO - Precisa Correção Imediata**

#### 1. Processos/Solicitações
**Arquivo:** `src/services/processService.ts`

**Problema:**
```typescript
const { data: { user } } = await supabase.auth.getUser();
const userId = user?.id;
```

**Funções Afetadas:**
- `createProcess()` - Criar novo processo
- `updateProcess()` - Atualizar processo existente
- `submitProcess()` - Submeter processo para análise
- `getProcessesByUser()` - Listar processos do usuário
- `deleteProcess()` - Deletar processo

**Solução Proposta:**
```typescript
import { getUserId } from '@/utils/authToken';

const userId = getUserId();
if (!userId) throw new Error('Usuário não autenticado');
```

**Impacto no Backend:**
- ❓ O backend precisa aceitar `userId` vindo do localStorage?
- ❓ Existe validação de token JWT para garantir que o userId é válido?
- ❓ As policies RLS do Postgres precisam ser ajustadas?

---

#### 2. Formulários (Wizard)
**Arquivo:** `src/services/formWizardService.ts`

**Problema:**
```typescript
const { data: { session } } = await supabase.auth.getSession();
if (!session) throw new Error('Não autenticado');
```

**Funções Afetadas:**
- `saveFormData()` - Salvar progresso do formulário
- `loadFormData()` - Carregar dados salvos
- `submitForm()` - Submeter formulário completo

**Solução Proposta:**
```typescript
import { isAuthenticated, getUserId } from '@/utils/authToken';

if (!isAuthenticated()) throw new Error('Não autenticado');
const userId = getUserId();
```

**Impacto no Backend:**
- ❓ Formulários são salvos no Supabase ou via API?
- ❓ Precisa endpoint de validação de sessão?

---

### 🟡 **IMPORTANTE - Precisa Correção**

#### 3. Upload/Download de Documentos
**Arquivo:** `src/services/documentService.ts`

**Problema:**
```typescript
const { data: { user } } = await supabase.auth.getUser();
const userId = user?.id;

// Upload para Supabase Storage
const { data, error } = await supabase.storage
  .from('documents')
  .upload(path, file);
```

**Funções Afetadas:**
- `uploadDocument()` - Upload de arquivo
- Usa `supabase.storage` para armazenamento

**Solução Proposta (Frontend):**
```typescript
import { getUserId } from '@/utils/authToken';
const userId = getUserId();
```

**⚠️ Supabase Storage:**
- **Continua funcionando** se as policies RLS não checam `auth.uid()`
- **Pode quebrar** se policies requerem sessão Supabase

**Questões para o Backend:**
- ❓ Migrar storage para o backend (FastAPI) ou continuar usando Supabase Storage?
- ❓ Se continuar Supabase Storage, como validar acesso sem `supabase.auth`?
- ❓ Policies RLS permitem acesso com token da API?

**Alternativas:**
1. **Manter Supabase Storage** - Ajustar policies para não depender de auth
2. **Migrar para Backend** - Criar endpoints de upload/download no FastAPI
3. **Híbrido** - Usar backend para controle e Supabase para storage físico

---

#### 4. Comentários em Processos
**Arquivo:** `src/services/commentService.ts`

**Problema:**
```typescript
const { data: { user } } = await supabase.auth.getUser();
const userId = user?.id;
```

**Função Afetada:**
- `addComment()` - Adicionar comentário em processo

**Solução Proposta:**
```typescript
import { getUserId } from '@/utils/authToken';
const userId = getUserId();
```

---

### 🟢 **SECUNDÁRIO - Correção Pode Esperar**

#### 5. Colaboração/Compartilhamento
**Arquivo:** `src/services/collaborationService.ts`

**Funções Afetadas:**
- `shareProcess()` - Compartilhar processo com outro usuário
- `revokeAccess()` - Revogar acesso compartilhado
- `updateUserPermission()` - Atualizar permissões

**Solução:** Usar `getUserId()` do localStorage

---

#### 6. Página de Revisão
**Arquivo:** `src/pages/inscricao/RevisaoPage.tsx`

**Função Afetada:**
- Carregar dados da revisão de inscrição

**Solução:** Usar `getUserId()` do localStorage

---

## 🔧 Solução Técnica Proposta

### Frontend

#### 1. Utilitário Centralizado (Já Existe)
**Arquivo:** `src/utils/authToken.ts`

```typescript
export function getAuthToken(): string | null {
  // Prioridade 1: Token da API
  const fastapiToken = localStorage.getItem('auth_token');
  if (fastapiToken) return fastapiToken;

  // Prioridade 2: Token do objeto auth_user
  const userData = localStorage.getItem('auth_user');
  if (userData) {
    const parsed = JSON.parse(userData);
    if (parsed?.token) return parsed.token;
  }

  // Fallback: Supabase (legado)
  return localStorage.getItem('supabase_jwt');
}

export function getUserId(): string | null {
  const authUser = localStorage.getItem('auth_user');
  if (authUser) {
    const parsed = JSON.parse(authUser);
    return parsed.userId || parsed.id;
  }
  return null;
}

export function getUserEmail(): string | null {
  const authUser = localStorage.getItem('auth_user');
  if (authUser) {
    const parsed = JSON.parse(authUser);
    return parsed.email;
  }
  return null;
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}
```

#### 2. Padrão de Substituição

**❌ Antes:**
```typescript
const { data: { user }, error } = await supabase.auth.getUser();
if (error || !user) throw new Error('Não autenticado');
const userId = user.id;
```

**✅ Depois:**
```typescript
import { getUserId } from '@/utils/authToken';

const userId = getUserId();
if (!userId) throw new Error('Usuário não autenticado');
```

---

### Backend

#### Questões Críticas para o Backend

1. **Validação de Token JWT**
   ```
   ❓ O backend valida o token JWT em todos os endpoints protegidos?
   ❓ Como funciona a estrutura do JWT? (header.payload.signature)
   ❓ O token tem tempo de expiração?
   ```

2. **Identificação do Usuário**
   ```
   ❓ O userId vem no payload do JWT?
   ❓ Ou precisa ser enviado explicitamente no body/params?
   ❓ Como o backend valida que o userId no token é o mesmo da requisição?
   ```

3. **Integração com Postgres 9.x**
   ```
   ❓ O backend se conecta direto ao Postgres 9.x ou via Supabase?
   ❓ Políticas RLS (Row Level Security) ainda funcionam?
   ❓ Funções que usam auth.uid() precisam ser substituídas?
   ```

4. **Endpoints de Autenticação**
   ```
   ✅ POST /auth/login (já existe)
   ❓ POST /auth/refresh (refresh token)
   ❓ POST /auth/logout (invalidar token)
   ❓ GET /auth/me (dados do usuário logado)
   ```

5. **Storage de Arquivos**
   ```
   ❓ Criar endpoints para upload/download no backend?
   ❓ Ou continuar usando Supabase Storage?
   ❓ Se Supabase Storage, como resolver policies RLS?
   ```

---

## 📋 Plano de Implementação

### Fase 1: Definição (Backend + Frontend)
- [ ] Backend define arquitetura de autenticação completa
- [ ] Backend define se migra storage ou mantém Supabase
- [ ] Backend ajusta policies RLS se necessário
- [ ] Frontend valida utilitários `authToken.ts`

### Fase 2: Backend
- [ ] Implementar validação JWT em todos endpoints
- [ ] Criar endpoint `/auth/me` para dados do usuário
- [ ] Criar endpoint `/auth/refresh` para renovar token
- [ ] Decidir sobre storage (migrar ou manter)
- [ ] Se migrar: implementar upload/download
- [ ] Ajustar policies RLS do Postgres

### Fase 3: Frontend - Processos (Crítico)
- [ ] Substituir `supabase.auth.getUser()` em `processService.ts`
- [ ] Testar criação de processo
- [ ] Testar listagem de processos
- [ ] Testar atualização e deleção

### Fase 4: Frontend - Formulários (Crítico)
- [ ] Substituir `supabase.auth.getSession()` em `formWizardService.ts`
- [ ] Testar salvamento de progresso
- [ ] Testar carregamento de dados
- [ ] Testar submissão

### Fase 5: Frontend - Documentos (Importante)
- [ ] Substituir `supabase.auth.getUser()` em `documentService.ts`
- [ ] Se mantiver Supabase Storage: validar policies
- [ ] Se migrar para backend: integrar novos endpoints
- [ ] Testar upload/download

### Fase 6: Frontend - Comentários (Importante)
- [ ] Substituir `supabase.auth.getUser()` em `commentService.ts`
- [ ] Testar adição de comentários

### Fase 7: Frontend - Secundários
- [ ] Colaboração (`collaborationService.ts`)
- [ ] Revisão (`RevisaoPage.tsx`)
- [ ] Outros serviços menores

### Fase 8: Testes
- [ ] Testes E2E de autenticação
- [ ] Testes de processos completos
- [ ] Testes de upload/download
- [ ] Testes de permissões

---

## 🚨 Riscos Identificados

### 1. Políticas RLS (Row Level Security)
**Risco:** Políticas que usam `auth.uid()` vão quebrar  
**Mitigação:** Backend precisa ajustar para usar `current_user_id` ou similar

### 2. Supabase Storage
**Risco:** Policies de storage dependem de `auth.uid()`  
**Mitigação:** Decidir entre migrar para backend ou ajustar policies

### 3. Sessões Concorrentes
**Risco:** Token único por usuário ou múltiplas sessões?  
**Mitigação:** Backend define estratégia de sessão

### 4. Renovação de Token
**Risco:** Sem refresh token, usuário será deslogado ao expirar  
**Mitigação:** Implementar endpoint `/auth/refresh`

### 5. Retrocompatibilidade
**Risco:** Quebrar funcionalidades que ainda dependem de Supabase  
**Mitigação:** Manter fallback temporário durante transição

---

## 📊 Estimativa de Esforço

| Fase | Responsável | Esforço | Prioridade |
|------|-------------|---------|------------|
| 1. Definição | Backend + Frontend | 2-4h | 🔴 Alta |
| 2. Backend | Backend | 8-16h | 🔴 Alta |
| 3. Processos | Frontend | 4-6h | 🔴 Alta |
| 4. Formulários | Frontend | 2-4h | 🔴 Alta |
| 5. Documentos | Frontend + Backend | 4-8h | 🟡 Média |
| 6. Comentários | Frontend | 1-2h | 🟡 Média |
| 7. Secundários | Frontend | 2-4h | 🟢 Baixa |
| 8. Testes | Frontend + Backend | 4-8h | 🟡 Média |
| **TOTAL** | | **27-52h** | |

---

## 📝 Decisões Pendentes

### Para o Backend decidir:
1. ✅ ou ❌ Implementar endpoint `/auth/refresh`?
2. ✅ ou ❌ Implementar endpoint `/auth/me`?
3. ✅ ou ❌ Migrar storage para backend ou manter Supabase?
4. ✅ ou ❌ Ajustar policies RLS ou criar nova camada de autorização?
5. ✅ ou ❌ Token único por usuário ou múltiplas sessões?

### Para o Frontend decidir:
1. ✅ ou ❌ Manter fallback para Supabase durante transição?
2. ✅ ou ❌ Criar interceptor global para refresh automático de token?
3. ✅ ou ❌ Implementar logout automático ao expirar token?

---

## 🔗 Arquivos Relacionados

### Arquivos que Precisam Alteração (Frontend):
- `src/services/processService.ts` (5 funções) 🔴
- `src/services/formWizardService.ts` (3 funções) 🔴
- `src/services/documentService.ts` (1 função) 🟡
- `src/services/commentService.ts` (1 função) 🟡
- `src/services/collaborationService.ts` (5 funções) 🟢
- `src/pages/inscricao/RevisaoPage.tsx` (1 função) 🟢

### Arquivos de Referência:
- `src/utils/authToken.ts` - Utilitário de autenticação (já existe)
- `src/contexts/AuthContext.tsx` - Contexto de autenticação
- `src/pages/Login.tsx` - Página de login
- `src/services/activityLicenseService.ts` - Exemplo de uso correto da API

### Documentação Relacionada:
- `documentos/INTEGRACAO_API.md` - Integração com API
- `documentos/MVP1_SEM_AUTENTICACAO.md` - MVP sem autenticação
- `documentos/FIX_RLS_POLICIES.md` - Correções de políticas RLS

---

## 📌 Próximos Passos

1. **Análise pelo time** - Avaliar viabilidade e prioridade
2. **Reunião Backend + Frontend** - Alinhar estratégia técnica
3. **Definir decisões pendentes** - Responder perguntas críticas
4. **Criar issues no GitHub** - Separar tarefas por fase
5. **Iniciar implementação** - Seguir plano de fases

---

## 📧 Contatos

**Frontend:** [Time Frontend]  
**Backend:** [Time Backend]  
**Data última atualização:** 20/11/2025
