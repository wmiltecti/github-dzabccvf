# Documenta��o do BlockchainUtils

## Vis�o Geral

O `BlockchainUtils.ts` � um m�dulo utilit�rio respons�vel por gerenciar o envio de dados para a blockchain atrav�s da API FastAPI. Ele formata os dados do formul�rio e realiza a comunica��o HTTP com o endpoint de registro blockchain.

## Localiza��o

```
/src/lib/utils/BlockchainUtils.ts
```

---

## Arquivos e Depend�ncias

### 1. Depend�ncias Diretas

#### `http` (`/src/lib/api/http.ts`)
- **O que �**: Cliente Axios configurado para comunica��o com a API
- **Configura��es importantes**:
  - Base URL: `import.meta.env.VITE_API_BASE_URL` (ex: `https://fastapi-sandbox-ee3p.onrender.com`)
  - Timeout: 20 segundos
  - Interceptor de request: Adiciona automaticamente o token de autentica��o (`Bearer token`) do localStorage
  - Interceptor de response: Trata erros 401 (n�o autorizado) e remove token inv�lido

#### `BLOCKCHAIN_PARAMS` (`/src/lib/parameters.ts`)
- **O que �**: Par�metros de configura��o do blockchain
- **Valores**:
  - `idBlockchain`: 5 (identificador do blockchain na API)
  - `baseUrl`: URL base da API (mesma que o http client)

### 2. Depend�ncias Indiretas

#### Axios
- Biblioteca HTTP para fazer requisi��es
- Instalado via npm: `axios`

---

## Interfaces TypeScript

### `BlockchainField`
Define um campo personalizado que ser� enviado no payload:

```typescript
interface BlockchainField {
  NmField: string;   // Nome do campo
  DsValue: string;   // Valor/descri��o do campo
}
```

**Exemplo de uso**:
```typescript
{
  NmField: 'LicenciamentoAmbientalFormulario',
  DsValue: 'Formul�rio completo de Licenciamento Ambiental - Processo 123'
}
```

---

### `BlockchainPayload`
Estrutura do payload que ser� enviado para a API:

```typescript
interface BlockchainPayload {
  IdBlockchain: number;              // ID do blockchain (configurado em BLOCKCHAIN_PARAMS)
  Data: Record<string, any>;         // Dados do formul�rio em formato de objeto
  Fields: BlockchainField[];         // Array de campos adicionais
}
```

**Exemplo de payload completo**:
```json
{
  "IdBlockchain": 5,
  "Data": {
    "licenseType": "LP",
    "company": "Empresa Exemplo Ltda",
    "cnpj": "12.345.678/0001-90",
    "activity": "Minera��o",
    "location": "Rua Exemplo, 123"
  },
  "Fields": [
    {
      "NmField": "LicenciamentoAmbientalFormulario",
      "DsValue": "Formul�rio de Licenciamento Ambiental"
    }
  ]
}
```

---

### `BlockchainApiResponse`
Resposta retornada pela API do blockchain:

```typescript
interface BlockchainApiResponse {
  HashBlock: string | null;      // Hash �nico do bloco criado
  IdBlock: number | null;         // ID do bloco no blockchain
  Executed: boolean;              // Se a transa��o foi executada com sucesso
  ValidToken: boolean;            // Se o token de autentica��o � v�lido
  HTTPStatus: number;             // Status HTTP da requisi��o
  Message: string;                // Mensagem de status/erro
}
```

**Exemplo de resposta bem-sucedida**:
```json
{
  "HashBlock": "a3f5c9e2b1d4f8a7c6e9b2d5f8a1c4e7",
  "IdBlock": 12345,
  "Executed": true,
  "ValidToken": true,
  "HTTPStatus": 200,
  "Message": "Registro criado com sucesso"
}
```

---

### `BlockchainResponse`
Resposta normalizada retornada pelas fun��es do BlockchainUtils:

```typescript
interface BlockchainResponse {
  success: boolean;                           // Se a opera��o foi bem-sucedida
  message: string;                            // Mensagem para o usu�rio
  blockchain_response?: BlockchainApiResponse; // Resposta completa da API
  error: string | null;                       // Mensagem de erro (se houver)
  hashBlock?: string;                         // Hash do bloco (atalho)
  idBlock?: number;                           // ID do bloco (atalho)
  executed?: boolean;                         // Status de execu��o (atalho)
}
```

