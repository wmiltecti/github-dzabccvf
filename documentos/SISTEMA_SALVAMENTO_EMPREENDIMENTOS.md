# Sistema de Salvamento de Empreendimentos

## 📋 Visão Geral

Sistema que compõe um JSON completo durante o cadastro de empreendimento e salva no mockup, pronto para ser enviado à API do backend.

## 🔄 Fluxo de Funcionamento

### 1. Preenchimento do Wizard

O usuário preenche as 5 abas do wizard:
- **Aba 1**: Dados do Imóvel (property)
- **Aba 2**: Dados Básicos do Empreendimento (basic_info)
- **Aba 3**: Partícipes (participants)
- **Aba 4**: Atividades (activities)
- **Aba 5**: Caracterização (characterization)

### 2. Auto-Salvamento (Novo!)

**Sistema automático que salva em tempo real:**

- ✨ **Salva automaticamente** sempre que houver mudanças em qualquer aba
- ⏱️ **Debounce de 2 segundos** - aguarda 2s sem mudanças antes de salvar
- 💾 **Rascunho automático** - salva como "rascunho" automaticamente
- 🔄 **Atualiza JSON existente** - se já existe, atualiza. Se não, cria novo
- 📝 **Sem mensagens visuais** - salva silenciosamente (logs no console)

**Funcionamento:**
1. Usuário altera dados em qualquer aba (Imóvel, Dados Gerais, Partícipes, Atividades, Caracterização)
2. Sistema detecta mudança
3. Aguarda 2 segundos sem novas mudanças
4. Monta JSON completo
5. Salva/atualiza no mockup automaticamente
6. Aparece na lista de empreendimentos

### 3. Salvamento Manual

Na aba de **Caracterização** (última aba), o usuário tem 2 opções:

#### Opção 1: Salvar Rascunho
- Botão: "Salvar Rascunho" (cinza)
- Salva o empreendimento com status "rascunho"
- Não fecha o wizard
- Permite continuar editando
- Mostra toast de confirmação

#### Opção 2: Finalizar
- Botão: "Finalizar" (verde)
- Salva o empreendimento com status "ativo"
- Fecha o wizard
- Empreendimento aparece na lista
- Mostra toast de confirmação

### 4. Modo Criação vs Edição

**Criação (ID temporário: `emp_123456789`)**
- Sistema gera ID temporário ao iniciar wizard
- Auto-save cria novo registro no mockup
- Ao finalizar, mantém o mesmo registro (substitui o temporário)

**Edição (ID real: `123456789`)**
- Carrega dados existentes
- Auto-save atualiza o registro existente
- Remove o antigo e adiciona o atualizado na lista
- Mantém o mesmo ID

### 5. Armazenamento

O sistema salva em **2 lugares**:

1. **Memória (array em mockupService.ts)**
   ```typescript
   let mockEnterprisesList: any[] = [];
   ```

2. **LocalStorage (persistência entre reloads)**
   ```typescript
   localStorage.setItem('mockup_enterprises', JSON.stringify(list));
   ```

## 📦 Estrutura do JSON Salvo

```json
{
  "id": 1732467890123,
  "property": {
    "kind": "RURAL",
    "nome": "Fazenda Teste",
    "car_codigo": "SC-123456-789",
    "municipio": "Florianópolis",
    "uf": "SC",
    "area_total": 1500.5,
    "coordenadas": {
      "latitude": -27.595378,
      "longitude": -48.548050
    }
  },
  "basic_info": {
    "tipo_pessoa": "juridica",
    "cnpj_cpf": "12345678901234",
    "razao_social": "Empresa Teste Ltda",
    "nome_fantasia": "Empresa Teste",
    "cidade": "Florianópolis",
    "estado": "SC"
  },
  "participants": [
    {
      "pessoa_nome": "João Silva",
      "pessoa_cpf_cnpj": "12345678900",
      "papel": "Requerente",
      "telefone": "48999999999",
      "email": "joao@empresa.com"
    }
  ],
  "activities": [
    {
      "activity_id": 10,
      "cnae_codigo": "2.1",
      "quantidade": 150.0,
      "porte": "Grande"
    }
  ],
  "characterization": {
    "recursos_energia": { ... },
    "uso_agua": { ... },
    "residuos": { ... }
  },
  "metadata": {
    "created_at": "2025-11-24T06:45:00.000Z",
    "updated_at": "2025-11-24T06:45:00.000Z",
    "source": "mockup",
    "ready_for_api": true
  },
  "status": "ativo",
  "saved_at": "2025-11-24T06:45:00.000Z"
}
```

## 🎯 Funções Principais

### `useAutoSaveEnterprise()` (Hook - Novo!)
Hook React que monitora mudanças no store e salva automaticamente.

**Funcionamento**:
- Escuta mudanças em: property, basic_info, participants, activities, characterization
- Debounce de 2 segundos
- Detecta modo criação vs edição automaticamente
- Salva silenciosamente (sem toasts)

