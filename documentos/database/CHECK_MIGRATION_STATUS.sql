-- =====================================================
-- VERIFICAR STATUS DA MIGRAÇÃO ACTIVITIES
-- =====================================================
-- Execute este script para verificar o estado atual
-- =====================================================

-- 1. Verificar campos da tabela
SELECT 
    '1. ESTRUTURA DA TABELA' AS verificacao,
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'activities'
AND column_name IN ('code', 'cnae_codigo', 'cnae_descricao')
ORDER BY ordinal_position;

-- 2. Verificar constraint UNIQUE
SELECT 
    '2. CONSTRAINT UNIQUE' AS verificacao,
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'activities'::regclass
AND conname LIKE '%code%';

-- 3. Verificar se sequência existe
SELECT 
    '3. SEQUÊNCIA' AS verificacao,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'activities_code_seq')
        THEN '✅ Sequência activities_code_seq existe'
        ELSE '❌ Sequência NÃO existe - EXECUTE FIX_ACTIVITIES_CODE_DUPLICATES.sql'
    END AS status;

-- 4. Ver valor da sequência (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'activities_code_seq') THEN
        RAISE NOTICE '4. VALOR DA SEQUÊNCIA: %', (SELECT last_value FROM activities_code_seq);
    ELSE
        RAISE NOTICE '4. VALOR DA SEQUÊNCIA: ❌ Sequência não existe';
    END IF;
END $$;

-- 5. Verificar duplicações
SELECT 
    '5. DUPLICAÇÕES' AS verificacao,
    code,
    COUNT(*) as quantidade,
    STRING_AGG(name, ' | ') as nomes
FROM activities
GROUP BY code
HAVING COUNT(*) > 1
ORDER BY code;

-- 6. Ver alguns registros
SELECT 
    '6. AMOSTRA DE DADOS' AS verificacao,
    code,
    cnae_codigo,
    LEFT(name, 40) as name,
    is_active
FROM activities
ORDER BY code
LIMIT 10;

-- =====================================================
-- DIAGNÓSTICO
-- =====================================================
DO $$
DECLARE
    has_cnae BOOLEAN;
    has_sequence BOOLEAN;
    has_default BOOLEAN;
    has_duplicates BOOLEAN;
BEGIN
    -- Verificar campos CNAE
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'activities' AND column_name = 'cnae_codigo'
    ) INTO has_cnae;
    
    -- Verificar sequência
    SELECT EXISTS (
        SELECT 1 FROM pg_sequences WHERE sequencename = 'activities_code_seq'
    ) INTO has_sequence;
    
    -- Verificar default
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'activities' 
        AND column_name = 'code'
        AND column_default LIKE '%activities_code_seq%'
    ) INTO has_default;
    
    -- Verificar duplicações
    SELECT EXISTS (
        SELECT 1 FROM activities
        GROUP BY code
        HAVING COUNT(*) > 1
    ) INTO has_duplicates;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DIAGNÓSTICO DA MIGRAÇÃO';
    RAISE NOTICE '========================================';
    
    IF has_cnae THEN
        RAISE NOTICE '✅ Campos CNAE existem';
    ELSE
        RAISE NOTICE '❌ Campos CNAE NÃO existem - Execute MIGRATION_ACTIVITIES_ADD_CNAE.sql';
    END IF;
    
    IF has_sequence THEN
        RAISE NOTICE '✅ Sequência existe';
    ELSE
        RAISE NOTICE '❌ Sequência NÃO existe - Execute FIX_ACTIVITIES_CODE_DUPLICATES.sql';
    END IF;
    
    IF has_default THEN
        RAISE NOTICE '✅ Campo code tem default automático';
    ELSE
        RAISE NOTICE '❌ Campo code NÃO tem default - Execute FIX_ACTIVITIES_CODE_DUPLICATES.sql';
    END IF;
    
    IF has_duplicates THEN
        RAISE NOTICE '⚠️ Existem códigos duplicados - Execute FIX_ACTIVITIES_CODE_DUPLICATES.sql';
    ELSE
        RAISE NOTICE '✅ Nenhuma duplicação encontrada';
    END IF;
    
    RAISE NOTICE '========================================';
    
    IF has_cnae AND has_sequence AND has_default AND NOT has_duplicates THEN
        RAISE NOTICE '🎉 MIGRAÇÃO COMPLETA E CORRETA!';
    ELSE
        RAISE NOTICE '⚠️ AÇÃO NECESSÁRIA: Execute os scripts faltantes';
    END IF;
    
    RAISE NOTICE '========================================';
END $$;
