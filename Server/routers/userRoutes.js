const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
  searchUsers,
  banUser,
  unbanUser,
  getAllUsersAdmin,
} = require('../controllers/userController');

const { authenticateUser, authorizePermissions } = require('../middleware/authentication');

router.route('/').get(authenticateUser, authorizePermissions('admin'), getAllUsers);
router.route('/search').get(authenticateUser, searchUsers);
router.route('/showMe').get(authenticateUser, showCurrentUser);
router.route('/updateUser').patch(authenticateUser, updateUser);
router.route('/updateUserPassword').patch(authenticateUser, updateUserPassword);

// Admin routes
router.route('/admin/all').get(authenticateUser, authorizePermissions('admin'), getAllUsersAdmin);
router.route('/admin/:id/ban').patch(authenticateUser, authorizePermissions('admin'), banUser);
router.route('/admin/:id/unban').patch(authenticateUser, authorizePermissions('admin'), unbanUser);

router.route('/:id').get(authenticateUser, getSingleUser);

module.exports = router;