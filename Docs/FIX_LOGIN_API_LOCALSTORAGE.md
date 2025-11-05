# Fix: Login via API (localStorage) no InscricaoLayout

**Data:** 03/11/2025  
**Problema:** Timeout ao criar nova inscrição após login via API FastAPI  
**Causa:** `InscricaoLayout` não detectava usuário logado via localStorage (apenas Supabase)

## 🔍 Diagnóstico

### Sintoma
```javascript
// Console mostrava:
hasSupabaseUser: false,
hasLocalUser: false,  // ❌ Não detectava
effectiveUser: false, // ❌ Não detectava
reason: 'no user'
```

### Causa Raiz
O sistema tem **2 formas de autenticação**:
1. **Supabase Auth** - `user` do `useAuth()` context
2. **API FastAPI** - Login via `/api/v1/auth/login` (armazena em localStorage)

O `InscricaoLayout` dependia de `user` (Supabase) no `useEffect`, mas quando logado via API:
- `user` = `null` (Supabase não usado)
- `localStorage` tinha `auth_user` e `auth_token`
- `useEffect` **não era disparado** quando localStorage mudava

## 🛠️ Solução Implementada

### 1. Adicionado State Trigger
```typescript
const [authTrigger, setAuthTrigger] = useState(0);
```

### 2. Listener para localStorage
```typescript
useEffect(() => {
  const handleStorageChange = () => {
    console.log('🔄 [InscricaoLayout] localStorage changed, triggering re-render');
    setAuthTrigger(prev => prev + 1);
  };

  // Checar imediatamente ao montar
  const hasAuthToken = localStorage.getItem('auth_token');
  const hasUserData = localStorage.getItem('auth_user') || 
                      localStorage.getItem('userData') || 
                      localStorage.getItem('userdata');
  
  if (hasAuthToken || hasUserData) {
    console.log('✅ [InscricaoLayout] Detected API auth in localStorage');
    setAuthTrigger(prev => prev + 1);
  }

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);
```

### 3. authTrigger nas Dependências
```typescript
useEffect(() => {
  const localUser = getLocalStorageUser();
  const effectiveUser = user || localUser;
  
  // ... lógica de inicialização
  
}, [loading, processId, setProcessId, setProcessInitializing, user, authTrigger]);
//                                                                   ^^^^^^^^^^^^
//                                                        Força re-execução quando muda
```

### 4. Melhor Extração de userId
```typescript
const userId = effectiveUser.id 
  || effectiveUser.pkpessoa 
  || effectiveUser.email 
  || effectiveUser.numeroIdentificacao
  || effectiveUser.cpf
  || effectiveUser.cnpj
  || '';
```

## ✅ Resultado

### Antes
```javascript
// Login via API → localStorage atualizado
// Mas InscricaoLayout não detectava
hasLocalUser: false
effectiveUser: false
reason: 'no user'
→ TIMEOUT
```

### Depois
```javascript
// Login via API → localStorage atualizado
// authTrigger incrementa → useEffect dispara
✅ [InscricaoLayout] Detected API auth in localStorage
hasLocalUser: true   // ✅ Detecta!
effectiveUser: true  // ✅ Detecta!
🆕 Creating new draft process via API...
✅ Draft process created: "uuid-aqui"
→ SUCESSO
```

## 📋 Fluxo Completo

1. **Usuário faz login** via `/login` → API FastAPI
2. **localStorage atualizado** com `auth_token` e `auth_user`
3. **Listener dispara** → `authTrigger` incrementa
4. **useEffect re-executa** → `getLocalStorageUser()` busca dados
5. **effectiveUser encontrado** → Cria processo
6. **processId armazenado** → Fluxo de inscrição continua

## 🔑 Dados no localStorage

Após login via API, localStorage contém:

```javascript
{
  "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "auth_user": "{\"id\":\"123\",\"nome\":\"Usuario\",\"pkpessoa\":456,...}"
  // ou
  "userData": "{...}",
  "userdata": "{...}"
}
```

A função `getLocalStorageUser()` busca em todas essas chaves possíveis.

## 🎯 Compatibilidade

Este fix mantém compatibilidade com **ambos** os métodos de autenticação:

- ✅ **Supabase Auth** (`user` do context)
- ✅ **API FastAPI** (localStorage)
- ✅ **Híbrido** (tenta Supabase primeiro, fallback para API)

## 📝 Arquivos Modificados

- `src/components/InscricaoLayout.tsx`
  - Adicionado `useState` import
  - Adicionado `authTrigger` state
  - Adicionado listener de localStorage
  - Melhorada extração de userId
  - Atualizado array de dependências do useEffect

## 🚀 Para Testar

1. Faça login via `/login` (API FastAPI)
2. Clique em "Nova Inscrição"
3. Console deve mostrar:
   ```
   ✅ [InscricaoLayout] Detected API auth in localStorage
   hasLocalUser: true
   effectiveUser: true
   👤 Using userId: "seu-id"
   🆕 Creating new draft process via API...
   ✅ Draft process created: "uuid-do-processo"
   ```

## 🔮 Futuro: SQLite Local

Quando migrar para SQLite local, este mesmo padrão funcionará:
- Login local → localStorage atualizado
- authTrigger detecta mudança
- Processo criado normalmente

Apenas ajustar a API backend (FastAPI) para usar SQLite ao invés de PostgreSQL.
