# 🧪 Guia: Teste Automatizado de Edição de Atividades

## 📋 Contexto

O teste automatizado de edição (`test_activities_edit_selenium.py`) precisa clicar no **botão correto** para abrir o modal de edição.

## 🎯 Ordem dos Botões de Ação

Na lista de atividades, cada linha possui **4 botões** de ação (da esquerda para direita):

| Índice | Ícone | Função | Ação |
|--------|-------|--------|------|
| **0** | 👁️ | **Visualizar** | Abre modal de visualização (somente leitura) |
| **1** | 📝 | **Editar** | Abre modal de edição (permite alterações) |
| **2** | 🔄 | **Toggle Status** | Ativa/Desativa a atividade |
| **3** | 🗑️ | **Deletar** | Exclui a atividade |

## ✅ Correção Aplicada

### ❌ Código Incorreto (usava o primeiro botão)
```python
buttons = row.find_elements(By.CSS_SELECTOR, 'button')
edit_btn = buttons[0] if buttons else None  # ❌ Errado: abre visualização
```

### ✅ Código Correto (usa o segundo botão)
```python
buttons = row.find_elements(By.CSS_SELECTOR, 'button')
edit_btn = buttons[1] if len(buttons) >= 2 else None  # ✅ Correto: abre edição
```

## 🔍 Localizações Corrigidas

O arquivo `test_activities_edit_selenium.py` foi corrigido em **2 localizações**:

### 1️⃣ Linha ~160 (Busca inicial da atividade)
```python
# Usar o segundo botão (índice 1) que é o de editar
if len(buttons) >= 2:
    edit_button = buttons[1]  # Segundo botão = Editar
    print(f"  ✓ Botão de editar selecionado (2º botão)")
    activity_found = True
```

### 2️⃣ Linha ~392 (Verificação final após salvar)
```python
# Encontrar botão de editar (segundo botão)
buttons = row.find_elements(By.CSS_SELECTOR, 'button')
edit_btn = buttons[1] if len(buttons) >= 2 else None  # ✅ Corrigido
```

## 🚀 Como Executar o Teste

```powershell
# Executar o teste de edição
python tests\test_activities_edit_selenium.py
```

## 📊 Fluxo do Teste

1. **Login** no sistema
2. **Navegar** para Administração → Atividades
3. **Buscar** atividade com padrão "Teste Automático"
4. **Clicar** no **segundo botão (📝 Editar)** da linha
5. **Aguardar** modal de edição abrir
6. **Modificar** descrição, faixas e portes
7. **Salvar** alterações
8. **Verificar** se modal fechou
9. **Reabrir** a atividade editada (usando **segundo botão novamente**)
10. **Validar** se as alterações foram salvas corretamente

## 🎯 Validações Realizadas

✅ Modal de edição abre corretamente  
✅ Campos são preenchidos com valores existentes  
✅ Alterações são salvas no banco de dados  
✅ Modal fecha após salvar  
✅ Valores editados persistem na reabertura  
✅ Faixas de porte são atualizadas corretamente  

## 📝 Observações Importantes

- **Índice começa em 0**: Em Selenium, `buttons[0]` é o primeiro botão, `buttons[1]` é o segundo
- **Verificação de quantidade**: Sempre verificar `len(buttons) >= 2` antes de acessar `buttons[1]`
- **Screenshots**: O teste captura screenshots em `tests/screenshots/` para debug
- **DevTools**: O Chrome é aberto com DevTools para facilitar análise de erros

## 🔧 Troubleshooting

### Problema: Modal não abre
**Causa**: Está clicando em `buttons[0]` (visualizar) em vez de `buttons[1]` (editar)  
**Solução**: Usar sempre `buttons[1]` para abrir modal de edição

### Problema: IndexError ao acessar buttons[1]
**Causa**: Linha não possui 2 ou mais botões  
**Solução**: Usar `buttons[1] if len(buttons) >= 2 else None`

### Problema: Teste passa mas alterações não salvam
**Causa**: Modal de visualização não permite edição  
**Solução**: Confirmar que está usando `buttons[1]` (editar)

## ✅ Status

- [x] Correção aplicada na linha ~160 (busca inicial)
- [x] Correção aplicada na linha ~392 (verificação final)
- [x] Validação de quantidade de botões adicionada
- [x] Comentários explicativos incluídos

---

**Data da correção:** 22/11/2025  
**Arquivo:** `tests/test_activities_edit_selenium.py`
