# 🚀 Migração Bolt.new → Servidor Miltec - Resumo Rápido

## ✅ Checklist Pré-Deploy

### 1. Preparação do Código
- [ ] Código baixado do Bolt.new (ou já está em `d:\code\python\github-dzabccvf`)
- [ ] Arquivos Docker criados (Dockerfile, docker-compose.yml, nginx.conf, etc.)
- [ ] Dependências instaladas localmente (`npm install`)
- [ ] Build local testado (`npm run build`)

### 2. Informações Necessárias
- [ ] URL do Supabase: `___________________________`
- [ ] Chave Anon do Supabase: `___________________________`
- [ ] URL do Backend FastAPI: `___________________________`
- [ ] IP/Domínio do Servidor Miltec: `___________________________`
- [ ] Porta para o frontend: `___________________________` (ex: 80, 8080)
- [ ] Acesso ao Portainer: `___________________________`

### 3. No Servidor Miltec
- [ ] Docker instalado
- [ ] Portainer acessível
- [ ] Porta desejada disponível
- [ ] Acesso SSH (opcional, mas recomendado)

---

## 🎯 Passos Rápidos de Deploy

### Via Portainer + Git (Mais Rápido)

1. **Commitar código no GitHub**
   ```powershell
   git add .
   git commit -m "Adiciona config Docker"
   git push origin main
   ```

2. **No Portainer:**
   - Stacks → Add Stack
   - Nome: `licenciamento-ambiental`
   - Build method: **Git Repository**
   - Repository URL: `https://github.com/wmiltecti/github-dzabccvf`
   - Compose path: `docker-compose.yml`

3. **Adicionar variáveis de ambiente:**
   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua_chave_anon
   VITE_API_BASE_URL=http://ip-backend:8000
   ```

4. **Deploy the stack** → Aguardar build (5-10 min)

5. **Acessar:** `http://ip-servidor`

---

## 🔄 Diferenças Bolt.new vs Miltec

| O que muda | Bolt.new | Servidor Miltec |
|------------|----------|-----------------|
| **URL de acesso** | https://xxx.bolt.new | http://ip-servidor ou https://seu-dominio.com.br |
| **Deploy** | Automático ao salvar | Manual via Portainer |
| **Variáveis ENV** | Interface Bolt | Portainer Environment Variables |
| **Build** | Automático | Docker build |
| **Logs** | Console do Bolt | `docker logs container-name` |
| **Atualizações** | Instantâneas | Git pull + rebuild |

---

## 🆘 Problemas Comuns

### "Build falhou no Portainer"
```bash
# Fazer build manual no servidor
ssh user@servidor
cd /opt/licenciamento
docker build -t licenciamento:latest .
```

### "Container não inicia"
```bash
# Ver logs
docker logs licenciamento-ambiental-frontend
```

### "404 ao acessar rotas"
- Verificar se `nginx.conf` tem: `try_files $uri $uri/ /index.html;`

### "Não conecta ao Supabase/Backend"
- Verificar variáveis de ambiente no Portainer
- Testar: `docker exec container-name env | grep VITE`

---

## 📞 Suporte Rápido

**Documentação completa:** `Docs/DEPLOY_MILTEC.md`

**Comandos úteis:**
```bash
# Status do container
docker ps

# Logs em tempo real
docker logs -f licenciamento-ambiental-frontend

# Entrar no container
docker exec -it licenciamento-ambiental-frontend /bin/sh

# Reiniciar container
docker restart licenciamento-ambiental-frontend
```

---

## ✨ Após Deploy com Sucesso

- [ ] Aplicação acessível via navegador
- [ ] Login funciona
- [ ] Dados carregam do Supabase
- [ ] API backend responde
- [ ] Sem erros no console (F12)
- [ ] Todas as rotas funcionam
- [ ] Configurar domínio (se aplicável)
- [ ] Configurar SSL/HTTPS (se aplicável)
- [ ] Configurar backup automático
- [ ] Documentar URLs e credenciais

🎉 **Parabéns! Você migrou do Bolt.new para produção!**
