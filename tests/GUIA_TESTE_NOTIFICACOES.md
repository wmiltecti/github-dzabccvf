# 🧪 GUIA DE TESTE - Sistema de Notificações

## 📋 Pré-requisitos

1. ✅ Backend rodando em: `https://fastapi-sandbox-ee3p.onrender.com/api/v1`
2. ✅ Python 3.11+ instalado
3. ✅ Biblioteca `requests` instalada: `pip install requests`

## 🚀 Passo a Passo para Testar

### 1️⃣ **Iniciar o Frontend**

```powershell
npm run dev
```

Acesse: `http://localhost:5173`

---

### 2️⃣ **Fazer Login e Obter seu USER_ID**

1. Faça login no sistema
2. Abra o **DevTools** (pressione `F12`)
3. Vá para a aba **Console**
4. Digite e execute:
   ```javascript
   localStorage.getItem('userId')
   ```
5. **Copie o ID** que aparecer (exemplo: `"123e4567-e89b-12d3-a456-426614174000"`)

---

### 3️⃣ **Configurar o Script de Teste**

1. Abra o arquivo: `tests/test_notifications.py`
2. Na **linha 11**, substitua:
   ```python
   USER_ID = "seu-user-id-aqui"
   ```
   Por:
   ```python
   USER_ID = "123e4567-e89b-12d3-a456-426614174000"  # ⚠️ Cole seu ID aqui
   ```

---

### 4️⃣ **Instalar Dependência (se necessário)**

```powershell
pip install requests
```

---

### 5️⃣ **Executar o Script de Teste**

```powershell
python tests/test_notifications.py
```

**Saída esperada:**
```
============================================================
🔔 TESTE DO SISTEMA DE NOTIFICAÇÕES
============================================================

👤 Testando com USER_ID: 123e4567-e89b-12d3-a456-426614174000
------------------------------------------------------------

📝 Criando notificações de teste...
------------------------------------------------------------
✅ Notificação criada: Bem-vindo ao sistema!
✅ Notificação criada: Processo aprovado
✅ Notificação criada: Documento pendente
✅ Notificação criada: Erro no processamento
✅ Notificação criada: Nova tarefa atribuída

------------------------------------------------------------
📊 Total de notificações: 5
  ✉️ Nova - [INFO] Bem-vindo ao sistema!
  ✉️ Nova - [SUCCESS] Processo aprovado
  ✉️ Nova - [WARNING] Documento pendente
  ✉️ Nova - [ERROR] Erro no processamento
  ✉️ Nova - [INFO] Nova tarefa atribuída

📈 Estatísticas:
  Não lidas: 5
  Total: 5

============================================================
✅ TESTE CONCLUÍDO!
============================================================
```

---

### 6️⃣ **Testar no Frontend**

#### **A) No Header (qualquer página com InscricaoLayout)**

1. Acesse: `http://localhost:5173/inscricao/participantes`
2. Veja o **sino de notificações (🔔)** no header à direita
3. Deve ter um **badge vermelho** com o número `5`
4. **Clique no sino** para abrir o dropdown
5. Você verá as **últimas 5 notificações** com cores diferentes:
   - 🔵 **Azul** = INFO
   - 🟢 **Verde** = SUCCESS
   - 🟡 **Amarelo** = WARNING
   - 🔴 **Vermelho** = ERROR

#### **B) Ações no Dropdown**

- **"Marcar todas como lidas"**: Remove o badge e marca tudo
- **Clicar em uma notificação**: Marca como lida e navega para a URL
- **"Ver todas as notificações"**: Vai para `/notificacoes`

#### **C) Na Página de Notificações**

1. Clique em **"Ver todas as notificações"** no dropdown
2. Você será redirecionado para: `http://localhost:5173/notificacoes`
3. Verá 3 abas:
   - **Todas** (5 notificações)
   - **Não lidas** (variável)
   - **Lidas** (variável)
4. Teste as ações:
   - **Marcar como lida** (botão ✓)
   - **Deletar** (botão 🗑️)
   - **Clicar na notificação** (navega para a página)

---

### 7️⃣ **Testar Auto-Refresh (Polling)**

