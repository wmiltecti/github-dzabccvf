-- ============================================
-- SCRIPT DE VERIFICAÇÃO E CRIAÇÃO
-- Configurações do Sistema
-- Execute no SQL Editor do Supabase
-- ============================================

-- 1. VERIFICAR SE A TABELA EXISTE
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'system_configurations'
);

-- 2. SE NÃO EXISTIR, CRIAR A TABELA
CREATE TABLE IF NOT EXISTS public.system_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    config_key VARCHAR(255) NOT NULL UNIQUE,
    config_value BOOLEAN NOT NULL DEFAULT false,
    config_description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. INSERIR CONFIGURAÇÕES INICIAIS (se não existirem)
INSERT INTO public.system_configurations 
    (config_key, config_value, config_description, is_active)
VALUES
    (
        'empreendimento_search_required',
        false,
        'Define se a pesquisa de empreendimento é OBRIGATÓRIA antes de prosseguir no cadastro.',
        true
    ),
    (
        'empreendimento_allow_new_register',
        true,
        'Define se é permitido CADASTRAR NOVO empreendimento quando a pesquisa não encontrar resultados.',
        true
    )
ON CONFLICT (config_key) DO NOTHING;

-- 4. VERIFICAR RLS (Row Level Security)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'system_configurations';

-- 5. DESABILITAR RLS TEMPORARIAMENTE (para teste)
ALTER TABLE public.system_configurations DISABLE ROW LEVEL SECURITY;

-- 6. VERIFICAR SE HÁ DADOS NA TABELA
SELECT * FROM public.system_configurations;

-- 7. SE PRECISAR RECRIAR AS POLÍTICAS RLS (execute depois que funcionar)
/*
ALTER TABLE public.system_configurations ENABLE ROW LEVEL SECURITY;

-- Policy para leitura (todos autenticados)
DROP POLICY IF EXISTS "Permitir leitura para autenticados" ON public.system_configurations;
CREATE POLICY "Permitir leitura para autenticados"
ON public.system_configurations
FOR SELECT
TO authenticated
USING (true);

-- Policy para leitura anônima (se necessário)
DROP POLICY IF EXISTS "Permitir leitura anônima" ON public.system_configurations;
CREATE POLICY "Permitir leitura anônima"
ON public.system_configurations
FOR SELECT
TO anon
USING (is_active = true);

-- Policy para atualização (todos autenticados - ajustar depois)
DROP POLICY IF EXISTS "Permitir atualização para autenticados" ON public.system_configurations;
CREATE POLICY "Permitir atualização para autenticados"
ON public.system_configurations
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
*/
