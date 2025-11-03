import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

const refreshAuthToken = async (): Promise<string | null> => {
  try {
    console.log('🔄 Attempting to refresh authentication token...');

    const authUser = localStorage.getItem('auth_user');
    if (!authUser) {
      console.error('❌ No auth_user found in localStorage');
      return null;
    }

    const userData = JSON.parse(authUser);
    const currentToken = localStorage.getItem('auth_token');

    if (!currentToken) {
      console.error('❌ No current token to refresh');
      return null;
    }

    // Usar baseURL + path para manter consistência
    const baseURL = import.meta.env.VITE_API_BASE_URL || '';
    const url = baseURL.endsWith('/') ? `${baseURL}auth/refresh` : `${baseURL}/auth/refresh`;
    
    const response = await axios.post(
      url,
      {},
      {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    if (response.data?.token) {
      console.log('✅ Token refreshed successfully');
      localStorage.setItem('auth_token', response.data.token);
      return response.data.token;
    }

    console.error('❌ Token refresh response missing token');
    return null;
  } catch (error: any) {
    console.error('❌ Token refresh failed:', error.message);
    return null;
  }
};

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log('📤 HTTP Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data
    });

    // MVP1: Sem autenticação (igual testes Python)
    // TODO MVP2: Implementar autenticação segura
    // const token = localStorage.getItem('auth_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
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
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: number };

    console.error('❌ HTTP Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: originalRequest?.url,
      errorCode: error.code,
      responseData: error.response?.data,
      message: error.message,
      retryCount: originalRequest?._retry || 0
    });

    // MVP1: Sem retry/refresh de token (igual testes Python)
    // TODO MVP2: Implementar lógica de autenticação e refresh
    /* 
    if (error.response?.status === 401 && originalRequest) {
      originalRequest._retry = (originalRequest._retry || 0) + 1;

      if (originalRequest._retry <= 2) {
        console.log(`🔄 Retry attempt ${originalRequest._retry} of 2 for ${originalRequest.url}`);

        if (isRefreshing) {
          console.log('⏳ Token refresh already in progress, queueing request...');
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return http(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        isRefreshing = true;

        try {
          const newToken = await refreshAuthToken();

          if (newToken) {
            console.log('✅ Token refreshed, retrying original request');
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            processQueue(null, newToken);
            isRefreshing = false;
            return http(originalRequest);
          } else {
            console.error('❌ Token refresh failed, will retry once more on next request');
            processQueue(new Error('Token refresh failed'), null);
            isRefreshing = false;

            if (originalRequest._retry >= 2) {
              console.error('❌ Max retry attempts reached, redirecting to login');
              localStorage.removeItem('auth_token');
              localStorage.removeItem('auth_user');
              window.location.href = '/login';
            }
          }
        } catch (refreshError) {
          console.error('❌ Exception during token refresh:', refreshError);
          processQueue(refreshError, null);
          isRefreshing = false;

          if (originalRequest._retry >= 2) {
            console.error('❌ Max retry attempts reached after exception, redirecting to login');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            window.location.href = '/login';
          }
        }
      } else {
        console.error('❌ Max retry attempts (2) exceeded for request:', originalRequest.url);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
      }
    }
    */

    let errorMessage: string;

    if (error.response?.status === 401) {
      errorMessage = 'Sessão expirada. Tentando renovar...';
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
