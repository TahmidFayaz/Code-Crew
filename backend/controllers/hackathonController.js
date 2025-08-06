const Hackathon = require('../models/Hackathon');
const { validationResult } = require('express-validator');

class HackathonController {
  // Create new hackathon
  async createHackathon(req, res) {
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
      const hackathonData = {
        ...req.body,
        submittedBy: userId
      };

      const hackathon = new Hackathon(hackathonData);
      await hackathon.save();

      await hackathon.populate('submittedBy', 'username profile.firstName profile.lastName');

      res.status(201).json({
        success: true,
        message: 'Hackathon submitted successfully',
        data: { hackathon }
      });
    } catch (error) {
      console.error('Create hackathon error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get all hackathons with filtering
  async getHackathons(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        location,
        themes,
        technologies,
        search,
        sortBy = 'startDate',
        sortOrder = 'asc',
        verified = 'true'
      } = req.query;

      const query = {};

      if (verified === 'true') {
        query.isVerified = true;
      }

      if (status) {
        query.status = status;
      }

      if (location) {
        query['location.type'] = location;
      }

      if (themes) {
        const themesArray = themes.split(',').map(theme => theme.trim());
        query.themes = { $in: themesArray };
      }

      if (technologies) {
        const techArray = technologies.split(',').map(tech => tech.trim());
        query.technologies = { $in: techArray };
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { organizer: { $regex: search, $options: 'i' } },
          { themes: { $in: [new RegExp(search, 'i')] } },
          { technologies: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const hackathons = await Hackathon.find(query)
        .populate('submittedBy', 'username profile.firstName profile.lastName')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort(sortOptions);

      const total = await Hackathon.countDocuments(query);

      res.json({
        success: true,
        data: {
          hackathons,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total
          }
        }
      });
    } catch (error) {
      console.error('Get hackathons error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new HackathonController();