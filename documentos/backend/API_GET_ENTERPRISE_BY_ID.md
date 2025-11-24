# 🔄 API GET Empreendimento por ID - Especificação

**Endpoint**: `GET /api/v1/enterprises/{id}`  
**Data**: 24/11/2025  
**Prioridade**: 🔴 CRÍTICA

---

## 📋 Objetivo

Retornar **TODOS os dados** de um empreendimento específico para permitir **edição** no frontend.

---

## 🎯 Requisição

### Método
```http
GET /api/v1/enterprises/{id}
```

### Headers
```http
Authorization: Bearer {token}
Content-Type: application/json
```

### Parâmetros
- **id** (path parameter): ID do empreendimento (string ou number)

---

## ✅ Resposta de Sucesso (200 OK)

### Estrutura Completa

```json
{
  "success": true,
  "message": "Empreendimento encontrado",
  "data": {
    "property": {
      "id": 123,
      "kind": "RURAL",
      "nome": "Fazenda Teste 6354",
      "car_codigo": "SC-613158-80365334",
      "situacao_car": "Ativo",
      "municipio": "Florianópolis",
      "uf": "SC",
      "area_total": 3509.0,
      "unidade_area": "ha",
      "coordenadas": {
        "latitude": -27.595378,
        "longitude": -48.548050,
        "sistema_referencia": "SIRGAS 2000"
      },
      "endereco_completo": "Florianópolis, SC",
      "matricula": null,
      "bairro": null,
      "cep": null
    },
    "basic_info": {
      "id": 456,
      "property_id": 123,
      "tipo_pessoa": "juridica",
      "cnpj_cpf": "12345678901234",
      "razao_social": "Complexo Industrial Mineração ABC",
      "nome_fantasia": "Mineração ABC",
      "nome_empreendimento": "Complexo Industrial Mineração ABC",
      "numero_empregados": 150,
      "descricao": "Empreendimento de mineração com beneficiamento de minérios",
      "endereco": "Florianópolis, SC",
      "cidade": "Florianópolis",
      "estado": "SC",
      "cep": null,
      "telefone": "48999999999",
      "email": "contato@mineracaoabc.com.br"
    },
    "participants": [
      {
        "id": 1,
        "enterprise_id": 456,
        "pessoa_id": 1,
        "pessoa_nome": "Empresa Mineração ABC Ltda",
        "pessoa_cpf_cnpj": "12345678901234",
        "tipo_pessoa": "juridica",
        "papel": "Requerente",
        "telefone": "48999999999",
        "email": "contato@mineracaoabc.com.br",
        "principal": true
      },
      {
        "id": 2,
        "enterprise_id": 456,
        "pessoa_id": 2,
        "pessoa_nome": "João da Silva Santos",
        "pessoa_cpf_cnpj": "12345678900",
        "tipo_pessoa": "fisica",
        "papel": "Procurador",
        "telefone": "48988888888",
        "email": "joao.santos@mineracaoabc.com.br",
        "principal": false
      }
    ],
    "activities": [
      {
        "id": 1,
        "enterprise_id": 456,
        "activity_id": 10,
        "activity_code": "02.01",
        "activity_name": "Extração e/ou beneficiamento de carvão mineral",
        "cnae_codigo": "2.1",
        "cnae_descricao": "Extração de carvão mineral",
        "quantidade": 150.0,
        "unidade_id": 5,
        "unidade_nome": "Toneladas/mês",
        "unidade_sigla": "t/mês",
        "area_ocupada": 2500.50,
        "area_unidade": "m²",
        "porte": "Grande",
        "porte_id": 3,
        "porte_descricao": "Porte Grande: acima de 100 t/mês",
        "principal": true,
        "observacoes": "Atividade principal do empreendimento com beneficiamento completo"
      }
    ],
    "characterization": {
      "id": 1,
      "enterprise_id": 456,
      "recursos_energia": {
        "usa_lenha": false,
        "possui_caldeira": false,
        "possui_fornos": false,
        "observacoes": null
      },
      "combustiveis": [
        {
          "tipo_fonte": "Diesel",
          "equipamento": "Gerador 500 kW",
          "quantidade": 1000.0,
          "unidade": "Litros",
          "periodo": "Mensal",
          "observacoes": "Utilizado apenas em casos de falta de energia elétrica"
        }
      ],
      "uso_agua": {
        "origens_agua": ["Rede Pública"],
        "consumo_humano": 5.5,
        "consumo_humano_unidade": "m³/dia",
        "consumo_outros_usos": 12.3,
        "consumo_outros_usos_unidade": "m³/dia",
        "consumo_total": 17.8,
        "volume_despejo_diario": 15.8,
        "volume_despejo_unidade": "m³/dia",
        "destino_efluente": "Rede Pública de Esgoto",
        "tratamento_efluente": "Sim",
        "tipo_tratamento": "Fossa séptica + filtro",
        "observacoes": "Sistema de tratamento adequado conforme normas ambientais"
      },
      "residuos": {
        "gera_residuos": true,
        "tipos_residuos": ["Classe I - Perigosos", "Classe II - Não Perigosos"],
        "residuos_grupo_a": [],
        "residuos_grupo_b": [],
        "residuos_gerais": [
          {
            "tipo": "Resíduo de Minério",
            "classe": "Classe II",
            "quantidade": 50.0,
            "unidade": "Toneladas/mês",
            "destinacao": "Aterro Industrial Licenciado",
            "observacoes": "Rejeito do processo de beneficiamento"
          }
        ],
        "possui_plano_gerenciamento": true,
        "observacoes": "Plano de Gerenciamento de Resíduos aprovado pelo órgão ambiental"
      },
      "outras_informacoes": {
        "perguntas_ambientais": {
          "area_preservacao_permanente": false,
          "area_reserva_legal": false,
          "supressao_vegetacao": false,
          "intervencao_corpo_hidrico": false,
          "geracao_ruido": true,
          "geracao_vibracao": false,
          "emissao_particulados": true,
          "emissao_gases": false,
          "risco_acidentes": true,
          "armazenamento_produtos_perigosos": false
        },
        "informacoes_adicionais": "Empreendimento com baixo impacto ambiental."
      }
    }
  }
}
```

