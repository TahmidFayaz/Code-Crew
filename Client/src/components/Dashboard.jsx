import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { dashboardService } from '../services/dashboard';
import LoadingSpinner from './LoadingSpinner';
import {
  Users,
  Calendar,
  BookOpen,
  Mail,
  ArrowRight,
  Trophy,
  Star,
  Clock
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, activityData] = await Promise.all([
          dashboardService.getDashboardStats(),
          dashboardService.getRecentActivity()
        ]);

        setDashboardData(statsData);
        setRecentActivity(activityData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate stats from real data
  const stats = dashboardData ? [
    {
      label: 'Teams Joined',
      value: dashboardData.teams?.teams?.length || 0,
      icon: Users,
      color: 'text-blue-400'
    },
    {
      label: 'Hackathons',
      value: dashboardData.hackathons?.hackathons?.length || 0,
      icon: Calendar,
      color: 'text-green-400'
    },
    {
      label: 'Blog Posts',
      value: dashboardData.blogs?.blogs?.length || 0,
      icon: BookOpen,
      color: 'text-purple-400'
    },
    {
      label: 'Invitations',
      value: dashboardData.invitations?.invitations?.filter(inv => inv.status === 'pending')?.length || 0,
      icon: Mail,
      color: 'text-yellow-400'
    },
  ] : [];

  const quickActions = [
    {
      title: 'Find Teams',
      description: 'Browse and join hackathon teams',
      href: '/teams',
      icon: Users,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      title: 'Discover Hackathons',
      description: 'Find upcoming events to participate in',
      href: '/hackathons',
      icon: Calendar,
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      title: 'Read Blogs',
      description: 'Learn from community experiences',
      href: '/blogs',
      icon: BookOpen,
      color: 'bg-purple-600 hover:bg-purple-700',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-blue-100">
          Ready to collaborate on your next big project?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-slate-800 rounded-lg border border-slate-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-2xl font-bold text-white">{stat.value}</span>
              </div>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.href}
                  className={`${action.color} text-white p-4 rounded-lg transition-colors group`}
                >
                  <Icon className="h-8 w-8 mb-3" />
                  <h3 className="font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm opacity-90">{action.description}</p>
                  <ArrowRight className="h-4 w-4 mt-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => {
                  const IconComponent = activity.icon === 'Users' ? Users :
                    activity.icon === 'Calendar' ? Calendar : BookOpen;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                          <IconComponent className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">{activity.title}</p>
                        <p className="text-xs text-slate-400 flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{activity.time}</span>
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400 text-sm">No recent activity</p>
                  <p className="text-slate-500 text-xs mt-1">
                    Start by joining a team or creating a blog post!
                  </p>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700">
              <Link
                to="/profile"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                View all activity →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          <span>Achievements</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className={`flex items-center space-x-3 p-3 bg-slate-700 rounded-lg ${(dashboardData?.teams?.teams?.length || 0) > 0 ? '' : 'opacity-50'
            }`}>
            <div className="w-10 h-10 bg-yellow-600/20 rounded-full flex items-center justify-center">
              <Star className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-white font-medium">First Team</p>
              <p className="text-xs text-slate-400">
                {(dashboardData?.teams?.teams?.length || 0) > 0
                  ? 'Joined your first hackathon team'
                  : 'Join your first hackathon team'}
              </p>
            </div>
          </div>
          <div className={`flex items-center space-x-3 p-3 bg-slate-700 rounded-lg ${(dashboardData?.hackathons?.hackathons?.length || 0) >= 5 ? '' : 'opacity-50'
            }`}>
            <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-medium">Event Participant</p>
              <p className="text-xs text-slate-400">
                {(dashboardData?.hackathons?.hackathons?.length || 0) >= 5
                  ? 'Participated in 5+ hackathons'
                  : `Participate in ${5 - (dashboardData?.hackathons?.hackathons?.length || 0)} more hackathons`}
              </p>
            </div>
          </div>
          <div className={`flex items-center space-x-3 p-3 bg-slate-700 rounded-lg ${(dashboardData?.blogs?.blogs?.length || 0) >= 10 ? '' : 'opacity-50'
            }`}>
            <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-white font-medium">Prolific Writer</p>
              <p className="text-xs text-slate-400">
                {(dashboardData?.blogs?.blogs?.length || 0) >= 10
                  ? 'Published 10+ blog posts'
                  : `Publish ${10 - (dashboardData?.blogs?.blogs?.length || 0)} more blog posts`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;