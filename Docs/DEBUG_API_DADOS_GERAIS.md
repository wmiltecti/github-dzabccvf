# 🔍 DEBUG: Por que os dados não aparecem no banco?

## ✅ Correções Aplicadas

1. **Path da API corrigido:**
   - ❌ Antes: `/processos/{id}/dados-gerais`
   - ✅ Agora: `/api/v1/processos/{id}/dados-gerais`

2. **Logs detalhados adicionados em TODAS as camadas:**
   - ✅ HTTP interceptor (request/response)
   - ✅ Função `upsertDadosGerais` na API
   - ✅ Função `criarProcesso` na API
   - ✅ Função `saveStepToAPI` no componente

---

## 🧪 Como Verificar Agora

### 1. Abra o DevTools (F12) → Console

### 2. Preencha o formulário e clique em "Salvar" ou "Avançar"

Você deve ver TODOS estes logs na ORDEM:

```
🚀 Iniciando salvamento dos dados gerais...
📝 Processo ID: abc-123-def
📊 Dados do formulário: { codigoCNAE: "1011-2/01", ... }
✓ Validação de dados passou com sucesso
📤 Payload a ser enviado para API: { porte: "Médio", ... }
⏰ Timestamp: 2025-...

📡 upsertDadosGerais - Iniciando chamada: { processoId: "abc-123-def", payload: {...} }

🌐 HTTP Request: {
  method: "PUT",
  url: "/api/v1/processos/abc-123-def/dados-gerais",
  baseURL: "http://localhost:8000",
  fullURL: "http://localhost:8000/api/v1/processos/abc-123-def/dados-gerais",
  data: { processo_id: "abc-123-def", porte: "Médio", ... }
}
```

**CRÍTICO:** Veja se a `fullURL` está correta: `http://localhost:8000/api/v1/processos/{id}/dados-gerais`

---

## 3. Cenários Possíveis

### ✅ Cenário 1: API responde com sucesso (200)

```
✅ HTTP Response: {
  status: 200,
  statusText: "OK",
  url: "/api/v1/processos/abc-123-def/dados-gerais",
  data: { id: "...", protocolo_interno: "2025/000001", ... }
}

📡 upsertDadosGerais - Response recebido: { id: "...", protocolo_interno: "2025/000001" }
✅ Dados salvos com sucesso na API!
📨 Response da API: { protocolo_interno: "2025/000001" }
```

**Se você vê isso mas os dados não estão no banco:**
- ✅ Frontend está funcionando perfeitamente
- ❌ **Problema está no BACKEND FastAPI**
- 🔍 Veja os logs do backend FastAPI
- 🔍 Verifique se o endpoint `/api/v1/processos/{id}/dados-gerais` está salvando no banco

---

### ❌ Cenário 2: API responde com erro (400, 404, 500)

```
❌ HTTP Error: {
  status: 404,
  statusText: "Not Found",
  url: "/api/v1/processos/abc-123-def/dados-gerais",
  errorCode: undefined,
  responseData: { detail: "Process not found" },
  message: "Request failed with status code 404"
}

📡 upsertDadosGerais - Erro: Error: Process not found
❌ Erro ao salvar dados gerais: Error: Process not found
```

**Possíveis causas:**
- ❌ Processo não existe no banco
- ❌ Endpoint `/api/v1/processos/{id}/dados-gerais` não existe no backend
- ❌ Backend retorna erro 500 (erro interno)

**Solução:**
1. Copie o `processo_id` do console
2. Abra o Swagger: http://localhost:8000/docs
3. Teste o endpoint `GET /api/v1/processos/{processo_id}` para ver se o processo existe
4. Teste o endpoint `PUT /api/v1/processos/{processo_id}/dados-gerais` diretamente no Swagger

---

### 🔸 Cenário 3: Erro de rede (backend não está rodando)

```
❌ HTTP Error: {
  status: undefined,
  statusText: undefined,
  url: "/api/v1/processos/abc-123-def/dados-gerais",
  errorCode: "ERR_NETWORK",
  responseData: undefined,
  message: "Network Error"
}

🔸 Salvando dados localmente devido a erro na API
```

**Solução:**
- ❌ Backend não está rodando
- ✅ Execute o backend: `uvicorn main:app --reload`
- ✅ Verifique se está em http://localhost:8000

---

## 4. Verificar no Network Tab (F12 → Network)

### Filtrar por "Fetch/XHR"

Você deve ver:

1. **Request: PUT dados-gerais**
   - URL: `http://localhost:8000/api/v1/processos/{id}/dados-gerais`
   - Status: `200 OK` (se sucesso)
   - Method: `PUT`

