# Persistência de processId e userId para Auditoria

**Data:** 03/11/2025  
**Objetivo:** Manter processId e userId persistidos durante toda a sessão de inscrição

## 🎯 Funcionalidades Implementadas

### 1. **Persistência Automática via Zustand Persist**

O store `inscricao` já usa middleware `persist` que salva automaticamente no `localStorage`:

```typescript
{
  name: 'inscricao-storage',
  partialize: (state) => ({
    processId: state.processId,
    userId: state.userId,        // ✅ NOVO - Para auditoria
    propertyId: state.propertyId,
    participants: state.participants,
    property: state.property,
    titles: state.titles,
    atividadeId: state.atividadeId,
    currentStep: state.currentStep
  })
}
```

### 2. **Adicionado userId ao Store**

```typescript
interface InscricaoStore extends InscricaoState {
  userId: string | null;  // ✅ NOVO - ID do usuário logado
  setUserId: (id: string) => void;
  // ... outros campos
}
```

**Uso:**
- Armazenado quando processo é criado
- Persiste entre reloads da página
- Útil para auditoria futura

### 3. **Método startNewInscricao()**

```typescript
startNewInscricao: () => {
  const currentUserId = get().userId;
  console.log('🆕 [Store] Starting new inscription, keeping userId:', currentUserId);
  set({
    ...initialStoreState,
    userId: currentUserId, // ✅ Mantém userId
    processId: null,       // ✅ Limpa processId
    isProcessInitializing: false
  });
}
```

**Diferença entre métodos:**

| Método | processId | userId | Dados | Uso |
|--------|-----------|--------|-------|-----|
| `reset()` | ❌ Limpa | ❌ Limpa | ❌ Limpa tudo | Reiniciar completamente |
| `startNewInscricao()` | ❌ Limpa | ✅ Mantém | ❌ Limpa outros | Nova inscrição mesmo usuário |
| `loadInscricao(id)` | ✅ Seta novo | ✅ Mantém | ⚠️ Carrega do backend | Editar inscrição existente |

### 4. **Método loadInscricao()**

```typescript
loadInscricao: (processId: string) => {
  console.log('📂 [Store] Loading existing inscription:', processId);
  set({ 
    processId,
    currentStep: 1,
    isProcessInitializing: false
  });
  // Aqui você pode adicionar lógica para carregar dados do backend
}
```

**Uso futuro:**
```typescript
// Quando usuário clicar em "Editar Inscrição X"
loadInscricao('uuid-do-processo-existente');
// Depois fazer fetch dos dados do backend e popular o store
```

### 5. **Botão "Nova Inscrição" na UI**

Adicionado botão no header do `InscricaoLayout`:

```tsx
<button
  onClick={handleNewInscricao}
  className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
  title="Iniciar nova inscrição (mantém usuário)"
>
  <Plus className="w-4 h-4" />
  Nova Inscrição
</button>
```

**Fluxo:**
1. Usuário clica "Nova Inscrição"
2. Confirmação: "Deseja iniciar uma nova inscrição?"
3. `startNewInscricao()` é chamado
4. Mantém userId, limpa processId
5. Reload da página
6. `InscricaoLayout` detecta `!processId`
7. Cria novo processo automaticamente

## 📦 Dados Persistidos

### localStorage Key: `inscricao-storage`

```json
{
  "state": {
    "processId": "uuid-do-processo",
    "userId": "123456",
    "propertyId": null,
    "participants": [
      {
        "id": 1,
        "name": "Fulano",
        "role": "REQUERENTE",
        "cpf": "12345678900"
      }
    ],
    "property": null,
    "titles": [],
    "atividadeId": null,
    "currentStep": 1
  },
  "version": 0
}
```

### Verificar no DevTools

Console do navegador:
```javascript
// Ver dados persistidos
JSON.parse(localStorage.getItem('inscricao-storage'))

// Ver apenas processId e userId
const data = JSON.parse(localStorage.getItem('inscricao-storage'));
console.log('processId:', data.state.processId);
console.log('userId:', data.state.userId);
```

## 🔄 Ciclo de Vida Completo

### 1. Login
```
Login via API → localStorage atualizado (auth_user)
```

### 2. Primeira Inscrição
```
Acessa /inscricao/participantes
  → InscricaoLayout detecta !processId
  → Extrai userId de localStorage
  → Cria processo via API
  → setProcessId(uuid)
  → setUserId(userId)
  → Zustand persiste automaticamente
```

