const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide team name'],
    minlength: 3,
    maxlength: 50,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide team description'],
    maxlength: 500,
  },
  leader: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    role: {
      type: String,
      enum: ['member', 'co-leader'],
      default: 'member',
    },
  }],
  maxMembers: {
    type: Number,
    default: 5,
    min: 2,
    max: 10,
  },
  requiredSkills: [{
    type: String,
    trim: true,
  }],
  hackathon: {
    type: mongoose.Types.ObjectId,
    ref: 'Hackathon',
  },
  status: {
    type: String,
    enum: ['recruiting', 'full', 'disbanded'],
    default: 'recruiting',
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  projectIdea: {
    type: String,
    maxlength: 1000,
  },
  githubRepo: {
    type: String,
    validate: {
      validator: function (v) {
        return !v || /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+$/.test(v);
      },
      message: 'Please provide valid GitHub repository URL',
    },
  },
}, {
  timestamps: true,
});

// Index for searching teams
TeamSchema.index({ name: 'text', description: 'text', tags: 'text' });
TeamSchema.index({ hackathon: 1, status: 1 });

module.exports = mongoose.model('Team', TeamSchema);