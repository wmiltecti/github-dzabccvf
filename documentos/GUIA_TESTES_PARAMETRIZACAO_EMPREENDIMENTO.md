# 🧪 Guia de Testes - Parametrização de Empreendimento

**Data:** 2025-11-10  
**Versão:** 1.0  
**Branch:** sp4-task-imove-refat-linear

---

## 📋 Pré-requisitos

### 1. Backend Configurado
- [ ] SQL executado no Supabase (`Docs/database/001_system_configurations.sql`)
- [ ] Rotas backend implementadas:
  - `GET /api/v1/system-config`
  - `GET /api/v1/system-config/:key`
  - `PUT /api/v1/system-config/:key`
  - `GET /api/v1/enterprises/search?query=xxx`
- [ ] Usuário com role `admin` configurado no Supabase

### 2. Frontend Rodando
```bash
npm run dev
```
- [ ] Aplicação acessível em http://localhost:5173 (ou porta configurada)
- [ ] Login funcionando
- [ ] Sem erros no console

### 3. Dados de Teste no Banco
- [ ] Pelo menos 2 pessoas jurídicas cadastradas
- [ ] Pelo menos 2 pessoas físicas cadastradas
- [ ] CNPJs/CPFs variados para testar busca

---

## 🎯 Cenários de Teste

## **CENÁRIO 1: Pesquisa OBRIGATÓRIA + Cadastro PERMITIDO**

### Configuração Inicial
1. Acesse: **Dashboard → Menu Lateral → Administração → Configurações do Sistema**
2. Configure os toggles:
   - ✅ **"Exigir pesquisa de empreendimento antes de cadastrar"** = **ATIVO (Verde)**
   - ✅ **"Permitir cadastro de novo empreendimento"** = **ATIVO (Verde)**
3. Aguarde toast de confirmação "Configuração atualizada com sucesso!"

### Passo a Passo

#### **Teste 1.1: Bloquear avanço sem pesquisar**
1. Acesse: **Dashboard → Solicitação de Processo**
2. Preencha as etapas 1 (Participantes) e 2 (Imóvel) normalmente
3. Avance para etapa 3 (Empreendimento)
4. **NÃO FAÇA NENHUMA PESQUISA**
5. Tente preencher os campos e clicar em "Próximo"

**✅ Resultado Esperado:**
- Toast vermelho: "Por favor, pesquise o empreendimento antes de continuar"
- Não avança para próxima etapa
- Campos do formulário não são validados antes da pesquisa

#### **Teste 1.2: Pesquisar sem resultados**
1. Na mesma tela (etapa 3 - Empreendimento)
2. Digite no campo de pesquisa: `99999999999999` (CNPJ inexistente)
3. Clique em "Buscar"

**✅ Resultado Esperado:**
- Spinner de loading durante busca
- Toast azul: "Nenhum empreendimento encontrado"
- Card amarelo exibido: "Nenhum empreendimento encontrado"
- Mensagem: "Não encontramos empreendimentos com o termo..."

#### **Teste 1.3: Cadastrar novo empreendimento**
1. Após a pesquisa sem resultados
2. Deve aparecer botão: **"Cadastrar Novo Empreendimento"** (verde)

**✅ Resultado Esperado:**
- Botão verde visível abaixo da área de pesquisa
- Texto: "Não encontrou o empreendimento? Cadastre um novo abaixo."

3. Clique no botão "Cadastrar Novo Empreendimento"

**✅ Resultado Esperado:**
- Toast verde: "Modo de novo cadastro ativado. Preencha os dados abaixo."
- Card verde aparece: "Novo Cadastro de Empreendimento"
- Seções do formulário ficam visíveis (Dados do Empreendimento, Licença, etc.)
- Componente de pesquisa desaparece

#### **Teste 1.4: Preencher e submeter**
1. Preencha todos os campos obrigatórios:
   - Tipo de Empreendimento: selecione qualquer opção (exceto "Selecione")
   - Tipo de Licença: selecione qualquer opção
   - Situação: selecione qualquer opção
2. Clique em "Próximo"

**✅ Resultado Esperado:**
- Validações dos campos são executadas
- Se tudo preenchido: avança para etapa 4 (Formulário)
- Se falta campo: toast vermelho com mensagem específica

---

## **CENÁRIO 2: Pesquisa OBRIGATÓRIA + Cadastro NÃO PERMITIDO**

### Configuração Inicial
1. Acesse: **Configurações do Sistema**
2. Configure os toggles:
   - ✅ **"Exigir pesquisa de empreendimento antes de cadastrar"** = **ATIVO (Verde)**
   - ❌ **"Permitir cadastro de novo empreendimento"** = **INATIVO (Cinza)**
