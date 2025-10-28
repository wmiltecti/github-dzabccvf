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

    let errorMessage: string;

    if (error.response?.status === 401) {
      errorMessage = 'Usuário ou senha incorretos';
    } else if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
      errorMessage = 'Erro de conexão com o servidor';
    } else {
      errorMessage =
        (error.response?.data as { message?: string })?.message ||
        error.message ||
        `Error: ${error.response?.status || 'Unknown'}`;
    }

    const enhancedError = new Error(errorMessage);
    (enhancedError as any).isNetworkError = error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response;

    return Promise.reject(enhancedError);
  }
);

export default http;
