# Testes de Integração - Workflow Engine

Testes automatizados E2E para validar o fluxo completo de um processo de licenciamento controlado pelo **motor de workflow BPMN**.

## 📋 O que é testado

### Fluxo Completo do Wizard

1. **Criar Nova Inscrição**
   - ✅ Clica em "Nova Solicitação"
   - ✅ Backend chama `POST /workflow/instances/start`
   - ✅ Resposta contém: `instance_id`, `current_step.path`
   - ✅ Redireciona para `/inscricao/participantes`

2. **Preencher Participantes → Próximo**
   - ✅ Adiciona participante REQUERENTE
   - ✅ Clica em "Próximo"
   - ✅ Backend chama `POST /workflow/instances/{id}/steps/{stepId}/complete`
   - ✅ Resposta contém: `nextStep.path`
   - ✅ Navega para `/inscricao/imovel`

3. **Preencher Imóvel → Próximo**
   - ✅ Seleciona ou pula imóvel
   - ✅ Clica em "Próximo"
   - ✅ Backend chama `completeStep`
   - ✅ Navega para `/inscricao/empreendimento`

4. **Preencher Empreendimento → Próximo**
   - ✅ Preenche dados básicos
   - ✅ Clica em "Próximo"
   - ✅ Backend chama `completeStep`
   - ✅ Navega para `/inscricao/formulario`

5. **Completar Formulário → Finalizar**
   - ✅ Navega pelos 5 steps internos do FormWizard
   - ✅ Clica em "Finalizar"
   - ✅ Backend chama `completeStep` (ou `completeSubprocessStep` se tiver subprocess)
   - ✅ Navega para `/inscricao/documentacao`

6. **Completar Documentação → Próximo**
   - ✅ Clica em "Próximo"
   - ✅ Backend chama `completeStep`
   - ✅ Navega para `/inscricao/revisao`

7. **Finalizar Revisão**
   - ✅ Clica em "Finalizar"
   - ✅ Backend chama `completeStep`
   - ✅ Resposta: `status='FINISHED'`, `nextStep=null`
   - ✅ Workflow completo

8. **Validar Banco de Dados**
   - ✅ Conecta no Supabase
   - ✅ Verifica `workflow.process_instance` com `status='FINISHED'`
   - ✅ Verifica `workflow.process_instance_step` com 6 registros
   - ✅ Todos os steps marcados como completados

## 🚀 Como Executar

### 1. Instalar Dependências

```bash
cd tests
pip install -r requirements.txt
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` em `tests/.env`:

```env
# URL da aplicação frontend
APP_URL=http://localhost:5173

# URL da API backend
API_URL=http://localhost:3000/api/v1

# Credenciais de teste
TEST_USER_EMAIL=teste@example.com
TEST_USER_PASSWORD=senha123

# Supabase (para validação de banco)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Executar Testes

**Modo padrão (headless):**
```bash
python run_workflow_tests.py
```

**Modo visual (mostra o navegador):**
```bash
python run_workflow_tests.py --show
```

**Executar diretamente:**
```bash
python test_workflow_engine_integration.py
```

## 📊 Saída Esperada

```
╔═══════════════════════════════════════════════════════════╗
║   TESTES DE INTEGRAÇÃO - WORKFLOW ENGINE (BPMN MOTOR)    ║
╚═══════════════════════════════════════════════════════════╝

Branch: sp4-task3276-implementacao-motor-bmpn
Data: 2025-11-11
URL: http://localhost:5173

🔧 Configurando WebDriver...
✅ WebDriver configurado

🔐 Verificando autenticação...
✅ Já autenticado

TEST 1: Criar Nova Inscrição → Chama /workflow/instances/start
  → Clicando em Nova Solicitação...
  → URL atual: http://localhost:5173/inscricao/participantes
  → Página Participantes carregada
  ✅ Workflow iniciado e redirecionado para Participantes

TEST 2: Participantes → Próximo → completeStep → Imóvel
  → Adicionando participante REQUERENTE...
  ✅ Participante adicionado
  → Clicando em Próximo...
  → URL atual: http://localhost:5173/inscricao/imovel
  ✅ completeStep chamado e navegado para Imóvel

... (continua para todos os testes)

TEST 8: Banco de Dados → Workflow FINISHED + 6 Steps
  → Conectando ao Supabase...
  → Buscando workflow_instance...
  → Workflow Instance ID: wf-inst-12345
  → Status: FINISHED
  → Buscando workflow_instance_steps...
  → Total de steps: 6
    - PARTICIPANTES: completed
    - IMOVEL: completed
    - EMPREENDIMENTO: completed
    - FORMULARIO: completed
    - DOCUMENTACAO: completed
    - REVISAO: completed
  ✅ Banco de dados validado: FINISHED + 6 steps

============================================================
RESUMO DOS TESTES - WORKFLOW ENGINE
============================================================

✅ PASSED   | Criar Nova Inscrição → Chama /workflow/instances/start
   └─ Workflow start chamado e redirecionamento OK
