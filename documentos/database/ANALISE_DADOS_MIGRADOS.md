# 📊 Análise dos Dados Migrados - Activities

**Data:** 22/11/2025  
**Status:** ⚠️ Duplicações detectadas - Correção necessária

## 🔍 Registros Após Migração Inicial

| Code Atual | Code Original | Nome | Diferença | Status |
|------------|---------------|------|-----------|--------|
| 1 | 1.10 | Pesquisa mineral com guia | +0.10 | ⚠️ Duplicado |
| 1 | 1.11 | Teste atividade2 | +0.11 | ⚠️ Duplicado |
| 2 | 2.20 | Extração de petróleo e gás natural | +0.20 | ✅ Único |
| 5 | 5.10 | Extração/beneficiamento de Diamante | +0.10 | ⚠️ Duplicado |
| 5 | 5.32 | TEESTE AI | +0.32 | ⚠️ Duplicado |
| 7 | 6.68 | Teste Atividade suprema | -0.32 | ✅ Único |
| 8 | 7.78 | Teste de AREIA | -0.22 | ✅ Único |
| 9 | 9.30 | Teste Atividade | +0.30 | ⚠️ Duplicado |
| 9 | 9.45 | Teste n88 | +0.45 | ⚠️ Duplicado |
| 10 | 9.70 | Testando formulário | -0.30 | ✅ Único |
| 16 | 16.20 | Fabricação artefatos de couro | +0.20 | ✅ Único |

## 📈 Estatísticas

- **Total de registros:** 11
- **Códigos únicos:** 8
- **Códigos duplicados:** 3 (code=1, code=5, code=9)
- **Total de duplicações:** 5 registros afetados

## ⚠️ Problemas Identificados

### 1. Duplicações por Truncamento

Quando valores decimais foram truncados para INTEGER, registros diferentes receberam o mesmo código:

```
1.10 → 1  ┐
1.11 → 1  ┘ Conflito!

5.10 → 5  ┐
5.32 → 5  ┘ Conflito!

9.30 → 9  ┐
9.45 → 9  ┘ Conflito!
```

### 2. Falta de Constraint UNIQUE

A constraint `UNIQUE` foi perdida durante a conversão de VARCHAR para INTEGER.

### 3. Diferenças Negativas

Alguns registros tiveram valores arredondados para cima:
- 6.68 → 7 (arredondou para cima)
- 7.78 → 8 (arredondou para cima)
- 9.70 → 10 (arredondou para cima)

## ✅ Solução Aplicada

### Script: `FIX_ACTIVITIES_CODE_DUPLICATES.sql`

**Renumeração Proposta:**

| ID | Nome | Code Antigo | Code Novo | CNAE Original |
|----|------|-------------|-----------|---------------|
| (mais antigo) | Pesquisa mineral com guia | 1 | 1 | 1.10 |
| ... | Extração de petróleo | 2 | 2 | 2.20 |
| ... | Extração/Diamante | 5 | 3 | 5.10 |
| ... | Teste Atividade suprema | 7 | 4 | 6.68 |
| ... | TEESTE AI | 5 | 5 | 5.32 |
| ... | Teste de AREIA | 8 | 6 | 7.78 |
| ... | Teste Atividade | 9 | 7 | 9.30 |
| ... | Teste n88 | 9 | 8 | 9.45 |
| ... | Testando formulário | 10 | 9 | 9.70 |
| ... | Teste atividade2 | 1 | 10 | 1.11 |
| ... | Fabricação artefatos | 16 | 11 | 16.20 |

**Resultado:**
- ✅ Códigos sequenciais de 1 a 11
- ✅ Sem duplicações
- ✅ Valores originais preservados em `cnae_codigo`
- ✅ Constraint UNIQUE aplicada
- ✅ Sequência criada a partir de 12

## 🎯 Próxima Ação

Execute imediatamente:
```bash
# No Supabase SQL Editor:
documentos/database/FIX_ACTIVITIES_CODE_DUPLICATES.sql
```

Após a execução, o campo `code` será:
- ✅ Único (constraint aplicada)
- ✅ Sequencial (1, 2, 3, ...)
- ✅ Autoincremento (próximo = 12)

## 📝 Observações

1. **Valores decimais originais estão seguros** em `cnae_codigo`
2. **Ordem de criação preservada** (ORDER BY created_at, id)
3. **Frontend já ajustado** para campo code automático
4. **Nenhum dado será perdido** na renumeração
