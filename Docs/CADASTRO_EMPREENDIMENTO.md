# Cadastro de Empreendimento

## Visão Geral

A tela de **Cadastro de Empreendimento** (`EmpreendimentoCadastroPage`) permite o cadastro completo das informações do empreendimento e seus responsáveis no processo de licenciamento ambiental.

## Localização

```
src/pages/inscricao/EmpreendimentoCadastroPage.tsx
```

## Funcionalidades

### 1. Dados do Empreendimento

#### 1.1 Nome
- **Tipo**: Input texto
- **Obrigatório**: Sim
- **Descrição**: Nome do empreendimento

#### 1.2 Situação
- **Tipo**: Dropdown
- **Obrigatório**: Sim
- **Opções**:
  - Não iniciado
  - Em instalação
  - Em funcionamento

#### 1.3 Número de Empregados
- **Tipo**: Campo numérico
- **Obrigatório**: Não
- **Descrição**: Número de empregados previstos ou existentes
- **Validação**: Aceita apenas números inteiros não-negativos

#### 1.4 Horário de Funcionamento
- **Tipo**: Dois campos de hora (início e fim)
- **Obrigatório**: Não
- **Validação**: Hora final deve ser posterior à hora inicial

### 2. Responsáveis do Empreendimento

Sistema de cadastro dinâmico (Form Repeater) que permite adicionar múltiplos responsáveis.

#### 2.1 Busca de Pessoa
- Campo de busca por CPF, CNPJ ou Nome
- Pesquisa em tempo real (debounce de 500ms)
- Mínimo de 3 caracteres para iniciar busca
- Exibe resultados em tabela com:
  - Documento (CPF/CNPJ)
  - Nome completo/Razão social
  - Botão de seleção

#### 2.2 Papéis Disponíveis

**Requerente**
- **Obrigatório**: Sim
- **Quantidade**: Exatamente 1 (um) por empreendimento
- **Validação**: Sistema impede adicionar mais de um requerente
- **Badge**: Azul

**Procurador/Designado/Representante Legal**
- **Obrigatório**: Não
- **Quantidade**: Múltiplos permitidos
- **Badge**: Amarelo

**Responsável Técnico**
- **Obrigatório**: Não
- **Quantidade**: Múltiplos permitidos
- **Badge**: Verde

#### 2.3 Adicionar Responsável

**Fluxo**:
1. Clicar em "+ Adicionar Responsável"
2. Modal abre com campo de busca
3. Digitar CPF, CNPJ ou Nome (mín. 3 caracteres)
4. Selecionar pessoa da lista de resultados
5. Escolher o papel no dropdown
6. Confirmar adição

**Validações**:
- Apenas uma pessoa com papel "Requerente" permitida
- Não é permitido adicionar a mesma pessoa duas vezes
- Papel é obrigatório antes de adicionar

#### 2.4 Remover Responsável

- Botão de lixeira ao lado de cada responsável
- Confirmação antes de remover
- Remove instantaneamente após confirmação

### 3. Persistência de Dados

#### 3.1 Carregamento
- Ao abrir a página, busca dados existentes do empreendimento
- Endpoint: `GET /processos/:processoId/empreendimento`
- Se não houver dados, exibe formulário vazio

#### 3.2 Salvamento
- Botão "Salvar" no topo do formulário
- Endpoint: `PUT /processos/:processoId/empreendimento`
- Payload completo:
```typescript
{
  nome: string;
  situacao: 'Não iniciado' | 'Em instalação' | 'Em funcionamento';
  numero_empregados: number | null;
  horario_inicio: string; // formato HH:MM
  horario_fim: string; // formato HH:MM
  responsaveis: Array<{
    id: string;
    pessoa_id: number;
    pessoa_nome: string;
    pessoa_cpf_cnpj: string;
    pessoa_email?: string;
    papel: 'Requerente' | 'Procurador/Designado/Representante Legal' | 'Responsável Técnico';
  }>;
}
```

### 4. Validações

#### Antes de Salvar:
- ✅ Nome do empreendimento preenchido
- ✅ Situação selecionada
- ✅ Horário fim posterior ao horário início (se ambos preenchidos)
- ✅ Exatamente 1 requerente adicionado

