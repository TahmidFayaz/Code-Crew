import api from './api';

export const adminService = {
  // Get dashboard data (stats and activity)
  getDashboardData: async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      return {
        stats: response.data.stats,
        recentActivity: response.data.recentActivity || []
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      return response.data.stats;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get blogs awaiting approval (pending and draft)
  getBlogsForApproval: async () => {
    try {
      const response = await api.get('/admin/blogs', {
        params: { status: 'pending,draft' }
      });
      return response.data.blogs || [];
    } catch (error) {
      console.error('Error fetching blogs for approval:', error);
      throw error;
    }
  },

  // Get pending blogs for approval (backward compatibility)
  getPendingBlogs: async () => {
    try {
      const response = await api.get('/admin/blogs', {
        params: { status: 'pending' }
      });
      return response.data.blogs || [];
    } catch (error) {
      console.error('Error fetching pending blogs:', error);
      throw error;
    }
  },

  // Get recent activity
  getRecentActivity: async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      return response.data.recentActivity || [];
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  },

  // Update blog status
  updateBlogStatus: async (blogId, status) => {
    try {
      const response = await api.patch(`/admin/blogs/${blogId}`, {
        status
      });
      return response.data;
    } catch (error) {
      console.error('Error updating blog status:', error);
      throw error;
    }
  },

  // Approve a blog
  approveBlog: async (blogId) => {
    try {
      const response = await api.patch(`/admin/blogs/${blogId}`, {
        status: 'published'
      });
      return response.data;
    } catch (error) {
      console.error('Error approving blog:', error);
      throw error;
    }
  },

  // Reject a blog
  rejectBlog: async (blogId) => {
    try {
      const response = await api.patch(`/admin/blogs/${blogId}`, {
        status: 'rejected'
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting blog:', error);
      throw error;
    }
  },

  // Hackathon management
  getAllHackathons: async (params) => {
    try {
      const response = await api.get('/admin/hackathons', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching hackathons:', error);
      throw error;
    }
  },

  updateHackathonStatus: async (hackathonId, status) => {
    try {
      const response = await api.patch(`/admin/hackathons/${hackathonId}`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating hackathon status:', error);
      throw error;
    }
  },

  updateHackathonDates: async (hackathonId, dates) => {
    try {
      const response = await api.patch(`/admin/hackathons/${hackathonId}`, dates);
      return response.data;
    } catch (error) {
      console.error('Error updating hackathon dates:', error);
      throw error;
    }
  },

  deleteHackathon: async (hackathonId) => {
    try {
      const response = await api.delete(`/admin/hackathons/${hackathonId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting hackathon:', error);
      throw error;
    }
  },

  // Helper function to calculate time ago
  getTimeAgo: (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInHours = Math.floor((now - past) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} weeks ago`;
  }
};