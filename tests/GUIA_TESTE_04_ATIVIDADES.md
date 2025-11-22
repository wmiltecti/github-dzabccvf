# 📋 Guia de Execução - Teste 04: Atividades

## 📌 Visão Geral

O **Teste 04** valida a etapa de **Atividades do Empreendimento** no fluxo do Motor BPMN. Este teste é mais complexo pois trabalha com:

- Seleção de atividades do sistema (modal com busca)
- Preenchimento de dados quantitativos
- Dados automáticos vindos do cadastro de atividades
- Form-repeat para múltiplas atividades

## 🎯 Objetivo

Automatizar a seleção e configuração de atividades que serão desenvolvidas no empreendimento.

## 📊 Estrutura do Teste

### Etapas Executadas:

1. **Validar Página de Atividades**
   - Scroll para topo da página
   - Verificar título "Atividades do Empreendimento"

2. **Clicar em "Adicionar Atividade do Sistema"**
   - Botão azul com ícone de "+"
   - Abre modal de seleção

3. **Modal de Seleção**
   - Validar abertura do modal "Selecionar Atividade Cadastrada"
   - Campo de busca disponível
   - Buscar por termo (opcional): "Pesquisa mineral"

4. **Selecionar Atividade**
   - Clicar no card da atividade desejada
   - Primeira atividade disponível ou filtrada pela busca
   - Modal fecha automaticamente

5. **Validar Atividade Adicionada**
   - Verificar seção "Atividades Selecionadas"
   - Card com dados da atividade (código, nome, porte, potencial)

6. **Preencher Dados Quantitativos**
   - **Unidade de Medida**: Geralmente pré-definida (readonly)
   - **Quantidade**: 150
   - **Área Ocupada**: 2500.50 m²

7. **Avançar para Caracterização**
   - Clicar em "Próximo"
   - Validar navegação para etapa seguinte

## 📂 Arquivos Relacionados

- **Teste**: `test_novo_empreendimento_04_atividades.py`
- **Componente**: `src/pages/empreendimento/AtividadesEmpreendimentoPage.tsx`
- **Orquestrador**: `orchestrator_novo_empreendimento.py`

## 🔍 Dados de Teste

```python
DADOS_ATIVIDADE = {
    'busca': 'Pesquisa mineral',  # Termo de busca (opcional)
    'quantidade': '150',
    'area_ocupada': '2500.50'
}
```

## 🎨 Interface - Fluxo Visual

### 1. Página Inicial de Atividades
```
┌─────────────────────────────────────────────────┐
│ 📊 Atividades do Empreendimento                 │
│ Selecione as atividades que serão desenvolvidas│
│                                                 │
│ [➕ Adicionar Atividade do Sistema]            │
│                                                 │
│ ┌─ Nenhuma atividade selecionada ────────┐    │
│ │ 📊 Clique em "Adicionar Atividade..."   │    │
│ └──────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### 2. Modal de Seleção
```
┌──────────── Selecionar Atividade Cadastrada ────┐
│                                              [✕] │
│ 🔍 [Buscar por nome ou código da atividade...]  │
│                                                  │
│ ┌─────────────────────────────────────────┐    │
│ │ Cód. 1.1                                 │    │
│ │ Pesquisa mineral com guia                │    │
│ │ Porte: Mínimo | Potencial Poluidor: Médio│   │
│ └─────────────────────────────────────────┘    │
│ ┌─────────────────────────────────────────┐    │
│ │ Cód. 1.11                                │    │
│ │ Teste atividade2                         │    │
│ │ Potencial Poluidor: Alto                 │    │
│ └─────────────────────────────────────────┘    │
└──────────────────────────────────────────────────┘
```

### 3. Atividade Selecionada
```
┌──────────── Atividades Selecionadas (1) ────────┐
│                                                  │
│ ┌─ Atividade #1 ───────────────────────── [🗑]  │
│ │ #1  Cód. 1.1                                  │
│ │ Pesquisa mineral com guia                     │
│ │                                               │
│ │ ┌─ PORTE DO EMPREENDIMENTO ──────────────┐   │
│ │ │ 🟡 Mínimo                                │   │
│ │ └──────────────────────────────────────────┘   │
│ │ ┌─ POTENCIAL POLUIDOR ────────────────────┐   │
│ │ │ 🟡 Médio                                 │   │
│ │ └──────────────────────────────────────────┘   │
│ │                                               │
│ │ DADOS QUANTITATIVOS                           │
│ │ ┌──────────────┬──────────────┬─────────────┐│
│ │ │ Unidade      │ Quantidade   │ Área (m²)   ││
│ │ │ ha           │ [150______]  │ [2500.50__] ││
│ │ └──────────────┴──────────────┴─────────────┘│
│ └───────────────────────────────────────────────┘
│                                                  │
│ [◀️ Anterior]              [Próximo ▶️]          │
└──────────────────────────────────────────────────┘
```

## ⚙️ Seletores Importantes

### Botões
- **Adicionar Atividade**: `//button[contains(., 'Adicionar Atividade do Sistema')]`
- **Card de Atividade**: `//div[contains(@class, 'border rounded-lg p-4 cursor-pointer')]`
- **Próximo**: `//button[contains(., 'Próximo')]`

