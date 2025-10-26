import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
    }

    let errorMessage = 'Erro desconhecido';

    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Tempo de conexão esgotado. Verifique sua internet e tente novamente.';
    } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      errorMessage = 'Erro de rede. Verifique sua conexão com a internet ou tente novamente mais tarde.';
    } else if (error.code === 'ERR_BAD_REQUEST' && error.response?.status === 404) {
      errorMessage = 'Serviço temporariamente indisponível. Tente novamente em alguns instantes.';
    } else if (error.response) {
      const data = error.response.data as { message?: string; detail?: any };
      errorMessage = data?.message || data?.detail?.message || `Erro ${error.response.status}: ${error.response.statusText}`;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('HTTP Error:', { error, message: errorMessage });

    return Promise.reject(new Error(errorMessage));
  }
);

export async function testBackendConnection(): Promise<boolean> {
  try {
    await http.get('/health', { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

export default http;
