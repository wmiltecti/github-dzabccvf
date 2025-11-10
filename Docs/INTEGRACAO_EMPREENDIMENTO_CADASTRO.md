# Integração da Tela de Cadastro de Empreendimento

## Passo a Passo para Integração

### 1. Adicionar Import no App.tsx

```typescript
// src/App.tsx

// Adicionar este import junto com os outros imports de páginas de inscrição
import EmpreendimentoCadastroPage from './pages/inscricao/EmpreendimentoCadastroPage';
```

### 2. Adicionar Rota no App.tsx

Existem duas opções de integração, dependendo do fluxo desejado:

#### Opção A: Substituir a página atual de EmpreendimentoPage

```typescript
// src/App.tsx - dentro do <Route path="/inscricao/*">

<Route path="empreendimento" element={<EmpreendimentoCadastroPage />} />
```

#### Opção B: Criar rota separada (mantém ambas as páginas)

```typescript
// src/App.tsx - dentro do <Route path="/inscricao/*">

<Route path="empreendimento" element={<EmpreendimentoPage />} />
<Route path="empreendimento-cadastro" element={<EmpreendimentoCadastroPage />} />
```

### 3. Atualizar InscricaoStepper (se usar Opção A)

Se você substituir a página de empreendimento existente, a navegação já funcionará automaticamente.

Se usar a Opção B, você precisará atualizar o InscricaoStepper:

```typescript
// src/components/InscricaoStepper.tsx

const steps: Step[] = [
  // ... outros steps
  {
    id: 3,
    name: 'Empreendimento', // ou 'Atividade e Empreendimento'
    description: 'Cadastro do empreendimento',
    icon: Building,
    path: '/inscricao/empreendimento-cadastro' // Nova rota
  },
  // ... outros steps
];
```

### 4. Criar Migration no Banco de Dados

Criar uma nova migration para a tabela de empreendimentos:

