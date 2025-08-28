const Team = require('../models/Team');
const User = require('../models/User');
const Invitation = require('../models/Invitation');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const createTeam = async (req, res) => {
  const { name, description, maxMembers, requiredSkills, hackathon, projectIdea, tags,githubRepo } = req.body;

  if (!name || !description) {
    throw new CustomError.BadRequestError('Please provide team name and description');
  }

  const team = await Team.create({
    name,
    description,
    leader: req.user.userId,
    maxMembers: maxMembers || 5,
    requiredSkills: requiredSkills || [],
    hackathon,
    projectIdea,
    githubRepo,
    tags: tags || [],
    members: [{
      user: req.user.userId,
      role: 'member',
    }],
  });

  await team.populate('leader', 'name email');
  await team.populate('members.user', 'name email skills');

  res.status(StatusCodes.CREATED).json({ team });
};

const getAllTeams = async (req, res) => {
  const { hackathon, status, search } = req.query;

  let queryObject = { isPublic: true };

  if (hackathon) {
    queryObject.hackathon = hackathon;
  }

  if (status) {
    queryObject.status = status;
  }

  let result = Team.find(queryObject);

  if (search) {
    result = result.find({
      $text: { $search: search }
    });
  }

  const teams = await result
    .populate('leader', 'name email')
    .populate('members.user', 'name email skills')
    .populate('hackathon', 'title startDate endDate')
    .sort('-createdAt');

  res.status(StatusCodes.OK).json({ teams, count: teams.length });
};

const getSingleTeam = async (req, res) => {
  const { id: teamId } = req.params;

  const team = await Team.findOne({ _id: teamId })
    .populate('leader', 'name email bio skills')
    .populate('members.user', 'name email bio skills')
    .populate('hackathon', 'title description startDate endDate');

  if (!team) {
    throw new CustomError.NotFoundError(`No team with id : ${teamId}`);
  }

  res.status(StatusCodes.OK).json({ team });
};

const updateTeam = async (req, res) => {
  const { id: teamId } = req.params;
  const { name, description, maxMembers, requiredSkills, projectIdea, tags, githubRepo } = req.body;

  const team = await Team.findOne({ _id: teamId });

  if (!team) {
    throw new CustomError.NotFoundError(`No team with id : ${teamId}`);
  }

  // Check if user is team leader
  if (team.leader.toString() !== req.user.userId) {
    throw new CustomError.UnauthorizedError('Not authorized to update this team');
  }

  if (name) team.name = name;
  if (description) team.description = description;
  if (maxMembers) team.maxMembers = maxMembers;
  if (requiredSkills) team.requiredSkills = requiredSkills;
  if (projectIdea) team.projectIdea = projectIdea;
  if (tags) team.tags = tags;
  if (githubRepo) team.githubRepo = githubRepo;

  await team.save();

  await team.populate('leader', 'name email');
  await team.populate('members.user', 'name email skills');

  res.status(StatusCodes.OK).json({ team });
};

const deleteTeam = async (req, res) => {
  const { id: teamId } = req.params;

  const team = await Team.findOne({ _id: teamId });

  if (!team) {
    throw new CustomError.NotFoundError(`No team with id : ${teamId}`);
  }

  // Check if user is team leader or admin
  if (req.user.role !== 'admin' && team.leader.toString() !== req.user.userId) {
    throw new CustomError.UnauthorizedError('Not authorized to delete this team');
  }

  await Team.findOneAndDelete({ _id: teamId });

  res.status(StatusCodes.OK).json({ msg: 'Success! Team removed.' });
};

const requestToJoinTeam = async (req, res) => {
  const { id: teamId } = req.params;
  const { message } = req.body;

  const team = await Team.findOne({ _id: teamId });

  if (!team) {
    throw new CustomError.NotFoundError(`No team with id : ${teamId}`);
  }

  if (team.status !== 'recruiting') {
    throw new CustomError.BadRequestError('Team is not recruiting');
  }

  if (team.members.length >= team.maxMembers) {
    throw new CustomError.BadRequestError('Team is full');
  }

  // Check if user is already a member
  const isAlreadyMember = team.members.some(
    member => member.user.toString() === req.user.userId
  );

  if (isAlreadyMember) {
    throw new CustomError.BadRequestError('You are already a member of this team');
  }

  // Check if there's already a pending request
  const existingRequest = await Invitation.findOne({
    type: 'team-request',
    from: req.user.userId,
    to: team.leader,
    team: teamId,
    status: 'pending'
  });

  if (existingRequest) {
    throw new CustomError.BadRequestError('You already have a pending request for this team');
  }

  // Get user info for the message
  const user = await User.findById(req.user.userId);

  // Create join request
  const invitation = await Invitation.create({
    type: 'team-request',
    from: req.user.userId,
    to: team.leader,
    team: teamId,
    message: message || `${user.name} wants to join your team "${team.name}"`
  });

  await invitation.populate('from', 'name email');
  await invitation.populate('team', 'name description');

  res.status(StatusCodes.CREATED).json({
    invitation,
    msg: 'Join request sent successfully'
  });
};

// Keep the old joinTeam for backward compatibility or direct invites
const joinTeam = async (req, res) => {
  const { id: teamId } = req.params;

  const team = await Team.findOne({ _id: teamId });

  if (!team) {
    throw new CustomError.NotFoundError(`No team with id : ${teamId}`);
  }

  if (team.status !== 'recruiting') {
    throw new CustomError.BadRequestError('Team is not recruiting');
  }

  if (team.members.length >= team.maxMembers) {
    throw new CustomError.BadRequestError('Team is full');
  }

  // Check if user is already a member
  const isAlreadyMember = team.members.some(
    member => member.user.toString() === req.user.userId
  );

  if (isAlreadyMember) {
    throw new CustomError.BadRequestError('You are already a member of this team');
  }

  team.members.push({
    user: req.user.userId,
    role: 'member',
  });

  // Update status if team is now full
  if (team.members.length >= team.maxMembers) {
    team.status = 'full';
  }

  await team.save();

  await team.populate('leader', 'name email');
  await team.populate('members.user', 'name email skills');

  res.status(StatusCodes.OK).json({ team });
};

const leaveTeam = async (req, res) => {
  const { id: teamId } = req.params;

  const team = await Team.findOne({ _id: teamId });

  if (!team) {
    throw new CustomError.NotFoundError(`No team with id : ${teamId}`);
  }

  // Check if user is team leader
  if (team.leader.toString() === req.user.userId) {
    throw new CustomError.BadRequestError('Team leader cannot leave the team. Transfer leadership or delete the team.');
  }

  // Remove user from members
  team.members = team.members.filter(
    member => member.user.toString() !== req.user.userId
  );

  // Update status if team is no longer full
  if (team.status === 'full' && team.members.length < team.maxMembers) {
    team.status = 'recruiting';
  }

  await team.save();

  res.status(StatusCodes.OK).json({ msg: 'Successfully left the team' });
};

const getMyTeams = async (req, res) => {
  const teams = await Team.find({
    $or: [
      { leader: req.user.userId },
      { 'members.user': req.user.userId }
    ]
  })
    .populate('leader', 'name email')
    .populate('members.user', 'name email skills')
    .populate('hackathon', 'title startDate endDate')
    .sort('-createdAt');

  res.status(StatusCodes.OK).json({ teams, count: teams.length });
};

module.exports = {
  createTeam,
  getAllTeams,
  getSingleTeam,
  updateTeam,
  deleteTeam,
  joinTeam,
  requestToJoinTeam,
  leaveTeam,
  getMyTeams,
};