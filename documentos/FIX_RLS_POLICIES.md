# FIX: Row Level Security Policies - Problema de Permissões

## 🐛 Problema Identificado

**Erro:** "new row violates row-level security policy for table property_types"

**Causa:** As tabelas administrativas têm RLS (Row Level Security) ativado, mas não possuem políticas que permitam usuários autenticados fazerem INSERT/UPDATE/DELETE.

**Impacto:** Nenhum dado é salvo nas telas de administração (Tipos de Imóvel, Tipos de Atividade, etc.)

## 🔍 Como foi identificado

Teste automatizado Selenium detectou o problema:
```
📬 Toast exibido: Erro ao salvar item: new row violates row-level security policy for table "property_types"
```

Console do navegador mostrou:
```
SEVERE: https://jnhvlqytvssrbwjpolyq.supabase.co/rest/v1/property_types?select=* - Failed to load resource: the server responded with a status of 401
SEVERE: GenericForm.tsx 106:18 "❌ Insert error:" Object
```

## ✅ Solução

### Passo 1: Executar SQL no Supabase

1. Abra o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)
4. Clique em **New Query**
5. Cole o conteúdo do arquivo `database/fix_rls_policies.sql`
6. Clique em **Run** (ou Ctrl+Enter)

### Passo 2: Verificar Políticas Criadas

No final do script há uma query de verificação que mostra todas as políticas:

```sql
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
```

**Resultado esperado:** 4 políticas para cada tabela (SELECT, INSERT, UPDATE, DELETE)

### Passo 3: Testar Novamente

Após executar o SQL:

1. Volte para a aplicação (http://localhost:5173)
2. Faça login com CPF: `61404694579`, senha: `Senh@01!`
3. Vá em **Administração** → **Tipos de Imóvel**
4. Clique em **Novo**
5. Preencha os campos:
   - Nome: `Casa`
   - Descrição: `Residência unifamiliar`
6. Clique em **Salvar**
7. ✅ Deve aparecer toast verde: "Item criado com sucesso"

## 📋 Tabelas Afetadas

O script cria políticas RLS para estas 6 tabelas:

- ✅ `property_types` (Tipos de Imóvel)
- ✅ `activity_types` (Tipos de Atividade)
- ✅ `solid_waste_types` (Tipos de Resíduos Sólidos)
- ✅ `fuel_types` (Tipos de Combustível)
- ✅ `energy_source_types` (Tipos de Fonte de Energia)
- ✅ `water_source_types` (Tipos de Fonte de Água)

## 🔐 Políticas Criadas

Para cada tabela, 4 políticas são criadas:

1. **SELECT** - Permite leitura para usuários autenticados
2. **INSERT** - Permite inserção para usuários autenticados
3. **UPDATE** - Permite atualização para usuários autenticados
4. **DELETE** - Permite exclusão para usuários autenticados

**Regra:** `TO authenticated` + `USING (true)` + `WITH CHECK (true)`

Isso significa: qualquer usuário autenticado pode fazer qualquer operação nessas tabelas.

## 🧪 Teste Automatizado

Após aplicar o fix, execute o teste Selenium novamente:

```powershell
python tests\test_property_types_selenium.py
```

**Resultado esperado:**
```
✅ Item criado com sucesso
✅ Item 'Tipo Teste XXXXX' encontrado na lista
✅ TESTE PASSOU! Item foi salvo e aparece na lista
```

## 📝 Notas

- Este fix assume que **todos** os usuários autenticados podem gerenciar os dados administrativos
- Se você precisar de controle mais granular (ex: apenas admins podem editar), será necessário:
  1. Adicionar coluna `role` na tabela `users`
  2. Modificar as políticas para verificar `auth.uid() IN (SELECT id FROM users WHERE role = 'admin')`
  
## 🔗 Referências

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Policies](https://www.postgresql.org/docs/current/sql-createpolicy.html)
