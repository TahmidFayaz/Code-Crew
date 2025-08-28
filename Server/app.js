require('dotenv').config();

const express = require('express');
const app = express();

// rest of the packages
const cookieParser = require('cookie-parser');
const cors = require('cors');

// database
const connectDB = require('./db/connect');
const seedDatabase = require('./static/seedDatabase');

// routers
const authRouter = require('./routers/authRoutes');
const userRouter = require('./routers/userRoutes');
const teamRouter = require('./routers/teamRoutes');
const hackathonRouter = require('./routers/hackathonRoutes');
const blogRouter = require('./routers/blogRoutes');
const invitationRouter = require('./routers/invitationRoutes');
const adminRouter = require('./routers/adminRoutes');

// middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

// CORS configuration
app.use(cors({
  origin: process.env.ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

// routes
app.get('/', (req, res) => {
  res.json({ msg: 'Code Crew API - Hackathon Collaboration Platform' });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/teams', teamRouter);
app.use('/api/v1/hackathons', hackathonRouter);
app.use('/api/v1/blogs', blogRouter);
app.use('/api/v1/invitations', invitationRouter);
app.use('/api/v1/admin', adminRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    // Seed database if empty
    await seedDatabase();

    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();