**Exemplo de sucesso**:
```json
{
  "success": true,
  "message": "Dados registrados no blockchain",
  "blockchain_response": { ... },
  "error": null,
  "hashBlock": "a3f5c9e2b1d4f8a7c6e9b2d5f8a1c4e7",
  "idBlock": 12345,
  "executed": true
}
```

**Exemplo de erro**:
```json
{
  "success": false,
  "message": "",
  "error": "Request failed with status code 404"
}
```

---

## Fun��es Exportadas

### 1. `formatPayload()`

#### Assinatura
```typescript
function formatPayload(
  formDataJsonString: string,
  processoId?: string
): BlockchainPayload
```

#### Descri��o
Converte uma string JSON contendo os dados do formul�rio em um objeto `BlockchainPayload` formatado corretamente para envio � API blockchain.

#### Par�metros
- **formDataJsonString** (obrigat�rio): String JSON contendo os dados do formul�rio
- **processoId** (opcional): ID do processo (usado para criar uma descri��o mais detalhada)

#### Retorno
Objeto `BlockchainPayload` pronto para ser enviado � API.

#### Processo Passo a Passo

1. **Parse do JSON**
   - Converte a string JSON em objeto JavaScript
   - Se falhar, lan�a erro: `"Invalid JSON string provided to formatPayload"`

2. **Gera��o da Descri��o**
   - Se `processoId` fornecido: `"Formul�rio completo de Licenciamento Ambiental - Processo {processoId}"`
   - Sem `processoId`: `"Formul�rio de Licenciamento Ambiental"`

3. **Montagem do Payload**
   - Define `IdBlockchain` a partir de `BLOCKCHAIN_PARAMS.idBlockchain` (valor: 5)
   - Inclui os dados do formul�rio no campo `Data`
   - Adiciona um campo em `Fields` com a descri��o gerada

4. **Logging**
   - Registra todo o processo no console para facilitar debug

#### Exemplo de Uso

```typescript
import { formatPayload } from '../lib/utils/BlockchainUtils';

const formData = {
  licenseType: 'LP',
  company: 'Empresa Exemplo',
  cnpj: '12.345.678/0001-90'
};

const jsonString = JSON.stringify(formData);
const payload = formatPayload(jsonString, 'PROC-123');

console.log(payload);
// {
//   IdBlockchain: 5,
//   Data: { licenseType: 'LP', company: 'Empresa Exemplo', cnpj: '12.345.678/0001-90' },
//   Fields: [
//     {
//       NmField: 'LicenciamentoAmbientalFormulario',
//       DsValue: 'Formul�rio completo de Licenciamento Ambiental - Processo PROC-123'
//     }
//   ]
// }
```

---

### 2. `sendToBlockchain()`

#### Assinatura
```typescript
async function sendToBlockchain(
  formDataJsonString: string,
  processoId?: string
): Promise<BlockchainResponse>
```

#### Descri��o
Fun��o principal que formata e envia dados para o blockchain atrav�s da API. Gerencia todo o ciclo de vida da requisi��o, incluindo tratamento de erros e normaliza��o da resposta.

#### Par�metros
- **formDataJsonString** (obrigat�rio): String JSON contendo os dados do formul�rio
- **processoId** (opcional): ID do processo associado

#### Retorno
Promise que resolve em um objeto `BlockchainResponse`.

#### Processo Passo a Passo

##### Fluxo de Sucesso

1. **Formata��o do Payload**
   - Chama `formatPayload()` para converter os dados em formato aceito pela API

2. **Requisi��o HTTP**
   - M�todo: `POST`
   - Endpoint: `/api/v1/blockchain/register`
   - Headers: Automaticamente inclu�dos pelo interceptor do http client
     - `Content-Type: application/json`
     - `Authorization: Bearer {token}` (se dispon�vel no localStorage)
   - Body: Payload formatado

3. **Processamento da Resposta**
   - Extrai `blockchain_response` da resposta da API
   - Verifica se � duplicata (mensagem cont�m "j� foi registrado")
   - Ajusta a mensagem se for duplicata

4. **Montagem do Resultado**
   - Cria objeto `BlockchainResponse` com:
     - Status de sucesso
     - Mensagem formatada
     - Dados completos da blockchain
     - Atalhos para hash, idBlock e executed

##### Fluxo de Erro

1. **Captura do Erro**
   - Try/catch envolve toda a opera��o

