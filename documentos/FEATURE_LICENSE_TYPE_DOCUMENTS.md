# Form Repeater de Documentação para Tipos de Licença

## Visão Geral

Esta funcionalidade permite aos administradores configurar quais documentos são necessários para cada tipo de licença ambiental através de um form repeater intuitivo.

## Componentes Criados

### 1. Tabela de Banco de Dados: `license_type_documents`

Tabela de relacionamento entre tipos de licença e templates de documentação.

**Estrutura:**
- `id` (UUID) - Chave primária
- `license_type_id` (UUID) - Referência ao tipo de licença
- `documentation_template_id` (UUID) - Referência ao template de documento
- `is_required` (Boolean) - Indica se o documento é obrigatório
- `created_at` / `updated_at` (Timestamp) - Datas de criação e atualização

**Características:**
- Constraint UNIQUE para evitar duplicatas
- ON DELETE CASCADE para manter integridade referencial
- RLS habilitado com políticas para usuários autenticados
- Índices otimizados para consultas

### 2. Serviços (AdminService)

Dois novos métodos adicionados ao `AdminService`:

```typescript
// Buscar documentos de um tipo de licença
AdminService.getLicenseTypeDocuments(licenseTypeId: string): Promise<LicenseTypeDocument[]>

// Atualizar documentos de um tipo de licença
AdminService.updateLicenseTypeDocuments(
  licenseTypeId: string,
  documents: { documentation_template_id: string; is_required: boolean }[]
): Promise<void>
```

### 3. Componente: `LicenseTypeDocumentsRepeater`

Componente reutilizável que implementa o form repeater para seleção de documentos.

**Funcionalidades:**
- Adicionar múltiplos documentos
- Selecionar documento de uma lista dropdown
- Marcar documento como obrigatório via checkbox
- Remover documento da lista
- Validação para evitar documentos duplicados
- Exibição de informações do documento (descrição, tipos aceitos)
- Resumo visual com contadores de documentos obrigatórios/opcionais

**Props:**
- `licenseTypeId?` - ID do tipo de licença (opcional, para edição)
- `value` - Array de documentos selecionados
- `onChange` - Callback para atualizar os documentos

### 4. Formulário: `LicenseTypeForm`

Formulário customizado para cadastro/edição de tipos de licença.

**Campos:**
- Sigla/Abreviação (obrigatório)
- Nome do Tipo de Licença (obrigatório)
- Prazo de Validade (obrigatório, número)
- Unidade de Tempo (obrigatório, select: meses/anos)
- Descrição (opcional, textarea)
- **Form Repeater de Documentação** (novo!)

**Validações:**
- Todos os campos obrigatórios devem ser preenchidos
- Documentos não podem estar vazios
- Não permite duplicatas de documentos

### 5. Integração no AdminDashboard

O `AdminDashboard` foi atualizado para usar o formulário customizado `LicenseTypeForm` ao invés do `GenericForm` para a seção "license-types".

## Como Usar

### 1. Acessar Menu Administrativo

1. Faça login no sistema
2. Acesse o Dashboard
3. Clique no menu "Administrador"
4. Selecione "Tipos de Licença"

### 2. Criar Novo Tipo de Licença

1. Clique no botão "Adicionar Novo"
2. Preencha os campos básicos:
   - Sigla (ex: LP, LI, LO)
   - Nome (ex: Licença Prévia)
   - Prazo de Validade (ex: 5)
   - Unidade de Tempo (ex: anos)
   - Descrição (opcional)

3. Configure os documentos necessários:
   - Clique em "Adicionar Documento"
   - Selecione o documento no dropdown
   - Marque o checkbox "Documento obrigatório" se necessário
   - Repita para adicionar mais documentos

4. Clique em "Salvar"

### 3. Editar Tipo de Licença Existente

1. Na lista de tipos de licença, clique no botão "Editar"
2. Os documentos já configurados serão carregados automaticamente
3. Modifique campos e documentos conforme necessário
4. Clique em "Salvar"

