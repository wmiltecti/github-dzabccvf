# 🔒 Solução do Erro: Row Level Security (RLS) - activity_license_type_documents

## 📋 Problema Identificado

**Erro:** `new row violates row-level security policy for table "activity_license_type_documents"`

**Código:** `42501`

**Significado:** As políticas de segurança (RLS) da tabela estão **bloqueando** a inserção de dados.

---

## 🔍 O Que É RLS?

**Row Level Security (RLS)** é um recurso do PostgreSQL/Supabase que controla:
- Quem pode **ler** dados
- Quem pode **inserir** dados
- Quem pode **atualizar** dados
- Quem pode **deletar** dados

No seu caso, a política atual está **muito restritiva** e não permite que usuários autenticados insiram dados.

---

## ✅ Solução

Execute o script de correção que remove as políticas antigas e cria novas políticas corretas.

### Passo 1: Acessar o Supabase

1. Acesse seu projeto no Supabase Dashboard
2. Vá em **SQL Editor**

### Passo 2: Executar o Script de Correção

1. Abra o arquivo: `SCRIPT_SQL_CORRIGIR_RLS_ACTIVITY_LICENSE_TYPE_DOCUMENTS.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** ou pressione `Ctrl+Enter`

### Passo 3: Verificar

O script mostrará:
- ✅ Políticas antigas removidas
- ✅ Novas políticas criadas (5 políticas)
- ✅ Permissões configuradas

### Passo 4: Testar

1. Vá no menu "Atividades"
2. Clique em "Nova Atividade" ou edite uma existente
3. Adicione tipos de licença e documentos
4. Clique em **Salvar**
5. O erro **NÃO** deve mais aparecer! ✨

---

## 🔧 O Que o Script Faz?

### 1. Remove Políticas Antigas
```sql
DROP POLICY IF EXISTS "activity_license_type_documents_insert_auth" ...
```
Remove todas as políticas antigas que podem estar causando o problema.

### 2. Cria Políticas Corretas
```sql
CREATE POLICY "activity_license_type_documents_insert_auth"
ON activity_license_type_documents
FOR INSERT
TO authenticated
WITH CHECK (true);  ← PERMITE TUDO para usuários autenticados
```

### 3. Configura Permissões
```sql
GRANT INSERT, UPDATE, DELETE ON activity_license_type_documents TO authenticated;
```

---

## 📊 Políticas Criadas

Após executar o script, você terá **5 políticas**:

| Política | Ação | Função | Restrição |
|----------|------|--------|-----------|
| select_anon | SELECT | anon | Nenhuma (true) |
| select_auth | SELECT | authenticated | Nenhuma (true) |
| insert_auth | INSERT | authenticated | Nenhuma (true) |
| update_auth | UPDATE | authenticated | Nenhuma (true) |
| delete_auth | DELETE | authenticated | Nenhuma (true) |

**Significado:** Usuários autenticados podem fazer **qualquer operação** na tabela.

---

## 🆘 Se o Erro Persistir

### Opção 1: Verificar Autenticação

O erro pode ocorrer se você **não está autenticado**. Verifique:

```sql
-- Execute no Supabase SQL Editor:
SELECT auth.uid();
```

- Se retornar `NULL` → Você não está autenticado
- Se retornar um UUID → Você está autenticado ✓

### Opção 2: Verificar Token no Frontend

No console do navegador:
```javascript
// Verificar se há token
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
```

### Opção 3: Forçar Reload do Schema

```sql
NOTIFY pgrst, 'reload schema';
```

### Opção 4: Desabilitar RLS Temporariamente

⚠️ **APENAS PARA TESTE - NÃO RECOMENDADO PARA PRODUÇÃO**

```sql
ALTER TABLE activity_license_type_documents DISABLE ROW LEVEL SECURITY;
```

Se funcionar após desabilitar o RLS, significa que o problema está nas políticas.

Para reabilitar:
```sql
ALTER TABLE activity_license_type_documents ENABLE ROW LEVEL SECURITY;
```

---

## 🔍 Diagnóstico Avançado

### Verificar Políticas Ativas

```sql
SELECT
  policyname,
  cmd,
  roles,
  qual as usando,
  with_check
FROM pg_policies
WHERE tablename = 'activity_license_type_documents';
```

**Resultado esperado:** 5 políticas listadas

### Verificar Permissões

```sql
SELECT
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'activity_license_type_documents';
```

**Resultado esperado:**
- anon: SELECT
- authenticated: SELECT, INSERT, UPDATE, DELETE
- postgres: ALL

### Testar Inserção Manual

```sql
-- Substitua os UUIDs pelos IDs reais do seu banco
INSERT INTO activity_license_type_documents (
  activity_id,
  license_type_id,
  template_id,
  is_required
)
VALUES (
  'uuid-atividade',
  'uuid-tipo-licenca',
  'uuid-template',
  true
);
```

Se funcionar → Problema resolvido!
Se não funcionar → Problema de autenticação ou permissões

---

## 🎯 Checklist de Verificação

Após executar o script:

- [ ] 5 políticas RLS criadas
- [ ] Permissões configuradas (anon, authenticated)
- [ ] RLS está habilitado
- [ ] Teste de inserção manual funciona
- [ ] Cadastro de atividade funciona no frontend
- [ ] Documentos são salvos corretamente

---

## 📞 Suporte Adicional

### Arquivos Relacionados

- **Script de Correção:** `SCRIPT_SQL_CORRIGIR_RLS_ACTIVITY_LICENSE_TYPE_DOCUMENTS.sql`
- **Script Original:** `SCRIPT_SQL_ACTIVITY_LICENSE_TYPE_DOCUMENTS.sql`
- **Código Frontend:** `src/components/admin/ActivityForm.tsx`

### Logs Úteis

No console do navegador, procure por:
```
Supabase request failed
status: 401 ou 403
message: "row-level security"
```

### Comandos Úteis

```sql
-- Ver todas as tabelas com RLS
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;

-- Ver políticas de todas as tabelas
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
```

---

## ✨ Resumo

1. **Problema:** Políticas RLS muito restritivas
2. **Solução:** Executar script de correção
3. **Tempo:** 2-5 minutos
4. **Resultado:** Cadastro de atividades funcionando perfeitamente! ✓

---

## 🎓 Entendendo o Erro

**Por que aconteceu?**

Provavelmente a tabela foi criada com políticas padrão muito restritivas, ou:
- O script original não foi executado completamente
- Houve conflito com políticas existentes
- As permissões não foram aplicadas corretamente

**Como evitar no futuro?**

Sempre execute os scripts SQL **completos** e verifique as queries de validação ao final.

---

## ⏱️ Tempo de Resolução

**2-5 minutos** - Execute o script e teste!
