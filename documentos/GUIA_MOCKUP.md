# 🎭 Sistema de Mockup - Guia Completo

**Versão**: 1.0.0  
**Data**: 24/11/2025  
**Status**: ✅ Ativo

---

## 📋 O que é?

Sistema de **dados mockados** (fake data) para desenvolvimento, permitindo trabalhar sem depender do backend estar 100% pronto.

---

## ⚙️ Como Funciona

### 🎯 Comportamentos Implementados

#### 1. **Lista de Empreendimentos (Dashboard)**
- ✅ Se a API retornar **lista vazia**
- ✅ E o mockup estiver **habilitado**
- ✅ Carrega **5 empreendimentos** do arquivo `dados_teste_5_empreendimentos.json`

#### 2. **Salvamento de Caracterização**
- ✅ Ao clicar em **"Finalizar"** na aba Caracterização
- ✅ Se o mockup estiver **habilitado**
- ✅ Salva dados do arquivo `dados_exemplo_empreendimento.json`
- ✅ Com **variação aleatória** (±20% a 50% nos valores numéricos)
- ✅ Gera ID único mockado

---

## 🔧 Como Ativar/Desativar

### ⚠️ **MASTER SWITCH - Controle Central**

Arquivo: `src/config/mockup.ts`

```typescript
export const MOCKUP_CONFIG = {
  /**
   * ⚠️ ALTERAR AQUI para desativar TUDO
   * 
   * true  = Usa mockup (desenvolvimento)
   * false = Usa API real (produção)
   */
  USE_MOCKUP: true,  // ⬅️ MUDE PARA false QUANDO BACKEND ESTIVER PRONTO
  
  modules: {
    enterpriseList: {
      enabled: true,        // Lista de empreendimentos
      loadIfEmpty: true,    // Só carrega se API retornar vazio
    },
    characterization: {
      enabled: true,        // Caracterização
      randomizeData: true,  // Varia dados aleatoriamente
    },
  },
  
  debug: {
    logMockupUsage: true,   // Loga no console quando usa mockup
    showWarnings: true,     // Mostra toast "🎭 Usando mockup"
  },
};
```

---

## 🚀 Como Desativar Quando Backend Estiver Pronto

### Opção 1: Desativar TUDO (Recomendado)

```typescript
// src/config/mockup.ts
export const MOCKUP_CONFIG = {
  USE_MOCKUP: false,  // ⬅️ UMA ÚNICA MUDANÇA
  // ... resto do arquivo
};
```

### Opção 2: Desativar Por Módulo

```typescript
// src/config/mockup.ts
export const MOCKUP_CONFIG = {
  USE_MOCKUP: true,
  modules: {
    enterpriseList: {
      enabled: false,  // ⬅️ Desativa lista mockada
    },
    characterization: {
      enabled: false,  // ⬅️ Desativa caracterização mockada
    },
  },
};
```

### Opção 3: Desativar Avisos (mas manter mockup)

```typescript
// src/config/mockup.ts
export const MOCKUP_CONFIG = {
  USE_MOCKUP: true,
  debug: {
    logMockupUsage: false,  // ⬅️ Não loga mais no console
    showWarnings: false,     // ⬅️ Não mostra mais toast
  },
};
```

---

## 📊 Dados Mockados

### Arquivos Fonte

#### 1. **Lista de 5 Empreendimentos**
```
documentos/backend/dados_teste_5_empreendimentos.json
```
- Agropecuária Santa Clara (Rural - PJ)
- Indústria Metal Sul (Urbano - PJ)
- Linha de Transmissão Energia Sul (Linear - PJ)
- Granja Vale Verde (Rural - PF)
- Hospital São Lucas (Urbano - PJ)

#### 2. **Empreendimento Completo**
```
documentos/backend/dados_exemplo_empreendimento.json
```
- Fazenda Teste 6354
- Mineração ABC (150 funcionários)
- 3 Partícipes
- 1 Atividade (extração de carvão)
- Caracterização completa

---

## 🎲 Variação Aleatória

### Caracterização

Quando salva caracterização com mockup, os dados são **randomizados**:

#### Valores Numéricos
- **Quantidade de combustível**: ±30%
- **Consumo de água**: ±40%
- **Volume de resíduos**: ±50%
- **Volume de despejo**: ±30%

#### Valores Categóricos
- **Origem da água**: Aleatório entre 5 opções
- **Tratamento de efluentes**: Sim/Não aleatório
- **Tipo de tratamento**: 4 opções aleatórias
- **Perguntas ambientais**: 10 perguntas com respostas aleatórias
- **Informações adicionais**: 5 textos diferentes

#### Exemplo de Variação

**Base** (dados_exemplo_empreendimento.json):
```json
{
  "consumo_humano": 5.5,
  "consumo_outros_usos": 12.3
}
```

**Mockup 1** (salvamento 1):
```json
{
  "consumo_humano": 6.8,    // +24%
  "consumo_outros_usos": 10.1 // -18%
}
```

