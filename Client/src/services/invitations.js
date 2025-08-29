import api from './api';

export const invitationService = {
  getMyInvitations: async (params) => {
    const response = await api.get('/invitations', { params });
    return response.data;
  },

  getSentInvitations: async (params) => {
    const response = await api.get('/invitations/sent', { params });
    return response.data;
  },

  sendInvitation: async (invitationData) => {
    const response = await api.post('/invitations', invitationData);
    return response.data;
  },

  respondToInvitation: async (id, response) => {
    const res = await api.patch(`/invitations/${id}/respond`, { response });
    return res.data;
  },

  cancelInvitation: async (id) => {
    const response = await api.patch(`/invitations/${id}/cancel`);
    return response.data;
  },

  deleteInvitation: async (id) => {
    const response = await api.delete(`/invitations/${id}`);
    return response.data;
  },
};