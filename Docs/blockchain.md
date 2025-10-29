# Documentação do BlockchainUtils

## Visão Geral

O `BlockchainUtils.ts` é um módulo utilitário responsável por gerenciar o envio de dados para a blockchain através da API FastAPI. Ele formata os dados do formulário e realiza a comunicação HTTP com o endpoint de registro blockchain.

## Localização

```
/src/lib/utils/BlockchainUtils.ts
```

---

## Arquivos e Dependências

### 1. Dependências Diretas

#### `http` (`/src/lib/api/http.ts`)
- **O que é**: Cliente Axios configurado para comunicação com a API
- **Configurações importantes**:
  - Base URL: `import.meta.env.VITE_API_BASE_URL` (ex: `https://fastapi-sandbox-ee3p.onrender.com`)
  - Timeout: 20 segundos
  - Interceptor de request: Adiciona automaticamente o token de autenticação (`Bearer token`) do localStorage
  - Interceptor de response: Trata erros 401 (não autorizado) e remove token inválido

#### `BLOCKCHAIN_PARAMS` (`/src/lib/parameters.ts`)
- **O que é**: Parâmetros de configuração do blockchain
- **Valores**:
  - `idBlockchain`: 5 (identificador do blockchain na API)
  - `baseUrl`: URL base da API (mesma que o http client)

### 2. Dependências Indiretas

#### Axios
- Biblioteca HTTP para fazer requisições
- Instalado via npm: `axios`

---

## Interfaces TypeScript

### `BlockchainField`
Define um campo personalizado que será enviado no payload:

```typescript
interface BlockchainField {
  NmField: string;   // Nome do campo
  DsValue: string;   // Valor/descrição do campo
}
```

**Exemplo de uso**:
```typescript
{
  NmField: 'LicenciamentoAmbientalFormulario',
  DsValue: 'Formulário completo de Licenciamento Ambiental - Processo 123'
}
```

---

### `BlockchainPayload`
Estrutura do payload que será enviado para a API:

```typescript
interface BlockchainPayload {
  IdBlockchain: number;              // ID do blockchain (configurado em BLOCKCHAIN_PARAMS)
  Data: Record<string, any>;         // Dados do formulário em formato de objeto
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
    "activity": "Mineração",
    "location": "Rua Exemplo, 123"
  },
  "Fields": [
    {
      "NmField": "LicenciamentoAmbientalFormulario",
      "DsValue": "Formulário de Licenciamento Ambiental"
    }
  ]
}
```

---

### `BlockchainApiResponse`
Resposta retornada pela API do blockchain:

