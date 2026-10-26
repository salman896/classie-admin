import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject JWT Access Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('classie_admin_access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh & 401 handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('classie_admin_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
            refresh: refreshToken,
          });
          if (res.data?.access) {
            localStorage.setItem('classie_admin_access_token', res.data.access);
            originalRequest.headers['Authorization'] = `Bearer ${res.data.access}`;
            return apiClient(originalRequest);
          }
        } catch (refreshErr) {
          // Token refresh failed -> Log out
          localStorage.removeItem('classie_admin_access_token');
          localStorage.removeItem('classie_admin_refresh_token');
          localStorage.removeItem('classie_admin_user');
          window.location.reload();
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
