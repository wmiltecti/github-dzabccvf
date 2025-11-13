-- ============================================
-- Fix: Adicionar políticas RLS para role anon
-- Tabela: activity_license_types
-- Descrição: Permitir anon fazer INSERT/UPDATE/DELETE
-- Data: 2025-11-11
-- ============================================

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "activity_license_types_select_anon" ON activity_license_types;
DROP POLICY IF EXISTS "activity_license_types_insert_anon" ON activity_license_types;
DROP POLICY IF EXISTS "activity_license_types_update_anon" ON activity_license_types;
DROP POLICY IF EXISTS "activity_license_types_delete_anon" ON activity_license_types;

-- Criar política de SELECT para anon
CREATE POLICY "activity_license_types_select_anon"
ON activity_license_types FOR SELECT TO anon USING (true);

-- Criar política de INSERT para anon
CREATE POLICY "activity_license_types_insert_anon"
ON activity_license_types FOR INSERT TO anon WITH CHECK (true);

-- Criar política de UPDATE para anon
CREATE POLICY "activity_license_types_update_anon"
ON activity_license_types FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Criar política de DELETE para anon
CREATE POLICY "activity_license_types_delete_anon"
ON activity_license_types FOR DELETE TO anon USING (true);

-- Verificar políticas criadas
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE tablename = 'activity_license_types'
ORDER BY policyname;
