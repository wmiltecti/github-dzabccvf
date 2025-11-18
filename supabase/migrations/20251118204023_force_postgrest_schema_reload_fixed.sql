/*
  # Forçar Reload do Schema Cache do PostgREST
  
  1. Estratégia
    - Usar NOTIFY para sinalizar ao PostgREST que o schema mudou
    - Fazer pequena alteração estrutural para invalidar cache
    - Recriar view temporária para forçar atualização
  
  2. Alterações
    - Adicionar e remover coluna temporária
    - Enviar notificação ao PostgREST
*/

-- Estratégia 1: Adicionar e remover uma coluna temporária para forçar alteração de schema
DO $$
BEGIN
  -- Adicionar coluna temporária
  ALTER TABLE license_type_documents ADD COLUMN IF NOT EXISTS _temp_cache_bust text DEFAULT NULL;
  
  -- Esperar um momento
  PERFORM pg_sleep(0.1);
  
  -- Remover coluna temporária
  ALTER TABLE license_type_documents DROP COLUMN IF EXISTS _temp_cache_bust;
END $$;

-- Estratégia 2: Enviar notificação PGRST para recarregar schema
-- PostgREST escuta por esta notificação para recarregar o cache
NOTIFY pgrst, 'reload schema';

-- Estratégia 3: Atualizar a descrição da tabela
DO $$
DECLARE
  new_comment text;
BEGIN
  new_comment := 'Relacionamento entre tipos de licença e documentos necessários - Updated: ' || NOW()::text;
  EXECUTE format('COMMENT ON TABLE license_type_documents IS %L', new_comment);
END $$;

-- Estratégia 4: Recriar uma view dummy e depois remover (força reload do schema)
DROP VIEW IF EXISTS _force_schema_reload_view CASCADE;
CREATE OR REPLACE VIEW _force_schema_reload_view AS 
SELECT 1 as dummy;
DROP VIEW IF EXISTS _force_schema_reload_view CASCADE;

-- Estratégia 5: Alterar permissões para forçar recalculo de políticas
REVOKE ALL ON license_type_documents FROM anon;
GRANT SELECT ON license_type_documents TO anon;

-- Estratégia 6: Desabilitar e reabilitar RLS (força recalculo de políticas)
ALTER TABLE license_type_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE license_type_documents ENABLE ROW LEVEL SECURITY;

-- Garantir que todas as permissões estão corretas
GRANT SELECT ON license_type_documents TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON license_type_documents TO authenticated, service_role;