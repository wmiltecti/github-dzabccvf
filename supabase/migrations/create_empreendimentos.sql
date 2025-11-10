/*
  # Cadastro de Empreendimento

  1. Novas Tabelas
    - `empreendimentos`
      - `id` (serial, primary key)
      - `nome` (text, not null)
      - `situacao` (enum)
      - `numero_empregados` (integer)
      - `horario_inicio` (time)
      - `horario_fim` (time)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `empreendimento_responsaveis`
      - `id` (serial, primary key)
      - `empreendimento_id` (integer, foreign key)
      - `pessoa_id` (integer, foreign key)
      - `papel` (enum)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
    - Constraint to ensure only one "Requerente" per empreendimento
*/

-- Enum para situação do empreendimento
DO $$ BEGIN
  CREATE TYPE situacao_empreendimento AS ENUM (
    'Não iniciado',
    'Em instalação',
    'Em funcionamento'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enum para papel do responsável
DO $$ BEGIN
  CREATE TYPE papel_responsavel AS ENUM (
    'Requerente',
    'Procurador/Designado/Representante Legal',
    'Responsável Técnico'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tabela de empreendimentos
CREATE TABLE IF NOT EXISTS empreendimentos (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  situacao situacao_empreendimento NOT NULL,
  numero_empregados INTEGER,
  horario_inicio TIME,
  horario_fim TIME,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
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
CREATE INDEX IF NOT EXISTS idx_empreendimentos_nome
  ON empreendimentos(nome);
CREATE INDEX IF NOT EXISTS idx_empreendimentos_situacao
  ON empreendimentos(situacao);
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

DROP TRIGGER IF EXISTS update_empreendimentos_updated_at ON empreendimentos;
CREATE TRIGGER update_empreendimentos_updated_at
  BEFORE UPDATE ON empreendimentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Constraint para garantir apenas um requerente por empreendimento
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_requerente_per_empreendimento
  ON empreendimento_responsaveis (empreendimento_id)
  WHERE papel = 'Requerente';

-- Row Level Security
ALTER TABLE empreendimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE empreendimento_responsaveis ENABLE ROW LEVEL SECURITY;

-- Policies para empreendimentos
DROP POLICY IF EXISTS "Users can view all empreendimentos" ON empreendimentos;
CREATE POLICY "Users can view all empreendimentos"
  ON empreendimentos FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can insert empreendimentos" ON empreendimentos;
CREATE POLICY "Users can insert empreendimentos"
  ON empreendimentos FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update empreendimentos" ON empreendimentos;
CREATE POLICY "Users can update empreendimentos"
  ON empreendimentos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete empreendimentos" ON empreendimentos;
CREATE POLICY "Users can delete empreendimentos"
  ON empreendimentos FOR DELETE
  TO authenticated
  USING (true);

-- Policies para responsáveis
DROP POLICY IF EXISTS "Users can view all responsaveis" ON empreendimento_responsaveis;
CREATE POLICY "Users can view all responsaveis"
  ON empreendimento_responsaveis FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can insert responsaveis" ON empreendimento_responsaveis;
CREATE POLICY "Users can insert responsaveis"
  ON empreendimento_responsaveis FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete responsaveis" ON empreendimento_responsaveis;
CREATE POLICY "Users can delete responsaveis"
  ON empreendimento_responsaveis FOR DELETE
  TO authenticated
  USING (true);
