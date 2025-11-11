-- ============================================
-- Script: Criação da tabela documentation_templates
-- Descrição: Modelos de documentação para licenciamento ambiental
-- Data: 2025-11-11
-- ============================================

-- Criar ou atualizar tabela documentation_templates
DO $$ 
BEGIN
    -- Criar tabela se não existir
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'documentation_templates') THEN
        CREATE TABLE public.documentation_templates (
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
    END IF;

    -- Adicionar colunas se não existirem
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'documentation_templates' 
                   AND column_name = 'template_file_url') THEN
        ALTER TABLE public.documentation_templates ADD COLUMN template_file_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'documentation_templates' 
                   AND column_name = 'file_size_bytes') THEN
        ALTER TABLE public.documentation_templates ADD COLUMN file_size_bytes BIGINT;
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'documentation_templates' 
                   AND column_name = 'mime_type') THEN
        ALTER TABLE public.documentation_templates ADD COLUMN mime_type VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'documentation_templates' 
                   AND column_name = 'template_file_name') THEN
        ALTER TABLE public.documentation_templates ADD COLUMN template_file_name VARCHAR(500);
    END IF;
END $$;

-- Comentários
COMMENT ON TABLE public.documentation_templates IS 'Modelos de documentação para processos de licenciamento ambiental';
COMMENT ON COLUMN public.documentation_templates.name IS 'Nome do documento/template';
COMMENT ON COLUMN public.documentation_templates.description IS 'Descrição detalhada do documento';
COMMENT ON COLUMN public.documentation_templates.document_types IS 'Array de tipos aceitos (Word, PDF, Imagem, Zip, Excel)';
COMMENT ON COLUMN public.documentation_templates.template_file_name IS 'Nome do arquivo modelo';
COMMENT ON COLUMN public.documentation_templates.template_file_url IS 'URL do arquivo modelo no storage';
COMMENT ON COLUMN public.documentation_templates.file_size_bytes IS 'Tamanho do arquivo em bytes';
COMMENT ON COLUMN public.documentation_templates.mime_type IS 'Tipo MIME do arquivo';
COMMENT ON COLUMN public.documentation_templates.is_active IS 'Indica se o template está ativo';

-- Adicionar constraint UNIQUE se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'documentation_templates_name_key' 
        AND conrelid = 'public.documentation_templates'::regclass
    ) THEN
        ALTER TABLE public.documentation_templates ADD CONSTRAINT documentation_templates_name_key UNIQUE (name);
    END IF;
END $$;

-- Índices
CREATE INDEX IF NOT EXISTS idx_documentation_templates_name ON public.documentation_templates(name);
CREATE INDEX IF NOT EXISTS idx_documentation_templates_is_active ON public.documentation_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_documentation_templates_document_types ON public.documentation_templates USING GIN(document_types);

-- Inserir dados iniciais (ignorar se já existir)
INSERT INTO public.documentation_templates (name, description, document_types) 
SELECT * FROM (VALUES
('Requerimento de Licença Prévia', 'Documento de solicitação inicial para obtenção de Licença Prévia (LP)', ARRAY['Word', 'PDF']::TEXT[]),
('Requerimento de Licença de Instalação', 'Documento de solicitação para obtenção de Licença de Instalação (LI)', ARRAY['Word', 'PDF']::TEXT[]),
('Requerimento de Licença de Operação', 'Documento de solicitação para obtenção de Licença de Operação (LO)', ARRAY['Word', 'PDF']::TEXT[]),
('Procuração', 'Modelo de procuração para representação legal no processo', ARRAY['Word', 'PDF']::TEXT[]),
('Declaração de Veracidade', 'Declaração de responsabilidade e veracidade das informações prestadas', ARRAY['Word', 'PDF']::TEXT[]),
('Certidão de Uso do Solo', 'Certidão municipal de uso e ocupação do solo', ARRAY['PDF', 'Imagem']::TEXT[]),
('Anotação de Responsabilidade Técnica (ART)', 'ART do responsável técnico pelo estudo ambiental', ARRAY['PDF']::TEXT[]),
('Comprovante de Propriedade ou Posse', 'Documentação que comprove propriedade ou posse legal do imóvel', ARRAY['PDF', 'Imagem']::TEXT[]),
('Planta de Localização', 'Planta de situação e localização do empreendimento', ARRAY['PDF', 'Imagem']::TEXT[]),
('Memorial Descritivo', 'Memorial descritivo detalhado do empreendimento', ARRAY['Word', 'PDF']::TEXT[])
) AS v(name, description, document_types)
WHERE NOT EXISTS (
    SELECT 1 FROM public.documentation_templates 
    WHERE documentation_templates.name = v.name
);

-- Desabilitar RLS (Row Level Security) para testes
ALTER TABLE public.documentation_templates DISABLE ROW LEVEL SECURITY;

-- Garantir que a tabela seja acessível
GRANT ALL ON public.documentation_templates TO postgres, anon, authenticated, service_role;

-- ============================================
-- Verificação
-- ============================================

-- Verificar dados inseridos
SELECT 
    id,
    name,
    description,
    document_types,
    template_file_name,
    is_active,
    created_at
FROM public.documentation_templates
ORDER BY name;

-- Contar registros
SELECT COUNT(*) as total_documentos FROM public.documentation_templates;

-- Verificar tipos de documentos mais comuns
SELECT 
    unnest(document_types) as tipo,
    COUNT(*) as quantidade
FROM public.documentation_templates
GROUP BY tipo
ORDER BY quantidade DESC;

-- ============================================
-- INSTRUÇÕES DE USO:
-- ============================================
-- 1. Copie todo este script
-- 2. Acesse o Supabase Dashboard
-- 3. Vá em SQL Editor
-- 4. Cole o script e execute
-- 5. Verifique se a tabela foi criada com sucesso
-- 6. Execute novamente o teste Python:
--    python tests\test_documentation_selenium.py
-- ============================================
