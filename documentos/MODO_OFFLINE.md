# Modo Offline - Fallback Automático

## Problema Original

Ao abrir o formulário, ocorria erro **404** porque a API FastAPI em `https://fastapi-sandbox-ee3p.onrender.com` não possui os endpoints `/processos` implementados ainda.

## Solução Implementada

O sistema agora funciona em **modo híbrido** com fallback automático:

### ✅ Quando a API está disponível
- Cria processo via `POST /processos`
- Salva dados via `PUT /processos/{id}/dados-gerais`
- Busca status via `GET /processos/{id}/wizard-status`
- Submete via `POST /processos/{id}/submit`

### 🔸 Quando a API está indisponível (404, Network Error)
- Cria processo com ID local: `local-{timestamp}-{random}`
- Salva dados no **localStorage** do navegador
- Retorna status a partir dos dados locais
- Gera protocolo local: `LOCAL-{timestamp}`

## Momentos de Consumo da API

### 1️⃣ **Ao abrir o formulário** (useEffect na montagem)

**Arquivo:** `FormWizard.tsx` / `FormWizardLicenciamento.tsx`

```typescript
useEffect(() => {
  const initializeProcesso = async () => {
    if (!processoId) {
      const userId = getUserId();
      const newProcessoId = await criarProcesso(userId);  // 👈 CHAMADA AQUI
      setProcessoId(newProcessoId);
    }
  };

  initializeProcesso();
}, [processoId]);
```

**Endpoint:** `POST /processos`

**Payload:**
```json
{
  "user_id": "123",
  "status": "draft"
}
```

**Comportamento:**
- ✅ Se sucesso: salva o ID retornado pela API
- 🔸 Se erro 404: cria ID local e avisa "Modo offline: dados serão salvos localmente"

---

### 2️⃣ **Ao avançar ou salvar a Etapa 1** (Características)

**Arquivo:** `FormWizard.tsx` / `FormWizardLicenciamento.tsx`

```typescript
const saveStepToAPI = async () => {
  const payload = {
    porte: step1Data.porte,                    // Ex: "Médio"
    potencial_poluidor: step1Data.potencialPoluidor  // Ex: "Alto"
  };

  await upsertDadosGerais(processoId, payload);  // 👈 CHAMADA AQUI
};
```

**Endpoint:** `PUT /processos/{id}/dados-gerais`

**Payload:**
```json
{
  "processo_id": "abc123",
  "porte": "Médio",
  "potencial_poluidor": "Alto"
}
```

**Comportamento:**
- ✅ Se sucesso: exibe "Dados gerais salvos com sucesso!"
- 🔸 Se erro 404: salva no localStorage e permite continuar

---

### 3️⃣ **Na tela de revisão** (ao carregar)

**Arquivo:** `StepRevisao.tsx`

```typescript
useEffect(() => {
  const status = await getWizardStatus(processoId);  // 👈 CHAMADA AQUI
  setWizardStatus(status);
}, [processoId]);
```

**Endpoint:** `GET /processos/{id}/wizard-status`

**Resposta esperada:**
```json
{
  "processo_id": "abc123",
  "v_dados_gerais": true,
  "n_localizacoes": 2,
  "n_atividades": 0,
  "v_resp_tecnico": false
}
```

**Comportamento:**
- ✅ Se sucesso: exibe indicadores de validação da API
- 🔸 Se erro 404: calcula status a partir do localStorage

---

### 4️⃣ **Ao finalizar** (botão "Salvar e Finalizar")

**Arquivo:** `StepRevisao.tsx`

```typescript
const handleFinish = async () => {
  const response = await submitProcesso(processoId);  // 👈 CHAMADA AQUI
  setProtocolo(response.protocolo);
};
```

**Endpoint:** `POST /processos/{id}/submit`

**Resposta esperada:**
```json
{
  "processo_id": "abc123",
  "protocolo": "2025-001234",
  "status": "submitted",
  "data_submissao": "2025-10-28T12:34:56Z"
}
```

**Comportamento:**
- ✅ Se sucesso: exibe protocolo retornado pela API
- 🔸 Se erro 404: gera protocolo local `LOCAL-{timestamp}`

---

## Como Identificar o Modo

### Console do Navegador:

**Modo Online (API disponível):**
```
✅ Processo criado: abc123-def456-ghi789
```

**Modo Offline (fallback):**
```
🔸 API indisponível, alternando para modo local
🔸 Processo criado em modo local: local-1730101234567-x8k9j2
```

### Toast na Tela:

**Modo Offline:**
- 🔵 "Modo offline: dados serão salvos localmente" (azul info)

**Salvamento Local:**
- 🔵 "Dados gerais salvos com sucesso!" (verde, mas dados só no navegador)

---

## Dados Salvos no localStorage

Quando em modo offline, os dados são salvos com as seguintes chaves:

```javascript
// ID do processo
localStorage.getItem('form-wizard-storage')
// JSON: { processoId: "local-...", formData: {...} }

// Dados gerais da Etapa 1
localStorage.getItem('processo_local-123_dados_gerais')
// JSON: { porte: "Médio", potencial_poluidor: "Alto" }

// Localizações (se implementado)
localStorage.getItem('processo_local-123_localizacoes')
// JSON: [{ endereco: "...", cep: "..." }]
```

---

## Reativando o Modo API

Se a API voltar a funcionar, o sistema **NÃO alterna automaticamente** de volta. Para forçar o modo API:

1. Limpe o localStorage:
```javascript
localStorage.clear()
```

2. Recarregue a página

3. O sistema tentará criar um novo processo na API

---

## Estrutura de Fallback

**Arquivo:** `/src/services/processosService.ts`

```typescript
let apiAvailable = true;  // Flag global de disponibilidade

export async function criarProcesso(userId?: string): Promise<string> {
  if (!apiAvailable) {
    return generateLocalProcessoId();  // Gera ID local
  }

  try {
    const response = await processosAPI.criarProcesso(userId);
    return response.id;
  } catch (error: any) {
    if (error.message.includes('404')) {
      apiAvailable = false;  // Marca como indisponível
      return generateLocalProcessoId();
    }
    throw error;
  }
}
```

---

## Endpoints Necessários na API

Para o modo online funcionar completamente, a API FastAPI precisa implementar:

1. ✅ `POST /processos` - Criar processo
2. ✅ `PUT /processos/{id}/dados-gerais` - Salvar dados gerais
3. ⚠️ `POST /processos/{id}/localizacoes` - Adicionar localização (futuro)
4. ✅ `GET /processos/{id}/wizard-status` - Status de validação
5. ✅ `POST /processos/{id}/submit` - Submeter processo

**Nota:** O sistema funciona perfeitamente sem nenhum endpoint, salvando tudo localmente!
