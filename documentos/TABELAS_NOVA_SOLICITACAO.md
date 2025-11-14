# 📊 Tabelas do Banco de Dados - Nova Solicitação de Processo

## 🎯 Resumo Executivo

Quando o usuário clica em **"Nova Solicitação"** no menu, o sistema cria registros em múltiplas tabelas do banco de dados seguindo uma hierarquia bem definida.

---

## 📋 Tabela Principal

### **`processos`** (ou `processes`)
- **Descrição:** Tabela central que armazena o processo de licenciamento
- **Criada quando:** Ao clicar em "Nova Solicitação" ou "Novo Processo"
- **Chave primária:** `id` (UUID ou bigint)
- **Campos principais:**
  - `id` - Identificador único do processo
  - `status` - Status do processo (draft, em_analise, aprovado, etc.)
  - `user_id` - ID do usuário que criou
  - `created_at` - Data de criação
  - `updated_at` - Data de atualização
  - `property_id` - ID do imóvel vinculado (chave estrangeira)
  - `atividade_id` - ID da atividade principal
  - `created_via` - Origem da criação (motor/manual)

**Relacionamentos:**
- Pai de: `dados_gerais`, `process_participants`, formulários específicos
- Referencia: `properties` (imóvel), `activities` (atividade)

---

## 🔗 Tabelas Secundárias (relacionadas ao processo)

### 1. **`dados_gerais`** (ou parte da tabela `processos`)
- **Descrição:** Dados gerais do empreendimento e do processo
- **Criada quando:** Logo após criar o processo (Aba 1 do wizard)
- **Relação:** `1:1` com `processos` (via `processo_id`)
- **Campos principais:**
  - `processo_id` - FK para processos (chave estrangeira)
  - `protocolo_interno` - Número de protocolo
  - `numero_processo_externo` - Número externo (se houver)
  - `tipo_pessoa` - PF ou PJ
  - `cpf` / `cnpj` - Documento do requerente
  - `razao_social` / `nome_fantasia` - Dados da empresa
  - `porte` - Porte do empreendimento (Pequeno, Médio, Grande)
  - `potencial_poluidor` - Nível de poluição (Baixo, Médio, Alto)
  - `cnae_codigo` - Código CNAE da atividade
  - `cnae_descricao` - Descrição da atividade
  - `area_total` - Área total do empreendimento
  - `numero_empregados` - Quantidade de funcionários
  - `horario_funcionamento_inicio` / `_fim` - Horário de operação
  - `descricao_resumo` - Descrição do empreendimento
  - `contato_email` / `contato_telefone` - Contatos
  - `possui_licenca_anterior` - Boolean
  - `tipo_licenca_anterior`, `numero_licenca_anterior`, etc.

---

### 2. **`process_participants`** (ou `processos_participantes`)
- **Descrição:** Participantes do processo (Requerente, Procurador, Técnico)
- **Criada quando:** Aba "Participantes" - ao adicionar pessoas ao processo
- **Relação:** `N:1` com `processos` (vários participantes por processo)
- **Campos principais:**
  - `id` - PK
  - `process_id` - FK para processos
  - `person_id` - FK para `people` (pessoas físicas ou jurídicas)
  - `role` - Papel (REQUERENTE, PROCURADOR, TECNICO)
  - `procuracao_file_id` - ID do arquivo de procuração (se procurador)
  - `created_at`

**Regra de negócio:** Obrigatório ter pelo menos 1 REQUERENTE

---

### 3. **`properties`** (ou `imoveis`)
- **Descrição:** Imóvel onde será desenvolvido o empreendimento
- **Criada quando:** Aba "Imóvel" - ao buscar/selecionar um imóvel existente ou cadastrar novo
- **Relação:** `1:N` com `processos` (um imóvel pode ter vários processos)
- **Campos principais:**
  - `id` - PK
  - `kind` - Tipo (RURAL, URBANO, LINEAR)
  - `car` - Código CAR (Cadastro Ambiental Rural)
  - `ccir` - Código CCIR
  - `area_total_ha` - Área total em hectares
  - `latitude` / `longitude` - Coordenadas
  - `dms_lat` / `dms_long` - Coordenadas DMS
  - `sistema_referencia` - Sistema de coordenadas (SIRGAS 2000, etc.)
  - `municipio` / `uf` - Localização
  - `arquivogeorreferenciamento` - Nome do arquivo CAR
  
