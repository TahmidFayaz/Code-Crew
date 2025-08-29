import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.delete('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },



  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (data) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('user');
  },
};