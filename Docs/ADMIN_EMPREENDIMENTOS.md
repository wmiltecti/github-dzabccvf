# Cadastro de Empreendimentos - Área Administrativa

## Visão Geral

O cadastro de empreendimentos foi implementado como uma funcionalidade administrativa isolada, permitindo o gerenciamento centralizado de empreendimentos e seus responsáveis no sistema.

## Como Acessar

### 1. Faça Login no Sistema

Acesse a aplicação e faça login com suas credenciais.

### 2. Navegue até a Área Administrativa

No menu lateral esquerdo:
1. Clique em **"Administração"** para expandir o menu
2. Clique em **"Empreendimentos"**

A tela de gerenciamento de empreendimentos será aberta.

## Funcionalidades

### Listagem de Empreendimentos

A tela inicial mostra uma tabela com todos os empreendimentos cadastrados:

| Coluna | Descrição |
|--------|-----------|
| **Nome** | Nome do empreendimento |
| **Situação** | Não iniciado / Em instalação / Em funcionamento |
| **Nº Empregados** | Número de empregados previstos ou existentes |
| **Horário Início** | Horário de início do funcionamento |
| **Horário Fim** | Horário de término do funcionamento |

**Recursos da Tabela:**
- ✅ Busca por nome ou situação
- ✅ Paginação automática
- ✅ Ações: Visualizar, Editar, Excluir

### Criar Novo Empreendimento

1. Clique no botão **"+ Novo"** no canto superior direito
2. Preencha o formulário modal:

#### Dados do Empreendimento

**Nome** *(obrigatório)*
- Digite o nome do empreendimento

**Situação** *(obrigatório)*
- Selecione uma opção:
  - Não iniciado
  - Em instalação
  - Em funcionamento

**Nº de Empregados** *(opcional)*
- Digite o número de empregados (apenas números inteiros)

**Horário de Funcionamento** *(opcional)*
- **Horário Início**: Selecione o horário de abertura
- **Horário Fim**: Selecione o horário de fechamento
- ⚠️ O horário final deve ser posterior ao inicial

#### Responsáveis

**Adicionar Responsável:**
1. Clique em **"+ Adicionar"**
2. Modal de busca será aberto
3. Digite CPF, CNPJ ou Nome (mínimo 3 caracteres)
4. Selecione a pessoa da lista de resultados
5. Escolha o papel:
   - **Requerente** (obrigatório, apenas 1 por empreendimento)
   - **Procurador/Designado/Representante Legal** (opcional, múltiplos)
   - **Responsável Técnico** (opcional, múltiplos)
6. Clique em **"Adicionar"**

**Remover Responsável:**
- Clique no ícone de lixeira ao lado do responsável
- Confirme a remoção

**Validações:**
- ✅ Obrigatório ter exatamente 1 Requerente
- ✅ Não pode adicionar a mesma pessoa duas vezes
- ✅ Papel é obrigatório antes de adicionar

3. Clique em **"Salvar"** para criar o empreendimento

### Editar Empreendimento

1. Na lista de empreendimentos, clique no ícone de **editar** (lápis)
2. O formulário modal será aberto com os dados atuais
3. Faça as alterações necessárias
4. Adicione ou remova responsáveis conforme necessário
5. Clique em **"Salvar"** para atualizar

### Excluir Empreendimento

1. Na lista de empreendimentos, clique no ícone de **excluir** (lixeira)
2. Confirme a exclusão
3. O empreendimento e seus responsáveis serão removidos

⚠️ **Atenção:** Esta ação não pode ser desfeita!

### Visualizar Detalhes

1. Na lista de empreendimentos, clique no ícone de **visualizar** (olho)
2. Um toast com os detalhes completos será exibido

## Estrutura de Dados

### Empreendimento

```typescript
{
  id: number;
  nome: string;
  situacao: 'Não iniciado' | 'Em instalação' | 'Em funcionamento';
  numero_empregados: number | null;
  horario_inicio: string; // formato HH:MM
  horario_fim: string; // formato HH:MM
  created_at: timestamp;
  updated_at: timestamp;
}
```

### Responsável

```typescript
{
  id: number;
  empreendimento_id: number;
  pessoa_id: number;
  papel: 'Requerente' | 'Procurador/Designado/Representante Legal' | 'Responsável Técnico';
  pessoa_nome: string;
  pessoa_cpf_cnpj: string;
  pessoa_email: string;
  created_at: timestamp;
}
```

## Banco de Dados

### Tabelas Criadas

1. **empreendimentos**
   - Armazena dados principais do empreendimento
   - Validação de horários via constraint CHECK
   - Trigger para atualizar `updated_at` automaticamente

2. **empreendimento_responsaveis**
   - Armazena responsáveis vinculados ao empreendimento
   - Foreign key para `empreendimentos` (CASCADE on delete)
   - Foreign key para `pessoa` (RESTRICT on delete)
   - Constraint UNIQUE para evitar duplicação de pessoa no mesmo empreendimento
   - Index UNIQUE parcial para garantir apenas 1 Requerente por empreendimento

### Segurança (RLS)

**Row Level Security (RLS)** está ativo em ambas as tabelas:

- ✅ Usuários autenticados podem visualizar todos os empreendimentos
- ✅ Usuários autenticados podem criar, editar e excluir empreendimentos
- ✅ Usuários autenticados podem gerenciar responsáveis

