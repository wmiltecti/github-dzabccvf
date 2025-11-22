# 🔧 FIX FRONTEND: Formato Correto dos Endpoints Bulk

**Data:** 21/11/2025 22:15  
**Issue:** Frontend enviando array direto ao invés de objeto wrapper

---

## ❌ PROBLEMA IDENTIFICADO

### Frontend está enviando (ERRADO):
```javascript
// ❌ Array direto
const payload = [
  {
    "license_type_id": "uuid-here",
    "is_required": true
  }
];

fetch(`/api/v1/activities/${id}/license-types/bulk`, {
  method: 'POST',
  body: JSON.stringify(payload)  // ❌ ERRADO!
});
```

### Backend espera (CORRETO):
```javascript
// ✅ Objeto wrapper com propriedade "license_types"
const payload = {
  "license_types": [
    {
      "license_type_id": "uuid-here",
      "is_required": true
    }
  ]
};

fetch(`/api/v1/activities/${id}/license-types/bulk`, {
  method: 'POST',
  body: JSON.stringify(payload)  // ✅ CORRETO!
});
```

---

## ✅ CORREÇÃO PARA O FRONTEND

### 1. Endpoint: `/activities/{id}/license-types/bulk`

**Formato CORRETO:**
```json
{
  "license_types": [
    {
      "license_type_id": "uuid-do-tipo-de-licenca",
      "is_required": true
    },
    {
      "license_type_id": "outro-uuid",
      "is_required": false
    }
  ]
}
```

**Código JavaScript/TypeScript:**
```typescript
// ✅ CORRETO
const saveLicenseTypes = async (activityId: string, licenseTypes: any[]) => {
  const payload = {
    license_types: licenseTypes  // ✅ Wrapper obrigatório
  };
  
  const response = await fetch(
    `/api/v1/activities/${activityId}/license-types/bulk`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  );
  
  return response.json();
};
```

---

### 2. Endpoint: `/activities/{id}/documents/bulk`

**Formato CORRETO:**
```json
{
  "documents": [
    {
      "template_id": "uuid-do-template",
      "is_required": true
    },
    {
      "template_id": "outro-uuid",
      "is_required": false
    }
  ]
}
```

**Código JavaScript/TypeScript:**
```typescript
// ✅ CORRETO
const saveDocuments = async (activityId: string, documents: any[]) => {
  const payload = {
    documents: documents  // ✅ Wrapper obrigatório
  };
  
  const response = await fetch(
    `/api/v1/activities/${activityId}/documents/bulk`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  );
  
  return response.json();
};
```

---

### 3. Endpoint: `/activities/{id}/study-types/bulk` (se existir)

**Formato CORRETO:**
```json
{
  "study_types": [
    {
      "study_type_id": "uuid-do-tipo-de-estudo",
      "is_required": true
    }
  ]
}
```

---

## 📋 CHECKLIST DE CORREÇÃO

### Arquivos do Frontend a Verificar:

- [ ] **Componente de cadastro de atividades**
  - Arquivo: `src/components/Activities/ActivityForm.tsx` (ou similar)
  - Buscar por: `license-types/bulk`
  - Corrigir: Adicionar wrapper `{ license_types: [...] }`

- [ ] **Serviço/API de atividades**
  - Arquivo: `src/services/activitiesService.ts` (ou similar)
  - Buscar por: `documents/bulk`
  - Corrigir: Adicionar wrapper `{ documents: [...] }`

- [ ] **Função de submit do formulário**
  - Verificar onde os dados são enviados
  - Garantir que está usando o formato correto

---

## 🧪 TESTE RÁPIDO

### Teste no Console do Navegador (DevTools):

```javascript
// 1. Abrir DevTools (F12)
// 2. Ir para a aba Console
// 3. Colar e executar:

const activityId = "COLE-UM-ID-REAL-AQUI";
const templateId = "8cda4962-9e6f-4a20-b6fa-39adf2213582";

// Testar documents/bulk
fetch(`/api/v1/activities/${activityId}/documents/bulk`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    documents: [{ template_id: templateId, is_required: true }]
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);

// Se retornar 201 ou 409 = ✅ Funcionou!
// Se retornar 422 = ❌ Ainda está enviando formato errado
```

---

## 📊 COMPARAÇÃO: Antes vs Depois

### ❌ ANTES (Causava erro 422)

```javascript
// Erro no código do frontend
const licenseTypes = [
  { license_type_id: "uuid1", is_required: true },
  { license_type_id: "uuid2", is_required: false }
];

// ❌ Enviando array direto
fetch('/api/v1/activities/123/license-types/bulk', {
  method: 'POST',
  body: JSON.stringify(licenseTypes)  // ERRADO!
});
```

**Resultado:** 422 - "Input should be a valid dictionary or object"

---

### ✅ DEPOIS (Funciona corretamente)

```javascript
// Código corrigido
const licenseTypes = [
  { license_type_id: "uuid1", is_required: true },
  { license_type_id: "uuid2", is_required: false }
];

// ✅ Enviando com wrapper
fetch('/api/v1/activities/123/license-types/bulk', {
  method: 'POST',
  body: JSON.stringify({
    license_types: licenseTypes  // CORRETO!
  })
});
```

**Resultado:** 201 Created - Dados salvos com sucesso!

---

## 🎯 RESUMO PARA O DEV FRONTEND

**3 mudanças necessárias:**

1. **License Types Bulk:**
   ```diff
   - body: JSON.stringify(licenseTypes)
   + body: JSON.stringify({ license_types: licenseTypes })
   ```

2. **Documents Bulk:**
   ```diff
   - body: JSON.stringify(documents)
   + body: JSON.stringify({ documents: documents })
   ```

3. **Study Types Bulk (se houver):**
   ```diff
   - body: JSON.stringify(studyTypes)
   + body: JSON.stringify({ study_types: studyTypes })
   ```

---

## 📝 NOTA IMPORTANTE

O backend **NÃO precisa** do campo `activity_id` no body porque ele já vem na URL:

```javascript
// ✅ activity_id vem da URL (path parameter)
POST /api/v1/activities/{activity_id}/documents/bulk

// ✅ Body só precisa da lista
{
  "documents": [...]  // Sem activity_id aqui!
}
```

---

## 🚀 VALIDAÇÃO FINAL

Após a correção, testar o cadastro completo de atividade:

1. ✅ Preencher todos os campos
2. ✅ Adicionar 1+ tipos de licença
3. ✅ Adicionar 1+ documentos
4. ✅ Adicionar 1+ tipos de estudo
5. ✅ Clicar em "Salvar"
6. ✅ Verificar que NÃO aparece erro 422
7. ✅ Verificar que os dados aparecem na lista

**Status esperado:** 201 Created em todos os endpoints bulk

---

**Documentação Backend:** `docs/API_FRONTEND_GUIDE.md`  
**Schemas:** `app/schemas/activity_license_types_schemas.py`  
**Commits:** e7a01a2, 22d1bd7
