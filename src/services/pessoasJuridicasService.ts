import axios from 'axios';

const API_BASE_URL = 'https://fastapi-sandbox-ee3p.onrender.com';

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
    try {
      const response = await axios.get(`${API_BASE_URL}/pessoas/cnpj/${cnpj}`, {
        timeout: 30000,
        headers: {
          'Accept': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching pessoa by CNPJ:', error);
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
        throw new Error('Falha ao buscar dados da pessoa jurídica');
      }
    }
  }
}