2. **An�lise do Erro**
   - **error.response**: Servidor respondeu com erro (ex: 404, 500)
     - Registra status, headers e dados do erro
   - **error.request**: Requisi��o enviada mas sem resposta (ex: timeout, rede)
   - **Outro erro**: Problema ao configurar a requisi��o

3. **Retorno de Erro**
   - Cria objeto `BlockchainResponse` com:
     - `success: false`
     - `message: ''` (vazio)
     - `error`: Mensagem do erro

4. **Logging Extensivo**
   - Registra todo o contexto do erro no console
   - Facilita debugging em produ��o

#### Exemplo de Uso

```typescript
import { sendToBlockchain } from '../lib/utils/BlockchainUtils';
import { toast } from 'react-toastify';

async function handleSubmit() {
  const formData = {
    licenseType: 'LP',
    company: 'Minera��o S�o Paulo Ltda',
    cnpj: '12.345.678/0001-90',
    activity: 'Extra��o de areia'
  };

  const jsonString = JSON.stringify(formData);

  try {
    const result = await sendToBlockchain(jsonString, 'PROC-456');

    if (result.success) {
      // Sucesso
      toast.success(result.message);
      console.log('Hash do bloco:', result.hashBlock);
      console.log('ID do bloco:', result.idBlock);
    } else {
      // Erro
      toast.error(result.error || 'Erro ao registrar no blockchain');
    }
  } catch (error) {
    // Erro inesperado (n�o deve acontecer, pois sendToBlockchain trata erros)
    console.error('Erro inesperado:', error);
  }
}
```

---

## Como Utilizar em Outras Partes do C�digo

### 1. Importa��o B�sica

```typescript
import { sendToBlockchain } from '@/lib/utils/BlockchainUtils';
```

### 2. Uso Simples

```typescript
// Em qualquer componente ou servi�o
async function salvarDados(dados: any) {
  const jsonString = JSON.stringify(dados);
  const resultado = await sendToBlockchain(jsonString);

  if (resultado.success) {
    console.log(' Registrado com sucesso!');
  } else {
    console.error('L Erro:', resultado.error);
  }
}
```

### 3. Integra��o com React Component

```typescript
import React, { useState } from 'react';
import { sendToBlockchain } from '@/lib/utils/BlockchainUtils';
import { toast } from 'react-toastify';

function MeuFormulario() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    documento: '',
    tipo: 'LP'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const jsonString = JSON.stringify(formData);
      const result = await sendToBlockchain(jsonString);

      if (result.success) {
        toast.success(`${result.message} (Hash: ${result.hashBlock?.substring(0, 8)}...)`);
        // Resetar formul�rio ou redirecionar
      } else {
        toast.error(result.error || 'Erro ao enviar para blockchain');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos do formul�rio */}
      <button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar para Blockchain'}
      </button>
    </form>
  );
}
```

### 4. Uso com Feedback Visual Detalhado

```typescript
import { sendToBlockchain, BlockchainResponse } from '@/lib/utils/BlockchainUtils';

async function registrarComFeedback(dados: any, processoId?: string) {
  console.log('=� Iniciando envio para blockchain...');

  const jsonString = JSON.stringify(dados);
  const result: BlockchainResponse = await sendToBlockchain(jsonString, processoId);

  if (result.success) {
    console.log(' SUCESSO!');
    console.log('   Hash do Bloco:', result.hashBlock);
    console.log('   ID do Bloco:', result.idBlock);
    console.log('   Executado:', result.executed);

    // Resposta completa da API
    if (result.blockchain_response) {
      console.log('   Status HTTP:', result.blockchain_response.HTTPStatus);
      console.log('   Token v�lido:', result.blockchain_response.ValidToken);
      console.log('   Mensagem API:', result.blockchain_response.Message);
    }

    return result;
  } else {
    console.error('L ERRO!');
    console.error('   Mensagem:', result.error);

    // Exibir notifica��o de erro ao usu�rio
    alert(`Erro: ${result.error}`);

    return null;
  }
}
```

### 5. Uso em Servi�o/Classe