**Endereço (se URBANO):**
  - `cep`, `logradouro`, `numero`, `bairro`, `complemento`

**Dados Cartoriais:**
  - `tipo_cartorio`, `nome_cartorio`, `comarca_uf`, `comarca_municipio`
  - `matricula`, `livro`, `folha`

**Dados Lineares (se LINEAR):**
  - `extensao_km` - Extensão total
  - `largura_faixa_m` - Largura da faixa

---

### 4. **`property_titles`** (ou `titulos_imovel`)
- **Descrição:** Títulos/documentos do imóvel
- **Criada quando:** Ao cadastrar imóvel com múltiplos títulos
- **Relação:** `N:1` com `properties`
- **Campos principais:**
  - `id` - PK
  - `property_id` - FK para properties
  - `tipo_titulo` - Tipo de documento
  - `numero_titulo` - Número do título
  - `area_ha` - Área do título

---

### 5. **`people`** (ou `pessoas_fisicas` / `pessoas_juridicas`)
- **Descrição:** Pessoas físicas ou jurídicas que participam do processo
- **Criada quando:** Pré-cadastrada no sistema (não é criada no wizard)
- **Relação:** Referenciada por `process_participants`
- **Campos principais:**
  - `id` - PK
  - `tipo` - PF ou PJ
  - `cpf` / `cnpj` - Documento
  - `nome` / `razao_social` - Nome/Razão social
  - `email`, `telefone` - Contatos
  - `endereco` - Endereço completo

---

### 6. **Tabelas de Formulário Específico** (Aba 3 - Formulário)

Dependendo da atividade selecionada, podem ser criadas tabelas específicas:

#### **`formulario_recursos_energia`**
- Consumo de energia, combustíveis, etc.
- **Relação:** `1:1` com `processos`

#### **`formulario_uso_agua`**
- Captação e uso de recursos hídricos
- **Relação:** `1:1` com `processos`

#### **`formulario_residuos`**
- Geração e destinação de resíduos
- **Relação:** `1:1` com `processos`

#### **`formulario_outras_info`**
- Informações complementares
- **Relação:** `1:1` com `processos`

---

### 7. **`documentacao_processo`** (ou `process_documents`)
- **Descrição:** Documentos anexados ao processo
- **Criada quando:** Aba "Documentação" - upload de arquivos
- **Relação:** `N:1` com `processos`
- **Campos principais:**
  - `id` - PK
  - `processo_id` - FK para processos
  - `tipo_documento` - Tipo do documento
  - `nome_arquivo` - Nome original do arquivo
  - `storage_path` - Caminho no storage (Supabase Storage)
  - `tamanho_bytes` - Tamanho do arquivo
  - `mime_type` - Tipo MIME
  - `uploaded_at` - Data de upload

---

### 8. **`workflow_instances`** (Motor BPMN)
- **Descrição:** Instância do workflow controlado pelo motor BPMN
- **Criada quando:** Ao usar o "Novo Processo" (com motor)
- **Relação:** `1:1` com `processos`
- **Campos principais:**
  - `id` - PK
  - `processo_id` - FK para processos
  - `status` - Status do workflow (ACTIVE, COMPLETED, CANCELLED)
  - `current_step_id` - ID do step atual
  - `current_step_key` - Chave do step atual (participantes, imovel, etc.)
  - `steps_completed` - Array de steps concluídos
  - `created_at`, `updated_at`

---

## 🏗️ Hierarquia de Criação

### Ordem de criação ao clicar em "Nova Solicitação":

