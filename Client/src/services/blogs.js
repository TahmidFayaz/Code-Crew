import api from './api';

export const blogService = {
  getAllBlogs: async (params) => {
    const response = await api.get('/blogs', { params });
    return response.data;
  },

  getBlogById: async (id) => {
    const response = await api.get(`/blogs/${id}`);
    return response.data;
  },

  createBlog: async (blogData) => {
    const response = await api.post('/blogs', blogData);
    return response.data;
  },

  updateBlog: async (id, blogData) => {
    const response = await api.patch(`/blogs/${id}`, blogData);
    return response.data;
  },

  deleteBlog: async (id) => {
    const response = await api.delete(`/blogs/${id}`);
    return response.data;
  },

  likeBlog: async (id) => {
    const response = await api.post(`/blogs/${id}/like`);
    return response.data;
  },

  commentOnBlog: async (id, commentData) => {
    const response = await api.post(`/blogs/${id}/comments`, commentData);
    return response.data;
  },

  addComment: async (id, comment) => {
    const response = await api.post(`/blogs/${id}/comments`, { content: comment });
    return response.data;
  },

  deleteComment: async (id, commentId) => {
    const response = await api.delete(`/blogs/${id}/comments/${commentId}`);
    return response.data;
  },

  getMyBlogs: async () => {
    const response = await api.get('/blogs/my-blogs');
    return response.data;
  },
};