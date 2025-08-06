const Resource = require('../models/Resource');
const { validationResult } = require('express-validator');

class ResourceController {
  // Create new resource
  async createResource(req, res) {
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
      const resourceData = {
        ...req.body,
        submittedBy: userId
      };

      const resource = new Resource(resourceData);
      await resource.save();

      await resource.populate('submittedBy', 'username profile.firstName profile.lastName');

      res.status(201).json({
        success: true,
        message: 'Resource submitted successfully',
        data: { resource }
      });
    } catch (error) {
      console.error('Create resource error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get all resources with filtering
  async getResources(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        type, 
        category, 
        difficulty,
        tags,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        approved = 'true'
      } = req.query;

      const query = {};

      if (approved === 'true') {
        query.isApproved = true;
      }

      if (type) {
        query.type = type;
      }

      if (category) {
        query.category = category;
      }

      if (difficulty) {
        query.difficulty = difficulty;
      }

      if (tags) {
        const tagsArray = tags.split(',').map(tag => tag.trim());
        query.tags = { $in: tagsArray };
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      const sortOptions = {};
      if (sortBy === 'rating') {
        sortOptions['rating.average'] = sortOrder === 'desc' ? -1 : 1;
      } else {
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
      }

      const resources = await Resource.find(query)
        .populate('submittedBy', 'username profile.firstName profile.lastName')
        .populate('reviews.user', 'username profile.firstName profile.lastName')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort(sortOptions);

      const total = await Resource.countDocuments(query);

      res.json({
        success: true,
        data: {
          resources,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total
          }
        }
      });
    } catch (error) {
      console.error('Get resources error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get resource by ID
  async getResource(req, res) {
    try {
      const { resourceId } = req.params;

      const resource = await Resource.findById(resourceId)
        .populate('submittedBy', 'username profile.firstName profile.lastName profile.avatar')
        .populate('reviews.user', 'username profile.firstName profile.lastName profile.avatar');

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Increment view count
      resource.views += 1;
      await resource.save();

      res.json({
        success: true,
        data: { resource }
      });
    } catch (error) {
      console.error('Get resource error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update resource
  async updateResource(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { resourceId } = req.params;
      const userId = req.user.userId;

      const resource = await Resource.findById(resourceId);
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check if user is the submitter
      if (resource.submittedBy.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only update resources you submitted'
        });
      }

      const updates = { ...req.body };
      delete updates.submittedBy; // Prevent submitter change
      delete updates.reviews; // Prevent direct reviews manipulation
      delete updates.rating; // Prevent direct rating manipulation

      const updatedResource = await Resource.findByIdAndUpdate(
        resourceId,
        { $set: updates },
        { new: true, runValidators: true }
      ).populate('submittedBy', 'username profile.firstName profile.lastName');

      res.json({
        success: true,
        message: 'Resource updated successfully',
        data: { resource: updatedResource }
      });
    } catch (error) {
      console.error('Update resource error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Add review to resource
  async addReview(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { resourceId } = req.params;
      const userId = req.user.userId;
      const { rating, comment } = req.body;

      const resource = await Resource.findById(resourceId);
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check if user already reviewed this resource
      const existingReview = resource.reviews.find(
        review => review.user.toString() === userId
      );

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this resource'
        });
      }

      // Add review
      const review = {
        user: userId,
        rating,
        comment
      };

      resource.reviews.push(review);
      resource.updateRating();
      await resource.save();

      await resource.populate('reviews.user', 'username profile.firstName profile.lastName profile.avatar');

      const newReview = resource.reviews[resource.reviews.length - 1];

      res.status(201).json({
        success: true,
        message: 'Review added successfully',
        data: { 
          review: newReview,
          rating: {
            average: resource.rating.average,
            count: resource.rating.count
          }
        }
      });
    } catch (error) {
      console.error('Add review error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete resource
  async deleteResource(req, res) {
    try {
      const { resourceId } = req.params;
      const userId = req.user.userId;

      const resource = await Resource.findById(resourceId);
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check if user is the submitter
      if (resource.submittedBy.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete resources you submitted'
        });
      }

      await Resource.findByIdAndDelete(resourceId);

      res.json({
        success: true,
        message: 'Resource deleted successfully'
      });
    } catch (error) {
      console.error('Delete resource error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get resource categories and types
  async getResourceMetadata(req, res) {
    try {
      const types = await Resource.distinct('type');
      const categories = await Resource.distinct('category');
      const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

      res.json({
        success: true,
        data: {
          types,
          categories,
          difficulties
        }
      });
    } catch (error) {
      console.error('Get resource metadata error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new ResourceController();