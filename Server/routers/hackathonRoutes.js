const express = require('express');
const router = express.Router();
const {
  createHackathon,
  getAllHackathons,
  getSingleHackathon,
  updateHackathon,
  deleteHackathon,
  joinHackathon,
  leaveHackathon,
  bookmarkHackathon,
  getMyHackathons,
} = require('../controllers/hackathonController');

const { authenticateUser, authorizePermissions } = require('../middleware/authentication');

router.route('/')
  .get(getAllHackathons)
  .post(authenticateUser, authorizePermissions('admin'), createHackathon);

router.route('/my-hackathons').get(authenticateUser, getMyHackathons);

router.route('/:id')
  .get(getSingleHackathon)
  .patch(authenticateUser, authorizePermissions('admin'), updateHackathon)
  .delete(authenticateUser, authorizePermissions('admin'), deleteHackathon);

router.route('/:id/join').post(authenticateUser, joinHackathon);
router.route('/:id/leave').post(authenticateUser, leaveHackathon);
router.route('/:id/bookmark').post(authenticateUser, bookmarkHackathon);

module.exports = router;