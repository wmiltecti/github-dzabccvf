# Guia de Teste: Integração API - Dados Gerais

## ✅ O Que Foi Implementado

A integração com as duas APIs do FastAPI na aba "Dados Gerais/Características da Empresa" foi implementada com sucesso:

### API 1: Criar Processo
- **Endpoint**: `POST http://localhost:8000/api/v1/processos/`
- **Status**: ✓ JÁ ESTAVA FUNCIONANDO
- **Quando é chamada**: Automaticamente ao abrir o formulário de licenciamento
- **Onde ver**: Console do navegador mostra: "✅ Processo criado na API: [id]"

### API 2: Salvar Dados Gerais
- **Endpoint**: `PUT http://localhost:8000/api/v1/processos/{processo_id}/dados-gerais`
- **Status**: ✓ AGORA FUNCIONA COMPLETAMENTE
- **Quando é chamada**: Ao clicar em "Salvar Rascunho" ou "Avançar" na primeira aba
- **Campos enviados**:
  - `porte` (ex: "Médio", "Grande")
  - `potencial_poluidor` (ex: "Alto", "Baixo")
  - `cnae_codigo` (ex: "1011-2/01")
  - `cnae_descricao` (ex: "Frigorífico - abate de bovinos")
  - `numero_empregados` (número inteiro)
  - `possui_licenca_anterior` (true/false)
  - `licenca_tipo` (ex: "LP", "LI", "LO")
  - `licenca_numero` (ex: "123456/2023")
  - `licenca_ano` (ex: 2023)
  - `licenca_validade` (data no formato YYYY-MM-DD)

---

## 🧪 Como Testar

### Passo 1: Verificar que o Backend Está Rodando

```bash
# Certifique-se de que seu FastAPI está rodando em http://localhost:8000
# Abra o Swagger: http://localhost:8000/docs
```

### Passo 2: Abrir o Formulário de Licenciamento

1. Execute `npm run dev` no frontend
2. Navegue até o formulário de licenciamento
3. Abra o DevTools (F12) e vá na aba **Console**

### Passo 3: Preencher o Formulário

Preencha os campos obrigatórios na primeira aba:

1. **Código CNAE** - Digite e selecione um CNAE da lista
2. **Número de Empregados** - Digite um número (ex: 50)
3. **Possui Licença Anterior?** - Selecione "Sim" ou "Não"
4. Se selecionou "Sim", preencha:
   - Tipo de Licença
   - Número da Licença
   - Ano de Emissão
   - Data de Validade

### Passo 4: Verificar os Logs no Console

Ao clicar em **"Salvar Rascunho"** ou **"Avançar"**, você deve ver no console:

```
🚀 Iniciando salvamento dos dados gerais...
📝 Processo ID: [uuid ou local-xxx]
📊 Dados do formulário: { ... }
✓ Validação de dados passou com sucesso
📤 Payload a ser enviado para API: { ... }
⏰ Timestamp: 2025-...
✅ Dados salvos com sucesso na API!
📨 Response da API: { protocolo_interno: "2025/000001", ... }
```

### Passo 5: Verificar a Notificação Toast

Uma notificação verde deve aparecer no canto da tela:

- **Se tiver protocolo**: "✓ Dados salvos! Protocolo: 2025/000001"
- **Se não tiver protocolo**: "✓ Dados salvos com sucesso!"

### Passo 6: Verificar no Swagger

1. Abra http://localhost:8000/docs
2. Expanda o endpoint `GET /api/v1/processos/{processo_id}/dados-gerais`
3. Cole o `processo_id` que apareceu no console
4. Execute
5. Verifique que os dados foram salvos corretamente

---

## 🔍 Verificar Chamadas de Rede

No DevTools, vá na aba **Network** (Rede):

1. Filtre por "XHR" ou "Fetch"
2. Você deve ver duas chamadas:
   - `POST /api/v1/processos/` (status 200 ou 201)
   - `PUT /api/v1/processos/{id}/dados-gerais` (status 200)

### Inspecionar Request (Envio)

