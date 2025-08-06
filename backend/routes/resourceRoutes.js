const express = require('express');
const resourceController = require('../controllers/resourceController');
const auth = require('../middleware/auth');
const { createResourceValidation, addReviewValidation, resourceIdValidation } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/resources
// @desc    Create new resource
// @access  Private
router.post('/', auth, createResourceValidation, resourceController.createResource);

// @route   GET /api/resources
// @desc    Get all resources with filtering
// @access  Public
router.get('/', resourceController.getResources);

// @route   GET /api/resources/metadata
// @desc    Get resource categories and types
// @access  Public
router.get('/metadata', resourceController.getResourceMetadata);

// @route   GET /api/resources/:resourceId
// @desc    Get resource by ID
// @access  Public
router.get('/:resourceId', resourceIdValidation, resourceController.getResource);

// @route   PUT /api/resources/:resourceId
// @desc    Update resource
// @access  Private
router.put('/:resourceId', auth, resourceIdValidation, createResourceValidation, resourceController.updateResource);

// @route   POST /api/resources/:resourceId/reviews
// @desc    Add review to resource
// @access  Private
router.post('/:resourceId/reviews', auth, resourceIdValidation, addReviewValidation, resourceController.addReview);

// @route   DELETE /api/resources/:resourceId
// @desc    Delete resource
// @access  Private
router.delete('/:resourceId', auth, resourceIdValidation, resourceController.deleteResource);

module.exports = router;