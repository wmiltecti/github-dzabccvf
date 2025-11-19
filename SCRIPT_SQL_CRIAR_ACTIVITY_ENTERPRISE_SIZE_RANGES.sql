-- ============================================
-- SCRIPT: Criar tabela activity_enterprise_size_ranges
-- Descrição: Tabela para armazenar múltiplas faixas de porte por atividade
-- Data: 2025-11-19
-- ============================================

-- ============================================
-- IMPORTANTE
-- ============================================
-- Esta tabela é necessária para o cadastro de atividades.
-- Ela armazena as configurações de porte e faixas para cada atividade.
-- ============================================

-- 1. Verificar se a tabela já existe (com nome diferente)
DO $$
BEGIN
  -- Se existir uma tabela com nome parecido, avisar
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'activity_enterprise_ranges'
  ) THEN
    RAISE NOTICE 'ATENÇÃO: Foi encontrada a tabela "activity_enterprise_ranges" (sem _size)';
    RAISE NOTICE 'Esta tabela pode ser uma versão antiga. Verifique se deve ser migrada ou removida.';
  END IF;
END $$;

-- 2. Criar a tabela correta
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

-- 3. Criar comentários
COMMENT ON TABLE activity_enterprise_size_ranges IS 'Múltiplas faixas de porte por atividade';
COMMENT ON COLUMN activity_enterprise_size_ranges.activity_id IS 'ID da atividade';
COMMENT ON COLUMN activity_enterprise_size_ranges.enterprise_size_id IS 'ID do porte do empreendimento';
COMMENT ON COLUMN activity_enterprise_size_ranges.range_name IS 'Nome da faixa (ex: Porte 1, Porte 2)';
COMMENT ON COLUMN activity_enterprise_size_ranges.range_start IS 'Início da faixa numérica';
COMMENT ON COLUMN activity_enterprise_size_ranges.range_end IS 'Fim da faixa numérica';

-- 4. Criar índices
CREATE INDEX IF NOT EXISTS idx_activity_enterprise_size_ranges_activity
ON activity_enterprise_size_ranges(activity_id);

CREATE INDEX IF NOT EXISTS idx_activity_enterprise_size_ranges_enterprise_size
ON activity_enterprise_size_ranges(enterprise_size_id);

-- 5. Habilitar RLS (Row Level Security)
ALTER TABLE activity_enterprise_size_ranges ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS

-- Política de SELECT (leitura) - permite acesso anônimo e autenticado
CREATE POLICY "activity_enterprise_size_ranges_select_anon"
ON activity_enterprise_size_ranges FOR SELECT
TO anon
USING (true);

CREATE POLICY "activity_enterprise_size_ranges_select_auth"
ON activity_enterprise_size_ranges FOR SELECT
TO authenticated
USING (true);

-- Política de INSERT (inserção) - apenas autenticados
CREATE POLICY "activity_enterprise_size_ranges_insert_auth"
ON activity_enterprise_size_ranges FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política de UPDATE (atualização) - apenas autenticados
CREATE POLICY "activity_enterprise_size_ranges_update_auth"
ON activity_enterprise_size_ranges FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política de DELETE (exclusão) - apenas autenticados
CREATE POLICY "activity_enterprise_size_ranges_delete_auth"
ON activity_enterprise_size_ranges FOR DELETE
TO authenticated
USING (true);

-- 7. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_activity_enterprise_size_ranges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Criar trigger para atualizar updated_at
CREATE TRIGGER trigger_update_activity_enterprise_size_ranges_updated_at
BEFORE UPDATE ON activity_enterprise_size_ranges
FOR EACH ROW
EXECUTE FUNCTION update_activity_enterprise_size_ranges_updated_at();

-- 9. Garantir permissões adequadas
GRANT SELECT ON activity_enterprise_size_ranges TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON activity_enterprise_size_ranges TO authenticated, service_role;
GRANT ALL ON activity_enterprise_size_ranges TO postgres;

-- ============================================
-- MIGRAÇÃO DE DADOS (OPCIONAL)
-- ============================================
-- Se você tem uma tabela antiga "activity_enterprise_ranges" e quer migrar os dados,
-- descomente o bloco abaixo:

/*
-- Verificar se a tabela antiga existe antes de migrar
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'activity_enterprise_ranges'
  ) THEN
    -- Migrar dados da tabela antiga para a nova
    INSERT INTO activity_enterprise_size_ranges (
      id, activity_id, enterprise_size_id, range_name,
      range_start, range_end, created_at, updated_at
    )
    SELECT
      id, activity_id, enterprise_size_id, range_name,
      range_start, range_end, created_at, updated_at
    FROM activity_enterprise_ranges
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Migração concluída. Verifique os dados antes de remover a tabela antiga.';

    -- Para remover a tabela antiga após verificar que tudo está OK:
    -- DROP TABLE IF EXISTS activity_enterprise_ranges CASCADE;
  ELSE
    RAISE NOTICE 'Tabela antiga não encontrada. Nenhuma migração necessária.';
  END IF;
END $$;
*/

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar se a tabela foi criada
SELECT
  table_name,
  (SELECT count(*) FROM activity_enterprise_size_ranges) as total_records
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'activity_enterprise_size_ranges';

-- Verificar índices criados
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'activity_enterprise_size_ranges'
ORDER BY indexname;

-- Verificar políticas RLS
SELECT
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'activity_enterprise_size_ranges'
ORDER BY policyname;

-- Verificar triggers
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'activity_enterprise_size_ranges';

-- Verificar constraints
SELECT
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'activity_enterprise_size_ranges'
ORDER BY constraint_type, constraint_name;

-- ============================================
-- EXEMPLOS DE USO
-- ============================================

/*
-- Exemplo 1: Inserir faixas de porte para uma atividade
INSERT INTO activity_enterprise_size_ranges (
  activity_id, enterprise_size_id, range_name, range_start, range_end
)
VALUES
  ('uuid-da-atividade', 'uuid-porte-pequeno', 'Porte 1', 0, 1000),
  ('uuid-da-atividade', 'uuid-porte-medio', 'Porte 2', 1001, 5000),
  ('uuid-da-atividade', 'uuid-porte-grande', 'Porte 3', 5001, NULL);

-- Exemplo 2: Consultar faixas de uma atividade
SELECT
  aesr.*,
  es.name as porte_nome
FROM activity_enterprise_size_ranges aesr
JOIN enterprise_sizes es ON aesr.enterprise_size_id = es.id
WHERE aesr.activity_id = 'uuid-da-atividade'
ORDER BY aesr.range_start NULLS FIRST;

-- Exemplo 3: Atualizar uma faixa
UPDATE activity_enterprise_size_ranges
SET range_end = 10000
WHERE activity_id = 'uuid-da-atividade'
  AND range_name = 'Porte 2';

-- Exemplo 4: Remover faixas de uma atividade
DELETE FROM activity_enterprise_size_ranges
WHERE activity_id = 'uuid-da-atividade';
*/

-- ============================================
-- FIM DO SCRIPT
-- ============================================

-- Mensagem de conclusão
DO $$
BEGIN
  RAISE NOTICE '✓ Script executado com sucesso!';
  RAISE NOTICE '✓ Tabela activity_enterprise_size_ranges criada';
  RAISE NOTICE '✓ Execute as queries de VERIFICAÇÃO acima para confirmar';
END $$;
