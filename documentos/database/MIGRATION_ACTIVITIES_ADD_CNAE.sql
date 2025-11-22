-- =====================================================
-- ADICIONAR CAMPOS CNAE À TABELA ACTIVITIES
-- =====================================================
-- Data: 22/11/2025
-- Objetivo: Adicionar campos para código CNAE oficial
--
-- ESTRATÉGIA DE MIGRAÇÃO:
-- 1. Criar campos CNAE (cnae_codigo, cnae_descricao)
-- 2. Migrar valores atuais do campo 'code' para 'cnae_codigo'
-- 3. Converter 'code' para INTEGER (agora pode truncar)
--
-- CONTEXTO:
-- - Campo 'code' atual contém valores que podem ser CNAEs
-- - CNAE é a classificação oficial do IBGE
-- - Formato CNAE: XXXX-X/XX (ex: 1011-2/01)
-- - Tabela dados_gerais já possui cnae_codigo/cnae_descricao
-- =====================================================

-- 1️⃣ CRIAR campos CNAE (antes de qualquer conversão)
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS cnae_codigo VARCHAR(10),
ADD COLUMN IF NOT EXISTS cnae_descricao TEXT;

-- Comentários explicativos
COMMENT ON COLUMN activities.cnae_codigo IS 'Código CNAE oficial do IBGE (formato: XXXX-X/XX ou valor original do campo code)';
COMMENT ON COLUMN activities.cnae_descricao IS 'Descrição da atividade econômica segundo CNAE';

-- 2️⃣ MIGRAR dados atuais do campo 'code' para 'cnae_codigo'
--    Preserva TODOS os valores (incluindo decimais como 16.2, 9.3, etc.)
UPDATE activities
SET cnae_codigo = code::TEXT
WHERE cnae_codigo IS NULL;

-- Copiar o nome da atividade para cnae_descricao como valor inicial
UPDATE activities
SET cnae_descricao = name
WHERE cnae_descricao IS NULL;

-- 3️⃣ AGORA converter o campo 'code' para INTEGER
--    Pode truncar sem perda de dados (valores originais estão em cnae_codigo)
ALTER TABLE activities 
ALTER COLUMN code TYPE INTEGER USING code::INTEGER;

-- Adicionar constraint para garantir valores positivos
ALTER TABLE activities
ADD CONSTRAINT activities_code_positive CHECK (code > 0);

COMMENT ON COLUMN activities.code IS 'Código interno da atividade (ID numérico sequencial - valores decimais migrados para cnae_codigo)';

-- 4️⃣ Criar índice para busca rápida por CNAE
CREATE INDEX IF NOT EXISTS idx_activities_cnae_codigo ON activities(cnae_codigo)
WHERE cnae_codigo IS NOT NULL;

-- 5️⃣ Adicionar exemplos de CNAE (opcional)
-- Descomentar para popular com dados de exemplo

/*
-- Exemplos de atividades com CNAE correspondente:
UPDATE activities 
SET cnae_codigo = '0111-3/01',
    cnae_descricao = 'Cultivo de cereais'
WHERE name ILIKE '%agricultura%' OR name ILIKE '%cereais%';

UPDATE activities 
SET cnae_codigo = '1011-2/01',
    cnae_descricao = 'Frigorífico - abate de bovinos'
WHERE name ILIKE '%frigorífico%' OR name ILIKE '%abate%';

UPDATE activities 
SET cnae_codigo = '0210-1/08',
    cnae_descricao = 'Extração de madeira em florestas plantadas'
WHERE name ILIKE '%silvicultura%' OR name ILIKE '%florestal%';

UPDATE activities 
SET cnae_codigo = '0155-5/03',
    cnae_descricao = 'Criação de bovinos para corte'
WHERE name ILIKE '%pecuária%' OR name ILIKE '%bovinos%';

UPDATE activities 
SET cnae_codigo = '0810-0/05',
    cnae_descricao = 'Extração de petróleo e gás natural'
WHERE name ILIKE '%petróleo%' OR name ILIKE '%gás natural%';
*/

-- =====================================================
-- VERIFICAÇÃO APÓS EXECUÇÃO
-- =====================================================

-- Verificar estrutura atualizada
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'activities'
AND column_name IN ('code', 'cnae_codigo', 'cnae_descricao')
ORDER BY ordinal_position;

-- Verificar migração dos dados (mostrar código original preservado)
SELECT 
    id,
    code AS code_integer,
    cnae_codigo AS code_original,
    name,
    cnae_descricao,
    is_active,
    CASE 
        WHEN cnae_codigo::NUMERIC = code THEN '✅ Sem alteração'
        ELSE '⚠️ Decimal preservado em CNAE'
    END AS status_migracao
FROM activities
ORDER BY code
LIMIT 20;

-- Verificar registros que tiveram decimais preservados
SELECT 
    code AS code_atual_integer,
    cnae_codigo AS code_original_preservado,
    name,
    (cnae_codigo::NUMERIC - code) AS diferenca_preservada
FROM activities
WHERE cnae_codigo::NUMERIC != code
ORDER BY name;

-- =====================================================
-- PRÓXIMOS PASSOS
-- =====================================================
/*
1. ✅ Executar este script no Supabase SQL Editor

2. 📝 Atualizar backend (schemas):
   - Adicionar campos cnae_codigo e cnae_descricao em ActivityResponse
   - Tornar campos opcionais (Optional[str])

3. 🎨 Atualizar frontend:
   - Adicionar campos CNAE no formulário de cadastro
   - Implementar busca/autocomplete de CNAEs
   - Validar formato CNAE (XXXX-X/XX)

4. 📊 Popular dados CNAE:
   - Importar lista oficial de CNAEs do IBGE
   - Vincular atividades existentes com CNAEs correspondentes
   - Criar endpoint para buscar CNAEs

5. 🔄 Integração:
   - Sincronizar com dados_gerais.cnae_codigo
   - Permitir filtrar atividades por CNAE
   - Gerar relatórios por código CNAE
*/