```typescript
// /src/services/LicenciamentoService.ts
import { sendToBlockchain, BlockchainResponse } from '@/lib/utils/BlockchainUtils';

export class LicenciamentoService {

  static async salvarLicenciamento(dados: any, processoId: string): Promise<BlockchainResponse> {
    // Valida��es
    if (!dados.company || !dados.cnpj) {
      throw new Error('Dados obrigat�rios n�o fornecidos');
    }

    // Preparar dados
    const dadosCompletos = {
      ...dados,
      timestamp: new Date().toISOString(),
      versao: '1.0'
    };

    // Enviar para blockchain
    const jsonString = JSON.stringify(dadosCompletos);
    return await sendToBlockchain(jsonString, processoId);
  }

  static async verificarRegistro(hashBlock: string) {
    // Implementar l�gica de verifica��o
    console.log('Verificando registro:', hashBlock);
  }
}
```

---

## Configura��o Necess�ria

### 1. Vari�veis de Ambiente

Certifique-se de que o arquivo `.env` cont�m:

```bash
VITE_API_BASE_URL=https://fastapi-sandbox-ee3p.onrender.com
```

### 2. Autentica��o

O token de autentica��o deve estar armazenado no localStorage com a chave `auth_token`:

```typescript
// Exemplo de como o token � armazenado ap�s login
localStorage.setItem('auth_token', 'seu-token-jwt-aqui');
```

O interceptor do http client adiciona automaticamente o token em todas as requisi��es:

```typescript
// Isso acontece automaticamente no http.ts
Authorization: `Bearer {token}`
```

### 3. Tratamento de Toast (Opcional)

Se quiser exibir notifica��es ao usu�rio, certifique-se de ter o react-toastify configurado:

```typescript
// No App.tsx ou arquivo principal
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <ToastContainer />
      {/* Resto da aplica��o */}
    </>
  );
}
```

---

## Logs e Debugging

O `BlockchainUtils` possui logging extensivo para facilitar o debug:

### Console Logs de Sucesso

```
=� [sendToBlockchain] ========== IN�CIO DO PROCESSO ==========
=� [sendToBlockchain] Recebido formDataJsonString: {...}
=� [sendToBlockchain] Recebido processoId: PROC-123
=� [sendToBlockchain] Chamando formatPayload...
=' [formatPayload] Iniciando formata��o do payload
=' [formatPayload] formDataJsonString recebido: {...}
=' [formatPayload] Parse bem-sucedido. FormData: {...}
=' [formatPayload] Descri��o gerada: Formul�rio completo...
=' [formatPayload] Payload completo montado: {...}
=� [sendToBlockchain] Payload formatado com sucesso
< [sendToBlockchain] Preparando requisi��o HTTP POST para /api/v1/blockchain/register
� [sendToBlockchain] Enviando requisi��o...
 [sendToBlockchain] Resposta recebida do servidor
 [sendToBlockchain] Status HTTP: 200
= [sendToBlockchain] Extraindo blockchain_response...
= [sendToBlockchain] Verificando se � duplicata...
=� [sendToBlockchain] Objeto de retorno montado: {...}
<� [sendToBlockchain] ========== PROCESSO CONCLU�DO COM SUCESSO ==========
```

### Console Logs de Erro

```
=� [sendToBlockchain] ========== ERRO NO PROCESSO ==========
=� [sendToBlockchain] Tipo do erro: Error
=� [sendToBlockchain] Mensagem do erro: Request failed with status code 404
=� [sendToBlockchain] Stack trace: ...
=� [sendToBlockchain] Resposta de erro do servidor:
=� [sendToBlockchain] Status HTTP: 404
=� [sendToBlockchain] Dados: {...}
=� [sendToBlockchain] Objeto de erro que ser� retornado: {...}
=� [sendToBlockchain] ========== FIM DO ERRO ==========
```

---

## Tratamento de Erros Comuns

### Erro 404 - Rota n�o encontrada
```
Request failed with status code 404
```
**Solu��o**: Verifique se a rota `/api/v1/blockchain/register` est� correta e se a API est� rodando.

### Erro 401 - N�o autorizado
```
Request failed with status code 401
```
**Solu��o**: Verifique se o token de autentica��o est� presente e v�lido no localStorage.

### Timeout
```
timeout of 20000ms exceeded
```
**Solu��o**: A API n�o respondeu em 20 segundos. Verifique a conex�o ou aumente o timeout em `/src/lib/api/http.ts`.

### JSON Inv�lido
```
Invalid JSON string provided to formatPayload
```
**Solu��o**: Certifique-se de passar uma string JSON v�lida para `sendToBlockchain()`.

