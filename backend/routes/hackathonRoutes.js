const express = require('express');
const hackathonController = require('../controllers/hackathonController');
const auth = require('../middleware/auth');
const { createHackathonValidation, hackathonIdValidation } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/hackathons
// @desc    Create new hackathon
// @access  Private
router.post('/', auth, createHackathonValidation, hackathonController.createHackathon);

// @route   GET /api/hackathons
// @desc    Get all hackathons with filtering
// @access  Public
router.get('/', hackathonController.getHackathons);

// @route   GET /api/hackathons/upcoming
// @desc    Get upcoming hackathons
// @access  Public
router.get('/upcoming', hackathonController.getUpcomingHackathons);

// @route   GET /api/hackathons/stats
// @desc    Get hackathon statistics
// @access  Public
router.get('/stats', hackathonController.getHackathonStats);

// @route   GET /api/hackathons/:hackathonId
// @desc    Get hackathon by ID
// @access  Public
router.get('/:hackathonId', hackathonIdValidation, hackathonController.getHackathon);

// @route   PUT /api/hackathons/:hackathonId
// @desc    Update hackathon
// @access  Private
router.put('/:hackathonId', auth, hackathonIdValidation, createHackathonValidation, hackathonController.updateHackathon);

// @route   DELETE /api/hackathons/:hackathonId
// @desc    Delete hackathon
// @access  Private
router.delete('/:hackathonId', auth, hackathonIdValidation, hackathonController.deleteHackathon);

module.exports = router;