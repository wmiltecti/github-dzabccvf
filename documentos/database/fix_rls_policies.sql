-- FIX: Row Level Security Policies para tabelas administrativas
-- Problema: Usuários autenticados não conseguem inserir/atualizar dados nas tabelas admin
-- Solução: Criar políticas RLS que permitam operações CRUD para usuários autenticados

-- ============================================================================
-- PRIMEIRO: Verificar quais tabelas existem
-- ============================================================================

SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('property_types', 'activity_types', 'solid_waste_types', 
                           'fuel_types', 'energy_source_types', 'water_source_types')
        THEN '✅ Existe'
        ELSE '❌ Não existe'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN (
        'property_types',
        'activity_types', 
        'solid_waste_types',
        'fuel_types',
        'energy_source_types',
        'water_source_types'
    )
ORDER BY table_name;

-- ============================================================================
-- PROPERTY TYPES (Tipos de Imóvel)
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'property_types') THEN
        -- Remover políticas antigas se existirem
        DROP POLICY IF EXISTS "Enable read for authenticated users" ON property_types;
        DROP POLICY IF EXISTS "Enable insert for authenticated users" ON property_types;
        DROP POLICY IF EXISTS "Enable update for authenticated users" ON property_types;
        DROP POLICY IF EXISTS "Enable delete for authenticated users" ON property_types;

        -- Criar novas políticas
        CREATE POLICY "Enable read for authenticated users" 
        ON property_types FOR SELECT 
        TO authenticated 
        USING (true);

        CREATE POLICY "Enable insert for authenticated users" 
        ON property_types FOR INSERT 
        TO authenticated 
        WITH CHECK (true);

        CREATE POLICY "Enable update for authenticated users" 
        ON property_types FOR UPDATE 
        TO authenticated 
        USING (true) 
        WITH CHECK (true);

        CREATE POLICY "Enable delete for authenticated users" 
        ON property_types FOR DELETE 
        TO authenticated 
        USING (true);
        
        RAISE NOTICE '✅ Políticas criadas para property_types';
    ELSE
        RAISE NOTICE '⚠️ Tabela property_types não existe - pulando';
    END IF;
END $$;

-- ============================================================================
-- ACTIVITY TYPES (Tipos de Atividade)
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'activity_types') THEN
        DROP POLICY IF EXISTS "Enable read for authenticated users" ON activity_types;
        DROP POLICY IF EXISTS "Enable insert for authenticated users" ON activity_types;
        DROP POLICY IF EXISTS "Enable update for authenticated users" ON activity_types;
        DROP POLICY IF EXISTS "Enable delete for authenticated users" ON activity_types;

        CREATE POLICY "Enable read for authenticated users" 
        ON activity_types FOR SELECT 
        TO authenticated 
        USING (true);

        CREATE POLICY "Enable insert for authenticated users" 
        ON activity_types FOR INSERT 
        TO authenticated 
        WITH CHECK (true);

        CREATE POLICY "Enable update for authenticated users" 
        ON activity_types FOR UPDATE 
        TO authenticated 
        USING (true) 
        WITH CHECK (true);

        CREATE POLICY "Enable delete for authenticated users" 
        ON activity_types FOR DELETE 
        TO authenticated 
        USING (true);
        
        RAISE NOTICE '✅ Políticas criadas para activity_types';
    ELSE
        RAISE NOTICE '⚠️ Tabela activity_types não existe - pulando';
    END IF;
END $$;

-- ============================================================================
-- SOLID_WASTE_TYPES (Tipos de Resíduos Sólidos)
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'solid_waste_types') THEN
        DROP POLICY IF EXISTS "Enable read for authenticated users" ON solid_waste_types;
        DROP POLICY IF EXISTS "Enable insert for authenticated users" ON solid_waste_types;
        DROP POLICY IF EXISTS "Enable update for authenticated users" ON solid_waste_types;
        DROP POLICY IF EXISTS "Enable delete for authenticated users" ON solid_waste_types;

        CREATE POLICY "Enable read for authenticated users" 
        ON solid_waste_types FOR SELECT 
        TO authenticated 
        USING (true);

        CREATE POLICY "Enable insert for authenticated users" 
        ON solid_waste_types FOR INSERT 
        TO authenticated 
        WITH CHECK (true);

        CREATE POLICY "Enable update for authenticated users" 
        ON solid_waste_types FOR UPDATE 
        TO authenticated 
        USING (true) 
        WITH CHECK (true);

        CREATE POLICY "Enable delete for authenticated users" 
        ON solid_waste_types FOR DELETE 
        TO authenticated 
        USING (true);
        
        RAISE NOTICE '✅ Políticas criadas para solid_waste_types';
    ELSE
        RAISE NOTICE '⚠️ Tabela solid_waste_types não existe - pulando';
    END IF;
