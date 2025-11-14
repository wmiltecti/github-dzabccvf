-- Criar tabela pollution_potentials (Potencial Poluidor)
-- Tabela para armazenar os potenciais poluidores

CREATE TABLE IF NOT EXISTS pollution_potentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Adicionar comentários
COMMENT ON TABLE pollution_potentials IS 'Potenciais poluidores';
COMMENT ON COLUMN pollution_potentials.id IS 'Identificador único do potencial poluidor';
COMMENT ON COLUMN pollution_potentials.name IS 'Nome do potencial poluidor';
COMMENT ON COLUMN pollution_potentials.description IS 'Descrição detalhada do potencial poluidor';
COMMENT ON COLUMN pollution_potentials.is_active IS 'Indica se o potencial poluidor está ativo';

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_pollution_potentials_name ON pollution_potentials(name);
CREATE INDEX IF NOT EXISTS idx_pollution_potentials_is_active ON pollution_potentials(is_active);

-- Desabilitar RLS (para permitir acesso aos usuários autenticados)
ALTER TABLE pollution_potentials DISABLE ROW LEVEL SECURITY;

-- Inserir dados iniciais (potenciais poluidores padrão conforme legislação ambiental)
INSERT INTO pollution_potentials (name, description) VALUES
    ('Insignificante', 'Atividades com potencial poluidor insignificante, sem risco ambiental significativo'),
    ('Baixo', 'Atividades com baixo potencial poluidor, com impacto ambiental mínimo e facilmente controlável'),
    ('Médio', 'Atividades com médio potencial poluidor, requerendo medidas de controle e monitoramento'),
    ('Alto', 'Atividades com alto potencial poluidor, exigindo controles rigorosos e monitoramento constante'),
    ('Muito Alto', 'Atividades com potencial poluidor muito alto, com risco significativo de impacto ambiental')
ON CONFLICT (name) DO NOTHING;

-- Verificar dados inseridos
SELECT 
    id,
    name,
    description,
    is_active,
    created_at
FROM pollution_potentials
ORDER BY 
    CASE 
        WHEN name = 'Insignificante' THEN 1
        WHEN name = 'Baixo' THEN 2
        WHEN name = 'Médio' THEN 3
        WHEN name = 'Alto' THEN 4
        WHEN name = 'Muito Alto' THEN 5
        ELSE 6
    END;

-- Verificar se RLS está desabilitado
SELECT 
    tablename,
    rowsecurity as "RLS Habilitado"
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename = 'pollution_potentials';

-- INSTRUÇÕES:
-- 1. Abra o Supabase Dashboard
-- 2. Vá em SQL Editor
-- 3. Cole este script completo
-- 4. Execute
-- 5. Verifique os dados inseridos
-- 6. Teste novamente o cadastro de Potencial Poluidor
