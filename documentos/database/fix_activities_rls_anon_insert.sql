-- ============================================
-- Fix: Adicionar políticas RLS para role anon
-- Tabela: activities
-- Descrição: Permitir anon fazer INSERT/UPDATE/DELETE
-- Data: 2025-11-11
-- ============================================

-- Remover políticas antigas se existirem (para recriar)
DROP POLICY IF EXISTS "activities_insert_policy_anon" ON activities;
DROP POLICY IF EXISTS "activities_update_policy_anon" ON activities;
DROP POLICY IF EXISTS "activities_delete_policy_anon" ON activities;

-- Criar política de INSERT para anon
CREATE POLICY "activities_insert_policy_anon"
ON activities FOR INSERT TO anon WITH CHECK (true);

-- Criar política de UPDATE para anon
CREATE POLICY "activities_update_policy_anon"
ON activities FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Criar política de DELETE para anon
CREATE POLICY "activities_delete_policy_anon"
ON activities FOR DELETE TO anon USING (true);

-- Verificar políticas criadas
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE tablename = 'activities'
ORDER BY policyname;
