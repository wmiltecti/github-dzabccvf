# 🧪 Guia de Configuração - Testes Selenium

Este guia ajudará você a configurar o ambiente para executar os testes automatizados E2E com Selenium.

---

## 📋 Pré-requisitos

- **Python 3.11+** instalado
- **Google Chrome** instalado (versão atualizada)
- **ChromeDriver** compatível com sua versão do Chrome
- **Git** para clonar o repositório

---

## 🔧 Instalação - Passo a Passo

### 1. Instalar Python

**Windows:**
```powershell
# Baixar de: https://www.python.org/downloads/
# Durante instalação, marcar "Add Python to PATH"

# Verificar instalação
python --version
```

**Linux/Mac:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip

# Mac (Homebrew)
brew install python@3.11

# Verificar instalação
python3 --version
```

---

### 2. Instalar Google Chrome

**Windows:**
- Baixar de: https://www.google.com/chrome/
- Instalar normalmente

**Linux:**
```bash
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
sudo apt-get install -f
```

**Mac:**
```bash
brew install --cask google-chrome
```

**Verificar versão do Chrome:**
```bash
# Windows (PowerShell)
(Get-Item "C:\Program Files\Google\Chrome\Application\chrome.exe").VersionInfo.FileVersion

# Linux/Mac
google-chrome --version
```

---

### 3. Instalar ChromeDriver

#### Opção A: Download Manual (Recomendado)

1. **Verificar versão do Chrome instalado**
   - Exemplo: Chrome 131.0.6778.86

2. **Baixar ChromeDriver compatível**
   - Site: https://googlechromelabs.github.io/chrome-for-testing/
   - Escolher versão **exata** do seu Chrome
   - Baixar para seu sistema operacional (win64, linux64, mac-arm64, etc.)

3. **Instalar ChromeDriver**

   **Windows:**
   ```powershell
   # Criar diretório
   mkdir C:\chromedriver
   
   # Extrair chromedriver.exe para C:\chromedriver\
   # Adicionar C:\chromedriver ao PATH do sistema:
   # 1. Win + R → sysdm.cpl → Variáveis de Ambiente
   # 2. Path → Editar → Novo → C:\chromedriver
   
   # Verificar
   chromedriver --version
   ```

   **Linux/Mac:**
   ```bash
   # Extrair e mover
   unzip chromedriver-linux64.zip
   sudo mv chromedriver /usr/local/bin/
   sudo chmod +x /usr/local/bin/chromedriver
   
   # Verificar
   chromedriver --version
   ```

#### Opção B: Via Package Manager (Linux)

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install chromium-chromedriver

# Verificar
chromedriver --version
```

---

### 4. Configurar Ambiente Python

#### 4.1. Navegar até o diretório do projeto
```bash
cd d:\code\python\github-dzabccvf
# ou no Linux/Mac:
# cd ~/projects/github-dzabccvf
```

#### 4.2. Criar ambiente virtual

**Windows (PowerShell):**
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Se der erro de permissão:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Linux/Mac:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

#### 4.3. Atualizar pip
```bash
python -m pip install --upgrade pip
```

#### 4.4. Instalar dependências
```bash
pip install selenium==4.15.2
pip install python-dotenv
pip install supabase
```

---

### 5. Configurar Variáveis de Ambiente

#### 5.1. Criar arquivo `.env` na raiz do projeto
```bash
# Windows
notepad .env

# Linux/Mac
nano .env
```

#### 5.2. Adicionar configurações
```env
# Credenciais de Teste
TEST_CPF=61404694579
TEST_PASSWORD=teste123

# URL da aplicação (localhost ou servidor)
TEST_BASE_URL=http://localhost:5173

# Supabase (se necessário para testes de API)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-aqui
```

⚠️ **IMPORTANTE:** O arquivo `.env` já está no `.gitignore` e **não deve** ser commitado!

---

## ▶️ Executando os Testes

### Testes Individuais

```bash
# Ativar ambiente virtual primeiro
.\.venv\Scripts\Activate.ps1  # Windows
# ou
source .venv/bin/activate      # Linux/Mac

# Executar teste específico
python tests/test_property_types_selenium.py
python tests/test_activities_crud_selenium.py
python tests/test_billing_configurations_selenium.py
```

### Todos os Testes de Admin (10 testes)

```bash
# Lista de testes disponíveis:
python tests/test_property_types_selenium.py
python tests/test_process_types_selenium.py
python tests/test_license_types_selenium.py
python tests/test_study_types_selenium.py
python tests/test_enterprise_sizes_selenium.py
python tests/test_pollution_potentials_selenium.py
python tests/test_reference_units_selenium.py
python tests/test_documentation_selenium.py
python tests/test_billing_configurations_selenium.py
python tests/test_activities_crud_selenium.py
```

---

## 📸 Screenshots dos Testes

Os testes salvam screenshots automaticamente em `tests/screenshots/`:

```
tests/screenshots/
├── property_types_modal_opened.png
├── property_types_form_filled.png
├── property_types_list_final.png
├── activities_modal_opened.png
├── activities_form_filled.png
├── activities_validation_error.png
└── ...
```

---

## 🐛 Solução de Problemas Comuns

### 1. Erro: `chromedriver not found`