### 3. Navegação Entre Páginas
```
/inscricao/participantes → /inscricao/imovel → /inscricao/empreendimento
  ↓                           ↓                    ↓
processId mantido        processId mantido     processId mantido
userId mantido           userId mantido        userId mantido
```

### 4. Reload da Página
```
F5 ou Ctrl+R
  → Zustand carrega de localStorage
  → processId: "uuid-antigo" ✅
  → userId: "123456" ✅
  → InscricaoLayout detecta processId existe
  → NÃO cria novo processo
  → Continua na mesma inscrição
```

### 5. Nova Inscrição
```
Botão "Nova Inscrição"
  → Confirmação
  → startNewInscricao()
  → processId: null
  → userId: "123456" ✅ (mantido)
  → Reload
  → Cria NOVO processo
  → userId continua o mesmo
```

### 6. Logout
```
SignOut()
  → localStorage.clear() (auth)
  → Zustand mantém inscricao-storage
  → Ao fazer novo login:
    → userId será atualizado
    → processId antigo ainda existe
    → Pode limpar com reset() se necessário
```

## 🔐 Auditoria Futura

### Dados Disponíveis

```typescript
// No store sempre tem:
const { processId, userId } = useInscricaoStore();

// Pode enviar para API em qualquer operação:
await api.post('/participantes', {
  processo_id: processId,  // UUID do processo
  user_id: userId,         // ID do usuário logado
  created_by: userId,      // Quem criou
  updated_by: userId,      // Quem atualizou
  ...dados
});
```

### Campos de Auditoria (Backend)

```sql
CREATE TABLE participantes (
  id UUID PRIMARY KEY,
  processo_id UUID NOT NULL,
  user_id VARCHAR(100) NOT NULL,
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_by VARCHAR(100),
  updated_at TIMESTAMP DEFAULT NOW(),
  ...
);
```

### Rastreamento Completo

```typescript
// Exemplo de função genérica com auditoria
async function saveWithAudit(endpoint: string, data: any) {
  const { processId, userId } = useInscricaoStore.getState();
  
  return await http.post(endpoint, {
    ...data,
    processo_id: processId,
    user_id: userId,
    created_by: userId,
    created_at: new Date().toISOString()
  });
}
```

## 📊 Cenários de Uso

### Cenário 1: Usuário Normal
```
1. Login → userId salvo
2. Nova Inscrição → processId criado
3. Preenche dados → tudo salvo com processId + userId
4. Fecha navegador
5. Abre novamente → processId + userId recuperados
6. Continua de onde parou ✅
```

### Cenário 2: Múltiplas Inscrições
```
1. Inscrição A → processId: "aaa", userId: "123"
2. Botão "Nova Inscrição"
3. Inscrição B → processId: "bbb", userId: "123" (mesmo user)
4. Dados separados por processId ✅
```

### Cenário 3: Equipe (Futuro)
```
User 1 cria processo
  → processId: "xxx", created_by: "user1"
  
User 2 edita mesmo processo
  → processId: "xxx", updated_by: "user2"
  
Auditoria mostra:
  - Criado por: user1
  - Modificado por: user2
  - Histórico completo ✅
```

## 🚀 Próximos Passos

### Implementação Futura

1. **Carregar Inscrição Existente**
```typescript
// Na dashboard, ao clicar em "Editar"
const handleEdit = (processId: string) => {
  loadInscricao(processId);
  navigate('/inscricao/participantes');
  // TODO: Fetch dados do backend e popular store
};
```

2. **Listagem de Inscrições do Usuário**
```typescript
const inscricoes = await http.get(`/processos?user_id=${userId}`);
// Mostrar lista para usuário escolher qual editar
```

3. **Auditoria Completa**
```typescript
// Tabela de histórico
const history = await http.get(`/processos/${processId}/history`);
// Mostra quem criou, quem modificou, quando, etc
```

4. **Validação de Permissão**
```typescript
// Verificar se userId atual pode editar processo
const canEdit = await http.get(`/processos/${processId}/can-edit/${userId}`);
```

## ✅ Resumo

- ✅ processId e userId persistem automaticamente
- ✅ Sobrevivem a reloads da página
- ✅ Método para nova inscrição mantendo usuário
- ✅ Método para carregar inscrição existente
- ✅ Botão "Nova Inscrição" na UI
- ✅ Base pronta para auditoria futura
- ✅ Compatível com SQLite local (futuro)

**Teste agora:** Faça login, crie uma inscrição, recarregue a página (F5) e veja que o processId se mantém! 🎉
