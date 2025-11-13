-- ============================================
-- FIX: Ajustar billing_configurations para aceitar valores NULL
-- E adicionar policies para anon
-- Data: 2025-11-11
-- ============================================

-- 1. Tornar campos opcionais nullable
ALTER TABLE billing_configurations 
  ALTER COLUMN enterprise_size_id DROP NOT NULL,
  ALTER COLUMN pollution_potential_id DROP NOT NULL,
  ALTER COLUMN measurement_unit DROP NOT NULL,
  ALTER COLUMN quantity_range_start DROP NOT NULL,
  ALTER COLUMN quantity_range_end DROP NOT NULL;

-- 2. Adicionar policy para anon (SELECT)
DROP POLICY IF EXISTS "billing_configurations_select_policy_anon" ON billing_configurations;
CREATE POLICY "billing_configurations_select_policy_anon"
ON billing_configurations FOR SELECT TO anon USING (true);

-- 3. Adicionar policy para anon (INSERT)
DROP POLICY IF EXISTS "billing_configurations_insert_policy_anon" ON billing_configurations;
CREATE POLICY "billing_configurations_insert_policy_anon"
ON billing_configurations FOR INSERT TO anon WITH CHECK (true);

-- 4. Adicionar policy para anon (UPDATE)
DROP POLICY IF EXISTS "billing_configurations_update_policy_anon" ON billing_configurations;
CREATE POLICY "billing_configurations_update_policy_anon"
ON billing_configurations FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- 5. Adicionar policy para anon (DELETE)
DROP POLICY IF EXISTS "billing_configurations_delete_policy_anon" ON billing_configurations;
CREATE POLICY "billing_configurations_delete_policy_anon"
ON billing_configurations FOR DELETE TO anon USING (true);

-- 6. Verificar estrutura final
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'billing_configurations'
ORDER BY ordinal_position;

-- 7. Listar todas as policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename = 'billing_configurations';
