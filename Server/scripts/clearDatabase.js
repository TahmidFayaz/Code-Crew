#!/usr/bin/env node

/**
 * Database clearing script
 * Usage: node scripts/clearDatabase.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const User = require('../models/User');
const Hackathon = require('../models/Hackathon');
const Team = require('../models/Team');
const Blog = require('../models/Blog');
const Invitation = require('../models/Invitation');
const Token = require('../models/Token');

const clearDatabase = async () => {
  try {
    console.log('🧹 Starting database cleanup...');

    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear all collections
    console.log('🗑️  Clearing collections...');

    await Promise.all([
      User.deleteMany({}),
      Hackathon.deleteMany({}),
      Team.deleteMany({}),
      Blog.deleteMany({}),
      Invitation.deleteMany({}),
      Token.deleteMany({})
    ]);

    console.log('✅ All collections cleared');

    // Get collection stats
    const stats = {
      users: await User.countDocuments(),
      hackathons: await Hackathon.countDocuments(),
      teams: await Team.countDocuments(),
      blogs: await Blog.countDocuments(),
      invitations: await Invitation.countDocuments(),
      tokens: await Token.countDocuments()
    };

    console.log('📊 Final counts:', stats);
    console.log('🎉 Database cleared successfully!');

    process.exit(0);

  } catch (error) {
    console.error('❌ Database clearing failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  clearDatabase();
}

module.exports = clearDatabase;