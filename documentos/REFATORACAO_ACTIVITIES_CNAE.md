# 📋 Refatoração: Cadastro de Atividades com CNAE

**Data:** 22/11/2025  
**Branch:** `feature/nova-funcionalidade`

## 🎯 Objetivo

Refatorar a tabela `activities` para adicionar campos de CNAE (Classificação Nacional de Atividades Econômicas) e converter o campo `code` de VARCHAR para INTEGER (autoincremento).

## 📊 Alterações Realizadas

### 1. **Banco de Dados (SQL)**

**Arquivo:** `documentos/database/MIGRATION_ACTIVITIES_ADD_CNAE.sql`

- ✅ Adicionados campos `cnae_codigo` (VARCHAR(10)) e `cnae_descricao` (TEXT)
- ✅ Migração dos valores atuais de `code` para `cnae_codigo` (preservando decimais)
- ✅ Conversão do campo `code` de VARCHAR para INTEGER
- ✅ Criado índice para busca rápida por CNAE
- ✅ Adicionados comentários explicativos nos campos

**Estrutura Final:**
```sql
activities
  ├── id (UUID) - PK
  ├── code (INTEGER) - ID numérico sequencial ⚠️ ALTERADO
  ├── name (VARCHAR)
  ├── description (TEXT)
  ├── cnae_codigo (VARCHAR(10)) - 🆕 NOVO
  ├── cnae_descricao (TEXT) - 🆕 NOVO
  ├── pollution_potential_id (UUID)
  ├── measurement_unit (VARCHAR)
  ├── is_active (BOOLEAN)
  ├── created_at (TIMESTAMPTZ)
  └── updated_at (TIMESTAMPTZ)
```

### 2. **Frontend - TypeScript Interfaces**

**Arquivo:** `src/services/adminService.ts`

```typescript
export interface Activity {
  id: string;
  code: number;  // Já era number, compatível com INTEGER
  name: string;
  description?: string;
  cnae_codigo?: string;      // 🆕 NOVO
  cnae_descricao?: string;   // 🆕 NOVO
  enterprise_size_id?: string;
  pollution_potential_id?: string;
  measurement_unit?: string;
  range_start?: number;
  range_end?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // ... relationships
}
```

### 3. **Frontend - Formulário de Atividades**

**Arquivo:** `src/components/admin/ActivityForm.tsx`

**Alterações:**
- ✅ Adicionados campos no `formData` para `cnae_codigo` e `cnae_descricao`
- ✅ Criados inputs de formulário para CNAE com labels descritivos
- ✅ Alterado o campo `code` para aceitar apenas INTEGER (removido `step="0.01"`)
- ✅ Atualizado `activityData` para incluir campos CNAE no salvamento
- ✅ Convertido `parseFloat(formData.code)` para `parseInt(formData.code)`

**Interface do formulário:**
```tsx
// Campos CNAE
<input
  type="text"
  value={formData.cnae_codigo}
  placeholder="Ex: 1011-2/01"
  maxLength={10}
/>
<input
  type="text"
  value={formData.cnae_descricao}
  placeholder="Ex: Frigorífico - abate de bovinos"
/>
```

### 4. **Frontend - Visualização de Atividades**

**Arquivo:** `src/components/admin/ActivityView.tsx`

- ✅ Adicionada seção para exibir código CNAE e descrição CNAE
- ✅ Campos aparecem condicionalmente (somente se preenchidos)

## 🔄 Migração de Dados

O script SQL preserva os dados atuais da seguinte forma:

1. **Valores decimais preservados:** Se `code` tinha valor `16.2`, agora:
   - `code` = `16` (INTEGER)
   - `cnae_codigo` = `"16.2"` (VARCHAR) - valor original preservado

2. **Valores inteiros:** Se `code` tinha valor `1`, agora:
   - `code` = `1` (INTEGER)
   - `cnae_codigo` = `"1"` (VARCHAR)

3. **Descrição inicial:** O campo `cnae_descricao` é preenchido com o valor de `name` como padrão.

## ⚠️ Impactos e Compatibilidade

### ✅ Sem Breaking Changes

- O campo `code` já era tratado como `number` no TypeScript
- Todas as referências ao campo continuam funcionando
- A conversão para INTEGER não afeta o frontend (já usava `.toString()` onde necessário)

### 📝 Locais que usam `activity.code`:

1. **ActivityForm.tsx**: Usa `code.toString()` e `parseInt()` - ✅ Compatível
2. **AtividadesEmpreendimentoPage.tsx**: Usa `code.toString()` - ✅ Compatível
3. **ActivityView.tsx**: Exibe como número - ✅ Compatível

## 📦 Próximos Passos

### 1. **Executar Script SQL** 🔴 URGENTE

```bash
# Executar no Supabase SQL Editor:
documentos/database/MIGRATION_ACTIVITIES_ADD_CNAE.sql
```