2. **Abrir a request → Headers:**
   ```
   Request URL: http://localhost:8000/api/v1/processos/{id}/dados-gerais
   Request Method: PUT
   Status Code: 200 OK
   ```

3. **Abrir a request → Payload:**
   ```json
   {
     "processo_id": "abc-123-def",
     "porte": "Médio",
     "potencial_poluidor": "Alto",
     "cnae_codigo": "1011-2/01",
     "cnae_descricao": "Frigorífico - abate de bovinos",
     "numero_empregados": 50,
     "possui_licenca_anterior": true,
     "licenca_tipo": "LP",
     "licenca_numero": "12345/2023",
     "licenca_ano": 2023,
     "licenca_validade": "2025-12-31"
   }
   ```

4. **Abrir a request → Response:**
   ```json
   {
     "id": "uuid",
     "processo_id": "abc-123-def",
     "protocolo_interno": "2025/000001",
     "porte": "Médio",
     ...
   }
   ```

---

## 5. Verificar no Backend FastAPI

### No terminal do backend, você deve ver:

```
INFO:     127.0.0.1:xxxxx - "PUT /api/v1/processos/abc-123-def/dados-gerais HTTP/1.1" 200 OK
```

### Se não aparecer:
- ❌ Request não está chegando no backend
- 🔍 Verifique se a URL está correta
- 🔍 Verifique se o backend está rodando na porta 8000

---

## 6. Verificar no Banco de Dados

### Se a API responde 200 mas dados não aparecem no banco:

**Problema:** O endpoint do backend não está salvando no banco

**Verifique no código do backend:**

```python
@router.put("/api/v1/processos/{processo_id}/dados-gerais")
async def upsert_dados_gerais(processo_id: str, dados: DadosGeraisCreate):
    # VERIFIQUE SE TEM ESTA LINHA:
    db.commit()  # ← SEM ISSO, OS DADOS NÃO SÃO SALVOS!
    db.refresh(dados_gerais)
    return dados_gerais
```

---

## 📋 Checklist de Debugging

Execute na ordem:

- [ ] 1. Backend FastAPI está rodando em http://localhost:8000
- [ ] 2. Swagger está acessível em http://localhost:8000/docs
- [ ] 3. Frontend rodando com `npm run dev`
- [ ] 4. Arquivo `.env` tem: `VITE_API_BASE_URL=http://localhost:8000`
- [ ] 5. DevTools (F12) aberto na aba Console
- [ ] 6. Formulário preenchido com todos os campos obrigatórios
- [ ] 7. Clicar em "Salvar" e ver logs no console
- [ ] 8. Logs mostram: `fullURL: http://localhost:8000/api/v1/processos/{id}/dados-gerais`
- [ ] 9. Logs mostram: `✅ HTTP Response: { status: 200 }`
- [ ] 10. Logs mostram: `protocolo_interno: "2025/000001"`
- [ ] 11. Na aba Network, request aparece com status 200
- [ ] 12. No terminal do backend, log mostra: `"PUT /api/v1/processos/{id}/dados-gerais HTTP/1.1" 200 OK`
- [ ] 13. No banco de dados, tabela `dados_gerais` tem o registro

---

## 🎯 Identificando Onde Está o Problema

### Frontend está OK se:
- ✅ Logs aparecem no console do navegador
- ✅ Request aparece na aba Network
- ✅ Payload está correto
- ✅ URL é: `http://localhost:8000/api/v1/processos/{id}/dados-gerais`

### Backend está OK se:
- ✅ Log aparece no terminal: `"PUT ... HTTP/1.1" 200 OK`
- ✅ Swagger consegue executar o endpoint manualmente
- ✅ Response retorna `protocolo_interno`

### Banco de dados está OK se:
- ✅ Backend tem `db.commit()`
- ✅ Query SQL é executada corretamente
- ✅ Registro aparece na tabela

---

## 🔧 Próximos Passos

1. **Execute o teste e cole TODOS os logs do console aqui**
2. **Verifique qual dos 3 cenários está acontecendo**
3. **Se Cenário 1 (200 OK):** Problema é no backend, não no frontend
4. **Se Cenário 2 (erro 4xx/5xx):** Veja a mensagem de erro
5. **Se Cenário 3 (Network Error):** Backend não está rodando

---

## ✨ O Que Foi Corrigido

- ✅ Path da API agora tem `/api/v1/` prefixo
- ✅ Logs detalhados em TODAS as camadas
- ✅ Request URL completa é exibida no console
- ✅ Response completo é exibido no console
- ✅ Erros são logados com detalhes

**Agora você consegue ver EXATAMENTE onde o fluxo está parando!**
