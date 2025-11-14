-- FIX RÁPIDO: Desabilitar RLS temporariamente
-- Use este script se as políticas RLS não estiverem funcionando

-- Opção 1: Desabilitar RLS completamente (MAIS SIMPLES - USE ESTA)
ALTER TABLE property_types DISABLE ROW LEVEL SECURITY;

-- Verificar status do RLS
SELECT 
    tablename,
    rowsecurity as "RLS Habilitado"
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename = 'property_types';

-- Opção 2: Se preferir manter RLS mas permitir tudo (mais seguro)
-- Descomente as linhas abaixo:

/*
ALTER TABLE property_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for authenticated users" ON property_types;

CREATE POLICY "Allow all for authenticated users"
ON property_types
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Verificar políticas criadas
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'property_types';
*/
