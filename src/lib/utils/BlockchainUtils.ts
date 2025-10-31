import http from '../api/http';
import { BLOCKCHAIN_PARAMS } from '../parameters';

export interface BlockchainField {
  NmField: string;
  DsValue: string;
}

export interface BlockchainPayload {
  IdBlockchain: number;
  Data: Record<string, any>;
  Fields: BlockchainField[];
}

export interface BlockchainApiResponse {
  HashBlock: string | null;
  IdBlock: number | null;
  Executed: boolean;
  ValidToken: boolean;
  HTTPStatus: number;
  Message: string;
}

export interface BlockchainResponse {
  success: boolean;
  message: string;
  blockchain_response?: BlockchainApiResponse;
  error: string | null;
  hashBlock?: string;
  idBlock?: number;
  executed?: boolean;
}

export function formatPayload(
  formDataJsonString: string,
  processoId?: string
): BlockchainPayload {
  console.log('🔧 [formatPayload] Iniciando formatação do payload');
  console.log('🔧 [formatPayload] formDataJsonString recebido:', formDataJsonString);
  console.log('🔧 [formatPayload] processoId recebido:', processoId);

  let formData: Record<string, any>;

  try {
    console.log('🔧 [formatPayload] Tentando fazer parse do JSON...');
    formData = JSON.parse(formDataJsonString);
    console.log('🔧 [formatPayload] Parse bem-sucedido. FormData:', formData);
  } catch (error) {
    console.error('❌ [formatPayload] Erro ao fazer parse do JSON:', error);
    throw new Error('Invalid JSON string provided to formatPayload');
  }

  const description = processoId
    ? `Formulário completo de Licenciamento Ambiental - Processo ${processoId}`
    : 'Formulário de Licenciamento Ambiental';

  console.log('🔧 [formatPayload] Descrição gerada:', description);
  console.log('🔧 [formatPayload] IdBlockchain configurado:', BLOCKCHAIN_PARAMS.idBlockchain);

  const payload = {
    IdBlockchain: BLOCKCHAIN_PARAMS.idBlockchain,
    Data: formData,
    Fields: [
      {
        NmField: 'LicenciamentoAmbientalFormulario',
        DsValue: description
      }
    ]
  };

  console.log('🔧 [formatPayload] Payload completo montado:', JSON.stringify(payload, null, 2));

  return payload;
}

export async function sendToBlockchain(
  formDataJsonString: string,
  processoId?: string
): Promise<BlockchainResponse> {
  console.log('🚀 [sendToBlockchain] ========== INÍCIO DO PROCESSO ==========');
  console.log('🚀 [sendToBlockchain] Recebido formDataJsonString:', formDataJsonString);
  console.log('🚀 [sendToBlockchain] Recebido processoId:', processoId);

  try {
    console.log('📦 [sendToBlockchain] Chamando formatPayload...');
    const payload = formatPayload(formDataJsonString, processoId);
    console.log('📦 [sendToBlockchain] Payload formatado com sucesso');

    console.log('🌐 [sendToBlockchain] Preparando requisição HTTP POST para /api/v1/blockchain/register');
    console.log('🌐 [sendToBlockchain] Payload que será enviado:', JSON.stringify(payload, null, 2));

    console.log('⏳ [sendToBlockchain] Enviando requisição...');
    const response = await http.post<BlockchainResponse>(
      '/blockchain/register',
      payload
    );

    console.log('✅ [sendToBlockchain] Resposta recebida do servidor');
    console.log('✅ [sendToBlockchain] Status HTTP:', response.status);
    console.log('✅ [sendToBlockchain] Headers da resposta:', response.headers);
    console.log('✅ [sendToBlockchain] Dados completos da resposta:', JSON.stringify(response.data, null, 2));

    console.log('🔍 [sendToBlockchain] Extraindo blockchain_response...');
    const blockchainData = response.data.blockchain_response;
    console.log('🔍 [sendToBlockchain] blockchain_response extraído:', blockchainData);

    console.log('🔍 [sendToBlockchain] Verificando se é duplicata...');
    const isDuplicate = blockchainData?.Message?.includes('já foi registrado');
    console.log('🔍 [sendToBlockchain] É duplicata?', isDuplicate);

    let message = response.data.message || 'Dados registrados no blockchain';
    if (isDuplicate) {
      message = 'Dados já foram registrados anteriormente no blockchain';
      console.log('ℹ️ [sendToBlockchain] Mensagem ajustada para duplicata');
    }
    console.log('🔍 [sendToBlockchain] Mensagem final:', message);

    const result = {
      success: response.data.success,
      message,
      blockchain_response: blockchainData,
      error: response.data.error,
      hashBlock: blockchainData?.HashBlock || undefined,
      idBlock: blockchainData?.IdBlock || undefined,
      executed: blockchainData?.Executed || false
    };

    console.log('📤 [sendToBlockchain] Objeto de retorno montado:', JSON.stringify(result, null, 2));
    console.log('🎉 [sendToBlockchain] ========== PROCESSO CONCLUÍDO COM SUCESSO ==========');

    return result;
  } catch (error: any) {
    console.error('💥 [sendToBlockchain] ========== ERRO NO PROCESSO ==========');
    console.error('💥 [sendToBlockchain] Tipo do erro:', error.constructor.name);
    console.error('💥 [sendToBlockchain] Mensagem do erro:', error.message);
    console.error('💥 [sendToBlockchain] Stack trace:', error.stack);

    if (error.response) {
      console.error('💥 [sendToBlockchain] Resposta de erro do servidor:');
      console.error('💥 [sendToBlockchain] Status HTTP:', error.response.status);
      console.error('💥 [sendToBlockchain] Headers:', error.response.headers);
      console.error('💥 [sendToBlockchain] Dados:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('💥 [sendToBlockchain] Requisição foi feita mas não houve resposta');
      console.error('💥 [sendToBlockchain] Request:', error.request);
    } else {
      console.error('💥 [sendToBlockchain] Erro ao configurar a requisição');
    }

    const errorResult = {
      success: false,
      message: '',
      error: error.message || 'Falha ao registrar dados no blockchain'
    };

    console.error('💥 [sendToBlockchain] Objeto de erro que será retornado:', JSON.stringify(errorResult, null, 2));
    console.error('💥 [sendToBlockchain] ========== FIM DO ERRO ==========');

    return errorResult;
  }
}
