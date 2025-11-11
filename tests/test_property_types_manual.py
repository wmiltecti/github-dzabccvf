# Teste Manual - Diagnóstico de Cadastro de Tipos de Imóvel
# Verifica conexão com Supabase e testa inserção direta

import os
from datetime import datetime

print("="*70)
print("🧪 DIAGNÓSTICO: Cadastro de Tipos de Imóvel")
print("="*70)

# Instruções para teste manual
print("\n📋 INSTRUÇÕES PARA TESTE MANUAL:")
print("-" * 70)
print("""
1. Abra o navegador em: http://localhost:5174
2. Faça login com suas credenciais
3. Vá em: Administração → Tipos de Imóvel
4. Clique em: + Novo
5. Preencha:
   - Nome: Tipo Teste Manual
   - Descrição: Teste de cadastro
6. Clique em: Salvar
7. Abra o Console do navegador (F12 → Console)

8. PROCURE PELOS LOGS:
   ┌─────────────────────────────────────────────┐
   │ 🔍 GenericForm handleSubmit - tableName:    │
   │    property_types                           │
   │                                              │
   │ 🔍 GenericForm handleSubmit - formData:     │
   │    {name: "...", description: "..."}        │
   │                                              │
   │ ➕ Inserting new item                       │
   │ ➕ Insert data: {...}                       │
   └─────────────────────────────────────────────┘

9. SE DER SUCESSO, verá:
   ✅ Item created successfully: {...}
   
10. SE DER ERRO, verá:
   ❌ Insert error: {...}
   
11. COPIE E COLE AQUI os logs que aparecerem!
""")
print("-" * 70)

print("\n🔍 POSSÍVEIS CAUSAS DE ERRO:")
print("-" * 70)
print("""
A. ERRO: "new row violates row-level security policy"
   → Problema: RLS (Row Level Security) do Supabase bloqueando
   → Solução: Verificar policies na tabela property_types

B. ERRO: "null value in column ... violates not-null constraint"
   → Problema: Campo obrigatório não está sendo enviado
   → Solução: Verificar quais campos são required

C. ERRO: "permission denied for table property_types"
   → Problema: Usuário não tem permissão
   → Solução: Verificar role do usuário no Supabase

D. Item salvo MAS lista não atualiza
   → Problema: Função onSave() não está chamando refresh
   → Solução: Verificar callback no GenericForm

E. Modal não abre
   → Problema: Estado do formulário
   → Solução: Verificar AdminDashboard

F. Nenhum log aparece
   → Problema: Formulário não está sendo submetido
   → Solução: Verificar se botão Salvar tem type="submit"
""")
print("-" * 70)

print("\n💡 PARA TESTAR CONEXÃO SUPABASE:")
print("-" * 70)
print("""
No Console do navegador, execute:

// Teste 1: Listar tipos existentes
const { data, error } = await window.supabase
  .from('property_types')
  .select('*');
console.log('Tipos existentes:', data, error);

// Teste 2: Tentar inserir
const { data: newData, error: newError } = await window.supabase
  .from('property_types')
  .insert({ name: 'Teste Console', description: 'Teste direto' })
  .select()
  .single();
console.log('Inserção:', newData, newError);
""")
print("-" * 70)

print("\n📝 APÓS TESTAR, ME INFORME:")
print("""
1. Os logs que apareceram no console
2. Se deu erro, qual foi a mensagem exata
3. Se salvou, mas não apareceu na lista
4. Resultado dos testes do Supabase (se fez)
""")

print("\n" + "="*70)
print("⏳ Aguardando você fazer o teste manual...")
print("="*70)
