import axios from 'axios';

const API_BASE_URL = 'https://fastapi-sandbox-ee3p.onrender.com';

export class PessoasFisicasService {
  static async getPessoas() {
    try {
      const response = await axios.get(`${API_BASE_URL}/pessoas`, {
        timeout: 30000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
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

  static async getPessoaById(id: number) {
    try {
      const response = await axios.get(`${API_BASE_URL}/pessoas/${id}`, {
        timeout: 30000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching pessoa by ID:', error);
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
        throw new Error('Falha ao buscar dados da pessoa física');
      }
    }
  }
}
