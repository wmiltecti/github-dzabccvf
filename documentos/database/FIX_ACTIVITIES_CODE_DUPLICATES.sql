-- =====================================================
-- CORRIGIR DUPLICAÇÕES NO CAMPO CODE
-- =====================================================
-- Data: 22/11/2025
-- Problema: Após migração, há múltiplos registros com mesmo code
-- Solução: Renumerar registros duplicados e adicionar UNIQUE constraint
-- =====================================================

-- 📊 VERIFICAR DUPLICAÇÕES ANTES DA CORREÇÃO
SELECT 
    code,
    COUNT(*) as total,
    STRING_AGG(id::TEXT, ', ') as ids_duplicados,
    STRING_AGG(name, ' | ') as nomes
FROM activities
GROUP BY code
HAVING COUNT(*) > 1
ORDER BY code;

-- =====================================================
-- ETAPA 1: RENUMERAR REGISTROS DUPLICADOS
-- =====================================================

-- Criar tabela temporária com novos códigos sequenciais
WITH ranked_activities AS (
    SELECT 
        id,
        code,
        cnae_codigo,
        ROW_NUMBER() OVER (ORDER BY created_at, id) as new_code
    FROM activities
)
UPDATE activities a
SET code = ra.new_code
FROM ranked_activities ra
WHERE a.id = ra.id;

-- =====================================================
-- ETAPA 2: VERIFICAR SE AINDA HÁ DUPLICAÇÕES
-- =====================================================

DO $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO duplicate_count
    FROM (
        SELECT code
        FROM activities
        GROUP BY code
        HAVING COUNT(*) > 1
    ) duplicates;
    
    IF duplicate_count > 0 THEN
        RAISE EXCEPTION 'Ainda existem % códigos duplicados!', duplicate_count;
    ELSE
        RAISE NOTICE '✅ Nenhuma duplicação encontrada';
    END IF;
END $$;

-- =====================================================
-- ETAPA 3: ADICIONAR CONSTRAINT UNIQUE
-- =====================================================

-- Remover constraint antiga se existir
ALTER TABLE activities 
DROP CONSTRAINT IF EXISTS activities_code_key;

-- Adicionar nova constraint UNIQUE
ALTER TABLE activities
ADD CONSTRAINT activities_code_unique UNIQUE (code);

-- =====================================================
-- ETAPA 4: CRIAR SEQUÊNCIA PARA AUTOINCREMENTO
-- =====================================================

-- Criar sequência baseada no maior código atual
DO $$
DECLARE
    max_code INTEGER;
BEGIN
    SELECT COALESCE(MAX(code), 0) + 1
    INTO max_code
    FROM activities;
    
    -- Criar ou recriar a sequência
    DROP SEQUENCE IF EXISTS activities_code_seq;
    EXECUTE format('CREATE SEQUENCE activities_code_seq START WITH %s', max_code);
    
    RAISE NOTICE '✅ Sequência criada começando em %', max_code;
END $$;

-- Definir o valor padrão do campo code para usar a sequência
ALTER TABLE activities 
ALTER COLUMN code SET DEFAULT nextval('activities_code_seq');

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar estrutura atualizada
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'activities'
AND column_name IN ('code', 'cnae_codigo', 'cnae_descricao')
ORDER BY ordinal_position;

-- Verificar dados após correção
SELECT 
    code,
    cnae_codigo AS codigo_original,
    name,
    CASE 
        WHEN cnae_codigo::NUMERIC = code THEN '✅ Sem decimal'
        ELSE '⚠️ Decimal preservado'
    END AS status
FROM activities
ORDER BY code;

-- Verificar constraint UNIQUE
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'activities'::regclass
AND conname LIKE '%code%';

-- Verificar sequência
SELECT 
    sequence_name,
    last_value,
    increment_by,
    is_called
FROM activities_code_seq;

-- =====================================================
-- RESUMO DA CORREÇÃO
-- =====================================================
/*
✅ Registros renumerados sequencialmente (1, 2, 3, ...)
✅ Constraint UNIQUE adicionada ao campo code
✅ Sequência criada para autoincremento
✅ Valores decimais originais preservados em cnae_codigo

PRÓXIMOS PASSOS:
1. Ao criar nova atividade no frontend, o campo 'code' será 
   preenchido automaticamente pela sequência

2. Considere remover o campo 'code' do formulário e deixá-lo
   automático (apenas exibir após salvar)

3. Use cnae_codigo para o código CNAE oficial do IBGE
*/
