# 📋 Resumo das Alterações - Integração API Aba 2

**Data:** 30 de Outubro de 2025  
**Objetivo:** Integrar chamada da API ao avançar da Aba 2 (Uso de Recursos e Energia)

---

## 🎯 Contexto

A Aba 2 "Uso de Recursos e Energia" já estava implementada visualmente e funcionando. O objetivo desta tarefa foi **adicionar a integração com a API** para salvar os dados quando o usuário clicar no botão "Avançar".

---

## 📁 Arquivos Modificados

### 1. `src/components/FormWizard.tsx`

**Caminho completo:** `d:\code\python\project-bolt-github-hbng9kf8_20251030\project\src\components\FormWizard.tsx`

#### Alterações realizadas:

#### ✅ **1.1 - Adicionado novo estado para controle de loading**

**Localização:** Linha ~88 (na seção de estados do componente)

```typescript
const [isSavingStep2, setIsSavingStep2] = useState(false);
```

**Finalidade:** Controlar o estado de loading durante o salvamento dos dados da Aba 2.

---

#### ✅ **1.2 - Criada função `saveStep2ToAPI()`**

**Localização:** Após a função `saveStepToAPI()` (aproximadamente linha ~290)

**Código adicionado:**

```typescript
// Salvar dados da Aba 2 - Uso de Recursos e Energia
const saveStep2ToAPI = async () => {
  if (currentStep !== 2 || !processoId) return;

  setIsSavingStep2(true);
  try {
    const d = formData.step2 || {};

    // Converter combustíveis do formato do formulário para o formato da API
    const combustiveisEnergia = (d.combustiveis || []).map((c: any) => ({
      tipo_fonte: c.tipoFonte || "",
      equipamento: c.equipamento || "",
      quantidade: c.quantidade ? parseFloat(c.quantidade) : 0,
      unidade: c.unidade || "m³"
    }));

    const payload = {
      processo_id: processoId,
      usa_lenha: d.usaLenha === 'sim',
      quantidade_lenha_m3: d.lenhaQuantidade ? parseFloat(d.lenhaQuantidade) : null,
      num_ceprof: d.lenhaCeprof || null,
      possui_caldeira: d.possuiCaldeira === 'sim',
      altura_chamine_metros: d.caldeiraAlturaChamine ? parseFloat(d.caldeiraAlturaChamine) : null,
      possui_fornos: d.possuiFornos === 'sim',
      sistema_captacao: d.fornosSistemaCaptacao || null,
      combustiveis_energia: combustiveisEnergia
    };

    console.log("🔎 Payload da Aba 2 - Uso de Recursos e Energia:", payload);

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/v1/uso-recursos-energia`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const erro = await response.json();
      throw new Error(erro.detail || 'Erro ao salvar dados da Aba 2');
    }

    const resultado = await response.json();
    console.log('✅ Aba 2 salva com sucesso:', resultado);
    
    toast.success("Dados de Recursos e Energia salvos com sucesso!");
  } catch (error: any) {
    console.error("❌ Erro ao salvar Aba 2:", error);
    toast.error(error?.message || "Erro ao salvar dados da Aba 2. Verifique os campos e tente novamente.");
    throw error;
  } finally {
    setIsSavingStep2(false);
  }
};
```

**Finalidade:** 
- Coleta os dados do formulário da Aba 2 (`formData.step2`)
- Converte os campos para o formato esperado pela API
- Envia POST para `/api/v1/uso-recursos-energia`
- Exibe mensagens de sucesso ou erro
- Lança exceção em caso de falha para impedir avanço

**Mapeamento de Campos (Formulário → API):**

| Campo do Formulário | Campo da API | Tipo | Conversão |
|---------------------|--------------|------|-----------|
| `usaLenha` | `usa_lenha` | boolean | "sim" → true, outros → false |
| `lenhaQuantidade` | `quantidade_lenha_m3` | number/null | parseFloat() ou null |
| `lenhaCeprof` | `num_ceprof` | string/null | string ou null |
| `possuiCaldeira` | `possui_caldeira` | boolean | "sim" → true, outros → false |
| `caldeiraAlturaChamine` | `altura_chamine_metros` | number/null | parseFloat() ou null |
| `possuiFornos` | `possui_fornos` | boolean | "sim" → true, outros → false |
| `fornosSistemaCaptacao` | `sistema_captacao` | string/null | string ou null |
| `combustiveis[]` | `combustiveis_energia[]` | array | Conversão de objetos |

**Estrutura de Combustíveis:**
```typescript
// Formato do Formulário:
{
  id: string,
  tipoFonte: string,
  equipamento: string,
  quantidade: string,
  unidade: string
}

// Formato da API:
{
  tipo_fonte: string,
  equipamento: string,
  quantidade: number,
  unidade: string
}
```

---

#### ✅ **1.3 - Modificada função `handleNext()`**

**Localização:** Aproximadamente linha ~210

**Código modificado:**

```typescript
const handleNext = async () => {
  if (currentStep === 1 && processoId) {
    try {
      await saveStepToAPI();
      nextStep();
    } catch (error) {
      console.error('Erro ao salvar etapa 1:', error);
    }
  } else if (currentStep === 2 && processoId) {  // ← NOVO
    try {
      await saveStep2ToAPI();                      // ← NOVO
      nextStep();                                   // ← NOVO
    } catch (error) {                              // ← NOVO
      console.error('Erro ao salvar etapa 2:', error); // ← NOVO
    }                                              // ← NOVO
  } else {
    nextStep();
  }
};
```

**Finalidade:** 
- Detecta quando está na Aba 2
- Chama `saveStep2ToAPI()` antes de avançar
- Só avança para a próxima aba se a API retornar sucesso
- Em caso de erro, permanece na Aba 2

---

#### ✅ **1.4 - Modificada função `handleSaveDraft()`**

**Localização:** Aproximadamente linha ~358

**Código adicionado:**

```typescript
if (currentStep === 2 && processoId) {  // ← NOVO
  try {
    await saveStep2ToAPI();              // ← NOVO
  } catch (error) {
    setIsSaving(false);
    setSaveMessage('Erro ao salvar rascunho');
    setTimeout(() => setSaveMessage(''), 3000);
    return;
  }
}
```

**Finalidade:** 
- Permite salvar rascunho da Aba 2 através do botão "Salvar Rascunho"
- Mantém consistência com o comportamento da Aba 1

---

#### ✅ **1.5 - Atualizado botão "Salvar Rascunho"**

**Localização:** Aproximadamente linha ~620

**Modificações:**

```typescript
// ANTES:
disabled={isSaving || isInitializing || isSavingToAPI}
{isSaving || isSavingToAPI ? ... }