END $$;

-- ============================================================================
-- FUEL_TYPES (Tipos de Combustível)
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fuel_types') THEN
        DROP POLICY IF EXISTS "Enable read for authenticated users" ON fuel_types;
        DROP POLICY IF EXISTS "Enable insert for authenticated users" ON fuel_types;
        DROP POLICY IF EXISTS "Enable update for authenticated users" ON fuel_types;
        DROP POLICY IF EXISTS "Enable delete for authenticated users" ON fuel_types;

        CREATE POLICY "Enable read for authenticated users" 
        ON fuel_types FOR SELECT 
        TO authenticated 
        USING (true);

        CREATE POLICY "Enable insert for authenticated users" 
        ON fuel_types FOR INSERT 
        TO authenticated 
        WITH CHECK (true);

        CREATE POLICY "Enable update for authenticated users" 
        ON fuel_types FOR UPDATE 
        TO authenticated 
        USING (true) 
        WITH CHECK (true);

        CREATE POLICY "Enable delete for authenticated users" 
        ON fuel_types FOR DELETE 
        TO authenticated 
        USING (true);
        
        RAISE NOTICE '✅ Políticas criadas para fuel_types';
    ELSE
        RAISE NOTICE '⚠️ Tabela fuel_types não existe - pulando';
    END IF;
END $$;

-- ============================================================================
-- ENERGY_SOURCE_TYPES (Tipos de Fonte de Energia)
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'energy_source_types') THEN
        DROP POLICY IF EXISTS "Enable read for authenticated users" ON energy_source_types;
        DROP POLICY IF EXISTS "Enable insert for authenticated users" ON energy_source_types;
        DROP POLICY IF EXISTS "Enable update for authenticated users" ON energy_source_types;
        DROP POLICY IF EXISTS "Enable delete for authenticated users" ON energy_source_types;

        CREATE POLICY "Enable read for authenticated users" 
        ON energy_source_types FOR SELECT 
        TO authenticated 
        USING (true);

        CREATE POLICY "Enable insert for authenticated users" 
        ON energy_source_types FOR INSERT 
        TO authenticated 
        WITH CHECK (true);

        CREATE POLICY "Enable update for authenticated users" 
        ON energy_source_types FOR UPDATE 
        TO authenticated 
        USING (true) 
        WITH CHECK (true);

        CREATE POLICY "Enable delete for authenticated users" 
        ON energy_source_types FOR DELETE 
        TO authenticated 
        USING (true);
        
        RAISE NOTICE '✅ Políticas criadas para energy_source_types';
    ELSE
        RAISE NOTICE '⚠️ Tabela energy_source_types não existe - pulando';
    END IF;
END $$;

-- ============================================================================
-- WATER_SOURCE_TYPES (Tipos de Fonte de Água)
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'water_source_types') THEN
        DROP POLICY IF EXISTS "Enable read for authenticated users" ON water_source_types;
        DROP POLICY IF EXISTS "Enable insert for authenticated users" ON water_source_types;
        DROP POLICY IF EXISTS "Enable update for authenticated users" ON water_source_types;
        DROP POLICY IF EXISTS "Enable delete for authenticated users" ON water_source_types;

        CREATE POLICY "Enable read for authenticated users" 
        ON water_source_types FOR SELECT 
        TO authenticated 
        USING (true);

        CREATE POLICY "Enable insert for authenticated users" 
        ON water_source_types FOR INSERT 
        TO authenticated 
        WITH CHECK (true);

        CREATE POLICY "Enable update for authenticated users" 
        ON water_source_types FOR UPDATE 
        TO authenticated 
        USING (true) 
        WITH CHECK (true);

        CREATE POLICY "Enable delete for authenticated users" 
        ON water_source_types FOR DELETE 
        TO authenticated 
        USING (true);
        
        RAISE NOTICE '✅ Políticas criadas para water_source_types';
    ELSE
        RAISE NOTICE '⚠️ Tabela water_source_types não existe - pulando';
    END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verificar se as políticas foram criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN (
    'property_types',
    'activity_types', 
    'solid_waste_types',
    'fuel_types',
    'energy_source_types',
    'water_source_types'
)
ORDER BY tablename, policyname;

-- INSTRUÇÕES:
-- 1. Abra o Supabase Dashboard
-- 2. Vá em SQL Editor
-- 3. Cole este script completo
-- 4. Execute
-- 5. Verifique a query de VERIFICATION ao final para confirmar
-- 6. Teste novamente o cadastro de Tipos de Imóvel
