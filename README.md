# Sistema de Licenciamento Ambiental

Sistema completo para gestão de processos de licenciamento ambiental baseado na legislação brasileira.

## 🚨 Configuração Importante para Produção

Para que a aplicação funcione em produção, é necessário configurar as variáveis de ambiente do Supabase:

1. **VITE_SUPABASE_URL** - URL do seu projeto Supabase
2. **VITE_SUPABASE_ANON_KEY** - Chave anônima do Supabase

### Como configurar no Bolt Hosting:
1. Vá nas configurações do projeto
2. Adicione as variáveis de ambiente
3. Faça um novo deploy

### Sem essas configurações:
- A aplicação irá carregar mas não conseguirá se conectar ao banco de dados
- O login/cadastro não funcionará
- Os dados não serão salvos

## 🔧 Correção de Políticas RLS (IMPORTANTE)

Se você encontrar erros de "infinite recursion detected in policy", execute este SQL no Supabase:

```sql
-- Corrigir recursão infinita nas políticas RLS
-- Execute no SQL Editor do Supabase

-- Remover políticas problemáticas
DROP POLICY IF EXISTS "processes_select_own_or_collaborated" ON license_processes;
DROP POLICY IF EXISTS "processes_update_own_or_editor" ON license_processes;
DROP POLICY IF EXISTS "Users can view collaborators of their processes" ON process_collaborators;
DROP POLICY IF EXISTS "collaborators_insert_by_owner" ON process_collaborators;

-- Criar políticas simples sem recursão
CREATE POLICY "license_processes_select_own" ON license_processes
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "license_processes_update_own" ON license_processes
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "process_collaborators_select_own" ON process_collaborators
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "process_collaborators_manage_as_owner" ON process_collaborators
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM license_processes WHERE id = process_collaborators.process_id AND user_id = auth.uid()));
```

## 🚀 Configuração para Desenvolvimento

### 1. Configurar Supabase (Development)

1. **Criar/Selecionar Branch Development:**
   - No painel do Supabase, vá em Settings > General
   - Crie um branch `development` se não existir
   - **Selecione o branch development** (não production!)

2. **Configurar Storage:**
   ```sql
   -- No SQL Editor do Supabase (branch development):
   
   -- Criar bucket para documentos
   -- Vá em Storage > New bucket > Nome: "documents" > Create
   
   -- Configurar políticas RLS para Storage
   CREATE POLICY "Users can upload own documents" ON storage.objects
   FOR INSERT TO authenticated
   WITH CHECK (
     bucket_id = 'documents' AND 
     auth.uid()::text = (storage.foldername(name))[1]
   );

   CREATE POLICY "Users can download own documents" ON storage.objects
   FOR SELECT TO authenticated
   USING (
     bucket_id = 'documents' AND 
     auth.uid()::text = (storage.foldername(name))[1]
   );

   CREATE POLICY "Users can delete own documents" ON storage.objects
   FOR DELETE TO authenticated
   USING (
     bucket_id = 'documents' AND 
     auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

3. **Configurar Autenticação:**
   - Em Authentication > Settings
   - **Desabilitar** "Enable email confirmations"
   - Site URL: `http://localhost:5173`

### 2. Configurar Variáveis de Ambiente

1. Copie `.env.example` para `.env`
2. No painel do Supabase (branch development), vá em Settings > API
3. Copie a URL e anon key do **ambiente de desenvolvimento**
4. Cole no arquivo `.env`

### 3. Instalar e Executar

```bash
npm install
npm run dev
```

## 📋 Funcionalidades

- ✅ Autenticação de usuários
- ✅ Gestão de empresas
- ✅ Processos de licenciamento (LP, LI, LO)
- ✅ Upload/download de documentos
- ✅ Acompanhamento de status
- ✅ Sistema de comentários
- ✅ Dashboard com estatísticas

## 🔒 Segurança

- Row Level Security (RLS) habilitado
- Políticas de acesso por usuário
- Storage seguro com controle de permissões
- Autenticação via Supabase Auth

## 🛠️ Tecnologias

- React + TypeScript
- Tailwind CSS
- Supabase (Database + Auth + Storage)
- Vite
- Lucide React (ícones)

## 📚 Documentação

- `PRODUCTION_SETUP.md` - Guia para deploy em produção
- `SUPABASE_PRODUCTION.md` - Configuração detalhada do Supabase
- `tests/README_SETUP_SELENIUM.md` - **🧪 Guia de configuração de testes automatizados**

## 🧪 Testes Automatizados

Este projeto inclui **10 testes E2E** completos com Selenium para validar funcionalidades administrativas:

### Setup Rápido
```bash
# 1. Criar ambiente virtual
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # Windows
# ou
source .venv/bin/activate      # Linux/Mac

# 2. Instalar dependências
cd tests
pip install -r requirements.txt

# 3. Configurar .env (criar na raiz do projeto)
TEST_CPF=61404694579
TEST_PASSWORD=teste123
TEST_BASE_URL=http://localhost:5173

# 4. Executar teste
python tests/test_property_types_selenium.py
```

### Testes Disponíveis
- ✅ `test_property_types_selenium.py` - Tipos de Imóvel
- ✅ `test_process_types_selenium.py` - Tipos de Processo
- ✅ `test_license_types_selenium.py` - Tipos de Licença
- ✅ `test_study_types_selenium.py` - Tipos de Estudo
- ✅ `test_enterprise_sizes_selenium.py` - Porte do Empreendimento
- ✅ `test_pollution_potentials_selenium.py` - Potencial Poluidor
- ✅ `test_reference_units_selenium.py` - Unidades de Referência
- ✅ `test_documentation_selenium.py` - Documentação
- ✅ `test_billing_configurations_selenium.py` - Configuração de Cobrança
- ✅ `test_activities_crud_selenium.py` - Atividades (CRUD completo)

📖 **Guia completo:** [`tests/README_SETUP_SELENIUM.md`](tests/README_SETUP_SELENIUM.md)

---

**Nota:** Este projeto está configurado para desenvolvimento. Para produção, consulte os arquivos de documentação.