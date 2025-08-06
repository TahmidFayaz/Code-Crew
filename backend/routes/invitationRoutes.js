const express = require('express');
const invitationController = require('../controllers/invitationController');
const auth = require('../middleware/auth');
const { sendInvitationValidation, invitationIdValidation } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/invitations
// @desc    Send team invitation
// @access  Private
router.post('/', auth, sendInvitationValidation, invitationController.sendInvitation);

// @route   GET /api/invitations
// @desc    Get user's invitations (inbox)
// @access  Private
router.get('/', auth, invitationController.getInvitations);

// @route   GET /api/invitations/sent
// @desc    Get sent invitations
// @access  Private
router.get('/sent', auth, invitationController.getSentInvitations);

// @route   GET /api/invitations/stats
// @desc    Get invitation statistics
// @access  Private
router.get('/stats', auth, invitationController.getInvitationStats);

// @route   PUT /api/invitations/:invitationId/respond
// @desc    Respond to invitation (accept/decline)
// @access  Private
router.put('/:invitationId/respond', auth, invitationIdValidation, invitationController.respondToInvitation);

// @route   PUT /api/invitations/:invitationId/cancel
// @desc    Cancel invitation
// @access  Private
router.put('/:invitationId/cancel', auth, invitationIdValidation, invitationController.cancelInvitation);

module.exports = router;