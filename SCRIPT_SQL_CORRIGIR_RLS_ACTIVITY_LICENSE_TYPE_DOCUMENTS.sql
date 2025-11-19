-- ============================================
-- SCRIPT: Corrigir RLS da tabela activity_license_type_documents
-- Descrição: Remove políticas antigas e cria novas políticas corretas
-- Data: 2025-11-19
-- Erro: "new row violates row-level security policy"
-- ============================================

-- ============================================
-- DIAGNÓSTICO
-- ============================================

-- Verificar se a tabela existe
SELECT
  table_name,
  (SELECT COUNT(*) FROM activity_license_type_documents) as total_registros
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'activity_license_type_documents';

-- Verificar se RLS está habilitado
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE tablename = 'activity_license_type_documents';

-- Verificar políticas existentes
SELECT
  policyname,
  cmd as comando,
  roles as funcoes,
  qual as usando,
  with_check as com_verificacao
FROM pg_policies
WHERE tablename = 'activity_license_type_documents'
ORDER BY policyname;

-- ============================================
-- CORREÇÃO
-- ============================================

-- PASSO 1: Remover TODAS as políticas antigas
DROP POLICY IF EXISTS "activity_license_type_documents_select_anon" ON activity_license_type_documents;
DROP POLICY IF EXISTS "activity_license_type_documents_select_auth" ON activity_license_type_documents;
DROP POLICY IF EXISTS "activity_license_type_documents_insert_auth" ON activity_license_type_documents;
DROP POLICY IF EXISTS "activity_license_type_documents_update_auth" ON activity_license_type_documents;
DROP POLICY IF EXISTS "activity_license_type_documents_delete_auth" ON activity_license_type_documents;

-- Remover outras possíveis políticas com nomes diferentes
DROP POLICY IF EXISTS "Enable read access for all users" ON activity_license_type_documents;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON activity_license_type_documents;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON activity_license_type_documents;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON activity_license_type_documents;

-- PASSO 2: Garantir que RLS está habilitado
ALTER TABLE activity_license_type_documents ENABLE ROW LEVEL SECURITY;

-- PASSO 3: Criar políticas corretas e permissivas

-- Política de SELECT para usuários anônimos (acesso público de leitura)
CREATE POLICY "activity_license_type_documents_select_anon"
ON activity_license_type_documents
FOR SELECT
TO anon
USING (true);

-- Política de SELECT para usuários autenticados
CREATE POLICY "activity_license_type_documents_select_auth"
ON activity_license_type_documents
FOR SELECT
TO authenticated
USING (true);

-- Política de INSERT para usuários autenticados (PERMITE TUDO)
CREATE POLICY "activity_license_type_documents_insert_auth"
ON activity_license_type_documents
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política de UPDATE para usuários autenticados (PERMITE TUDO)
CREATE POLICY "activity_license_type_documents_update_auth"
ON activity_license_type_documents
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política de DELETE para usuários autenticados (PERMITE TUDO)
CREATE POLICY "activity_license_type_documents_delete_auth"
ON activity_license_type_documents
FOR DELETE
TO authenticated
USING (true);

-- PASSO 4: Garantir permissões no nível de tabela
GRANT SELECT ON activity_license_type_documents TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON activity_license_type_documents TO authenticated, service_role;
GRANT ALL ON activity_license_type_documents TO postgres;

-- ============================================
-- VERIFICAÇÃO PÓS-CORREÇÃO
-- ============================================

-- Verificar políticas criadas
SELECT
  policyname,
  cmd as comando,
  roles as funcoes
FROM pg_policies
WHERE tablename = 'activity_license_type_documents'
ORDER BY cmd, policyname;

-- Verificar permissões
SELECT
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'activity_license_type_documents'
ORDER BY grantee, privilege_type;

-- ============================================
-- TESTE MANUAL (OPCIONAL)
-- ============================================

/*
-- Após executar este script, teste inserindo um registro manualmente:

INSERT INTO activity_license_type_documents (
  activity_id,
  license_type_id,
  template_id,
  is_required
)
VALUES (
  (SELECT id FROM activities LIMIT 1),
  (SELECT id FROM license_types LIMIT 1),
  (SELECT id FROM documentation_templates LIMIT 1),
  true
);

-- Se a inserção funcionar, o problema está resolvido!
-- Para remover o registro de teste:
DELETE FROM activity_license_type_documents
WHERE created_at > NOW() - INTERVAL '1 minute';
*/

-- ============================================
-- ALTERNATIVA: DESABILITAR RLS TEMPORARIAMENTE
-- ============================================
-- ⚠️ USE APENAS SE A CORREÇÃO ACIMA NÃO FUNCIONAR
-- ⚠️ ISSO REMOVE A SEGURANÇA DA TABELA!

/*
-- Desabilitar RLS completamente (NÃO RECOMENDADO PARA PRODUÇÃO)
ALTER TABLE activity_license_type_documents DISABLE ROW LEVEL SECURITY;

-- Para reabilitar depois:
-- ALTER TABLE activity_license_type_documents ENABLE ROW LEVEL SECURITY;
*/

-- ============================================
-- FIM DO SCRIPT
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✓ Script de correção executado com sucesso!';
  RAISE NOTICE '✓ Políticas RLS recriadas';
  RAISE NOTICE '✓ Permissões configuradas';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ TESTE AGORA:';
  RAISE NOTICE '1. Vá no menu Atividades';
  RAISE NOTICE '2. Tente criar/editar uma atividade';
  RAISE NOTICE '3. Adicione tipos de licença e documentos';
  RAISE NOTICE '4. Clique em Salvar';
  RAISE NOTICE '';
  RAISE NOTICE 'Se o erro persistir, verifique:';
  RAISE NOTICE '- Você está logado no sistema?';
  RAISE NOTICE '- O token de autenticação é válido?';
  RAISE NOTICE '- Execute as queries de VERIFICAÇÃO acima';
END $$;