---

## ❌ Respostas de Erro

### 404 - Empreendimento não encontrado
```json
{
  "success": false,
  "message": "Empreendimento não encontrado",
  "error": "NOT_FOUND"
}
```

### 401 - Não autenticado
```json
{
  "success": false,
  "message": "Token inválido ou expirado",
  "error": "UNAUTHORIZED"
}
```

### 403 - Sem permissão
```json
{
  "success": false,
  "message": "Você não tem permissão para acessar este empreendimento",
  "error": "FORBIDDEN"
}
```

### 500 - Erro interno
```json
{
  "success": false,
  "message": "Erro interno do servidor",
  "error": "INTERNAL_ERROR"
}
```

---

## 🔍 Regras de Negócio

### 1. **Autenticação**
- Usuário deve estar autenticado
- Token JWT válido obrigatório

### 2. **Autorização**
- Usuário só pode acessar empreendimentos que ele criou
- RLS (Row Level Security) deve filtrar por `user_id`

### 3. **Dados Completos**
- Retornar **TODOS** os dados relacionados:
  - ✅ Imóvel (property)
  - ✅ Dados básicos (basic_info)
  - ✅ Partícipes (participants) - array
  - ✅ Atividades (activities) - array
  - ✅ Caracterização (characterization) - objeto completo

### 4. **Relacionamentos**
- Fazer JOINs nas tabelas:
  - `properties`
  - `enterprises`
  - `enterprise_participants`
  - `enterprise_activities`
  - `enterprise_characterization`

---

## 📊 Query SQL Exemplo

```sql
-- Dados básicos do empreendimento
SELECT 
  e.*,
  p.* as property
FROM enterprises e
LEFT JOIN properties p ON e.property_id = p.id
WHERE e.id = :enterprise_id
  AND e.user_id = :current_user_id;

-- Partícipes
SELECT * FROM enterprise_participants
WHERE enterprise_id = :enterprise_id
ORDER BY principal DESC, id ASC;

-- Atividades
SELECT 
  ea.*,
  a.code as activity_code,
  a.name as activity_name
FROM enterprise_activities ea
LEFT JOIN activities a ON ea.activity_id = a.id
WHERE ea.enterprise_id = :enterprise_id
ORDER BY principal DESC, id ASC;

-- Caracterização
SELECT * FROM enterprise_characterization
WHERE enterprise_id = :enterprise_id;
```

---

## 🧪 Testes

### Teste 1: Buscar empreendimento existente
```bash
curl -X GET \
  http://localhost:8000/api/v1/enterprises/456 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

**Esperado**: Status 200 com dados completos

### Teste 2: Buscar empreendimento inexistente
```bash
curl -X GET \
  http://localhost:8000/api/v1/enterprises/99999 \
  -H "Authorization: Bearer {token}"
```

**Esperado**: Status 404

### Teste 3: Buscar sem autenticação
```bash
curl -X GET \
  http://localhost:8000/api/v1/enterprises/456
```

**Esperado**: Status 401

---

## 🎭 Comportamento do Frontend

Quando este endpoint **NÃO** está implementado:
1. Frontend tenta buscar do backend
2. Recebe erro 404 ou 500
3. Automaticamente usa dados mockados
4. Usuário consegue editar normalmente

Quando este endpoint **ESTÁ** implementado:
1. Frontend tenta buscar do backend
2. Recebe dados reais
3. Preenche wizard com dados do banco
4. Usuário edita dados reais
5. Ao salvar, atualiza registro no banco

---

## 📝 Notas Importantes

### Para o Backend

1. **Retornar dados aninhados**: O frontend espera objeto com 5 propriedades principais
2. **Arrays vazios são válidos**: Se não houver partícipes/atividades, retorne `[]`
3. **Nulls são permitidos**: Campos opcionais podem ser `null`
4. **IDs são importantes**: Incluir IDs de todos os registros para updates futuros

### Para o Frontend

1. **Fallback para mockup**: Se backend retornar 404/500, usa mockup
2. **Validação de estrutura**: Verifica se cada seção existe antes de usar
3. **Logs detalhados**: Console mostra o que foi carregado
4. **Toast informativo**: Usuário vê "Empreendimento carregado para edição"

---

## 🔗 APIs Relacionadas

- `POST /api/v1/enterprises` - Criar novo
- `PUT /api/v1/enterprises/{id}` - Atualizar completo
- `PATCH /api/v1/enterprises/{id}` - Atualizar parcial
- `DELETE /api/v1/enterprises/{id}` - Deletar

---

## ✅ Checklist de Implementação

- [ ] Endpoint criado e funcionando
- [ ] Autenticação validada
- [ ] RLS aplicado (user_id)
- [ ] JOINs com todas as tabelas
- [ ] Retorna estrutura completa
- [ ] Testes unitários criados
- [ ] Testado com Postman/cURL
- [ ] Documentação Swagger atualizada

---

**Criado em**: 24/11/2025  
**Atualizado em**: 24/11/2025  
**Status**: 📋 Especificação Completa
