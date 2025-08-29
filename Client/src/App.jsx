import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Teams from './pages/Teams';
import CreateTeam from './pages/CreateTeam';
import Hackathons from './pages/Hackathons';
import Blogs from './pages/Blogs';
import CreateBlog from './pages/CreateBlog';
import Inbox from './pages/Inbox';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminPanel from './pages/admin/AdminPanel';
import CreateHackathon from './pages/admin/CreateHackathon';
import ManageHackathons from './pages/admin/ManageHackathons';
import ManageUsers from './pages/admin/ManageUsers';
import ManageTeams from './pages/admin/ManageTeams';
import ManageBlogs from './pages/admin/ManageBlogs';

// Detail Pages
import HackathonDetails from './pages/HackathonDetails';
import BlogDetails from './pages/BlogDetails';
import TeamDetails from './pages/TeamDetails';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #475569',
              },
            }}
          />

          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes with layout */}
            <Route path="/" element={
              <Layout>
                <Home />
              </Layout>
            } />

            <Route path="/teams" element={
              <ProtectedRoute>
                <Layout>
                  <Teams />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/hackathons" element={
              <ProtectedRoute>
                <Layout>
                  <Hackathons />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/blogs" element={
              <ProtectedRoute>
                <Layout>
                  <Blogs />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/inbox" element={
              <ProtectedRoute>
                <Layout>
                  <Inbox />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/teams/create" element={
              <ProtectedRoute>
                <Layout>
                  <CreateTeam />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/blogs/create" element={
              <ProtectedRoute>
                <Layout>
                  <CreateBlog />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <Layout>
                  <AdminPanel />
                </Layout>
              </AdminRoute>
            } />

            <Route path="/admin/hackathons/create" element={
              <AdminRoute>
                <Layout>
                  <CreateHackathon />
                </Layout>
              </AdminRoute>
            } />

            <Route path="/admin/hackathons" element={
              <AdminRoute>
                <Layout>
                  <ManageHackathons />
                </Layout>
              </AdminRoute>
            } />

            <Route path="/admin/users" element={
              <AdminRoute>
                <Layout>
                  <ManageUsers />
                </Layout>
              </AdminRoute>
            } />

            <Route path="/admin/teams" element={
              <AdminRoute>
                <Layout>
                  <ManageTeams />
                </Layout>
              </AdminRoute>
            } />

            <Route path="/admin/blogs" element={
              <AdminRoute>
                <Layout>
                  <ManageBlogs />
                </Layout>
              </AdminRoute>
            } />

            {/* Detail Pages */}
            <Route path="/hackathons/:id" element={
              <ProtectedRoute>
                <Layout>
                  <HackathonDetails />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/blogs/:id" element={
              <ProtectedRoute>
                <Layout>
                  <BlogDetails />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/teams/:id" element={
              <ProtectedRoute>
                <Layout>
                  <TeamDetails />
                </Layout>
              </ProtectedRoute>
            } />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;