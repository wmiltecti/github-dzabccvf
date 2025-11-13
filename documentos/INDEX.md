# 📚 Índice de Documentação - Licenciamento Ambiental Front-end

## 🎯 Referências Rápidas

### � Documentos Principais

- **[CHANGELOG.md](./CHANGELOG.md)** - 📅 Histórico cronológico de todas as mudanças
- **[FEATURES.md](./FEATURES.md)** - 🎯 Catálogo completo de funcionalidades implementadas
- **[INDEX.md](./INDEX.md)** - 📚 Este documento (navegação geral)

### �🔥 Problemas Críticos Resolvidos

#### Timeout na Nova Inscrição (Nov 2025)
- **Documento:** [`REFATORACAO_API_URLS.md`](./REFATORACAO_API_URLS.md)
- **Problema:** Sistema dava timeout ao clicar "Nova Inscrição"
- **Causa:** URL duplicada (`/api/v1/api/v1/`), servidor errado, tipo incompatível
- **Solução:** Refatoração completa de 15 arquivos, migração fetch→axios
- **Status:** ✅ Resolvido
- **Impacto:** Alto - Fluxo crítico do sistema

### 🔧 Configuração e Setup

#### Produção
- [`PRODUCTION_SETUP.md`](../PRODUCTION_SETUP.md) - Deploy em produção
- [`SUPABASE_PRODUCTION.md`](../SUPABASE_PRODUCTION.md) - Configuração Supabase

#### Desenvolvimento
- [`README.md`](../README.md) - Setup inicial e variáveis de ambiente

### 🔌 Integrações e APIs

#### API FastAPI
- [`INTEGRACAO_API.md`](../INTEGRACAO_API.md) - Integração geral com backend
- [`DEBUG_API_DADOS_GERAIS.md`](../DEBUG_API_DADOS_GERAIS.md) - Debug de endpoints
- [`TESTE_API_DADOS_GERAIS.md`](../TESTE_API_DADOS_GERAIS.md) - Testes e exemplos

#### Padrões de API (Após Refatoração Nov 2025)
```typescript
// ✅ Padrão correto
import http from '../lib/api/http';

// GET
const response = await http.get('/endpoint');
return response.data;

// POST
const response = await http.post('/endpoint', payload);
return response.data;

// PUT
const response = await http.put(`/endpoint/${id}`, payload);
return response.data;

// DELETE
await http.delete(`/endpoint/${id}`);
```

### ⚙️ Funcionalidades

#### FormWizard - Etapas de Inscrição
1. **Características** - Dados básicos do empreendimento
2. **Recursos e Energia** - [`ALTERACOES_ABA2_RECURSOS_ENERGIA.md`](./ALTERACOES_ABA2_RECURSOS_ENERGIA.md)
3. **Uso de Água** - Consumo e outorgas
4. **Resíduos** - Grupos A, B e Gerais (refatorado em Nov 2025)
5. **Outras Informações** - [`IMPLEMENTACAO_ABA6_OUTRAS_INFORMACOES.md`](../IMPLEMENTACAO_ABA6_OUTRAS_INFORMACOES.md)

#### Recursos Especiais
- [`MODO_OFFLINE.md`](../MODO_OFFLINE.md) - Funcionalidade offline
- [`blockchain.md`](./blockchain.md) - Integração blockchain

## 🗂️ Estrutura de Arquivos Importantes

### Configuração HTTP
```
lib/api/
├── http.ts              ⭐ Cliente axios centralizado
├── processos.ts         Endpoints de processos
└── people.ts            Endpoints de pessoas (PF/PJ)
```

### Serviços (Services Layer)
```
services/
├── residuosService.ts      ⭐ Refatorado Nov 2025 (12 funções)
├── usoAguaService.ts       ⭐ Refatorado Nov 2025
├── outorgasService.ts      ⭐ Refatorado Nov 2025
├── outrasInformacoesService.ts  ⭐ Refatorado Nov 2025
├── processosService.ts
├── pessoasFisicasService.ts
└── pessoasJuridicasService.ts
```

### Estado (State Management)
```
lib/store/
├── inscricao.ts        ⭐ Store Zustand - processId agora é string (UUID)
└── formWizardStore.ts  Store do FormWizard
```

### Tipos
```
types/
├── inscription.ts      ⭐ processId: string | null (era number)
└── auth.ts
```

### Componentes Principais
```
components/
├── InscricaoLayout.tsx     ⭐ Refatorado - Cria processo (UUID)
├── FormWizard.tsx          ⭐ Refatorado - Multi-step form
├── Step1Caracteristicas.tsx
├── Step2RecursosEnergia.tsx
├── Step3UsoAgua.tsx
├── Step4Residuos.tsx
└── Step5OutrasInfo.tsx
```

## 📊 Histórico de Mudanças

### 2025

