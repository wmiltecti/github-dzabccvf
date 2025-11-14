-- Criar tabela process_types (Tipos de Processo)
-- Tabela para armazenar os tipos de processos de licenciamento

CREATE TABLE IF NOT EXISTS process_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    abbreviation VARCHAR(50),
    description TEXT,
    default_deadline_days INTEGER,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Adicionar comentários
COMMENT ON TABLE process_types IS 'Tipos de processos de licenciamento ambiental';
COMMENT ON COLUMN process_types.id IS 'Identificador único do tipo de processo';
COMMENT ON COLUMN process_types.name IS 'Nome do tipo de processo';
COMMENT ON COLUMN process_types.abbreviation IS 'Sigla ou abreviação do tipo de processo';
COMMENT ON COLUMN process_types.description IS 'Descrição detalhada do tipo de processo';
COMMENT ON COLUMN process_types.default_deadline_days IS 'Prazo padrão em dias para este tipo de processo';
COMMENT ON COLUMN process_types.display_order IS 'Ordem de exibição na interface';
COMMENT ON COLUMN process_types.is_active IS 'Indica se o tipo de processo está ativo';

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_process_types_name ON process_types(name);
CREATE INDEX IF NOT EXISTS idx_process_types_is_active ON process_types(is_active);
CREATE INDEX IF NOT EXISTS idx_process_types_display_order ON process_types(display_order);

-- Desabilitar RLS (para permitir acesso aos usuários autenticados)
ALTER TABLE process_types DISABLE ROW LEVEL SECURITY;

-- Inserir dados iniciais
INSERT INTO process_types (name, abbreviation, description, default_deadline_days, display_order) VALUES
    ('Licença Prévia', 'LP', 'Concedida na fase preliminar do planejamento do empreendimento ou atividade', 120, 1),
    ('Licença de Instalação', 'LI', 'Autoriza a instalação do empreendimento ou atividade', 180, 2),
    ('Licença de Operação', 'LO', 'Autoriza a operação da atividade ou empreendimento', 120, 3),
    ('Licença Ambiental Única', 'LAU', 'Licenciamento simplificado para atividades de pequeno porte', 90, 4),
    ('Renovação de Licença', 'RENOV', 'Renovação de licença ambiental existente', 60, 5),
    ('Autorização Ambiental', 'AUT', 'Autorização para atividades específicas', 60, 6),
    ('Dispensa de Licenciamento', 'DISP', 'Declaração de dispensa de licenciamento ambiental', 30, 7)
ON CONFLICT (name) DO NOTHING;

-- Verificar dados inseridos
SELECT 
    id,
    name,
    description,
    is_active,
    created_at
FROM process_types
ORDER BY name;

-- Verificar se RLS está desabilitado
SELECT 
    tablename,
    rowsecurity as "RLS Habilitado"
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename = 'process_types';

-- INSTRUÇÕES:
-- 1. Abra o Supabase Dashboard
-- 2. Vá em SQL Editor
-- 3. Cole este script completo
-- 4. Execute
-- 5. Verifique os dados inseridos
-- 6. Teste novamente o cadastro de Tipos de Processo