```typescript
interface BlockchainApiResponse {
  HashBlock: string | null;      // Hash único do bloco criado
  IdBlock: number | null;         // ID do bloco no blockchain
  Executed: boolean;              // Se a transação foi executada com sucesso
  ValidToken: boolean;            // Se o token de autenticação é válido
  HTTPStatus: number;             // Status HTTP da requisição
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
Resposta normalizada retornada pelas funções do BlockchainUtils:

```typescript
interface BlockchainResponse {
  success: boolean;                           // Se a operação foi bem-sucedida
  message: string;                            // Mensagem para o usuário
  blockchain_response?: BlockchainApiResponse; // Resposta completa da API
  error: string | null;                       // Mensagem de erro (se houver)
  hashBlock?: string;                         // Hash do bloco (atalho)
  idBlock?: number;                           // ID do bloco (atalho)
  executed?: boolean;                         // Status de execução (atalho)
}
```

**Exemplo de sucesso**:
```json
{
  "success": true,
  "message": "Dados registrados no blockchain",
  "blockchain_response": { "HashBlock": "...", "IdBlock": 12345, "Executed": true },
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

## Funções Exportadas

### 1. `formatPayload()`

#### Assinatura
```typescript
function formatPayload(
  formDataJsonString: string,
  processoId?: string
): BlockchainPayload
```

#### Descrição
Converte uma string JSON contendo os dados do formulário em um objeto `BlockchainPayload` formatado corretamente para envio à API blockchain.

#### Parâmetros
- **formDataJsonString** (obrigatório): String JSON contendo os dados do formulário
- **processoId** (opcional): ID do processo (usado para criar uma descrição mais detalhada)

#### Retorno
Objeto `BlockchainPayload` pronto para ser enviado à API.

#### Processo Passo a Passo

1. **Parse do JSON**
   - Converte a string JSON em objeto JavaScript
   - Se falhar, lança erro: `"Invalid JSON string provided to formatPayload"`

2. **Geração da Descrição**
   - Se `processoId` fornecido: `"Formulário completo de Licenciamento Ambiental - Processo {processoId}"`
   - Sem `processoId`: `"Formulário de Licenciamento Ambiental"`

3. **Montagem do Payload**
   - Define `IdBlockchain` a partir de `BLOCKCHAIN_PARAMS.idBlockchain` (valor: 5)
   - Inclui os dados do formulário no campo `Data`
   - Adiciona um campo em `Fields` com a descrição gerada

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
// Resultado:
// {
//   IdBlockchain: 5,
//   Data: { licenseType: 'LP', company: 'Empresa Exemplo', cnpj: '12.345.678/0001-90' },
//   Fields: [
//     {
//       NmField: 'LicenciamentoAmbientalFormulario',
//       DsValue: 'Formulário completo de Licenciamento Ambiental - Processo PROC-123'
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

#### Descrição
Função principal que formata e envia dados para o blockchain através da API. Gerencia todo o ciclo de vida da requisição, incluindo tratamento de erros e normalização da resposta.

#### Parâmetros
- **formDataJsonString** (obrigatório): String JSON contendo os dados do formulário
- **processoId** (opcional): ID do processo associado

#### Retorno
Promise que resolve em um objeto `BlockchainResponse`.

#### Processo Passo a Passo

##### Fluxo de Sucesso

1. **Formatação do Payload**
   - Chama `formatPayload()` para converter os dados em formato aceito pela API

2. **Requisição HTTP**
   - Método: `POST`
   - Endpoint: `/api/v1/blockchain/register`
   - Headers: Automaticamente incluídos pelo interceptor do http client
     - `Content-Type: application/json`
     - `Authorization: Bearer {token}` (se disponível no localStorage)
   - Body: Payload formatado

3. **Processamento da Resposta**
   - Extrai `blockchain_response` da resposta da API
   - Verifica se é duplicata (mensagem contém "já foi registrado")
   - Ajusta a mensagem se for duplicata

4. **Montagem do Resultado**
   - Cria objeto `BlockchainResponse` com:
     - Status de sucesso
     - Mensagem formatada
     - Dados completos da blockchain
     - Atalhos para hash, idBlock e executed

##### Fluxo de Erro

1. **Captura do Erro**
   - Try/catch envolve toda a operação

2. **Análise do Erro**
   - **error.response**: Servidor respondeu com erro (ex: 404, 500)
     - Registra status, headers e dados do erro
   - **error.request**: Requisição enviada mas sem resposta (ex: timeout, rede)
   - **Outro erro**: Problema ao configurar a requisição

3. **Retorno de Erro**
   - Cria objeto `BlockchainResponse` com:
     - `success: false`
     - `message: ''` (vazio)
     - `error`: Mensagem do erro

4. **Logging Extensivo**
   - Registra todo o contexto do erro no console
   - Facilita debugging em produção

#### Exemplo de Uso

```typescript
import { sendToBlockchain } from '../lib/utils/BlockchainUtils';
import { toast } from 'react-toastify';

async function handleSubmit() {
  const formData = {
    licenseType: 'LP',
    company: 'Mineração São Paulo Ltda',
    cnpj: '12.345.678/0001-90',
    activity: 'Extração de areia'
  };

  const jsonString = JSON.stringify(formData);

  try {
    const result = await sendToBlockchain(jsonString, 'PROC-456');

    if (result.success) {
      toast.success(result.message);
      console.log('Hash do bloco:', result.hashBlock);
      console.log('ID do bloco:', result.idBlock);
    } else {
      toast.error(result.error || 'Erro ao registrar no blockchain');
    }
  } catch (error) {
    console.error('Erro inesperado:', error);
  }
}
```

---

## Como Utilizar em Outras Partes do Código

### 1. Importação Básica

```typescript
import { sendToBlockchain } from '@/lib/utils/BlockchainUtils';
```

### 2. Uso Simples

```typescript
// Em qualquer componente ou serviço
async function salvarDados(dados: any) {
  const jsonString = JSON.stringify(dados);
  const resultado = await sendToBlockchain(jsonString);

  if (resultado.success) {
    console.log('Registrado com sucesso!');
  } else {
    console.error('Erro:', resultado.error);
  }
}
```

### 3. Integração com React Component

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
        // Resetar formulário ou redirecionar
      } else {
        toast.error(result.error || 'Erro ao enviar para blockchain');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos do formulário */}
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
  console.log('Iniciando envio para blockchain...');

  const jsonString = JSON.stringify(dados);
  const result: BlockchainResponse = await sendToBlockchain(jsonString, processoId);

  if (result.success) {
    console.log('SUCESSO!');
    console.log('   Hash do Bloco:', result.hashBlock);
    console.log('   ID do Bloco:', result.idBlock);
    console.log('   Executado:', result.executed);

    // Resposta completa da API
    if (result.blockchain_response) {
      console.log('   Status HTTP:', result.blockchain_response.HTTPStatus);
      console.log('   Token válido:', result.blockchain_response.ValidToken);
      console.log('   Mensagem API:', result.blockchain_response.Message);
    }

    return result;
  } else {
    console.error('ERRO!');
    console.error('   Mensagem:', result.error);
    alert(`Erro: ${result.error}`);
    return null;
  }
}
```

### 5. Uso em Serviço/Classe

```typescript
// /src/services/LicenciamentoService.ts
import { sendToBlockchain, BlockchainResponse } from '@/lib/utils/BlockchainUtils';

