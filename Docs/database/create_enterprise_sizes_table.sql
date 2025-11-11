-- Criar tabela enterprise_sizes (Porte do Empreendimento)
-- Tabela para armazenar os portes dos empreendimentos

CREATE TABLE IF NOT EXISTS enterprise_sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Adicionar comentários
COMMENT ON TABLE enterprise_sizes IS 'Portes de empreendimentos';
COMMENT ON COLUMN enterprise_sizes.id IS 'Identificador único do porte';
COMMENT ON COLUMN enterprise_sizes.name IS 'Nome do porte';
COMMENT ON COLUMN enterprise_sizes.description IS 'Descrição detalhada do porte';
COMMENT ON COLUMN enterprise_sizes.is_active IS 'Indica se o porte está ativo';

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_enterprise_sizes_name ON enterprise_sizes(name);
CREATE INDEX IF NOT EXISTS idx_enterprise_sizes_is_active ON enterprise_sizes(is_active);

-- Desabilitar RLS (para permitir acesso aos usuários autenticados)
ALTER TABLE enterprise_sizes DISABLE ROW LEVEL SECURITY;

-- Inserir dados iniciais (portes padrão conforme legislação ambiental)
INSERT INTO enterprise_sizes (name, description) VALUES
    ('Microempreendimento', 'Empreendimentos de pequeno porte com baixo impacto ambiental'),
    ('Pequeno Porte', 'Empreendimentos de pequeno porte com impacto ambiental reduzido'),
    ('Médio Porte', 'Empreendimentos de médio porte com impacto ambiental moderado'),
    ('Grande Porte', 'Empreendimentos de grande porte com potencial de impacto ambiental significativo'),
    ('Excepcional', 'Empreendimentos de porte excepcional com alto potencial de impacto ambiental')
ON CONFLICT (name) DO NOTHING;

-- Verificar dados inseridos
SELECT 
    id,
    name,
    description,
    is_active,
    created_at
FROM enterprise_sizes
ORDER BY 
    CASE 
        WHEN name = 'Microempreendimento' THEN 1
        WHEN name = 'Pequeno Porte' THEN 2
        WHEN name = 'Médio Porte' THEN 3
        WHEN name = 'Grande Porte' THEN 4
        WHEN name = 'Excepcional' THEN 5
        ELSE 6
    END;

-- Verificar se RLS está desabilitado
SELECT 
    tablename,
    rowsecurity as "RLS Habilitado"
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename = 'enterprise_sizes';

-- INSTRUÇÕES:
-- 1. Abra o Supabase Dashboard
-- 2. Vá em SQL Editor
-- 3. Cole este script completo
-- 4. Execute
-- 5. Verifique os dados inseridos
-- 6. Teste novamente o cadastro de Porte do Empreendimento
