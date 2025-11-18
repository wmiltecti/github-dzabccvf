/*
  # Forçar refresh do cache da tabela license_type_documents
  
  1. Alterações
    - Drop e recriar a tabela para forçar atualização no cache do Supabase REST API
    - Recriar todas as constraints e índices
    - Recriar políticas RLS
  
  2. Segurança
    - Garantir RLS ativo
    - Políticas para acesso público de leitura
    - Políticas para authenticated gerenciar dados
*/

-- Drop da tabela existente (não há dados para perder)
DROP TABLE IF EXISTS license_type_documents CASCADE;

-- Recriar tabela
CREATE TABLE IF NOT EXISTS license_type_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_type_id uuid NOT NULL REFERENCES license_types(id) ON DELETE CASCADE,
  documentation_template_id uuid NOT NULL REFERENCES documentation_templates(id) ON DELETE CASCADE,
  is_required boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Adicionar comentário
COMMENT ON TABLE license_type_documents IS 'Relacionamento entre tipos de licença e documentos necessários';

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_license_type_documents_license_type 
  ON license_type_documents(license_type_id);

CREATE INDEX IF NOT EXISTS idx_license_type_documents_template 
  ON license_type_documents(documentation_template_id);

-- Criar constraint única para evitar duplicatas
CREATE UNIQUE INDEX IF NOT EXISTS idx_license_type_docs_unique 
  ON license_type_documents(license_type_id, documentation_template_id);

-- Habilitar RLS
ALTER TABLE license_type_documents ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Leitura pública
DROP POLICY IF EXISTS "Todos podem visualizar documentos de tipos de licença" ON license_type_documents;
CREATE POLICY "Todos podem visualizar documentos de tipos de licença"
  ON license_type_documents FOR SELECT
  TO public
  USING (true);

-- Políticas RLS: Usuários anônimos podem ler
DROP POLICY IF EXISTS "Usuários anônimos podem visualizar documentos" ON license_type_documents;
CREATE POLICY "Usuários anônimos podem visualizar documentos"
  ON license_type_documents FOR SELECT
  TO anon
  USING (true);

-- Políticas RLS: Authenticated pode fazer tudo
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar documentos de tipos de licença" ON license_type_documents;
CREATE POLICY "Usuários autenticados podem gerenciar documentos de tipos de licença"
  ON license_type_documents FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Garantir permissões para todos os roles
GRANT ALL ON license_type_documents TO postgres, anon, authenticated, service_role;