1. Mantenha a página `/inscricao/participantes` aberta
2. Em outra aba/terminal, execute novamente:
   ```powershell
   python tests/test_notifications.py
   ```
3. **Aguarde até 30 segundos** (tempo do polling)
4. O **badge do sino** deve atualizar automaticamente com o novo número

---

## 🐛 Troubleshooting

### ❌ **Erro: CORS Policy**

**Problema:** `Access to fetch at '...' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solução:** O backend precisa permitir requisições do frontend:
```python
# No backend FastAPI
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### ❌ **Erro: 401 Unauthorized**

**Problema:** `Authorization header required`

**Solução:** 
1. Verifique se o token está no localStorage:
   ```javascript
   localStorage.getItem('token')
   ```
2. Se não houver token, faça login novamente
3. O token é automaticamente incluído nos headers pelo `notificationService.ts`

---

### ❌ **Erro: Não aparece nenhuma notificação**

**Possíveis causas:**

1. **USER_ID incorreto no script**
   - Verifique se o ID no script é o mesmo do `localStorage.getItem('userId')`

2. **Backend não está rodando**
   - Teste diretamente: `https://fastapi-sandbox-ee3p.onrender.com/api/v1/notifications/stats?user_id=SEU_ID`

3. **Formato de data incompatível**
   - Backend deve retornar `created_at` no formato ISO: `"2024-11-19T10:30:00"`

---

### ❌ **Badge não atualiza automaticamente**

**Solução:** O polling está configurado para 30 segundos. Para testar mais rápido:

1. Abra: `src/components/notifications/NotificationBell.tsx`
2. Linha 16, mude de `30000` para `5000` (5 segundos):
   ```typescript
   startPolling(5000); // Atualiza a cada 5 segundos
   ```

---

## 📊 Verificar se o Backend está Funcionando

### **Teste Manual com cURL/PowerShell:**

```powershell
# Obter estatísticas
$userId = "SEU_USER_ID_AQUI"
Invoke-RestMethod -Uri "https://fastapi-sandbox-ee3p.onrender.com/api/v1/notifications/stats?user_id=$userId" -Method GET

# Listar notificações
Invoke-RestMethod -Uri "https://fastapi-sandbox-ee3p.onrender.com/api/v1/notifications?user_id=$userId&skip=0&limit=20" -Method GET
```

---

## ✅ Checklist de Testes

- [ ] Script de teste executa sem erros
- [ ] 5 notificações são criadas no backend
- [ ] Badge vermelho aparece no sino (🔔 5)
- [ ] Dropdown abre ao clicar no sino
- [ ] Notificações aparecem com cores corretas
- [ ] "Marcar todas como lidas" funciona
- [ ] Badge desaparece após marcar como lidas
- [ ] Clicar em notificação navega para a URL
- [ ] Página `/notificacoes` carrega corretamente
- [ ] Abas (Todas/Não lidas/Lidas) funcionam
- [ ] Botão "Marcar como lida" funciona
- [ ] Botão "Deletar" remove a notificação
- [ ] Polling atualiza o badge automaticamente (após 30s)
- [ ] Mensagens de erro aparecem corretamente (se houver)

---

## 📚 Documentação Completa

Para mais detalhes, consulte:
- **documentos/SISTEMA_NOTIFICACOES.md** - Documentação técnica completa
- **documentos/EXEMPLO_INTEGRACAO_NOTIFICACOES.tsx** - Exemplos de integração

---

## 🎯 Próximos Passos (Opcional)

Após testar o básico:

1. **Integrar em outras páginas**:
   - Adicionar `<NotificationBell>` no Dashboard
   - Adicionar em outros layouts

2. **Melhorar o polling**:
   - Implementar WebSocket para notificações em tempo real
   - Usar React Query para cache

3. **Adicionar sons/desktop notifications**:
   - `new Notification()` API do navegador
   - Som ao receber nova notificação

4. **Filtros avançados**:
   - Filtrar por tipo (SYSTEM, PROCESS, DOCUMENT)
   - Filtrar por severidade
   - Busca por texto

---

**🚀 Bom teste!**
