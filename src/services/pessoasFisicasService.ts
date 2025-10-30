import axios from 'axios';

const API_BASE_URL = 'https://fastapi-sandbox-ee3p.onrender.com';

const cleanCPF = (cpf: string | null): string | null => {
  if (!cpf) return null;
  return cpf.replace(/\D/g, '');
};

const isValidCPF = (cpf: string | null): boolean => {
  if (!cpf) return false;
  const cleaned = cleanCPF(cpf);
  return cleaned !== null && cleaned.length === 11;
};

export class PessoasFisicasService {
  static async getPessoas() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/pessoas`, {
        timeout: 30000,
        headers: {
          'Accept': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching pessoas:', error);
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
        throw new Error('Falha ao buscar dados das pessoas físicas');
      }
    }
  }

  static async getPessoaByCpf(cpf: string) {
    if (!cpf) {
      throw new Error('CPF não informado');
    }

    if (!isValidCPF(cpf)) {
      throw new Error('CPF inválido. Deve conter 11 dígitos.');
    }

    const cleanedCpf = cleanCPF(cpf);

    try {
      console.log(`Fetching pessoa by CPF: ${cleanedCpf}`);
      const response = await axios.get(`${API_BASE_URL}/api/v1/pessoas/cpf/${cleanedCpf}`, {
        timeout: 30000,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.data) {
        throw new Error('API retornou dados vazios');
      }

      console.log('Successfully fetched pessoa by CPF');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching pessoa by CPF:', {
        cpf: cleanedCpf,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.response) {
        const status = error.response.status;
        const detail = error.response.data?.detail || 'Erro desconhecido';

        if (status === 404) {
          throw new Error(`Pessoa física não encontrada para o CPF: ${cleanedCpf}`);
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
        throw new Error(error.message || 'Falha ao buscar dados da pessoa física');
      }
    }
  }
}
