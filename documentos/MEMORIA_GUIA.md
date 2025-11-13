# 🧠 Guia de "Memória" do Projeto

> Como facilitar a retomada do contexto quando você voltar ao projeto depois de trabalhar em outros.

---

## 🎯 Para o Desenvolvedor (Você)

### Quando voltar ao projeto, diga:

```
"Voltei ao projeto de licenciamento ambiental. 
Implementamos [última feature que lembra]. 
Onde paramos?"
```

**Exemplo:**
> "Voltei ao licenciamento. Fizemos busca de imóvel com modal. O que mais temos?"

---

## 🤖 Para o Assistente (Eu)

### O que eu faço quando você volta:

1. **Leio `docs/INDEX.md`** - Navegação geral
2. **Leio `docs/CHANGELOG.md`** - Últimas mudanças
3. **Leio `docs/FEATURES.md`** - Features implementadas
4. **Analiso arquivos recentes** - Código modificado
5. **Busco metadados JSDoc** - Comentários nos componentes

**Em ~10 segundos eu "relembro":**
- ✅ Features implementadas
- ✅ Padrões utilizados
- ✅ Arquivos modificados
- ✅ TODOs pendentes
- ✅ Problemas conhecidos

---

## 📚 Hierarquia de Documentação

### Nível 1: Navegação
- **`docs/INDEX.md`** - Ponto de entrada, links para tudo

### Nível 2: Catálogos
- **`docs/CHANGELOG.md`** - Histórico cronológico (quando?)
- **`docs/FEATURES.md`** - Catálogo funcional (o quê?)

### Nível 3: Detalhes
- **`docs/REFATORACAO_*.md`** - Mudanças grandes específicas
- **`docs/ALTERACOES_*.md`** - Modificações em features
- **`docs/IMPLEMENTACAO_*.md`** - Novas implementações

### Nível 4: Setup
- **`README.md`** - Setup inicial, variáveis ambiente
- **`PRODUCTION_SETUP.md`** - Deploy produção

---

## 🔍 Como Buscar Informações

### Por Data
```bash
# PowerShell
Select-String -Path "docs\*.md" -Pattern "2025-11-04"

# Ou buscar no CHANGELOG.md direto
```

### Por Tag
```bash
# Buscar features com tag específica
Select-String -Path "docs\*.md" -Pattern "#search"
```

### Por Arquivo
```bash
# Ver todas referências a um arquivo
Select-String -Path "docs\*.md" -Pattern "ImovelPage.tsx"
```

### Por Feature
```bash
# Abrir FEATURES.md e procurar seção
```

---

## ✅ Checklist de Manutenção

### Ao implementar nova feature:

- [ ] Atualizar `docs/CHANGELOG.md` com entrada cronológica
- [ ] Atualizar `docs/FEATURES.md` com seção da feature
- [ ] Adicionar metadados JSDoc no componente principal
- [ ] Atualizar `docs/INDEX.md` se for mudança grande

### Ao corrigir bug:

- [ ] Adicionar entrada em `docs/CHANGELOG.md`
- [ ] Atualizar documentação relacionada se necessário

### Ao fazer refatoração:

- [ ] Criar documento `docs/REFATORACAO_*.md` se grande
- [ ] Atualizar `docs/CHANGELOG.md`
- [ ] Atualizar `docs/FEATURES.md` se padrões mudaram

---

## 🎨 Templates Disponíveis

### Metadados JSDoc
**Arquivo:** `docs/METADATA_TEMPLATE.tsx`

Use para adicionar no topo de componentes importantes:

```typescript
/**
 * ComponentName.tsx
 * 
 * @feature Nome da Feature
 * @date 2025-11-04
 * @tags #tag1 #tag2
 * @related arquivo1.ts, arquivo2.tsx
 * 
 * @description
 * Breve descrição do que faz
 */
```

### Entrada no CHANGELOG
```markdown
## YYYY-MM-DD

### 🎯 Nome da Feature
**Tags:** `#tag1` `#tag2`

**Arquivos:**
- caminho/arquivo.tsx

**Implementação:**
- O que foi feito

