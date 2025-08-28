import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { adminService } from '../../services/admin';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Users,
  Calendar,
  BookOpen,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeams: 0,
    totalHackathons: 0,
    totalBlogs: 0,
    pendingBlogs: 0,
    activeHackathons: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingBlogs, setPendingBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard data (stats and activity in one call)
      const [dashboardData, blogsForApprovalData] = await Promise.all([
        adminService.getDashboardData(),
        adminService.getBlogsForApproval()
      ]);

      setStats(dashboardData.stats);
      setRecentActivity(dashboardData.recentActivity);
      setPendingBlogs(blogsForApprovalData);

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBlog = async (blogId) => {
    try {
      await adminService.approveBlog(blogId);
      toast.success('Blog approved successfully!');
      fetchAdminData();
    } catch (error) {
      console.error('Error approving blog:', error);
      toast.error(error.response?.data?.msg || 'Failed to approve blog');
    }
  };

  const handleRejectBlog = async (blogId) => {
    try {
      await adminService.rejectBlog(blogId);
      toast.success('Blog rejected');
      fetchAdminData();
    } catch (error) {
      console.error('Error rejecting blog:', error);
      toast.error(error.response?.data?.msg || 'Failed to reject blog');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'tips': return 'bg-blue-600/20 text-blue-400';
      case 'success-stories': return 'bg-green-600/20 text-green-400';
      case 'tutorials': return 'bg-purple-600/20 text-purple-400';
      default: return 'bg-slate-600/20 text-slate-400';
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="min-h-64" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-slate-400">Manage platform content and users</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to="/admin/hackathons/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Hackathon</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-blue-400" />
            <span className="text-2xl font-bold text-white">{stats.totalUsers}</span>
          </div>
          <p className="text-sm text-slate-400">Total Users</p>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-green-400" />
            <span className="text-2xl font-bold text-white">{stats.totalTeams}</span>
          </div>
          <p className="text-sm text-slate-400">Total Teams</p>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-5 w-5 text-purple-400" />
            <span className="text-2xl font-bold text-white">{stats.totalHackathons}</span>
          </div>
          <p className="text-sm text-slate-400">Total Hackathons</p>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-5 w-5 text-yellow-400" />
            <span className="text-2xl font-bold text-white">{stats.activeHackathons}</span>
          </div>
          <p className="text-sm text-slate-400">Active Hackathons</p>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            <span className="text-2xl font-bold text-white">{stats.totalBlogs}</span>
          </div>
          <p className="text-sm text-slate-400">Published Blogs</p>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-5 w-5 text-orange-400" />
            <span className="text-2xl font-bold text-white">{stats.pendingBlogs}</span>
          </div>
          <p className="text-sm text-slate-400">Pending Blogs</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Blog Approvals */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Blogs Awaiting Approval</h2>
              <Link
                to="/admin/blogs"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {pendingBlogs.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-slate-400">No blogs awaiting approval</p>
                </div>
              ) : (
                pendingBlogs.map((blog) => (
                  <div key={blog._id} className="border border-slate-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-white mb-1">
                          {blog.title}
                        </h3>
                        <div className="flex items-center space-x-3 text-sm text-slate-400">
                          <span>By {blog.author.name}</span>
                          <span>•</span>
                          <span>{formatDate(blog.createdAt)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(blog.category)}`}>
                            {blog.category.replace('-', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${blog.status === 'draft'
                            ? 'bg-gray-600/20 text-gray-400'
                            : 'bg-yellow-600/20 text-yellow-400'
                            }`}>
                            {blog.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Link
                        to={`/blogs/${blog._id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Preview</span>
                      </Link>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRejectBlog(blog._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleApproveBlog(blog._id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Approve</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>

            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-slate-400">No recent activity</p>
                </div>
              ) : (
                recentActivity.map((activity, index) => {
                  // Map icon names to actual icon components
                  const getIcon = (iconName) => {
                    switch (iconName) {
                      case 'Users': return Users;
                      case 'BookOpen': return BookOpen;
                      case 'Calendar': return Calendar;
                      default: return Users;
                    }
                  };
                  const Icon = getIcon(activity.icon);

                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                          <Icon className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">{activity.message}</p>
                        <p className="text-xs text-slate-400">{activity.time}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mt-6">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>

            <div className="space-y-2">

              <Link
                to="/admin/hackathons"
                className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Calendar className="h-4 w-4" />
                <span>Manage Hackathons</span>
              </Link>

              <Link
                to="/admin/blogs"
                className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                <span>Manage Blogs</span>
              </Link>

              <Link
                to="/admin/users"
                className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>Manage Users</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;