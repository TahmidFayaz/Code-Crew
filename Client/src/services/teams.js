import api from './api';

export const teamService = {
  getAllTeams: async (params) => {
    const response = await api.get('/teams', { params });
    return response.data;
  },

  getTeamById: async (id) => {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  },

  createTeam: async (teamData) => {
    const response = await api.post('/teams', teamData);
    return response.data;
  },

  updateTeam: async (id, teamData) => {
    const response = await api.patch(`/teams/${id}`, teamData);
    return response.data;
  },

  deleteTeam: async (id) => {
    const response = await api.delete(`/teams/${id}`);
    return response.data;
  },

  joinTeam: async (id) => {
    const response = await api.post(`/teams/${id}/join`);
    return response.data;
  },

  requestToJoinTeam: async (id, message) => {
    const response = await api.post(`/teams/${id}/request`, { message });
    return response.data;
  },

  leaveTeam: async (id) => {
    const response = await api.post(`/teams/${id}/leave`);
    return response.data;
  },

  getMyTeams: async () => {
    const response = await api.get('/teams/my-teams');
    return response.data;
  },
};