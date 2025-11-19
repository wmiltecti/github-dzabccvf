-- ============================================
-- SCRIPT: Criar tabela activity_license_type_documents
-- Descrição: Nova estrutura para associar documentos a tipos de licença dentro de uma atividade
-- Data: 2025-11-19
-- Versão: 2.0
-- ============================================

-- ============================================
-- IMPORTANTE: Estrutura de Tabelas
-- ============================================
--
-- Este sistema possui DUAS tabelas distintas para documentos:
--
-- 1. license_type_documents
--    - Documentos padrão de um tipo de licença (Ex: LP sempre exige EIA/RIMA)
--    - Gerenciada no menu "Tipo de Licença"
--    - Serve como template/padrão
--
-- 2. activity_license_type_documents (ESTA TABELA)
--    - Documentos específicos para uma atividade + tipo de licença
--    - Gerenciada no menu "Atividades"
--    - Pode herdar documentos da tabela 1, mas permite adicionar/remover
--
-- FLUXO:
-- 1. Ao selecionar um tipo de licença em "Atividades"
-- 2. O sistema carrega documentos de license_type_documents (se existirem)
-- 3. Usuário pode adicionar/remover documentos
-- 4. Salva na tabela activity_license_type_documents
--
-- ============================================

-- 1. Criar a nova tabela
CREATE TABLE IF NOT EXISTS activity_license_type_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  license_type_id UUID NOT NULL REFERENCES license_types(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES documentation_templates(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(activity_id, license_type_id, template_id)
);

-- 2. Criar comentários
COMMENT ON TABLE activity_license_type_documents IS 'Relacionamento entre atividades, tipos de licença e documentos exigidos - Específico para cada atividade';
COMMENT ON COLUMN activity_license_type_documents.activity_id IS 'ID da atividade';
COMMENT ON COLUMN activity_license_type_documents.license_type_id IS 'ID do tipo de licença';
COMMENT ON COLUMN activity_license_type_documents.template_id IS 'ID do template de documentação';
COMMENT ON COLUMN activity_license_type_documents.is_required IS 'Indica se o documento é obrigatório para esta atividade específica';

-- 3. Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_activity_license_type_docs_activity
ON activity_license_type_documents(activity_id);

CREATE INDEX IF NOT EXISTS idx_activity_license_type_docs_license_type
ON activity_license_type_documents(license_type_id);

CREATE INDEX IF NOT EXISTS idx_activity_license_type_docs_template
ON activity_license_type_documents(template_id);

CREATE INDEX IF NOT EXISTS idx_activity_license_type_docs_composite
ON activity_license_type_documents(activity_id, license_type_id);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE activity_license_type_documents ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS para acesso anônimo e autenticado
CREATE POLICY "activity_license_type_documents_select_anon"
ON activity_license_type_documents FOR SELECT
TO anon
USING (true);

CREATE POLICY "activity_license_type_documents_select_auth"
ON activity_license_type_documents FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "activity_license_type_documents_insert_auth"
ON activity_license_type_documents FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "activity_license_type_documents_update_auth"
ON activity_license_type_documents FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "activity_license_type_documents_delete_auth"
ON activity_license_type_documents FOR DELETE
TO authenticated
USING (true);

-- 6. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_activity_license_type_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Criar trigger para atualizar updated_at
CREATE TRIGGER trigger_update_activity_license_type_documents_updated_at
BEFORE UPDATE ON activity_license_type_documents
FOR EACH ROW
EXECUTE FUNCTION update_activity_license_type_documents_updated_at();

-- 8. Garantir permissões adequadas
GRANT SELECT ON activity_license_type_documents TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON activity_license_type_documents TO authenticated, service_role;
GRANT ALL ON activity_license_type_documents TO postgres;

-- ============================================
-- MIGRAÇÃO DE DADOS (OPCIONAL)
-- ============================================
-- ATENÇÃO: Execute esta seção APENAS se você já tem dados na tabela
-- activity_documents antiga e deseja migrar para a nova estrutura.
--
-- Esta migração criará uma entrada para cada combinação:
-- documento × tipo de licença (para cada atividade)
--
-- ANTES DE EXECUTAR: Faça backup dos dados!
-- ============================================

/*
-- Descomente o bloco abaixo para executar a migração

-- Migrar dados existentes de activity_documents para activity_license_type_documents
INSERT INTO activity_license_type_documents (activity_id, license_type_id, template_id, is_required)
SELECT
  ad.activity_id,
  alt.license_type_id,
  ad.template_id,
  ad.is_required
FROM activity_documents ad
CROSS JOIN activity_license_types alt
WHERE ad.activity_id = alt.activity_id
ON CONFLICT (activity_id, license_type_id, template_id) DO NOTHING;

-- Após confirmar que a migração funcionou corretamente,
-- você pode opcionalmente remover as tabelas antigas:
-- DROP TABLE IF EXISTS activity_documents CASCADE;
*/

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar se a tabela foi criada
SELECT
  table_name,
  (SELECT count(*) FROM activity_license_type_documents) as total_records
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'activity_license_type_documents';

-- Verificar índices criados
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'activity_license_type_documents'
ORDER BY indexname;

-- Verificar políticas RLS
SELECT
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'activity_license_type_documents'
ORDER BY policyname;

-- Verificar triggers
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'activity_license_type_documents';

-- ============================================
-- EXEMPLOS DE USO
-- ============================================

/*
-- Exemplo 1: Inserir documentos para uma atividade + tipo de licença
INSERT INTO activity_license_type_documents (activity_id, license_type_id, template_id, is_required)
VALUES
  ('uuid-da-atividade', 'uuid-tipo-licenca-LP', 'uuid-doc-eia-rima', true),
  ('uuid-da-atividade', 'uuid-tipo-licenca-LP', 'uuid-doc-plano-controle', false);

-- Exemplo 2: Consultar documentos de uma atividade específica
SELECT
  altd.*,
  lt.abbreviation as tipo_licenca,
  dt.name as nome_documento
FROM activity_license_type_documents altd
JOIN license_types lt ON altd.license_type_id = lt.id
JOIN documentation_templates dt ON altd.template_id = dt.id
WHERE altd.activity_id = 'uuid-da-atividade';

-- Exemplo 3: Consultar documentos por tipo de licença em uma atividade
SELECT
  dt.name as documento,
  altd.is_required as obrigatorio
FROM activity_license_type_documents altd
JOIN documentation_templates dt ON altd.template_id = dt.id
WHERE altd.activity_id = 'uuid-da-atividade'
  AND altd.license_type_id = 'uuid-tipo-licenca';

-- Exemplo 4: Atualizar obrigatoriedade de um documento
UPDATE activity_license_type_documents
SET is_required = true
WHERE activity_id = 'uuid-da-atividade'
  AND license_type_id = 'uuid-tipo-licenca'
  AND template_id = 'uuid-documento';
*/

-- ============================================
-- FIM DO SCRIPT
-- ============================================
