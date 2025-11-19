# 🔧 Solução do Erro: Tabela activity_enterprise_size_ranges não encontrada

## 📋 Problema Identificado

**Erro:** `Could not find the table 'public.activity_enterprise_size_ranges' in the schema cache`

**Causa:** A tabela `activity_enterprise_size_ranges` não existe no banco de dados Supabase.

**Local do Erro:** Menu "Atividades" → Ao tentar cadastrar ou editar uma atividade

---

## ✅ Solução

Execute o script SQL fornecido para criar a tabela necessária.

### Passo 1: Acessar o Supabase

1. Acesse seu projeto no Supabase Dashboard
2. Vá em **SQL Editor** (ou **Database** → **SQL Editor**)

### Passo 2: Executar o Script

1. Abra o arquivo: `SCRIPT_SQL_CRIAR_ACTIVITY_ENTERPRISE_SIZE_RANGES.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** ou pressione `Ctrl+Enter`

### Passo 3: Verificar

Após executar o script, você verá várias tabelas de resultado mostrando:
- ✅ Tabela criada
- ✅ Índices criados
- ✅ Políticas RLS ativas
- ✅ Triggers configurados

---

## 🗄️ O que esta Tabela Faz?

A tabela `activity_enterprise_size_ranges` armazena as **configurações de porte e faixas** para cada atividade.

### Exemplo:

**Atividade:** Mineração de Areia
- **Porte Pequeno:** 0 a 1.000 m³/mês
- **Porte Médio:** 1.001 a 5.000 m³/mês
- **Porte Grande:** acima de 5.001 m³/mês

Cada linha da tabela representa uma dessas faixas.

---

## 📊 Estrutura da Tabela

```sql
activity_enterprise_size_ranges
├─ id (UUID)
├─ activity_id (UUID) → Referência para activities
├─ enterprise_size_id (UUID) → Referência para enterprise_sizes
├─ range_name (VARCHAR) → Ex: "Porte 1", "Porte 2"
├─ range_start (DECIMAL) → Início da faixa
├─ range_end (DECIMAL) → Fim da faixa
├─ created_at (TIMESTAMPTZ)
└─ updated_at (TIMESTAMPTZ)
```

---

## ⚠️ Observação Importante

Se você viu a mensagem no erro:

> "Perhaps you meant the table 'public.activity_enterprise_ranges'"

Significa que pode existir uma tabela antiga com nome **sem o "_size"**. O script possui uma seção comentada para migração de dados caso necessário.

---

## 🧪 Testando Após a Correção

1. ✅ Execute o script SQL
2. ✅ Acesse o menu "Atividades"
3. ✅ Clique em "Nova Atividade" ou edite uma existente
4. ✅ Preencha os dados e clique em "Salvar"
5. ✅ O erro não deve mais aparecer

---

## 📝 Checklist de Verificação

Após executar o script, verifique:

- [ ] Tabela `activity_enterprise_size_ranges` foi criada
- [ ] Políticas RLS estão ativas (5 políticas)
- [ ] Índices foram criados (2 índices)
- [ ] Trigger de updated_at foi criado
- [ ] Cadastro de atividade funciona sem erro
- [ ] Dados são salvos corretamente

---

## 🆘 Se o Erro Persistir

1. **Limpe o cache do PostgREST:**
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```

2. **Verifique permissões:**
   ```sql
   -- Deve retornar TRUE
   SELECT has_table_privilege('anon', 'activity_enterprise_size_ranges', 'SELECT');
   SELECT has_table_privilege('authenticated', 'activity_enterprise_size_ranges', 'SELECT');
   ```

3. **Confirme que a tabela existe:**
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name LIKE '%activity_enterprise%';
   ```

4. **Verifique o RLS:**
   ```sql
   SELECT relname, relrowsecurity
   FROM pg_class
   WHERE relname = 'activity_enterprise_size_ranges';
   -- relrowsecurity deve ser TRUE
   ```

---

## 🔗 Arquivos Relacionados

- **Script SQL:** `SCRIPT_SQL_CRIAR_ACTIVITY_ENTERPRISE_SIZE_RANGES.sql`
- **Código Frontend:** `src/components/admin/ActivityForm.tsx`
- **Documentação Original:** `Docs/database/create_activity_enterprise_size_ranges_table.sql`

---

## 📞 Suporte Adicional

Se após executar o script o erro persistir:

1. Verifique se todas as queries de verificação retornaram resultados
2. Confirme que não há erros de sintaxe no SQL
3. Reinicie a aplicação frontend
4. Limpe o cache do navegador
5. Verifique os logs do Supabase

---

## ✨ Conclusão

Este erro é **facilmente resolvido** executando o script SQL. A tabela é essencial para o funcionamento do cadastro de atividades e deve existir no banco de dados.

**Tempo estimado de correção:** 2-5 minutos
