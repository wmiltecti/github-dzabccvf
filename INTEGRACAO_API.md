# Integração com API FastAPI - Wizard de Licenciamento

## ⚠️ Modo Híbrido - Funciona com ou sem API

O sistema implementa **fallback automático** para modo offline:
- ✅ Se a API estiver disponível: usa os endpoints FastAPI
- 🔸 Se a API estiver indisponível (404/Network Error): salva tudo no localStorage

**Consulte `MODO_OFFLINE.md` para detalhes completos.**

## Arquivos Criados

### 1. `/src/utils/authToken.ts`
Utilitário para gerenciar tokens de autenticação:
- `getAuthToken()`: Retorna o token do localStorage (prioriza `auth_token`, fallback para `supabase_jwt`)
- `getAuthUser()`: Retorna os dados do usuário autenticado com parse seguro
- `getUserId()`: Extrai o ID do usuário
- `isAuthenticated()`: Verifica se o usuário está autenticado

### 2. `/src/lib/api/processos.ts`
Cliente HTTP para comunicação com a API FastAPI:
- Usa o axios client existente em `/src/lib/api/http.ts`
- Endpoints implementados:
  - `POST /processos` - Criar novo processo
  - `PUT /processos/{id}/dados-gerais` - Salvar dados gerais (Etapa 1)
  - `POST /processos/{id}/localizacoes` - Adicionar localização
  - `GET /processos/{id}/wizard-status` - Obter status de validação
  - `POST /processos/{id}/submit` - Submeter processo

### 3. `/src/services/processosService.ts`
Camada de serviço que encapsula as chamadas de API:
- Validações de entrada
- Tratamento de erros
- Abstração da lógica de negócio

### 4. `/src/store/formWizardStore.ts` (Modificado)
Store Zustand estendido com:
- `processoId`: ID do processo sendo editado
- `setProcessoId()`: Define o ID do processo
- `resetProcesso()`: Limpa o processo e reinicia o wizard

## Integrações Realizadas

### FormWizardLicenciamento.tsx
- Criação automática de processo ao montar o componente
- Salvamento de dados gerais (porte e potencial_poluidor) na Etapa 1
- Loading states durante operações de API
- Toast notifications para feedback visual
- Desabilita botões durante salvamento

### FormWizard.tsx
- Mesma lógica de criação e salvamento do FormWizardLicenciamento
- Compatível com o formulário genérico existente
- Mantém salvamento em rascunho local para outras etapas

### StepRevisao.tsx
- Carrega status de validação do backend ao montar
- Exibe indicadores visuais de:
  - Dados gerais validados (v_dados_gerais)
  - Número de localizações cadastradas (n_localizacoes)
- Desabilita botão "Finalizar" se validações pendentes
- Submete processo ao backend
- Exibe protocolo retornado pela API

## Mapeamento de Campos

### Etapa 1 → dados_gerais
```typescript
{
  porte: string,                // "Pequeno", "Médio", "Grande"
  potencial_poluidor: string    // "Baixo", "Médio", "Alto"
}
```

Os demais campos da Etapa 1 (área, CNAE, empregados, horários) continuam sendo salvos apenas em rascunho local até implementação futura.

## Variável de Ambiente

A API base URL é configurada via:
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

O interceptor do axios já adiciona automaticamente o token de autenticação em todos os requests.

## Toast Notifications

React-toastify já está configurado no App.tsx:
- Sucesso: `toast.success(mensagem)`
- Erro: `toast.error(mensagem)`
- Aviso: `toast.warning(mensagem)`
- Info: `toast.info(mensagem)`

## Fluxo de Funcionamento

1. **Montagem do Wizard**
   - Verifica se existe `processoId` no store
   - Se não existir, cria um novo processo via API
   - Salva o `processoId` no store (persistido no localStorage)

2. **Etapa 1 - Dados Gerais**
   - Ao clicar "Avançar" ou "Salvar Rascunho"
   - Envia `porte` e `potencial_poluidor` para API
   - Exibe toast de sucesso/erro
   - Avança para próxima etapa apenas se salvamento bem-sucedido

3. **Etapas 2-6**
   - Continuam salvando apenas em rascunho local
   - Aguardam implementação futura de endpoints específicos

4. **Revisão Final**
   - Carrega status de validação da API
   - Exibe indicadores visuais de pendências
   - Permite submissão apenas se validações OK
   - Retorna protocolo do processo

## Compatibilidade

✅ Login existente não foi modificado
✅ Endpoints Supabase continuam funcionando
✅ FormWizard e FormWizardLicenciamento operacionais
✅ Salvamento em rascunho local mantido
✅ Build do projeto sem erros
✅ TypeScript sem erros de tipo

## Próximos Passos (Futuro)

- Implementar endpoints para demais etapas (2-6)
- Adicionar persistência de localizações
- Implementar upload de documentos
- Adicionar validações de campos obrigatórios no frontend
- Implementar retry logic para falhas de rede
