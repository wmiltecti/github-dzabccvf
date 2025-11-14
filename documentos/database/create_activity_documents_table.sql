-- ============================================
-- Tabela: activity_documents
-- Descrição: Relacionamento entre atividades e documentos
-- Data: 2025-11-11
-- ============================================

CREATE TABLE IF NOT EXISTS activity_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  template_id UUID REFERENCES documentation_templates(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(activity_id, template_id)
);

-- Habilitar RLS
ALTER TABLE activity_documents ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "activity_documents_select_policy"
ON activity_documents FOR SELECT TO authenticated USING (true);

CREATE POLICY "activity_documents_insert_policy"
ON activity_documents FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "activity_documents_update_policy"
ON activity_documents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "activity_documents_delete_policy"
ON activity_documents FOR DELETE TO authenticated USING (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_activity_documents_activity 
ON activity_documents(activity_id);

CREATE INDEX IF NOT EXISTS idx_activity_documents_template 
ON activity_documents(template_id);

-- Verificação
SELECT COUNT(*) as total_documentos FROM activity_documents;
