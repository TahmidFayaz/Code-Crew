const express = require('express');
const blogController = require('../controllers/blogController');
const auth = require('../middleware/auth');
const { createBlogValidation, addCommentValidation, blogIdValidation } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/blogs
// @desc    Create new blog post
// @access  Private
router.post('/', auth, createBlogValidation, blogController.createBlog);

// @route   GET /api/blogs
// @desc    Get all blog posts with filtering
// @access  Public
router.get('/', blogController.getBlogs);

// @route   GET /api/blogs/trending
// @desc    Get trending blogs
// @access  Public
router.get('/trending', blogController.getTrendingBlogs);

// @route   GET /api/blogs/:blogId
// @desc    Get blog by ID
// @access  Public
router.get('/:blogId', blogIdValidation, blogController.getBlog);

// @route   PUT /api/blogs/:blogId
// @desc    Update blog post
// @access  Private
router.put('/:blogId', auth, blogIdValidation, createBlogValidation, blogController.updateBlog);

// @route   POST /api/blogs/:blogId/like
// @desc    Like/Unlike blog post
// @access  Private
router.post('/:blogId/like', auth, blogIdValidation, blogController.toggleLike);

// @route   POST /api/blogs/:blogId/comments
// @desc    Add comment to blog post
// @access  Private
router.post('/:blogId/comments', auth, blogIdValidation, addCommentValidation, blogController.addComment);

// @route   DELETE /api/blogs/:blogId
// @desc    Delete blog post
// @access  Private
router.delete('/:blogId', auth, blogIdValidation, blogController.deleteBlog);

module.exports = router;