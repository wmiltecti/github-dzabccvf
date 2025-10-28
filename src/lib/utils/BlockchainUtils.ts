import http from '../api/http';
import { BLOCKCHAIN_PARAMS } from '../parameters';

export interface BlockchainPayload {
  IdBlockchain: number;
  Data: Record<string, any>;
  Fields: any[];
}

export interface BlockchainResponse {
  success: boolean;
  transactionId?: string;
  message?: string;
  error?: string;
}

export function formatPayload(formDataJsonString: string): BlockchainPayload {
  let formData: Record<string, any>;

  try {
    formData = JSON.parse(formDataJsonString);
  } catch (error) {
    throw new Error('Invalid JSON string provided to formatPayload');
  }

  return {
    IdBlockchain: BLOCKCHAIN_PARAMS.idBlockchain,
    Data: formData,
    Fields: []
  };
}

export async function sendToBlockchain(
  formDataJsonString: string
): Promise<BlockchainResponse> {
  try {
    const payload = formatPayload(formDataJsonString);

    const response = await http.post<BlockchainResponse>(
      '/blockchain/register',
      payload
    );

    return {
      success: true,
      transactionId: response.data.transactionId,
      message: response.data.message || 'Data successfully registered on blockchain'
    };
  } catch (error: any) {
    console.error('Error sending data to blockchain:', error);

    return {
      success: false,
      error: error.message || 'Failed to register data on blockchain'
    };
  }
}
