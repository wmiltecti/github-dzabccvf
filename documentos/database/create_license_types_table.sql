-- Criar tabela license_types (Tipos de Licença)
-- Tabela para armazenar os tipos de licenças ambientais

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

-- Adicionar comentários
COMMENT ON TABLE license_types IS 'Tipos de licenças ambientais';
COMMENT ON COLUMN license_types.id IS 'Identificador único do tipo de licença';
COMMENT ON COLUMN license_types.abbreviation IS 'Sigla ou abreviação do tipo de licença';
COMMENT ON COLUMN license_types.name IS 'Nome do tipo de licença';
COMMENT ON COLUMN license_types.validity_period IS 'Prazo de validade da licença';
COMMENT ON COLUMN license_types.time_unit IS 'Unidade de tempo (meses ou anos)';
COMMENT ON COLUMN license_types.description IS 'Descrição detalhada do tipo de licença';
COMMENT ON COLUMN license_types.is_active IS 'Indica se o tipo de licença está ativo';

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_license_types_abbreviation ON license_types(abbreviation);
CREATE INDEX IF NOT EXISTS idx_license_types_name ON license_types(name);
CREATE INDEX IF NOT EXISTS idx_license_types_is_active ON license_types(is_active);

-- Desabilitar RLS (para permitir acesso aos usuários autenticados)
ALTER TABLE license_types DISABLE ROW LEVEL SECURITY;

-- Inserir dados iniciais (licenças mais comuns)
INSERT INTO license_types (abbreviation, name, validity_period, time_unit, description) VALUES
    ('LP', 'Licença Prévia', 5, 'anos', 'Concedida na fase preliminar do planejamento do empreendimento ou atividade aprovando sua localização e concepção'),
    ('LI', 'Licença de Instalação', 6, 'anos', 'Autoriza a instalação do empreendimento ou atividade de acordo com as especificações constantes dos planos, programas e projetos aprovados'),
    ('LO', 'Licença de Operação', 4, 'anos', 'Autoriza a operação da atividade ou empreendimento, após a verificação do efetivo cumprimento das exigências da LP e LI'),
    ('LAU', 'Licença Ambiental Única', 4, 'anos', 'Licença ambiental simplificada para empreendimentos de pequeno porte e pequeno potencial poluidor'),
    ('AUT', 'Autorização Ambiental', 2, 'anos', 'Autoriza a realização de atividade específica de caráter temporário'),
    ('DISP', 'Dispensa de Licenciamento', 1, 'anos', 'Declaração de dispensa de licenciamento ambiental para atividades de baixo impacto'),
    ('RLO', 'Renovação de Licença de Operação', 4, 'anos', 'Renovação da licença de operação para continuidade das atividades')
ON CONFLICT (abbreviation) DO NOTHING;

-- Verificar dados inseridos
SELECT 
    id,
    abbreviation,
    name,
    validity_period,
    time_unit,
    is_active,
    created_at
FROM license_types
ORDER BY abbreviation;

-- Verificar se RLS está desabilitado
SELECT 
    tablename,
    rowsecurity as "RLS Habilitado"
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename = 'license_types';

-- INSTRUÇÕES:
-- 1. Abra o Supabase Dashboard
-- 2. Vá em SQL Editor
-- 3. Cole este script completo
-- 4. Execute
-- 5. Verifique os dados inseridos
-- 6. Teste novamente o cadastro de Tipos de Licença
