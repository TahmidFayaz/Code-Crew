const Hackathon = require('../models/Hackathon');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const createHackathon = async (req, res) => {
  const {
    title,
    description,
    organizer,
    startDate,
    endDate,
    registrationDeadline,
    location,
    venue,
    maxParticipants,
    themes,
    prizes,
    rules,
    requirements,
    tags,
    difficulty,
    website,
    contactEmail,
  } = req.body;

  if (!title || !description || !organizer || !startDate || !endDate || !registrationDeadline) {
    throw new CustomError.BadRequestError('Please provide all required fields');
  }

  const hackathon = await Hackathon.create({
    title,
    description,
    organizer,
    startDate,
    endDate,
    registrationDeadline,
    location: location || 'online',
    venue,
    maxParticipants,
    themes: themes || [],
    prizes: prizes || [],
    rules,
    requirements: requirements || [],
    tags: tags || [],
    difficulty: difficulty || 'all-levels',
    website,
    contactEmail,
    createdBy: req.user.userId,
  });

  res.status(StatusCodes.CREATED).json({ hackathon });
};

const getAllHackathons = async (req, res) => {
  const { status, difficulty, location, search, upcoming } = req.query;

  let queryObject = {};

  if (status) {
    queryObject.status = status;
  }

  if (difficulty && difficulty !== 'all-levels') {
    queryObject.difficulty = difficulty;
  }

  if (location) {
    queryObject.location = location;
  }

  if (upcoming === 'true') {
    queryObject.startDate = { $gte: new Date() };
    queryObject.status = { $in: ['upcoming', 'ongoing'] };
  }

  let result = Hackathon.find(queryObject);

  if (search) {
    result = result.find({
      $text: { $search: search }
    });
  }

  const hackathons = await result
    .populate('createdBy', 'name email')
    .sort('startDate');

  res.status(StatusCodes.OK).json({ hackathons, count: hackathons.length });
};

const getSingleHackathon = async (req, res) => {
  const { id: hackathonId } = req.params;

  const hackathon = await Hackathon.findOne({ _id: hackathonId })
    .populate('createdBy', 'name email')
    .populate('participants.user', 'name email')
    .populate('participants.team', 'name');

  if (!hackathon) {
    throw new CustomError.NotFoundError(`No hackathon with id : ${hackathonId}`);
  }

  res.status(StatusCodes.OK).json({ hackathon });
};

const updateHackathon = async (req, res) => {
  const { id: hackathonId } = req.params;

  const hackathon = await Hackathon.findOne({ _id: hackathonId });

  if (!hackathon) {
    throw new CustomError.NotFoundError(`No hackathon with id : ${hackathonId}`);
  }

  // Check if user is admin or creator
  if (req.user.role !== 'admin' && hackathon.createdBy.toString() !== req.user.userId) {
    throw new CustomError.UnauthorizedError('Not authorized to update this hackathon');
  }

  const updatedHackathon = await Hackathon.findOneAndUpdate(
    { _id: hackathonId },
    req.body,
    { new: true, runValidators: true }
  );

  res.status(StatusCodes.OK).json({ hackathon: updatedHackathon });
};

const deleteHackathon = async (req, res) => {
  const { id: hackathonId } = req.params;

  const hackathon = await Hackathon.findOne({ _id: hackathonId });

  if (!hackathon) {
    throw new CustomError.NotFoundError(`No hackathon with id : ${hackathonId}`);
  }

  // Check if user is admin or creator
  if (req.user.role !== 'admin' && hackathon.createdBy.toString() !== req.user.userId) {
    throw new CustomError.UnauthorizedError('Not authorized to delete this hackathon');
  }

  await Hackathon.findOneAndDelete({ _id: hackathonId });

  res.status(StatusCodes.OK).json({ msg: 'Success! Hackathon removed.' });
};

