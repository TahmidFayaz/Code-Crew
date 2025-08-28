const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const Hackathon = require('../models/Hackathon');
const Team = require('../models/Team');
const Blog = require('../models/Blog');
const Invitation = require('../models/Invitation');

// Import seed data
const {
  seedUsers,
  seedHackathons,
  seedTeams,
  seedBlogs,
  seedInvitations
} = require('./seedData');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Check if database already has data
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('📊 Database already contains data. Skipping seeding.');
      return;
    }

    // Hash passwords for seed users
    const hashedUsers = await Promise.all(
      seedUsers.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return { ...user, password: hashedPassword };
      })
    );

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create hackathons with createdBy field
    console.log('🏆 Creating hackathons...');
    const hackathonsWithCreator = seedHackathons.map(hackathon => ({
      ...hackathon,
      createdBy: createdUsers[0]._id // First user (admin) creates all hackathons
    }));
    const createdHackathons = await Hackathon.insertMany(hackathonsWithCreator);
    console.log(`✅ Created ${createdHackathons.length} hackathons`);

    // Create teams with leader and hackathon references
    console.log('👨‍👩‍👧‍👦 Creating teams...');
    const teamsWithReferences = seedTeams.map((team, index) => ({
      ...team,
      leader: createdUsers[(index + 1) % createdUsers.length]._id, // Different users as leaders
      hackathon: createdHackathons[index % createdHackathons.length]._id, // Assign to different hackathons
      members: [
        {
          user: createdUsers[(index + 1) % createdUsers.length]._id,
          role: 'member',
          joinedAt: new Date()
        }
      ]
    }));
    const createdTeams = await Team.insertMany(teamsWithReferences);
    console.log(`✅ Created ${createdTeams.length} teams`);

    // Create blogs with author references
    console.log('📝 Creating blogs...');
    const blogsWithAuthors = seedBlogs.map((blog, index) => ({
      ...blog,
      author: createdUsers[index % createdUsers.length]._id, // Different users as authors
      relatedHackathon: createdHackathons[0]._id // Link to first hackathon
    }));
    const createdBlogs = await Blog.insertMany(blogsWithAuthors);
    console.log(`✅ Created ${createdBlogs.length} blogs`);

    // Create invitations with user and team references
    console.log('📨 Creating invitations...');
    const invitationsWithReferences = seedInvitations.map((invitation, index) => {
      const baseInvitation = {
        ...invitation,
        from: createdUsers[0]._id, // Admin sends invitations
        to: createdUsers[(index + 1) % createdUsers.length]._id // To different users
      };

      // Add specific references based on invitation type
      if (invitation.type === 'team-invite' || invitation.type === 'team-request') {
        baseInvitation.team = createdTeams[index % createdTeams.length]._id;
      }
      if (invitation.type === 'hackathon-invite') {
        baseInvitation.hackathon = createdHackathons[index % createdHackathons.length]._id;
      }

      return baseInvitation;
    });
    const createdInvitations = await Invitation.insertMany(invitationsWithReferences);
    console.log(`✅ Created ${createdInvitations.length} invitations`);

    // Add some participants to hackathons
    console.log('🎯 Adding participants to hackathons...');
    await Hackathon.findByIdAndUpdate(createdHackathons[0]._id, {
      $push: {
        participants: [
          { user: createdUsers[1]._id, team: createdTeams[0]._id },
          { user: createdUsers[2]._id, team: createdTeams[0]._id }
        ]
      },
      $inc: { currentParticipants: 2 }
    });

    if (createdHackathons.length > 1 && createdUsers.length > 4 && createdTeams.length > 1) {
      await Hackathon.findByIdAndUpdate(createdHackathons[1]._id, {
        $push: {
          participants: [
            { user: createdUsers[3]._id, team: createdTeams[1]._id },
            { user: createdUsers[4]._id, team: createdTeams[1]._id }
          ]
        },
        $inc: { currentParticipants: 2 }
      });
    }

    // Add some bookmarks
    await Hackathon.findByIdAndUpdate(createdHackathons[0]._id, {
      $push: {
        bookmarkedBy: [createdUsers[2]._id, createdUsers[3]._id]
      }
    });

    // Add some blog interactions
    await Blog.findByIdAndUpdate(createdBlogs[0]._id, {
      $push: {
        likes: [
          { user: createdUsers[1]._id },
          { user: createdUsers[2]._id }
        ],
        comments: [
          {
            user: createdUsers[1]._id,
            content: "Great tips! This really helped me prepare for my first hackathon."
          }
        ]
      },
      $inc: { views: 25 }
    });

    console.log('🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Hackathons: ${createdHackathons.length}`);
    console.log(`   - Teams: ${createdTeams.length}`);
    console.log(`   - Blogs: ${createdBlogs.length}`);
    console.log(`   - Invitations: ${createdInvitations.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

module.exports = seedDatabase;