import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Dashboard from '../components/Dashboard';
import {
  Users,
  Calendar,
  BookOpen,
  Code,
  ArrowRight,
  Star,
  Trophy,
  Zap
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  // Show dashboard for authenticated users
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Dashboard />
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Users,
      title: 'Find Your Team',
      description: 'Connect with like-minded developers and form the perfect hackathon team.',
    },
    {
      icon: Calendar,
      title: 'Discover Hackathons',
      description: 'Browse upcoming hackathons and find events that match your interests.',
    },
    {
      icon: BookOpen,
      title: 'Learn & Share',
      description: 'Read success stories, tips, and tutorials from the community.',
    },
    {
      icon: Trophy,
      title: 'Track Progress',
      description: 'Monitor your hackathon journey and celebrate your achievements.',
    },
  ];

  const stats = [
    { label: 'Active Teams', value: '500+' },
    { label: 'Hackathons', value: '50+' },
    { label: 'Success Stories', value: '200+' },
    { label: 'Community Members', value: '2000+' },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <Code className="h-16 w-16" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to <span className="text-yellow-300">Code Crew</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              The ultimate platform for hackathon collaboration. Find teammates,
              join exciting hackathons, and build amazing projects together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/teams"
                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
                  >
                    Browse Teams
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/hackathons"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center"
                  >
                    Find Hackathons
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-slate-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything you need for hackathon success
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              From team formation to project showcase, Code Crew provides all the tools
              you need to excel in hackathons.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600/20 rounded-lg mb-4">
                  <feature.icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to start your hackathon journey?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are already building amazing projects together.
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
            >
              Join Code Crew Today
              <Zap className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;