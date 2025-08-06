const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { updateProfileValidation, userIdValidation } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/users/profile/:userId
// @desc    Get user profile
// @access  Public
router.get('/profile/:userId', userIdValidation, userController.getProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, updateProfileValidation, userController.updateProfile);

// @route   GET /api/users/search
// @desc    Search users
// @access  Public
router.get('/search', userController.searchUsers);

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', auth, userController.getDashboard);

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private
router.get('/', auth, userController.getAllUsers);

module.exports = router;