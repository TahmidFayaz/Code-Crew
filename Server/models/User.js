const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide email'],
    validate: {
      validator: validator.isEmail,
      message: 'Please provide valid email',
    },
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'moderator'],
    default: 'user',
  },
  // Profile fields
  bio: {
    type: String,
    maxlength: 500,
  },
  skills: [{
    type: String,
    trim: true,
  }],
  experience: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  github: {
    type: String,
    validate: {
      validator: function (v) {
        return !v || validator.isURL(v);
      },
      message: 'Please provide valid GitHub URL',
    },
  },
  linkedin: {
    type: String,
    validate: {
      validator: function (v) {
        return !v || validator.isURL(v);
      },
      message: 'Please provide valid LinkedIn URL',
    },
  },
  portfolio: {
    type: String,
    validate: {
      validator: function (v) {
        return !v || validator.isURL(v);
      },
      message: 'Please provide valid portfolio URL',
    },
  },
  // Personality dashboard
  personalityType: {
    type: String,
    enum: ['leader', 'collaborator', 'innovator', 'executor', 'analyst'],
  },
  workStyle: {
    type: String,
    enum: ['frontend', 'backend', 'fullstack', 'design', 'data', 'mobile'],
  },
  availability: {
    type: String,
    enum: ['full-time', 'part-time', 'weekends'],
    default: 'part-time',
  },
  location: {
    type: String,
    maxlength: 100,
  },
  isVerified: {
    type: Boolean,
    default: true,
  },
  verified: {
    type: Date,
    default: Date.now,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  bannedAt: {
    type: Date,
  },
  banReason: {
    type: String,
    maxlength: 500,
  },
  passwordToken: {
    type: String,
  },
  passwordTokenExpirationDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model('User', UserSchema);