import axios from 'axios';

export const TOKEN_KEY = 'clinicflow_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes('/auth/login')) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export function errorMessage(err) {
  const e = err.response?.data?.error;
  if (!e) return err.message || 'Erreur inattendue';
  if (Array.isArray(e.details)) return `${e.message} : ${e.details.map((d) => `${d.field} ${d.message}`).join(', ')}`;
  return e.message;
}

export default api;
