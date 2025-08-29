const Invitation = require('../models/Invitation');
const Team = require('../models/Team');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const sendInvitation = async (req, res) => {
  const { type, to, team, hackathon, message } = req.body;

  if (!type || !to) {
    throw new CustomError.BadRequestError('Please provide invitation type and recipient');
  }

  // Check if recipient exists
  const recipient = await User.findById(to);
  if (!recipient) {
    throw new CustomError.NotFoundError('Recipient not found');
  }

  // Validate based on invitation type
  if (type === 'team-invite' && !team) {
    throw new CustomError.BadRequestError('Team is required for team invitations');
  }

  if (type === 'team-invite') {
    // Check if sender is team leader
    const teamDoc = await Team.findById(team);
    if (!teamDoc) {
      throw new CustomError.NotFoundError('Team not found');
    }

    if (teamDoc.leader.toString() !== req.user.userId) {
      throw new CustomError.UnauthorizedError('Only team leaders can send team invitations');
    }

    // Check if team is full
    if (teamDoc.members.length >= teamDoc.maxMembers) {
      throw new CustomError.BadRequestError('Team is full');
    }

    // Check if user is already a member
    const isAlreadyMember = teamDoc.members.some(
      member => member.user.toString() === to
    );
    if (isAlreadyMember) {
      throw new CustomError.BadRequestError('User is already a team member');
    }
  }

  // Check for existing pending invitation
  const existingInvitation = await Invitation.findOne({
    type,
    from: req.user.userId,
    to,
    team,
    hackathon,
    status: 'pending',
  });

  if (existingInvitation) {
    throw new CustomError.BadRequestError('Invitation already sent');
  }

  const invitation = await Invitation.create({
    type,
    from: req.user.userId,
    to,
    team,
    hackathon,
    message,
  });

  await invitation.populate('from', 'name email');
  await invitation.populate('to', 'name email');
  await invitation.populate('team', 'name description');

  res.status(StatusCodes.CREATED).json({ invitation });
};

const getMyInvitations = async (req, res) => {
  const { type, status } = req.query;

  let queryObject = { to: req.user.userId };

  if (type) {
    queryObject.type = type;
  }

  if (status) {
    queryObject.status = status;
  } else {
    queryObject.status = 'pending'; // Default to pending invitations
  }

  const invitations = await Invitation.find(queryObject)
    .populate('from', 'name email')
    .populate('team', 'name description leader')
    .populate('hackathon', 'title description')
    .sort('-createdAt');

  res.status(StatusCodes.OK).json({ invitations, count: invitations.length });
};

const getSentInvitations = async (req, res) => {
  const { type, status } = req.query;

  let queryObject = { from: req.user.userId };

  if (type) {
    queryObject.type = type;
  }

  if (status) {
    queryObject.status = status;
  }

  const invitations = await Invitation.find(queryObject)
    .populate('from', 'name email')
    .populate('to', 'name email')
    .populate('team', 'name description')
    .populate('hackathon', 'title description')
    .sort('-createdAt');

  res.status(StatusCodes.OK).json({ invitations, count: invitations.length });
};

const respondToInvitation = async (req, res) => {
  const { id: invitationId } = req.params;
  const { response } = req.body; // 'accepted' or 'declined'

  if (!response || !['accepted', 'declined'].includes(response)) {
    throw new CustomError.BadRequestError('Please provide valid response (accepted or declined)');
  }

  const invitation = await Invitation.findOne({
    _id: invitationId,
    to: req.user.userId,
    status: 'pending'
  });

  if (!invitation) {
    throw new CustomError.NotFoundError('Invitation not found or already responded');
  }

  invitation.status = response;
  invitation.respondedAt = new Date();

  // If accepted and it's a team invitation or request, add user to team
  if (response === 'accepted' && (invitation.type === 'team-invite' || invitation.type === 'team-request')) {
    console.log('Processing team acceptance:', { invitationType: invitation.type, teamId: invitation.team });

    const team = await Team.findById(invitation.team);

    if (!team) {
      throw new CustomError.NotFoundError('Team not found');
    }

    console.log('Team found:', { teamName: team.name, currentMembers: team.members.length, maxMembers: team.maxMembers });

    // Check if team is still recruiting and not full
    if (team.status !== 'recruiting') {
      throw new CustomError.BadRequestError('Team is no longer recruiting');
    }

    if (team.members.length >= team.maxMembers) {
      throw new CustomError.BadRequestError('Team is now full');
    }

    // For team-request, the user who sent the request should be added
    const userToAdd = invitation.type === 'team-request' ? invitation.from : invitation.to;
    console.log('Adding user to team:', { userToAdd, invitationType: invitation.type });

    // Check if user is not already a member (double-check)
    const isAlreadyMember = team.members.some(
      member => member.user.toString() === userToAdd.toString()
    );

    if (!isAlreadyMember) {
      team.members.push({
        user: userToAdd,
        role: 'member',
      });

      // Update team status if now full
      if (team.members.length >= team.maxMembers) {
        team.status = 'full';
      }

      await team.save();
      console.log('User added to team successfully. New member count:', team.members.length);
    } else {
      console.log('User is already a member of the team');
    }

    // Create a notification for the user who requested to join (if it's a team-request)
    if (invitation.type === 'team-request') {
      await Invitation.create({
        type: 'team-accepted',
        from: req.user.userId,
        to: invitation.from,
        team: invitation.team,
        message: `Your request to join "${team.name}" has been accepted!`,
        status: 'pending'
      });
      console.log('Acceptance notification created');
    }
  }

  // Send notification for declined team requests
  if (response === 'declined' && invitation.type === 'team-request') {
    const team = await Team.findById(invitation.team);
    if (team) {
      await Invitation.create({
        type: 'team-declined',
        from: req.user.userId,
        to: invitation.from,
        team: invitation.team,
        message: `Your request to join "${team.name}" has been declined.`,
        status: 'pending'
      });
    }
  }

  await invitation.save();

  await invitation.populate('from', 'name email');
  await invitation.populate('team', 'name description');

  res.status(StatusCodes.OK).json({
    invitation,
    msg: `Invitation ${response} successfully`
  });
};

const cancelInvitation = async (req, res) => {
  const { id: invitationId } = req.params;

  const invitation = await Invitation.findOne({
    _id: invitationId,
    from: req.user.userId,
    status: 'pending'
  });

  if (!invitation) {
    throw new CustomError.NotFoundError('Invitation not found or cannot be cancelled');
  }

  invitation.status = 'cancelled';
  await invitation.save();

  res.status(StatusCodes.OK).json({ msg: 'Invitation cancelled successfully' });
};

const deleteInvitation = async (req, res) => {
  const { id: invitationId } = req.params;

  const invitation = await Invitation.findOne({
    _id: invitationId,
    $or: [
      { from: req.user.userId },
      { to: req.user.userId }
    ]
  });

  if (!invitation) {
    throw new CustomError.NotFoundError('Invitation not found');
  }

  await Invitation.findOneAndDelete({ _id: invitationId });

  res.status(StatusCodes.OK).json({ msg: 'Invitation deleted successfully' });
};

module.exports = {
  sendInvitation,
  getMyInvitations,
  getSentInvitations,
  respondToInvitation,
  cancelInvitation,
  deleteInvitation,
};