#### Novembro
- **04/11** - 🏠 **Busca de Imóvel** - Modal 2 etapas, debounce, API integration
  - Ver: [`CHANGELOG.md`](./CHANGELOG.md#2025-11-04)
  - Ver: [`FEATURES.md`](./FEATURES.md#busca-de-imóvel)

- **04/11** - 🔄 **Renomeação Terminologia** - Inscrição → Solicitação
  - 9 arquivos modificados
  - Ver: [`CHANGELOG.md`](./CHANGELOG.md#renomeação-inscrição--solicitação)

- **04/11** - 📋 **Integração FormWizard** - 6 steps no fluxo principal
  - FormularioPage + DocumentacaoPage criados
  - Ver: [`CHANGELOG.md`](./CHANGELOG.md#integração-formwizard-no-fluxo-principal)
  - Ver: [`FEATURES.md`](./FEATURES.md#fluxo-de-solicitação-6-steps)

- **03/11** - 🔥 **Refatoração crítica URLs API**
  - Corrigido timeout em Nova Inscrição
  - Migração completa fetch → axios
  - 15 arquivos modificados
  - Padrão de URL estabelecido
  - Ver: [`REFATORACAO_API_URLS.md`](./REFATORACAO_API_URLS.md)

## 🎓 Guias de Referência

### Para Desenvolvedores Novos

1. **Primeiro:** Leia [`README.md`](../README.md) - Setup básico
2. **Segundo:** Configure ambiente seguindo [`README.md`](../README.md) seção "Configuração para Desenvolvimento"
3. **Terceiro:** Entenda padrões de API em [`REFATORACAO_API_URLS.md`](./REFATORACAO_API_URLS.md)
4. **Quarto:** Explore funcionalidades específicas conforme necessidade

### Para Debugar Problemas

#### Timeout ou Erro 404 na API
1. Verifique URL em [`REFATORACAO_API_URLS.md`](./REFATORACAO_API_URLS.md)
2. Confirme `.env` com `VITE_API_BASE_URL=http://localhost:8000/api/v1` (sem trailing slash)
3. Verifique se está usando `http.METHOD()` ao invés de `fetch()`

#### Erros de Tipo (TypeScript)
- `processId` agora é `string` (UUID), não `number`
- Veja mudanças em [`REFATORACAO_API_URLS.md`](./REFATORACAO_API_URLS.md) seção "Tipo Incorreto"

#### Dados não salvam
1. Verifique console do browser (F12)
2. Confirme que API backend está rodando (localhost:8000)
3. Teste endpoint direto com curl (exemplos em [`DEBUG_API_DADOS_GERAIS.md`](../DEBUG_API_DADOS_GERAIS.md))

### Para Deploy

1. **Produção Supabase:** [`SUPABASE_PRODUCTION.md`](../SUPABASE_PRODUCTION.md)
2. **Deploy Geral:** [`PRODUCTION_SETUP.md`](../PRODUCTION_SETUP.md)
3. **Variáveis de Ambiente:** Ver seção em [`README.md`](../README.md)

## 🔍 Busca Rápida

### Por Problema

- **Timeout ao criar inscrição** → [`REFATORACAO_API_URLS.md`](./REFATORACAO_API_URLS.md)
- **URL duplicada (/api/v1/api/v1/)** → [`REFATORACAO_API_URLS.md`](./REFATORACAO_API_URLS.md)
- **processId NaN** → [`REFATORACAO_API_URLS.md`](./REFATORACAO_API_URLS.md) - Seção "Tipo Incorreto"
- **fetch() não funciona** → [`REFATORACAO_API_URLS.md`](./REFATORACAO_API_URLS.md) - Migração para axios
- **Política RLS infinita** → [`README.md`](../README.md) - Seção "Correção de Políticas RLS"
- **Storage não funciona** → [`README.md`](../README.md) - Seção "Configurar Storage"

### Por Componente

- **Nova Inscrição** → [`REFATORACAO_API_URLS.md`](./REFATORACAO_API_URLS.md)
- **FormWizard** → Vários docs (Index por etapa acima)
- **Resíduos** → [`REFATORACAO_API_URLS.md`](./REFATORACAO_API_URLS.md) - Seção "residuosService.ts"
- **Recursos/Energia** → [`ALTERACOES_ABA2_RECURSOS_ENERGIA.md`](./ALTERACOES_ABA2_RECURSOS_ENERGIA.md)
- **Outras Informações** → [`IMPLEMENTACAO_ABA6_OUTRAS_INFORMACOES.md`](../IMPLEMENTACAO_ABA6_OUTRAS_INFORMACOES.md)
- **Blockchain** → [`blockchain.md`](./blockchain.md)
- **Offline** → [`MODO_OFFLINE.md`](../MODO_OFFLINE.md)

### Por Arquivo de Código

- **http.ts** → [`REFATORACAO_API_URLS.md`](./REFATORACAO_API_URLS.md)
- **residuosService.ts** → [`REFATORACAO_API_URLS.md`](./REFATORACAO_API_URLS.md)
- **InscricaoLayout.tsx** → [`REFATORACAO_API_URLS.md`](./REFATORACAO_API_URLS.md)
- **inscription.ts (types)** → [`REFATORACAO_API_URLS.md`](./REFATORACAO_API_URLS.md)

## 💡 Dicas Importantes

### ✅ Boas Práticas

1. **URLs de API:**
   - Sempre use `http.METHOD()` de `lib/api/http.ts`
   - NUNCA concatene `import.meta.env.VITE_API_BASE_URL` manualmente
   - Paths sempre com `/` inicial: `/processos/`, `/residuos/grupo-a`

2. **processId:**
   - Sempre trate como `string` (UUID)
   - Não use `parseInt()` ou conversões numéricas
   - Exemplo: `"38c083bf-ec01-4454-a642-65637c26d57a"`

3. **Erros 404:**
   - Em GET, retorne `[]` ou `null` (não é erro crítico)
   - Em POST/PUT/DELETE, faça `throw` (é erro real)

### ❌ Evitar

1. ❌ `const url = ${import.meta.env.VITE_API_BASE_URL}/endpoint`
2. ❌ `parseInt(processId)` quando processId é UUID
3. ❌ `fetch()` ao invés de `http.METHOD()`
4. ❌ Trailing slash em `VITE_API_BASE_URL`

## 📞 Suporte

Para problemas não documentados:
1. Verifique console do browser (F12)
2. Verifique logs da API backend
3. Consulte documentos relacionados neste índice
4. Verifique [`REFATORACAO_API_URLS.md`](./REFATORACAO_API_URLS.md) para padrões atualizados

---

**Última atualização:** 03/11/2025  
**Versão:** 1.0  
**Status:** ✅ Ativo
