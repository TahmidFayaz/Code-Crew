# Code Crew

This is a full-stack application designed to facilitate hackathon management, team collaboration, and blog posting. It consists of a React frontend and a Node.js/Express backend.

## Features

- **User Authentication:** Secure user registration and login.
- **Hackathon Management:**
  - View available hackathons.
  - Create and manage hackathons (Admin).
  - Hackathon details page.
- **Team Management:**
  - Create and join teams.
  - View team details.
  - Manage teams (Admin).
- **Blog Platform:**
  - View blog posts.
  - Create new blog posts.
  - Manage blogs (Admin).
  - Blog details page.
- **User Profiles:** View and manage user profiles.
- **Inbox:** Messaging functionality for users.
- **Admin Panel:**
  - Dashboard for administrators.
  - User management.
  - Hackathon management.
  - Team management.
  - Blog management.
- **Protected Routes:** Role-based access control for client-side routes.

## Technologies Used

### Client (Frontend)
- **React.js:** Frontend library for building user interfaces.
- **Vite:** Fast frontend development build tool.
- **Tailwind CSS:** Utility-first CSS framework for styling.
- **Axios:** Promise-based HTTP client for API requests.
- **React Router DOM:** Declarative routing for React.js.
- **React Hook Form & Yup:** Form validation.
- **Lucide React:** Icon library.
- **React Hot Toast:** Notifications.

### Server (Backend)
- **Node.js & Express.js:** Backend runtime and web framework.
- **MongoDB & Mongoose:** NoSQL database and ODM.
- **JWT (JSON Web Tokens):** For authentication.
- **Bcryptjs:** For password hashing.
- **Cookie-Parser:** For parsing cookies.
- **CORS:** Middleware for enabling Cross-Origin Resource Sharing.
- **Dotenv:** For loading environment variables.
- **Http-Status-Codes:** For HTTP status codes.
- **Validator:** For data validation.
- **Nodemon:** For automatic server restarts during development.

## Setup Instructions

To get this project up and running on your local machine, follow these steps:

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB

### Client Setup

1. Navigate to the `Client/` directory:
   ```bash
   cd Client
   ```
2. Install the dependencies:
   ```bash
   npm install
   # or yarn install
   ```
3. Start the development server:
   ```bash
   npm run dev
   # or yarn dev
   ```
   The client application will be accessible at `http://localhost:5173` (or another port if 5173 is in use).

### Server Setup

1. Navigate to the `Server/` directory:
   ```bash
   cd Server
   ```
2. Install the dependencies:
   ```bash
   npm install
   # or yarn install
   ```
3. Create a `.env` file in the `Server/` directory and add the following environment variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_LIFETIME=1d
   # Add any other necessary environment variables here
   ```
4. Start the development server:
   ```bash
   npm run dev
   # or yarn dev
   ```
   The server will run on `http://localhost:5000` (or another port if 5000 is in use).

## Usage

Once both the client and server are running, you can access the application through your web browser.

1. **Register/Login:** Create a new account or log in with existing credentials.
2. **Explore Hackathons:** View details of ongoing and upcoming hackathons.
3. **Create/Join Teams:** Form new teams or join existing ones to participate in hackathons.
4. **Read/Write Blogs:** Browse blog posts or contribute your own.
5. **Manage Profile:** Update your user information.
6. **Inbox:** Communicate with other users.

## Admin Features

Users with administrator privileges have access to an `Admin Panel` with the following capabilities:

- **User Management:** View, edit, and delete user accounts.
- **Hackathon Management:** Create, update, and delete hackathons.
- **Team Management:** Oversee and manage all registered teams.
- **Blog Management:** Moderate and manage blog posts.
- **Dashboard:** An overview of the application's key metrics and activities.

## Contributing

Contributions are welcome! If you'd like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and ensure they are well-tested.
4. Commit your changes with a clear and concise message.
5. Push your branch to your fork.
6. Open a pull request to the main repository.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
