/*
  # Criar tabelas study_types e activity_license_type_studies

  1. Nova Tabela: study_types
    - `id` (uuid, primary key)
    - `abbreviation` (varchar, unique)
    - `name` (varchar, unique)
    - `description` (text)
    - `is_active` (boolean)
    - `created_at` (timestamp)
    - `updated_at` (timestamp)

  2. Nova Tabela: activity_license_type_studies
    - `id` (uuid, primary key)
    - `activity_id` (uuid)
    - `license_type_id` (uuid, foreign key para license_types)
    - `study_type_id` (uuid, foreign key para study_types)
    - `is_required` (boolean)
    - `created_at` (timestamp)
    - `updated_at` (timestamp)

  3. Segurança
    - RLS habilitado em ambas as tabelas
    - Políticas para permitir acesso público de leitura
    - Políticas para permitir operações autenticadas

  4. Dados Iniciais
    - 10 tipos de estudos ambientais comuns
*/

-- Criar tabela study_types
CREATE TABLE IF NOT EXISTS study_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    abbreviation VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

COMMENT ON TABLE study_types IS 'Tipos de estudos ambientais - RLS Enabled';

-- Criar índices para study_types
CREATE INDEX IF NOT EXISTS idx_study_types_abbreviation ON study_types(abbreviation);
CREATE INDEX IF NOT EXISTS idx_study_types_name ON study_types(name);
CREATE INDEX IF NOT EXISTS idx_study_types_is_active ON study_types(is_active);

-- Habilitar RLS para study_types
ALTER TABLE study_types ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para study_types
CREATE POLICY "Allow public read access to study_types"
  ON study_types FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert to study_types"
  ON study_types FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to study_types"
  ON study_types FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete from study_types"
  ON study_types FOR DELETE
  TO authenticated
  USING (true);

-- Inserir dados iniciais em study_types
INSERT INTO study_types (abbreviation, name, description) VALUES
    ('EIA', 'Estudo de Impacto Ambiental', 'Estudo técnico-científico que identifica, prevê e interpreta os impactos ambientais de um empreendimento'),
    ('RIMA', 'Relatório de Impacto Ambiental', 'Documento que apresenta os resultados do EIA em linguagem acessível ao público'),
    ('RCA', 'Relatório de Controle Ambiental', 'Estudo ambiental simplificado para atividades de médio porte'),
    ('PCA', 'Plano de Controle Ambiental', 'Plano detalhando as medidas de controle e monitoramento ambiental'),
    ('RAP', 'Relatório Ambiental Preliminar', 'Estudo simplificado para diagnóstico ambiental preliminar'),
    ('PRAD', 'Plano de Recuperação de Área Degradada', 'Plano para recuperação de áreas degradadas por atividades'),
    ('EAS', 'Estudo Ambiental Simplificado', 'Estudo simplificado para empreendimentos de pequeno porte'),
    ('PBA', 'Projeto Básico Ambiental', 'Detalhamento dos programas ambientais propostos no EIA'),
    ('RAS', 'Relatório Ambiental Simplificado', 'Relatório simplificado para atividades de baixo impacto'),
    ('EVA', 'Estudo de Viabilidade Ambiental', 'Estudo que avalia a viabilidade ambiental de um empreendimento')
ON CONFLICT (abbreviation) DO NOTHING;

-- Criar tabela activity_license_type_studies
CREATE TABLE IF NOT EXISTS activity_license_type_studies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL,
    license_type_id UUID NOT NULL REFERENCES license_types(id) ON DELETE CASCADE,
    study_type_id UUID NOT NULL REFERENCES study_types(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_activity_license_study 
        UNIQUE (activity_id, license_type_id, study_type_id)
);

COMMENT ON TABLE activity_license_type_studies IS 'Relacionamento entre atividades, tipos de licença e tipos de estudo - RLS Enabled';

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_activity_license_type_studies_activity 
    ON activity_license_type_studies(activity_id);

CREATE INDEX IF NOT EXISTS idx_activity_license_type_studies_license 
    ON activity_license_type_studies(license_type_id);

CREATE INDEX IF NOT EXISTS idx_activity_license_type_studies_study 
    ON activity_license_type_studies(study_type_id);

CREATE INDEX IF NOT EXISTS idx_activity_license_type_studies_composite 
    ON activity_license_type_studies(activity_id, license_type_id);

-- Habilitar RLS
ALTER TABLE activity_license_type_studies ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Allow public read access to activity_license_type_studies"
  ON activity_license_type_studies FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert to activity_license_type_studies"
  ON activity_license_type_studies FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to activity_license_type_studies"
  ON activity_license_type_studies FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete from activity_license_type_studies"
  ON activity_license_type_studies FOR DELETE
  TO authenticated
  USING (true);