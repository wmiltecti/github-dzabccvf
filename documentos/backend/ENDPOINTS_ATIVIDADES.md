# Endpoints Necessários - API de Atividades

## 📋 Contexto
A funcionalidade de seleção de atividades no cadastro de Novo Empreendimento precisa dos seguintes endpoints da API.

## 🔧 Configuração de URLs

**Base URL do Backend:** `http://localhost:8000/api/v1`

**Importante:** Os endpoints listados abaixo são **relativos** à base URL. Exemplo:
- Endpoint documentado: `GET /activities`
- URL completa no backend: `http://localhost:8000/api/v1/activities`

O frontend já está configurado com `baseURL: 'http://localhost:8000/api/v1'` no arquivo `http.ts`, então as chamadas são feitas apenas com o path relativo (ex: `/activities`).

## 🎯 Endpoints Necessários

### 1. **GET /activities**
Listar todas as atividades cadastradas

**URL Completa:** `http://localhost:8000/api/v1/activities`

**Query Parameters:**
- `include_inactive` (opcional, boolean): Se `true`, inclui atividades inativas. Padrão: `false`

**Response Success (200):**
```json
[
  {
    "id": "uuid",
    "code": 77686,
    "name": "Extração de areia, cascalho ou pedregulho",
    "description": "Descrição detalhada da atividade",
    "measurement_unit": "m³/mês",
    "is_active": true,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z",
    
    // Relacionamento com porte do empreendimento
    "enterprise_size": {
      "id": "uuid",
      "name": "Médio Porte"
    },
    
    // Relacionamento com potencial poluidor
    "pollution_potential": {
      "id": "uuid", 
      "name": "Alto"
    },
    
    // Faixas de porte (múltiplas faixas por atividade)
    "enterprise_size_ranges": [
      {
        "id": "uuid",
        "range_name": "Porte 1",
        "range_start": 0,
        "range_end": 1000,
        "enterprise_size": {
          "id": "uuid",
          "name": "Pequeno Porte"
        }
      },
      {
        "id": "uuid",
        "range_name": "Porte 2", 
        "range_start": 1001,
        "range_end": 10000,
        "enterprise_size": {
          "id": "uuid",
          "name": "Médio Porte"
        }
      }
    ]
  }
]
```

**Notas importantes:**
- O campo `enterprise_size` deve trazer a primeira faixa ou a faixa principal da atividade
- O array `enterprise_size_ranges` é opcional mas recomendado para atividades que têm múltiplas faixas
- A resposta deve vir ordenada por `code` (crescente)

---

### 2. **GET /activities/{id}**
Buscar uma atividade específica por ID

**URL Completa:** `http://localhost:8000/api/v1/activities/{id}`

**Path Parameters:**
- `id` (string, uuid): ID da atividade

**Response Success (200):**
```json
{
  "id": "uuid",
  "code": 77686,
  "name": "Extração de areia, cascalho ou pedregulho",
  "description": "Descrição detalhada",
  "measurement_unit": "m³/mês",
  "is_active": true,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z",
  "enterprise_size": {
    "id": "uuid",
    "name": "Médio Porte"
  },
  "pollution_potential": {
    "id": "uuid",
    "name": "Alto"
  },
  "enterprise_size_ranges": [...]
}
```

**Response Error (404):**
```json
{
  "message": "Atividade não encontrada"
}
```

---

### 3. **GET /activities/search** (Opcional - Futuro)
Buscar atividades por termo de pesquisa

**URL Completa:** `http://localhost:8000/api/v1/activities/search`

**Query Parameters:**
- `q` (string, obrigatório): Termo de busca (busca em code, name, description)

**Response Success (200):**
```json
[
  {
    "id": "uuid",
    "code": 77686,
    "name": "Extração de areia...",
    ...
  }
]
```

---

## 🗄️ Estrutura de Tabelas

### Tabela: `activities`
- `id` (uuid, PK)
- `code` (integer, unique)
- `name` (varchar)
- `description` (text, nullable)
- `measurement_unit` (varchar, nullable) - Ex: "m³/mês", "ton/ano"
- `is_active` (boolean, default true)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Tabela: `activity_enterprise_size_ranges`
Relacionamento N:N entre atividades e portes, com faixas numéricas:

- `id` (uuid, PK)
- `activity_id` (uuid, FK → activities.id)
- `enterprise_size_id` (uuid, FK → enterprise_sizes.id)
- `range_name` (varchar) - Ex: "Porte 1", "Porte 2"
- `range_start` (numeric) - Valor inicial da faixa
- `range_end` (numeric) - Valor final da faixa
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Tabela: `enterprise_sizes`
- `id` (uuid, PK)
- `name` (varchar) - Ex: "Pequeno Porte", "Médio Porte", "Grande Porte"
- `description` (text, nullable)
- `is_active` (boolean)

