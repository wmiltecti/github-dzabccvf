# 📦 Guia de Instalação na Estação

## 📋 Arquivos para Transferir:

### 1. Frontend (Build ou Dev):
```
✅ wheels.zip (pacotes Python)
✅ tests/ (pasta completa com testes)
✅ .env.estacao (renomear para .env)
✅ package.json + package-lock.json (se rodar dev)
✅ dist/ (se usar build de produção)
```

### 2. Pré-requisitos na Estação:
- ✅ Python 3.11.9
- ✅ Google Chrome (para Selenium)
- ✅ Node.js 18+ (se rodar dev server)
- ✅ Backend API rodando (FastAPI + MinIO)

---

## 🚀 Instalação Rápida:

### Passo 1: Configurar Ambiente Python
```powershell
# Descompactar wheels
Expand-Archive -Path wheels.zip -DestinationPath .

# Criar ambiente virtual
python -m venv .venv

# Ativar (ajustar ExecutionPolicy se necessário)
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
.\.venv\Scripts\Activate.ps1

# Instalar pacotes offline
pip install --no-index --find-links=wheels selenium pytest webdriver-manager python-dotenv supabase
```

### Passo 2: Configurar Frontend
```powershell
# Copiar configuração da estação
Copy-Item .env.estacao .env

# EDITAR .env e ajustar o IP do backend:
# VITE_API_BASE_URL=http://[IP_BACKEND]:8001/api/v1
```

### Passo 3: Executar Testes
```powershell
# Com ambiente ativado
python tests\test_enterprise_sizes_selenium.py
```

---

## ⚙️ Configurações Importantes:

### Backend API (.env):
```env
VITE_API_BASE_URL=http://[IP_OU_LOCALHOST]:8001/api/v1
```

### Supabase (placeholder - não usado):
```env
VITE_SUPABASE_URL=https://placeholder.supabase.co
VITE_SUPABASE_ANON_KEY=placeholder-key-not-used
```

---

## ✅ O que Funciona SEM Supabase:

- ✅ **Login/Autenticação** - Via Backend API
- ✅ **Dashboard** - Dados do Backend
- ✅ **Novo Fluxo de Empreendimento** - Todas as páginas
- ✅ **Upload de Documentos** - MinIO no Backend
- ✅ **Testes Selenium** - CRUD de Porte do Empreendimento

---

## ❌ Funcionalidades que Podem Dar Erro:

- ❌ Colaboração/Comentários (usa Supabase)
- ❌ Componentes Admin CRUD genérico antigos
- ❌ Algumas páginas do fluxo manual antigo

**Solução:** Não usar essas funcionalidades. Focar no novo fluxo de empreendimento.

---

## 🔧 Troubleshooting:

### Erro: "No module named 'selenium'"
```powershell
# Verificar se ambiente está ativado
# Deve aparecer (.venv) no prompt
.\.venv\Scripts\Activate.ps1
```

### Erro: "Cannot connect to backend"
```powershell
# Verificar se backend está rodando
curl http://localhost:8001/api/v1/health

# Ajustar IP no .env se necessário
```

### Erro: ChromeDriver
```powershell
# Webdriver-manager baixa automaticamente
# Se offline, baixar manualmente:
# https://chromedriver.chromium.org/downloads
```

---

## 📊 Estrutura Mínima na Estação:

```
estacao/
├── .venv/              # Ambiente virtual Python
├── wheels/             # Pacotes Python offline
├── tests/              # Scripts de teste
│   ├── test_enterprise_sizes_selenium.py
│   └── requirements.txt
├── .env                # Configuração (copiar de .env.estacao)
└── wheels.zip          # Backup dos pacotes
```

---

## 🎯 Comando Rápido para Teste:

```powershell
# Após instalação completa
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
.\.venv\Scripts\Activate.ps1
python tests\test_enterprise_sizes_selenium.py
```
