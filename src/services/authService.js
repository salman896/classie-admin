import apiClient from './apiClient';

export const authService = {
  login: async (email, password) => {
    const response = await apiClient.post('/api/admin/login/', { email, password });
    if (response.data?.result === 'success' && response.data?.data?.token) {
      const { token, ...user } = response.data.data;
      localStorage.setItem('classie_admin_access_token', token.access_token);
      localStorage.setItem('classie_admin_refresh_token', token.refresh_token);
      localStorage.setItem('classie_admin_user', JSON.stringify(user));
      return { success: true, user, token };
    }
    return { success: false, error: response.data?.errors || 'Authentication failed' };
  },

  getCurrentUser: () => {
    try {
      const raw = localStorage.getItem('classie_admin_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    return Boolean(localStorage.getItem('classie_admin_access_token'));
  },

  logout: () => {
    localStorage.removeItem('classie_admin_access_token');
    localStorage.removeItem('classie_admin_refresh_token');
    localStorage.removeItem('classie_admin_user');
  },
};
