const Team = require('../models/Team');
const User = require('../models/User');
const Invitation = require('../models/Invitation');
const { validationResult } = require('express-validator');

class TeamController {
  // Create new team
  async createTeam(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user.userId;
      const teamData = {
        ...req.body,
        leader: userId,
        members: [{ user: userId, role: 'leader' }]
      };

      const team = new Team(teamData);
      await team.save();

      // Add team to user's teams array
      await User.findByIdAndUpdate(userId, {
        $push: { teams: team._id }
      });

      await team.populate([
        { path: 'leader', select: 'username profile.firstName profile.lastName' },
        { path: 'members.user', select: 'username profile.firstName profile.lastName profile.skills' },
        { path: 'hackathon', select: 'title startDate endDate' }
      ]);

      res.status(201).json({
        success: true,
        message: 'Team created successfully',
        data: { team }
      });
    } catch (error) {
      console.error('Create team error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get all teams with filtering
  async getTeams(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        skills, 
        hackathon,
        search 
      } = req.query;

      const query = { isPublic: true };

      if (status) {
        query.status = status;
      }

      if (skills) {
        const skillsArray = skills.split(',').map(skill => skill.trim());
        query.requiredSkills = { $in: skillsArray };
      }

      if (hackathon) {
        query.hackathon = hackathon;
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      const teams = await Team.find(query)
        .populate('leader', 'username profile.firstName profile.lastName')
        .populate('members.user', 'username profile.firstName profile.lastName profile.skills')
        .populate('hackathon', 'title startDate endDate status')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await Team.countDocuments(query);

      res.json({
        success: true,
        data: {
          teams,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total
          }
        }
      });
    } catch (error) {
      console.error('Get teams error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get team by ID
  async getTeam(req, res) {
    try {
      const { teamId } = req.params;

      const team = await Team.findById(teamId)
        .populate('leader', 'username profile.firstName profile.lastName profile.skills profile.experience')
        .populate('members.user', 'username profile.firstName profile.lastName profile.skills profile.experience')
        .populate('hackathon', 'title description startDate endDate location prizes');

      if (!team) {
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }

      res.json({
        success: true,
        data: { team }
      });
    } catch (error) {
      console.error('Get team error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update team
  async updateTeam(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { teamId } = req.params;
      const userId = req.user.userId;

      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }

      // Check if user is team leader
      if (team.leader.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Only team leader can update team details'
        });
      }

      // Remove fields that shouldn't be updated directly
      const updates = { ...req.body };
      delete updates.leader;
      delete updates.members;

      const updatedTeam = await Team.findByIdAndUpdate(
        teamId,
        { $set: updates },
        { new: true, runValidators: true }
      ).populate([
        { path: 'leader', select: 'username profile.firstName profile.lastName' },
        { path: 'members.user', select: 'username profile.firstName profile.lastName profile.skills' },
        { path: 'hackathon', select: 'title startDate endDate' }
      ]);

      res.json({
        success: true,
        message: 'Team updated successfully',
        data: { team: updatedTeam }
      });
    } catch (error) {
      console.error('Update team error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Join team request
  async requestToJoin(req, res) {
    try {
      const { teamId } = req.params;
      const userId = req.user.userId;
      const { message } = req.body;

      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }

      // Check if team is full
      if (team.members.length >= team.maxMembers) {
        return res.status(400).json({
          success: false,
          message: 'Team is already full'
        });
      }

      // Check if user is already a member
      const isMember = team.members.some(member => 
        member.user.toString() === userId
      );

      if (isMember) {
        return res.status(400).json({
          success: false,
          message: 'You are already a member of this team'
        });
      }

      // Check if there's already a pending request
      const existingRequest = await Invitation.findOne({
        team: teamId,
        recipient: team.leader,
        sender: userId,
        type: 'join_request',
        status: 'pending'
      });

      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: 'You already have a pending request for this team'
        });
      }

      // Create join request
      const invitation = new Invitation({
        team: teamId,
        sender: userId,
        recipient: team.leader,
        message,
        type: 'join_request'
      });

      await invitation.save();

      res.json({
        success: true,
        message: 'Join request sent successfully'
      });
    } catch (error) {
      console.error('Request to join error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Remove member from team
  async removeMember(req, res) {
    try {
      const { teamId, memberId } = req.params;
      const userId = req.user.userId;

      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }

      // Check if user is team leader or removing themselves
      if (team.leader.toString() !== userId && memberId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to remove this member'
        });
      }

      // Cannot remove team leader
      if (memberId === team.leader.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot remove team leader'
        });
      }

      // Remove member from team
      team.members = team.members.filter(member => 
        member.user.toString() !== memberId
      );

      await team.save();

      // Remove team from user's teams array
      await User.findByIdAndUpdate(memberId, {
        $pull: { teams: teamId }
      });

      res.json({
        success: true,
        message: 'Member removed successfully'
      });
    } catch (error) {
      console.error('Remove member error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete team
  async deleteTeam(req, res) {
    try {
      const { teamId } = req.params;
      const userId = req.user.userId;

      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }

      // Check if user is team leader
      if (team.leader.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Only team leader can delete the team'
        });
      }

      // Remove team from all members' teams array
      const memberIds = team.members.map(member => member.user);
      await User.updateMany(
        { _id: { $in: memberIds } },
        { $pull: { teams: teamId } }
      );

      // Delete all related invitations
      await Invitation.deleteMany({ team: teamId });

      // Delete team
      await Team.findByIdAndDelete(teamId);

      res.json({
        success: true,
        message: 'Team deleted successfully'
      });
    } catch (error) {
      console.error('Delete team error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new TeamController();