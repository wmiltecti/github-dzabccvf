# Testes Automatizados - Novo Empreendimento

## 📋 Visão Geral

Sistema de testes automatizados para o fluxo de cadastro de **Novo Empreendimento** usando **arquitetura de orquestrador + agentes**.

### Conceito

- **Orquestrador**: Gerencia execução sequencial dos testes
- **Agentes**: Testes especializados em cada etapa do fluxo
- **Cadeia**: Cada agente passa contexto (driver + dados) para o próximo
- **Stop on Error**: Se um teste falha, execução para imediatamente

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     ORQUESTRADOR                             │
│              orchestrator_novo_empreendimento.py             │
│                                                               │
│  • Inicializa navegador                                      │
│  • Executa testes em sequência                               │
│  • Passa contexto entre testes                               │
│  • Gera relatório final                                      │
└──────────┬──────────────────────────────────────────────────┘
           │
           ├─► 01_menu_navegacao.py ──────► Abre wizard
           │                                     │
           │                                     ├─► Login
           │                                     ├─► Menu "Empreendimento"
           │                                     └─► Botão "Novo Empreendimento"
           │
           ├─► 02_imovel.py ─────────────────► Cria imóvel
           │                                     │
           │                                     ├─► Escolhe tipo (Rural/Urbano/Linear)
           │                                     ├─► Preenche formulário
           │                                     ├─► Salva imóvel
           │                                     └─► Clica "Próximo"
           │
           ├─► 03_dados_gerais.py ───────────► Dados gerais (TODO)
           │                                     │
           │                                     ├─► Preenche nome do empreendimento
           │                                     ├─► Adiciona partícipes
           │                                     └─► Clica "Próximo"
           │
           ├─► 04_atividades.py ─────────────► Atividades (TODO)
           │                                     │
           │                                     ├─► Seleciona atividades
           │                                     ├─► Preenche quantidades/portes
           │                                     └─► Clica "Próximo"
           │
           └─► 05_caracterizacao.py ─────────► Caracterização (TODO)
                                                 │
                                                 ├─► Preenche caracterização
                                                 └─► Finaliza cadastro
```

---

## 📂 Estrutura de Arquivos

```
tests/
├── orchestrator_novo_empreendimento.py          # Orquestrador principal
├── test_novo_empreendimento_01_menu_navegacao.py  # Agente 01: Menu
├── test_novo_empreendimento_02_imovel.py          # Agente 02: Imóvel
├── test_novo_empreendimento_03_dados_gerais.py    # Agente 03: Dados Gerais (TODO)
├── test_novo_empreendimento_04_atividades.py      # Agente 04: Atividades (TODO)
├── test_novo_empreendimento_05_caracterizacao.py  # Agente 05: Caracterização (TODO)
└── README_TESTES_NOVO_EMPREENDIMENTO.md           # Este arquivo
```

---

## 🚀 Como Executar

### Opção 1: Orquestrador (Recomendado)

Executa todos os testes em sequência automaticamente:

```powershell
cd tests
python orchestrator_novo_empreendimento.py
```

**Vantagens:**
- Execução automática completa
- Relatório consolidado
- Contexto preservado entre testes
- Stop automático em caso de erro

---

### Opção 2: Teste Individual

Executa apenas um teste específico:

```powershell
# Teste 01 (standalone)
python test_novo_empreendimento_01_menu_navegacao.py