3. Aguarde confirmação

### Passo a Passo

#### **Teste 2.1: Pesquisar sem resultados**
1. Inicie nova solicitação (ou reinicie processo)
2. Preencha etapas 1 e 2
3. Na etapa 3, pesquise por: `88888888888888` (CNPJ inexistente)
4. Clique em "Buscar"

**✅ Resultado Esperado:**
- Toast: "Nenhum empreendimento encontrado"
- Card amarelo exibido
- **BOTÃO "Cadastrar Novo" NÃO APARECE** (diferente do Cenário 1)

#### **Teste 2.2: Tentar avançar sem selecionar**
1. Após pesquisa sem resultados
2. Clique diretamente em "Próximo" (sem cadastrar novo)

**✅ Resultado Esperado:**
- Toast vermelho: "Cadastro de novo empreendimento não permitido. Selecione um empreendimento existente"
- Não avança para próxima etapa
- Seções do formulário permanecem ocultas

#### **Teste 2.3: Pesquisar e encontrar resultado**
1. Pesquise por CNPJ/CPF real do banco: `12345678000199` (ajuste conforme seus dados)
2. Clique em "Buscar"

**✅ Resultado Esperado:**
- Toast verde: "X empreendimento(s) encontrado(s)!"
- Lista de resultados exibida com cards
- Cada card mostra:
  - Ícone (Building2 para PJ, User para PF)
  - Nome/Razão Social
  - Documento formatado
  - Endereço
  - Botão "Selecionar"

3. Clique em "Selecionar" em um dos resultados

**✅ Resultado Esperado:**
- Toast verde: "Empreendimento selecionado com sucesso!"
- Card verde aparece no topo mostrando empreendimento selecionado
- Componente de pesquisa desaparece
- Seções do formulário ficam visíveis
- Campos preenchidos automaticamente (se houver dados vinculados)

---

## **CENÁRIO 3: Pesquisa OPCIONAL**

### Configuração Inicial
1. Acesse: **Configurações do Sistema**
2. Configure os toggles:
   - ❌ **"Exigir pesquisa de empreendimento antes de cadastrar"** = **INATIVO (Cinza)**
   - ✅ **"Permitir cadastro de novo empreendimento"** = **ATIVO (Verde)**

### Passo a Passo

#### **Teste 3.1: Avançar sem pesquisar**
1. Inicie nova solicitação
2. Preencha etapas 1 e 2
3. Na etapa 3, **NÃO FAÇA PESQUISA**
4. Clique em "Cadastrar Novo Empreendimento" diretamente

**✅ Resultado Esperado:**
- Botão "Cadastrar Novo" visível mesmo sem pesquisa
- Ao clicar: modo novo cadastro ativado
- Formulário aparece sem validação de pesquisa prévia

#### **Teste 3.2: Preencher e avançar livremente**
1. Preencha campos do formulário
2. Clique em "Próximo"

**✅ Resultado Esperado:**
- Avança normalmente sem checar se pesquisa foi feita
- Apenas valida campos obrigatórios do formulário

#### **Teste 3.3: Pesquisa ainda funciona**
1. Reinicie o processo
2. Na etapa 3, faça uma pesquisa
3. Selecione um resultado

**✅ Resultado Esperado:**
- Pesquisa funciona normalmente
- Pode selecionar empreendimento existente
- Todas as funcionalidades de pesquisa permanecem

---

## **CENÁRIO 4: Empreendimento Existente com Dados**

### Configuração Inicial
- Qualquer configuração serve (recomendo: pesquisa OPCIONAL)

### Passo a Passo

#### **Teste 4.1: Pesquisar empreendimento**
1. Inicie nova solicitação
2. Na etapa 3, pesquise por CNPJ/CPF real
3. Clique em "Buscar"

**✅ Resultado Esperado:**
- Lista de resultados exibida corretamente
- Dados formatados (CNPJ com máscara, endereço completo)

#### **Teste 4.2: Selecionar empreendimento**
1. Clique em "Selecionar" em um resultado

**✅ Resultado Esperado:**
- Card verde de confirmação aparece no topo
- Mostra:
  - Ícone check verde
  - Nome do empreendimento
  - Documento formatado
  - Razão Social (se PJ)
  - Endereço completo
  - Botão X para remover seleção

#### **Teste 4.3: Campos preenchidos automaticamente**
1. Verifique as seções do formulário

**✅ Resultado Esperado:**
- Seções ficam visíveis
- Campos relacionados ao empreendimento:
  - Se houver mapeamento, devem vir preenchidos
  - Campos preenchidos devem estar em modo **readonly** (ou desabilitados)
  - Campos não mapeados ficam editáveis