```
1. processos (tabela principal)
   └── Cria registro com status="draft"
   
2. dados_gerais (opcional, pode ser na primeira aba)
   └── Inicializa registro vazio vinculado ao processo
   
3. workflow_instances (se usar Motor BPMN)
   └── Cria instância de workflow vinculada ao processo

--- A partir daqui, depende da navegação do usuário ---

4. process_participants (Aba 1: Participantes)
   └── Adiciona requerentes, procuradores, técnicos
   
5. properties → processos.property_id (Aba 2: Imóvel)
   └── Vincula imóvel existente OU cria novo imóvel
   
6. dados_gerais (Aba 3: Empreendimento)
   └── Preenche dados do empreendimento (porte, CNAE, etc.)
   
7. formulario_* (Aba 4: Formulário)
   └── Cria registros nos formulários específicos
   
8. documentacao_processo (Aba 5: Documentação)
   └── Faz upload e vincula documentos
   
9. Finalização (Aba 6: Revisão)
   └── Atualiza processos.status para "em_analise"
```

---

## 🔑 Relacionamentos Principais

```
processos (PRINCIPAL)
├── 1:1 → dados_gerais
├── 1:1 → workflow_instances (se motor BPMN)
├── 1:N → process_participants
├── N:1 → properties (property_id)
├── 1:1 → formulario_recursos_energia
├── 1:1 → formulario_uso_agua
├── 1:1 → formulario_residuos
├── 1:1 → formulario_outras_info
└── 1:N → documentacao_processo

properties
├── N:1 → processos
└── 1:N → property_titles

process_participants
├── N:1 → processos
└── N:1 → people

workflow_instances
└── 1:1 → processos
```

---

## 📝 Resumo: Qual é a Tabela Principal?

### ✅ **Tabela Principal:** `processos` (ou `processes`)

**Justificativa:**
- É a primeira tabela criada ao iniciar nova solicitação
- Todas as outras tabelas referenciam ela via `processo_id`
- Controla o ciclo de vida completo do licenciamento
- Armazena metadados principais (status, datas, usuário)

### 🔗 **Tabelas Secundárias Críticas:**
1. **`dados_gerais`** - Dados do empreendimento (1:1)
2. **`process_participants`** - Participantes obrigatórios (N:1)
3. **`properties`** - Imóvel obrigatório (N:1)

### 🔗 **Tabelas Secundárias Opcionais:**
4. **`formulario_*`** - Formulários específicos (1:1)
5. **`documentacao_processo`** - Documentos anexados (N:1)
6. **`workflow_instances`** - Controle de workflow (1:1)
7. **`property_titles`** - Títulos do imóvel (N:1 via properties)

---

## 🔍 Como Verificar no Banco

### No Supabase (SQL Editor):

```sql
-- 1. Ver processos criados recentemente
SELECT * FROM processos 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Ver dados gerais de um processo
SELECT * FROM dados_gerais 
WHERE processo_id = 'seu-processo-id';

-- 3. Ver participantes de um processo
SELECT pp.*, p.nome, p.cpf, p.email 
FROM process_participants pp
JOIN people p ON pp.person_id = p.id
WHERE pp.process_id = 'seu-processo-id';

-- 4. Ver imóvel vinculado
SELECT proc.id as processo_id, prop.* 
FROM processos proc
JOIN properties prop ON proc.property_id = prop.id
WHERE proc.id = 'seu-processo-id';

-- 5. Ver workflow instance
SELECT * FROM workflow_instances 
WHERE processo_id = 'seu-processo-id';
```

---

## 🎯 Conclusão

O fluxo de "Nova Solicitação" envolve **no mínimo 3 tabelas principais**:
1. `processos` (principal)
2. `process_participants` (obrigatório)
3. `properties` (obrigatório)

E pode envolver até **10+ tabelas** dependendo da complexidade do processo e documentação anexada.

**Data de criação:** 13/11/2025  
**Branch:** `sptask-fim-do-manual`
