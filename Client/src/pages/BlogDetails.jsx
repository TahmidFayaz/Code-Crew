import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blogService } from '../services/blogs';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Eye,
  Calendar,
  Clock,
  Tag,
  Send
} from 'lucide-react';
import toast from 'react-hot-toast';

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchBlogDetails();
  }, [id]);

  const fetchBlogDetails = useCallback(async () => {
    try {
      const data = await blogService.getBlogById(id);
      // Ensure likes and comments arrays exist
      const blog = {
        ...data.blog,
        likes: data.blog.likes || [],
        comments: data.blog.comments || []
      };
      setBlog(blog);
    } catch {
      toast.error('Failed to fetch blog details');
      navigate('/blogs');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const handleLike = async () => {
    try {
      await blogService.likeBlog(id);
      fetchBlogDetails();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to like blog');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommenting(true);
    try {
      await blogService.commentOnBlog(id, { content: newComment });
      setNewComment('');
      toast.success('Comment added!');
      fetchBlogDetails();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to add comment');
    } finally {
      setCommenting(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInHours = Math.floor((now - commentDate) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(date);
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

  const isLiked = blog?.likes?.some(like => like.user._id === user?.userId || like.user === user?.userId);

  if (loading) {
    return <LoadingSpinner size="lg" className="min-h-64" />;
  }

  if (!blog) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-white mb-2">Blog not found</h3>
        <button
          onClick={() => navigate('/blogs')}
          className="text-blue-400 hover:text-blue-300"
        >
          Back to Blogs
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/blogs')}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">{blog.title}</h1>
        </div>
      </div>

      {/* Blog Content */}
      <article className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        {/* Featured Image */}
        {blog.featuredImage && (
          <div className="aspect-video overflow-hidden">
            <img
              src={blog.featuredImage}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-slate-700">
            <div className="flex items-center space-x-2">
              <img
                src={`https://ui-avatars.com/api/?name=${blog.author.name}&size=32&background=3B82F6&color=fff`}
                alt={blog.author.name}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="text-white font-medium">{blog.author.name}</p>
                <div className="flex items-center space-x-3 text-sm text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(blog.publishedAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{blog.readTime} min read</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getCategoryColor(blog.category)}`}>
                {blog.category.replace('-', ' ')}
              </span>
              <div className="flex items-center space-x-4 text-sm text-slate-400">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{blog.views}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4" />
                  <span>{blog.likes?.length || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{blog.comments?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none mb-6">
            <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
              {blog.content}
            </div>
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mb-6 pb-6 border-b border-slate-700">
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm flex items-center space-x-1"
                  >
                    <Tag className="h-3 w-3" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isLiked
                ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{blog.likes?.length || 0} {(blog.likes?.length || 0) === 1 ? 'Like' : 'Likes'}</span>
            </button>
          </div>

          {/* Comments Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">
              Comments ({blog.comments?.length || 0})
            </h3>

            {/* Add Comment Form */}
            {user && (
              <form onSubmit={handleComment} className="space-y-4">
                <div className="flex items-start space-x-3">
                  <img
                    src={`https://ui-avatars.com/api/?name=${user.name}&size=32&background=3B82F6&color=fff`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      rows={3}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        disabled={commenting || !newComment.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                      >
                        <Send className="h-4 w-4" />
                        <span>{commenting ? 'Posting...' : 'Post Comment'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {(!blog.comments || blog.comments.length === 0) ? (
                <div className="text-center py-8">
                  <MessageCircle className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-slate-400">No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                (blog.comments || []).map((comment) => (
                  <div key={comment._id} className="flex items-start space-x-3 p-4 bg-slate-700 rounded-lg">
                    <img
                      src={`https://ui-avatars.com/api/?name=${comment.user?.name || 'Anonymous'}&size=32&background=3B82F6&color=fff`}
                      alt={comment.user?.name || 'Anonymous'}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-white font-medium">{comment.user?.name || 'Anonymous'}</span>
                        <span className="text-slate-400 text-sm">
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-300">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogDetails;