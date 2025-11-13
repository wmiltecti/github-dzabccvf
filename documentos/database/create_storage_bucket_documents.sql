-- ============================================
-- Script: Configuração do Supabase Storage para Documentos
-- Descrição: Criar bucket e políticas para upload de templates
-- Data: 2025-11-11
-- ============================================

-- 1. Criar bucket 'documents' (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documents', 'documents', true, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 1.1. Atualizar bucket para ser público (caso já exista)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'documents';

-- 2. Remover políticas antigas se existirem (ignorar erros)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public Access" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 3. Criar políticas de acesso PERMISSIVAS

-- Policy: Qualquer pessoa autenticada pode fazer TUDO no bucket documents
CREATE POLICY "Allow all for authenticated users"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

-- Policy: Acesso público para leitura
CREATE POLICY "Public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'documents');

-- Policy: Permitir acesso anônimo (se necessário)
CREATE POLICY "Allow anon access"
ON storage.objects
FOR ALL
TO anon
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

-- ============================================
-- Verificação
-- ============================================

-- Ver buckets criados
SELECT * FROM storage.buckets WHERE id = 'documents';

-- Ver políticas do bucket
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%documents%' OR policyname LIKE '%Public%' OR policyname LIKE '%Authenticated%';

-- ============================================
-- INSTRUÇÕES ALTERNATIVAS (Interface Web):
-- ============================================
-- Se preferir criar via interface do Supabase:
-- 
-- 1. Acesse: Supabase Dashboard → Storage
-- 2. Clique em "New bucket"
-- 3. Nome: "documents"
-- 4. Marque "Public bucket" ✓
-- 5. Clique em "Create bucket"
-- 
-- 6. Clique no bucket "documents"
-- 7. Vá em "Policies" → "New policy"
-- 8. Adicione políticas conforme acima
-- ============================================
