const { body, param, query } = require('express-validator');

// Auth validations
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// User validations
const updateProfileValidation = [
  body('profile.firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be less than 50 characters'),
  
  body('profile.lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  
  body('profile.bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  
  body('profile.skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  
  body('profile.experience')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced', 'Expert'])
    .withMessage('Invalid experience level')
];

// Team validations
const createTeamValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Team name is required and must be less than 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Team description is required and must be less than 1000 characters'),
  
  body('maxMembers')
    .optional()
    .isInt({ min: 2, max: 10 })
    .withMessage('Max members must be between 2 and 10'),
  
  body('requiredSkills')
    .optional()
    .isArray()
    .withMessage('Required skills must be an array'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

// Blog validations
const createBlogValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Blog title is required and must be less than 200 characters'),
  
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Blog content is required'),
  
  body('excerpt')
    .optional()
    .isLength({ max: 300 })
    .withMessage('Excerpt must be less than 300 characters'),
  
  body('category')
    .optional()
    .isIn(['Tutorial', 'Tips', 'Experience', 'News', 'Resources', 'Other'])
    .withMessage('Invalid blog category'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

const addCommentValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment content is required and must be less than 1000 characters')
];

// Resource validations
const createResourceValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Resource title is required and must be less than 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Resource description is required and must be less than 1000 characters'),
  
  body('url')
    .isURL()
    .withMessage('Please provide a valid URL'),
  
  body('type')
    .isIn(['Tutorial', 'Tool', 'Library', 'Framework', 'Documentation', 'Course', 'Book', 'Video', 'Other'])
    .withMessage('Invalid resource type'),
  
  body('category')
    .isIn(['Frontend', 'Backend', 'Mobile', 'DevOps', 'Design', 'Data Science', 'AI/ML', 'Blockchain', 'General'])
    .withMessage('Invalid resource category'),
  
  body('difficulty')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Invalid difficulty level'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

const addReviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Review comment must be less than 500 characters')
];

// Hackathon validations
const createHackathonValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Hackathon title is required and must be less than 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Hackathon description is required and must be less than 2000 characters'),
  
  body('organizer')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Organizer is required'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  
  body('endDate')
    .isISO8601()
    .withMessage('Please provide a valid end date'),
  
  body('registrationDeadline')
    .isISO8601()
    .withMessage('Please provide a valid registration deadline'),
  
  body('location.type')
    .isIn(['online', 'offline', 'hybrid'])
    .withMessage('Invalid location type'),
  
  body('maxTeamSize')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Max team size must be between 1 and 10')
];

// Invitation validations
const sendInvitationValidation = [
  body('teamId')
    .isMongoId()
    .withMessage('Invalid team ID'),
  
  body('recipientId')
    .isMongoId()
    .withMessage('Invalid recipient ID'),
  
  body('message')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Message must be less than 500 characters')
];

// Parameter validations
const mongoIdValidation = [
  param('id').isMongoId().withMessage('Invalid ID format')
];

const userIdValidation = [
  param('userId').isMongoId().withMessage('Invalid user ID format')
];

const teamIdValidation = [
  param('teamId').isMongoId().withMessage('Invalid team ID format')
];

const blogIdValidation = [
  param('blogId').isMongoId().withMessage('Invalid blog ID format')
];

const resourceIdValidation = [
  param('resourceId').isMongoId().withMessage('Invalid resource ID format')
];

const hackathonIdValidation = [
  param('hackathonId').isMongoId().withMessage('Invalid hackathon ID format')
];

const invitationIdValidation = [
  param('invitationId').isMongoId().withMessage('Invalid invitation ID format')
];

module.exports = {
  // Auth
  registerValidation,
  loginValidation,
  
  // User
  updateProfileValidation,
  
  // Team
  createTeamValidation,
  
  // Blog
  createBlogValidation,
  addCommentValidation,
  
  // Resource
  createResourceValidation,
  addReviewValidation,
  
  // Hackathon
  createHackathonValidation,
  
  // Invitation
  sendInvitationValidation,
  
  // Parameters
  mongoIdValidation,
  userIdValidation,
  teamIdValidation,
  blogIdValidation,
  resourceIdValidation,
  hackathonIdValidation,
  invitationIdValidation
};