```sql
/*
  # Cadastro de Empreendimento

  1. Nova Tabela
    - `empreendimentos`
      - `id` (serial, primary key)
      - `processo_id` (uuid, foreign key)
      - `nome` (text, not null)
      - `situacao` (enum)
      - `numero_empregados` (integer)
      - `horario_inicio` (time)
      - `horario_fim` (time)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Nova Tabela
    - `empreendimento_responsaveis`
      - `id` (serial, primary key)
      - `empreendimento_id` (integer, foreign key)
      - `pessoa_id` (integer, foreign key)
      - `papel` (enum)
      - `created_at` (timestamptz)

  3. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Enum para situação do empreendimento
CREATE TYPE situacao_empreendimento AS ENUM (
  'Não iniciado',
  'Em instalação',
  'Em funcionamento'
);

-- Enum para papel do responsável
CREATE TYPE papel_responsavel AS ENUM (
  'Requerente',
  'Procurador/Designado/Representante Legal',
  'Responsável Técnico'
);

-- Tabela de empreendimentos
CREATE TABLE IF NOT EXISTS empreendimentos (
  id SERIAL PRIMARY KEY,
  processo_id UUID NOT NULL,
  nome TEXT NOT NULL,
  situacao situacao_empreendimento NOT NULL,
  numero_empregados INTEGER,
  horario_inicio TIME,
  horario_fim TIME,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_processo FOREIGN KEY (processo_id)
    REFERENCES processos(id) ON DELETE CASCADE,
  CONSTRAINT valid_horarios CHECK (
    (horario_inicio IS NULL AND horario_fim IS NULL) OR
    (horario_inicio IS NOT NULL AND horario_fim IS NOT NULL AND horario_fim > horario_inicio)
  )
);

-- Tabela de responsáveis do empreendimento
CREATE TABLE IF NOT EXISTS empreendimento_responsaveis (
  id SERIAL PRIMARY KEY,
  empreendimento_id INTEGER NOT NULL,
  pessoa_id INTEGER NOT NULL,
  papel papel_responsavel NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_empreendimento FOREIGN KEY (empreendimento_id)
    REFERENCES empreendimentos(id) ON DELETE CASCADE,
  CONSTRAINT fk_pessoa FOREIGN KEY (pessoa_id)
    REFERENCES pessoa(pkpessoa) ON DELETE RESTRICT,
  CONSTRAINT unique_pessoa_empreendimento UNIQUE (empreendimento_id, pessoa_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_empreendimentos_processo
  ON empreendimentos(processo_id);
CREATE INDEX IF NOT EXISTS idx_responsaveis_empreendimento
  ON empreendimento_responsaveis(empreendimento_id);
CREATE INDEX IF NOT EXISTS idx_responsaveis_pessoa
  ON empreendimento_responsaveis(pessoa_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_empreendimentos_updated_at
  BEFORE UPDATE ON empreendimentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE empreendimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE empreendimento_responsaveis ENABLE ROW LEVEL SECURITY;

-- Policies para empreendimentos
CREATE POLICY "Users can view own empreendimentos"
  ON empreendimentos FOR SELECT
  TO authenticated
  USING (
    processo_id IN (
      SELECT id FROM processos WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own empreendimentos"
  ON empreendimentos FOR INSERT
  TO authenticated
  WITH CHECK (
    processo_id IN (
      SELECT id FROM processos WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own empreendimentos"
  ON empreendimentos FOR UPDATE
  TO authenticated
  USING (
    processo_id IN (
      SELECT id FROM processos WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    processo_id IN (
      SELECT id FROM processos WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own empreendimentos"
  ON empreendimentos FOR DELETE
  TO authenticated
  USING (
    processo_id IN (
      SELECT id FROM processos WHERE user_id = auth.uid()
    )
  );

-- Policies para responsáveis
CREATE POLICY "Users can view own responsaveis"
  ON empreendimento_responsaveis FOR SELECT
  TO authenticated
  USING (
    empreendimento_id IN (
      SELECT id FROM empreendimentos WHERE processo_id IN (
        SELECT id FROM processos WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert own responsaveis"
  ON empreendimento_responsaveis FOR INSERT
  TO authenticated
  WITH CHECK (
    empreendimento_id IN (
      SELECT id FROM empreendimentos WHERE processo_id IN (
        SELECT id FROM processos WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete own responsaveis"
  ON empreendimento_responsaveis FOR DELETE
  TO authenticated
  USING (
    empreendimento_id IN (
      SELECT id FROM empreendimentos WHERE processo_id IN (
        SELECT id FROM processos WHERE user_id = auth.uid()
      )
    )
  );

-- Constraint para garantir apenas um requerente por empreendimento
CREATE UNIQUE INDEX idx_one_requerente_per_empreendimento
  ON empreendimento_responsaveis (empreendimento_id)
  WHERE papel = 'Requerente';
```

### 5. Criar Endpoints da API (Backend)

#### GET /processos/:processoId/empreendimento

```typescript
// backend/routes/processos.ts

router.get('/processos/:processoId/empreendimento', async (req, res) => {
  const { processoId } = req.params;

  try {
    // Buscar empreendimento
    const empreendimento = await db.query(
      'SELECT * FROM empreendimentos WHERE processo_id = $1',
      [processoId]
    );

    if (empreendimento.rows.length === 0) {
      return res.status(404).json({ message: 'Empreendimento não encontrado' });
    }

    const emp = empreendimento.rows[0];

    // Buscar responsáveis com dados da pessoa
    const responsaveis = await db.query(`
      SELECT
        r.id,
        r.pessoa_id,
        r.papel,
        p.nome as pessoa_nome,
        p.razaosocial as pessoa_razaosocial,
        p.cpf,
        p.cnpj,
        p.email as pessoa_email,
        COALESCE(p.cpf, p.cnpj) as pessoa_cpf_cnpj
      FROM empreendimento_responsaveis r
      JOIN pessoa p ON r.pessoa_id = p.pkpessoa
      WHERE r.empreendimento_id = $1
    `, [emp.id]);

    const data = {
      nome: emp.nome,
      situacao: emp.situacao,
      numero_empregados: emp.numero_empregados,
      horario_inicio: emp.horario_inicio,
      horario_fim: emp.horario_fim,
      responsaveis: responsaveis.rows.map(r => ({
        id: r.id.toString(),
        pessoa_id: r.pessoa_id,
        pessoa_nome: r.pessoa_nome || r.pessoa_razaosocial,
        pessoa_cpf_cnpj: r.pessoa_cpf_cnpj,
        pessoa_email: r.pessoa_email,
        papel: r.papel
      }))
    };

    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar empreendimento:', error);
    res.status(500).json({ message: 'Erro ao buscar empreendimento' });
  }
});
```

