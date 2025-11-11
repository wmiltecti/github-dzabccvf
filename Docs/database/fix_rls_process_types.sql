-- FIX: Desabilitar RLS para tabela process_types
-- Permite que usuários autenticados façam CRUD em Tipos de Processo

-- Desabilitar RLS
ALTER TABLE process_types DISABLE ROW LEVEL SECURITY;

-- Verificar status
SELECT 
    tablename,
    rowsecurity as "RLS Habilitado"
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename = 'process_types';

-- INSTRUÇÕES:
-- 1. Abra o Supabase Dashboard SQL Editor
-- 2. Cole e execute este script
-- 3. Teste novamente o cadastro de Tipos de Processo
