# 🔐 Auto-Login via URL - Implementação Completa

> Sistema de autenticação automática através de parâmetros na URL

---

## 📋 Visão Geral

Este sistema permite que usuários sejam autenticados automaticamente ao acessarem a aplicação através de uma URL com parâmetros específicos.

###  **Fluxo de Funcionamento:**

1. Usuário clica em link externo com parâmetros de autenticação
2. Aplicação detecta os parâmetros na URL
3. Token e dados do usuário são salvos no localStorage
4. URL é limpa (parâmetros removidos)
5. Aplicação redireciona para dashboard já autenticado

---

## 🔗 Formato da URL

```
https://seu-app.com?token=JWT_TOKEN&userId=USER_ID&nome=NOME&email=EMAIL
```

### **Parâmetros Suportados:**

| Parâmetro | Obrigatório | Descrição | Exemplo |
|-----------|------------|-----------|---------|
| `token` | ✅ Sim | JWT token de autenticação | `eyJhbGciOiJIUzI1NiIs...` |
| `userId` | ✅ Sim | ID do usuário | `123` ou `uuid-abc-def` |
| `nome` | ❌ Não | Nome do usuário | `João Silva` |
| `email` | ❌ Não | Email do usuário | `joao@example.com` |

### **Exemplo Completo:**

```
https://wmiltecti-github-dza-lbqp.bolt.host?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMifQ.abc123&userId=123&nome=João%20Silva&email=joao@example.com
```

---

## 🛠️ Implementação

### **1. Hook Personalizado: `useAutoLogin`**

**Arquivo:** `src/hooks/useAutoLogin.ts`

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useAutoLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    const processAutoLogin = () => {
      // 1. Captura parâmetros da URL
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const userId = urlParams.get('userId');
      const nome = urlParams.get('nome');
      const email = urlParams.get('email');

      if (!token || !userId) return;

      // 2. Salva token (formato FastAPI)
      localStorage.setItem('auth_token', token);

      // 3. Salva dados do usuário
      const authUser = {
        userId, id: userId, nome, email, token,
        autoLogin: true,
        loginTimestamp: new Date().toISOString()
      };
      localStorage.setItem('auth_user', JSON.stringify(authUser));

      // 4. Compatibilidade com Dashboard
      localStorage.setItem('userData', JSON.stringify({ token, userId, nome, email }));

      // 5. Marca como processado
      sessionStorage.setItem('auto_login_processed', 'true');

      // 6. Limpa URL
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);

      // 7. Dispara evento
      window.dispatchEvent(new CustomEvent('auto-login', { detail: { userId, nome, email } }));

      // 8. Redireciona
      setTimeout(() => window.location.href = '/', 100);
    };

    // Só executa uma vez
    const alreadyProcessed = sessionStorage.getItem('auto_login_processed');
    if (!alreadyProcessed) {
      processAutoLogin();
    }
  }, [navigate]);
}
```

### **2. Integração no App.tsx**

```tsx
import { useAutoLogin } from './hooks/useAutoLogin';

function AppRoutes() {
  // Processa auto-login via URL
  useAutoLogin();

  return (
    <Routes>
      {/* suas rotas */}
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ToastContainer />
      </Router>
    </AuthProvider>
  );
}
```

### **3. Funções Auxiliares**

```typescript
// Verifica se está autenticado via auto-login
export function isAutoLoginActive(): boolean {
  const authToken = localStorage.getItem('auth_token');
  const authUser = localStorage.getItem('auth_user');
  return !!(authToken && authUser);
}

// Limpa dados de auto-login
export function clearAutoLogin(): void {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  localStorage.removeItem('userData');
  sessionStorage.removeItem('auto_login_processed');
}

// Obtém informações do usuário
export function getAutoLoginUser(): any | null {
  try {
    const authUserStr = localStorage.getItem('auth_user');
    if (!authUserStr) return null;
    const user = JSON.parse(authUserStr);
    return user.autoLogin ? user : null;
  } catch {
    return null;
  }
}
```

---

## 📊 Dados Salvos no localStorage

Após o auto-login, os seguintes dados são armazenados:

### **1. `auth_token`** (String)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
Token JWT puro para autenticação com a API.

### **2. `auth_user`** (JSON)
```json
{
  "userId": "123",
  "id": "123",
  "nome": "João Silva",
  "email": "joao@example.com",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "autoLogin": true,
  "loginTimestamp": "2025-11-04T15:30:00.000Z"
}
```

### **3. `userData`** (JSON - Compatibilidade)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "userId": "123",
  "nome": "João Silva",
  "email": "joao@example.com"
}
```

### **4. `auto_login_processed`** (sessionStorage)
```
"true"
```
Flag para evitar processamento duplicado.

---

## 🔄 Fluxo Detalhado