## Exemplo de Uso

### Cenário: Configurar LP (Licença Prévia)

1. **Dados Básicos:**
   - Sigla: LP
   - Nome: Licença Prévia
   - Prazo: 5 anos
   - Descrição: Concedida na fase preliminar do planejamento

2. **Documentos Obrigatórios:**
   - Requerimento de Licença ✓ (Obrigatório)
   - Procuração ✓ (Obrigatório)
   - ART - Anotação de Responsabilidade Técnica ✓ (Obrigatório)
   - Planta de Localização ✓ (Obrigatório)

3. **Documentos Opcionais:**
   - Estudo de Viabilidade (Opcional)
   - Projeto Técnico (Opcional)

## Estrutura de Dados

### Exemplo de Documento no Form Repeater:

```typescript
{
  documentation_template_id: "uuid-do-documento",
  is_required: true
}
```

### Exemplo de Retorno da API:

```typescript
{
  id: "uuid",
  license_type_id: "uuid-do-tipo-licenca",
  documentation_template_id: "uuid-do-documento",
  is_required: true,
  documentation_templates: {
    id: "uuid",
    name: "Requerimento de Licença",
    description: "Documento de solicitação...",
    document_types: ["Word", "PDF"]
  }
}
```

## Recursos Visuais

### Interface do Form Repeater

```
┌─────────────────────────────────────────────────────┐
│ Documentação Necessária      [+ Adicionar Documento]│
├─────────────────────────────────────────────────────┤
│ ┌───┐                                           [🗑] │
│ │ 1 │ Documento: [Requerimento de Licença ▼]        │
│ └───┘ ☑ Documento obrigatório                       │
│       ┌─────────────────────────────────────────┐   │
│       │ Documento de solicitação de licença...  │   │
│       │ [Word] [PDF]                            │   │
│       └─────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│ ┌───┐                                           [🗑] │
│ │ 2 │ Documento: [Procuração ▼]                      │
│ └───┘ ☐ Documento obrigatório                       │
├─────────────────────────────────────────────────────┤
│ 📄 2 documentos configurados                        │
│    1 obrigatório(s) • 1 opcional(is)                │
└─────────────────────────────────────────────────────┘
```

## Melhorias Futuras

1. **Ordenação de Documentos:** Permitir reordenar documentos com drag-and-drop
2. **Templates de Configuração:** Salvar configurações comuns de documentos
3. **Validação Condicional:** Documentos obrigatórios baseados em condições
4. **Histórico de Alterações:** Rastrear mudanças nas configurações de documentos
5. **Clonagem de Configuração:** Copiar configuração de documentos entre tipos de licença

## Tecnologias Utilizadas

- **React** - Framework frontend
- **TypeScript** - Tipagem estática
- **Supabase** - Banco de dados PostgreSQL
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones
- **React Toastify** - Notificações

## Arquivos Modificados/Criados

### Novos Arquivos:
- `src/components/admin/LicenseTypeDocumentsRepeater.tsx`
- `src/components/admin/LicenseTypeForm.tsx`
- `documentos/FEATURE_LICENSE_TYPE_DOCUMENTS.md`

### Arquivos Modificados:
- `src/services/adminService.ts` - Adicionados métodos para gerenciar documentos
- `src/components/admin/AdminDashboard.tsx` - Integração do LicenseTypeForm

### Migração de Banco:
- `create_base_tables_fixed.sql` - Criação das tabelas base e relacionamentos

## Suporte e Manutenção

Para suporte ou dúvidas sobre esta funcionalidade, consulte:
- Documentação técnica em `/documentos`
- Código fonte em `/src/components/admin`
- Serviços em `/src/services/adminService.ts`

---

**Data de Implementação:** 2025-11-18
**Versão:** 2.0.0
**Status:** ✅ Implementado e Testado