#### **Teste 4.4: Remover seleção**
1. Clique no botão X no card verde

**✅ Resultado Esperado:**
- Toast azul: "Seleção removida"
- Card verde desaparece
- Componente de pesquisa volta a aparecer
- Seções do formulário ficam ocultas
- Histórico de pesquisa mantido (pode pesquisar novamente)

#### **Teste 4.5: Avançar e submeter**
1. Selecione novamente um empreendimento
2. Preencha campos obrigatórios
3. Avance pelas etapas seguintes
4. Na etapa 6 (Revisão), submeta o processo

**✅ Resultado Esperado:**
- Processo criado vinculado ao empreendimento selecionado
- ID do empreendimento salvo no banco
- Histórico de processo vinculado corretamente

---

## 🐛 Checklist de Bugs Comuns

### Interface
- [ ] Toasts aparecem e desaparecem corretamente
- [ ] Spinner de loading funciona durante busca
- [ ] Cards de resultado são clicáveis
- [ ] Botões mudam de cor no hover
- [ ] Componentes aparecem/desaparecem conforme esperado
- [ ] Não há elementos sobrepostos

### Comportamento
- [ ] Validações bloqueiam corretamente
- [ ] Configurações são respeitadas em tempo real
- [ ] Estado persiste entre mudanças de aba
- [ ] Limpar seleção funciona sem bugs
- [ ] Pesquisa retorna resultados corretos
- [ ] Máscaras de CNPJ/CPF aplicadas

### Dados
- [ ] Dados salvos no banco corretamente
- [ ] IDs vinculados entre tabelas
- [ ] Histórico de pesquisa registrado
- [ ] Timestamps atualizados

### Console
- [ ] Sem erros no console do navegador
- [ ] Sem warnings críticos
- [ ] Logs de debug aparecem conforme esperado
- [ ] Network requests retornam 200/201

---

## 📊 Planilha de Resultados

| Cenário | Teste | Status | Observações |
|---------|-------|--------|-------------|
| 1 | 1.1 - Bloquear sem pesquisa | ⬜ Pendente | |
| 1 | 1.2 - Pesquisar sem resultados | ⬜ Pendente | |
| 1 | 1.3 - Cadastrar novo | ⬜ Pendente | |
| 1 | 1.4 - Preencher e submeter | ⬜ Pendente | |
| 2 | 2.1 - Pesquisar sem resultados | ⬜ Pendente | |
| 2 | 2.2 - Tentar avançar bloqueado | ⬜ Pendente | |
| 2 | 2.3 - Selecionar existente | ⬜ Pendente | |
| 3 | 3.1 - Avançar sem pesquisa | ⬜ Pendente | |
| 3 | 3.2 - Preencher livremente | ⬜ Pendente | |
| 3 | 3.3 - Pesquisa funciona | ⬜ Pendente | |
| 4 | 4.1 - Pesquisar empreendimento | ⬜ Pendente | |
| 4 | 4.2 - Selecionar | ⬜ Pendente | |
| 4 | 4.3 - Campos preenchidos | ⬜ Pendente | |
| 4 | 4.4 - Remover seleção | ⬜ Pendente | |
| 4 | 4.5 - Submeter processo | ⬜ Pendente | |

**Legenda:**
- ✅ Passou
- ❌ Falhou
- ⚠️ Parcial
- ⬜ Pendente

---

## 🔧 Troubleshooting

### Problema: "Token de autenticação não fornecido"
**Solução:** Faça login novamente, limpe localStorage se necessário

### Problema: "Configuração não encontrada"
**Solução:** Execute novamente o SQL no Supabase, verifique tabela `system_configurations`

### Problema: Pesquisa não retorna resultados
**Solução:** 
1. Verifique se há dados em `pessoas_juridicas` e `pessoas_fisicas`
2. Teste query SQL diretamente no Supabase
3. Verifique logs do backend

### Problema: Botões não aparecem
**Solução:**
1. Abra console do navegador
2. Verifique erros de compilação
3. Confirme que configs foram carregadas (log: `[useSystemConfig] Configurações carregadas`)

### Problema: Validações não funcionam
**Solução:**
1. Verifique contexto `EnterpriseProvider` envolvendo wizard
2. Confirme que `useSystemConfig` retorna configs corretas
3. Check console para erros

---

## 📝 Notas Finais

- **Tempo estimado de teste:** 30-45 minutos
- **Recomendação:** Teste cenário por cenário, marcando na planilha
- **Prioridade:** Cenários 1 e 2 são críticos (regras de negócio)
- **Ambiente:** Teste em ambiente de desenvolvimento primeiro
- **Dados:** Use dados fictícios para testes

**Boa sorte com os testes! 🚀**
