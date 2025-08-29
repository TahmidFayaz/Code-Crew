const express = require('express');
const router = express.Router();
const {
  sendInvitation,
  getMyInvitations,
  getSentInvitations,
  respondToInvitation,
  cancelInvitation,
  deleteInvitation,
} = require('../controllers/invitationController');

const { authenticateUser } = require('../middleware/authentication');

router.route('/')
  .get(authenticateUser, getMyInvitations)
  .post(authenticateUser, sendInvitation);

router.route('/sent').get(authenticateUser, getSentInvitations);

router.route('/:id/respond').patch(authenticateUser, respondToInvitation);
router.route('/:id/cancel').patch(authenticateUser, cancelInvitation);
router.route('/:id').delete(authenticateUser, deleteInvitation);

module.exports = router;