const express = require('express');
const router = express.Router();
const {
  createTeam,
  getAllTeams,
  getSingleTeam,
  updateTeam,
  deleteTeam,
  joinTeam,
  requestToJoinTeam,
  leaveTeam,
  getMyTeams,
} = require('../controllers/teamController');

const { authenticateUser } = require('../middleware/authentication');

router.route('/')
  .get(getAllTeams)
  .post(authenticateUser, createTeam);

router.route('/my-teams').get(authenticateUser, getMyTeams);

router.route('/:id')
  .get(getSingleTeam)
  .patch(authenticateUser, updateTeam)
  .delete(authenticateUser, deleteTeam);

router.route('/:id/join').post(authenticateUser, joinTeam);
router.route('/:id/request').post(authenticateUser, requestToJoinTeam);
router.route('/:id/leave').post(authenticateUser, leaveTeam);

module.exports = router;