# Alterações - Tipos de Licença Aplicáveis e Documentos Exigidos

## Data: 2025-11-19

## Resumo

Modificada a estrutura do formulário de cadastro/edição de Atividades no menu "Atividades". A seção "Tipos de Licença Aplicáveis" e "Documentos Exigidos" foram reestruturadas conforme solicitado.

---

## Mudanças Implementadas

### 1. Nova Estrutura da Interface

**ANTES:**
- Tipos de Licença Aplicáveis (checkboxes simples)
- Documentos Exigidos (lista separada com checkboxes)

**DEPOIS:**
- **Tipos de Licença Aplicáveis**
  - Cada bloco trata um Tipo de Licença cadastrada
  - Para cada Tipo de Licença, é possível adicionar múltiplos documentos
  - Cada documento pode ser marcado como obrigatório ou opcional

### 2. Componente Form Repeater

Criado novo componente `LicenseTypeDocumentsSection.tsx` que implementa:
- Adição/remoção de tipos de licença (blocos)
- Para cada tipo de licença:
  - Seleção do tipo de licença
  - Adição/remoção de documentos exigidos
  - Checkbox para marcar documento como obrigatório
  - Validação para evitar duplicação

### 3. Modificações no Banco de Dados

#### Nova Tabela: `activity_license_type_documents`

Esta tabela substitui a estrutura anterior e permite associar documentos específicos a cada tipo de licença dentro de uma atividade.

**Estrutura:**
```sql
CREATE TABLE activity_license_type_documents (
  id UUID PRIMARY KEY,
  activity_id UUID REFERENCES activities(id),
  license_type_id UUID REFERENCES license_types(id),
  template_id UUID REFERENCES documentation_templates(id),
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(activity_id, license_type_id, template_id)
);
```

**Relacionamentos:**
- `activity_id` → Atividade
- `license_type_id` → Tipo de Licença
- `template_id` → Template de Documentação
- `is_required` → Se o documento é obrigatório

---

## Arquivos Modificados

### Frontend

1. **`src/components/admin/ActivityForm.tsx`**
   - Alterado modelo de dados de `license_types[]` e `documents[]` para `license_type_blocks[]`
   - Removidas funções antigas de toggle
   - Implementada nova lógica de salvamento
   - Integrado novo componente `LicenseTypeDocumentsSection`

2. **`src/components/admin/LicenseTypeDocumentsSection.tsx`** (NOVO)
   - Componente form repeater para gerenciar tipos de licença e documentos
   - Validações para evitar duplicação
   - Interface responsiva e intuitiva

### Database

3. **`SCRIPT_SQL_ACTIVITY_LICENSE_TYPE_DOCUMENTS.sql`** (NOVO)
   - Script completo para criar a nova tabela
   - Índices para otimização de consultas
   - Políticas RLS para segurança
   - Triggers para atualização automática de timestamps
   - Comentários sobre migração de dados (opcional)

---

## Como Executar o Script SQL

### Passo 1: Conectar ao Banco de Dados

Use o Supabase Dashboard ou seu cliente PostgreSQL preferido.

### Passo 2: Executar o Script

```bash
# Via psql
psql -h seu_host -U seu_usuario -d seu_banco -f SCRIPT_SQL_ACTIVITY_LICENSE_TYPE_DOCUMENTS.sql

# Ou copie e cole o conteúdo do arquivo no SQL Editor do Supabase
```

### Passo 3: Verificar

O script inclui queries de verificação ao final:
- Verifica se a tabela foi criada
- Lista os índices criados
- Lista as políticas RLS aplicadas

---

## Migração de Dados (Opcional)

Se você já possui dados nas tabelas antigas (`activity_documents`), o script inclui uma seção comentada para migração automática. Para usar:

1. Abra o arquivo `SCRIPT_SQL_ACTIVITY_LICENSE_TYPE_DOCUMENTS.sql`
2. Localize a seção "MIGRAÇÃO DE DADOS (OPCIONAL)"
3. Descomente o bloco `INSERT INTO activity_license_type_documents...`
4. Execute o script

**⚠️ ATENÇÃO:** A migração criará uma entrada para cada combinação de documento × tipo de licença. Revise os dados migrados para garantir que está correto.

---

## Estrutura de Dados

### Modelo Anterior
```typescript
{
  license_types: [
    { license_type_id: "uuid", is_required: true }
  ],
  documents: [
    { template_id: "uuid", is_required: true }
  ]
}
```

### Modelo Novo
```typescript
{
  license_type_blocks: [
    {
      license_type_id: "uuid",
      documents: [
        { template_id: "uuid", is_required: true },
        { template_id: "uuid", is_required: false }
      ]
    }
  ]
}
```

---

## Validações Implementadas

1. Deve haver pelo menos um tipo de licença
2. Cada bloco deve ter um tipo de licença selecionado
3. Não é permitido duplicar tipos de licença
4. Dentro de um mesmo tipo de licença, não é permitido duplicar documentos
5. Todos os campos obrigatórios devem ser preenchidos

---

## Compatibilidade

- ✅ **Build:** Projeto compila sem erros
- ✅ **TypeScript:** Sem erros de tipo
- ⚠️ **Banco de Dados:** Requer execução do script SQL antes de usar

---

## Próximos Passos

1. Execute o script SQL no banco de dados
2. Teste o cadastro/edição de atividades
3. Verifique se os dados são salvos corretamente
4. Considere migrar dados antigos (se necessário)

---

## Suporte

Em caso de dúvidas ou problemas:
1. Verifique se o script SQL foi executado corretamente
2. Confirme que as políticas RLS estão ativas
3. Revise os logs do console do navegador para erros
4. Verifique as permissões do usuário no Supabase