✅ PASSED   | Participantes → Próximo → completeStep → Imóvel
   └─ completeStep → nextStep.path OK
✅ PASSED   | Imóvel → Próximo → completeStep → Empreendimento
   └─ Navegação para Empreendimento OK
✅ PASSED   | Empreendimento → Próximo → completeStep → Formulário
   └─ Navegação para Formulário OK
✅ PASSED   | Formulário → Completar → completeStep → Documentação
   └─ Navegação para Documentação OK
✅ PASSED   | Documentação → Próximo → completeStep → Revisão
   └─ Navegação para Revisão OK
✅ PASSED   | Revisão → Finalizar → status=FINISHED
   └─ Processo finalizado com sucesso
✅ PASSED   | Banco de Dados → Workflow FINISHED + 6 Steps
   └─ Workflow wf-inst-12345 com status FINISHED e 6 steps

Total: 8 testes
Passed: 8
Failed: 0
Skipped: 0

🎉 TODOS OS TESTES PASSARAM!
Workflow Engine está funcionando corretamente.

============================================================
```

## ⚠️ Notas Importantes

### Status Esperado vs Atual

**Atual (Branch: sp4-task3276-implementacao-motor-bmpn):**
- ✅ Frontend implementado (API client, store, context, pages migradas)
- ✅ Subprocess support preparado (FormularioPage)
- ❌ **Backend NÃO implementado ainda**

**Resultado dos Testes (ANTES do backend):**
- Testes 1-7: Provavelmente **FAILED** (endpoints não existem)
- Teste 8: **SKIPPED** (tabelas não existem)

**Resultado Esperado (DEPOIS do backend):**
- Testes 1-7: **PASSED** ✅
- Teste 8: **PASSED** ✅

### Backend Pendente

Para os testes passarem, você precisa implementar no backend:

#### 1. Tabelas Supabase

```sql
-- workflow.process_instance
CREATE TABLE workflow.process_instance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_code VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL, -- IN_PROGRESS, FINISHED, CANCELLED
  current_step_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- workflow.process_instance_step
CREATE TABLE workflow.process_instance_step (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instance_id UUID REFERENCES workflow.process_instance(id),
  step_id VARCHAR(50) NOT NULL,
  step_key VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL, -- pending, completed
  payload JSONB,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. Endpoints

- `POST /workflow/instances/start`
- `GET /workflow/instances/{id}/current-step`
- `POST /workflow/instances/{id}/steps/{stepId}/complete`
- `GET /workflow/templates/{code}/steps`
- `GET /workflow/instances/{id}/step-history`
- `GET /workflow/instances/{id}/steps/{stepId}/subprocess` (opcional)
- `POST /workflow/instances/{subprocessId}/steps/{stepId}/complete` (opcional)

Veja especificação completa em: `Docs/INTEGRACAO_WORKFLOW_ENGINE.md`

## 🐛 Troubleshooting

### "ChromeDriver not found"
```bash
pip install --upgrade webdriver-manager
```

### "Connection refused" (frontend não rodando)
```bash
# Terminal 1
npm run dev
```

### "API errors" (backend não implementado)
- **Normal!** Backend ainda não está implementado.
- Testes vão falhar até que você implemente os endpoints.
- Use os testes como **especificação** do que implementar.

### "Supabase connection failed"
- Verifique `SUPABASE_URL` e `SUPABASE_KEY` no `.env`
- Teste 8 será SKIPPED se credenciais não estiverem configuradas

## 🎯 Próximos Passos

1. **Implementar Backend:**
   - Criar tabelas no Supabase
   - Implementar 7 endpoints de workflow
   - Implementar lógica de transição de states

2. **Executar Testes:**
   ```bash
   python run_workflow_tests.py --show
   ```

3. **Verificar Resultados:**
   - Todos os 8 testes devem passar ✅
   - Banco de dados deve ter registros corretos

4. **Migrar Páginas Restantes:**
   - DocumentacaoPage.tsx (migrar para workflow engine)
   - RevisaoPage.tsx (migrar para workflow engine)

5. **Remover Código Legado:**
   - Deprecated `setCurrentStep(1,2,3...)` calls
   - Manual step control

## 📚 Documentação

- **Integração Workflow Engine:** `Docs/INTEGRACAO_WORKFLOW_ENGINE.md`
- **Especificação de Endpoints:** Mesma doc, seção "Endpoints do Backend"
- **Arquitetura:** Branch `sp4-task3276-implementacao-motor-bmpn`

## ✨ Benefícios dos Testes

1. **Especificação Viva:** Testes documentam o comportamento esperado
2. **Regressão:** Detecta bugs ao alterar código
3. **Confiança:** Deploy seguro sabendo que fluxo funciona
4. **CI/CD Ready:** Pode rodar em pipeline automatizado
5. **Documentação Visual:** Mostra o fluxo completo funcionando

---

**Autor:** GitHub Copilot  
**Branch:** sp4-task3276-implementacao-motor-bmpn  
**Data:** 2025-11-11