**Mockup 2** (salvamento 2):
```json
{
  "consumo_humano": 4.2,    // -24%
  "consumo_outros_usos": 15.6 // +27%
}
```

---

## 🔍 Como Identificar Dados Mockados

### No Console do Navegador

```
🎭 [MOCKUP] Lista vazia - carregando 5 empreendimentos mockados
🎭 [MOCKUP] Gerando dados de caracterização mockados com variação aleatória
🎭 [MOCKUP] Salvando caracterização com dados mockados (randomizados)
```

### Na Tela (Toast)

```
🎭 Usando dados mockados (desenvolvimento)
🎭 Salvando com dados mockados (desenvolvimento)
```

### Nos Dados Salvos

Dados mockados incluem propriedades especiais:

```json
{
  "caracterizacao": {
    "_mockup": true,
    "_mockup_id": 1732462891234,
    "uso_agua": { ... }
  }
}
```

---

## 🛠️ Arquitetura

### Arquivos Criados

```
src/
├── config/
│   └── mockup.ts                    # ⚙️ Configuração central
├── services/
│   └── mockupService.ts             # 🎭 Lógica de geração de mockup
├── pages/
│   ├── Dashboard.tsx                # ✅ Usa mockup na lista
│   └── empreendimento/
│       └── CaracterizacaoEmpreendimentoPage.tsx  # ✅ Usa mockup no salvamento
documentos/backend/
├── dados_exemplo_empreendimento.json    # 📄 Dados base
└── dados_teste_5_empreendimentos.json  # 📄 5 registros
```

### Fluxo de Execução

#### Lista de Empreendimentos

```
Dashboard.tsx
  └─> loadEnterprises()
       └─> listEnterprises() [API]
            └─> result.length === 0?
                 ├─ SIM -> shouldUseMockup('enterpriseList')?
                 │          ├─ SIM -> getMockEnterpriseList()
                 │          │          └─> Retorna 5 registros
                 │          └─ NÃO -> [] (vazio)
                 └─ NÃO -> result (dados reais)
```

#### Salvamento de Caracterização

```
CaracterizacaoEmpreendimentoPage.tsx
  └─> handleNext()
       └─> shouldUseMockup('characterization')?
            ├─ SIM -> getMockCharacterizationData()
            │          └─> Randomiza valores
            │          └─> Retorna dados mockados
            │          └─> await mockDelay(800ms)
            └─ NÃO -> Usa formData normal
```

---

## ✅ Checklist de Produção

Antes de fazer deploy, verifique:

- [ ] `USE_MOCKUP` está `false` em `src/config/mockup.ts`
- [ ] Backend está implementado e testado
- [ ] APIs de persistência estão funcionando
- [ ] Removeu `console.log` de debug do mockup
- [ ] Testou fluxo completo sem mockup
- [ ] Verificou que nenhum `_mockup: true` aparece nos dados

---

## 🐛 Troubleshooting

### Problema: Mockup não está funcionando

**Verificar**:
1. `USE_MOCKUP` está `true`?
2. `modules.enterpriseList.enabled` está `true`?
3. Arquivos JSON existem em `documentos/backend/`?
4. Console mostra logs `🎭 [MOCKUP]`?

### Problema: Lista não carrega mockup

**Verificar**:
1. API está retornando **lista vazia** `[]`?
2. `loadIfEmpty` está `true`?
3. Backend não está retornando erro 500?

### Problema: Caracterização não salva mockup

**Verificar**:
1. `modules.characterization.enabled` está `true`?
2. Clicou no botão **"Finalizar"**?
3. Console mostra erros?

---

## 📝 Exemplo de Uso

### Desenvolvimento

```typescript
// src/config/mockup.ts
export const MOCKUP_CONFIG = {
  USE_MOCKUP: true,  // ✅ Desenvolvimento
  // ...
};
```

**Comportamento**:
- ✅ Lista vazia → Carrega 5 empreendimentos mockados
- ✅ Salva caracterização → Dados randomizados
- ✅ Mostra avisos 🎭 no console e toast

### Produção

```typescript
// src/config/mockup.ts
export const MOCKUP_CONFIG = {
  USE_MOCKUP: false,  // ✅ Produção
  // ...
};
```

**Comportamento**:
- ✅ Lista vazia → Mostra vazio (sem mockup)
- ✅ Salva caracterização → Dados reais do formulário
- ✅ Sem avisos ou logs de mockup

---

## 🔗 Links Relacionados

- [Documentação Backend](./documentos/backend/passar_para_back.md)
- [Dados Exemplo](./documentos/backend/dados_exemplo_empreendimento.json)
- [5 Registros Teste](./documentos/backend/dados_teste_5_empreendimentos.json)
- [Refatoração Testes](./tests/README_REFATORACAO_TESTES.md)

---

**Atualizado em**: 24/11/2025  
**Por**: GitHub Copilot  
**Versão do Sistema**: 2.3.1