### 2. **Atualizar Backend (API Python)** 🟡 IMPORTANTE

Se houver backend Python (FastAPI/Flask), adicionar campos nos schemas:

```python
class ActivityResponse(BaseModel):
    id: str
    code: int  # Alterar de str para int se necessário
    name: str
    description: Optional[str]
    cnae_codigo: Optional[str]      # 🆕 NOVO
    cnae_descricao: Optional[str]   # 🆕 NOVO
    # ... outros campos
```

### 3. **Implementar Busca de CNAE** 🟢 FUTURO

Adicionar funcionalidade de autocomplete para buscar CNAEs:

- [ ] Criar tabela `cnaes` com lista oficial do IBGE
- [ ] Implementar endpoint `GET /api/cnaes?search={termo}`
- [ ] Adicionar componente de busca no formulário
- [ ] Validar formato CNAE (XXXX-X/XX)

### 4. **Integração com `dados_gerais`** 🟢 FUTURO

Sincronizar CNAEs entre `activities` e `dados_gerais`:

- [ ] Ao selecionar atividade, preencher automaticamente CNAE em dados_gerais
- [ ] Permitir override manual do CNAE se necessário
- [ ] Criar relatórios filtrados por código CNAE

### 5. **Popular Dados CNAE** 🟢 FUTURO

```sql
-- Exemplo de atualização com CNAEs reais
UPDATE activities 
SET cnae_codigo = '1011-2/01',
    cnae_descricao = 'Frigorífico - abate de bovinos'
WHERE name ILIKE '%frigorífico%';
```

## 🧪 Testes Necessários

- [ ] Criar nova atividade com CNAE preenchido
- [ ] Criar nova atividade sem CNAE (campos opcionais)
- [ ] Editar atividade existente e adicionar CNAE
- [ ] Verificar exibição de CNAE na visualização
- [ ] Testar busca de atividades por código CNAE
- [ ] Validar migração de dados (comparar `code` com `cnae_codigo`)

## 📚 Recursos

- **Consulta CNAEs:** [IBGE - Concla](https://concla.ibge.gov.br/busca-online-cnae.html)
- **Formato CNAE:** XXXX-X/XX (7 dígitos + hífen + 2 dígitos)
- **Exemplo:** `1011-2/01` = Frigorífico - abate de bovinos

## ⚠️ Problema Detectado: Duplicações de Código

Após executar a migração inicial, foram detectadas **duplicações no campo `code`** devido ao truncamento de valores decimais:

```
code=1: 3 registros (1.10, 1.11 → 1)
code=5: 2 registros (5.10, 5.32 → 5)
code=9: 2 registros (9.30, 9.45 → 9)
```

### ✅ Solução Implementada

**Arquivo:** `documentos/database/FIX_ACTIVITIES_CODE_DUPLICATES.sql`

Este script corrige as duplicações:
1. Renumera todos os registros sequencialmente (1, 2, 3, ...)
2. Adiciona constraint `UNIQUE` no campo `code`
3. Cria sequência `activities_code_seq` para autoincremento
4. Define `code` com valor padrão automático

### 🔄 Alterações no Frontend

**Campo `code` agora é automático:**
- ✅ Ao **criar** nova atividade: campo oculto (gerado pelo banco)
- ✅ Ao **editar** atividade: campo somente leitura (não editável)
- ✅ Valores originais preservados em `cnae_codigo`

## ✅ Checklist de Implementação

- [x] Script SQL de migração criado
- [x] Interface TypeScript atualizada
- [x] Formulário de cadastro atualizado
- [x] Visualização de atividade atualizada
- [x] Documentação criada
- [x] Script SQL executado no banco
- [x] Script de correção de duplicações criado
- [ ] Script de correção executado no banco
- [ ] Backend atualizado (se aplicável)
- [ ] Testes realizados
- [ ] Deploy em produção

## 🔗 Arquivos Criados/Modificados

1. `documentos/database/MIGRATION_ACTIVITIES_ADD_CNAE.sql` (NOVO)
2. `documentos/database/FIX_ACTIVITIES_CODE_DUPLICATES.sql` (NOVO) 🔴
3. `src/services/adminService.ts`
4. `src/components/admin/ActivityForm.tsx`
5. `src/components/admin/ActivityView.tsx`
6. `documentos/REFATORACAO_ACTIVITIES_CNAE.md` (NOVO - este arquivo)

## 🚨 Ação Urgente Necessária

**Execute o script de correção:**
```sql
-- Arquivo: documentos/database/FIX_ACTIVITIES_CODE_DUPLICATES.sql
```

Este script irá:
- ✅ Renumerar atividades sequencialmente
- ✅ Resolver duplicações de código
- ✅ Adicionar constraint UNIQUE
- ✅ Criar sequência para autoincremento

---

**Autor:** GitHub Copilot  
**Revisão:** Pendente  
**Status:** ✅ Frontend atualizado | 🔴 Correção SQL pendente de execução
