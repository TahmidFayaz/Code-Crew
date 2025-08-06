const User = require('../models/User');
const { validationResult } = require('express-validator');

class UserController {
  // Get user profile
  async getProfile(req, res) {
    try {
      const { userId } = req.params;
      
      const user = await User.findById(userId)
        .populate('teams', 'name description status members')
        .populate('likedBlogs', 'title excerpt author createdAt');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
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
      const updates = req.body;

      // Remove sensitive fields that shouldn't be updated via this endpoint
      delete updates.password;
      delete updates.email;
      delete updates.username;
      delete updates.teams;
      delete updates.likedBlogs;

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Search users
  async searchUsers(req, res) {
    try {
      const { q, skills, experience, page = 1, limit = 10 } = req.query;
      
      const query = { isActive: true };
      
      if (q) {
        query.$or = [
          { username: { $regex: q, $options: 'i' } },
          { 'profile.firstName': { $regex: q, $options: 'i' } },
          { 'profile.lastName': { $regex: q, $options: 'i' } }
        ];
      }

      if (skills) {
        const skillsArray = skills.split(',').map(skill => skill.trim());
        query['profile.skills'] = { $in: skillsArray };
      }

      if (experience) {
        query['profile.experience'] = experience;
      }

      const users = await User.find(query)
        .select('-password')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await User.countDocuments(query);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total
          }
        }
      });
    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get user dashboard data
  async getDashboard(req, res) {
    try {
      const userId = req.user.userId;

      const user = await User.findById(userId)
        .populate({
          path: 'teams',
          populate: {
            path: 'hackathon',
            select: 'title startDate endDate status'
          }
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get user statistics
      const stats = {
        teamsCount: user.teams.length,
        activeTeams: user.teams.filter(team => team.status === 'recruiting').length,
        completedHackathons: user.teams.filter(team => 
          team.hackathon && team.hackathon.status === 'completed'
        ).length
      };

      res.json({
        success: true,
        data: {
          user,
          stats
        }
      });
    } catch (error) {
      console.error('Get dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get all users (admin only)
  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      
      const query = {};
      if (status) {
        query.isActive = status === 'active';
      }

      const users = await User.find(query)
        .select('-password')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await User.countDocuments(query);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total
          }
        }
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new UserController();