const joinHackathon = async (req, res) => {
  const { id: hackathonId } = req.params;
  const { teamId } = req.body;

  const hackathon = await Hackathon.findOne({ _id: hackathonId });

  if (!hackathon) {
    throw new CustomError.NotFoundError(`No hackathon with id : ${hackathonId}`);
  }

  if (hackathon.status !== 'upcoming') {
    throw new CustomError.BadRequestError('Cannot join this hackathon');
  }

  if (new Date() > hackathon.registrationDeadline) {
    throw new CustomError.BadRequestError('Registration deadline has passed');
  }

  if (hackathon.maxParticipants && hackathon.currentParticipants >= hackathon.maxParticipants) {
    throw new CustomError.BadRequestError('Hackathon is full');
  }

  // Check if user is already registered
  const isAlreadyRegistered = hackathon.participants.some(
    participant => participant.user.toString() === req.user.userId
  );

  if (isAlreadyRegistered) {
    throw new CustomError.BadRequestError('You are already registered for this hackathon');
  }

  hackathon.participants.push({
    user: req.user.userId,
    team: teamId || null,
  });

  hackathon.currentParticipants += 1;

  await hackathon.save();

  res.status(StatusCodes.OK).json({ msg: 'Successfully joined hackathon' });
};

const leaveHackathon = async (req, res) => {
  const { id: hackathonId } = req.params;

  const hackathon = await Hackathon.findOne({ _id: hackathonId });

  if (!hackathon) {
    throw new CustomError.NotFoundError(`No hackathon with id : ${hackathonId}`);
  }

  // Remove user from participants
  const initialLength = hackathon.participants.length;
  hackathon.participants = hackathon.participants.filter(
    participant => participant.user.toString() !== req.user.userId
  );

  if (hackathon.participants.length === initialLength) {
    throw new CustomError.BadRequestError('You are not registered for this hackathon');
  }

  hackathon.currentParticipants -= 1;

  await hackathon.save();

  res.status(StatusCodes.OK).json({ msg: 'Successfully left hackathon' });
};

const bookmarkHackathon = async (req, res) => {
  const { id: hackathonId } = req.params;

  const hackathon = await Hackathon.findOne({ _id: hackathonId });

  if (!hackathon) {
    throw new CustomError.NotFoundError(`No hackathon with id : ${hackathonId}`);
  }

  const isBookmarked = hackathon.bookmarkedBy.includes(req.user.userId);

  if (isBookmarked) {
    // Remove bookmark
    hackathon.bookmarkedBy = hackathon.bookmarkedBy.filter(
      userId => userId.toString() !== req.user.userId
    );
  } else {
    // Add bookmark
    hackathon.bookmarkedBy.push(req.user.userId);
  }

  await hackathon.save();

  res.status(StatusCodes.OK).json({
    msg: isBookmarked ? 'Bookmark removed' : 'Hackathon bookmarked',
    bookmarked: !isBookmarked
  });
};

const getMyHackathons = async (req, res) => {
  const { type } = req.query; // 'joined', 'bookmarked', 'created'

  let hackathons = [];

  if (type === 'joined') {
    hackathons = await Hackathon.find({
      'participants.user': req.user.userId
    }).populate('createdBy', 'name email');
  } else if (type === 'bookmarked') {
    hackathons = await Hackathon.find({
      bookmarkedBy: req.user.userId
    }).populate('createdBy', 'name email');
  } else if (type === 'created') {
    hackathons = await Hackathon.find({
      createdBy: req.user.userId
    }).populate('createdBy', 'name email');
  } else {
    // Return all user's hackathons
    hackathons = await Hackathon.find({
      $or: [
        { 'participants.user': req.user.userId },
        { bookmarkedBy: req.user.userId },
        { createdBy: req.user.userId }
      ]
    }).populate('createdBy', 'name email');
  }

  res.status(StatusCodes.OK).json({ hackathons, count: hackathons.length });
};

module.exports = {
  createHackathon,
  getAllHackathons,
  getSingleHackathon,
  updateHackathon,
  deleteHackathon,
  joinHackathon,
  leaveHackathon,
  bookmarkHackathon,
  getMyHackathons,
};