# 🔴 AÇÕES URGENTES PARA O BACKEND

**Data:** 22/11/2025  
**Contexto:** Erros identificados durante testes automatizados e uso da aplicação

---

## 1. 🗄️ ERRO SQL - Coluna Faltando em documentation_templates (CRÍTICO)

### ❌ Problema
Erro ao editar atividade: `column documentation_templates_1.category does not exist`

**Endpoint afetado:** `GET /api/v1/activities/{id}/license-config`

### 📋 Detalhes do Erro
```
{
  "code": "42703",
  "details": null,
  "hint": null,
  "message": "column documentation_templates_1.category does not exist"
}
```

### ✅ Solução
O backend está tentando acessar uma coluna `category` na tabela `documentation_templates` que **não existe** ou tem outro nome.

**Verificar no código do backend:**
1. Query que busca `license-config` para uma atividade
2. JOIN com tabela `documentation_templates`
3. Campo `category` sendo selecionado

**Ações:**
- [ ] Verificar se coluna existe: `SELECT column_name FROM information_schema.columns WHERE table_name='documentation_templates'`
- [ ] Se não existe, adicionar coluna ou ajustar query do backend
- [ ] Se tem outro nome, atualizar o backend para usar o nome correto

**Impacto:** Usuários **NÃO CONSEGUEM editar atividades** existentes.

---

## 2. 🗄️ BANCO DE DADOS - Tabela Faltando (CRÍTICO)

### ❌ Problema
Erro ao salvar atividade: `Could not find the table 'public.activity_enterprise_size_ranges' in the schema cache`

### ✅ Solução
Executar o script SQL no Supabase:

**Arquivo:** `SCRIPT_SQL_CRIAR_ACTIVITY_ENTERPRISE_SIZE_RANGES.sql`

**Ação:**
1. Abrir SQL Editor no Supabase Dashboard
2. Copiar e executar todo o conteúdo do arquivo
3. Verificar se tabela foi criada: `SELECT * FROM activity_enterprise_size_ranges LIMIT 1;`

**O que o script faz:**
- Cria tabela `activity_enterprise_size_ranges`
- Configura Row Level Security (RLS)
- Cria políticas de acesso (anon, authenticated, service_role)
- Adiciona índices para performance
- Configura trigger para `updated_at` automático

**Impacto:** Sem essa tabela, usuários **NÃO CONSEGUEM salvar atividades** com faixas de porte.

---

## 2. 🏢 ENDPOINT - Criar Empreendimento (IMPLEMENTAR)

### ❌ Problema Atual
Endpoint `POST /api/v1/enterprises` foi implementado no frontend mas **não existe no backend**.

### ✅ Implementação Necessária

**Referência:** `documentos/backend-reference/enterpriseRoutes.example.ts`

#### Endpoint: `POST /api/v1/enterprises`

**Request Body:**
```json
{
  "tipo_pessoa": "juridica" | "fisica",
  "cnpj_cpf": "12345678000199",
  "razao_social": "Empresa Exemplo Ltda",  // se juridica
  "nome_fantasia": "Exemplo Corp",         // se juridica
  "nome_completo": "João da Silva",        // se fisica
  "endereco": "Rua Exemplo, 123",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01234-567",
  "telefone": "(11) 98765-4321",
  "email": "contato@exemplo.com"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-gerado",
    "tipo_pessoa": "juridica",
    "cnpj_cpf": "12345678000199",
    "razao_social": "Empresa Exemplo Ltda",
    "nome_fantasia": "Exemplo Corp",
    "created_at": "2025-11-22T10:30:00Z",
    "updated_at": "2025-11-22T10:30:00Z"
  },
  "message": "Empreendimento criado com sucesso"
}
```

**Validações:**
1. `tipo_pessoa` obrigatório: deve ser 'fisica' ou 'juridica'
2. `cnpj_cpf` obrigatório e único
3. Se `juridica`: validar CNPJ (14 dígitos)
4. Se `fisica`: validar CPF (11 dígitos)
5. Verificar se documento já existe antes de criar (retornar 409 Conflict)

**Tabelas a usar:**
- `pessoas_juridicas` (se tipo_pessoa = 'juridica')
- `pessoas_fisicas` (se tipo_pessoa = 'fisica')

**Implementação sugerida (Python/FastAPI):**
```python
@router.post("/enterprises", status_code=201)
async def create_enterprise(payload: EnterpriseCreate, db: Session = Depends(get_db)):
    tipo_pessoa = payload.tipo_pessoa
    cnpj_cpf = payload.cnpj_cpf.replace(/\D/g, '')  # Limpar formatação
    
    # Determinar tabela
    if tipo_pessoa == 'juridica':
        # Verificar se CNPJ já existe
        exists = db.query(PessoaJuridica).filter_by(cnpj=cnpj_cpf).first()
        if exists:
            raise HTTPException(status_code=409, detail="CNPJ já cadastrado")
        
        # Criar registro
        new_pj = PessoaJuridica(
            cnpj=cnpj_cpf,
            razao_social=payload.razao_social,
            nome_fantasia=payload.nome_fantasia,
            endereco=payload.endereco,
            cidade=payload.cidade,
            estado=payload.estado,
            cep=payload.cep,
            telefone=payload.telefone,
            email=payload.email
        )
        db.add(new_pj)
        db.commit()
        db.refresh(new_pj)
        
        return {
            "success": True,
            "data": {
                "id": str(new_pj.id),
                "tipo_pessoa": "juridica",
                "cnpj_cpf": cnpj_cpf,
                **new_pj.dict()
            },
            "message": "Empreendimento criado com sucesso"
        }
    
    else:  # fisica
        # Similar para pessoa física
        # ...
```

