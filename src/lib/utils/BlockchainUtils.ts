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
  let formData: Record<string, any>;

  try {
    formData = JSON.parse(formDataJsonString);
  } catch (error) {
    throw new Error('Invalid JSON string provided to formatPayload');
  }

  const description = processoId
    ? `Formulário completo de Licenciamento Ambiental - Processo ${processoId}`
    : 'Formulário de Licenciamento Ambiental';

  return {
    IdBlockchain: BLOCKCHAIN_PARAMS.idBlockchain,
    Data: formData,
    Fields: [
      {
        NmField: 'LicenciamentoAmbientalFormulario',
        DsValue: description
      }
    ]
  };
}

export async function sendToBlockchain(
  formDataJsonString: string,
  processoId?: string
): Promise<BlockchainResponse> {
  try {
    const payload = formatPayload(formDataJsonString, processoId);

    console.log('📤 Enviando payload para blockchain:', payload);

    const response = await http.post<BlockchainResponse>(
      '/blockchain/register',
      payload
    );

    console.log('📥 Resposta do blockchain:', response.data);

    const blockchainData = response.data.blockchain_response;
    const isDuplicate = blockchainData?.Message?.includes('já foi registrado');

    let message = response.data.message || 'Dados registrados no blockchain';
    if (isDuplicate) {
      message = 'Dados já foram registrados anteriormente no blockchain';
    }

    return {
      success: response.data.success,
      message,
      blockchain_response: blockchainData,
      error: response.data.error,
      hashBlock: blockchainData?.HashBlock || undefined,
      idBlock: blockchainData?.IdBlock || undefined,
      executed: blockchainData?.Executed || false
    };
  } catch (error: any) {
    console.error('❌ Erro ao enviar dados para blockchain:', error);

    return {
      success: false,
      message: '',
      error: error.message || 'Falha ao registrar dados no blockchain'
    };
  }
}
