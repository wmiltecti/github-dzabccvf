# Solução: Integração Unidades de Referência → Unidade de Medida (Atividades)

## 📋 Problema Relatado
O cadastro de **Unidades de Referência** deveria alimentar o select de **Unidade de Medida** no cadastro de Atividades, mas isso não estava acontecendo.

## 🔍 Causa Raiz
O formulário de Atividades (`ActivityForm.tsx`) estava usando um **array fixo** de unidades de medida:

```typescript
const measurementUnits = [
  'Unidade',
  'Hectare (ha)',
  'Metro quadrado (m²)',
  // ... etc
];
```

Este array não tinha relação com a tabela `reference_units` do banco de dados.

## ✅ Solução Implementada

### 1. Backend API ✅ IMPLEMENTADO
Endpoint: `GET /api/v1/referencias/unidades-medida?is_active=true`

Retorna:
```json
[
  {
    "id": "uuid",
    "code": "m²",
    "name": "Metro Quadrado",
    "description": "Unidade de medida de área",
    "is_active": true,
    "created_at": "...",
    "updated_at": "..."
  },
  // ...
]
```

### 2. Frontend - Serviço (`activityLicenseService.ts`)

#### Interface criada:
```typescript
export interface ReferenceUnit {
  id: string;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

#### Função criada:
```typescript
export async function getReferenceUnits(): Promise<ReferenceUnit[]> {
  const response = await fetch(`${API_BASE_URL}/referencias/unidades-medida?is_active=true`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}
```

### 3. Frontend - Componente (`ActivityForm.tsx`)

#### Estado adicionado:
```typescript
const [referenceUnits, setReferenceUnits] = useState<ReferenceUnit[]>([]);
```

#### Carregamento via API:
```typescript
const loadDropdownData = async () => {
  const [licenseTypesData, pollutionPotentialsData, documentsData, referenceUnitsData] = 
    await Promise.all([
      activityLicenseService.getLicenseTypes(),
      activityLicenseService.getPollutionPotentials(),
      activityLicenseService.getDocumentTemplates(),
      activityLicenseService.getReferenceUnits(), // ✅ NOVO
    ]);
  
  setReferenceUnits(referenceUnitsData || []);
};
```

#### Select atualizado:
```tsx
<select
  value={formData.measurement_unit}
  onChange={(e) => handleInputChange('measurement_unit', e.target.value)}
  className="w-full p-3 border border-gray-300 rounded-lg"
>
  <option value="">Selecione a unidade...</option>
  {referenceUnits.map(unit => (
    <option key={unit.id} value={unit.code}>
      {unit.code} - {unit.name}
    </option>
  ))}
</select>
{referenceUnits.length === 0 && (
  <p className="mt-1 text-xs text-gray-500">
    ℹ️ Cadastre Unidades de Referência para preencher este campo
  </p>
)}
```

## 🎯 Resultado

### Antes:
- Select com valores fixos (hard-coded)
- Sem relação com tabela `reference_units`
- Impossível adicionar novas unidades sem alterar código

### Depois:
- ✅ Select alimentado dinamicamente via API
- ✅ Usa dados da tabela `reference_units`
- ✅ Formato: `código - nome` (ex: "m² - Metro Quadrado")
- ✅ Mensagem informativa quando não há unidades cadastradas
- ✅ Novas unidades aparecem automaticamente após cadastro

## 📊 Fluxo de Dados

```
┌─────────────────────┐
│  Tabela PostgreSQL  │
│  reference_units    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Backend FastAPI   │
│ GET /reference-units│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  activityLicense    │
│  Service.ts         │
│  getReferenceUnits()│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   ActivityForm.tsx  │
│  Select Unidade de  │
│      Medida         │
└─────────────────────┘
```

## 🧪 Teste

Arquivo: `tests/test_reference_units_integration.py`

Valida:
1. Login no sistema
2. Acesso à página de Administração
3. Abertura do formulário de Atividades
4. Verificação do select de Unidade de Medida
5. Contagem de opções carregadas
6. Formato correto dos dados (código - nome)

## 📝 Notas Importantes

1. **✅ Backend implementado** - Endpoint: `GET /api/v1/referencias/unidades-medida?is_active=true`
2. **Formato esperado** no banco:
   - `code`: Código da unidade (ex: "m²", "ha", "kg")
   - `name`: Nome descritivo (ex: "Metro Quadrado")
   - `is_active`: Apenas unidades ativas são retornadas

3. **Valor salvo no banco** é o `code` (não o `id`)
4. **Display no select**: `{code} - {name}`

## ✅ Status da Implementação

1. ✅ **Backend implementado** - Endpoint `GET /api/v1/referencias/unidades-medida?is_active=true`
2. ✅ **Frontend atualizado** - Usando endpoint correto da API
3. 🧪 **Testar com dados reais** do banco
4. 🧪 **Validar** que novas unidades aparecem automaticamente
5. 🧪 **Confirmar** que atividades existentes mantêm suas unidades

## 📅 Data da Implementação
21/11/2025

## 👤 Branch
`newtasks`

## 📌 Commit
`feat: integra Unidades de Referência via API no cadastro de Atividades`
