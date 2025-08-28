const express = require('express');
const router = express.Router();
const {
  createBlog,
  getAllBlogs,
  getSingleBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  addComment,
  deleteComment,
  getMyBlogs,
} = require('../controllers/blogController');

const { authenticateUser, optionalAuthenticateUser, authorizePermissions } = require('../middleware/authentication');

router.route('/')
  .get(optionalAuthenticateUser, getAllBlogs)
  .post(authenticateUser, createBlog);

router.route('/my-blogs').get(authenticateUser, getMyBlogs);

router.route('/:id')
  .get(optionalAuthenticateUser, getSingleBlog)
  .patch(authenticateUser, updateBlog)
  .delete(authenticateUser, deleteBlog);

router.route('/:id/like').post(authenticateUser, likeBlog);
router.route('/:id/comments').post(authenticateUser, addComment);
router.route('/:id/comments/:commentId').delete(authenticateUser, deleteComment);

module.exports = router;