export class LicenciamentoService {

  static async salvarLicenciamento(dados: any, processoId: string): Promise<BlockchainResponse> {
    // Validações
    if (!dados.company || !dados.cnpj) {
      throw new Error('Dados obrigatórios não fornecidos');
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
    // Implementar lógica de verificação
    console.log('Verificando registro:', hashBlock);
  }
}
```

---

## Configuração Necessária

### 1. Variáveis de Ambiente

Certifique-se de que o arquivo `.env` contém:

```bash
VITE_API_BASE_URL=https://fastapi-sandbox-ee3p.onrender.com
```

### 2. Autenticação

O token de autenticação deve estar armazenado no localStorage com a chave `auth_token`:

```typescript
// Exemplo de como o token é armazenado após login
localStorage.setItem('auth_token', 'seu-token-jwt-aqui');
```

O interceptor do http client adiciona automaticamente o token em todas as requisições:

```typescript
// Isso acontece automaticamente no http.ts
Authorization: `Bearer {token}`
```

### 3. Tratamento de Toast (Opcional)

Se quiser exibir notificações ao usuário, certifique-se de ter o react-toastify configurado:

```typescript
// No App.tsx ou arquivo principal
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <ToastContainer />
      {/* Resto da aplicação */}
    </>
  );
}
```

---

## Logs e Debugging

O `BlockchainUtils` possui logging extensivo para facilitar o debug:

### Console Logs de Sucesso

```
[sendToBlockchain] ========== INÍCIO DO PROCESSO ==========
[sendToBlockchain] Recebido formDataJsonString: {...}
[sendToBlockchain] Recebido processoId: PROC-123
[sendToBlockchain] Chamando formatPayload...
[formatPayload] Iniciando formatação do payload
[formatPayload] formDataJsonString recebido: {...}
[formatPayload] Parse bem-sucedido. FormData: {...}
[formatPayload] Descrição gerada: Formulário completo...
[formatPayload] Payload completo montado: {...}
[sendToBlockchain] Payload formatado com sucesso
[sendToBlockchain] Preparando requisição HTTP POST para /api/v1/blockchain/register
[sendToBlockchain] Enviando requisição...
[sendToBlockchain] Resposta recebida do servidor
[sendToBlockchain] Status HTTP: 200
[sendToBlockchain] Extraindo blockchain_response...
[sendToBlockchain] Verificando se é duplicata...
[sendToBlockchain] Objeto de retorno montado: {...}
[sendToBlockchain] ========== PROCESSO CONCLUÍDO COM SUCESSO ==========
```

### Console Logs de Erro

```
[sendToBlockchain] ========== ERRO NO PROCESSO ==========
[sendToBlockchain] Tipo do erro: Error
[sendToBlockchain] Mensagem do erro: Request failed with status code 404
[sendToBlockchain] Stack trace: ...
[sendToBlockchain] Resposta de erro do servidor:
[sendToBlockchain] Status HTTP: 404
[sendToBlockchain] Dados: {...}
[sendToBlockchain] Objeto de erro que será retornado: {...}
[sendToBlockchain] ========== FIM DO ERRO ==========
```

---

## Tratamento de Erros Comuns

### Erro 404 - Rota não encontrada
```
Request failed with status code 404
```
**Solução**: Verifique se a rota `/api/v1/blockchain/register` está correta e se a API está rodando.

### Erro 401 - Não autorizado
```
Request failed with status code 401
```
**Solução**: Verifique se o token de autenticação está presente e válido no localStorage.

### Timeout
```
timeout of 20000ms exceeded
```
**Solução**: A API não respondeu em 20 segundos. Verifique a conexão ou aumente o timeout em `/src/lib/api/http.ts`.

### JSON Inválido
```
Invalid JSON string provided to formatPayload
```
**Solução**: Certifique-se de passar uma string JSON válida para `sendToBlockchain()`.

---

## Fluxo Completo de Dados

```
┌─────────────────────┐
│  Componente React   │
│  (NewProcessModal)  │
└──────────┬──────────┘
           │
           │ 1. Coleta dados do formulário
           │ 2. JSON.stringify(dados)
           ▼
