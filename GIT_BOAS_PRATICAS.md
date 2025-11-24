# Boas Práticas Git - Guia para Desenvolvedores

## ⚠️ Arquivos que NÃO devem ser commitados

### 1. Arquivos Temporários do Vite

**NÃO COMMITAR**:
- `*.timestamp-*.mjs`
- Arquivos gerados automaticamente pelo Vite durante desenvolvimento

**Motivo**: São arquivos de cache/build temporários que mudam constantemente e não fazem parte do código-fonte.

**O que fazer se commitou acidentalmente**:
```powershell
# Se ainda não fez push
git reset HEAD~1
git add .gitignore
git commit -m "Add Vite temp files to .gitignore"

# Se já fez push (cuidado - altera histórico)
# Consulte o tech lead antes de fazer force push
```

### 2. Outros Arquivos Comuns a Evitar

❌ `node_modules/` - Dependências (use `package.json`)  
❌ `dist/` - Build de produção  
❌ `.env` - Variáveis de ambiente sensíveis  
❌ `*.log` - Logs de execução  
❌ `.vscode/` - Configurações pessoais do editor (exceto `extensions.json`)  
❌ `__pycache__/` - Cache do Python  
❌ `*.pyc` - Bytecode Python compilado  

---

## ✅ Workflow Recomendado

### Antes de Commitar

```powershell
# 1. Verificar status (o que será commitado)
git status

# 2. Verificar diferenças
git diff

# 3. Se houver arquivos indesejados, adicionar ao .gitignore
echo "arquivo_indesejado.txt" >> .gitignore

# 4. Adicionar apenas arquivos necessários
git add arquivo1.ts arquivo2.tsx

# Ou adicionar todos (com cuidado)
git add .

# 5. Commitar com mensagem clara
git commit -m "feat: Adiciona validação de formulário"
```

### Convenção de Mensagens de Commit

Use prefixos para clareza:

```
feat: Nova funcionalidade
fix: Correção de bug
docs: Documentação
style: Formatação (não afeta código)
refactor: Refatoração de código
test: Adiciona ou modifica testes
chore: Manutenção (build, deps, etc)
perf: Melhoria de performance
```

**Exemplos**:
```
feat: Add enterprise validation system
fix: Resolve infinite loop in Activities page
docs: Update API integration guide
chore: Update dependencies to latest versions
```

---

## 🔄 Sincronizando com Main

### Antes de Iniciar Nova Feature

```powershell
# 1. Atualizar sua branch main local
git checkout main
git pull origin main

# 2. Criar nova feature branch a partir da main atualizada
git checkout -b feature/nome-da-feature
```

### Mantendo Feature Branch Atualizada

```powershell
# Opção 1: Merge (recomendado para branches compartilhadas)
git checkout feature/sua-branch
git merge main

# Opção 2: Rebase (recomendado para branches pessoais)
git checkout feature/sua-branch
git rebase main
```

---

## 🚨 Problemas Comuns e Soluções

### Commitou arquivo que não deveria

```powershell
# Se ainda NÃO fez push
git reset HEAD~1                    # Desfaz último commit (mantém alterações)
git restore --staged arquivo.txt    # Remove arquivo do stage
echo "arquivo.txt" >> .gitignore    # Adiciona ao gitignore
git add .gitignore
git commit -m "chore: Update .gitignore"
```

### Arquivo já está no repositório mas agora está no .gitignore

```powershell
# Remove do Git mas mantém no disco
git rm --cached arquivo.txt
git commit -m "chore: Remove arquivo.txt from repository"
git push origin main
```

### Conflitos ao fazer merge/rebase

```powershell
# 1. Ver arquivos em conflito
git status

# 2. Resolver conflitos manualmente nos arquivos
# Procure por marcadores: <<<<<<<, =======, >>>>>>>

# 3. Após resolver
git add arquivo_resolvido.ts
git commit  # (para merge)
git rebase --continue  # (para rebase)
```

---

## 📋 Checklist Antes de Push

- [ ] `git status` não mostra arquivos indesejados
- [ ] Commit message segue convenção
- [ ] Código foi testado localmente
- [ ] `.gitignore` está atualizado
- [ ] Não há arquivos sensíveis (.env, senhas, etc)
- [ ] Build passa sem erros (`npm run build`)

---

## 🛠️ Comandos Úteis

```powershell
# Ver histórico de commits
git log --oneline -10

# Ver diferenças com branch remota
git fetch origin
git log HEAD..origin/main --oneline

# Desfazer último commit (mantém alterações)
git reset --soft HEAD~1

# Descartar todas as alterações locais
git reset --hard HEAD

# Ver quem modificou cada linha de um arquivo
git blame arquivo.ts

# Limpar arquivos não rastreados
git clean -fd
```

---

## 📞 Quando Pedir Ajuda

Consulte o tech lead se:
- Precisar fazer `git push --force`
- Houver conflitos complexos
- Deletou commits importantes acidentalmente
- Não souber como resolver um problema de merge

---

## 🔗 Recursos Adicionais

- [Git Documentation](https://git-scm.com/doc)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Versionamento do Projeto](./VERSIONAMENTO.md)