#### PUT /processos/:processoId/empreendimento

```typescript
// backend/routes/processos.ts

router.put('/processos/:processoId/empreendimento', async (req, res) => {
  const { processoId } = req.params;
  const { nome, situacao, numero_empregados, horario_inicio, horario_fim, responsaveis } = req.body;

  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // Verificar se empreendimento existe
    const existing = await client.query(
      'SELECT id FROM empreendimentos WHERE processo_id = $1',
      [processoId]
    );

    let empreendimentoId;

    if (existing.rows.length > 0) {
      // Update
      empreendimentoId = existing.rows[0].id;
      await client.query(`
        UPDATE empreendimentos
        SET nome = $1, situacao = $2, numero_empregados = $3,
            horario_inicio = $4, horario_fim = $5, updated_at = now()
        WHERE id = $6
      `, [nome, situacao, numero_empregados, horario_inicio, horario_fim, empreendimentoId]);
    } else {
      // Insert
      const result = await client.query(`
        INSERT INTO empreendimentos
          (processo_id, nome, situacao, numero_empregados, horario_inicio, horario_fim)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [processoId, nome, situacao, numero_empregados, horario_inicio, horario_fim]);
      empreendimentoId = result.rows[0].id;
    }

    // Deletar responsáveis antigos
    await client.query(
      'DELETE FROM empreendimento_responsaveis WHERE empreendimento_id = $1',
      [empreendimentoId]
    );

    // Inserir novos responsáveis
    for (const resp of responsaveis) {
      await client.query(`
        INSERT INTO empreendimento_responsaveis (empreendimento_id, pessoa_id, papel)
        VALUES ($1, $2, $3)
      `, [empreendimentoId, resp.pessoa_id, resp.papel]);
    }

    await client.query('COMMIT');

    res.json({ success: true, message: 'Empreendimento salvo com sucesso' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao salvar empreendimento:', error);
    res.status(500).json({ message: 'Erro ao salvar empreendimento' });
  } finally {
    client.release();
  }
});
```

### 6. Testar a Integração

1. **Acessar a rota**: `/inscricao/empreendimento-cadastro`
2. **Preencher dados do empreendimento**
3. **Adicionar responsáveis**:
   - Buscar pessoa pelo CPF/CNPJ
   - Selecionar e adicionar como Requerente
   - Adicionar outros responsáveis (Procurador, Resp. Técnico)
4. **Salvar**
5. **Verificar**:
   - Toast de sucesso
   - Recarregar página e verificar se dados foram salvos
   - Navegar para próxima etapa

### 7. Checklist de Validação

- [ ] Campos obrigatórios funcionam (Nome, Situação, Requerente)
- [ ] Validação de horário funciona (fim > início)
- [ ] Busca de pessoas funciona com 3+ caracteres
- [ ] Adicionar requerente funciona
- [ ] Impede adicionar mais de 1 requerente
- [ ] Adicionar procurador funciona
- [ ] Adicionar responsável técnico funciona
- [ ] Remover responsável funciona
- [ ] Salvar persiste dados no banco
- [ ] Recarregar página recupera dados
- [ ] Navegação Voltar funciona
- [ ] Navegação Próximo funciona
- [ ] Toast messages aparecem corretamente
- [ ] Responsividade mobile funciona

## Estrutura Final de Rotas

```
/inscricao
  ├── /participantes        (Step 1)
  ├── /imovel               (Step 2)
  ├── /empreendimento       (Step 3) ← Seleção de Atividade
  ├── /empreendimento-cadastro ← NOVA TELA (pode ser integrada no step 3)
  ├── /formulario           (Step 4)
  ├── /documentacao         (Step 5)
  └── /revisao              (Step 6)
```

## Observações Finais

1. **Performance**: A constraint `UNIQUE` no banco garante apenas 1 requerente no nível de banco de dados
2. **Segurança**: RLS policies garantem que usuários só vejam seus próprios empreendimentos
3. **UX**: Debounce na busca melhora performance
4. **Validação**: Validações tanto no frontend quanto backend
5. **Auditoria**: Campos `created_at` e `updated_at` para tracking
