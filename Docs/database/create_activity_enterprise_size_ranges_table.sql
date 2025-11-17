-- ============================================
-- Tabela: activity_enterprise_size_ranges
-- Descrição: Múltiplas faixas de porte por atividade
-- Data: 2025-11-17
-- ============================================

CREATE TABLE IF NOT EXISTS activity_enterprise_size_ranges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
  enterprise_size_id UUID REFERENCES enterprise_sizes(id) ON DELETE RESTRICT NOT NULL,
  range_name VARCHAR(100) NOT NULL,
  range_start DECIMAL(15, 2),
  range_end DECIMAL(15, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_range_values CHECK (
    (range_start IS NULL AND range_end IS NULL) OR 
    (range_start IS NOT NULL AND range_end IS NOT NULL AND range_end >= range_start)
  )
);

-- Habilitar RLS
ALTER TABLE activity_enterprise_size_ranges ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "activity_enterprise_size_ranges_select_policy"
ON activity_enterprise_size_ranges FOR SELECT TO authenticated USING (true);

CREATE POLICY "activity_enterprise_size_ranges_insert_policy"
ON activity_enterprise_size_ranges FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "activity_enterprise_size_ranges_update_policy"
ON activity_enterprise_size_ranges FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "activity_enterprise_size_ranges_delete_policy"
ON activity_enterprise_size_ranges FOR DELETE TO authenticated USING (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_activity_enterprise_size_ranges_activity 
ON activity_enterprise_size_ranges(activity_id);

CREATE INDEX IF NOT EXISTS idx_activity_enterprise_size_ranges_enterprise_size 
ON activity_enterprise_size_ranges(enterprise_size_id);

-- Comentários
COMMENT ON TABLE activity_enterprise_size_ranges IS 'Múltiplas faixas de porte por atividade';
COMMENT ON COLUMN activity_enterprise_size_ranges.activity_id IS 'ID da atividade';
COMMENT ON COLUMN activity_enterprise_size_ranges.enterprise_size_id IS 'ID do porte do empreendimento';
COMMENT ON COLUMN activity_enterprise_size_ranges.range_name IS 'Nome da faixa (ex: Porte 1, Porte 2)';
COMMENT ON COLUMN activity_enterprise_size_ranges.range_start IS 'Início da faixa numérica';
COMMENT ON COLUMN activity_enterprise_size_ranges.range_end IS 'Fim da faixa numérica';

-- Verificação
SELECT COUNT(*) as total_ranges FROM activity_enterprise_size_ranges;
