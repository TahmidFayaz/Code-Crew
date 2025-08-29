# Code Crew - Frontend

A modern React application for hackathon collaboration and team management.

## Features

- **Dark Theme UI** - Modern dark theme with Tailwind CSS
- **Authentication** - Login, register, and user management
- **Team Management** - Create, join, and manage hackathon teams
- **Hackathon Discovery** - Browse and participate in hackathons
- **Blog System** - Read and share community stories
- **Invitation System** - Send and receive team/hackathon invitations
- **User Profiles** - Comprehensive user profiles with skills and preferences
- **Dashboard** - Personalized dashboard with activity and stats

## Tech Stack

- **React 19** - Latest React with modern features
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Hook Form** - Form management with validation
- **Yup** - Schema validation
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icon library
- **React Hot Toast** - Toast notifications

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the Client directory
3. Install dependencies:
   ```bash
   npm install
   ```

4. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

5. Update the `.env` file with your API URL

6. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Layout components (Navbar, etc.)
│   └── ...
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── pages/              # Page components
│   ├── auth/          # Authentication pages
│   └── ...
├── services/           # API service functions
├── utils/              # Utility functions
├── App.jsx            # Main app component
├── main.jsx           # App entry point
└── index.css          # Global styles
```

## API Integration

The frontend communicates with the backend API through service functions located in the `src/services/` directory. Each service corresponds to a backend resource:

- `auth.js` - Authentication endpoints
- `teams.js` - Team management
- `hackathons.js` - Hackathon operations
- `blogs.js` - Blog functionality
- `invitations.js` - Invitation system
- `users.js` - User management

## Dark Theme

The application uses a custom dark theme implemented with Tailwind CSS. The color palette includes:

- Primary background: `slate-900`
- Secondary background: `slate-800`
- Borders: `slate-700`
- Text: `white`, `slate-300`, `slate-400`
- Accent: `blue-400`, `blue-600`

## Contributing

1. Follow the existing code style and patterns
2. Use TypeScript-style JSDoc comments for functions
3. Ensure all components are responsive
4. Test on different screen sizes
5. Follow the established dark theme color scheme

## License

This project is part of the Code Crew hackathon collaboration platform.