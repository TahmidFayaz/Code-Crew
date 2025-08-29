import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { blogService } from '../services/blogs';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Heart,
  MessageCircle,
  Clock,
  User,
  Calendar,
  Eye,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchBlogs();
  }, [searchTerm, categoryFilter]);

  const fetchBlogs = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter) params.category = categoryFilter;

      const data = await blogService.getAllBlogs(params);
      setBlogs(data.blogs);
    } catch {
      toast.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (blogId) => {
    try {
      await blogService.likeBlog(blogId);
      toast.success('Blog liked!');
      fetchBlogs();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to like blog');
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
      case 'tips': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'success-stories': return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'tutorials': return 'bg-purple-600/20 text-purple-400 border-purple-600/30';
      case 'announcements': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'interviews': return 'bg-pink-600/20 text-pink-400 border-pink-600/30';
      default: return 'bg-slate-600/20 text-slate-400 border-slate-600/30';
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
          <h1 className="text-3xl font-bold text-white">Blogs</h1>
          <p className="text-slate-400">Stories, tips, and insights from the community</p>
        </div>
        <Link
          to="/blogs/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Write Blog</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <div className="flex flex-col sm:flex-row gap-4">
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
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-slate-400" />
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

      {/* Blogs Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <article key={blog._id} className="bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors overflow-hidden">
            {blog.featuredImage && (
              <div className="aspect-video overflow-hidden">
                <img
                  src={blog.featuredImage}
                  alt={blog.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(blog.category)}`}>
                  {blog.category.replace('-', ' ')}
                </span>
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span>{blog.readTime} min read</span>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-white mb-2 line-clamp-2">
                <Link
                  to={`/blogs/${blog._id}`}
                  className="hover:text-blue-400 transition-colors"
                >
                  {blog.title}
                </Link>
              </h2>

              <p className="text-slate-300 mb-4 line-clamp-3 text-sm">
                {blog.excerpt}
              </p>

              {blog.tags && blog.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {blog.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full flex items-center space-x-1"
                      >
                        <Tag className="h-3 w-3" />
                        <span>{tag}</span>
                      </span>
                    ))}
                    {blog.tags.length > 3 && (
                      <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
                        +{blog.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <img
                      src={`https://ui-avatars.com/api/?name=${blog.author.name}&size=24&background=3B82F6&color=fff`}
                      alt={blog.author.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-slate-400">{blog.author.name}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-slate-400">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(blog.publishedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700">
                <div className="flex items-center space-x-4 text-sm text-slate-400">
                  <button
                    onClick={() => handleLike(blog._id)}
                    className="flex items-center space-x-1 hover:text-red-400 transition-colors"
                  >
                    <Heart className="h-4 w-4" />
                    <span>{blog.likes.length}</span>
                  </button>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{blog.comments.length}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{blog.views}</span>
                  </div>
                </div>
                <Link
                  to={`/blogs/${blog._id}`}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Read More
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {blogs.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No blogs found</h3>
          <p className="text-slate-400 mb-4">
            {searchTerm || categoryFilter
              ? 'Try adjusting your search criteria'
              : 'Be the first to share your story!'}
          </p>
          <Link
            to="/blogs/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Write Blog</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Blogs;