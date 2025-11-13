-- ============================================
-- Tabela: activities (Atividades)
-- Descrição: Tipos de atividades para licenciamento
-- Data: 2025-11-11
-- ============================================

-- Criar tabela
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "activities_select_policy"
ON activities FOR SELECT TO authenticated USING (true);

CREATE POLICY "activities_insert_policy"
ON activities FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "activities_update_policy"
ON activities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "activities_delete_policy"
ON activities FOR DELETE TO authenticated USING (true);

-- Dados iniciais
INSERT INTO activities (code, name, description)
VALUES
  ('001', 'Agricultura', 'Atividades agrícolas e cultivo de produtos agrícolas'),
  ('002', 'Pecuária', 'Criação de animais para produção'),
  ('003', 'Silvicultura', 'Cultivo e manejo de florestas plantadas'),
  ('004', 'Extração Mineral', 'Extração de minerais e recursos naturais'),
  ('005', 'Indústria', 'Atividades industriais e de transformação'),
  ('006', 'Comércio', 'Atividades comerciais e de serviços'),
  ('007', 'Transporte', 'Transporte de cargas e passageiros'),
  ('008', 'Construção Civil', 'Obras de engenharia e construção'),
  ('009', 'Turismo', 'Atividades turísticas e hoteleiras'),
  ('010', 'Serviços', 'Prestação de serviços diversos')
ON CONFLICT (code) DO NOTHING;

-- Verificação
SELECT COUNT(*) as total_atividades FROM activities;
SELECT * FROM activities ORDER BY code;
