# MVP1 - Configuração sem Autenticação

## 📋 Mudanças Implementadas

### Arquivo: `src/lib/api/http.ts`

**Alteração 1: Removido envio automático do token**
```typescript
// ANTES (com autenticação):
const token = localStorage.getItem('auth_token');
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}

// AGORA (sem autenticação - MVP1):
// MVP1: Sem autenticação (igual testes Python)
// TODO MVP2: Implementar autenticação segura
// const token = localStorage.getItem('auth_token');
// if (token) {
//   config.headers.Authorization = `Bearer ${token}`;
// }
```

**Alteração 2: Desabilitado retry/refresh de token em 401**
```typescript
// Toda a lógica de retry/refresh foi comentada
// MVP1: Sem retry/refresh de token (igual testes Python)
// TODO MVP2: Implementar lógica de autenticação e refresh
```

---

## ✅ Resultado

Agora o frontend funciona **exatamente como os testes Python**:
- ✅ Nenhum header `Authorization` enviado
- ✅ Requisições diretas ao backend localhost:8000
- ✅ Sem validação de JWT/tokens
- ✅ Compatível com endpoints públicos do backend

---

## 🧪 Endpoints Testados e Funcionando

### POST `/api/v1/processos/`
```json
// Request (sem auth):
{
  "status": "draft",
  "user_id": "264671"
}

// Response:
{
  "id": "68a0724e-6c05-4767-9a52-914753a15523",
  "user_id": "264671",
  "status": "draft",
  "created_at": "2025-11-03T14:45:18.805539+00:00"
}
```

### PUT `/api/v1/processos/{processo_id}/dados-gerais`
```json
// Request (sem auth):
{
  "processo_id": "TESTE-FRONTEND-002",
  "tipo_pessoa": "PF",
  "cpf": "12345678901",
  "razao_social": "Teste Frontend",
  "porte": "ME",
  "potencial_poluidor": "baixo",
  "descricao_resumo": "Teste sem autenticacao"
}

// Response: ✅ Criado com sucesso
```

---

## 🚀 Próximos Passos (MVP2)

Quando implementar autenticação segura:

1. **Descomentar** as linhas em `http.ts`
2. **Configurar backend** para retornar JWT do Supabase
3. **Implementar** refresh token endpoint
4. **Testar** fluxo completo de autenticação

---

## 📍 Estado Atual

- ✅ Frontend: SEM autenticação (igual Python)
- ✅ Backend: Endpoints públicos funcionando
- ✅ Dev Server: Porta 5174
- ✅ Pronto para testar criação de processos

**Teste agora:**
1. Acesse http://localhost:5174
2. Vá em "Nova Inscrição"
3. O processo deve ser criado sem erros 401!