**Onde está sendo chamado:**
- `src/services/enterpriseService.ts` → função `createEnterprise()`
- `src/components/EmpreendimentoWizardMotor.tsx` → ao finalizar wizard (step 4)

**Impacto:** Sem esse endpoint, empreendimentos criados no wizard **NÃO SÃO SALVOS no banco**.

---

## 3. 🔍 VALIDAÇÃO - Endpoints de Busca

### ✅ Já Implementado (confirmar funcionamento)
- `GET /api/v1/enterprises/search?query=xxx` ✅
- `GET /api/v1/enterprises/:id` ✅

### 🧪 Testar
Rodar teste automatizado:
```powershell
cd tests
python test_api_parametrizacao.py
```

---

## 4. 🔐 AUTENTICAÇÃO - Token Format (AVISAR SOBRE)

### ⚠️ Observado no Console
```
❌ Token inválido! JWT deve ter 3 partes, mas tem: 1
Token completo: "eyJzdWIiOiAiMjY0NjcxIiwgInRpcG8iOiAiQ1BGIiwgImlhdCI6IDE3NjM4MTQ5Njd9"
```

**Problema:** Token JWT está sendo gerado com apenas 1 parte (faltam assinatura e header completo).

**Token JWT válido deve ter 3 partes separadas por ponto:**
```
header.payload.signature
```

**Exemplo correto:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiAiMjY0NjcxIiwgInRpcG8iOiAiQ1BGIiwgImlhdCI6IDE3NjM4MTQ5Njd9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Ação:** Revisar geração de JWT no backend (endpoint `/api/v1/auth/login`).

---

## 5. 📊 PRIORIDADE DAS AÇÕES

| # | Ação | Prioridade | Impacto | Tempo Estimado |
|---|------|-----------|---------|----------------|
| 1 | Criar tabela `activity_enterprise_size_ranges` | 🔴 CRÍTICO | Bloqueia cadastro de atividades | 5 min |
| 2 | Implementar `POST /api/v1/enterprises` | 🟠 ALTA | Empreendimentos não são salvos | 30-60 min |
| 3 | Validar endpoints de busca existentes | 🟡 MÉDIA | Verificar se funcionam corretamente | 10 min |
| 4 | Corrigir formato JWT | 🟢 BAIXA | Não bloqueia, mas gera warnings | 20 min |

---

## 6. 📝 CHECKLIST DE VALIDAÇÃO

Após implementar as ações:

- [ ] **Tabela criada:** Executar `SELECT * FROM activity_enterprise_size_ranges LIMIT 1;`
- [ ] **Salvar atividade:** Tentar cadastrar nova atividade na UI (não deve dar erro)
- [ ] **Criar empreendimento:** Testar `POST /api/v1/enterprises` via Postman/curl
- [ ] **Buscar empreendimento:** Testar `GET /api/v1/enterprises/search?query=TESTE`
- [ ] **Token JWT:** Verificar se login retorna JWT com 3 partes

---

## 7. 🧪 TESTES AUTOMATIZADOS DISPONÍVEIS

Para validar após implementação:

```powershell
# Teste completo de atividades
cd tests
python test_activities_crud_selenium.py

# Teste de API de parametrização
python test_api_parametrizacao.py

# Teste de cadastro de empreendimento (quando POST estiver implementado)
python orchestrator_novo_empreendimento.py
```

---

## 8. 📚 ARQUIVOS DE REFERÊNCIA

**Scripts SQL:**
- `SCRIPT_SQL_CRIAR_ACTIVITY_ENTERPRISE_SIZE_RANGES.sql` (executar no Supabase)
- `Docs/database/create_activity_enterprise_size_ranges_table.sql` (backup)

**Documentação Backend:**
- `documentos/backend-reference/enterpriseRoutes.example.ts`
- `documentos/PROGRESSO_PARAMETRIZACAO_EMPREENDIMENTO.md`
- `documentos/backend/ENDPOINTS_ATIVIDADES.md`

**Código Frontend (onde endpoints são chamados):**
- `src/services/enterpriseService.ts`
- `src/components/EmpreendimentoWizardMotor.tsx`
- `src/components/enterprise/EnterpriseSearch.tsx`

---

## 9. ✉️ CONTATO/DÚVIDAS

Se precisar de esclarecimentos:
- Documentação detalhada em `SOLUCAO_ERRO_ACTIVITY_ENTERPRISE_SIZE_RANGES.md`
- Exemplos de código em `documentos/backend-reference/`
- Logs de teste em `tests/screenshots/` (após rodar testes)

---

**Resumo:** 2 ações críticas (tabela + endpoint POST), 2 validações e 1 melhoria de qualidade.
