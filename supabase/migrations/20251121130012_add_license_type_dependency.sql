/*
  # Adicionar dependência entre tipos de licença

  1. Alterações
    - Adicionar coluna `depends_on_license_type_id` na tabela `license_types`
      - Permite que um tipo de licença seja vinculado a outro tipo como dependência
      - Campo opcional (nullable)
      - Cria relacionamento com a própria tabela (self-referencing foreign key)

  2. Índices
    - Criar índice na coluna `depends_on_license_type_id` para melhorar performance de consultas

  3. Comentários
    - Adicionar comentários explicativos na coluna

  Notas Importantes:
    - O campo é opcional, permitindo tipos de licença sem dependência
    - A constraint ON DELETE SET NULL garante que se um tipo de licença for deletado,
      os tipos que dependem dele terão a dependência removida automaticamente
    - Exemplo de uso: "Licença de Instalação (LI)" pode depender de "Licença Prévia (LP)"
*/

-- Adicionar coluna de dependência na tabela license_types
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'license_types' AND column_name = 'depends_on_license_type_id'
  ) THEN
    ALTER TABLE license_types
    ADD COLUMN depends_on_license_type_id UUID REFERENCES license_types(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_license_types_dependency
ON license_types(depends_on_license_type_id);

-- Adicionar comentário na coluna
COMMENT ON COLUMN license_types.depends_on_license_type_id IS
'ID do tipo de licença do qual este tipo depende (relacionamento de dependência opcional)';

-- Verificar estrutura da tabela
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'license_types'
ORDER BY ordinal_position;