┌─────────────────────┐
│  sendToBlockchain() │
└──────────┬──────────┘
           │
           │ 3. formatPayload()
           ▼
┌─────────────────────┐
│   formatPayload()   │
│  - Parse JSON       │
│  - Adiciona IdBlock │
│  - Adiciona Fields  │
└──────────┬──────────┘
           │
           │ 4. Payload formatado
           ▼
┌─────────────────────┐
│   HTTP Client       │
│  (axios)            │
│  + Interceptors     │
└──────────┬──────────┘
           │
           │ 5. POST /api/v1/blockchain/register
           │    + Authorization Bearer token
           ▼
┌─────────────────────┐
│   API FastAPI       │
│  (Backend)          │
└──────────┬──────────┘
           │
           │ 6. Resposta com HashBlock, IdBlock, etc
           ▼
┌─────────────────────┐
│  sendToBlockchain() │
│  - Trata resposta   │
│  - Normaliza dados  │
└──────────┬──────────┘
           │
           │ 7. BlockchainResponse
           ▼
┌─────────────────────┐
│  Componente React   │
│  - Exibe toast      │
│  - Atualiza UI      │
└─────────────────────┘
```

---

## Exemplo Prático: NewProcessModal

Veja como o `NewProcessModal.tsx` utiliza o BlockchainUtils:

```typescript
// 1. Importação
import { sendToBlockchain } from '../lib/utils/BlockchainUtils';

// 2. Dentro do componente
const handleSaveProcess = async () => {
  try {
    // 3. Criar o processo primeiro (se necessário)
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

## Melhores Práticas

### 1. Sempre Use JSON.stringify()
```typescript
// Correto
const jsonString = JSON.stringify(dados);
await sendToBlockchain(jsonString);

// Errado
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

### 3. Use o ProcessoId Quando Disponível
```typescript
// Com processoId - gera descrição mais detalhada
await sendToBlockchain(jsonString, 'PROC-123');

// Sem processoId - ainda funciona
await sendToBlockchain(jsonString);
```

### 4. Valide Dados Antes de Enviar
```typescript
if (!formData.company || !formData.cnpj) {
  toast.error('Preencha os campos obrigatórios');
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

## Conclusão

O `BlockchainUtils.ts` é uma ferramenta robusta e fácil de usar para integrar funcionalidades de blockchain na aplicação. Com logging extensivo, tratamento de erros completo e interfaces TypeScript bem definidas, ele garante uma experiência de desenvolvimento consistente e confiável.

Para usar em qualquer parte do código, basta:
1. Importar `sendToBlockchain`
2. Converter seus dados em JSON string
3. Chamar a função e tratar o resultado

O módulo cuida de toda a complexidade de formatação, autenticação, comunicação HTTP e tratamento de erros.
