const express = require('express');
const router = express.Router();

// Import controllers
const {
  getDashboardStats
} = require('../controllers/adminController');

const {
  createBlog,
  updateBlog,
  deleteBlog,
  getAllBlogs,
} = require('../controllers/blogController');

const {
  createHackathon,
  updateHackathon,
  deleteHackathon,
  getAllHackathons,
} = require('../controllers/hackathonController');

const {
  deleteTeam,
  getAllTeams,
} = require('../controllers/teamController');

const {
  banUser,
  unbanUser,
  updateUserRole,
  getAllUsersAdmin,
} = require('../controllers/userController');

const { authenticateUser, authorizePermissions } = require('../middleware/authentication');

// All admin routes require authentication and admin role
router.use(authenticateUser, authorizePermissions('admin'));

// Dashboard stats
router.route('/dashboard/stats').get(getDashboardStats);

// Blog management
router.route('/blogs')
  .get(getAllBlogs)
  .post(createBlog);

router.route('/blogs/:id')
  .patch(updateBlog)
  .delete(deleteBlog);

// Hackathon management
router.route('/hackathons')
  .get(getAllHackathons)
  .post(createHackathon);

router.route('/hackathons/:id')
  .patch(updateHackathon)
  .delete(deleteHackathon);

// Team management
router.route('/teams')
  .get(getAllTeams);

router.route('/teams/:id')
  .delete(deleteTeam);

// User management
router.route('/users')
  .get(getAllUsersAdmin);

router.route('/users/:id/ban')
  .patch(banUser);

router.route('/users/:id/unban')
  .patch(unbanUser);

router.route('/users/:id/role')
  .patch(updateUserRole);

module.exports = router;