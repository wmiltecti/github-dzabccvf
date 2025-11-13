# Guia de Deploy no Portainer

## 📋 Pré-requisitos

- Portainer instalado e configurado
- Acesso ao Azure DevOps: `http://azuredevops.miltecti.com.br:8282/PRODUTOS/SISAMA/_git/licenciamento_ambiental_frontend.git`
- Credenciais do repositório Git
- Variáveis de ambiente configuradas

## 🚀 Opção 1: Deploy via Stack (Recomendado)

### Passo 1: Criar Stack no Portainer

1. Acesse o Portainer
2. Vá em **Stacks** → **Add stack**
3. Nome: `licenciamento-ambiental-frontend`
4. Build method: **Git Repository**

### Passo 2: Configurar Repositório Git

- **Repository URL**: `http://azuredevops.miltecti.com.br:8282/PRODUTOS/SISAMA/_git/licenciamento_ambiental_frontend.git`
- **Repository reference**: `refs/heads/main`
- **Compose path**: `docker-compose.yml`
- **Authentication**: Ativar
  - Username: `[seu usuário Azure DevOps]`
  - Personal Access Token: `[seu PAT]`

### Passo 3: Variáveis de Ambiente

Adicione as seguintes variáveis:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Passo 4: Deploy

1. Clique em **Deploy the stack**
2. Aguarde o build e inicialização
3. Verifique os logs em **Containers**

---

## 🐳 Opção 2: Deploy Manual via CLI

### Passo 1: Clonar Repositório

```bash
git clone http://azuredevops.miltecti.com.br:8282/PRODUTOS/SISAMA/_git/licenciamento_ambiental_frontend.git
cd licenciamento_ambiental_frontend
```

### Passo 2: Criar arquivo .env

Crie um arquivo `.env` na raiz:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Passo 3: Build e Deploy

```bash
# Build da imagem
docker build -t licenciamento-ambiental-frontend:latest .

# Ou usando docker-compose
docker-compose up -d --build
```

### Passo 4: Verificar Container

```bash
# Ver logs
docker logs licenciamento-ambiental-frontend

# Verificar status
docker ps | grep licenciamento
```

---

## 🔧 Opção 3: Deploy via Portainer Custom Template

### Passo 1: Criar Custom Template

1. Vá em **App Templates** → **Custom Templates**
2. Clique em **Add Custom Template**
3. Configure:

**Título**: `Licenciamento Ambiental Frontend`

**Tipo**: `Standalone`

**Plataforma**: `Linux`

**Docker Compose**:

```yaml
version: '3.8'

services:
  frontend:
    image: licenciamento-ambiental-frontend:latest
    container_name: licenciamento-ambiental-frontend
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
      - VITE_API_BASE_URL=${VITE_API_BASE_URL}
    restart: unless-stopped
    networks:
      - licenciamento-network

networks:
  licenciamento-network:
    driver: bridge
```

### Passo 2: Deploy do Template

1. Vá em **App Templates**
2. Selecione o template criado
3. Preencha as variáveis de ambiente
4. Clique em **Deploy the container**

---

## 📝 Variáveis de Ambiente Necessárias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima do Supabase | `eyJhbGciOiJIUzI1NiIsInR5cCI6...` |
| `VITE_API_BASE_URL` | URL da API backend | `http://localhost:8000/api/v1` |

---

## 🔍 Verificação e Testes

### 1. Verificar Container Rodando

```bash
docker ps | grep licenciamento
```

### 2. Verificar Logs

```bash
docker logs -f licenciamento-ambiental-frontend
```

### 3. Testar Aplicação

Acesse no navegador:
- `http://localhost` (ou a porta configurada)
- `http://seu-servidor:porta`

### 4. Verificar Health Check

```bash
curl http://localhost/
```

---

## 🔄 Atualização da Aplicação

### Via Portainer Stack (Automático)

1. Vá em **Stacks**
2. Selecione a stack
3. Clique em **Pull and redeploy**
4. Aguarde o rebuild

### Via CLI

```bash
# Parar container
docker-compose down

# Pull das mudanças
git pull origin main

# Rebuild e restart
docker-compose up -d --build
```

---

## 🐛 Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker logs licenciamento-ambiental-frontend

# Ver status do container
docker inspect licenciamento-ambiental-frontend
```

### Erro de build

```bash
# Limpar cache do Docker
docker builder prune

# Rebuild sem cache
docker build --no-cache -t licenciamento-ambiental-frontend:latest .
```

### Porta em uso

Edite o `docker-compose.yml`:

```yaml
ports:
  - "8080:80"  # Usar porta 8080 no host
```

### Variáveis de ambiente não carregam

Verifique:
1. Arquivo `.env` existe na raiz
2. Formato correto: `CHAVE=valor` (sem espaços)
3. Container foi recriado após mudanças

---

## 📊 Monitoramento

### Recursos do Container

No Portainer:
1. Vá em **Containers**
2. Selecione o container
3. Veja **Stats** para CPU, memória, rede

### Logs em Tempo Real

No Portainer:
1. Vá em **Containers**
2. Selecione o container
3. Clique em **Logs**
4. Ative **Auto-refresh**

---

## 🔐 Segurança

### Recomendações:

1. **Não commitar .env** no Git (já está no .gitignore)
2. **Usar secrets** do Portainer para dados sensíveis
3. **HTTPS**: Configurar proxy reverso (Nginx/Traefik) com SSL
4. **Firewall**: Limitar acesso às portas necessárias

### Configurar HTTPS (Opcional)

Adicione ao `docker-compose.yml`:

```yaml
services:
  frontend:
    # ... configurações existentes
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`seu-dominio.com`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
```

---

## ✅ Checklist de Deploy

- [ ] Repositório clonado/acessível
- [ ] Variáveis de ambiente configuradas
- [ ] Dockerfile e docker-compose.yml revisados
- [ ] Portas liberadas no firewall
- [ ] Stack criada no Portainer
- [ ] Build concluído sem erros
- [ ] Container rodando (docker ps)
- [ ] Aplicação acessível via navegador
- [ ] Logs sem erros críticos
- [ ] Teste de funcionalidades básicas

---

## 📞 Suporte

Para problemas ou dúvidas:
1. Verificar logs do container
2. Revisar configurações de rede
3. Validar variáveis de ambiente
4. Consultar documentação do Portainer

---

**Última atualização**: 13/11/2025