**Status:** ✅/⚠️/❌
```

---

## 🚀 Fluxo de Trabalho Recomendado

### 1. Início do Dia (ou retorno ao projeto)

```bash
# Ler documentação rápida
code docs/INDEX.md
code docs/CHANGELOG.md  # Ver últimas mudanças

# Verificar TODOs no código
# (buscar por "TODO" nos arquivos)
```

### 2. Durante Desenvolvimento

```typescript
// Adicionar comentários úteis
/**
 * TODO: Implementar validação de CPF
 * @see docs/FEATURES.md#validacao
 */

// Marcar decisões importantes
/**
 * DECISION: Usamos debounce de 500ms após testes
 * Ver discussão em docs/CHANGELOG.md#2025-11-04
 */
```

### 3. Fim da Implementação

```bash
# 1. Atualizar CHANGELOG
code docs/CHANGELOG.md

# 2. Atualizar FEATURES se aplicável
code docs/FEATURES.md

# 3. Commit com mensagem descritiva
git commit -m "feat(imovel): busca com modal #search #modal"
```

---

## 💡 Dicas Importantes

### ✅ Faça

1. **Sempre atualize CHANGELOG.md** - É minha memória principal
2. **Use tags consistentes** - Facilita busca futura
3. **Adicione metadados em componentes críticos** - JSDoc no topo
4. **Documente decisões técnicas** - Por que fez assim?
5. **Mantenha INDEX.md atualizado** - Ponto de entrada

### ❌ Evite

1. **Documentação apenas no código** - Pode ser refatorado
2. **Commits sem descrição** - "fix" não ajuda futuro
3. **Deixar TODOs sem referência** - Linkar a issue/doc
4. **Documentos órfãos** - Sempre linkar no INDEX.md

---

## 🎓 Exemplos de Retorno ao Projeto

### Cenário 1: Volta após 1 semana

**Você:**
> "Voltei ao licenciamento. Última coisa que lembro é a busca de imóvel."

**Eu faço:**
1. Leio `CHANGELOG.md` → Vejo 04/11 teve 3 implementações
2. Leio `FEATURES.md` → Vejo busca imóvel + FormWizard + Renomeação
3. Respondo: "Fizemos busca imóvel, integramos FormWizard em 6 steps e renomeamos Inscrição→Solicitação. Próximo: backend DocumentacaoPage."

---

### Cenário 2: Volta após 1 mês

**Você:**
> "Voltei ao projeto de licenciamento ambiental. Preciso relembrar tudo."

**Eu faço:**
1. Leio `INDEX.md` → Estrutura geral
2. Leio `CHANGELOG.md` → Últimos 30 dias
3. Leio `FEATURES.md` → Features ativas
4. Leio `README.md` → Setup necessário
5. Respondo com resumo executivo completo

---

### Cenário 3: Volta para bug específico

**Você:**
> "Estou com erro na busca de imóvel. Modal não abre."

**Eu faço:**
1. Busco "busca.*imóvel" em docs/
2. Encontro FEATURES.md#busca-de-imóvel
3. Vejo arquivo: ImovelPage.tsx
4. Leio código, identifico problema
5. Sugiro correção baseada em padrão documentado

---

## 📊 Métricas de Documentação

### Status Atual (04/11/2025)

- ✅ `INDEX.md` - Completo e atualizado
- ✅ `CHANGELOG.md` - Completo (Nov 2025)
- ✅ `FEATURES.md` - Completo (15+ features)
- ✅ `METADATA_TEMPLATE.tsx` - Criado
- ⚠️ Metadados JSDoc - Pendente aplicar em componentes
- ✅ `README.md` - Atualizado

### Próximos Passos

1. Adicionar metadados JSDoc em componentes principais
2. Criar posts em `docs/posts/` para mudanças de hoje
3. Manter CHANGELOG atualizado diariamente

---

## 🔗 Links Úteis

- [INDEX.md](./INDEX.md) - Navegação principal
- [CHANGELOG.md](./CHANGELOG.md) - Histórico de mudanças
- [FEATURES.md](./FEATURES.md) - Catálogo de features
- [METADATA_TEMPLATE.tsx](./METADATA_TEMPLATE.tsx) - Template JSDoc

---

**Criado em:** 04/11/2025  
**Propósito:** Facilitar retomada de contexto após ausência  
**Atualizar:** Quando estrutura de docs mudar
