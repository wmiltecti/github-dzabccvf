/*
  # Corrigir Problemas de Segurança
  
  1. Índices
    - Remover índices não utilizados de license_types
    - Remover índices não utilizados de documentation_templates
    - Manter apenas índices essenciais para performance
  
  2. Políticas RLS
    - Remover políticas duplicadas em license_type_documents
    - Consolidar em políticas únicas e bem definidas
  
  3. RLS em Tabelas Públicas
    - Habilitar RLS em license_types
    - Habilitar RLS em documentation_templates
    - Criar políticas adequadas para cada tabela
  
  4. Segurança
    - Garantir que apenas authenticated pode modificar dados
    - Permitir leitura pública apenas onde necessário
*/

-- ============================================================================
-- 1. REMOVER ÍNDICES NÃO UTILIZADOS
-- ============================================================================

-- Remover índices não utilizados de license_types
DROP INDEX IF EXISTS idx_license_types_abbreviation;
DROP INDEX IF EXISTS idx_license_types_name;
DROP INDEX IF EXISTS idx_license_types_is_active;

-- Remover índices não utilizados de documentation_templates
DROP INDEX IF EXISTS idx_documentation_templates_is_active;

-- Os índices em license_type_documents são necessários para JOINs, então mantemos


-- ============================================================================
-- 2. CORRIGIR POLÍTICAS RLS DUPLICADAS EM license_type_documents
-- ============================================================================

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Todos podem visualizar documentos de tipos de licença" ON license_type_documents;
DROP POLICY IF EXISTS "Usuários anônimos podem visualizar documentos" ON license_type_documents;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar documentos de tipos de licença" ON license_type_documents;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar documentos de tipos de l" ON license_type_documents;

-- Criar políticas consolidadas (uma por role e ação)
-- Política de leitura para todos (public inclui anon e authenticated)
CREATE POLICY "Permitir leitura pública de documentos de tipos de licença"
  ON license_type_documents FOR SELECT
  TO public
  USING (true);

-- Política de INSERT para authenticated
CREATE POLICY "Authenticated pode inserir documentos de tipos de licença"
  ON license_type_documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política de UPDATE para authenticated
CREATE POLICY "Authenticated pode atualizar documentos de tipos de licença"
  ON license_type_documents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política de DELETE para authenticated
CREATE POLICY "Authenticated pode deletar documentos de tipos de licença"
  ON license_type_documents FOR DELETE
  TO authenticated
  USING (true);


-- ============================================================================
-- 3. HABILITAR RLS EM license_types
-- ============================================================================

-- Habilitar RLS
ALTER TABLE license_types ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Permitir leitura pública de tipos de licença" ON license_types;
DROP POLICY IF EXISTS "Authenticated pode inserir tipos de licença" ON license_types;
DROP POLICY IF EXISTS "Authenticated pode atualizar tipos de licença" ON license_types;
DROP POLICY IF EXISTS "Authenticated pode deletar tipos de licença" ON license_types;

-- Política de leitura para todos
CREATE POLICY "Permitir leitura pública de tipos de licença"
  ON license_types FOR SELECT
  TO public
  USING (true);

-- Política de INSERT para authenticated
CREATE POLICY "Authenticated pode inserir tipos de licença"
  ON license_types FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política de UPDATE para authenticated
CREATE POLICY "Authenticated pode atualizar tipos de licença"
  ON license_types FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política de DELETE para authenticated
CREATE POLICY "Authenticated pode deletar tipos de licença"
  ON license_types FOR DELETE
  TO authenticated
  USING (true);


-- ============================================================================
-- 4. HABILITAR RLS EM documentation_templates
-- ============================================================================

-- Habilitar RLS
ALTER TABLE documentation_templates ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Permitir leitura pública de templates de documentação" ON documentation_templates;
DROP POLICY IF EXISTS "Authenticated pode inserir templates de documentação" ON documentation_templates;
DROP POLICY IF EXISTS "Authenticated pode atualizar templates de documentação" ON documentation_templates;
DROP POLICY IF EXISTS "Authenticated pode deletar templates de documentação" ON documentation_templates;

-- Política de leitura para todos
CREATE POLICY "Permitir leitura pública de templates de documentação"
  ON documentation_templates FOR SELECT
  TO public
  USING (true);

-- Política de INSERT para authenticated
CREATE POLICY "Authenticated pode inserir templates de documentação"
  ON documentation_templates FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política de UPDATE para authenticated
CREATE POLICY "Authenticated pode atualizar templates de documentação"
  ON documentation_templates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política de DELETE para authenticated
CREATE POLICY "Authenticated pode deletar templates de documentação"
  ON documentation_templates FOR DELETE
  TO authenticated
  USING (true);


-- ============================================================================
-- 5. GARANTIR PERMISSÕES PARA TODOS OS ROLES
-- ============================================================================

-- Garantir permissões em license_types
GRANT SELECT ON license_types TO anon;
GRANT ALL ON license_types TO authenticated, service_role;

-- Garantir permissões em documentation_templates
GRANT SELECT ON documentation_templates TO anon;
GRANT ALL ON documentation_templates TO authenticated, service_role;

-- Garantir permissões em license_type_documents
GRANT SELECT ON license_type_documents TO anon;
GRANT ALL ON license_type_documents TO authenticated, service_role;

-- Comentários para forçar atualização do cache
COMMENT ON TABLE license_types IS 'Tipos de licenças ambientais - RLS Enabled';
COMMENT ON TABLE documentation_templates IS 'Modelos de documentação para processos de licenciamento - RLS Enabled';
COMMENT ON TABLE license_type_documents IS 'Relacionamento entre tipos de licença e documentos necessários - RLS Enabled';