# Teste 02 (precisa do contexto do Teste 01)
# Execute via orquestrador ou manualmente passando driver
```

**⚠️ Atenção:**
- Testes 02+ dependem do contexto do teste anterior
- Recomendado usar orquestrador para testes sequenciais

---

## 📝 Detalhes dos Testes

### **Teste 01: Menu e Navegação** ✅ Implementado

**Arquivo:** `test_novo_empreendimento_01_menu_navegacao.py`

**Responsabilidades:**
1. Fazer login no sistema
2. Navegar para Dashboard
3. Clicar no menu "Empreendimento"
4. Clicar no botão "Novo Empreendimento"
5. Validar que wizard foi aberto
6. Validar que está na etapa "Imóvel"

**Dados de Login:**
- CPF: `61404694579`
- Senha: `Senh@01!`

**Contexto retornado:**
```python
{
    'teste': '01_menu_navegacao',
    'status': 'sucesso',
    'driver': <WebDriver>,
    'wait': <WebDriverWait>,
    'login_ok': True,
    'menu_empreendimento_ok': True,
    'botao_novo_ok': True,
    'wizard_aberto': True,
    'etapa_atual': 'imovel'
}
```

---

### **Teste 02: Etapa Imóvel** ✅ Implementado

**Arquivo:** `test_novo_empreendimento_02_imovel.py`

**Responsabilidades:**
1. Validar que está na página de Imóvel
2. Escolher tipo de imóvel (RURAL, URBANO ou LINEAR - aleatório)
3. Preencher todos os campos obrigatórios
4. **NÃO** interagir com mapa GeoFront
5. Salvar imóvel
6. Clicar em "Próximo"
7. Validar navegação para "Dados Gerais"

**Tipos de Imóvel:**

**RURAL:**
- Nome do imóvel
- Código CAR
- Município/UF
- Área total (ha)
- Coordenadas (Lat/Long)

**URBANO:**
- Nome do imóvel
- CEP
- Logradouro, Número, Bairro
- Município/UF
- Matrícula
- Área total (m²)
- Coordenadas (Lat/Long)

**LINEAR:**
- Nome do imóvel
- Município início/UF início
- Município final/UF final
- Extensão (km)

**Contexto retornado:**
```python
{
    'teste': '02_imovel',
    'status': 'sucesso',
    'driver': <WebDriver>,
    'tipo_imovel': 'RURAL|URBANO|LINEAR',
    'dados_imovel': {...},
    'formulario_preenchido': True,
    'imovel_salvo': True,
    'avancar_ok': True,
    'dados_gerais_ok': True
}
```

---

### **Teste 03: Dados Gerais** 🚧 TODO

**Arquivo:** `test_novo_empreendimento_03_dados_gerais.py`

**Responsabilidades:**
1. Validar que está na página Dados Gerais
2. Preencher nome do empreendimento
3. Preencher demais campos (telefone, email, etc)
4. Adicionar pelo menos 1 partícipe (Requerente)
5. **NÃO** interagir com mapa GeoFront
6. Clicar em "Próximo"
7. Validar navegação para "Atividades"

**Campos esperados:**
- Nome do empreendimento
- Telefone
- Email
- Número de empregados
- Descrição
- Partícipes (mínimo 1 requerente)

---

### **Teste 04: Atividades** 🚧 TODO

**Arquivo:** `test_novo_empreendimento_04_atividades.py`

**Responsabilidades:**
1. Validar que está na página Atividades
2. Selecionar pelo menos 1 atividade da lista
3. Preencher quantidade
4. Selecionar porte do empreendimento
5. Selecionar potencial poluidor
6. **NÃO** interagir com mapas GeoFront das atividades
7. Clicar em "Próximo"
8. Validar navegação para "Caracterização"

**Validações:**
- Buscar atividades na API (ou usar mock)
- Preencher quantidade em unidade correta
- Selecionar porte baseado nas faixas
- Validar campos obrigatórios preenchidos

---

### **Teste 05: Caracterização** 🚧 TODO

**Arquivo:** `test_novo_empreendimento_05_caracterizacao.py`

**Responsabilidades:**
1. Validar que está na página Caracterização
2. Preencher campos de caracterização
3. Clicar em "Finalizar" ou "Salvar"
4. Validar cadastro concluído
5. Validar mensagem de sucesso

---

## 🔧 Configuração

### Pré-requisitos

1. **ChromeDriver instalado:**
   - Path: `C:\chromedriver\chromedriver.exe`
   - Ou edite `CHROME_DRIVER_PATH` nos arquivos

2. **Frontend rodando:**
   - URL: `http://localhost:5173`
   - Execute: `npm run dev`

3. **Backend rodando (para Atividades):**
   - URL: `http://localhost:8000`
   - Endpoint: `/api/v1/activities`

4. **Dependências Python:**
   ```powershell
   pip install selenium
   ```

---

## 📊 Relatório de Execução

Ao executar o orquestrador, você verá:

```
====================================================================================================
                         ORQUESTRADOR DE TESTES - NOVO EMPREENDIMENTO
====================================================================================================

📅 Data/Hora: 22/11/2025 10:30:45
🌐 URL Base: http://localhost:5173
🔧 ChromeDriver: C:\chromedriver\chromedriver.exe
📋 Total de testes: 2

====================================================================================================

====================================================================================================
▶️  EXECUTANDO TESTE 1/2: 01 - Menu e Navegação
====================================================================================================

📝 ETAPA 1: LOGIN
--------------------------------------------------------------------------------
✓ Navegou para página de login
✓ Preenchendo CPF...
✓ Preenchendo senha...
✓ Clicando em Entrar...
✓ Aguardando dashboard...
✅ Login realizado com sucesso - URL: http://localhost:5173/dashboard

📂 ETAPA 2: NAVEGAR PARA MENU EMPREENDIMENTO
--------------------------------------------------------------------------------
✓ Procurando botão 'Empreendimento' no menu...
✓ Botão encontrado: Empreendimento
✓ Clicando em 'Empreendimento'...
✅ Navegou para seção Empreendimento - Título: Empreendimentos

➕ ETAPA 3: CLICAR EM 'NOVO EMPREENDIMENTO'
--------------------------------------------------------------------------------
✓ Procurando botão 'Novo Empreendimento'...
✓ Botão encontrado: Novo Empreendimento
✓ Clicando em 'Novo Empreendimento'...

🎯 ETAPA 4: VALIDAR WIZARD EMPREENDIMENTO ABERTO
--------------------------------------------------------------------------------
✓ Verificando se wizard foi aberto...
✓ Título do wizard encontrado: Novo Empreendimento
✓ Verificando etapa atual (deve ser Imóvel)...
✓ Etapa Imóvel encontrada: Imóvel
✅ Wizard aberto e na etapa Imóvel

====================================================================================================
✅ TESTE 01 CONCLUÍDO COM SUCESSO!
====================================================================================================

📊 Resumo:
  ✓ Login realizado
  ✓ Menu 'Empreendimento' acessado
  ✓ Botão 'Novo Empreendimento' clicado
  ✓ Wizard aberto na etapa Imóvel

====================================================================================================

✅ Teste 1 - 01 - Menu e Navegação: SUCESSO

====================================================================================================
▶️  EXECUTANDO TESTE 2/2: 02 - Etapa Imóvel
====================================================================================================

[... output do teste 02 ...]

====================================================================================================
                                   RELATÓRIO FINAL
====================================================================================================

⏱️  Tempo total: 45.32s
📊 Resumo:
   ✅ Sucesso: 2
   ❌ Erro: 0
   ⏭️  Desativado: 0
   ⏸️  Pendente: 0

--------------------------------------------------------------------------------

📋 Detalhes:
   1. ✅ 01 - Menu e Navegação: SUCESSO
   2. ✅ 02 - Etapa Imóvel: SUCESSO

====================================================================================================

🎉 TODOS OS TESTES EXECUTADOS COM SUCESSO!

====================================================================================================
```

---

## 🐛 Debug e Troubleshooting

### Teste falhou?

1. **Veja o screenshot:**
   - Localização: `tests/screenshots/erro_teste_XX_timestamp.png`

2. **Mantenha navegador aberto:**
   - Quando perguntado, responda "n" para não fechar
   - Inspecione visualmente o estado

3. **Execute individualmente:**
   - Execute apenas o teste que falhou
   - Adicione prints/breakpoints para debug

### Erros comuns:

**"Element not found":**
- Página não carregou completamente
- Seletores CSS/XPath incorretos
- Estrutura HTML mudou

**"TimeoutException":**
- Aumentar `TIMEOUT` nos arquivos
- Verificar se frontend/backend estão rodando
- Rede lenta

**"StaleElementReferenceException":**
- Página recarregou durante execução
- Re-buscar elemento após reload

---

## 🔄 Próximos Passos

1. ✅ Teste 01 - Menu e Navegação (Implementado)
2. ✅ Teste 02 - Etapa Imóvel (Implementado)
3. 🚧 Teste 03 - Dados Gerais (TODO)
4. 🚧 Teste 04 - Atividades (TODO)
5. 🚧 Teste 05 - Caracterização (TODO)

---

## 📞 Contato

Dúvidas ou sugestões sobre os testes?
- Abra uma issue no repositório
- Entre em contato com a equipe de QA

---

**Última atualização:** 22/11/2025  
**Autor:** GitHub Copilot  
**Branch:** feature/evolucao-features