#### Mensagens de Erro:
- "Nome do empreendimento é obrigatório"
- "Situação do empreendimento é obrigatória"
- "Horário final deve ser posterior ao horário inicial"
- "É necessário adicionar pelo menos um Requerente"
- "Apenas um Requerente pode ser adicionado"

### 5. Navegação

#### Botão "Voltar: Imóvel"
- Retorna para página de cadastro de imóvel
- Rota: `/inscricao/imovel`

#### Botão "Próximo: Formulário"
- Avança para página de formulário técnico
- Rota: `/inscricao/formulario`

### 6. Interface do Usuário

#### Estados de Loading
- **Inicialização**: Spinner enquanto processoId é carregado
- **Carregando dados**: Spinner enquanto busca dados do empreendimento
- **Salvando**: Botão desabilitado com spinner durante save
- **Buscando pessoas**: Spinner durante pesquisa no modal

#### Feedback Visual
- ✅ Toast de sucesso ao adicionar responsável
- ✅ Toast de sucesso ao remover responsável
- ✅ Toast de sucesso ao salvar
- ❌ Toast de erro em caso de falha
- ⚠️ Badge amarelo de aviso quando não há requerente

#### Cores dos Badges
- **Requerente**: Azul (bg-blue-100 text-blue-800)
- **Procurador**: Amarelo (bg-yellow-100 text-yellow-800)
- **Responsável Técnico**: Verde (bg-green-100 text-green-800)

## Integração com Outras Telas

### Fluxo de Inscrição
```
1. Participantes (ParticipantesPage)
2. Imóvel (ImovelPage)
3. Atividade (EmpreendimentoPage - seleção de atividade)
4. Empreendimento (EmpreendimentoCadastroPage) ← NOVA TELA
5. Formulário (FormularioPage)
6. Documentação (DocumentacaoPage)
7. Revisão (RevisaoPage)
```

### Contexto Compartilhado
- Usa `InscricaoContext` para acessar `processoId`
- Usa `InscricaoStore` (Zustand) para gerenciar step atual
- Integra com API de busca de pessoas (`searchPessoas`)

## Estrutura de Dados

### Interface EmpreendimentoData
```typescript
interface EmpreendimentoData {
  nome: string;
  situacao: 'Não iniciado' | 'Em instalação' | 'Em funcionamento' | '';
  numero_empregados: number | null;
  horario_inicio: string;
  horario_fim: string;
  responsaveis: ResponsavelEmpreendimento[];
}
```

### Interface ResponsavelEmpreendimento
```typescript
interface ResponsavelEmpreendimento {
  id: string; // UUID gerado com crypto.randomUUID()
  pessoa_id: number; // ID da pessoa no banco
  pessoa_nome: string;
  pessoa_cpf_cnpj: string;
  pessoa_email?: string;
  papel: 'Requerente' | 'Procurador/Designado/Representante Legal' | 'Responsável Técnico';
}
```

## Endpoints de API Necessários

### GET /processos/:processoId/empreendimento
**Resposta**: `EmpreendimentoData | null`

### PUT /processos/:processoId/empreendimento
**Body**: `EmpreendimentoData`
**Resposta**: `{ success: boolean, data: EmpreendimentoData }`

## Exemplo de Uso

```typescript
// Rota no App.tsx ou router
<Route
  path="/inscricao/empreendimento-cadastro"
  element={<EmpreendimentoCadastroPage />}
/>
```

## Observações Importantes

1. **Requerente Único**: A validação de "apenas um requerente" é crítica e está implementada em múltiplos pontos:
   - No modal ao adicionar
   - No botão de salvar
   - Na validação do formulário

2. **Pesquisa de Pessoas**: Reutiliza a mesma API de busca usada em `ParticipantesPage`, garantindo consistência

3. **Responsividade**: Grid responsivo que adapta para 1 coluna em mobile e 2 colunas em desktop

4. **Acessibilidade**:
   - Labels com asterisco vermelho para campos obrigatórios
   - Placeholders descritivos
   - Mensagens de erro claras
   - Botões com ícones e texto

5. **Performance**: Debounce de 500ms na busca para evitar requisições excessivas

## Melhorias Futuras

- [ ] Adicionar validação de CPF para responsável técnico
- [ ] Permitir edição inline dos responsáveis sem modal
- [ ] Exportar lista de responsáveis em PDF
- [ ] Histórico de alterações no empreendimento
- [ ] Upload de documentos específicos do empreendimento
