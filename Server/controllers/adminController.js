const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const Team = require('../models/Team');
const Hackathon = require('../models/Hackathon');
const Blog = require('../models/Blog');

const getDashboardStats = async (req, res) => {
  try {
    // Get counts for all entities
    const [userCount, teamCount, hackathonCount, blogCount] = await Promise.all([
      User.countDocuments({}),
      Team.countDocuments({}),
      Hackathon.countDocuments({}),
      Blog.countDocuments({ status: 'published' })
    ]);

    // Get pending blogs count (including drafts that need approval)
    const pendingBlogsCount = await Blog.countDocuments({
      status: { $in: ['pending', 'draft'] }
    });

    // Get active hackathons count
    const now = new Date();
    const activeHackathonsCount = await Hackathon.countDocuments({
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    // Get recent activity data
    const [recentUsers, recentTeams, recentBlogs] = await Promise.all([
      User.find({}).sort('-createdAt').limit(3).select('name createdAt'),
      Team.find({}).sort('-createdAt').limit(3).select('name createdAt'),
      Blog.find({}).sort('-createdAt').limit(3).select('title createdAt')
    ]);

    const stats = {
      totalUsers: userCount,
      totalTeams: teamCount,
      totalHackathons: hackathonCount,
      totalBlogs: blogCount,
      pendingBlogs: pendingBlogsCount,
      activeHackathons: activeHackathonsCount
    };

    const recentActivity = [];

    // Add recent users to activity
    recentUsers.forEach(user => {
      recentActivity.push({
        type: 'user',
        message: `New user registered: ${user.name}`,
        time: getTimeAgo(user.createdAt),
        icon: 'Users',
        createdAt: user.createdAt
      });
    });

    // Add recent teams to activity
    recentTeams.forEach(team => {
      recentActivity.push({
        type: 'team',
        message: `Team "${team.name}" created`,
        time: getTimeAgo(team.createdAt),
        icon: 'Users',
        createdAt: team.createdAt
      });
    });

    // Add recent blogs to activity
    recentBlogs.forEach(blog => {
      recentActivity.push({
        type: 'blog',
        message: `Blog post "${blog.title}" submitted`,
        time: getTimeAgo(blog.createdAt),
        icon: 'BookOpen',
        createdAt: blog.createdAt
      });
    });

    // Sort activity by creation date and limit to 5
    const sortedActivity = recentActivity
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.status(StatusCodes.OK).json({
      stats,
      recentActivity: sortedActivity
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: 'Failed to fetch dashboard statistics'
    });
  }
};

// Helper function to calculate time ago
const getTimeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInHours = Math.floor((now - past) / (1000 * 60 * 60));

  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;

  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} weeks ago`;
};

module.exports = {
  getDashboardStats
};