#!/usr/bin/env node

/**
 * Standalone database seeding script
 * Usage: node scripts/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const seedDatabase = require('../static/seedDatabase');

const runSeeding = async () => {
  try {
    console.log('🚀 Starting standalone database seeding...');

    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Run seeding
    await seedDatabase();

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  runSeeding();
}

module.exports = runSeeding;