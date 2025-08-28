const Blog = require('../models/Blog');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const createBlog = async (req, res) => {
  const { title, content, category, tags, featuredImage, relatedHackathon } = req.body;

  if (!title || !content || !category) {
    throw new CustomError.BadRequestError('Please provide title, content, and category');
  }

  const blog = await Blog.create({
    title,
    content,
    category,
    tags: tags || [],
    featuredImage,
    relatedHackathon,
    author: req.user.userId,
  });

  await blog.populate('author', 'name email');

  res.status(StatusCodes.CREATED).json({ blog });
};

const getAllBlogs = async (req, res) => {
  const { category, status, search, author } = req.query;

  let queryObject = {};

  // Only show published blogs for unauthenticated users or non-admin users
  if (!req.user || req.user.role !== 'admin') {
    queryObject.status = 'published';
  } else if (status) {
    // Handle multiple status values separated by comma
    if (status.includes(',')) {
      const statusArray = status.split(',').map(s => s.trim());
      queryObject.status = { $in: statusArray };
    } else {
      queryObject.status = status;
    }
  }

  if (category) {
    queryObject.category = category;
  }

  if (author) {
    queryObject.author = author;
  }

  let result = Blog.find(queryObject);

  if (search) {
    result = result.find({
      $text: { $search: search }
    });
  }

  const blogs = await result
    .populate('author', 'name email')
    .populate('relatedHackathon', 'title')
    .sort('-publishedAt -createdAt');

  res.status(StatusCodes.OK).json({ blogs, count: blogs.length });
};

const getSingleBlog = async (req, res) => {
  const { id: blogId } = req.params;

  const blog = await Blog.findOne({ _id: blogId })
    .populate('author', 'name email bio')
    .populate('relatedHackathon', 'title description')
    .populate('comments.user', 'name email')
    .populate('likes.user', 'name email');

  if (!blog) {
    throw new CustomError.NotFoundError(`No blog with id : ${blogId}`);
  }

  // Only allow viewing published blogs for unauthenticated users or non-admin users
  if ((!req.user || req.user.role !== 'admin') && blog.status !== 'published') {
    throw new CustomError.UnauthorizedError('Not authorized to view this blog');
  }

  // Increment view count
  blog.views += 1;
  await blog.save();

  res.status(StatusCodes.OK).json({ blog });
};

const updateBlog = async (req, res) => {
  const { id: blogId } = req.params;

  const blog = await Blog.findOne({ _id: blogId });

  if (!blog) {
    throw new CustomError.NotFoundError(`No blog with id : ${blogId}`);
  }

  // Check if user is admin or author
  if (req.user.role !== 'admin' && blog.author.toString() !== req.user.userId) {
    throw new CustomError.UnauthorizedError('Not authorized to update this blog');
  }

  const updatedBlog = await Blog.findOneAndUpdate(
    { _id: blogId },
    req.body,
    { new: true, runValidators: true }
  ).populate('author', 'name email');

  res.status(StatusCodes.OK).json({ blog: updatedBlog });
};

const deleteBlog = async (req, res) => {
  const { id: blogId } = req.params;

  const blog = await Blog.findOne({ _id: blogId });

  if (!blog) {
    throw new CustomError.NotFoundError(`No blog with id : ${blogId}`);
  }

  // Check if user is admin or author
  if (req.user.role !== 'admin' && blog.author.toString() !== req.user.userId) {
    throw new CustomError.UnauthorizedError('Not authorized to delete this blog');
  }

  await Blog.findOneAndDelete({ _id: blogId });

  res.status(StatusCodes.OK).json({ msg: 'Success! Blog removed.' });
};

const likeBlog = async (req, res) => {
  const { id: blogId } = req.params;

  const blog = await Blog.findOne({ _id: blogId });

  if (!blog) {
    throw new CustomError.NotFoundError(`No blog with id : ${blogId}`);
  }

  const existingLike = blog.likes.find(
    like => like.user.toString() === req.user.userId
  );

  if (existingLike) {
    // Remove like
    blog.likes = blog.likes.filter(
      like => like.user.toString() !== req.user.userId
    );
  } else {
    // Add like
    blog.likes.push({ user: req.user.userId });
  }

  await blog.save();

  res.status(StatusCodes.OK).json({
    msg: existingLike ? 'Like removed' : 'Blog liked',
    liked: !existingLike,
    likesCount: blog.likes.length
  });
};

const addComment = async (req, res) => {
  const { id: blogId } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new CustomError.BadRequestError('Please provide comment content');
  }

  const blog = await Blog.findOne({ _id: blogId });

  if (!blog) {
    throw new CustomError.NotFoundError(`No blog with id : ${blogId}`);
  }

  blog.comments.push({
    user: req.user.userId,
    content,
  });

  await blog.save();

  await blog.populate('comments.user', 'name email');

  const newComment = blog.comments[blog.comments.length - 1];

  res.status(StatusCodes.CREATED).json({ comment: newComment });
};

const deleteComment = async (req, res) => {
  const { id: blogId, commentId } = req.params;

  const blog = await Blog.findOne({ _id: blogId });

  if (!blog) {
    throw new CustomError.NotFoundError(`No blog with id : ${blogId}`);
  }

  const comment = blog.comments.id(commentId);

  if (!comment) {
    throw new CustomError.NotFoundError(`No comment with id : ${commentId}`);
  }

  // Check if user is admin, blog author, or comment author
  if (
    req.user.role !== 'admin' &&
    blog.author.toString() !== req.user.userId &&
    comment.user.toString() !== req.user.userId
  ) {
    throw new CustomError.UnauthorizedError('Not authorized to delete this comment');
  }

  blog.comments.pull(commentId);
  await blog.save();

  res.status(StatusCodes.OK).json({ msg: 'Comment deleted successfully' });
};

const getMyBlogs = async (req, res) => {
  const blogs = await Blog.find({ author: req.user.userId })
    .populate('author', 'name email')
    .populate('relatedHackathon', 'title')
    .sort('-createdAt');

  res.status(StatusCodes.OK).json({ blogs, count: blogs.length });
};

module.exports = {
  createBlog,
  getAllBlogs,
  getSingleBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  addComment,
  deleteComment,
  getMyBlogs,
};