## Migrations

A migration SQL está em:
```
/supabase/migrations/create_empreendimentos.sql
```

Para aplicar a migration:

### Via Supabase CLI
```bash
supabase db push
```

### Via Supabase Dashboard
1. Acesse o Supabase Dashboard
2. Vá em "SQL Editor"
3. Cole o conteúdo do arquivo `create_empreendimentos.sql`
4. Execute a query

## Mensagens de Validação

### Ao Salvar
- ❌ "Nome do empreendimento é obrigatório"
- ❌ "Situação do empreendimento é obrigatória"
- ❌ "Horário final deve ser posterior ao horário inicial"
- ❌ "É necessário adicionar pelo menos um Requerente"
- ❌ "Apenas um Requerente pode ser adicionado"
- ✅ "Empreendimento criado com sucesso!"
- ✅ "Empreendimento atualizado com sucesso!"

### Ao Gerenciar Responsáveis
- ❌ "Apenas um Requerente pode ser adicionado por empreendimento"
- ❌ "Esta pessoa já foi adicionada ao empreendimento"
- ❌ "Selecione uma pessoa e um papel"
- ✅ "[Nome] adicionado como [Papel]"
- ✅ "Responsável removido"

## Fluxo de Uso Típico

### Cenário 1: Novo Empreendimento

1. ✅ Acessar menu "Administração" → "Empreendimentos"
2. ✅ Clicar em "+ Novo"
3. ✅ Preencher nome: "Fábrica de Móveis XYZ"
4. ✅ Selecionar situação: "Em instalação"
5. ✅ Informar nº empregados: 50
6. ✅ Definir horário: 08:00 - 18:00
7. ✅ Adicionar Requerente:
   - Buscar "12345678901"
   - Selecionar "João Silva"
   - Papel: "Requerente"
8. ✅ Adicionar Responsável Técnico:
   - Buscar "98765432100"
   - Selecionar "Maria Santos"
   - Papel: "Responsável Técnico"
9. ✅ Salvar

### Cenário 2: Editar Empreendimento Existente

1. ✅ Localizar empreendimento na lista
2. ✅ Clicar em editar
3. ✅ Alterar situação para "Em funcionamento"
4. ✅ Atualizar nº empregados para 75
5. ✅ Adicionar novo Procurador
6. ✅ Salvar alterações

## Integração com Outras Áreas

### Diferença entre Admin e Processo de Inscrição

| Aspecto | Admin: Empreendimentos | Inscrição: Empreendimento |
|---------|------------------------|---------------------------|
| **Propósito** | Cadastro isolado e centralizado | Parte do fluxo de licenciamento |
| **Vinculação** | Independente de processos | Vinculado a um processo específico |
| **Acesso** | Menu Administração | Fluxo de inscrição (steps) |
| **Rota** | Via Dashboard → Admin | `/inscricao/empreendimento-cadastro` |
| **Uso** | Gerenciamento geral | Cadastro durante solicitação de licença |

### Quando Usar Cada Um?

**Use a Área Administrativa quando:**
- Precisa cadastrar empreendimentos de forma centralizada
- Quer visualizar/editar todos os empreendimentos do sistema
- Está gerenciando dados mestres (master data)
- Não está vinculado a um processo de licenciamento específico

**Use o Fluxo de Inscrição quando:**
- Está criando uma nova solicitação de licença
- O empreendimento é específico para aquele processo
- Está seguindo o wizard de inscrição completo
- Precisa vincular empreendimento ao processo

## Badges de Papel

Os papéis são identificados por badges coloridos:

- 🔵 **Azul**: Requerente
- 🟡 **Amarelo**: Procurador/Designado/Representante Legal
- 🟢 **Verde**: Responsável Técnico

## Dicas e Boas Práticas

1. ✅ **Sempre adicione um Requerente** - É obrigatório para salvar
2. ✅ **Valide os horários** - Certifique-se que o horário final seja maior que o inicial
3. ✅ **Busque pessoas cadastradas** - Use CPF/CNPJ ou nome completo para melhor resultado
4. ✅ **Remova responsáveis cuidadosamente** - Certifique-se antes de remover um Requerente
5. ✅ **Use nomes descritivos** - Facilita a busca e identificação posterior

## Troubleshooting

### "Pessoa não encontrada na busca"
- Verifique se a pessoa está cadastrada em "Pessoas Físicas" ou "Pessoas Jurídicas"
- Digite pelo menos 3 caracteres
- Tente buscar pelo documento (CPF/CNPJ)

### "Erro ao salvar empreendimento"
- Verifique se todos os campos obrigatórios estão preenchidos
- Confirme que há exatamente 1 Requerente
- Verifique sua conexão com a internet

### "Não consigo adicionar segundo Requerente"
- Por design, apenas 1 Requerente é permitido por empreendimento
- Se precisar trocar, remova o atual primeiro

## Próximos Passos

Após cadastrar o empreendimento, você pode:

1. ✅ Vincular o empreendimento a processos de licenciamento
2. ✅ Adicionar mais responsáveis conforme necessário
3. ✅ Atualizar informações quando houver mudanças
4. ✅ Consultar o histórico através dos timestamps

---

**Versão:** 1.0
**Última Atualização:** 2025-11-10
**Autor:** Sistema de Licenciamento Ambiental
