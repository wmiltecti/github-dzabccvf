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
    console.log('🌐 HTTP Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data
    });

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
    console.log('✅ HTTP Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error: AxiosError) => {
    console.error('❌ HTTP Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      errorCode: error.code,
      responseData: error.response?.data,
      message: error.message
    });

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
