# 🧪 Guia de Execução - Testes 01, 02 e 03

## ✅ Pré-requisitos

Antes de executar, verifique:

- [ ] Frontend rodando em `http://localhost:5173`
- [ ] ChromeDriver instalado em `C:\chromedriver\chromedriver.exe`
- [ ] Credenciais de login funcionando (CPF: 61404694579, Senha: Senh@01!)
- [ ] Python 3.x instalado
- [ ] Selenium instalado: `pip install selenium`

---

## 🚀 Execução

### **Opção 1: Orquestrador (Recomendado)**

Execute todos os 3 testes em sequência:

```powershell
cd tests
python orchestrator_novo_empreendimento.py
```

**Tempo estimado:** ~25 segundos

---

### **Opção 2: Testes Individuais**

#### **Teste 01 - Menu e Navegação**
```powershell
cd tests
python test_novo_empreendimento_01_menu_navegacao.py
```

**O que vai fazer:**
1. Login automático
2. Clicar no menu "Empreendimento"
3. Clicar em "Novo Empreendimento"
4. Validar wizard aberto

**Tempo estimado:** ~8s

---

#### **Teste 02 - Imóvel** (requer Teste 01 antes)
```powershell
python test_novo_empreendimento_02_imovel.py
```

**O que vai fazer:**
1. Escolher tipo aleatório (Rural/Urbano/Linear)
2. Preencher formulário completo
3. Salvar imóvel
4. Avançar para Dados Gerais

**Tempo estimado:** ~12s

---

#### **Teste 03 - Dados Gerais** (requer Testes 01 e 02 antes)
```powershell
python test_novo_empreendimento_03_dados_gerais.py
```

**O que vai fazer:**
1. Clicar no botão "Preencher Dados" 🪄
2. Validar campos preenchidos
3. Validar partícipe adicionado
4. Avançar para Atividades

**Tempo estimado:** ~5s

---

## 📊 Resultado Esperado

### **Sucesso:**

```
====================================================================================================
                         ORQUESTRADOR DE TESTES - NOVO EMPREENDIMENTO
====================================================================================================

📅 Data/Hora: 22/11/2025 ...
🌐 URL Base: http://localhost:5173
🔧 ChromeDriver: C:\chromedriver\chromedriver.exe
📋 Total de testes: 3

====================================================================================================

====================================================================================================
▶️  EXECUTANDO TESTE 1/3: 01 - Menu e Navegação
====================================================================================================

📝 ETAPA 1: LOGIN
--------------------------------------------------------------------------------
✓ Navegou para página de login
✓ Preenchendo CPF...
✓ Preenchendo senha...
✓ Clicando em Entrar...
✅ Login realizado com sucesso

📂 ETAPA 2: NAVEGAR PARA MENU EMPREENDIMENTO
--------------------------------------------------------------------------------
✓ Procurando botão 'Empreendimento' no menu...
✓ Clicando em 'Empreendimento'...
✅ Navegou para seção Empreendimento

➕ ETAPA 3: CLICAR EM 'NOVO EMPREENDIMENTO'
--------------------------------------------------------------------------------
✓ Procurando botão 'Novo Empreendimento'...
✓ Clicando em 'Novo Empreendimento'...

🎯 ETAPA 4: VALIDAR WIZARD EMPREENDIMENTO ABERTO
--------------------------------------------------------------------------------
✅ Wizard aberto e na etapa Imóvel

====================================================================================================
✅ TESTE 01 CONCLUÍDO COM SUCESSO!
====================================================================================================

✅ Teste 1 - 01 - Menu e Navegação: SUCESSO

====================================================================================================
▶️  EXECUTANDO TESTE 2/3: 02 - Etapa Imóvel
====================================================================================================

🏠 ETAPA 1: VALIDAR PÁGINA DE IMÓVEL
--------------------------------------------------------------------------------
✅ Na página de Imóvel

➕ ETAPA 2: CRIAR NOVO IMÓVEL (RURAL/URBANO/LINEAR)
--------------------------------------------------------------------------------
✓ Tipo escolhido: RURAL
✓ Tipo RURAL selecionado

📝 ETAPA 3: PREENCHER FORMULÁRIO DO IMÓVEL
--------------------------------------------------------------------------------
✓ Dados a preencher:
  - Nome: Fazenda Teste 1234
  - CAR: SC-123456-78901234
  - Município: Florianópolis/SC
  - Área: 1500 ha

✓ Preenchendo Nome...
✓ Preenchendo CAR...
✓ Preenchendo Município...
✓ Selecionando UF: SC
✓ Preenchendo Área Total...
✅ Formulário preenchido

💾 ETAPA 4: SALVAR NOVO IMÓVEL
--------------------------------------------------------------------------------
✓ Imóvel salvo

➡️ ETAPA 5: AVANÇAR PARA PRÓXIMA ETAPA
--------------------------------------------------------------------------------
✓ Clicou em Próximo

✅ ETAPA 6: VALIDAR ETAPA 'DADOS GERAIS'
--------------------------------------------------------------------------------
✅ Navegou para etapa Dados Gerais

====================================================================================================
✅ TESTE 02 CONCLUÍDO COM SUCESSO!
====================================================================================================

✅ Teste 2 - 02 - Etapa Imóvel: SUCESSO

====================================================================================================
▶️  EXECUTANDO TESTE 3/3: 03 - Etapa Dados Gerais
====================================================================================================

📋 ETAPA 1: VALIDAR PÁGINA DE DADOS GERAIS
--------------------------------------------------------------------------------
✅ Na página de Dados Gerais

🪄 ETAPA 2: USAR BOTÃO 'PREENCHER DADOS' (AUTO-FILL)
--------------------------------------------------------------------------------
✓ Procurando botão 'Preencher Dados'...
✓ Clicando em 'Preencher Dados'...
✅ Botão 'Preencher Dados' clicado

✅ ETAPA 3: VALIDAR CAMPOS PREENCHIDOS
--------------------------------------------------------------------------------
✓ Nome do Empreendimento: Complexo Industrial Mineração ABC
  ✅ Campo preenchido com sucesso
✓ Número de Empregados: 150
  ✅ Campo preenchido: 150 empregados
✓ Descrição preenchida: 245 caracteres
✅ Validação de campos concluída

👥 ETAPA 4: VALIDAR PARTÍCIPE ADICIONADO
--------------------------------------------------------------------------------
✓ Partícipe encontrado: Empresa Mineração ABC Ltda
✅ Validação de partícipe concluída

➡️ ETAPA 5: AVANÇAR PARA PRÓXIMA ETAPA
--------------------------------------------------------------------------------
✓ Clicou em Próximo

✅ ETAPA 6: VALIDAR ETAPA 'ATIVIDADES'
--------------------------------------------------------------------------------
✅ Navegou para etapa Atividades

====================================================================================================
✅ TESTE 03 CONCLUÍDO COM SUCESSO!
====================================================================================================

✅ Teste 3 - 03 - Etapa Dados Gerais: SUCESSO

====================================================================================================
                                   RELATÓRIO FINAL
====================================================================================================

⏱️  Tempo total: 25.45s
📊 Resumo:
   ✅ Sucesso: 3
   ❌ Erro: 0
   ⏭️  Desativado: 0
   ⏸️  Pendente: 0

--------------------------------------------------------------------------------

📋 Detalhes:
   1. ✅ 01 - Menu e Navegação: SUCESSO
   2. ✅ 02 - Etapa Imóvel: SUCESSO
   3. ✅ 03 - Etapa Dados Gerais: SUCESSO

====================================================================================================

🎉 TODOS OS TESTES EXECUTADOS COM SUCESSO!

====================================================================================================
```