---

## Fluxo Completo de Dados

```
                     
  Componente React   
  (NewProcessModal)  
          ,          
           
            1. Coleta dados do formul�rio
            2. JSON.stringify(dados)
           �
                     
  sendToBlockchain() 
          ,          
           
            3. formatPayload()
           �
                     
   formatPayload()   
  - Parse JSON       
  - Adiciona IdBlock 
  - Adiciona Fields  
          ,          
           
            4. Payload formatado
           �
                     
   HTTP Client       
  (axios)            
  + Interceptors     
          ,          
           
            5. POST /api/v1/blockchain/register
               + Authorization Bearer token
           �
                     
   API FastAPI       
  (Backend)          
          ,          
           
            6. Resposta com HashBlock, IdBlock, etc
           �
                     
  sendToBlockchain() 
  - Trata resposta   
  - Normaliza dados  
          ,          
           
            7. BlockchainResponse
           �
                     
  Componente React   
  - Exibe toast      
  - Atualiza UI      
                     
```

---

## Exemplo Pr�tico: NewProcessModal

Veja como o `NewProcessModal.tsx` utiliza o BlockchainUtils:

```typescript
// 1. Importa��o
import { sendToBlockchain } from '../lib/utils/BlockchainUtils';

// 2. Dentro do componente
const handleSaveProcess = async () => {
  try {
    // 3. Criar o processo primeiro (se necess�rio)
    const createdProcess = await onSubmit(formData);

    // 4. Preparar dados para blockchain
    const blockchainData = {
      ...formData,
      processId: createdProcess?.id,
      documents: formData.documents.map(f => f.name).join(', ')
    };

    // 5. Converter para JSON string
    const jsonString = JSON.stringify(blockchainData);

    // 6. Enviar para blockchain
    const blockchainResult = await sendToBlockchain(jsonString, createdProcess?.id);

    // 7. Tratar resultado
    if (blockchainResult.success) {
      const message = blockchainResult.message || 'Dados registrados no blockchain';
      const details = blockchainResult.hashBlock
        ? ` (Hash: ${blockchainResult.hashBlock.substring(0, 8)}...)`
        : '';

      toast.success(message + details);
    } else {
      toast.error(blockchainResult.error || 'Erro ao registrar no blockchain');
    }

  } catch (error) {
    console.error('Erro ao criar processo:', error);
    toast.error('Erro ao criar processo');
  }
};
```

---

## Melhores Pr�ticas

### 1. Sempre Use JSON.stringify()
```typescript
//  Correto
const jsonString = JSON.stringify(dados);
await sendToBlockchain(jsonString);

// L Errado
await sendToBlockchain(dados); // Vai causar erro no parse
```

### 2. Trate Erros Apropriadamente
```typescript
const result = await sendToBlockchain(jsonString);

if (result.success) {
  // Sucesso - exibir mensagem positiva
  toast.success(result.message);
} else {
  // Erro - exibir mensagem de erro
  toast.error(result.error || 'Erro desconhecido');
}
```

### 3. Use o ProcessoId Quando Dispon�vel
```typescript
//  Com processoId - gera descri��o mais detalhada
await sendToBlockchain(jsonString, 'PROC-123');

//  Sem processoId - ainda funciona
await sendToBlockchain(jsonString);
```

### 4. Valide Dados Antes de Enviar
```typescript
if (!formData.company || !formData.cnpj) {
  toast.error('Preencha os campos obrigat�rios');
  return;
}

const jsonString = JSON.stringify(formData);
await sendToBlockchain(jsonString);
```

### 5. Use Loading States
```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);

  try {
    const result = await sendToBlockchain(jsonString);
    // Tratar resultado
  } finally {
    setLoading(false);
  }
};
```

---

## Conclus�o

O `BlockchainUtils.ts` � uma ferramenta robusta e f�cil de usar para integrar funcionalidades de blockchain na aplica��o. Com logging extensivo, tratamento de erros completo e interfaces TypeScript bem definidas, ele garante uma experi�ncia de desenvolvimento consistente e confi�vel.

Para usar em qualquer parte do c�digo, basta:
1. Importar `sendToBlockchain`
2. Converter seus dados em JSON string
3. Chamar a fun��o e tratar o resultado

O m�dulo cuida de toda a complexidade de formata��o, autentica��o, comunica��o HTTP e tratamento de erros.
