/*
  # Tabela de Sincronização Offline de Processos

  1. Nova Tabela
    - `processos_pendentes_sync`
      - `id` (uuid, primary key)
      - `user_id` (uuid, referência ao usuário)
      - `processo_id_local` (text, ID local temporário ou ID do processo)
      - `dados_completos` (jsonb, dados completos da operação)
      - `tipo_operacao` (text, tipo: 'CREATE_PROCESSO' ou 'UPSERT_DADOS_GERAIS')
      - `synced` (boolean, indica se já foi sincronizado)
      - `created_at` (timestamptz, data de criação)
      - `synced_at` (timestamptz, data de sincronização)

  2. Segurança
    - Habilitar RLS na tabela
    - Políticas para usuários autenticados acessarem apenas seus próprios registros

  3. Índices
    - Índice em `user_id` e `synced` para queries de sincronização
*/

CREATE TABLE IF NOT EXISTS processos_pendentes_sync (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  processo_id_local text NOT NULL,
  dados_completos jsonb NOT NULL,
  tipo_operacao text NOT NULL,
  synced boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  synced_at timestamptz
);

ALTER TABLE processos_pendentes_sync ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pending sync operations"
  ON processos_pendentes_sync
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pending sync operations"
  ON processos_pendentes_sync
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending sync operations"
  ON processos_pendentes_sync
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own pending sync operations"
  ON processos_pendentes_sync
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_processos_pendentes_sync_user_synced 
  ON processos_pendentes_sync(user_id, synced);
