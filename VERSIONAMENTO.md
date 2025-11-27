# Guia de Versionamento do Projeto

## Convenção de Versionamento

Este projeto utiliza **Semantic Versioning (SemVer)**: `MAJOR.MINOR.PATCH`

- **MAJOR**: Mudanças incompatíveis com versões anteriores
- **MINOR**: Novas funcionalidades compatíveis com versões anteriores
- **PATCH**: Correções de bugs compatíveis com versões anteriores

Exemplo: `v2.4.1`

---

## Workflow de Criação de Versão

### 1. Atualizar Versão no `package.json`

```json
{
  "version": "2.4.2"
}
```

### 2. Fazer Commit das Alterações

```powershell
git add package.json [outros arquivos modificados]
git commit -m "v2.4.2: Descrição clara das mudanças"
```

**Formato da mensagem de commit**:
- Iniciar com `v{versão}:`
- Descrever brevemente as mudanças principais
- Exemplo: `v2.4.2: Add enterprise validation and fix save bug`

### 3. Criar Tag Anotada

```powershell
# Tag anotada (RECOMENDADO - inclui autor, data e mensagem)
git tag -a v2.4.2 -m "Release v2.4.2: Descrição detalhada das mudanças"
```

**Ou tag leve** (não recomendado para releases):
```powershell
git tag v2.4.2
```

### 4. Enviar Commit e Tag para o Repositório Remoto

```powershell
# Push do commit
git push origin main

# Push da tag específica
git push origin v2.4.2

# Ou enviar todas as tags de uma vez
git push origin --tags
```

---

## Comandos Úteis para Gerenciar Tags

### Listar Tags

```powershell
# Listar todas as tags
git tag -l

# Listar tags com padrão específico
git tag -l "v2.4.*"
```

### Ver Detalhes de uma Tag

```powershell
git show v2.4.1
```

### Deletar Tag (se necessário)

```powershell
# Deletar tag local
git tag -d v2.4.1

# Deletar tag remota
git push origin --delete v2.4.1
```

### Criar Tag em Commit Anterior

```powershell
# Se esqueceu de criar tag em um commit específico
git tag -a v2.4.0 968122b -m "Release v2.4.0: Fix enterprise save system"
git push origin v2.4.0
```

---

## Criar Release no GitHub (Recomendado)

Após criar e enviar a tag, crie uma release oficial no GitHub:

1. Acesse: **GitHub → Repositório → Releases**
2. Clique em **"Draft a new release"**
3. Selecione a tag criada (ex: `v2.4.2`)
4. Adicione título: `Release v2.4.2`
5. Escreva as **Release Notes**:
   - O que foi adicionado
   - O que foi corrigido
   - O que foi removido
   - Breaking changes (se houver)
6. Clique em **"Publish release"**

### Exemplo de Release Notes

```markdown
## v2.4.2 - 2025-11-24

### Adicionado
- Validação automática de campos obrigatórios em Dados Gerais
- Sistema de notificações em tempo real

### Corrigido
- Bug ao salvar empreendimento em modo de edição
- Loop infinito na página de Atividades

### Removido
- Campos de identificação desnecessários (tipo_pessoa, cnpj_cpf, razao_social, nome_fantasia)

### Alterado
- Localizações mockup alteradas de Santa Catarina para Rondônia
```

---

## Histórico de Versões Atuais

- **v2.4.1** (commit 6a8caf4): Remove identification fields, update mockup cities to Rondônia
- **v2.4.0** (commit 968122b): Fix enterprise save system, consolidate localStorage

---

## Boas Práticas

✅ **Sempre criar tag anotada** (`-a`) para releases oficiais  
✅ **Usar mensagem descritiva** na tag e no commit  
✅ **Atualizar package.json** antes de criar a tag  
✅ **Criar release no GitHub** para documentar mudanças  
✅ **Seguir Semantic Versioning** rigorosamente  

❌ **Não deletar tags** publicadas (cria confusão)  
❌ **Não reutilizar números** de versão  
❌ **Não criar tag** sem atualizar package.json  

---

## Comandos Rápidos (Cheat Sheet)

```powershell
# Workflow completo para nova versão
git add .
git commit -m "v2.5.0: Nova funcionalidade X"
git tag -a v2.5.0 -m "Release v2.5.0: Nova funcionalidade X"
git push origin main
git push origin v2.5.0

# Verificar tags
git tag -l

# Ver detalhes de uma tag
git show v2.5.0

# Checkout de uma versão específica
git checkout v2.4.1
```

---

## Dúvidas?

Consulte a documentação oficial do Git sobre tags:
- https://git-scm.com/book/en/v2/Git-Basics-Tagging


# 1. Atualizar versão no package.json (ex: 2.5.0 → 2.5.1 ou 2.6.0)
# 2. Commitar
git add .
git commit -m "v2.X.X: Descrição das mudanças"

# 3. Criar tag
git tag -a v2.X.X -m "Release v2.X.X: Descrição"

# 4. Push
git push origin feature/working-branch
git push origin v2.X.X

