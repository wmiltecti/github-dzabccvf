/*
  # Corrigir acesso à tabela license_type_documents
  
  1. Mudanças
    - Garantir permissões corretas para todos os roles
    - Adicionar comentário na tabela para forçar atualização do cache
    - Recriar políticas RLS se necessário
*/

-- Garantir permissões para todos os roles
GRANT ALL ON public.license_type_documents TO postgres, anon, authenticated, service_role;

-- Garantir permissões na sequence se existir
DO $$ 
BEGIN
  -- Verifica se existe alguma sequence relacionada
  GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
END $$;

-- Forçar atualização do cache adicionando/atualizando comentário
COMMENT ON TABLE license_type_documents IS 'Relacionamento entre tipos de licença e documentos necessários - Updated 2025-11-18';

-- Recriar política para usuários anônimos se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'license_type_documents' 
    AND policyname = 'Usuários anônimos podem visualizar documentos'
  ) THEN
    CREATE POLICY "Usuários anônimos podem visualizar documentos"
      ON license_type_documents FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;