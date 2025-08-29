import api from './api';

const formatTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return date.toLocaleDateString();
};

export const dashboardService = {
  getDashboardStats: async () => {
    try {
      // Fetch all necessary data in parallel with error handling for each endpoint
      const [teamsResponse, hackathonsResponse, blogsResponse, invitationsResponse] = await Promise.allSettled([
        api.get('/teams/my-teams'),
        api.get('/hackathons/my-hackathons'),
        api.get('/blogs/my-blogs'),
        api.get('/invitations')
      ]);

      return {
        teams: teamsResponse.status === 'fulfilled' ? teamsResponse.value.data : { teams: [], count: 0 },
        hackathons: hackathonsResponse.status === 'fulfilled' ? hackathonsResponse.value.data : { hackathons: [], count: 0 },
        blogs: blogsResponse.status === 'fulfilled' ? blogsResponse.value.data : { blogs: [], count: 0 },
        invitations: invitationsResponse.status === 'fulfilled' ? invitationsResponse.value.data : { invitations: [], count: 0 }
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  getRecentActivity: async () => {
    try {
      // This would ideally be a dedicated endpoint, but we'll construct it from available data
      const [teamsResponse, hackathonsResponse, blogsResponse] = await Promise.allSettled([
        api.get('/teams/my-teams'),
        api.get('/hackathons/my-hackathons'),
        api.get('/blogs/my-blogs')
      ]);

      const activities = [];

      // Add recent team activities
      if (teamsResponse.status === 'fulfilled' && teamsResponse.value.data.teams && teamsResponse.value.data.teams.length > 0) {
        teamsResponse.value.data.teams.slice(0, 2).forEach(team => {
          activities.push({
            type: 'team',
            title: `Joined "${team.name}" team`,
            time: formatTimeAgo(team.createdAt),
            icon: 'Users',
            data: team
          });
        });
      }

      // Add recent hackathon activities
      if (hackathonsResponse.status === 'fulfilled' && hackathonsResponse.value.data.hackathons && hackathonsResponse.value.data.hackathons.length > 0) {
        hackathonsResponse.value.data.hackathons.slice(0, 2).forEach(hackathon => {
          activities.push({
            type: 'hackathon',
            title: `Registered for ${hackathon.title}`,
            time: formatTimeAgo(hackathon.createdAt),
            icon: 'Calendar',
            data: hackathon
          });
        });
      }

      // Add recent blog activities
      if (blogsResponse.status === 'fulfilled' && blogsResponse.value.data.blogs && blogsResponse.value.data.blogs.length > 0) {
        blogsResponse.value.data.blogs.slice(0, 2).forEach(blog => {
          activities.push({
            type: 'blog',
            title: `Published "${blog.title}"`,
            time: formatTimeAgo(blog.createdAt),
            icon: 'BookOpen',
            data: blog
          });
        });
      }

      // Sort by most recent and limit to 5
      return activities
        .sort((a, b) => new Date(b.data.createdAt) - new Date(a.data.createdAt))
        .slice(0, 5);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return []; // Return empty array on error instead of throwing
    }
  }
};