### `buildEnterpriseJSON(storeData)`
Constrói o JSON completo a partir dos dados do store Zustand.

**Entrada**: Dados do store
```typescript
{
  property: { ... },
  basic_info: { ... },
  participants: [...],
  activities: [...],
  characterization: { ... }
}
```

**Saída**: JSON formatado para a API

### `saveMockEnterprise(enterpriseData, isDraft, existingId)`
Salva ou atualiza o empreendimento no mockup.

**Parâmetros**:
- `enterpriseData`: JSON completo do empreendimento
- `isDraft`: `true` = rascunho, `false` = final
- `existingId`: ID existente (edição) ou `null` (criação)

**Retorna**: ID do empreendimento (existente ou novo gerado)

**Comportamento**:
- Se `existingId` fornecido: Remove antigo e adiciona atualizado
- Se `existingId` é `null`: Adiciona novo à lista

### `getSavedMockEnterprises()`
Retorna lista de todos os empreendimentos salvos (memória + localStorage).

### `getMockEnterpriseList()`
Retorna lista combinada:
- Empreendimentos salvos pelo usuário (topo)
- 5 empreendimentos mockados fixos (base)

### `clearMockEnterprises()`
Limpa todos os empreendimentos salvos.

## 🔍 Como Visualizar os Dados Salvos

### No Console do Navegador

```javascript
// Ver lista de empreendimentos salvos
JSON.parse(localStorage.getItem('mockup_enterprises'))

// Ver quantidade
JSON.parse(localStorage.getItem('mockup_enterprises')).length

// Ver último salvo
const list = JSON.parse(localStorage.getItem('mockup_enterprises'))
console.log(list[list.length - 1])
```

### Logs Automáticos

O sistema gera logs automáticos no console:

```
📦 [MOCKUP] Dados salvos: { ... }
📦 [MOCKUP] JSON pronto para API: { ... }
✅ [CARACTERIZAÇÃO] Empreendimento salvo no mockup: 1732467890123
📋 [CARACTERIZAÇÃO] JSON pronto para enviar à API quando disponível
```

## 🚀 Integração com Backend

Quando o backend estiver pronto:

### 1. Criar Endpoint de Salvamento

```python
@app.post("/api/v1/enterprises/complete")
async def save_complete_enterprise(data: dict):
    # Recebe o JSON completo
    # Salva em todas as tabelas
    # Retorna ID do empreendimento
    pass
```

### 2. Atualizar CaracterizacaoEmpreendimentoPage.tsx

```typescript
// Substituir saveMockEnterprise por chamada real
const response = await axios.post(
  `${API_BASE}/enterprises/complete`,
  enterpriseJSON,
  { headers: { Authorization: `Bearer ${token}` } }
);
```

### 3. Desabilitar Mockup

Em `src/config/mockup.ts`:
```typescript
export const MOCKUP_CONFIG = {
  USE_MOCKUP: false,  // ← Mudar para false
  // ...
};
```

## 📊 Lista de Empreendimentos

A lista exibe:
- **Empreendimentos salvos**: Aparecem no topo (source: 'mockup_user')
- **Empreendimentos mockados fixos**: Aparecem abaixo (source: 'mockup_base')

### Campos Exibidos
- Nome do Empreendimento
- Razão Social
- Tipo (PF/PJ)
- Cidade/Estado
- Número de Empregados
- Status (rascunho/ativo)

## 🧪 Testes

### Testar Salvamento

1. Acesse a aba "Empreendimento"
2. Clique em "Novo Empreendimento"
3. Preencha todas as abas
4. Na última aba (Caracterização), clique em:
   - "Salvar Rascunho" → Salva mas não fecha
   - "Finalizar" → Salva e fecha

### Verificar Salvamento

1. Abra Console do navegador (F12)
2. Execute: `JSON.parse(localStorage.getItem('mockup_enterprises'))`
3. Veja o JSON completo salvo

### Verificar na Lista

1. Volte para aba "Empreendimento"
2. O novo empreendimento deve aparecer no topo da lista

## 🔧 Manutenção

### Limpar Empreendimentos Salvos

```javascript
// No console do navegador
localStorage.removeItem('mockup_enterprises')
```

Ou use a função:
```javascript
import { clearMockEnterprises } from './services/mockupService';
clearMockEnterprises();
```

## 📝 Observações

1. **Dados persistem entre reloads**: LocalStorage mantém os dados
2. **IDs únicos**: Timestamp + random garante unicidade
3. **Formato pronto para API**: JSON já estruturado conforme especificação
4. **Rascunhos e finais**: Sistema diferencia status
5. **Logs detalhados**: Console mostra todo o processo

## 🎯 Próximos Passos

1. Backend implementar endpoint de salvamento completo
2. Frontend substituir mockup por chamada real
3. Implementar edição de empreendimentos salvos
4. Adicionar validações de campos obrigatórios
5. Implementar sincronização com backend
