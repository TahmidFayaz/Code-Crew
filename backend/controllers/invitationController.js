const Invitation = require('../models/Invitation');
const Team = require('../models/Team');
const User = require('../models/User');
const { validationResult } = require('express-validator');

class InvitationController {
  // Send team invitation
  async sendInvitation(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { teamId, recipientId, message } = req.body;
      const senderId = req.user.userId;

      // Check if team exists and sender is the leader
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }

      if (team.leader.toString() !== senderId) {
        return res.status(403).json({
          success: false,
          message: 'Only team leader can send invitations'
        });
      }

      // Check if team is full
      if (team.members.length >= team.maxMembers) {
        return res.status(400).json({
          success: false,
          message: 'Team is already full'
        });
      }

      // Check if recipient exists
      const recipient = await User.findById(recipientId);
      if (!recipient) {
        return res.status(404).json({
          success: false,
          message: 'Recipient not found'
        });
      }

      // Check if recipient is already a member
      const isMember = team.members.some(member => 
        member.user.toString() === recipientId
      );

      if (isMember) {
        return res.status(400).json({
          success: false,
          message: 'User is already a team member'
        });
      }

      // Check if there's already a pending invitation
      const existingInvitation = await Invitation.findOne({
        team: teamId,
        recipient: recipientId,
        type: 'team_invite',
        status: 'pending'
      });

      if (existingInvitation) {
        return res.status(400).json({
          success: false,
          message: 'Invitation already sent to this user'
        });
      }

      // Create invitation
      const invitation = new Invitation({
        team: teamId,
        sender: senderId,
        recipient: recipientId,
        message,
        type: 'team_invite'
      });

      await invitation.save();

      await invitation.populate([
        { path: 'team', select: 'name description' },
        { path: 'sender', select: 'username profile.firstName profile.lastName' },
        { path: 'recipient', select: 'username profile.firstName profile.lastName' }
      ]);

      res.status(201).json({
        success: true,
        message: 'Invitation sent successfully',
        data: { invitation }
      });
    } catch (error) {
      console.error('Send invitation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get user's invitations (inbox)
  async getInvitations(req, res) {
    try {
      const userId = req.user.userId;
      const { type, status, page = 1, limit = 10 } = req.query;

      const query = { recipient: userId };

      if (type) {
        query.type = type;
      }

      if (status) {
        query.status = status;
      }

      const invitations = await Invitation.find(query)
        .populate('team', 'name description maxMembers members')
        .populate('sender', 'username profile.firstName profile.lastName profile.avatar')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await Invitation.countDocuments(query);

      res.json({
        success: true,
        data: {
          invitations,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total
          }
        }
      });
    } catch (error) {
      console.error('Get invitations error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get sent invitations
  async getSentInvitations(req, res) {
    try {
      const userId = req.user.userId;
      const { type, status, page = 1, limit = 10 } = req.query;

      const query = { sender: userId };

      if (type) {
        query.type = type;
      }

      if (status) {
        query.status = status;
      }

      const invitations = await Invitation.find(query)
        .populate('team', 'name description maxMembers members')
        .populate('recipient', 'username profile.firstName profile.lastName profile.avatar')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await Invitation.countDocuments(query);

      res.json({
        success: true,
        data: {
          invitations,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total
          }
        }
      });
    } catch (error) {
      console.error('Get sent invitations error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Respond to invitation (accept/decline)
  async respondToInvitation(req, res) {
    try {
      const { invitationId } = req.params;
      const { response } = req.body; // 'accepted' or 'declined'
      const userId = req.user.userId;

      if (!['accepted', 'declined'].includes(response)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid response. Must be "accepted" or "declined"'
        });
      }

      const invitation = await Invitation.findById(invitationId)
        .populate('team')
        .populate('sender', 'username profile.firstName profile.lastName');

      if (!invitation) {
        return res.status(404).json({
          success: false,
          message: 'Invitation not found'
        });
      }

      // Check if user is the recipient
      if (invitation.recipient.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only respond to your own invitations'
        });
      }

      // Check if invitation is still pending
      if (invitation.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Invitation has already been responded to'
        });
      }

      // Update invitation status
      invitation.status = response;
      await invitation.save();

      // If accepted, add user to team
      if (response === 'accepted') {
        const team = invitation.team;

        // Check if team is still not full
        if (team.members.length >= team.maxMembers) {
          return res.status(400).json({
            success: false,
            message: 'Team is now full'
          });
        }

        // Add user to team
        team.members.push({
          user: userId,
          role: 'member'
        });

        await team.save();

        // Add team to user's teams array
        await User.findByIdAndUpdate(userId, {
          $addToSet: { teams: team._id }
        });
      }

      res.json({
        success: true,
        message: `Invitation ${response} successfully`,
        data: { invitation }
      });
    } catch (error) {
      console.error('Respond to invitation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Cancel invitation
  async cancelInvitation(req, res) {
    try {
      const { invitationId } = req.params;
      const userId = req.user.userId;

      const invitation = await Invitation.findById(invitationId);
      if (!invitation) {
        return res.status(404).json({
          success: false,
          message: 'Invitation not found'
        });
      }

      // Check if user is the sender
      if (invitation.sender.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only cancel invitations you sent'
        });
      }

      // Check if invitation is still pending
      if (invitation.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Can only cancel pending invitations'
        });
      }

      invitation.status = 'cancelled';
      await invitation.save();

      res.json({
        success: true,
        message: 'Invitation cancelled successfully'
      });
    } catch (error) {
      console.error('Cancel invitation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get invitation statistics
  async getInvitationStats(req, res) {
    try {
      const userId = req.user.userId;

      const receivedStats = await Invitation.aggregate([
        { $match: { recipient: userId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const sentStats = await Invitation.aggregate([
        { $match: { sender: userId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const pendingReceived = await Invitation.countDocuments({
        recipient: userId,
        status: 'pending'
      });

      const stats = {
        received: receivedStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        sent: sentStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        pendingReceived
      };

      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      console.error('Get invitation stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new InvitationController();