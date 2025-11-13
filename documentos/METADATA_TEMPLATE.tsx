/**
 * TEMPLATE: Metadados para Componentes
 * 
 * Adicione este bloco no topo de componentes críticos para facilitar
 * busca e referência futura.
 * 
 * Substitua os valores entre {} pelos dados reais.
 */

/**
 * {NomeDoComponente}.tsx
 * 
 * @feature {Nome da Feature}
 * @date {YYYY-MM-DD}
 * @tags #{tag1} #{tag2} #{tag3}
 * @related {arquivo1.ts}, {arquivo2.tsx}
 * @documentation {docs/ARQUIVO.md}
 * 
 * @description
 * {Breve descrição do que o componente faz}
 * 
 * @implementation
 * - {Ponto importante 1}
 * - {Ponto importante 2}
 * - {Padrão utilizado}
 * 
 * @patterns
 * - {Nome do Pattern}: {Descrição}
 * 
 * @api
 * - {Endpoint utilizado}
 * 
 * @state
 * - {Store/Context utilizado}
 * 
 * @example
 * ```tsx
 * <Component 
 *   prop1={value}
 *   prop2={value}
 * />
 * ```
 */

// ============================================================================
// EXEMPLOS REAIS
// ============================================================================

/**
 * EXEMPLO 1: ImovelPage.tsx
 * 
 * @feature Busca de Imóvel
 * @date 2025-11-04
 * @tags #search #modal #property #debounce
 * @related property.ts, inscricao.ts
 * @documentation docs/FEATURES.md#busca-de-imóvel
 * 
 * @description
 * Implementa modal de busca de imóveis em 2 etapas:
 * 1. Busca com debounce (500ms, min 3 chars)
 * 2. Confirmação antes de selecionar
 * 
 * @implementation
 * - Modal state machine (search → confirm)
 * - Debounce pattern para evitar chamadas excessivas
 * - Fallback Supabase se API HTTP falhar
 * - Integração com useInscricaoStore (propertyId)
 * 
 * @patterns
 * - Debounce: useEffect com setTimeout e cleanup
 * - State Machine: type ModalStep = 'search' | 'confirm'
 * 
 * @api
 * - GET /imoveis/buscar?q={query}
 * - Fallback: Supabase properties table
 * 
 * @state
 * - useInscricaoStore: setProperty, setPropertyId
 * - useInscricaoContext: processoId
 * 
 * @example
 * ```tsx
 * // Uso na rota
 * <Route path="/inscricao/imovel" element={<ImovelPage />} />
 * ```
 */

/**
 * EXEMPLO 2: FormularioPage.tsx
 * 
 * @feature Integração FormWizard
 * @date 2025-11-04
 * @tags #formwizard #integration #workflow
 * @related FormWizard.tsx, InscricaoContext.tsx
 * @documentation docs/CHANGELOG.md#integração-formwizard
 * 
 * @description
 * Wrapper que integra FormWizard no fluxo de solicitação (step 4 de 6).
 * Recebe processoId do contexto e navega para documentação ao concluir.
 * 
 * @implementation
 * - Recebe processoId do InscricaoContext (não cria novo)
 * - Passa processoId como prop para FormWizard
 * - Callback onComplete navega para /inscricao/documentacao
 * 
 * @patterns
 * - Context Consumer: useInscricaoContext
 * - Callback Pattern: onComplete={() => navigate(...)}
 * 
 * @state
 * - useInscricaoContext: processoId
 * 
 * @example
 * ```tsx
 * <FormWizard 
 *   processoId={processoId}
 *   onComplete={() => navigate('/inscricao/documentacao')}
 * />
 * ```
 */

/**
 * EXEMPLO 3: searchImoveis (API Function)
 * 
 * @feature Busca de Imóvel - API
 * @date 2025-11-04
 * @tags #api #search #property
 * @related ImovelPage.tsx
 * @documentation docs/FEATURES.md#busca-de-imóvel
 * 
 * @description
 * Função de busca de imóveis com fallback Supabase.
 * Retorna lista de imóveis que correspondem ao termo de busca.
 * 
 * @implementation
 * - Tenta API HTTP primeiro: GET /imoveis/buscar?q=
 * - Fallback para Supabase se API não disponível
 * - Validação: mínimo 3 caracteres
 * - Limite: 50 resultados
 * 
 * @api
 * - Endpoint: GET /imoveis/buscar?q={query}
 * - Response: SearchImovelResult[]
 * - Error handling: ServiceError
 * 
 * @example
 * ```typescript
 * const { data, error } = await searchImoveis('fazenda');
 * if (error) {
 *   console.error(error.message);
 * } else {
 *   console.log(data); // SearchImovelResult[]
 * }
 * ```
 */

// ============================================================================
// GUIA DE USO
// ============================================================================

/**
 * QUANDO USAR ESTE TEMPLATE:
 * 
 * ✅ Componentes principais de páginas (Page.tsx)
 * ✅ Componentes reutilizáveis complexos
 * ✅ Funções de API importantes
 * ✅ Hooks customizados
 * ✅ Stores (Zustand/Redux)
 * ✅ Contexts
 * 
 * ❌ Componentes muito simples (Button, Input básicos)
 * ❌ Utilitários triviais
 * ❌ Arquivos de tipos/interfaces apenas
 */

/**
 * TAGS SUGERIDAS:
 * 
 * Funcionalidade:
 * #search, #upload, #validation, #form, #wizard
 * 
 * UI/UX:
 * #modal, #table, #chart, #layout, #navigation
 * 
 * Tecnologia:
 * #api, #state, #context, #hook, #service
 * 
 * Padrões:
 * #debounce, #pagination, #infinite-scroll, #lazy-load
 * 
 * Domínio:
 * #property, #participant, #activity, #document, #process
 * 
 * Tipo de mudança:
 * #refactoring, #bugfix, #feature, #integration
 */
