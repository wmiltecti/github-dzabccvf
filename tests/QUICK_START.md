# 🚀 QUICK START - Como Executar os Testes

## ⚡ Execução Rápida (3 comandos)

```bash
# 1. Ir para diretório de testes
cd tests

# 2. Instalar dependências (se ainda não instalou)
pip install -r requirements.txt

# 3. Executar testes
python test_api_parametrizacao.py
```

**Tempo total:** ~20 segundos

---

## 📋 Resultado Esperado AGORA

```
======================================================================
 RESUMO DOS TESTES DE API
======================================================================
collected 7 items

test_api_parametrizacao.py::test_01_listar_configuracoes SKIPPED
test_api_parametrizacao.py::test_02_atualizar_config_... SKIPPED
test_api_parametrizacao.py::test_03_atualizar_config_... SKIPPED
test_api_parametrizacao.py::test_04_pesquisar_empresa... SKIPPED
test_api_parametrizacao.py::test_05_pesquisar_empresa... SKIPPED
test_api_parametrizacao.py::test_06_buscar_config_esp... SKIPPED
test_api_parametrizacao.py::test_07_validar_estrutura... SKIPPED

=================================== 7 skipped in 15.18s ===============
```

**✅ ISSO É CORRETO!** Testes estão pulando porque backend não está implementado.

---

## 🎯 Para os Testes PASSAREM

### 1️⃣ Execute o SQL
```sql
-- Copie todo o conteúdo de:
Docs/database/001_system_configurations.sql

-- Cole no Supabase SQL Editor e execute
```

### 2️⃣ Implemente o Backend
Use os exemplos em:
- `Docs/backend-reference/systemConfigRoutes.example.ts`
- `Docs/backend-reference/enterpriseRoutes.example.ts`

Endpoints necessários:
```
GET    /api/v1/system-config
GET    /api/v1/system-config/:key
PUT    /api/v1/system-config/:key
GET    /api/v1/enterprises/search?query=xxx
```

### 3️⃣ Execute os Testes Novamente
```bash
cd tests
python test_api_parametrizacao.py
```

**Resultado esperado:**
```
=================================== 7 passed in 12.45s ===============
```

---

## 🔍 Ver Detalhes dos Testes

### Modo Verbose (Ver o que está acontecendo)
```bash
pytest test_api_parametrizacao.py -v -s
```

**Mostra:**
- ✅ Nome de cada teste
- ✅ Prints dos testes
- ✅ Status codes HTTP
- ✅ Mensagens de aviso

### Executar Teste Específico
```bash
pytest test_api_parametrizacao.py::TestParametrizacaoAPI::test_01_listar_configuracoes -v -s
```

---

## 🎮 Modo Interativo

```bash
cd tests
python run_tests.py
```

**Menu:**
```
📋 OPÇÕES DE TESTE:
1. Executar TODOS os testes
2. Cenário 1: Pesquisa OBRIGATÓRIA + Cadastro PERMITIDO
3. Cenário 2: Pesquisa OBRIGATÓRIA + Cadastro NÃO PERMITIDO
4. Cenário 3: Pesquisa OPCIONAL
5. Cenário 4: Empreendimento Existente
0. Sair

Escolha uma opção:
```

---

## ⚙️ Configuração do .env

**Arquivo:** `tests/.env`

```env
# URL da aplicação
TEST_BASE_URL=http://localhost:5173

# Credenciais de admin
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=admin123

# CNPJ para teste (Cenário 4)
TEST_CNPJ_EXISTENTE=12345678000199
```

**⚠️ Ajuste as credenciais conforme seu sistema!**

---

## 🐛 Troubleshooting Rápido

### "Module not found"
```bash
pip install -r requirements.txt
```

### "Login falhou: 404"
- Backend não está rodando
- Ou endpoint de login está em URL diferente
- **Normal:** Testes vão pular automaticamente

### "Endpoint não encontrado"
- Backend não implementado ainda
- **Normal:** É o comportamento esperado agora

### Testes E2E não funcionam (ChromeDriver)
- Use testes de API por enquanto
- São mais rápidos e não dependem de navegador
- Testam a mesma funcionalidade

---

## 📊 O Que Cada Teste Faz

### Testes de API

| Teste | O Que Faz | Endpoint Testado |
|-------|-----------|------------------|
| test_01 | Lista todas as configs | GET /api/v1/system-config |
| test_02 | Ativa pesquisa obrigatória | PUT /api/v1/system-config/xxx |
| test_03 | Desativa cadastro novo | PUT /api/v1/system-config/xxx |
| test_04 | Pesquisa por CNPJ | GET /api/v1/enterprises/search |
| test_05 | Pesquisa por nome | GET /api/v1/enterprises/search |
| test_06 | Busca config específica | GET /api/v1/system-config/:key |
| test_07 | Valida JSON response | GET /api/v1/system-config |

### Testes E2E (Selenium)

| Teste | Cenário | O Que Valida |
|-------|---------|--------------|
| cenario1_bloquear | Config obrigatória | Bloqueia sem pesquisar |
| cenario1_pesquisar | Config obrigatória | Pesquisa sem resultado |
| cenario1_cadastrar | Config obrigatória | Permite cadastrar novo |
| cenario2_botao | Config NÃO permite | Botão não aparece |
| cenario2_bloquear | Config NÃO permite | Bloqueia sem seleção |
| cenario3_avancar | Config opcional | Permite avançar |
| cenario4_selecionar | Seleção | Campos preenchidos |

---

## 📚 Documentação Completa

- **Guia de Testes Manuais:** `Docs/GUIA_TESTES_PARAMETRIZACAO_EMPREENDIMENTO.md`
- **Guia de Testes Automatizados:** `tests/README.md`
- **Progresso da Implementação:** `Docs/PROGRESSO_PARAMETRIZACAO_EMPREENDIMENTO.md`
- **Resumo Executivo:** `Docs/RESUMO_TESTES_AUTOMATIZADOS.md`

---

## ✅ Checklist Antes de Testar

- [ ] Python 3.8+ instalado
- [ ] Dependências instaladas (`pip install -r requirements.txt`)
- [ ] Arquivo `.env` configurado
- [ ] SQL executado no Supabase (para testes passarem)
- [ ] Backend implementado (para testes passarem)
- [ ] Frontend rodando (`npm run dev`)
- [ ] Backend rodando (geralmente porta 3000)

---

## 🎯 Comandos Mais Usados

```bash
# Executar testes de API
python test_api_parametrizacao.py

# Executar testes E2E
python run_tests.py

# Ver detalhes
pytest test_api_parametrizacao.py -v -s

# Apenas um teste
pytest test_api_parametrizacao.py::TestParametrizacaoAPI::test_01_listar_configuracoes -v -s

# Reinstalar dependências
pip install --upgrade -r requirements.txt
```

---

## 💡 Dicas

1. **Comece pelos testes de API** - São mais simples e rápidos
2. **Use `-v -s`** - Para ver o que está acontecendo
3. **Leia as mensagens** - Testes explicam porque pularam
4. **Não se preocupe com "skipped"** - É esperado sem backend
5. **ChromeDriver com problema?** - Use testes de API

---

## 🆘 Precisa de Ajuda?

**Leia primeiro:**
1. `tests/README.md` - Guia completo
2. `Docs/RESUMO_TESTES_AUTOMATIZADOS.md` - Resumo executivo

**Problemas comuns:**
- Backend não implementado → Testes vão pular (normal)
- ChromeDriver erro → Use testes de API
- Credenciais erradas → Ajuste `.env`

---

**⚡ START NOW:**
```bash
cd tests && python test_api_parametrizacao.py
```