---

## 🐛 Possíveis Erros e Soluções

### **Erro: "ChromeDriver not found"**
```
FileNotFoundError: [WinError 2] The system cannot find the file specified
```

**Solução:**
1. Baixe ChromeDriver: https://chromedriver.chromium.org/
2. Extraia para `C:\chromedriver\chromedriver.exe`
3. Ou edite `CHROME_DRIVER_PATH` nos arquivos de teste

---

### **Erro: "Login failed"**
```
❌ Login falhou - URL atual: http://localhost:5173/login
```

**Solução:**
1. Verifique credenciais (CPF: 61404694579, Senha: Senh@01!)
2. Confirme que usuário existe no sistema
3. Teste login manual primeiro

---

### **Erro: "Frontend não está rodando"**
```
selenium.common.exceptions.WebDriverException: net::ERR_CONNECTION_REFUSED
```

**Solução:**
```powershell
cd d:\code\python\github-dzabccvf
npm run dev
```

---

### **Erro: "Element not found"**
```
TimeoutException: Message: 
```

**Solução:**
1. Aumentar `TIMEOUT` nos arquivos (padrão: 20s)
2. Verificar se página carregou completamente
3. Inspecionar estrutura HTML (pode ter mudado)

---

### **Erro: "Selenium not installed"**
```
ModuleNotFoundError: No module named 'selenium'
```

**Solução:**
```powershell
pip install selenium
```

---

## 📸 Screenshots de Erro

Se houver erro, screenshots são salvos automaticamente em:

```
tests/screenshots/erro_teste_01_<timestamp>.png
tests/screenshots/erro_teste_02_<timestamp>.png
tests/screenshots/erro_teste_03_<timestamp>.png
```

---

## 🔍 Debug Manual

Se quiser ver o navegador em ação:

1. **Não feche o navegador** quando perguntado
2. Inspecione visualmente onde parou
3. Veja console do browser (F12)

---

## ✅ Checklist de Verificação

Antes de reportar erro, verifique:

- [ ] Frontend rodando (`npm run dev`)
- [ ] Backend não é necessário para testes 01-03
- [ ] ChromeDriver instalado e acessível
- [ ] Python 3.x instalado
- [ ] Selenium instalado
- [ ] Credenciais corretas
- [ ] Navegador Chrome instalado

---

## 📞 Próximos Passos

Após executar os 3 testes com sucesso:

1. ✅ Validar que tudo funcionou
2. 🔄 Executar novamente para confirmar estabilidade
3. 📝 Reportar resultados
4. ➡️ Avançar para Teste 04 (Atividades)

---

## 🎯 Métricas de Sucesso

| Métrica | Esperado |
|---------|----------|
| **Taxa de sucesso** | 100% (3/3) |
| **Tempo total** | 20-30s |
| **Navegação** | Sem erros |
| **Screenshots** | Nenhum erro |
| **Campos preenchidos** | Todos |

---

**Boa sorte com os testes!** 🚀

Se encontrar algum problema, mantenha o navegador aberto para debug e compartilhe o erro.
