/*
  # Criar tabelas base do sistema

  1. Tabelas Base
    - `license_types` - Tipos de licença
    - `documentation_templates` - Templates de documentação
    - `license_type_documents` - Relacionamento entre tipos de licença e documentos

  2. Segurança
    - Desabilitar RLS nas tabelas base para permitir acesso
    - Habilitar RLS apenas na tabela de relacionamento
*/

-- ============================================
-- Tabela: license_types (Tipos de Licença)
-- ============================================

CREATE TABLE IF NOT EXISTS license_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    abbreviation VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL UNIQUE,
    validity_period INTEGER NOT NULL,
    time_unit VARCHAR(20) NOT NULL CHECK (time_unit IN ('meses', 'anos')),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

COMMENT ON TABLE license_types IS 'Tipos de licenças ambientais';
COMMENT ON COLUMN license_types.abbreviation IS 'Sigla ou abreviação do tipo de licença';
COMMENT ON COLUMN license_types.name IS 'Nome do tipo de licença';
COMMENT ON COLUMN license_types.validity_period IS 'Prazo de validade da licença';
COMMENT ON COLUMN license_types.time_unit IS 'Unidade de tempo (meses ou anos)';
COMMENT ON COLUMN license_types.description IS 'Descrição detalhada do tipo de licença';

CREATE INDEX IF NOT EXISTS idx_license_types_abbreviation ON license_types(abbreviation);
CREATE INDEX IF NOT EXISTS idx_license_types_name ON license_types(name);
CREATE INDEX IF NOT EXISTS idx_license_types_is_active ON license_types(is_active);

ALTER TABLE license_types DISABLE ROW LEVEL SECURITY;

INSERT INTO license_types (abbreviation, name, validity_period, time_unit, description) VALUES
    ('LP', 'Licença Prévia', 5, 'anos', 'Concedida na fase preliminar do planejamento do empreendimento'),
    ('LI', 'Licença de Instalação', 6, 'anos', 'Autoriza a instalação do empreendimento'),
    ('LO', 'Licença de Operação', 4, 'anos', 'Autoriza a operação da atividade ou empreendimento'),
    ('LAU', 'Licença Ambiental Única', 4, 'anos', 'Licença ambiental simplificada'),
    ('AUT', 'Autorização Ambiental', 2, 'anos', 'Autoriza a realização de atividade específica')
ON CONFLICT (abbreviation) DO NOTHING;

-- ============================================
-- Tabela: documentation_templates
-- ============================================

CREATE TABLE IF NOT EXISTS documentation_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    document_types TEXT[] NOT NULL DEFAULT '{}',
    template_file_name VARCHAR(500),
    template_file_url TEXT,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE documentation_templates IS 'Modelos de documentação para processos de licenciamento';

CREATE INDEX IF NOT EXISTS idx_documentation_templates_name ON documentation_templates(name);
CREATE INDEX IF NOT EXISTS idx_documentation_templates_is_active ON documentation_templates(is_active);

ALTER TABLE documentation_templates DISABLE ROW LEVEL SECURITY;

INSERT INTO documentation_templates (name, description, document_types) 
SELECT * FROM (VALUES
    ('Requerimento de Licença', 'Documento de solicitação de licença ambiental', ARRAY['Word', 'PDF']::TEXT[]),
    ('Procuração', 'Modelo de procuração para representação legal', ARRAY['Word', 'PDF']::TEXT[]),
    ('Declaração de Veracidade', 'Declaração de responsabilidade', ARRAY['Word', 'PDF']::TEXT[]),
    ('Certidão de Uso do Solo', 'Certidão municipal', ARRAY['PDF', 'Imagem']::TEXT[]),
    ('ART - Anotação de Responsabilidade Técnica', 'ART do responsável técnico', ARRAY['PDF']::TEXT[]),
    ('Comprovante de Propriedade', 'Documentação de propriedade do imóvel', ARRAY['PDF', 'Imagem']::TEXT[]),
    ('Planta de Localização', 'Planta de situação do empreendimento', ARRAY['PDF', 'Imagem']::TEXT[]),
    ('Memorial Descritivo', 'Memorial descritivo do empreendimento', ARRAY['Word', 'PDF']::TEXT[]),
    ('Projeto Técnico', 'Projeto técnico do empreendimento', ARRAY['PDF', 'Zip']::TEXT[]),
    ('Estudo de Viabilidade', 'Estudo de viabilidade ambiental', ARRAY['PDF']::TEXT[])
) AS v(name, description, document_types)
WHERE NOT EXISTS (
    SELECT 1 FROM documentation_templates 
    WHERE documentation_templates.name = v.name
);

-- ============================================
-- Tabela: license_type_documents (Relacionamento)
-- ============================================

CREATE TABLE IF NOT EXISTS license_type_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  license_type_id UUID NOT NULL REFERENCES license_types(id) ON DELETE CASCADE,
  documentation_template_id UUID NOT NULL REFERENCES documentation_templates(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT unique_license_type_document UNIQUE(license_type_id, documentation_template_id)
);

COMMENT ON TABLE license_type_documents IS 'Relacionamento entre tipos de licença e documentos necessários';

CREATE INDEX IF NOT EXISTS idx_license_type_documents_license_type 
  ON license_type_documents(license_type_id);

CREATE INDEX IF NOT EXISTS idx_license_type_documents_template 
  ON license_type_documents(documentation_template_id);

ALTER TABLE license_type_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem visualizar documentos de tipos de licença"
  ON license_type_documents FOR SELECT
  USING (true);

CREATE POLICY "Usuários autenticados podem gerenciar documentos de tipos de licença"
  ON license_type_documents FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);