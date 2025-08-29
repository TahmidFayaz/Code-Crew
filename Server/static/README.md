# Database Seeding System

This directory contains the database seeding system for the Hackathon Manager application.

## Files Overview

### Core Seeding Files
- **`seedData.js`** - Contains all seed data for different models
- **`seedDatabase.js`** - Main seeding logic and database population
- **`users.json`** - JSON format user seed data (alternative format)
- **`hackathons.json`** - JSON format hackathon seed data
- **`teams.json`** - JSON format team seed data

### Scripts
- **`../scripts/seed.js`** - Standalone seeding script
- **`../scripts/clearDatabase.js`** - Database clearing script

## Usage

### Automatic Seeding
The database is automatically seeded when the server starts if the database is empty.

### Manual Seeding
You can manually seed the database using npm scripts:

```bash
# Seed the database
npm run seed

# Clear the database
npm run clear-db

# Reset database (clear + seed)
npm run reset-db
```

### Direct Script Usage
```bash
# Seed database
node scripts/seed.js

# Clear database
node scripts/clearDatabase.js
```

## Seed Data Overview

### Users (5 users)
- **Alex Johnson** - Admin user, Full-stack developer
- **Sarah Chen** - Frontend developer and UI/UX designer
- **Mike Rodriguez** - Backend engineer
- **Emma Wilson** - Data scientist
- **David Kim** - Mobile app developer

### Hackathons (3 hackathons)
- **AI Innovation Challenge 2025** - AI/ML focused hackathon
- **Green Tech Hackathon** - Sustainability focused
- **FinTech Innovation Sprint** - Financial technology focused

### Teams (3+ teams)
- **AI Innovators** - Healthcare AI solutions
- **Green Code Warriors** - Environmental solutions
- **FinTech Pioneers** - Financial technology
- **Mobile Masters** - Mobile app development
- **Data Wizards** - Data science and analytics

### Blogs (3 articles)
- Tips for winning hackathons
- Team leadership guide
- AI trends in hackathons

### Invitations
- Sample team invitations and requests
- Hackathon invitations

## Data Relationships

The seeding system creates realistic relationships between entities:
- Users are assigned as team leaders and hackathon creators
- Teams are linked to hackathons and have members
- Blogs have authors and can be related to hackathons
- Invitations connect users, teams, and hackathons
- Sample interactions like bookmarks, likes, and comments

## Customization

To add more seed data:

1. **Add to `seedData.js`** - Add new entries to the respective arrays
2. **Update JSON files** - Modify the JSON files for alternative data sources
3. **Modify relationships** - Update `seedDatabase.js` to handle new relationships

## Environment Requirements

Make sure your `.env` file contains:
```
MONGO_URI=your_mongodb_connection_string
```

## Safety Features

- **Duplicate Prevention**: Seeding only runs if the database is empty
- **Error Handling**: Comprehensive error handling and logging
- **Array Bounds Safety**: Uses modulo operations to prevent index errors
- **Relationship Validation**: Ensures all references are valid before creation

## Logging

The seeding process provides detailed logging:
- 🌱 Starting seeding
- 👥 Creating users
- 🏆 Creating hackathons
- 👨‍👩‍👧‍👦 Creating teams
- 📝 Creating blogs
- 📨 Creating invitations
- 🎯 Adding relationships
- 🎉 Completion summary

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check your `MONGO_URI` in `.env`
   - Ensure MongoDB is running

2. **Seeding Skipped**
   - Database already contains data
   - Use `npm run clear-db` first if you want to re-seed

3. **Reference Errors**
   - Usually caused by array index issues
   - Check that all referenced users/teams exist

### Debug Mode
Set `NODE_ENV=development` for more detailed logging.