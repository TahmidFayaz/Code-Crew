import api from './api';

export const userService = {
  getCurrentUser: async () => {
    const response = await api.get('/users/showMe');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.patch('/users/updateUser', userData);
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  updatePassword: async (passwordData) => {
    const response = await api.patch('/users/updateUserPassword', passwordData);
    return response.data;
  },

  searchUsers: async (params) => {
    const response = await api.get('/users/search', { params });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  getAllUsers: async (params) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  banUser: async (id, reason = 'Admin action') => {
    const response = await api.patch(`/admin/users/${id}/ban`, { reason });
    return response.data;
  },

  unbanUser: async (id) => {
    const response = await api.patch(`/admin/users/${id}/unban`);
    return response.data;
  },

  toggleUserStatus: async (id, currentIsBanned) => {
    if (currentIsBanned) {
      return await api.patch(`/admin/users/${id}/unban`);
    } else {
      return await api.patch(`/admin/users/${id}/ban`, { reason: 'Admin action' });
    }
  },

  updateUserRole: async (id, role) => {
    // This would need to be implemented on the server side
    const response = await api.patch(`/admin/users/${id}/role`, { role });
    return response.data;
  },
};