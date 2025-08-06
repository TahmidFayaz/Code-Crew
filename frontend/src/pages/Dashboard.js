import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Users, 
  BookOpen, 
  Library, 
  Trophy, 
  Plus,
  Mail,
  TrendingUp,
  Calendar,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, invitationAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();

  const { data: dashboardData, isLoading } = useQuery(
    'dashboard',
    userAPI.getDashboard,
    { staleTime: 5 * 60 * 1000 }
  );

  const { data: invitationStats } = useQuery(
    'invitationStats',
    invitationAPI.getInvitationStats,
    { staleTime: 5 * 60 * 1000 }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = dashboardData?.data?.stats || {};
  const pendingInvitations = invitationStats?.data?.stats?.pendingReceived || 0;

  const quickActions = [
    {
      title: 'Create Team',
      description: 'Start a new team for your next hackathon',
      icon: Users,
      link: '/teams/create',
      color: 'bg-blue-500'
    },
    {
      title: 'Write Blog Post',
      description: 'Share your knowledge with the community',
      icon: BookOpen,
      link: '/blogs/create',
      color: 'bg-green-500'
    },
    {
      title: 'Add Resource',
      description: 'Contribute a useful tool or tutorial',
      icon: Library,
      link: '/resources/create',
      color: 'bg-purple-500'
    },
    {
      title: 'Submit Hackathon',
      description: 'List a new hackathon opportunity',
      icon: Trophy,
      link: '/hackathons/create',
      color: 'bg-yellow-500'
    }
  ];

  const dashboardStats = [
    {
      label: 'My Teams',
      value: stats.teamsCount || 0,
      icon: Users,
      color: 'text-blue-600',
      link: '/teams?member=' + user?._id
    },
    {
      label: 'Active Teams',
      value: stats.activeTeams || 0,
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      label: 'Completed Hackathons',
      value: stats.completedHackathons || 0,
      icon: Trophy,
      color: 'text-yellow-600'
    },
    {
      label: 'Pending Invitations',
      value: pendingInvitations,
      icon: Mail,
      color: 'text-red-600',
      link: '/invitations'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.profile?.firstName}! 👋
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your account today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-50`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              {stat.link && (
                <Link
                  to={stat.link}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View details →
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="card hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <Plus className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {action.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Teams */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                My Teams
              </h3>
              <Link
                to="/teams"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all
              </Link>
            </div>
            
            {dashboardData?.data?.user?.teams?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.data.user.teams.slice(0, 3).map((team) => (
                  <Link
                    key={team._id}
                    to={`/teams/${team._id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {team.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {team.description?.substring(0, 50)}...
                      </p>
                    </div>
                    <span className={`badge ${
                      team.status === 'recruiting' ? 'badge-success' :
                      team.status === 'full' ? 'badge-warning' : 'badge-secondary'
                    }`}>
                      {team.status}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">
                  You haven't joined any teams yet
                </p>
                <Link to="/teams" className="btn btn-primary btn-sm">
                  Browse Teams
                </Link>
              </div>
            )}
          </div>

          {/* Recent Invitations */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Invitations
              </h3>
              <Link
                to="/invitations"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all
              </Link>
            </div>
            
            {pendingInvitations > 0 ? (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <p className="text-gray-900 font-medium mb-2">
                  You have {pendingInvitations} pending invitation{pendingInvitations !== 1 ? 's' : ''}
                </p>
                <p className="text-gray-600 mb-4">
                  Check your inbox to respond to team invitations
                </p>
                <Link to="/invitations" className="btn btn-primary btn-sm">
                  View Invitations
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  No pending invitations
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;