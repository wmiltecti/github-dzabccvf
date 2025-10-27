import axios from 'axios';

const API_BASE_URL = 'https://fastapi-sandbox-ee3p.onrender.com';

export class PessoasFisicasService {
  static async getPessoas() {
    try {
      const response = await axios.get(`${API_BASE_URL}/pessoas`, {
        timeout: 30000,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching pessoas:', error);
      throw new Error('Falha ao buscar dados das pessoas físicas');
    }
  }

  static async getPessoaById(id: number) {
    try {
      const response = await axios.get(`${API_BASE_URL}/pessoas/${id}`, {
        timeout: 30000,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching pessoa by ID:', error);
      throw new Error('Falha ao buscar dados da pessoa física');
    }
  }
}
