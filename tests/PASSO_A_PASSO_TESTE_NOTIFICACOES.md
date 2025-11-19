# 🧪 PASSO A PASSO - TESTE DO SISTEMA DE NOTIFICAÇÕES

---

## 🎯 TESTE 1: Visualizar Notificações na Página Dedicada

### Passo 1: Acessar a Página de Notificações
1. Faça login no sistema
2. No **menu lateral esquerdo**, clique em **"Notificações"** (ícone 🔔)
3. Você será direcionado para `/notificacoes`

### Passo 2: Verificar a Interface
Você deve ver:
- ✅ Título: **"Central de Notificações"**
- ✅ Subtítulo: "Gerencie suas notificações e mantenha-se atualizado"
- ✅ **3 abas**: Todas | Não lidas | Lidas
- ✅ Lista de notificações com cores diferentes:
  - 🔵 **Azul** = INFO
  - 🟢 **Verde** = SUCCESS  
  - 🟡 **Amarelo** = WARNING
  - 🔴 **Vermelho** = ERROR

### Passo 3: Testar as Abas
1. Clique na aba **"Todas"** - deve mostrar todas as notificações
2. Clique na aba **"Não lidas"** - mostra apenas não lidas (com badge "Nova")
3. Clique na aba **"Lidas"** - mostra apenas as já lidas (opacidade reduzida)

### ✅ Resultado Esperado
- As notificações aparecem com título, mensagem e tempo relativo ("há X minutos/horas")
- Contador aparece nas abas (exemplo: "Não lidas 3")

---

## 🎯 TESTE 2: Marcar Notificação como Lida

### Passo 1: Escolher uma Notificação Não Lida
1. Na aba **"Não lidas"**, escolha qualquer notificação
2. Observe o badge **"Nova"** no canto superior direito

### Passo 2: Marcar como Lida
1. Clique no botão **✓ "Marcar como lida"** 
2. Aguarde a ação processar

### ✅ Resultado Esperado
- A notificação **desaparece** da aba "Não lidas"
- O contador da aba "Não lidas" **diminui** em 1
- A notificação aparece na aba **"Lidas"** com opacidade reduzida
- O badge "Nova" desaparece

---

## 🎯 TESTE 3: Deletar Notificação

### Passo 1: Escolher uma Notificação
1. Em qualquer aba, escolha uma notificação

### Passo 2: Deletar
1. Clique no botão **🗑️ "Deletar"**
2. Aguarde a ação processar

### ✅ Resultado Esperado
- A notificação **desaparece imediatamente** da lista
- O contador total **diminui** em 1
- Se era não lida, o contador de não lidas também diminui

---

## 🎯 TESTE 4: Clicar na Notificação (Navegação)

### Passo 1: Clicar na Notificação
1. Clique em **qualquer lugar** da notificação (exceto nos botões de ação)

### ✅ Resultado Esperado
- A notificação é **marcada como lida automaticamente**
- O sistema **navega** para a URL de ação (se configurada)
- Exemplo: Se a notificação é sobre uma licença, vai para `/licencas/1`

---

## 🎯 TESTE 5: Sino de Notificações no Header (InscricaoLayout)

### Passo 1: Acessar Página com Header
1. No menu, clique em **"Solicitação de Processo"**
2. Você será direcionado para `/inscricao/participantes`

### Passo 2: Localizar o Sino
1. No **header superior direito**, procure o ícone 🔔
2. Se houver notificações não lidas, verá um **badge vermelho** com o número

### Passo 3: Abrir o Dropdown
1. Clique no **sino 🔔**
2. Um dropdown deve abrir mostrando:
   - **Últimas 5 notificações** não lidas
   - Botão **"Marcar todas como lidas"**
   - Botão **"Ver todas as notificações"**

### Passo 4: Testar "Marcar Todas como Lidas"
1. No dropdown, clique em **"Marcar todas como lidas"**

### ✅ Resultado Esperado
- O **badge vermelho desaparece**
- Todas as notificações ficam com opacidade reduzida
- O botão "Marcar todas como lidas" desaparece

### Passo 5: Testar "Ver Todas"
1. Clique em **"Ver todas as notificações"**

### ✅ Resultado Esperado
- Você é redirecionado para `/notificacoes`
- O dropdown fecha automaticamente

---

## 🎯 TESTE 6: Auto-Refresh (Polling)

### Passo 1: Manter a Página Aberta
1. Deixe a página de notificações aberta
2. Aguarde **30 segundos** (tempo do polling)

### Passo 2: Criar Nova Notificação (Simulação Backend)
**Opção A - Via Console do Navegador (Simulado):**
1. Abra o DevTools (F12) → Console
2. Digite:
```javascript
// Simular nova notificação (apenas para teste visual)
console.log('Nova notificação recebida! O polling vai atualizar em até 30s');
```

**Opção B - Via Backend (Real):**
- Peça ao desenvolvedor backend para criar uma notificação via API
- Ou execute novamente: `python tests/test_notifications.py`

### ✅ Resultado Esperado
- Após **até 30 segundos**, o **badge atualiza automaticamente**
- Os contadores nas abas atualizam
- Novas notificações aparecem na lista

---

## 🎯 TESTE 7: Paginação (se houver mais de 20 notificações)

### Pré-requisito
- Ter mais de 20 notificações no sistema

### Passo 1: Rolar até o Final
1. Role a página até o final da lista
2. Você verá botões de paginação:
   - **← Anterior**
   - **Página 1 de X**
   - **Próxima →**

### Passo 2: Navegar entre Páginas
1. Clique em **"Próxima →"**
2. A página deve carregar os próximos 20 itens

