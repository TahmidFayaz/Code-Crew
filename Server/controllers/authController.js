const User = require('../models/User');
const Token = require('../models/Token');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const {
  attachCookiesToResponse,
  createTokenUser,
  createHash,
} = require('../utils');
const crypto = require('crypto');

const register = async (req, res) => {
  const { email, name, password } = req.body;

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError('Email already exists');
  }

  // first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? 'admin' : 'user';

  const user = await User.create({
    name,
    email,
    password,
    role,
    isVerified: true, // Auto-verify users
    verified: Date.now(),
  });

  res.status(StatusCodes.CREATED).json({
    msg: 'Account created successfully! You can now log in.',
  });
};

// Email verification removed - users are auto-verified

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide email and password');
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }



  const tokenUser = createTokenUser(user);

  // create refresh token
  let refreshToken = '';
  // check for existing token
  const existingToken = await Token.findOne({ user: user._id });

  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    res.status(StatusCodes.OK).json({ user: tokenUser });
    return;
  }

  refreshToken = crypto.randomBytes(40).toString('hex');
  const userAgent = req.headers['user-agent'];
  const ip = req.ip;
  const userToken = { refreshToken, ip, userAgent, user: user._id };

  await Token.create(userToken);

  attachCookiesToResponse({ res, user: tokenUser, refreshToken });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res) => {
  await Token.findOneAndDelete({ user: req.user.userId });

  res.cookie('accessToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie('refreshToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomError.BadRequestError('Please provide valid email');
  }

  const user = await User.findOne({ email });

  if (user) {
    const passwordToken = crypto.randomBytes(70).toString('hex');

    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

    user.passwordToken = createHash(passwordToken);
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;

    await user.save();

    // Return the token directly instead of sending via email
    res.status(StatusCodes.OK).json({
      msg: 'Password reset token generated',
      token: passwordToken
    });
  } else {
    res.status(StatusCodes.OK).json({
      msg: 'If email exists, password reset token has been generated'
    });
  }
};

const resetPassword = async (req, res) => {
  const { token, email, password } = req.body;
  if (!token || !email || !password) {
    throw new CustomError.BadRequestError('Please provide all values');
  }
  const user = await User.findOne({ email });

  if (user) {
    const currentDate = new Date();

    if (
      user.passwordToken === createHash(token) &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;
      await user.save();
    }
  }

  res.status(StatusCodes.OK).json({ msg: 'Password reset successful' });
};

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
};