### Tabela: `pollution_potentials`
- `id` (uuid, PK)
- `name` (varchar) - Ex: "Baixo", "Médio", "Alto"
- `description` (text, nullable)
- `is_active` (boolean)

---

## 🔄 Lógica de Negócio

### Buscar Porte da Atividade
Para o endpoint `/activities` (completo: `http://localhost:8000/api/v1/activities`), o backend deve:

1. Buscar todas as atividades ativas (se `include_inactive=false`)
2. Para cada atividade, fazer join com `activity_enterprise_size_ranges`
3. Trazer o porte (`enterprise_size`) da primeira faixa ou faixa padrão
4. Opcionalmente, incluir array com todas as faixas em `enterprise_size_ranges`

**Query SQL de exemplo:**
```sql
SELECT 
  a.*,
  pp.id as pollution_potential_id,
  pp.name as pollution_potential_name,
  es.id as enterprise_size_id,
  es.name as enterprise_size_name,
  json_agg(
    json_build_object(
      'id', aesr.id,
      'range_name', aesr.range_name,
      'range_start', aesr.range_start,
      'range_end', aesr.range_end,
      'enterprise_size', json_build_object(
        'id', es2.id,
        'name', es2.name
      )
    )
  ) as enterprise_size_ranges
FROM activities a
LEFT JOIN pollution_potentials pp ON a.pollution_potential_id = pp.id
LEFT JOIN activity_enterprise_size_ranges aesr ON a.id = aesr.activity_id
LEFT JOIN enterprise_sizes es ON aesr.enterprise_size_id = es.id
LEFT JOIN enterprise_sizes es2 ON aesr.enterprise_size_id = es2.id
WHERE a.is_active = true
GROUP BY a.id, pp.id, es.id
ORDER BY a.code ASC;
```

---

## 📦 Dados de Teste Necessários

Por favor, garanta que existem atividades cadastradas no banco com:
- Código (code)
- Nome (name)
- Unidade de medida (measurement_unit)
- Pelo menos uma faixa de porte em `activity_enterprise_size_ranges`
- Relacionamento com potencial poluidor (opcional)

**Exemplo de atividade:**
```
code: 77686
name: "Extração de areia, cascalho ou pedregulho"
measurement_unit: "m³/mês"
enterprise_size_ranges: [
  {
    range_name: "Pequeno Porte",
    range_start: 0,
    range_end: 10000,
    enterprise_size_id: <id do pequeno porte>
  }
]
```

---

## ⚙️ Configuração CORS (CRÍTICO)

O frontend roda em `http://localhost:5173` e precisa acessar `http://localhost:8000/api/v1`.

**FastAPI - Adicionar no main.py:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Frontend Vite
        "http://127.0.0.1:5173"   # Variante localhost
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**⚠️ Sem CORS configurado, o navegador bloqueia as requisições com erro:**
```
Access to XMLHttpRequest at 'http://localhost:8000/api/v1/activities' from origin 'http://localhost:5173' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

---

## ✅ Checklist de Implementação

- [ ] **Configurar CORS** para aceitar requisições de `http://localhost:5173`
- [ ] Criar endpoint `GET /activities` (rota completa: `/api/v1/activities`)
- [ ] Criar endpoint `GET /activities/{id}` (rota completa: `/api/v1/activities/{id}`)
- [ ] Garantir que o join com `activity_enterprise_size_ranges` está funcionando
- [ ] Garantir que o join com `enterprise_sizes` retorna o nome do porte
- [ ] Garantir que o join com `pollution_potentials` retorna o potencial poluidor
- [ ] Testar com `include_inactive=false` (padrão)
- [ ] Testar com `include_inactive=true`
- [ ] Validar que a resposta está ordenada por `code`
- [ ] Adicionar dados de teste (pelo menos 5 atividades)

---

## 🐛 Possíveis Erros

**Error 500:**
- Verificar se as tabelas `activity_enterprise_size_ranges` e `enterprise_sizes` existem
- Verificar se há dados cadastrados
- Verificar se os JOINs estão corretos

**Response vazio []:**
- Verificar se existem atividades com `is_active = true`
- Verificar se as atividades têm faixas cadastradas em `activity_enterprise_size_ranges`

---

## 📞 Contato
Se houver dúvidas sobre a estrutura ou necessidade de ajustes, estou disponível para discussão.
