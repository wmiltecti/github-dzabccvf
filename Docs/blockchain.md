# Como Usar o BlockchainUtils

## Importação

```typescript
import { sendToBlockchain } from '../lib/utils/BlockchainUtils';
```

## Uso Básico

```typescript
// 1. Prepare seus dados
const meusDados = {
  campo1: 'valor1',
  campo2: 'valor2',
  campo3: 123
};

// 2. Converta para JSON string
const jsonString = JSON.stringify(meusDados);

// 3. Envie para blockchain
const resultado = await sendToBlockchain(jsonString);

// 4. Trate o resultado
if (resultado.success) {
  console.log('Sucesso!', resultado.message);
  console.log('Hash:', resultado.hashBlock);
} else {
  console.error('Erro:', resultado.error);
}
```

## Exemplo em Componente React

```typescript
import React, { useState } from 'react';
import { sendToBlockchain } from '../lib/utils/BlockchainUtils';
import { toast } from 'react-toastify';

function MeuComponente() {
  const [loading, setLoading] = useState(false);

  const handleEnviar = async () => {
    setLoading(true);

    try {
      const dados = {
        nome: 'João',
        documento: '123.456.789-00',
        tipo: 'Pessoa Física'
      };

      const jsonString = JSON.stringify(dados);
      const resultado = await sendToBlockchain(jsonString);

      if (resultado.success) {
        toast.success(resultado.message);
      } else {
        toast.error(resultado.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleEnviar} disabled={loading}>
      {loading ? 'Enviando...' : 'Enviar para Blockchain'}
    </button>
  );
}
```

## Exemplo com ID de Processo

```typescript
// Se você tem um ID de processo, pode passar como segundo parâmetro
const processoId = 'PROC-123';
const resultado = await sendToBlockchain(jsonString, processoId);
```

## Exemplo em Formulário

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const formData = {
    empresa: 'Minha Empresa Ltda',
    cnpj: '12.345.678/0001-90',
    atividade: 'Mineração'
  };

  const jsonString = JSON.stringify(formData);
  const resultado = await sendToBlockchain(jsonString, 'PROC-456');

  if (resultado.success) {
    console.log('Registrado no blockchain!');
    console.log('Hash do bloco:', resultado.hashBlock);
    console.log('ID do bloco:', resultado.idBlock);
  } else {
    console.error('Falha ao registrar:', resultado.error);
  }
};
```

## Exemplo em Service/API

```typescript
// /src/services/MeuService.ts
import { sendToBlockchain } from '../lib/utils/BlockchainUtils';

export class MeuService {

  static async salvarERegistrar(dados: any) {
    // Salvar no banco de dados
    const registro = await minhaAPI.salvar(dados);

    // Registrar no blockchain
    const jsonString = JSON.stringify(dados);
    const blockchain = await sendToBlockchain(jsonString, registro.id);

    return {
      registro,
      blockchain
    };
  }
}
```

## O Que Você Recebe de Volta

```typescript
// Quando dá certo:
{
  success: true,
  message: "Dados registrados no blockchain",
  hashBlock: "a3f5c9e2b1d4f8a7...",
  idBlock: 12345,
  executed: true,
  error: null
}

// Quando dá erro:
{
  success: false,
  message: "",
  error: "Request failed with status code 404",
  hashBlock: undefined,
  idBlock: undefined,
  executed: undefined
}
```

## Passo a Passo Simples

1. **Importe a função**
   ```typescript
   import { sendToBlockchain } from '../lib/utils/BlockchainUtils';
   ```

2. **Prepare seus dados em objeto JavaScript**
   ```typescript
   const dados = { campo: 'valor' };
   ```

3. **Converta para string JSON**
   ```typescript
   const jsonString = JSON.stringify(dados);
   ```

4. **Chame a função**
   ```typescript
   const resultado = await sendToBlockchain(jsonString);
   ```

5. **Verifique o resultado**
   ```typescript
   if (resultado.success) {
     // Deu certo!
   } else {
     // Deu erro
   }
   ```

## Dicas Importantes

- Sempre use `JSON.stringify()` nos seus dados antes de enviar
- Sempre verifique `resultado.success` para saber se funcionou
- Use `resultado.error` para ver a mensagem de erro quando falhar
- Use estados de loading para melhor experiência do usuário
- O token de autenticação é adicionado automaticamente
