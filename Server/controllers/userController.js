const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: 'user' }).select('-password');
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select('-password');
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${req.params.id}`);
  }
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
  const {
    name,
    email,
    bio,
    skills,
    experience,
    github,
    linkedin,
    portfolio,
    personalityType,
    workStyle,
    availability,
    location
  } = req.body;

  if (!name || !email) {
    throw new CustomError.BadRequestError('Please provide all values');
  }

  const user = await User.findOne({ _id: req.user.userId });

  user.email = email;
  user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (skills !== undefined) user.skills = skills;
  if (experience !== undefined) user.experience = experience;
  if (github !== undefined) user.github = github;
  if (linkedin !== undefined) user.linkedin = linkedin;
  if (portfolio !== undefined) user.portfolio = portfolio;
  if (personalityType !== undefined) user.personalityType = personalityType;
  if (workStyle !== undefined) user.workStyle = workStyle;
  if (availability !== undefined) user.availability = availability;
  if (location !== undefined) user.location = location;

  await user.save();

  const tokenUser = {
    name: user.name,
    userId: user._id,
    role: user.role,
    email: user.email,
  };

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError('Please provide both values');
  }
  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }
  user.password = newPassword;

  await user.save();
  res.status(StatusCodes.OK).json({ msg: 'Success! Password Updated.' });
};

const searchUsers = async (req, res) => {
  const { query, skills, experience, workStyle, availability } = req.query;

  let searchCriteria = { role: 'user' };

  if (query) {
    searchCriteria.$or = [
      { name: { $regex: query, $options: 'i' } },
      { bio: { $regex: query, $options: 'i' } },
    ];
  }

  if (skills) {
    const skillsArray = skills.split(',').map(skill => skill.trim());
    searchCriteria.skills = { $in: skillsArray };
  }

  if (experience) {
    searchCriteria.experience = experience;
  }

  if (workStyle) {
    searchCriteria.workStyle = workStyle;
  }

  if (availability) {
    searchCriteria.availability = availability;
  }

  const users = await User.find(searchCriteria)
    .select('-password')
    .limit(20);

  res.status(StatusCodes.OK).json({ users, count: users.length });
};

// Admin functions
const banUser = async (req, res) => {
  const { id: userId } = req.params;
  const { reason } = req.body;

  const user = await User.findOne({ _id: userId });

  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${userId}`);
  }

  if (user.role === 'admin') {
    throw new CustomError.BadRequestError('Cannot ban admin users');
  }

  if (user.isBanned) {
    throw new CustomError.BadRequestError('User is already banned');
  }

  user.isBanned = true;
  user.bannedAt = new Date();
  user.banReason = reason || 'No reason provided';

  await user.save();

  res.status(StatusCodes.OK).json({
    msg: 'User banned successfully',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isBanned: user.isBanned,
      bannedAt: user.bannedAt,
      banReason: user.banReason
    }
  });
};

const unbanUser = async (req, res) => {
  const { id: userId } = req.params;

  const user = await User.findOne({ _id: userId });

  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${userId}`);
  }

  if (!user.isBanned) {
    throw new CustomError.BadRequestError('User is not banned');
  }

  user.isBanned = false;
  user.bannedAt = undefined;
  user.banReason = undefined;

  await user.save();

  res.status(StatusCodes.OK).json({
    msg: 'User unbanned successfully',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isBanned: user.isBanned
    }
  });
};

const updateUserRole = async (req, res) => {
  const { id: userId } = req.params;
  const { role } = req.body;

  if (!['user', 'moderator', 'admin'].includes(role)) {
    throw new CustomError.BadRequestError('Invalid role provided');
  }

  const user = await User.findOne({ _id: userId });

  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${userId}`);
  }

  // Prevent changing the role of the last admin
  if (user.role === 'admin' && role !== 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      throw new CustomError.BadRequestError('Cannot change role of the last admin');
    }
  }

  user.role = role;
  await user.save();

  res.status(StatusCodes.OK).json({
    msg: 'User role updated successfully',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

const getAllUsersAdmin = async (req, res) => {
  const { status, role, search } = req.query;

  let queryObject = {};

  if (status === 'banned') {
    queryObject.isBanned = true;
  } else if (status === 'active') {
    queryObject.isBanned = { $ne: true };
  }

  if (role) {
    queryObject.role = role;
  }

  if (search) {
    queryObject.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(queryObject)
    .select('-password')
    .sort('-createdAt');

  res.status(StatusCodes.OK).json({ users, count: users.length });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
  searchUsers,
  // Admin functions
  banUser,
  unbanUser,
  updateUserRole,
  getAllUsersAdmin,
};