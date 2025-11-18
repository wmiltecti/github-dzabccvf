/*
  # Recriar tabela license_type_documents completamente
  
  1. Estratégia
    - Drop completo da tabela
    - Recriar do zero
    - Isso força o PostgREST a registrar a tabela novamente
  
  2. Segurança
    - RLS habilitado
    - Políticas recriadas
*/

-- Drop completo (CASCADE remove todas as constraints)
DROP TABLE IF EXISTS license_type_documents CASCADE;

-- Recriar a tabela do zero
CREATE TABLE license_type_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_type_id uuid NOT NULL,
  documentation_template_id uuid NOT NULL,
  is_required boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Adicionar foreign keys
ALTER TABLE license_type_documents
  ADD CONSTRAINT fk_license_type_documents_license_type
  FOREIGN KEY (license_type_id) 
  REFERENCES license_types(id) 
  ON DELETE CASCADE;

ALTER TABLE license_type_documents
  ADD CONSTRAINT fk_license_type_documents_documentation_template
  FOREIGN KEY (documentation_template_id) 
  REFERENCES documentation_templates(id) 
  ON DELETE CASCADE;

-- Criar índices
CREATE INDEX idx_license_type_documents_license_type 
  ON license_type_documents(license_type_id);

CREATE INDEX idx_license_type_documents_template 
  ON license_type_documents(documentation_template_id);

-- Constraint única
CREATE UNIQUE INDEX idx_license_type_docs_unique 
  ON license_type_documents(license_type_id, documentation_template_id);

-- Comentário
COMMENT ON TABLE license_type_documents IS 'Relacionamento entre tipos de licença e documentos necessários';

-- Habilitar RLS
ALTER TABLE license_type_documents ENABLE ROW LEVEL SECURITY;

-- Criar políticas (uma por operação)
CREATE POLICY "Permitir leitura pública de documentos de tipos de licença"
  ON license_type_documents FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated pode inserir documentos de tipos de licença"
  ON license_type_documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated pode atualizar documentos de tipos de licença"
  ON license_type_documents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated pode deletar documentos de tipos de licença"
  ON license_type_documents FOR DELETE
  TO authenticated
  USING (true);

-- Garantir permissões
GRANT SELECT ON license_type_documents TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON license_type_documents TO authenticated, service_role;
GRANT ALL ON license_type_documents TO postgres;

-- Enviar notificação de reload
NOTIFY pgrst, 'reload schema';