// DEPOIS:
disabled={isSaving || isInitializing || isSavingToAPI || isSavingStep2}  // ← ADICIONADO isSavingStep2
{isSaving || isSavingToAPI || isSavingStep2 ? ... }                      // ← ADICIONADO isSavingStep2
```

**Finalidade:** 
- Desabilita o botão durante salvamento da Aba 2
- Mostra estado de loading apropriado

---

#### ✅ **1.6 - Atualizado botão "Avançar"**

**Localização:** Aproximadamente linha ~738

**Modificações:**

```typescript
// ANTES:
disabled={currentStep === steps.length || isInitializing || isSavingToAPI}
{isSavingToAPI ? (

// DEPOIS:
disabled={currentStep === steps.length || isInitializing || isSavingToAPI || isSavingStep2}  // ← ADICIONADO isSavingStep2
{isSavingToAPI || isSavingStep2 ? (                                                           // ← ADICIONADO isSavingStep2
```

**Finalidade:** 
- Desabilita o botão "Avançar" durante salvamento da Aba 2
- Mostra "Salvando..." enquanto processa

---

## 🔄 Fluxo de Funcionamento

### **Antes das Alterações:**
```
Usuário na Aba 2 → Clica "Avançar" → Vai direto para Aba 3
```

### **Depois das Alterações:**
```
Usuário na Aba 2 → Clica "Avançar" 
    ↓
Botão mostra "Salvando..."
    ↓
Chama saveStep2ToAPI()
    ↓
POST para /api/v1/uso-recursos-energia
    ↓
┌─────────────────┬──────────────────────┐
│ Sucesso (200)   │ Erro (4xx/5xx)      │
├─────────────────┼──────────────────────┤
│ Toast verde     │ Toast vermelho       │
│ Avança Aba 3    │ Permanece na Aba 2   │
└─────────────────┴──────────────────────┘
```

---

## 🛡️ Validações e Segurança

✅ **Validação de processo:** Só executa se `processoId` existir  
✅ **Validação de aba:** Só executa se `currentStep === 2`  
✅ **Conversão de tipos:** Campos numéricos convertidos com `parseFloat()`  
✅ **Valores nulos:** Campos opcionais enviados como `null` se vazios  
✅ **Tratamento de erros:** Try/catch com mensagens amigáveis  
✅ **Prevenção de navegação:** Não avança se API falhar  
✅ **Loading states:** Botões desabilitados durante processamento  

---

## 📊 Endpoint da API

**URL:** `${VITE_API_BASE_URL}/api/v1/uso-recursos-energia`  
**Método:** `POST`  
**Content-Type:** `application/json`

**Payload Exemplo:**
```json
{
  "processo_id": "uuid-do-processo",
  "usa_lenha": true,
  "quantidade_lenha_m3": 250.00,
  "num_ceprof": "CEPROF-12345",
  "possui_caldeira": true,
  "altura_chamine_metros": 15.00,
  "possui_fornos": true,
  "sistema_captacao": "Sistema de filtros ciclônicos",
  "combustiveis_energia": [
    {
      "tipo_fonte": "Lenha",
      "equipamento": "Caldeira 1",
      "quantidade": 100.00,
      "unidade": "m³"
    }
  ]
}
```

---

## ✅ Checklist de Implementação

- [x] Estado de loading (`isSavingStep2`) adicionado
- [x] Função `saveStep2ToAPI()` criada e implementada
- [x] Função `handleNext()` modificada para Aba 2
- [x] Função `handleSaveDraft()` modificada para Aba 2
- [x] Botão "Avançar" atualizado com loading
- [x] Botão "Salvar Rascunho" atualizado com loading
- [x] Conversão de tipos implementada
- [x] Tratamento de erros implementado
- [x] Mensagens toast configuradas
- [x] Nenhuma outra aba foi modificada
- [x] Visual do formulário preservado
- [x] Código sem erros de compilação

---

## 🧪 Teste Recomendado

1. **Preencher Aba 2** com dados completos
2. **Clicar em "Avançar"**
   - Verificar se botão mostra "Salvando..."
   - Verificar console para payload enviado
   - Verificar se toast de sucesso aparece
   - Verificar se avança para Aba 3
3. **Testar com dados incompletos**
   - Verificar se API retorna erro apropriado
   - Verificar se permanece na Aba 2
4. **Testar botão "Salvar Rascunho"**
   - Verificar se salva sem avançar de aba

---

## 📝 Observações

- ✅ Nenhum componente visual foi alterado
- ✅ Nenhuma validação de formulário foi modificada
- ✅ Apenas a integração com API foi adicionada
- ✅ Padrão consistente com a Aba 1
- ✅ Código totalmente compatível com estrutura existente

---

**Desenvolvido em:** 30 de Outubro de 2025  
**Status:** ✅ Implementação Concluída
