# Testes Automatizados - Parametrização de Empreendimento

## 📋 Visão Geral

Testes automatizados usando **Selenium WebDriver** + **Pytest** para validar os 4 cenários de parametrização de empreendimento.

## 🚀 Instalação

### 1. Instalar Python 3.8+
Certifique-se de ter Python instalado:
```bash
python --version
```

### 2. Instalar dependências
```bash
cd tests
pip install -r requirements.txt
```

### 3. Configurar variáveis de ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env com suas credenciais
notepad .env  # Windows
```

**Arquivo .env:**
```env
TEST_BASE_URL=http://localhost:5173
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=admin123
TEST_CNPJ_EXISTENTE=12345678000199
```

## 🧪 Executar Testes

### Método 1: Script Interativo (Recomendado)
```bash
python run_tests.py
```

Menu interativo:
```
1. Executar TODOS os testes
2. Cenário 1: Pesquisa OBRIGATÓRIA + Cadastro PERMITIDO
3. Cenário 2: Pesquisa OBRIGATÓRIA + Cadastro NÃO PERMITIDO
4. Cenário 3: Pesquisa OPCIONAL
5. Cenário 4: Empreendimento Existente
```

### Método 2: Pytest Direto
```bash
# Todos os testes
pytest test_parametrizacao_empreendimento.py -v -s

# Apenas Cenário 1
pytest test_parametrizacao_empreendimento.py -k cenario1 -v -s

# Apenas Cenário 2
pytest test_parametrizacao_empreendimento.py -k cenario2 -v -s

# Teste específico
pytest test_parametrizacao_empreendimento.py::TestParametrizacaoEmpreendimento::test_cenario1_bloquear_sem_pesquisa -v -s
```

### Método 3: Modo Headless (sem interface gráfica)
Edite `test_parametrizacao_empreendimento.py` linha 31:
```python
chrome_options.add_argument('--headless')  # Descomentar esta linha
```

## 📊 Cobertura de Testes

### ✅ Cenário 1: Pesquisa OBRIGATÓRIA + Cadastro PERMITIDO
- `test_cenario1_bloquear_sem_pesquisa`: Valida bloqueio ao tentar avançar sem pesquisar
- `test_cenario1_pesquisar_sem_resultados`: Valida pesquisa sem resultados + botão "Cadastrar Novo"
- `test_cenario1_cadastrar_novo`: Valida abertura do formulário de novo cadastro

### ✅ Cenário 2: Pesquisa OBRIGATÓRIA + Cadastro NÃO PERMITIDO
- `test_cenario2_botao_novo_nao_aparece`: Valida que botão "Cadastrar Novo" não aparece
- `test_cenario2_bloquear_sem_selecao`: Valida bloqueio ao tentar avançar sem seleção

### ✅ Cenário 3: Pesquisa OPCIONAL
- `test_cenario3_avancar_sem_pesquisa`: Valida que pode cadastrar novo sem pesquisar

### ✅ Cenário 4: Empreendimento Existente
- `test_cenario4_selecionar_existente`: Valida seleção de empreendimento existente
  - ⚠️ **Requer dados reais no banco** - Ajuste `CNPJ_REAL` no código

## 🔧 Estrutura dos Testes

```python
class TestParametrizacaoEmpreendimento:
    def setup(self):
        # Inicializa navegador Chrome
        # Configurações de timeout e waits
    
    def login_admin(self):
        # Realiza login como administrador
    
    def configurar_sistema(self, pesquisa_obrigatoria, permitir_novo):
        # Ajusta toggles de configuração
    
    def iniciar_nova_solicitacao(self):
        # Navega até Etapa 3 do wizard
    
    def pesquisar_empreendimento(self, query):
        # Executa busca e retorna se encontrou resultados
    
    def tentar_avancar(self):
        # Tenta avançar e retorna se conseguiu
    
    # ... 8 testes automatizados
```

## 📸 Screenshots Automáticos

Quando um teste falha, screenshots são salvos automaticamente:
- `login_error.png`
- `config_error.png`
- `pesquisa_error.png`
- `iniciar_solicitacao_error.png`

## ⚠️ Pré-requisitos

1. **Aplicação rodando**: `npm run dev` (porta 5173)
2. **Backend ativo**: APIs de sistema e empreendimento funcionando
3. **SQL executado**: Tabela `system_configurations` criada
4. **Dados de teste**: Pelo menos 2 PJ e 2 PF no banco
5. **Usuário admin**: Credenciais válidas no .env

## 🐛 Troubleshooting

### Erro: "ChromeDriver not found"
```bash
# Reinstalar webdriver-manager
pip install --upgrade webdriver-manager
```

### Erro: "Element not found"
- Verifique seletores CSS/XPath no código
- Aumente TIMEOUT (linha 19 do test file)
- Execute em modo não-headless para ver o que está acontecendo

### Erro: "Login failed"
- Verifique credenciais no .env
- Confirme que usuário tem permissão de admin
- Verifique se página de login está acessível

### Teste pulado: "Sem dados no banco"
- Cenário 4 requer dados reais
- Ajuste `CNPJ_REAL` na linha 374 do código
- Ou adicione dados de teste no banco

## 📈 Relatório de Resultados

Após execução, pytest gera relatório:
```
test_cenario1_bloquear_sem_pesquisa PASSED         [ 12%]
test_cenario1_pesquisar_sem_resultados PASSED      [ 25%]
test_cenario1_cadastrar_novo PASSED                [ 37%]
test_cenario2_botao_novo_nao_aparece PASSED        [ 50%]
test_cenario2_bloquear_sem_selecao PASSED          [ 62%]
test_cenario3_avancar_sem_pesquisa PASSED          [ 75%]
test_cenario4_selecionar_existente PASSED          [100%]

========================= 7 passed in 145.32s =========================
```

## 🔄 CI/CD Integration

Para integrar com GitHub Actions:
```yaml
- name: Run E2E Tests
  run: |
    cd tests
    pip install -r requirements.txt
    pytest test_parametrizacao_empreendimento.py --junitxml=results.xml
```

## 📚 Referências

- [Selenium Python Docs](https://selenium-python.readthedocs.io/)
- [Pytest Documentation](https://docs.pytest.org/)
- [WebDriver Manager](https://github.com/SergeyPirogov/webdriver_manager)
