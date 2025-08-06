import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Teams from './pages/teams/Teams';
import TeamDetail from './pages/teams/TeamDetail';
import CreateTeam from './pages/teams/CreateTeam';
import Blogs from './pages/blogs/Blogs';
import BlogDetail from './pages/blogs/BlogDetail';
import CreateBlog from './pages/blogs/CreateBlog';
import Resources from './pages/resources/Resources';
import ResourceDetail from './pages/resources/ResourceDetail';
import CreateResource from './pages/resources/CreateResource';
import Hackathons from './pages/hackathons/Hackathons';
import HackathonDetail from './pages/hackathons/HackathonDetail';
import CreateHackathon from './pages/hackathons/CreateHackathon';
import Invitations from './pages/Invitations';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:id" element={<TeamDetail />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:id" element={<BlogDetail />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/resources/:id" element={<ResourceDetail />} />
          <Route path="/hackathons" element={<Hackathons />} />
          <Route path="/hackathons/:id" element={<HackathonDetail />} />
          <Route path="/profile/:id" element={<Profile />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/teams/create" element={
            <ProtectedRoute>
              <CreateTeam />
            </ProtectedRoute>
          } />
          <Route path="/blogs/create" element={
            <ProtectedRoute>
              <CreateBlog />
            </ProtectedRoute>
          } />
          <Route path="/resources/create" element={
            <ProtectedRoute>
              <CreateResource />
            </ProtectedRoute>
          } />
          <Route path="/hackathons/create" element={
            <ProtectedRoute>
              <CreateHackathon />
            </ProtectedRoute>
          } />
          <Route path="/invitations" element={
            <ProtectedRoute>
              <Invitations />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;