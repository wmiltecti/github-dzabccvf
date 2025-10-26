# Como Criar Usuário de Teste

## IMPORTANTE: Criar Usuário Manualmente

Como o sistema agora usa Supabase Authentication, você precisa criar um usuário de teste através do Supabase Dashboard.

## Passo a Passo

### 1. Acesse o Supabase Dashboard

Visite: https://supabase.com/dashboard

### 2. Selecione Seu Projeto

- Encontre o projeto: `jnhvlqytvssrbwjpolyq`
- Ou use o link direto: https://supabase.com/dashboard/project/jnhvlqytvssrbwjpolyq

### 3. Vá para Authentication

1. No menu lateral, clique em "Authentication"
2. Clique em "Users"

### 4. Adicione um Novo Usuário

1. Clique no botão "Add user" (ou "Invite user")
2. Selecione "Create new user"
3. Preencha:
   - **Email**: test@example.com (ou qualquer email)
   - **Password**: test123456 (ou qualquer senha)
4. **IMPORTANTE**: Marque a opção "Auto Confirm User" para não precisar confirmar o email
5. Clique em "Create user" ou "Send invitation"

### 5. Teste o Login

Agora você pode:

1. Acessar a página de login da aplicação
2. Usar o email e senha que você criou
3. Clicar em "Entrar"

## Credenciais Sugeridas

Para facilitar o teste, use:
- **Email**: test@example.com
- **Senha**: test123456

## Alternativa: API REST

Se preferir criar via API, você pode usar o Supabase Client:

```javascript
// No console do navegador (após abrir a aplicação):
const { supabase } = await import('./src/lib/supabase');

// Criar usuário
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'test123456',
  options: {
    data: {
      name: 'Test User'
    }
  }
});

console.log('User created:', data, error);
```

## Problemas Comuns

### "Email not confirmed"
- Certifique-se de marcar "Auto Confirm User" ao criar
- Ou desabilite confirmação de email nas configurações do projeto

### "Invalid login credentials"
- Verifique se digitou o email e senha corretamente
- Verifique se o usuário foi criado com sucesso

### "Sistema temporariamente indisponível"
- Verifique se as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão corretas no arquivo .env
- Reinicie o servidor de desenvolvimento

## Próximos Passos

Após criar o usuário e testar o login:

1. ✅ O login deve funcionar sem "Network Error"
2. ✅ Você será redirecionado para a Dashboard
3. ✅ A sessão será mantida entre refreshes
4. ✅ Você poderá fazer logout normalmente

Se desejar, posso criar uma página de signup para permitir que usuários se cadastrem diretamente pela aplicação.
