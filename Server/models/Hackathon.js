const mongoose = require('mongoose');

const HackathonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide hackathon title'],
    minlength: 3,
    maxlength: 100,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide hackathon description'],
    maxlength: 2000,
  },
  organizer: {
    type: String,
    required: [true, 'Please provide organizer name'],
    maxlength: 100,
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide start date'],
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide end date'],
    validate: {
      validator: function (v) {
        return v > this.startDate;
      },
      message: 'End date must be after start date',
    },
  },
  registrationDeadline: {
    type: Date,
    required: [true, 'Please provide registration deadline'],
    validate: {
      validator: function (v) {
        return v <= this.startDate;
      },
      message: 'Registration deadline must be before start date',
    },
  },
  location: {
    type: String,
    enum: ['online', 'hybrid', 'in-person'],
    default: 'online',
  },
  venue: {
    type: String,
    maxlength: 200,
  },
  maxParticipants: {
    type: Number,
    min: 10,
    max: 10000,
  },
  currentParticipants: {
    type: Number,
    default: 0,
  },
  themes: [{
    type: String,
    trim: true,
  }],
  prizes: [{
    position: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    description: String,
  }],
  rules: {
    type: String,
    maxlength: 3000,
  },
  requirements: [{
    type: String,
    trim: true,
  }],
  tags: [{
    type: String,
    trim: true,
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all-levels'],
    default: 'all-levels',
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming',
  },
  website: {
    type: String,
    validate: {
      validator: function (v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide valid website URL',
    },
  },
  contactEmail: {
    type: String,
    validate: {
      validator: function (v) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide valid email',
    },
  },
  participants: [{
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    team: {
      type: mongoose.Types.ObjectId,
      ref: 'Team',
    },
  }],
  bookmarkedBy: [{
    type: mongoose.Types.ObjectId,
    ref: 'User',
  }],
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Index for searching hackathons
HackathonSchema.index({ title: 'text', description: 'text', themes: 'text', tags: 'text' });
HackathonSchema.index({ startDate: 1, status: 1 });
HackathonSchema.index({ registrationDeadline: 1 });

module.exports = mongoose.model('Hackathon', HackathonSchema);