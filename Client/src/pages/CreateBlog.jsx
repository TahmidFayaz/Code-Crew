import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogService } from '../services/blogs';
import { useAuth } from '../hooks/useAuth';
import { BookOpen, Plus, X, ArrowLeft, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateBlog = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'tips',
    tags: [],
    featuredImage: '',
    readTime: 5
  });
  const [tagInput, setTagInput] = useState('');

  const categories = [
    { value: 'tips', label: 'Tips & Tricks' },
    { value: 'success-stories', label: 'Success Stories' },
    { value: 'tutorials', label: 'Tutorials' },
    { value: 'announcements', label: 'Announcements' },
    { value: 'interviews', label: 'Interviews' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const estimateReadTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  const handleContentChange = (e) => {
    const content = e.target.value;
    setFormData(prev => ({
      ...prev,
      content,
      readTime: estimateReadTime(content)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await blogService.createBlog(formData);
      toast.success('Blog submitted for approval! It will be published once reviewed by an admin.');
      navigate('/blogs');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to create blog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/blogs')}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Write Blog</h1>
            <p className="text-slate-400">Share your story with the community</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>{preview ? 'Edit' : 'Preview'}</span>
          </button>
        </div>
      </div>

      {!preview ? (
        /* Edit Mode */
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your blog title"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Excerpt *
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                required
                rows={2}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of your blog post..."
              />
            </div>

            {/* Category and Read Time */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Estimated Read Time
                </label>
                <div className="px-4 py-2 bg-slate-700 border border-slate-600 text-slate-400 rounded-lg">
                  {formData.readTime} min read
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Featured Image URL
              </label>
              <input
                type="url"
                name="featuredImage"
                value={formData.featuredImage}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tags
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a tag (e.g., hackathon, coding, tips)"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-600/20 text-blue-400 border border-blue-600/30 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Content *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleContentChange}
                required
                rows={15}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="Write your blog content here... You can use Markdown formatting."
              />
              <p className="text-xs text-slate-400 mt-1">
                Supports Markdown formatting. Your blog will be reviewed by an admin before publication.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700">
              <button
                type="button"
                onClick={() => navigate('/blogs')}
                className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg flex items-center space-x-2"
              >
                <BookOpen className="h-4 w-4" />
                <span>{loading ? 'Submitting...' : 'Submit for Review'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Preview Mode */
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="prose prose-invert max-w-none">
            {formData.featuredImage && (
              <img
                src={formData.featuredImage}
                alt={formData.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            <h1 className="text-3xl font-bold text-white mb-4">{formData.title || 'Blog Title'}</h1>
            <p className="text-slate-400 mb-6">{formData.excerpt || 'Blog excerpt...'}</p>
            <div className="whitespace-pre-wrap text-slate-300">
              {formData.content || 'Blog content will appear here...'}
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-700">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-600/20 text-blue-400 border border-blue-600/30 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateBlog;