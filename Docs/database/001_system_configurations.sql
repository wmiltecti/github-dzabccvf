-- ============================================
-- Script: Criação da Tabela system_configurations
-- Descrição: Tabela para armazenar configurações do sistema
-- Data: 2025-11-10
-- Autor: Sistema de Licenciamento Ambiental
-- ============================================

-- Criar tabela system_configurations
CREATE TABLE IF NOT EXISTS public.system_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    config_key VARCHAR(255) NOT NULL UNIQUE,
    config_value BOOLEAN NOT NULL DEFAULT false,
    config_description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_config_key_format CHECK (config_key ~ '^[a-z_]+$')
);

-- Criar índice para busca rápida por chave
CREATE INDEX IF NOT EXISTS idx_system_configurations_key 
ON public.system_configurations(config_key) 
WHERE is_active = true;

-- Criar índice para busca por status ativo
CREATE INDEX IF NOT EXISTS idx_system_configurations_active 
ON public.system_configurations(is_active);

-- Comentários na tabela e colunas
COMMENT ON TABLE public.system_configurations IS 'Tabela de configurações do sistema para controle de funcionalidades';
COMMENT ON COLUMN public.system_configurations.config_key IS 'Chave única da configuração (formato: lowercase_com_underscores)';
COMMENT ON COLUMN public.system_configurations.config_value IS 'Valor booleano da configuração (true/false)';
COMMENT ON COLUMN public.system_configurations.config_description IS 'Descrição detalhada da configuração e seu impacto';
COMMENT ON COLUMN public.system_configurations.is_active IS 'Indica se a configuração está ativa no sistema';

-- ============================================
-- Inserir configurações iniciais
-- ============================================

INSERT INTO public.system_configurations 
    (config_key, config_value, config_description, is_active)
VALUES
    (
        'empreendimento_search_required',
        false,
        'Define se a pesquisa de empreendimento é OBRIGATÓRIA antes de prosseguir no cadastro. Quando TRUE, o usuário DEVE pesquisar antes de avançar para a aba de empreendimento.',
        true
    ),
    (
        'empreendimento_allow_new_register',
        true,
        'Define se é permitido CADASTRAR NOVO empreendimento quando a pesquisa não encontrar resultados. Quando FALSE, o usuário só pode selecionar empreendimentos existentes.',
        true
    )
ON CONFLICT (config_key) DO NOTHING;

-- ============================================
-- Criar função para atualizar updated_at automaticamente
-- ============================================

CREATE OR REPLACE FUNCTION update_system_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_system_configurations_timestamp 
ON public.system_configurations;

CREATE TRIGGER trigger_update_system_configurations_timestamp
    BEFORE UPDATE ON public.system_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_system_configurations_updated_at();

-- ============================================
-- Policies RLS (Row Level Security)
-- ============================================

-- Habilitar RLS na tabela
ALTER TABLE public.system_configurations ENABLE ROW LEVEL SECURITY;

-- Policy: Qualquer usuário autenticado pode LER configurações ativas
CREATE POLICY "Usuários autenticados podem ler configurações ativas"
ON public.system_configurations
FOR SELECT
TO authenticated
USING (is_active = true);

-- Policy: Apenas admins podem ATUALIZAR configurações
CREATE POLICY "Apenas admins podem atualizar configurações"
ON public.system_configurations
FOR UPDATE
TO authenticated
USING (
    -- Verificar se o usuário tem role de admin
    -- Ajuste conforme sua estrutura de permissões
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
);

-- Policy: Apenas admins podem INSERIR novas configurações
CREATE POLICY "Apenas admins podem inserir configurações"
ON public.system_configurations
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
);

-- ============================================
-- Verificações e consultas úteis
-- ============================================

-- Consultar todas as configurações ativas
-- SELECT * FROM public.system_configurations WHERE is_active = true ORDER BY config_key;

-- Consultar configuração específica
-- SELECT config_value FROM public.system_configurations WHERE config_key = 'empreendimento_search_required' AND is_active = true;

-- Atualizar configuração (executar como admin)
-- UPDATE public.system_configurations 
-- SET config_value = true 
-- WHERE config_key = 'empreendimento_search_required';

-- ============================================
-- FIM DO SCRIPT
-- ============================================
