const mongoose = require('mongoose');

const InvitationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['team-invite', 'team-request', 'team-accepted', 'team-declined', 'hackathon-invite'],
    required: true,
  },
  from: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  to: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  team: {
    type: mongoose.Types.ObjectId,
    ref: 'Team',
  },
  hackathon: {
    type: mongoose.Types.ObjectId,
    ref: 'Hackathon',
  },
  message: {
    type: String,
    maxlength: 500,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'cancelled'],
    default: 'pending',
  },
  respondedAt: {
    type: Date,
  },
  expiresAt: {
    type: Date,
    default: function () {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    },
  },
}, {
  timestamps: true,
});

// Index for efficient queries
InvitationSchema.index({ to: 1, status: 1, createdAt: -1 });
InvitationSchema.index({ from: 1, status: 1, createdAt: -1 });
InvitationSchema.index({ team: 1, status: 1 });
InvitationSchema.index({ expiresAt: 1 });

// Auto-expire invitations
InvitationSchema.pre('find', function () {
  this.where({ expiresAt: { $gt: new Date() } });
});

InvitationSchema.pre('findOne', function () {
  this.where({ expiresAt: { $gt: new Date() } });
});

module.exports = mongoose.model('Invitation', InvitationSchema);