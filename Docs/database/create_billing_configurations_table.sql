-- ============================================
-- Tabela: billing_configurations
-- Descrição: Configurações de cobrança por atividade e tipo de licença
-- Data: 2025-11-11
-- ============================================

-- Criar tabela
CREATE TABLE IF NOT EXISTS billing_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID REFERENCES activities(id),
  license_type_id UUID REFERENCES license_types(id),
  reference_unit_id UUID REFERENCES reference_units(id),
  unit_value DECIMAL(10,2),
  multiplication_factor DECIMAL(5,2) DEFAULT 1.0,
  is_exempt BOOLEAN DEFAULT false,
  revenue_destination VARCHAR(50),
  municipality_percentage DECIMAL(5,2),
  state_percentage DECIMAL(5,2),
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE billing_configurations ENABLE ROW LEVEL SECURITY;

-- Política: Permitir leitura para todos autenticados
CREATE POLICY "billing_configurations_select_policy"
ON billing_configurations FOR SELECT
TO authenticated
USING (true);

-- Política: Permitir inserção para usuários autenticados
CREATE POLICY "billing_configurations_insert_policy"
ON billing_configurations FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política: Permitir atualização para usuários autenticados
CREATE POLICY "billing_configurations_update_policy"
ON billing_configurations FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política: Permitir exclusão para usuários autenticados
CREATE POLICY "billing_configurations_delete_policy"
ON billing_configurations FOR DELETE
TO authenticated
USING (true);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_billing_configurations_activity 
ON billing_configurations(activity_id);

CREATE INDEX IF NOT EXISTS idx_billing_configurations_license_type 
ON billing_configurations(license_type_id);

CREATE INDEX IF NOT EXISTS idx_billing_configurations_reference_unit 
ON billing_configurations(reference_unit_id);

-- ============================================
-- Dados iniciais de exemplo (OPCIONAL)
-- ============================================
-- Comentado: dados serão inseridos via interface de teste
-- INSERT INTO billing_configurations (activity_id, license_type_id, reference_unit_id, unit_value, multiplication_factor, is_exempt, revenue_destination, municipality_percentage, state_percentage, observations)
-- SELECT 
--   (SELECT id FROM activities LIMIT 1),
--   (SELECT id FROM license_types LIMIT 1),
--   (SELECT id FROM reference_units LIMIT 1),
--   150.00,
--   1.0,
--   false,
--   'estado',
--   NULL,
--   NULL,
--   'Configuração padrão de teste'
-- WHERE NOT EXISTS (SELECT 1 FROM billing_configurations LIMIT 1);

-- ============================================
-- Verificação
-- ============================================
SELECT COUNT(*) as total_registros FROM billing_configurations;
