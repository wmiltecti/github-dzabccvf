-- ============================================
-- Tabela: activity_license_types
-- Descrição: Relacionamento entre atividades e tipos de licença
-- Data: 2025-11-11
-- ============================================

CREATE TABLE IF NOT EXISTS activity_license_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  license_type_id UUID REFERENCES license_types(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(activity_id, license_type_id)
);

-- Habilitar RLS
ALTER TABLE activity_license_types ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "activity_license_types_select_policy"
ON activity_license_types FOR SELECT TO authenticated USING (true);

CREATE POLICY "activity_license_types_insert_policy"
ON activity_license_types FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "activity_license_types_update_policy"
ON activity_license_types FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "activity_license_types_delete_policy"
ON activity_license_types FOR DELETE TO authenticated USING (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_activity_license_types_activity 
ON activity_license_types(activity_id);

CREATE INDEX IF NOT EXISTS idx_activity_license_types_license_type 
ON activity_license_types(license_type_id);

-- Verificação
SELECT COUNT(*) as total_relacionamentos FROM activity_license_types;
