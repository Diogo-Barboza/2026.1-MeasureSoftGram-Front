import axios from 'axios';

const api = axios.create({
  baseURL: process.env.SERVICE_URL,
  withCredentials: true
});

api.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');

      if (token && config?.headers) {
        // eslint-disable-next-line no-param-reassign
        config.headers.Authorization = token ? `Token ${JSON.parse(token)}` : '';
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Limpa todos os dados de autenticação armazenados
      localStorage.removeItem('token');
      localStorage.removeItem('session');
      localStorage.removeItem('provider');
      localStorage.removeItem('login_timestamp');

      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api;
