import api from './api';

export const hackathonService = {
  getAllHackathons: async (params) => {
    const response = await api.get('/hackathons', { params });
    return response.data;
  },

  getHackathonById: async (id) => {
    const response = await api.get(`/hackathons/${id}`);
    return response.data;
  },

  createHackathon: async (hackathonData) => {
    const response = await api.post('/hackathons', hackathonData);
    return response.data;
  },

  updateHackathon: async (id, hackathonData) => {
    const response = await api.patch(`/hackathons/${id}`, hackathonData);
    return response.data;
  },

  deleteHackathon: async (id) => {
    const response = await api.delete(`/hackathons/${id}`);
    return response.data;
  },

  joinHackathon: async (id, teamId = null) => {
    const response = await api.post(`/hackathons/${id}/join`, { teamId });
    return response.data;
  },

  leaveHackathon: async (id) => {
    const response = await api.post(`/hackathons/${id}/leave`);
    return response.data;
  },

  bookmarkHackathon: async (id) => {
    const response = await api.post(`/hackathons/${id}/bookmark`);
    return response.data;
  },

  getMyHackathons: async (type) => {
    const response = await api.get('/hackathons/my-hackathons', { params: { type } });
    return response.data;
  },
};