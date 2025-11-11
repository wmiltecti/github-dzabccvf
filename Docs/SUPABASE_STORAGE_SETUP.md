# Configuração do Supabase Storage para Upload de Documentos

## ⚠️ IMPORTANTE: Executar ANTES de rodar o teste de Documentação

## Opção 1: Via Interface Web (RECOMENDADO)

### 1. Acessar Storage no Supabase
1. Abra o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. No menu lateral, clique em **Storage**

### 2. Criar Bucket "documents"
1. Clique no botão **"New bucket"**
2. Preencha:
   - **Name**: `documents`
   - **Public bucket**: ✅ **MARCAR** (importante!)
   - **Allowed MIME types**: deixar em branco (aceitar todos)
   - **File size limit**: deixar padrão
3. Clique em **"Create bucket"**

### 3. Configurar Políticas de Acesso

#### A. Política de Visualização Pública
1. Clique no bucket **documents**
2. Vá na aba **"Policies"**
3. Clique em **"New policy"**
4. Selecione **"For full customization"**
5. Configure:
   - **Policy name**: `Public Access`
   - **Allowed operation**: `SELECT`
   - **Target roles**: `public` (ou deixe vazio)
   - **WITH CHECK expression**: `bucket_id = 'documents'`
6. Clique em **"Review"** e depois **"Save policy"**

#### B. Política de Upload para Autenticados
1. Clique em **"New policy"** novamente
2. Configure:
   - **Policy name**: `Authenticated users can upload`
   - **Allowed operation**: `INSERT`
   - **Target roles**: `authenticated`
   - **WITH CHECK expression**: `bucket_id = 'documents'`
3. Salve

#### C. Política de Atualização
1. Nova política:
   - **Policy name**: `Authenticated users can update`
   - **Allowed operation**: `UPDATE`
   - **Target roles**: `authenticated`
   - **USING expression**: `bucket_id = 'documents'`
   - **WITH CHECK expression**: `bucket_id = 'documents'`

#### D. Política de Exclusão
1. Nova política:
   - **Policy name**: `Authenticated users can delete`
   - **Allowed operation**: `DELETE`
   - **Target roles**: `authenticated`
   - **USING expression**: `bucket_id = 'documents'`

---

## Opção 2: Via SQL (Avançado)

Execute o script: `Docs/database/create_storage_bucket_documents.sql`

```sql
-- Ver script completo em:
-- Docs/database/create_storage_bucket_documents.sql
```

---

## Verificação

### 1. Confirmar Bucket Criado
No Storage do Supabase, você deve ver o bucket **documents** listado.

### 2. Testar Upload Manual
1. Clique no bucket **documents**
2. Clique em **"Upload file"**
3. Selecione qualquer arquivo
4. Se upload funcionar = configuração OK ✅

### 3. Verificar URL Pública
Após upload, clique no arquivo e veja se consegue copiar a URL pública.

---

## Estrutura de Pastas

Os arquivos serão organizados assim:
```
documents/
  └── templates/
      ├── 1731358620000-requerimento.docx
      ├── 1731358625000-modelo_art.pdf
      └── ...
```

---

## Troubleshooting

### Erro: "new row violates row-level security policy"
**Solução**: Certifique-se que:
- O bucket está marcado como **Public**
- As políticas foram criadas corretamente
- Usuário está autenticado

### Erro: "The resource already exists"
**Solução**: Bucket já existe! Apenas configure as políticas.

### Upload não funciona no teste
**Solução**: 
1. Verifique se o bucket está criado
2. Execute o teste novamente
3. Verifique os logs do navegador (F12)

---

## Após Configurar

Execute o teste de documentação:
```bash
python tests\test_documentation_selenium.py
```

O teste deve:
- ✅ Preencher todos os campos
- ✅ Fazer upload do arquivo `test_document.txt`
- ✅ Salvar o documento com sucesso
- ✅ Encontrar o item na lista

---

## Referências

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage Security](https://supabase.com/docs/guides/storage/security/access-control)
