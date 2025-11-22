# Quick Start - Testes Novo Empreendimento

## 🚀 Execução Rápida

### 1. Preparar Ambiente

```powershell
# Terminal 1: Frontend
cd d:\code\python\github-dzabccvf
npm run dev

# Terminal 2: Backend (se necessário para atividades)
# python main.py
```

### 2. Executar Testes

```powershell
# Terminal 3: Testes
cd d:\code\python\github-dzabccvf\tests
python orchestrator_novo_empreendimento.py
```

---

## ✅ Status Atual

| # | Teste | Status | Descrição |
|---|-------|--------|-----------|
| 01 | Menu e Navegação | ✅ Pronto | Login + Abre wizard |
| 02 | Etapa Imóvel | ✅ Pronto | Cria imóvel aleatório |
| 03 | Dados Gerais | ✅ Pronto | Auto-fill com botão 🪄 |
| 04 | Atividades | 🚧 TODO | Seleciona atividades |
| 05 | Caracterização | 🚧 TODO | Finaliza cadastro |

---

## 📋 Checklist Pré-Execução

- [ ] Frontend rodando em `http://localhost:5173`
- [ ] ChromeDriver instalado em `C:\chromedriver\chromedriver.exe`
- [ ] Credenciais de login corretas
- [ ] Selenium instalado (`pip install selenium`)

---

## 🎯 Objetivo dos Testes

Validar o fluxo completo de **cadastro de Novo Empreendimento** no modo **Motor/Engine**, incluindo:

1. Navegação até o wizard
2. Criação/seleção de imóvel
3. Preenchimento de dados gerais
4. Seleção de atividades
5. Caracterização do empreendimento

---

## 🔧 Customização

### Mudar credenciais de login:

Edite `test_novo_empreendimento_01_menu_navegacao.py`:

```python
LOGIN_CPF = "seu_cpf"
LOGIN_PASSWORD = "sua_senha"
```

### Mudar tipo de imóvel (fixar em vez de aleatório):

Edite `test_novo_empreendimento_02_imovel.py`:

```python
# Linha 60 - Comentar escolha aleatória
# tipo_escolhido = random.choice(tipos_imovel)

# Fixar tipo desejado
tipo_escolhido = 'RURAL'  # ou 'URBANO' ou 'LINEAR'
```

### Aumentar timeout:

Edite nos arquivos de teste:

```python
TIMEOUT = 30  # aumentar de 20 para 30
```

---

## 📸 Screenshots

Erros geram screenshots automaticamente em:
```
tests/screenshots/erro_teste_XX_timestamp.png
```

---

## 🎉 Próximos Testes

Para criar novo teste (exemplo: 03_dados_gerais):

1. Copiar estrutura de `02_imovel.py`
2. Adaptar para etapa Dados Gerais
3. Implementar função `executar_teste(driver_existente, contexto_anterior)`
4. Adicionar no orquestrador

---

**Dúvidas?** Veja `README_TESTES_NOVO_EMPREENDIMENTO.md`