**Causa:** ChromeDriver não está no PATH

**Solução:**
```bash
# Windows: Verificar se C:\chromedriver está no PATH
echo $env:PATH

# Linux/Mac: Verificar se /usr/local/bin está no PATH
echo $PATH

# Alternativa: Especificar caminho no código
# (já configurado nos testes)
```

### 2. Erro: `session not created: This version of ChromeDriver only supports Chrome version X`

**Causa:** Versão do ChromeDriver incompatível com Chrome

**Solução:**
1. Verificar versão do Chrome: `google-chrome --version`
2. Baixar ChromeDriver compatível: https://googlechromelabs.github.io/chrome-for-testing/
3. Substituir executável antigo

### 3. Erro: `ModuleNotFoundError: No module named 'selenium'`

**Causa:** Ambiente virtual não ativado ou dependências não instaladas

**Solução:**
```bash
# Ativar ambiente virtual
.\.venv\Scripts\Activate.ps1  # Windows
source .venv/bin/activate      # Linux/Mac

# Reinstalar dependências
pip install -r requirements.txt
# ou manualmente:
pip install selenium==4.15.2
```

### 4. Erro: `TEST_CPF not found in .env`

**Causa:** Arquivo `.env` não existe ou mal configurado

**Solução:**
```bash
# Criar arquivo .env na raiz do projeto
# Adicionar variáveis conforme seção 5.2
```

### 5. Chrome abre mas não navega

**Causa:** Servidor de desenvolvimento não está rodando

**Solução:**
```bash
# Em outro terminal, iniciar servidor
npm run dev
# ou
yarn dev

# Verificar se está rodando em http://localhost:5173
```

### 6. Teste falha com "Element not found"

**Causa:** Timing issues ou mudanças na interface

**Solução:**
- Aumentar timeouts nos testes (já configurado: 20 segundos)
- Verificar se aplicação carregou completamente
- Verificar screenshots em `tests/screenshots/` para debug

---

## 🔍 Verificação da Instalação

Execute este checklist para garantir que tudo está funcionando:

```bash
# 1. Python instalado
python --version
# Esperado: Python 3.11.x ou superior

# 2. Chrome instalado
google-chrome --version  # Linux/Mac
# ou verificar em: chrome://version/  # Windows

# 3. ChromeDriver instalado
chromedriver --version
# Esperado: ChromeDriver 131.x (mesma versão major do Chrome)

# 4. Ambiente virtual criado
ls .venv  # Linux/Mac
dir .venv  # Windows
# Esperado: diretório .venv existe

# 5. Dependências instaladas
.\.venv\Scripts\Activate.ps1  # Windows
pip list | grep selenium
# Esperado: selenium 4.15.2

# 6. Arquivo .env existe
cat .env  # Linux/Mac
type .env  # Windows
# Esperado: variáveis TEST_CPF, TEST_PASSWORD, TEST_BASE_URL

# 7. Servidor rodando
curl http://localhost:5173
# Esperado: HTML da aplicação

# 8. Executar teste simples
python tests/test_property_types_selenium.py
# Esperado: ✅ TESTE PASSOU COM SUCESSO!
```

---

## 📚 Recursos Adicionais

- **Documentação Selenium Python:** https://selenium-python.readthedocs.io/
- **ChromeDriver Downloads:** https://googlechromelabs.github.io/chrome-for-testing/
- **WebDriver Wait:** https://selenium-python.readthedocs.io/waits.html
- **Locators Strategy:** https://selenium-python.readthedocs.io/locating-elements.html

---

## 🆘 Suporte

Se encontrar problemas não listados aqui:

1. Verificar logs de erro completo
2. Verificar screenshots em `tests/screenshots/`
3. Consultar documentação do Selenium
4. Abrir issue no repositório com:
   - Sistema operacional
   - Versão do Python
   - Versão do Chrome
   - Versão do ChromeDriver
   - Log de erro completo

---

## 📝 Notas de Desenvolvimento

### Estrutura dos Testes

Todos os testes seguem o mesmo padrão de 7 etapas:

1. **Login** - Autenticação com credenciais de teste
2. **Navegação** - Abrir menu Administração
3. **Acesso** - Clicar no item de menu específico
4. **Modal** - Abrir formulário "Novo"
5. **Preenchimento** - Preencher campos obrigatórios
6. **Salvamento** - Clicar em "Salvar" e capturar toast
7. **Verificação** - Confirmar item na lista

### Boas Práticas

- ✅ Sempre usar `WebDriverWait` para esperar elementos
- ✅ Capturar screenshots em pontos críticos
- ✅ Usar dados únicos (timestamp) para evitar conflitos
- ✅ Fechar navegador ao final (`driver.quit()`)
- ✅ Tratar exceções e fornecer mensagens claras

### Convenções de Nomenclatura

```python
# Arquivo de teste
test_{entity_name}_selenium.py

# Screenshots
{entity}_modal_opened.png
{entity}_form_filled.png
{entity}_validation_error.png
{entity}_list_final.png
```

---

**Última atualização:** 11/11/2025  
**Versão Python:** 3.11.9  
**Versão Selenium:** 4.15.2  
**Versão ChromeDriver:** 131.0.6778.69
