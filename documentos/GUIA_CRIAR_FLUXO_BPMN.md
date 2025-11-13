# Guia Completo: Criar Novo Fluxo com Nosso Motor BPMN

> **Objetivo:** Usar o Workflow Engine já implementado no projeto para criar novos fluxos de processos sem programar lógica de navegação.

## 📋 Índice
1. [Visão Geral do Motor](#visão-geral-do-motor)
2. [Criar Novo Fluxo](#criar-novo-fluxo)
3. [Adicionar Páginas ao Fluxo](#adicionar-páginas-ao-fluxo)
4. [Configurar Navegação Automática](#configurar-navegação-automática)
5. [Testar o Fluxo](#testar-o-fluxo)
6. [Publicar](#publicar)
7. [Troubleshooting](#troubleshooting)

---

## 1. Visão Geral do Motor

### 🎯 O Que é o Motor BPMN

Nosso sistema já possui um **Workflow Engine** que:
- ✅ Controla navegação entre steps automaticamente
- ✅ Salva progresso no banco de dados
- ✅ Permite voltar/avançar steps
- ✅ Gerencia validações
- ✅ Persiste dados em cada etapa

### 📦 Componentes Principais

```
Frontend:
├── InscricaoWizardMotor.tsx          # Wrapper principal do motor
├── InscricaoStepperMotor.tsx         # Barra de progresso
├── pages/inscricao/workflow/         # Páginas de cada step
│   ├── ParticipantesWorkflowPageMotor.tsx
│   ├── ImovelWorkflowPageMotor.tsx
│   └── EmpreendimentoWorkflowPageMotor.tsx
└── services/workflowApi.ts           # API do motor

Backend:
├── routes/workflowRoutes.js          # Endpoints do motor
├── services/workflowService.js       # Lógica do motor
└── config/workflowDefinitions.js     # Definição dos fluxos
```

### 🔄 Como Funciona

```
1. Usuario clica "Novo Processo Motor"
   ↓
2. Frontend chama POST /workflow/instances/start
   ↓
3. Backend cria workflow_instance no banco
   ↓
4. Backend retorna primeiro step: "participantes"
   ↓
5. Frontend renderiza ParticipantesWorkflowPageMotor
   ↓
6. Usuario preenche e clica "Próximo"
   ↓
7. Frontend chama POST /workflow/instances/{id}/steps/{stepId}/complete
   ↓
8. Backend salva dados e retorna próximo step: "imovel"
   ↓
9. Frontend renderiza ImovelWorkflowPageMotor
   ↓
... repete até finalizar
```

---

## 2. Criar Novo Fluxo

### Passo 1: Definir Fluxo no Backend

Edite: `backend/config/workflowDefinitions.js`

```javascript
// Adicione seu novo fluxo
const WORKFLOW_DEFINITIONS = {
  // Fluxo existente
  licenciamento_ambiental: {
    name: 'Licenciamento Ambiental',
    steps: [
      { id: 'participantes', name: 'Participantes', order: 1 },
      { id: 'imovel', name: 'Imóvel', order: 2 },
      { id: 'empreendimento', name: 'Empreendimento', order: 3 },
      { id: 'formulario', name: 'Formulário', order: 4 },
      { id: 'documentacao', name: 'Documentação', order: 5 },
      { id: 'revisao', name: 'Revisão', order: 6 }
    ]
  },

  // ⬇️ SEU NOVO FLUXO
  licenca_operacao: {
    name: 'Licença de Operação',
    steps: [
      { id: 'dados_empresa', name: 'Dados da Empresa', order: 1 },
      { id: 'atividades', name: 'Atividades Operacionais', order: 2 },
      { id: 'equipamentos', name: 'Equipamentos', order: 3 },
      { id: 'controle_ambiental', name: 'Controle Ambiental', order: 4 },
      { id: 'monitoramento', name: 'Monitoramento', order: 5 },
      { id: 'conclusao', name: 'Conclusão', order: 6 }
    ]
  }
};

module.exports = WORKFLOW_DEFINITIONS;
```

### Passo 2: Criar Endpoint para o Novo Fluxo

Edite: `backend/routes/workflowRoutes.js`

```javascript
// Já existe o endpoint genérico, só precisa chamar com o workflowType correto
router.post('/instances/start', async (req, res) => {
  const { processId, licenseType, workflowType = 'licenciamento_ambiental' } = req.body;
  // ⬆️ workflowType permite escolher qual fluxo usar
  
  const result = await workflowService.startWorkflow(processId, workflowType);
  res.json(result);
});
```

### Passo 3: Atualizar Service (se necessário)

Edite: `backend/services/workflowService.js`

```javascript
class WorkflowService {
  async startWorkflow(processId, workflowType = 'licenciamento_ambiental') {
    const definition = WORKFLOW_DEFINITIONS[workflowType];
    
    if (!definition) {
      throw new Error(`Workflow type '${workflowType}' não encontrado`);
    }

    // Criar instância no banco
    const instance = await db.workflow_instances.create({
      process_id: processId,
      workflow_type: workflowType,
      status: 'active',
      current_step_order: 1
    });

    // Retornar primeiro step
    const firstStep = definition.steps[0];
    return {
      instanceId: instance.id,
      currentStep: {
        id: firstStep.id,
        key: firstStep.id,
        label: firstStep.name,
        path: `/inscricao/${firstStep.id}`
      }
    };
  }
}
```

---

## 3. Adicionar Páginas ao Fluxo

### Passo 1: Criar Componentes das Páginas

Para cada step definido, crie um componente em:
```
src/pages/inscricao/workflow/
```

**Exemplo:** `DadosEmpresaWorkflowPageMotor.tsx`

```typescript
import { useState } from 'react';
import { useInscricaoStore } from '../../../lib/store/inscricao';
import { completeStep } from '../../../services/workflowApi';
import { toast } from 'react-toastify';

export default function DadosEmpresaWorkflowPageMotor() {
  const { 
    workflowInstanceId, 
    currentStepId, 
    processId 
  } = useInscricaoStore();

  const [formData, setFormData] = useState({
    razao_social: '',
    cnpj: '',
    inscricao_estadual: '',
    endereco: ''
  });

  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    // Validação
    if (!formData.razao_social || !formData.cnpj) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!workflowInstanceId || !currentStepId) {
      toast.error('Workflow não inicializado');
      return;
    }

    setLoading(true);
    try {
      // Salvar dados no banco via API
      await fetch(`/api/v1/processos/${processId}/dados-empresa`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      // Avançar step no workflow
      await completeStep(workflowInstanceId, currentStepId, {
        dados_empresa: formData
      });

      toast.success('Dados salvos com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar dados');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Dados da Empresa
        </h2>
        <p className="text-gray-600 mt-1">
          Preencha as informações da empresa solicitante
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Razão Social *
          </label>
          <input
            type="text"
            value={formData.razao_social}
            onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CNPJ *
          </label>
          <input
            type="text"
            value={formData.cnpj}
            onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Inscrição Estadual
          </label>
          <input
            type="text"
            value={formData.inscricao_estadual}
            onChange={(e) => setFormData({ ...formData, inscricao_estadual: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Endereço
          </label>
          <textarea
            value={formData.endereco}
            onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={handleNext}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Salvando...' : 'Próximo'}
        </button>
      </div>
    </div>
  );
}
```

**Repita para cada step:**
- `AtividadesWorkflowPageMotor.tsx`
- `EquipamentosWorkflowPageMotor.tsx`
- `ControleAmbientalWorkflowPageMotor.tsx`
- `MonitoramentoWorkflowPageMotor.tsx`
- `ConclusaoWorkflowPageMotor.tsx`

### Passo 2: Registrar Páginas no Wizard

Edite: `src/components/InscricaoWizardMotor.tsx`

```typescript
// Imports das novas páginas
import DadosEmpresaWorkflowPageMotor from '../pages/inscricao/workflow/DadosEmpresaWorkflowPageMotor';
import AtividadesWorkflowPageMotor from '../pages/inscricao/workflow/AtividadesWorkflowPageMotor';
import EquipamentosWorkflowPageMotor from '../pages/inscricao/workflow/EquipamentosWorkflowPageMotor';
import ControleAmbientalWorkflowPageMotor from '../pages/inscricao/workflow/ControleAmbientalWorkflowPageMotor';
import MonitoramentoWorkflowPageMotor from '../pages/inscricao/workflow/MonitoramentoWorkflowPageMotor';
import ConclusaoWorkflowPageMotor from '../pages/inscricao/workflow/ConclusaoWorkflowPageMotor';

// No método renderCurrentStep()
const renderCurrentStep = () => {
  if (!currentStep || !currentProcessoId) return null;

  const stepKey = currentStep.key?.toLowerCase();

  switch (stepKey) {
    // Steps existentes
    case 'participantes':
      return <ParticipantesWorkflowPageMotor />;
    case 'imovel':
      return <ImovelWorkflowPageMotor />;
    case 'empreendimento':
      return (
        <EnterpriseProvider>
          <EmpreendimentoWorkflowPageMotor />
        </EnterpriseProvider>
      );
    case 'formulario':
      return <FormularioWorkflowPageMotor />;

    // ⬇️ NOVOS STEPS
    case 'dados_empresa':
      return <DadosEmpresaWorkflowPageMotor />;
    case 'atividades':
      return <AtividadesWorkflowPageMotor />;
    case 'equipamentos':
      return <EquipamentosWorkflowPageMotor />;
    case 'controle_ambiental':
      return <ControleAmbientalWorkflowPageMotor />;
    case 'monitoramento':
      return <MonitoramentoWorkflowPageMotor />;
    case 'conclusao':
      return <ConclusaoWorkflowPageMotor />;

    default:
      return (
        <div className="p-8 text-center">
          <p className="text-red-600">
            ⚠️ Step não implementado: <code>{stepKey}</code>
          </p>
        </div>
      );
  }
};
```

### Passo 3: Atualizar Stepper (Barra de Progresso)

Edite: `src/components/InscricaoStepperMotor.tsx`

```typescript
const STEPS = [
  { number: 1, title: 'Dados da Empresa', key: 'dados_empresa' },
  { number: 2, title: 'Atividades', key: 'atividades' },
  { number: 3, title: 'Equipamentos', key: 'equipamentos' },
  { number: 4, title: 'Controle Ambiental', key: 'controle_ambiental' },
  { number: 5, title: 'Monitoramento', key: 'monitoramento' },
  { number: 6, title: 'Conclusão', key: 'conclusao' }
];
```

---

## 4. Configurar Navegação Automática

### O Motor Já Faz Isso! ✅

Você **NÃO precisa** programar a navegação. O motor cuida de:

1. **Avançar para próximo step**
   ```typescript
   // Basta chamar no botão "Próximo"
   await completeStep(workflowInstanceId, currentStepId, dados);
   // O backend retorna automaticamente o próximo step
   ```

2. **Atualizar UI automaticamente**
   ```typescript
   // InscricaoWizardMotor.tsx já está configurado para:
   useEffect(() => {
     if (response.nextStep) {
       setCurrentStep(response.nextStep);  // ⬅️ UI atualiza sozinha
     }
   }, []);
   ```

3. **Salvar progresso no banco**
   ```javascript
   // Backend salva automaticamente em workflow_steps
   await db.workflow_steps.create({
     instance_id,
     step_id,
     step_data: data,
     completed_at: new Date()
   });
   ```

### Como Personalizar Navegação

Se precisar de lógica condicional (ex: pular steps):

**Backend:** `workflowService.js`
```javascript
async completeStep(instanceId, stepId, data) {
  // Lógica condicional
  if (data.tipo_licenca === 'simplificada') {
    // Pula steps 3 e 4
    return this.goToStep(instanceId, 5);
  }
  
  // Navegação normal
  return this.nextStep(instanceId);
}
```

---

## 5. Testar o Fluxo

### Teste Manual Completo

1. **Inicie o backend**
   ```bash
   cd backend
   npm run dev
   ```

2. **Inicie o frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Acesse o sistema**
   ```
   http://localhost:5173
   ```

4. **Navegue para o novo fluxo**
   - Login
   - Menu → "Processos Motor"
   - Clique "Novo Processo Motor"

5. **Teste cada step**
   - [ ] Dados da Empresa → preencher → clicar "Próximo"
   - [ ] Atividades → preencher → clicar "Próximo"
   - [ ] Equipamentos → preencher → clicar "Próximo"
   - [ ] Controle Ambiental → preencher → clicar "Próximo"
   - [ ] Monitoramento → preencher → clicar "Próximo"
   - [ ] Conclusão → clicar "Finalizar"

6. **Verifique no banco de dados**
   ```sql
   -- Ver instância criada
   SELECT * FROM workflow_instances 
   WHERE workflow_type = 'licenca_operacao'
   ORDER BY created_at DESC LIMIT 1;

   -- Ver steps completados
   SELECT ws.*, wd.name as step_name
   FROM workflow_steps ws
   JOIN workflow_definitions wd ON ws.step_id = wd.id
   WHERE ws.instance_id = 'SEU_INSTANCE_ID'
   ORDER BY ws.created_at;

   -- Ver dados salvos
   SELECT * FROM processos_licenciamento 
   WHERE id = 'SEU_PROCESSO_ID';
   ```

### Teste com Navegação

1. **Avançar e voltar**
   ```typescript
   // Botão Voltar (se implementado)
   await workflowService.previousStep(instanceId);
   ```

2. **Retomar fluxo interrompido**
   ```typescript
   // Ao abrir processo existente
   const instance = await workflowService.getInstance(instanceId);
   // Motor retorna step atual automaticamente
   ```

3. **Validar dados persistidos**
   ```typescript
   // Ao voltar para step anterior, dados devem estar salvos
   const savedData = await fetch(`/api/v1/processos/${processId}/dados-empresa`);
   ```

### Script de Teste Automatizado

`tests/test_novo_fluxo.py`

```python
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_licenca_operacao_completo():
    """Testa fluxo completo de Licença de Operação"""
    driver = webdriver.Chrome()
    wait = WebDriverWait(driver, 10)
    
    try:
        # 1. Login
        driver.get('http://localhost:5173/login')
        driver.find_element(By.ID, 'email').send_keys('admin@test.com')
        driver.find_element(By.ID, 'password').send_keys('senha123')
        driver.find_element(By.XPATH, '//button[text()="Entrar"]').click()
        time.sleep(2)
        
        # 2. Ir para Processos Motor
        driver.find_element(By.XPATH, '//a[text()="Processos Motor"]').click()
        time.sleep(1)
        
        # 3. Criar novo processo
        driver.find_element(By.XPATH, '//button[text()="Novo Processo Motor"]').click()
        time.sleep(2)
        
        # 4. Step 1: Dados da Empresa
        wait.until(EC.presence_of_element_located((By.XPATH, '//h2[text()="Dados da Empresa"]')))
        driver.find_element(By.NAME, 'razao_social').send_keys('Empresa Teste LTDA')
        driver.find_element(By.NAME, 'cnpj').send_keys('12.345.678/0001-90')
        driver.find_element(By.XPATH, '//button[text()="Próximo"]').click()
        time.sleep(2)
        
        # 5. Step 2: Atividades
        wait.until(EC.presence_of_element_located((By.XPATH, '//h2[text()="Atividades Operacionais"]')))
        # ... preencher campos
        driver.find_element(By.XPATH, '//button[text()="Próximo"]').click()
        time.sleep(2)
        
        # 6. Continuar até conclusão...
        
        # 7. Verificar mensagem de sucesso
        wait.until(EC.presence_of_element_located((By.XPATH, '//*[text()="Processo concluído com sucesso"]')))
        
        print("✅ Teste do novo fluxo passou!")
        
    except Exception as e:
        print(f"❌ Erro no teste: {str(e)}")
        driver.save_screenshot('erro_teste_novo_fluxo.png')
        raise
        
    finally:
        driver.quit()

if __name__ == '__main__':
    test_licenca_operacao_completo()
```

Execute:
```bash
cd tests
python test_novo_fluxo.py
```

---

## 6. Publicar

### Checklist Pré-Publicação

- [ ] Todos os steps implementados
- [ ] Validações funcionando
- [ ] Dados salvando no banco corretamente
- [ ] Navegação avançar/voltar funcionando
- [ ] Testes manuais passando
- [ ] Testes automatizados passando
- [ ] Logs do backend sem erros
- [ ] Performance aceitável (< 2s por step)
- [ ] Documentação atualizada

### Deploy

```bash
# 1. Commit das alterações
git add .
git commit -m "feat: adicionar fluxo Licença de Operação ao motor BPMN"

# 2. Push para repositório
git push origin sua-branch

# 3. Merge para main (após review)
git checkout main
git merge sua-branch
git push origin main

# 4. Deploy backend (exemplo Heroku)
cd backend
git push heroku main

# 5. Deploy frontend (exemplo Netlify)
cd frontend
npm run build
netlify deploy --prod

# 6. Verificar em produção
curl https://api.seudominio.com/api/v1/workflow/definitions
```

---

## 7. Troubleshooting

### 2.1 Criar o Diagrama BPMN

1. **Abra o Camunda Modeler**

2. **Crie um novo diagrama BPMN**
   - File → New File → BPMN Diagram

3. **Configure o processo**
   - Clique no canvas vazio
   - No painel Properties (direita):
     - **Id**: `licenciamento_ambiental_v1` (único, sem espaços)
     - **Name**: `Processo de Licenciamento Ambiental`
     - **Executable**: ✅ (marcar)

### 2.2 Adicionar Elementos ao Fluxo

#### Start Event (Círculo verde)
```
Properties:
- Id: start_process
- Name: Iniciar Licenciamento
```

#### User Tasks (Retângulos com ícone de pessoa)
```
Task 1: Participantes
- Id: task_participantes
- Name: Cadastro de Participantes
- Form Key: participantes_form (opcional)

Task 2: Dados do Imóvel
- Id: task_imovel
- Name: Dados do Imóvel
- Form Key: imovel_form

Task 3: Dados do Empreendimento
- Id: task_empreendimento
- Name: Dados do Empreendimento
- Form Key: empreendimento_form

Task 4: Formulário Técnico
- Id: task_formulario
- Name: Formulário Técnico
- Form Key: formulario_form

Task 5: Documentação
- Id: task_documentacao
- Name: Upload de Documentos
- Form Key: documentacao_form

Task 6: Revisão
- Id: task_revisao
- Name: Revisão Final
- Form Key: revisao_form
```

#### End Event (Círculo vermelho com borda grossa)
```
Properties:
- Id: end_process
- Name: Processo Concluído
```

### 2.3 Conectar os Elementos
- Use Sequence Flows (setas) para conectar os elementos na ordem:
  ```
  Start → Participantes → Imóvel → Empreendimento → Formulário → Documentação → Revisão → End
  ```

### 2.4 Salvar o Arquivo BPMN
```
Salvar em: backend/workflows/licenciamento_ambiental_v1.bpmn
```

**Exemplo de arquivo BPMN completo:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
                  id="Definitions_1" 
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="licenciamento_ambiental_v1" name="Processo de Licenciamento Ambiental" isExecutable="true">
    <bpmn:startEvent id="start_process" name="Iniciar Licenciamento">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    
    <bpmn:userTask id="task_participantes" name="Cadastro de Participantes">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:userTask>
    
    <bpmn:userTask id="task_imovel" name="Dados do Imóvel">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
    </bpmn:userTask>
    
    <bpmn:userTask id="task_empreendimento" name="Dados do Empreendimento">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
    </bpmn:userTask>
    
    <bpmn:userTask id="task_formulario" name="Formulário Técnico">
      <bpmn:incoming>Flow_4</bpmn:incoming>
      <bpmn:outgoing>Flow_5</bpmn:outgoing>
    </bpmn:userTask>
    
    <bpmn:userTask id="task_documentacao" name="Upload de Documentos">
      <bpmn:incoming>Flow_5</bpmn:incoming>
      <bpmn:outgoing>Flow_6</bpmn:outgoing>
    </bpmn:userTask>
    
    <bpmn:userTask id="task_revisao" name="Revisão Final">
      <bpmn:incoming>Flow_6</bpmn:incoming>
      <bpmn:outgoing>Flow_7</bpmn:outgoing>
    </bpmn:userTask>
    
    <bpmn:endEvent id="end_process" name="Processo Concluído">
      <bpmn:incoming>Flow_7</bpmn:incoming>
    </bpmn:endEvent>
    
    <bpmn:sequenceFlow id="Flow_1" sourceRef="start_process" targetRef="task_participantes" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="task_participantes" targetRef="task_imovel" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="task_imovel" targetRef="task_empreendimento" />
    <bpmn:sequenceFlow id="Flow_4" sourceRef="task_empreendimento" targetRef="task_formulario" />
    <bpmn:sequenceFlow id="Flow_5" sourceRef="task_formulario" targetRef="task_documentacao" />
    <bpmn:sequenceFlow id="Flow_6" sourceRef="task_documentacao" targetRef="task_revisao" />
    <bpmn:sequenceFlow id="Flow_7" sourceRef="task_revisao" targetRef="end_process" />
  </bpmn:process>
</bpmn:definitions>
```

---

## 3. Configuração no Backend

### 3.1 Copiar o Arquivo BPMN

```bash
# Coloque o arquivo na pasta workflows do backend
cp licenciamento_ambiental_v1.bpmn backend/workflows/
```

### 3.2 Registrar o Fluxo no WorkflowService

Edite: `backend/services/workflowService.js`

```javascript
class WorkflowService {
  constructor() {
    this.engine = new BpmnEngine({
      name: 'workflow-engine',
      source: fs.readFileSync(
        path.join(__dirname, '../workflows/licenciamento_ambiental_v1.bpmn'), // ⬅️ Seu arquivo
        'utf8'
      )
    });
  }
  
  // ... resto do código
}
```

### 3.3 Mapear Steps no Backend

Edite: `backend/services/workflowService.js`

Adicione o mapeamento de IDs para labels:

```javascript
const STEP_LABELS = {
  'task_participantes': {
    label: 'Participantes',
    key: 'participantes',
    order: 1
  },
  'task_imovel': {
    label: 'Imóvel',
    key: 'imovel',
    order: 2
  },
  'task_empreendimento': {
    label: 'Empreendimento',
    key: 'empreendimento',
    order: 3
  },
  'task_formulario': {
    label: 'Formulário',
    key: 'formulario',
    order: 4
  },
  'task_documentacao': {
    label: 'Documentação',
    key: 'documentacao',
    order: 5
  },
  'task_revisao': {
    label: 'Revisão',
    key: 'revisao',
    order: 6
  }
};
```

### 3.4 Testar o Backend

```bash
# Reinicie o servidor
cd backend
npm start

# Teste a API
curl -X POST http://localhost:3000/api/v1/workflow/instances/start \
  -H "Content-Type: application/json" \
  -d '{"processId": "test-123", "licenseType": "LP"}'
```

**Resposta esperada:**
```json
{
  "instanceId": "uuid-gerado",
  "currentStep": {
    "id": "task_participantes",
    "key": "participantes",
    "label": "Participantes",
    "path": "/inscricao/participantes"
  }
}
```

---

## 4. Integração com Frontend

### 4.1 Criar Páginas Motor (se ainda não existem)

Para cada step do fluxo, crie um componente em:
```
src/pages/inscricao/workflow/
```

Exemplo: `ParticipantesWorkflowPageMotor.tsx`

```typescript
import { useInscricaoStore } from '../../../lib/store/inscricao';
import { completeStep } from '../../../services/workflowApi';
import { toast } from 'react-toastify';

export default function ParticipantesWorkflowPageMotor() {
  const { workflowInstanceId, currentStepId, processId } = useInscricaoStore();
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!workflowInstanceId || !currentStepId) return;
    
    setLoading(true);
    try {
      // Validar dados aqui
      const stepData = {
        participantes: [/* dados */]
      };

      // Completar step no backend
      await completeStep(workflowInstanceId, currentStepId, stepData);
      toast.success('Participantes salvos!');
    } catch (error) {
      toast.error('Erro ao salvar participantes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2>Cadastro de Participantes</h2>
      {/* Formulário aqui */}
      <button onClick={handleNext} disabled={loading}>
        Próximo
      </button>
    </div>
  );
}
```

### 4.2 Registrar Páginas no InscricaoWizardMotor

Edite: `src/components/InscricaoWizardMotor.tsx`

```typescript
const renderCurrentStep = () => {
  const stepKey = currentStep.key?.toLowerCase();

  switch (stepKey) {
    case 'participantes':
      return <ParticipantesWorkflowPageMotor />;
    case 'imovel':
      return <ImovelWorkflowPageMotor />;
    case 'empreendimento':
      return (
        <EnterpriseProvider>
          <EmpreendimentoWorkflowPageMotor />
        </EnterpriseProvider>
      );
    case 'formulario':
      return <FormularioWorkflowPageMotor />;
    case 'documentacao':
      return <DocumentacaoWorkflowPageMotor />;
    case 'revisao':
      return <RevisaoWorkflowPageMotor />;
    default:
      return <div>Step não implementado: {stepKey}</div>;
  }
};
```

### 4.3 Atualizar Stepper (opcional)

Se quiser que o stepper mostre os steps corretos:

Edite: `src/components/InscricaoStepperMotor.tsx`

```typescript
const STEPS = [
  { number: 1, title: 'Participantes', key: 'participantes' },
  { number: 2, title: 'Imóvel', key: 'imovel' },
  { number: 3, title: 'Empreendimento', key: 'empreendimento' },
  { number: 4, title: 'Formulário', key: 'formulario' },
  { number: 5, title: 'Documentação', key: 'documentacao' },
  { number: 6, title: 'Revisão', key: 'revisao' }
];
```

---

## 5. Testes e Validação

### 5.1 Teste Manual Completo

1. **Acesse o sistema**
   ```
   http://localhost:5173
   ```

2. **Vá para Processos Motor**
   - Menu lateral → "Processos Motor"
   - Clique em "Novo Processo Motor"

3. **Preencha cada step**
   - Participantes → clicar "Próximo"
   - Imóvel → clicar "Próximo"
   - Empreendimento → clicar "Próximo"
   - Formulário → clicar "Próximo"
   - Documentação → clicar "Próximo"
   - Revisão → clicar "Concluir"

4. **Verifique no banco de dados**
   ```sql
   -- Verificar workflow_instances
   SELECT * FROM workflow_instances ORDER BY created_at DESC LIMIT 1;

   -- Verificar workflow_steps
   SELECT * FROM workflow_steps WHERE instance_id = 'seu-instance-id';

   -- Verificar dados do processo
   SELECT * FROM processos_licenciamento WHERE id = 'seu-processo-id';
   ```

### 5.2 Teste Automatizado (Python + Selenium)

Crie: `tests/test_workflow_motor_complete.py`

```python
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_workflow_completo():
    driver = webdriver.Chrome()
    wait = WebDriverWait(driver, 10)
    
    try:
        # 1. Login
        driver.get('http://localhost:5173/login')
        driver.find_element(By.ID, 'email').send_keys('admin@test.com')
        driver.find_element(By.ID, 'password').send_keys('senha123')
        driver.find_element(By.XPATH, '//button[contains(text(), "Entrar")]').click()
        
        # 2. Ir para Processos Motor
        wait.until(EC.element_to_be_clickable((By.XPATH, '//a[contains(text(), "Processos Motor")]'))).click()
        
        # 3. Criar novo processo
        wait.until(EC.element_to_be_clickable((By.XPATH, '//button[contains(text(), "Novo Processo Motor")]'))).click()
        
        # 4. Preencher Participantes
        wait.until(EC.presence_of_element_located((By.XPATH, '//h2[contains(text(), "Participantes")]')))
        # ... preencher campos
        driver.find_element(By.XPATH, '//button[contains(text(), "Próximo")]').click()
        
        # 5. Preencher Imóvel
        wait.until(EC.presence_of_element_located((By.XPATH, '//h2[contains(text(), "Imóvel")]')))
        # ... preencher campos
        driver.find_element(By.XPATH, '//button[contains(text(), "Próximo")]').click()
        
        # 6. Continuar até o fim...
        
        # 7. Verificar mensagem de sucesso
        wait.until(EC.presence_of_element_located((By.XPATH, '//*[contains(text(), "Processo concluído")]')))
        
        print("✅ Teste completo passou!")
        
    finally:
        driver.quit()

if __name__ == '__main__':
    test_workflow_completo()
```

Execute:
```bash
cd tests
python test_workflow_motor_complete.py
```

---

## 6. Publicação

### 6.1 Checklist Pré-Publicação

- [ ] Fluxo BPMN validado no Camunda Modeler
- [ ] Backend registra o fluxo corretamente
- [ ] Todas as páginas frontend implementadas
- [ ] Testes manuais passando
- [ ] Testes automatizados passando
- [ ] Dados sendo salvos no banco corretamente
- [ ] Logs do backend sem erros
- [ ] Performance aceitável (< 2s por step)

### 6.2 Deploy do Backend

```bash
# 1. Commit do arquivo BPMN
git add backend/workflows/licenciamento_ambiental_v1.bpmn
git commit -m "feat: adicionar fluxo BPMN de licenciamento ambiental v1"

# 2. Push para produção
git push origin main

# 3. Deploy (exemplo Heroku)
heroku git:remote -a seu-app-backend
git push heroku main

# 4. Verificar logs
heroku logs --tail -a seu-app-backend
```

### 6.3 Deploy do Frontend

```bash
# 1. Build de produção
npm run build

# 2. Testar build local
npm run preview

# 3. Deploy (exemplo Netlify)
netlify deploy --prod

# 4. Verificar site
curl https://seu-app.netlify.app
```

### 6.4 Verificação Pós-Deploy

```bash
# Testar API de produção
curl -X POST https://api.seudominio.com/api/v1/workflow/instances/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"processId": "prod-test", "licenseType": "LP"}'
```

---

## 7. Troubleshooting

### Problema: "Workflow não inicia"

**Sintomas:**
```
POST /workflow/instances/start → 500 Internal Server Error
```

**Soluções:**
1. Verificar se o arquivo `.bpmn` existe no caminho correto
   ```bash
   ls -la backend/workflows/*.bpmn
   ```

2. Verificar logs do backend
   ```bash
   # Local
   npm run dev

   # Produção
   heroku logs --tail
   ```

3. Validar XML do BPMN
   - Abrir no Camunda Modeler
   - Verificar erros de validação

### Problema: "Step não avança"

**Sintomas:**
```
POST /workflow/instances/{id}/steps/{stepId}/complete → 400 Bad Request
```

**Soluções:**
1. Verificar se `stepId` é válido
   ```javascript
   // No console do navegador
   console.log('currentStepId:', useInscricaoStore.getState().currentStepId);
   ```

2. Verificar se existe próximo step no BPMN
   - Abrir arquivo `.bpmn` no Modeler
   - Verificar se há Sequence Flow saindo do step atual

3. Verificar logs do backend
   ```
   [WorkflowService] Step task_participantes não encontrado
   ```

### Problema: "Página não renderiza"

**Sintomas:**
```
"Step não implementado: participantes"
```

**Soluções:**
1. Verificar se a página existe
   ```bash
   ls -la src/pages/inscricao/workflow/*WorkflowPageMotor.tsx
   ```

2. Verificar se está registrada no switch
   ```typescript
   // InscricaoWizardMotor.tsx
   case 'participantes':
     return <ParticipantesWorkflowPageMotor />;
   ```

3. Verificar imports
   ```typescript
   import ParticipantesWorkflowPageMotor from '../pages/inscricao/workflow/ParticipantesWorkflowPageMotor';
   ```

### Problema: "Dados não salvam"

**Sintomas:**
- Step avança mas dados não aparecem no banco

**Soluções:**
1. Verificar chamada da API no componente
   ```typescript
   const stepData = {
     participantes: [...]  // ⬅️ Dados corretos?
   };
   await completeStep(workflowInstanceId, currentStepId, stepData);
   ```

2. Verificar se backend está salvando
   ```javascript
   // workflowService.js
   async completeStep(instanceId, stepId, data) {
     console.log('💾 Salvando dados:', data);  // ⬅️ Adicionar log
     // ...
   }
   ```

3. Verificar transação do banco
   ```sql
   -- Verificar último insert
   SELECT * FROM workflow_steps ORDER BY created_at DESC LIMIT 5;
   ```

---

## 8. Exemplo Completo: Fluxo com Gateway

### 8.1 BPMN com Decisão

```xml
<!-- Adicionar um Exclusive Gateway após "Formulário" -->
<bpmn:exclusiveGateway id="gateway_aprovacao" name="Documentação OK?">
  <bpmn:incoming>Flow_4</bpmn:incoming>
  <bpmn:outgoing>Flow_aprovado</bpmn:outgoing>
  <bpmn:outgoing>Flow_reprovado</bpmn:outgoing>
</bpmn:exclusiveGateway>

<!-- Fluxo aprovado -->
<bpmn:sequenceFlow id="Flow_aprovado" sourceRef="gateway_aprovacao" targetRef="task_revisao">
  <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">
    ${documentacao_ok == true}
  </bpmn:conditionExpression>
</bpmn:sequenceFlow>

<!-- Fluxo reprovado (volta para documentação) -->
<bpmn:sequenceFlow id="Flow_reprovado" sourceRef="gateway_aprovacao" targetRef="task_documentacao">
  <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">
    ${documentacao_ok == false}
  </bpmn:conditionExpression>
</bpmn:sequenceFlow>
```

### 8.2 Backend: Avaliar Condição

```javascript
async completeStep(instanceId, stepId, data) {
  // Adicionar variável para decisão
  const variables = {
    documentacao_ok: data.documentos?.length >= 3  // Exemplo: mínimo 3 documentos
  };
  
  // Passar para o engine
  await this.signal(stepId, { variables });
}
```

---

## 🎯 Resumo Rápido

```bash
# 1. Modelar BPMN
Camunda Modeler → Criar fluxo → Salvar .bpmn

# 2. Backend
cp fluxo.bpmn backend/workflows/
# Editar workflowService.js
npm restart

# 3. Frontend
# Criar páginas *WorkflowPageMotor.tsx
# Registrar no InscricaoWizardMotor.tsx
npm run dev

# 4. Testar
python tests/test_workflow_motor_complete.py

# 5. Deploy
git commit -am "feat: novo fluxo BPMN"
git push
npm run build
netlify deploy --prod
```

---

## 📚 Recursos Adicionais

- **BPMN Spec**: https://www.omg.org/spec/BPMN/2.0/
- **Camunda Docs**: https://docs.camunda.org/
- **bpmn-engine**: https://github.com/paed01/bpmn-engine
- **Tutorial BPMN**: https://camunda.com/bpmn/

---

## ✅ Boas Práticas

1. **Nomes Descritivos**: Use IDs claros como `task_cadastro_participantes`
2. **Versionamento**: Inclua versão no processId: `licenciamento_v1`, `licenciamento_v2`
3. **Logs Abundantes**: Adicione logs em cada etapa do workflow
4. **Testes Primeiro**: Teste cada step isoladamente antes de testar o fluxo completo
5. **Backup do BPMN**: Versione o arquivo `.bpmn` no git
6. **Documentação**: Mantenha este guia atualizado com mudanças

---

**Criado em:** 2025-11-12  
**Versão:** 1.0  
**Autor:** GitHub Copilot
