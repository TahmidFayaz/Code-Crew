const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'co-leader'],
      default: 'member'
    }
  }],
  maxMembers: {
    type: Number,
    default: 5,
    min: 2,
    max: 10
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  hackathon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon'
  },
  status: {
    type: String,
    enum: ['recruiting', 'full', 'inactive'],
    default: 'recruiting'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Update status based on member count
teamSchema.pre('save', function(next) {
  if (this.members.length >= this.maxMembers) {
    this.status = 'full';
  } else if (this.status === 'full' && this.members.length < this.maxMembers) {
    this.status = 'recruiting';
  }
  next();
});

module.exports = mongoose.model('Team', teamSchema);