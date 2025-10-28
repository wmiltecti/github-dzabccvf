import axios from 'axios';

const API_BASE_URL = 'https://fastapi-sandbox-ee3p.onrender.com';

const cleanCNPJ = (cnpj: string | null): string | null => {
  if (!cnpj) return null;
  return cnpj.replace(/\D/g, '');
};

const isValidCNPJ = (cnpj: string | null): boolean => {
  if (!cnpj) return false;
  const cleaned = cleanCNPJ(cnpj);
  return cleaned !== null && cleaned.length === 14;
};

export class PessoasJuridicasService {
  static async getPessoasJuridicas() {
    try {
      const response = await axios.get(`${API_BASE_URL}/pessoas/juridicas`, {
        timeout: 30000,
        headers: {
          'Accept': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching pessoas jurídicas:', error);
      if (error.response) {
        console.error('API Response Error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        throw new Error(`Erro na API: ${error.response.status} - ${error.response.data?.detail || 'Erro desconhecido'}`);
      } else if (error.request) {
        console.error('Network Error - No response received');
        throw new Error('Erro de rede: Não foi possível conectar à API');
      } else {
        throw new Error('Falha ao buscar dados das pessoas jurídicas');
      }
    }
  }

  static async getPessoaByCnpj(cnpj: string) {
    if (!cnpj) {
      throw new Error('CNPJ não informado');
    }

    if (!isValidCNPJ(cnpj)) {
      throw new Error('CNPJ inválido. Deve conter 14 dígitos.');
    }

    const cleanedCnpj = cleanCNPJ(cnpj);

    try {
      console.log(`Fetching pessoa by CNPJ: ${cleanedCnpj}`);
      const response = await axios.get(`${API_BASE_URL}/pessoas/cnpj/${cleanedCnpj}`, {
        timeout: 30000,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.data) {
        throw new Error('API retornou dados vazios');
      }

      console.log('Successfully fetched pessoa by CNPJ');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching pessoa by CNPJ:', {
        cnpj: cleanedCnpj,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.response) {
        const status = error.response.status;
        const detail = error.response.data?.detail || 'Erro desconhecido';

        if (status === 404) {
          throw new Error(`Pessoa jurídica não encontrada para o CNPJ: ${cleanedCnpj}`);
        } else if (status === 400) {
          throw new Error(`Dados inválidos: ${detail}`);
        } else if (status >= 500) {
          throw new Error(`Erro no servidor: ${detail}`);
        } else {
          throw new Error(`Erro na API (${status}): ${detail}`);
        }
      } else if (error.request) {
        console.error('Network Error - No response received');
        throw new Error('Erro de rede: Não foi possível conectar à API. Verifique sua conexão.');
      } else {
        throw new Error(error.message || 'Falha ao buscar dados da pessoa jurídica');
      }
    }
  }
}
