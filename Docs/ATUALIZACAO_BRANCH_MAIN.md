# Como aplicar seu trabalho de uma branch de desenvolvimento na branch principal (main)

Este guia descreve o procedimento recomendado para atualizar a branch principal (`main`) com os trabalhos realizados em uma branch de desenvolvimento (ex: `devmal`).

## Passos

1. **Atualize sua branch local main**
   ```sh
   git checkout main
   git pull origin main
   ```
   Isso garante que você está com a versão mais recente da branch principal.

2. **Volte para sua branch de trabalho**
   ```sh
   git checkout devmal
   ```

3. **Atualize sua branch de trabalho com as mudanças da main**
   O método recomendado é o `rebase`, pois mantém o histórico linear:
   ```sh
   git rebase main
   ```
   Se houver conflitos, resolva-os, depois continue o rebase:
   ```sh
   git add .
   git rebase --continue
   ```

4. **Teste o projeto**
   Garanta que tudo está funcionando corretamente após o rebase.

5. **Faça o merge da sua branch na main**
   ```sh
   git checkout main
   git merge devmal
   ```

6. **Envie para o repositório remoto**
   ```sh
   git push origin main
   ```

> **Dica:** Se preferir, você pode abrir um Pull Request no GitHub para revisão antes do merge.

---

**Resumo do fluxo:**
- Sempre atualize sua main local antes de integrar.
- Use `rebase` para evitar históricos confusos.
- Resolva conflitos com atenção.
- Teste antes de finalizar.
- Faça o merge e o push para a main.

Se precisar de mais detalhes ou exemplos, consulte este README ou peça ajuda ao time!
