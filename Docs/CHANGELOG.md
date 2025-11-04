# 📅 Histórico de Mudanças - Licenciamento Ambiental Frontend

> Registro cronológico de todas as implementações, refatorações e correções do projeto.

---

## 2025-11-04

### 🏠 Busca de Imóvel
**Tags:** `#search` `#modal` `#property` `#debounce` `#api-integration`

**Arquivos:**
- `src/pages/inscricao/ImovelPage.tsx` (criado/atualizado)
- `src/lib/api/property.ts` (função `searchImoveis`)

**Implementação:**
- Modal de busca em 2 etapas (search → confirm)
- Debounce de 500ms para evitar chamadas excessivas
- Validação mínima de 3 caracteres
- API endpoint: `GET /imoveis/buscar?q=`
- Fallback para Supabase se API HTTP não disponível
- Exibição de resultados em tabela responsiva
- Confirmação antes de selecionar imóvel
- Integração com `useInscricaoStore` (propertyId)

**Padrões utilizados:**
```typescript
// Debounce pattern
useEffect(() => {
  const timeoutId = setTimeout(async () => {
    await searchImoveis(searchTerm);
  }, 500);
  return () => clearTimeout(timeoutId);
}, [searchTerm]);

// Modal state machine
type ModalStep = 'search' | 'confirm';
```

**Status:** ✅ Implementado e funcional

---

### 🔄 Renomeação: Inscrição → Solicitação
**Tags:** `#refactoring` `#terminology` `#ui-update`

**Arquivos modificados:**
1. `src/pages/Dashboard.tsx`
2. `src/pages/inscricao/ImovelPage.tsx`
3. `src/pages/inscricao/EmpreendimentoPage.tsx`
4. `src/pages/inscricao/RevisaoPage.tsx`
5. `src/components/InscricaoStepper.tsx`
6. `src/pages/inscricao/ParticipantesPage.tsx`
7. `src/types/inscription.ts`

**Mudanças:**
- "Inscrição" → "Solicitação" (9 ocorrências no Dashboard)
- "Nova Inscrição" → "Nova Solicitação"
- "Empreendimento" → "Atividade" (títulos e navegação)
- Botões de navegação atualizados
- Mensagens de alerta atualizadas

**Status:** ✅ Completo

---

### 📋 Integração FormWizard no Fluxo Principal
**Tags:** `#formwizard` `#integration` `#workflow` `#6-steps`

**Arquivos criados:**
- `src/pages/inscricao/FormularioPage.tsx`
- `src/pages/inscricao/DocumentacaoPage.tsx`

**Arquivos modificados:**
1. `src/components/FormWizard.tsx`
2. `src/components/InscricaoStepper.tsx`
3. `src/components/InscricaoLayout.tsx`
4. `src/lib/store/inscricao.ts`
5. `src/App.tsx`
6. `src/pages/inscricao/EmpreendimentoPage.tsx`
7. `src/pages/inscricao/RevisaoPage.tsx`

**Novo fluxo (6 steps):**
1. Participantes
2. Imóvel
3. Atividade
4. **Formulário** (FormWizard integrado) ⭐ NOVO
5. **Documentação** (Upload de docs) ⭐ NOVO
6. Revisão

**Implementação FormularioPage:**
```typescript
// Recebe processoId do InscricaoContext
const { processoId } = useInscricaoContext();

// Passa para FormWizard
<FormWizard 
  processoId={processoId}
  onComplete={() => navigate('/inscricao/documentacao')}
/>
```

**Implementação DocumentacaoPage:**
- 6 documentos predefinidos (3 obrigatórios, 3 opcionais)
- Upload individual por documento
- Progress tracking
- Validação de arquivos (tamanho, tipo)
- Backend integration pendente (TODO)

**Status:** ✅ UI implementada, ⚠️ Backend pendente

---

### 🗂️ Menu: Processos Oculto
**Tags:** `#ui` `#menu` `#temporary`

**Arquivo:**
- `src/pages/Dashboard.tsx` (linhas 313-317, 438-442)

**Mudança:**
```tsx
{/* TODO: Descomentar após refinamento do analista
<Link to="/processos">
  <FileText className="w-5 h-5" />
  <span>Processos</span>
</Link>
*/}
```

**Razão:** Aguardando refinamento do fluxo de processos pelo analista

**Status:** ⏸️ Temporariamente oculto

---

## 2025-11-03

### 🔥 Refatoração Crítica: URLs da API
**Tags:** `#critical-fix` `#api` `#refactoring` `#timeout-fix`

**Documentação detalhada:** [`REFATORACAO_API_URLS.md`](./REFATORACAO_API_URLS.md)

**Problema:** Timeout ao clicar "Nova Solicitação"
**Causa:** URL duplicada `/api/v1/api/v1/`, servidor errado, tipo processId incompatível

**Arquivos modificados:** 15 arquivos
- Migração fetch → axios
- Cliente HTTP centralizado (`lib/api/http.ts`)
- Correção de tipos (processId: number → string UUID)
- Padronização de endpoints

**Status:** ✅ Resolvido

---

## Templates de Referência

### Para adicionar nova feature:

```markdown
## YYYY-MM-DD

### 🎯 Nome da Feature
**Tags:** `#tag1` `#tag2` `#tag3`

**Arquivos:**
- `caminho/arquivo1.tsx` (criado/modificado)
- `caminho/arquivo2.ts`

**Implementação:**
- Descrição do que foi feito
- Padrões utilizados
- Decisões técnicas

**Código relevante:**
```typescript
// Snippet importante para referência futura
```

**Status:** ✅/⚠️/❌ + descrição
```

---

**Última atualização:** 04/11/2025  
**Mantido por:** Equipe de Desenvolvimento
