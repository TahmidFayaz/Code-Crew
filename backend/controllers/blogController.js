const Blog = require('../models/Blog');
const User = require('../models/User');
const { validationResult } = require('express-validator');

class BlogController {
  // Create new blog post
  async createBlog(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user.userId;
      const blogData = {
        ...req.body,
        author: userId
      };

      // Generate excerpt if not provided
      if (!blogData.excerpt && blogData.content) {
        blogData.excerpt = blogData.content.substring(0, 200) + '...';
      }

      const blog = new Blog(blogData);
      await blog.save();

      await blog.populate('author', 'username profile.firstName profile.lastName profile.avatar');

      res.status(201).json({
        success: true,
        message: 'Blog post created successfully',
        data: { blog }
      });
    } catch (error) {
      console.error('Create blog error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get all blog posts with filtering
  async getBlogs(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        category, 
        tags, 
        author,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const query = { isPublished: true };

      if (category) {
        query.category = category;
      }

      if (tags) {
        const tagsArray = tags.split(',').map(tag => tag.trim());
        query.tags = { $in: tagsArray };
      }

      if (author) {
        query.author = author;
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const blogs = await Blog.find(query)
        .populate('author', 'username profile.firstName profile.lastName profile.avatar')
        .select('-content') // Exclude full content for list view
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort(sortOptions);

      const total = await Blog.countDocuments(query);

      res.json({
        success: true,
        data: {
          blogs,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total
          }
        }
      });
    } catch (error) {
      console.error('Get blogs error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get blog by ID
  async getBlog(req, res) {
    try {
      const { blogId } = req.params;

      const blog = await Blog.findById(blogId)
        .populate('author', 'username profile.firstName profile.lastName profile.avatar profile.bio')
        .populate('comments.author', 'username profile.firstName profile.lastName profile.avatar')
        .populate('comments.replies.author', 'username profile.firstName profile.lastName profile.avatar');

      if (!blog || !blog.isPublished) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found'
        });
      }

      // Increment view count
      blog.views += 1;
      await blog.save();

      res.json({
        success: true,
        data: { blog }
      });
    } catch (error) {
      console.error('Get blog error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update blog post
  async updateBlog(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { blogId } = req.params;
      const userId = req.user.userId;

      const blog = await Blog.findById(blogId);
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found'
        });
      }

      // Check if user is the author
      if (blog.author.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own blog posts'
        });
      }

      const updates = { ...req.body };
      delete updates.author; // Prevent author change
      delete updates.likes; // Prevent direct likes manipulation
      delete updates.comments; // Prevent direct comments manipulation

      const updatedBlog = await Blog.findByIdAndUpdate(
        blogId,
        { $set: updates },
        { new: true, runValidators: true }
      ).populate('author', 'username profile.firstName profile.lastName profile.avatar');

      res.json({
        success: true,
        message: 'Blog post updated successfully',
        data: { blog: updatedBlog }
      });
    } catch (error) {
      console.error('Update blog error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Like/Unlike blog post
  async toggleLike(req, res) {
    try {
      const { blogId } = req.params;
      const userId = req.user.userId;

      const blog = await Blog.findById(blogId);
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found'
        });
      }

      const isLiked = blog.likes.includes(userId);
      
      if (isLiked) {
        // Unlike
        blog.likes.pull(userId);
        await User.findByIdAndUpdate(userId, {
          $pull: { likedBlogs: blogId }
        });
      } else {
        // Like
        blog.likes.push(userId);
        await User.findByIdAndUpdate(userId, {
          $addToSet: { likedBlogs: blogId }
        });
      }

      await blog.save();

      res.json({
        success: true,
        message: isLiked ? 'Blog unliked' : 'Blog liked',
        data: {
          isLiked: !isLiked,
          likesCount: blog.likes.length
        }
      });
    } catch (error) {
      console.error('Toggle like error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Add comment to blog post
  async addComment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { blogId } = req.params;
      const userId = req.user.userId;
      const { content } = req.body;

      const blog = await Blog.findById(blogId);
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found'
        });
      }

      const comment = {
        author: userId,
        content,
        likes: [],
        replies: []
      };

      blog.comments.push(comment);
      await blog.save();

      await blog.populate('comments.author', 'username profile.firstName profile.lastName profile.avatar');

      const newComment = blog.comments[blog.comments.length - 1];

      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: { comment: newComment }
      });
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete blog post
  async deleteBlog(req, res) {
    try {
      const { blogId } = req.params;
      const userId = req.user.userId;

      const blog = await Blog.findById(blogId);
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found'
        });
      }

      // Check if user is the author
      if (blog.author.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own blog posts'
        });
      }

      // Remove blog from users' liked blogs
      await User.updateMany(
        { likedBlogs: blogId },
        { $pull: { likedBlogs: blogId } }
      );

      await Blog.findByIdAndDelete(blogId);

      res.json({
        success: true,
        message: 'Blog post deleted successfully'
      });
    } catch (error) {
      console.error('Delete blog error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get trending blogs
  async getTrendingBlogs(req, res) {
    try {
      const { limit = 5 } = req.query;

      // Get blogs with most likes and views in the last 7 days
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const blogs = await Blog.find({
        isPublished: true,
        createdAt: { $gte: weekAgo }
      })
        .populate('author', 'username profile.firstName profile.lastName profile.avatar')
        .select('-content')
        .sort({ 
          likes: -1, 
          views: -1, 
          createdAt: -1 
        })
        .limit(parseInt(limit));

      res.json({
        success: true,
        data: { blogs }
      });
    } catch (error) {
      console.error('Get trending blogs error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new BlogController();