### ✅ Resultado Esperado
- A lista atualiza com novos itens
- O indicador de página muda (ex: "Página 2 de 3")
- O botão "Anterior" fica habilitado

---

## 🎯 TESTE 8: Estados de Erro

### Teste 8.1: Notificações Vazias
1. Delete todas as notificações
2. Vá para a aba "Todas"

### ✅ Resultado Esperado
- Aparece mensagem: **"Nenhuma notificação"**
- Ícone de sino laranja
- Texto: "Você não tem notificações ainda"

### Teste 8.2: Aba Específica Vazia
1. Marque todas como lidas
2. Vá para a aba "Não lidas"

### ✅ Resultado Esperado
- Mensagem: **"Nenhuma notificação não lida"**

---

## 🎯 TESTE 9: Cores por Severidade

Verifique se cada tipo de notificação tem a cor correta:

### INFO (Azul)
- Fundo: `bg-blue-100`
- Texto: `text-blue-800`
- Borda: `border-blue-300`
- Ícone: ℹ️

### SUCCESS (Verde)
- Fundo: `bg-green-100`
- Texto: `text-green-800`
- Borda: `border-green-300`
- Ícone: ✅

### WARNING (Amarelo)
- Fundo: `bg-yellow-100`
- Texto: `text-yellow-800`
- Borda: `border-yellow-300`
- Ícone: ⚠️

### ERROR (Vermelho)
- Fundo: `bg-red-100`
- Texto: `text-red-800`
- Borda: `border-red-300`
- Ícone: ❌

---

## 🎯 TESTE 10: Tempo Relativo

### Verificar Formatação de Data
1. Observe o tempo exibido em cada notificação
2. Deve aparecer em português:
   - "há 2 minutos"
   - "há 3 horas"
   - "há 1 dia"
   - "há 2 meses"

### ✅ Resultado Esperado
- Todas as datas em **formato relativo**
- Texto em **português**
- Atualiza quando a página recarrega

---

## 🎯 TESTE 11: Responsividade Mobile

### Passo 1: Redimensionar Janela
1. Pressione **F12** para abrir DevTools
2. Clique no ícone de **dispositivo móvel** (ou Ctrl+Shift+M)
3. Escolha um dispositivo: iPhone 12, Galaxy S20, etc.

### Passo 2: Testar Interface Mobile
1. Verifique se a página se ajusta corretamente
2. Os botões devem ser tocáveis (tamanho adequado)
3. As abas devem ficar responsivas

### ✅ Resultado Esperado
- Layout **mobile-first** funciona
- Botões com tamanho adequado para touch
- Texto legível sem zoom

---

## 📊 CHECKLIST FINAL DE TESTES

Use este checklist para validar todos os testes:

- [ ] ✅ Página de notificações carrega corretamente
- [ ] ✅ 3 abas funcionam (Todas/Não lidas/Lidas)
- [ ] ✅ Contadores aparecem nas abas
- [ ] ✅ Notificações têm cores corretas por severidade
- [ ] ✅ Badge "Nova" aparece em não lidas
- [ ] ✅ Botão "Marcar como lida" funciona
- [ ] ✅ Botão "Deletar" funciona
- [ ] ✅ Clicar na notificação marca como lida e navega
- [ ] ✅ Sino aparece no header do InscricaoLayout
- [ ] ✅ Badge vermelho aparece no sino com contador
- [ ] ✅ Dropdown do sino abre e fecha
- [ ] ✅ "Marcar todas como lidas" funciona
- [ ] ✅ "Ver todas" redireciona para /notificacoes
- [ ] ✅ Auto-refresh funciona (30 segundos)
- [ ] ✅ Paginação funciona (se houver +20 notificações)
- [ ] ✅ Estados vazios aparecem corretamente
- [ ] ✅ Tempo relativo em português funciona
- [ ] ✅ Responsividade mobile funciona
- [ ] ✅ Ícones corretos por severidade (ℹ️✅⚠️❌)

---

## 🐛 PROBLEMAS CONHECIDOS E SOLUÇÕES

### Problema: "Erro: Falha ao carregar notificações"
**Causa:** Backend não está respondendo ou não tem os endpoints implementados  
**Solução:** Verificar se o backend está rodando e tem os endpoints `/notifications` e `/notifications/stats`

### Problema: Sino não aparece no header
**Causa:** Usuário não está autenticado ou userId é null  
**Solução:** 
1. Fazer logout e login novamente
2. Verificar se `localStorage.getItem('auth_user')` tem o userId

### Problema: Badge não atualiza automaticamente
**Causa:** Polling não está funcionando ou foi desabilitado  
**Solução:** Recarregar a página (F5)

### Problema: Notificações não têm cores
**Causa:** Tailwind CSS não carregou ou classes não foram compiladas  
**Solução:** Limpar cache do Vite e recompilar

### Problema: Tempo não está em português
**Causa:** Biblioteca date-fns não foi instalada ou locale ptBR não foi importado  
**Solução:** `npm install date-fns` e verificar imports

---

## 📞 SUPORTE

Se encontrar bugs ou comportamentos inesperados:

1. **Abra o Console** (F12) e copie os erros
2. **Tire screenshots** da interface com problema
3. **Documente o passo a passo** para reproduzir
4. **Informe ao desenvolvedor** com todos os detalhes

---

## ✅ FIM DO TESTE

Após completar todos os testes, o sistema de notificações está validado e pronto para produção! 🎉

**Data do Teste:** ___/___/_____  
**Testador:** _____________________  
**Resultado:** ⭕ APROVADO | ❌ REPROVADO  
**Observações:** _____________________
