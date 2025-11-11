-- Criar tabela study_types (Tipos de Estudo)
-- Tabela para armazenar os tipos de estudos ambientais

CREATE TABLE IF NOT EXISTS study_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    abbreviation VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Adicionar comentários
COMMENT ON TABLE study_types IS 'Tipos de estudos ambientais';
COMMENT ON COLUMN study_types.id IS 'Identificador único do tipo de estudo';
COMMENT ON COLUMN study_types.abbreviation IS 'Sigla ou abreviação do tipo de estudo';
COMMENT ON COLUMN study_types.name IS 'Nome do tipo de estudo';
COMMENT ON COLUMN study_types.description IS 'Descrição detalhada do tipo de estudo';
COMMENT ON COLUMN study_types.is_active IS 'Indica se o tipo de estudo está ativo';

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_study_types_abbreviation ON study_types(abbreviation);
CREATE INDEX IF NOT EXISTS idx_study_types_name ON study_types(name);
CREATE INDEX IF NOT EXISTS idx_study_types_is_active ON study_types(is_active);

-- Desabilitar RLS (para permitir acesso aos usuários autenticados)
ALTER TABLE study_types DISABLE ROW LEVEL SECURITY;

-- Inserir dados iniciais (estudos mais comuns)
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

-- Verificar dados inseridos
SELECT 
    id,
    abbreviation,
    name,
    is_active,
    created_at
FROM study_types
ORDER BY abbreviation;

-- Verificar se RLS está desabilitado
SELECT 
    tablename,
    rowsecurity as "RLS Habilitado"
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename = 'study_types';

-- INSTRUÇÕES:
-- 1. Abra o Supabase Dashboard
-- 2. Vá em SQL Editor
-- 3. Cole este script completo
-- 4. Execute
-- 5. Verifique os dados inseridos
-- 6. Teste novamente o cadastro de Tipos de Estudo
