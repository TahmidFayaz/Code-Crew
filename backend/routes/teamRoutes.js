const express = require('express');
const teamController = require('../controllers/teamController');
const auth = require('../middleware/auth');
const { createTeamValidation, teamIdValidation, userIdValidation } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/teams
// @desc    Create new team
// @access  Private
router.post('/', auth, createTeamValidation, teamController.createTeam);

// @route   GET /api/teams
// @desc    Get all teams with filtering
// @access  Public
router.get('/', teamController.getTeams);

// @route   GET /api/teams/:teamId
// @desc    Get team by ID
// @access  Public
router.get('/:teamId', teamIdValidation, teamController.getTeam);

// @route   PUT /api/teams/:teamId
// @desc    Update team
// @access  Private
router.put('/:teamId', auth, teamIdValidation, createTeamValidation, teamController.updateTeam);

// @route   POST /api/teams/:teamId/join
// @desc    Request to join team
// @access  Private
router.post('/:teamId/join', auth, teamIdValidation, teamController.requestToJoin);

// @route   DELETE /api/teams/:teamId/members/:memberId
// @desc    Remove member from team
// @access  Private
router.delete('/:teamId/members/:memberId', auth, teamIdValidation, userIdValidation, teamController.removeMember);

// @route   DELETE /api/teams/:teamId
// @desc    Delete team
// @access  Private
router.delete('/:teamId', auth, teamIdValidation, teamController.deleteTeam);

module.exports = router;