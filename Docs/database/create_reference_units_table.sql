-- ============================================
-- Script: Criação da tabela reference_units
-- Descrição: Unidades de Referência para cálculos e medições
-- Data: 2025-11-11
-- ============================================

-- Criar tabela reference_units
CREATE TABLE IF NOT EXISTS public.reference_units (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Comentários
COMMENT ON TABLE public.reference_units IS 'Unidades de Referência para cálculos, medições e parâmetros';
COMMENT ON COLUMN public.reference_units.code IS 'Código da unidade (ex: UFR, m², kg)';
COMMENT ON COLUMN public.reference_units.name IS 'Nome da unidade (ex: Unidade Fiscal de Referência)';
COMMENT ON COLUMN public.reference_units.description IS 'Descrição detalhada da unidade';
COMMENT ON COLUMN public.reference_units.is_active IS 'Indica se a unidade está ativa';

-- Índices
CREATE INDEX IF NOT EXISTS idx_reference_units_code ON public.reference_units(code);
CREATE INDEX IF NOT EXISTS idx_reference_units_name ON public.reference_units(name);
CREATE INDEX IF NOT EXISTS idx_reference_units_is_active ON public.reference_units(is_active);

-- Inserir dados iniciais
INSERT INTO public.reference_units (code, name, description) VALUES
('UFR', 'Unidade Fiscal de Referência', 'Unidade de medida fiscal utilizada para cálculo de taxas e tributos ambientais'),
('m²', 'Metro Quadrado', 'Unidade de medida de área'),
('m³', 'Metro Cúbico', 'Unidade de medida de volume'),
('ha', 'Hectare', 'Unidade de medida de área equivalente a 10.000 m²'),
('kg', 'Quilograma', 'Unidade de medida de massa'),
('ton', 'Tonelada', 'Unidade de medida de massa equivalente a 1.000 kg'),
('L', 'Litro', 'Unidade de medida de volume líquido'),
('m³/h', 'Metro Cúbico por Hora', 'Unidade de medida de vazão volumétrica'),
('kW', 'Quilowatt', 'Unidade de medida de potência elétrica'),
('kWh', 'Quilowatt-hora', 'Unidade de medida de energia elétrica')
ON CONFLICT (code) DO NOTHING;

-- Desabilitar RLS (Row Level Security) para testes
ALTER TABLE public.reference_units DISABLE ROW LEVEL SECURITY;

-- Garantir que a tabela seja acessível
GRANT ALL ON public.reference_units TO postgres, anon, authenticated, service_role;

-- ============================================
-- Verificação
-- ============================================

-- Verificar dados inseridos
SELECT 
    id,
    code,
    name,
    description,
    is_active,
    created_at
FROM public.reference_units
ORDER BY code;

-- Contar registros
SELECT COUNT(*) as total_unidades FROM public.reference_units;

-- ============================================
-- INSTRUÇÕES DE USO:
-- ============================================
-- 1. Copie todo este script
-- 2. Acesse o Supabase Dashboard
-- 3. Vá em SQL Editor
-- 4. Cole o script e execute
-- 5. Verifique se a tabela foi criada com sucesso
-- 6. Execute novamente o teste Python:
--    python tests\test_reference_units_selenium.py
-- ============================================