Clique na chamada PUT e vá na aba **Payload**:

```json
{
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

### Inspecionar Response (Resposta)

Vá na aba **Response**:

```json
{
  "id": "uuid",
  "processo_id": "uuid",
  "protocolo_interno": "2025/000001",
  "numero_processo_externo": null,
  "porte": "Médio",
  "potencial_poluidor": "Alto",
  ...
}
```

---

## ⚠️ Validações Implementadas

Se você não preencher os campos obrigatórios, verá uma mensagem de erro:

- ❌ **"Código CNAE é obrigatório"**
- ❌ **"Número de empregados é obrigatório e deve ser maior ou igual a zero"**
- ❌ **"É obrigatório informar se possui licença anterior"**
- ❌ **"Tipo de licença anterior é obrigatório"** (se selecionou "Sim")
- ❌ **"Número da licença anterior é obrigatório"** (se selecionou "Sim")
- ❌ **"Ano de emissão da licença é obrigatório"** (se selecionou "Sim")
- ❌ **"Ano de emissão deve estar entre 1900 e 2025"** (validação de ano)
- ❌ **"Data de validade da licença é obrigatória"** (se selecionou "Sim")

---

## 🐛 Troubleshooting

### Problema: API não está sendo chamada

**Solução:**
1. Verifique se o backend está rodando em `http://localhost:8000`
2. Verifique o arquivo `.env` e confirme que `VITE_API_BASE_URL=http://localhost:8000`
3. Reinicie o frontend (`npm run dev`)

### Problema: Erro 404 ou Network Error

**Comportamento esperado:**
- O sistema entra em "modo offline"
- Os dados são salvos no `localStorage` do navegador
- Você verá no console: "🔸 API indisponível, alternando para modo local"

### Problema: Dados não aparecem no backend

**Possíveis causas:**
1. Backend não está salvando no banco de dados
2. Verifique os logs do FastAPI
3. Verifique se o endpoint `/dados-gerais` está implementado corretamente no backend

### Problema: Erro de validação mesmo com dados preenchidos

**Solução:**
- Abra o console e veja qual campo específico está faltando
- Certifique-se de que os campos obrigatórios foram preenchidos
- Verifique se o ano da licença está entre 1900 e o ano atual

---

## 📋 Checklist Final

- [ ] Backend FastAPI está rodando em `http://localhost:8000`
- [ ] Frontend está rodando (`npm run dev`)
- [ ] DevTools (F12) está aberto na aba Console
- [ ] Formulário de licenciamento está acessível
- [ ] Todos os campos obrigatórios foram preenchidos
- [ ] Ao clicar em "Salvar" ou "Avançar", vejo logs no console
- [ ] Notificação toast verde aparece com mensagem de sucesso
- [ ] Na aba Network, vejo a chamada PUT com status 200
- [ ] No Swagger, consigo buscar o processo e ver os dados salvos

---

## ✨ O Que Mudou

### Antes
- ❌ Apenas 2 campos eram enviados: `porte` e `potencial_poluidor`
- ❌ Sem validação de dados
- ❌ Sem logs de debug
- ❌ Mensagens de erro genéricas

### Agora
- ✅ Todos os 10 campos são enviados corretamente
- ✅ Validação completa antes do envio
- ✅ Logs detalhados em todas as etapas
- ✅ Mensagens de erro específicas para cada campo
- ✅ Exibição do protocolo gerado pela API
- ✅ Suporte a modo offline (fallback)

---

## 🎯 Próximos Passos

Se tudo estiver funcionando:

1. ✅ A API 1 (criar processo) está sendo chamada automaticamente
2. ✅ A API 2 (salvar dados gerais) está sendo chamada ao salvar
3. ✅ Todos os campos estão sendo enviados corretamente
4. ✅ Validações estão funcionando
5. ✅ Feedback visual está adequado

**Você pode agora:**
- Implementar as próximas abas do formulário
- Adicionar mais campos se necessário
- Testar com diferentes cenários de dados
- Integrar com o banco de dados definitivo
