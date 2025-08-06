import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
};

// User API
export const userAPI = {
  getProfile: (userId) => api.get(`/users/profile/${userId}`),
  updateProfile: (data) => api.put('/users/profile', data),
  searchUsers: (params) => api.get('/users/search', { params }),
  getDashboard: () => api.get('/users/dashboard'),
  getAllUsers: (params) => api.get('/users', { params }),
};

// Team API
export const teamAPI = {
  createTeam: (data) => api.post('/teams', data),
  getTeams: (params) => api.get('/teams', { params }),
  getTeam: (teamId) => api.get(`/teams/${teamId}`),
  updateTeam: (teamId, data) => api.put(`/teams/${teamId}`, data),
  requestToJoin: (teamId, data) => api.post(`/teams/${teamId}/join`, data),
  removeMember: (teamId, memberId) => api.delete(`/teams/${teamId}/members/${memberId}`),
  deleteTeam: (teamId) => api.delete(`/teams/${teamId}`),
};

// Blog API
export const blogAPI = {
  createBlog: (data) => api.post('/blogs', data),
  getBlogs: (params) => api.get('/blogs', { params }),
  getBlog: (blogId) => api.get(`/blogs/${blogId}`),
  updateBlog: (blogId, data) => api.put(`/blogs/${blogId}`, data),
  deleteBlog: (blogId) => api.delete(`/blogs/${blogId}`),
  toggleLike: (blogId) => api.post(`/blogs/${blogId}/like`),
  addComment: (blogId, data) => api.post(`/blogs/${blogId}/comments`, data),
  getTrendingBlogs: (params) => api.get('/blogs/trending', { params }),
};

// Resource API
export const resourceAPI = {
  createResource: (data) => api.post('/resources', data),
  getResources: (params) => api.get('/resources', { params }),
  getResource: (resourceId) => api.get(`/resources/${resourceId}`),
  updateResource: (resourceId, data) => api.put(`/resources/${resourceId}`, data),
  deleteResource: (resourceId) => api.delete(`/resources/${resourceId}`),
  addReview: (resourceId, data) => api.post(`/resources/${resourceId}/reviews`, data),
  getResourceMetadata: () => api.get('/resources/metadata'),
};

// Hackathon API
export const hackathonAPI = {
  createHackathon: (data) => api.post('/hackathons', data),
  getHackathons: (params) => api.get('/hackathons', { params }),
  getHackathon: (hackathonId) => api.get(`/hackathons/${hackathonId}`),
  updateHackathon: (hackathonId, data) => api.put(`/hackathons/${hackathonId}`, data),
  deleteHackathon: (hackathonId) => api.delete(`/hackathons/${hackathonId}`),
  getUpcomingHackathons: (params) => api.get('/hackathons/upcoming', { params }),
  getHackathonStats: () => api.get('/hackathons/stats'),
};

// Invitation API
export const invitationAPI = {
  sendInvitation: (data) => api.post('/invitations', data),
  getInvitations: (params) => api.get('/invitations', { params }),
  getSentInvitations: (params) => api.get('/invitations/sent', { params }),
  respondToInvitation: (invitationId, data) => api.put(`/invitations/${invitationId}/respond`, data),
  cancelInvitation: (invitationId) => api.put(`/invitations/${invitationId}/cancel`),
  getInvitationStats: () => api.get('/invitations/stats'),
};

export default api;