```
┌─────────────────────────────────────────────────────────┐
│ 1. Usuário acessa URL com parâmetros                    │
│    https://app.com?token=...&userId=...                 │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 2. useAutoLogin hook detecta parâmetros                 │
│    - Extrai: token, userId, nome, email                 │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Salva dados no localStorage                          │
│    ✓ auth_token                                          │
│    ✓ auth_user                                           │
│    ✓ userData                                            │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Limpa URL (remove parâmetros)                        │
│    https://app.com                                       │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Dispara evento 'auto-login'                          │
│    window.dispatchEvent(...)                            │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 6. Redireciona para /                                   │
│    (Página recarrega com autenticação)                  │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 7. ProtectedRoute valida auth_token                     │
│    ✓ Token presente → Acesso liberado                   │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 8. Dashboard carrega com usuário autenticado            │
└─────────────────────────────────────────────────────────┘
```

---

## 🧪 Como Testar

### **1. Teste Manual:**

1. Gere um token JWT válido (pode usar jwt.io ou backend)
2. Construa a URL:
   ```
   http://localhost:5173?token=SEU_TOKEN&userId=123&nome=Teste&email=teste@test.com
   ```
3. Cole no navegador
4. Verifique:
   - ✅ URL foi limpa (sem parâmetros)
   - ✅ Redirecionou para dashboard
   - ✅ localStorage tem `auth_token`, `auth_user`, `userData`
   - ✅ Console mostra logs `[Auto-Login]`

### **2. Teste no Console do Navegador:**

```javascript
// Verificar autenticação
console.log('Token:', localStorage.getItem('auth_token'));
console.log('User:', JSON.parse(localStorage.getItem('auth_user')));

// Limpar autenticação
localStorage.removeItem('auth_token');
localStorage.removeItem('auth_user');
localStorage.removeItem('userData');
sessionStorage.removeItem('auto_login_processed');
```

---

## 🔒 Segurança

### **Considerações Importantes:**

1. **Token na URL é visível:**
   - Tokens aparecem no histórico do navegador
   - Podem ser compartilhados acidentalmente
   - **Recomendação:** Use tokens de curta duração (15-30 min)

2. **Validação no Backend:**
   - Sempre valide o token no servidor
   - Nunca confie apenas no cliente

3. **HTTPS Obrigatório:**
   - Use apenas em produção com HTTPS
   - Evita interceptação do token

4. **Token Expiration:**
   - Implemente verificação de expiração
   - Redirecione para login se expirado

### **Melhorias de Segurança:**

```typescript
// Adicionar verificação de expiração
const tokenExpiresAt = localStorage.getItem('token_expires_at');
if (tokenExpiresAt && new Date() > new Date(tokenExpiresAt)) {
  clearAutoLogin();
  window.location.href = '/login';
}
```

---

## 🐛 Troubleshooting

### **Problema: Loop Infinito**

**Causa:** Hook processando múltiplas vezes  
**Solução:** `sessionStorage` com flag `auto_login_processed`

### **Problema: Não redireciona**

**Causa:** Token inválido ou ausente  
**Solução:** Verificar console do navegador para logs `[Auto-Login]`

### **Problema: Logout não funciona**

**Causa:** Dados não foram limpos  
**Solução:** Chamar `clearAutoLogin()` no logout

---

## 📝 Logs e Debug

O sistema gera logs detalhados no console:

```
[Auto-Login] Detectados parâmetros de login automático
[Auto-Login] UserId: 123
[Auto-Login] Nome: João Silva
[Auto-Login] Email: joao@example.com
[Auto-Login] ✓ Token armazenado em auth_token
[Auto-Login] ✓ Dados do usuário armazenados em auth_user
[Auto-Login] ✓ Dados salvos em userData (compatibilidade)
[Auto-Login] ✓ URL limpa
[Auto-Login] ✓ Evento auto-login disparado
[Auto-Login] ✓ Recarregando aplicação autenticada...
```

---

## 🔄 Integração com Sistema Externo

Se você tem um sistema externo que precisa redirecionar para este app:

```javascript
// Sistema externo (ex: bolt.host)
function redirectToLicenciamento(user) {
  const token = generateJWT(user); // Seu método de gerar JWT
  const params = new URLSearchParams({
    token: token,
    userId: user.id,
    nome: user.nome,
    email: user.email
  });
  
  const url = `https://wmiltecti-github-dza-lbqp.bolt.host?${params.toString()}`;
  window.location.href = url;
}
```

---

## ✅ Checklist de Implementação

- [x] Hook `useAutoLogin` criado
- [x] Integrado no `App.tsx`
- [x] Funções auxiliares implementadas
- [x] Logs de debug adicionados
- [x] Documentação completa
- [ ] Testes manuais realizados
- [ ] Testes em produção
- [ ] Integração com sistema externo validada

---

**Versão:** 1.0.0  
**Data:** 04/11/2025  
**Autor:** Equipe de Desenvolvimento