### Campos
- **Busca**: `//input[contains(@placeholder, 'Buscar por nome ou código')]`
- **Quantidade**: `//input[@type='number' and contains(@placeholder, 'Quantidade')]`
- **Área Ocupada**: `//input[@type='number' and contains(@placeholder, '500.00')]`

### Validação
- **Título Modal**: `//*[contains(text(), 'Selecionar Atividade Cadastrada')]`
- **Atividades Selecionadas**: `//*[contains(text(), 'Atividades Selecionadas')]`
- **Caracterização**: `//*[contains(text(), 'Caracterização')]`

## 📝 Dados Automáticos (do Cadastro)

Os seguintes dados vêm automaticamente do cadastro de atividades:

✅ **Código** - Ex: 1.1, 1.11, 5.1  
✅ **Nome** - Ex: "Pesquisa mineral com guia"  
✅ **Descrição** - Descrição detalhada da atividade  
✅ **Porte do Empreendimento** - Mínimo, Pequeno, Médio, Grande, Excepcional  
✅ **Potencial Poluidor** - Baixo, Médio, Alto  
✅ **Unidade de Medida** - ha, ton/mês, m³/mês, etc.

## ✏️ Dados a Preencher

O usuário/teste deve preencher:

🔹 **Quantidade** - Valor numérico conforme unidade  
🔹 **Área Ocupada** - Em metros quadrados (m²)  
🔹 **Mapa** (opcional) - Georreferenciamento da atividade

## 🔄 Fluxo Completo

```
1. Página Atividades
   ↓ [Clicar "Adicionar Atividade"]
2. Modal de Seleção
   ↓ [Buscar (opcional)]
   ↓ [Clicar card da atividade]
3. Atividade Adicionada
   ↓ [Preencher Quantidade]
   ↓ [Preencher Área Ocupada]
   ↓ [Clicar "Próximo"]
4. Caracterização ✅
```

## 🚀 Execução

### Via Orquestrador (Recomendado)
```bash
cd D:\code\python\github-dzabccvf\tests
python orchestrator_novo_empreendimento.py
```

### Standalone (apenas Teste 04)
```bash
# ⚠️ NÃO RECOMENDADO - precisa do contexto dos testes anteriores
python test_novo_empreendimento_04_atividades.py
```

## ✅ Validações

- [x] Página de Atividades carregada
- [x] Botão "Adicionar Atividade" visível e clicável
- [x] Modal abre corretamente
- [x] Campo de busca funcional
- [x] Cards de atividades exibidos
- [x] Seleção de atividade funciona
- [x] Modal fecha após seleção
- [x] Card de atividade selecionada exibido
- [x] Dados automáticos preenchidos (porte, potencial)
- [x] Campos de dados quantitativos editáveis
- [x] Botão "Próximo" avança para Caracterização

## ⚠️ Pontos de Atenção

1. **Scroll Automático**: O teste faz scroll para topo no início
2. **Busca Opcional**: Pode buscar termo específico ou selecionar primeira disponível
3. **Unidade Readonly**: Campo pode estar bloqueado (vem do cadastro)
4. **Dados Mockados**: API pode retornar dados de exemplo
5. **Toast Messages**: Confirma seleção com mensagem "Atividade adicionada"

## 🐛 Debugging

Se o teste falhar:

1. **Screenshot**: Verifica arquivo `erro_teste_04_*.png`
2. **Logs**: Analisa output do console
3. **Modal não abre**: Verifica se botão está visível
4. **Card não clicável**: Pode estar já selecionado (verde)
5. **Campos não preenchem**: Verifica seletores no código

## 📈 Próximos Passos

Após sucesso do Teste 04:

- **Teste 05**: Caracterização do Empreendimento
- **Teste 06**: Finalização e Salvamento

---

**Status**: ✅ Implementado  
**Última atualização**: 22/11/2025  
**Branch**: feature/evolucao-features
