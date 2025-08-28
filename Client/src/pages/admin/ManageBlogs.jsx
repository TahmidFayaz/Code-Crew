import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogService } from '../../services/blogs';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  BookOpen,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Heart,
  MessageCircle,
  ChevronDown,
  FileText,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const ManageBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, [searchTerm, statusFilter, categoryFilter]);

  const fetchBlogs = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;

      const data = await blogService.getAllBlogs(params);
      setBlogs(data.blogs);
    } catch {
      toast.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBlog = async (blogId) => {
    setActionLoading(blogId);
    try {
      await blogService.updateBlog(blogId, { status: 'published' });
      toast.success('Blog approved successfully!');
      fetchBlogs();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to approve blog');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectBlog = async (blogId) => {
    setActionLoading(blogId);
    try {
      await blogService.updateBlog(blogId, { status: 'rejected' });
      toast.success('Blog rejected');
      fetchBlogs();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to reject blog');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (blogId, newStatus) => {
    setActionLoading(blogId);
    try {
      await blogService.updateBlog(blogId, { status: newStatus });
      toast.success(`Blog status updated to ${newStatus}`);
      fetchBlogs();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to update blog status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteBlog = async (blogId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(blogId);
    try {
      await blogService.deleteBlog(blogId);
      toast.success('Blog deleted successfully');
      fetchBlogs();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to delete blog');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'tips': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'success-stories': return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'tutorials': return 'bg-purple-600/20 text-purple-400 border-purple-600/30';
      case 'announcements': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'interviews': return 'bg-pink-600/20 text-pink-400 border-pink-600/30';
      default: return 'bg-slate-600/20 text-slate-400 border-slate-600/30';
    }
  };

  const StatusDropdown = ({ blog, onStatusChange, isLoading }) => {
    const [isOpen, setIsOpen] = useState(false);

    const statusOptions = [
      { value: 'draft', label: 'Draft', icon: FileText, color: 'text-gray-400' },
      { value: 'pending', label: 'Pending', icon: Clock, color: 'text-yellow-400' },
      { value: 'published', label: 'Published', icon: CheckCircle, color: 'text-green-400' },
      { value: 'rejected', label: 'Rejected', icon: XCircle, color: 'text-red-400' }
    ];

    const currentStatus = statusOptions.find(s => s.value === blog.status);
    const CurrentIcon = currentStatus?.icon || FileText;

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (isOpen && !event.target.closest('.status-dropdown')) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
      <div className="relative status-dropdown">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className="flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-full border bg-slate-700 border-slate-600 text-white hover:bg-slate-600 disabled:opacity-50"
        >
          <CurrentIcon className="h-3 w-3" />
          <span>{currentStatus?.label || blog.status}</span>
          <ChevronDown className="h-3 w-3" />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-32 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-10">
            {statusOptions.map((option) => {
              const OptionIcon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onStatusChange(blog._id, option.value);
                    setIsOpen(false);
                  }}
                  disabled={option.value === blog.status || isLoading}
                  className={`w-full flex items-center space-x-2 px-3 py-2 text-xs hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed ${option.value === blog.status ? 'bg-slate-600' : ''
                    }`}
                >
                  <OptionIcon className={`h-3 w-3 ${option.color}`} />
                  <span className="text-white">{option.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="min-h-64" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Manage Blogs</h1>
          <p className="text-slate-400">Review, approve, and manage blog posts</p>
        </div>
        <div className="text-sm text-slate-400">
          Total Blogs: {blogs.length}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="published">Published</option>
                <option value="rejected">Rejected</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="tips">Tips</option>
              <option value="success-stories">Success Stories</option>
              <option value="tutorials">Tutorials</option>
              <option value="announcements">Announcements</option>
              <option value="interviews">Interviews</option>
            </select>
          </div>
        </div>
      </div>

      {/* Blogs Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Blog Post
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {blogs.map((blog) => (
                <tr key={blog._id} className="hover:bg-slate-700/50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-white line-clamp-1">
                        {blog.title}
                      </div>
                      <div className="text-sm text-slate-400 line-clamp-2 max-w-40">
                        {blog.excerpt}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <img
                        src={`https://ui-avatars.com/api/?name=${blog.author.name}&size=32&background=3B82F6&color=fff`}
                        alt={blog.author.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="text-sm font-medium text-white">
                          {blog.author.name}
                        </div>
                        <div className="text-sm text-slate-400">{blog.author.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(blog.category)}`}>
                      {blog.category.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusDropdown
                      blog={blog}
                      onStatusChange={handleStatusChange}
                      isLoading={actionLoading === blog._id}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3 text-sm text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>{blog.likes?.length || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{blog.comments?.length || 0}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>{formatDate(blog.createdAt)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/blogs/${blog._id}`}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="View Blog"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>

                      {/* Quick action buttons for common status changes */}
                      {(blog.status === 'pending' || blog.status === 'draft') && (
                        <button
                          onClick={() => handleStatusChange(blog._id, 'published')}
                          disabled={actionLoading === blog._id}
                          className="text-green-400 hover:text-green-300 p-1 disabled:opacity-50"
                          title="Publish"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}

                      {blog.status === 'published' && (
                        <button
                          onClick={() => handleStatusChange(blog._id, 'draft')}
                          disabled={actionLoading === blog._id}
                          className="text-yellow-400 hover:text-yellow-300 p-1 disabled:opacity-50"
                          title="Unpublish"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteBlog(blog._id, blog.title)}
                        disabled={actionLoading === blog._id}
                        className="text-red-400 hover:text-red-300 p-1 disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {blogs.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No blogs found</h3>
            <p className="text-slate-400">
              {searchTerm || statusFilter || categoryFilter
                ? 'Try adjusting your search criteria'
                : 'No blog posts available'}
            </p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Blogs</p>
              <p className="text-2xl font-bold text-white">{blogs.length}</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Published</p>
              <p className="text-2xl font-bold text-white">
                {blogs.filter(b => b.status === 'published').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Pending</p>
              <p className="text-2xl font-bold text-white">
                {blogs.filter(b => b.status === 'pending').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Drafts</p>
              <p className="text-2xl font-bold text-white">
                {blogs.filter(b => b.status === 'draft').length}
              </p>
            </div>
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Likes</p>
              <p className="text-2xl font-bold text-white">
                {blogs.reduce((acc, blog) => acc + (blog.likes?.length || 0), 0)}
              </p>
            </div>
            <Heart className="h-8 w-8 text-red-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageBlogs;