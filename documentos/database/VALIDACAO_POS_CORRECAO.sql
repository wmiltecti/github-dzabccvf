-- =====================================================
-- VALIDAÇÃO APÓS CORREÇÃO DE DUPLICAÇÕES
-- =====================================================
-- Execute este script APÓS rodar FIX_ACTIVITIES_CODE_DUPLICATES.sql
-- para verificar se tudo está correto
-- =====================================================

-- ✅ VERIFICAÇÃO 1: Nenhuma duplicação deve existir
SELECT 
    '1. Verificar Duplicações' AS teste,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASSOU - Nenhuma duplicação encontrada'
        ELSE '❌ FALHOU - ' || COUNT(*) || ' códigos duplicados encontrados'
    END AS resultado
FROM (
    SELECT code
    FROM activities
    GROUP BY code
    HAVING COUNT(*) > 1
) duplicates;

-- ✅ VERIFICAÇÃO 2: Constraint UNIQUE deve existir
SELECT 
    '2. Verificar Constraint UNIQUE' AS teste,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASSOU - Constraint UNIQUE existe'
        ELSE '❌ FALHOU - Constraint UNIQUE não encontrada'
    END AS resultado
FROM pg_constraint
WHERE conrelid = 'activities'::regclass
AND conname LIKE '%code%unique%';

-- ✅ VERIFICAÇÃO 3: Sequência deve existir e ter valor correto
SELECT 
    '3. Verificar Sequência' AS teste,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'activities_code_seq')
        THEN '✅ PASSOU - Sequência activities_code_seq existe'
        ELSE '❌ FALHOU - Sequência não encontrada'
    END AS resultado;

-- ✅ VERIFICAÇÃO 4: Valores originais preservados em cnae_codigo
SELECT 
    '4. Verificar Preservação de Dados' AS teste,
    CASE 
        WHEN COUNT(*) = (SELECT COUNT(*) FROM activities WHERE cnae_codigo IS NOT NULL)
        THEN '✅ PASSOU - Todos os registros têm cnae_codigo preservado'
        ELSE '❌ FALHOU - Alguns registros sem cnae_codigo'
    END AS resultado
FROM activities;

-- ✅ VERIFICAÇÃO 5: Campo code deve ter default nextval()
SELECT 
    '5. Verificar Default Autoincrement' AS teste,
    CASE 
        WHEN column_default LIKE '%activities_code_seq%' 
        THEN '✅ PASSOU - Campo code tem autoincrement configurado'
        ELSE '❌ FALHOU - Autoincrement não configurado'
    END AS resultado
FROM information_schema.columns
WHERE table_name = 'activities' AND column_name = 'code';

-- =====================================================
-- VISUALIZAÇÃO DOS DADOS CORRIGIDOS
-- =====================================================

SELECT 
    '=== DADOS APÓS CORREÇÃO ===' AS titulo;

SELECT 
    code,
    cnae_codigo AS codigo_original,
    LEFT(name, 50) AS nome,
    is_active
FROM activities
ORDER BY code;

-- =====================================================
-- TESTE DE INSERÇÃO (AUTOINCREMENT)
-- =====================================================

-- Verificar qual será o próximo código
SELECT 
    '=== PRÓXIMO CÓDIGO AUTOMÁTICO ===' AS titulo,
    last_value + 1 AS proximo_code
FROM activities_code_seq;

-- =====================================================
-- RESUMO FINAL
-- =====================================================

SELECT 
    COUNT(*) AS total_atividades,
    COUNT(DISTINCT code) AS codigos_unicos,
    MIN(code) AS menor_code,
    MAX(code) AS maior_code,
    (SELECT last_value FROM activities_code_seq) + 1 AS proximo_code_auto
FROM activities;

-- =====================================================
-- MENSAGEM DE SUCESSO
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ VALIDAÇÃO CONCLUÍDA';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Se todos os testes passaram, a correção foi bem-sucedida!';
    RAISE NOTICE 'O próximo código será gerado automaticamente pelo banco.';
    RAISE NOTICE '========================================';
END $$;
