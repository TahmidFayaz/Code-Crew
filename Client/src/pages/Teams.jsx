import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { teamService } from '../services/teams';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Users,
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  Star
} from 'lucide-react';
import toast from 'react-hot-toast';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchTeams();
  }, [searchTerm, statusFilter]);

  const fetchTeams = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;

      const data = await teamService.getAllTeams(params);
      setTeams(data.teams);
    } catch {
      toast.error('Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (teamId, teamName) => {
    try {
      await teamService.requestToJoinTeam(teamId, `${user.name} wants to join your team "${teamName}"`);
      toast.success('Join request sent successfully!');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to send join request');
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="min-h-64" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Teams</h1>
          <p className="text-slate-400">Find and join hackathon teams</p>
        </div>
        <Link
          to="/teams/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Team</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="recruiting">Recruiting</option>
              <option value="full">Full</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div key={team._id} className="bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {team.name}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <Users className="h-4 w-4" />
                    <span>{team.members.length}/{team.maxMembers} members</span>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${team.status === 'recruiting'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                  }`}>
                  {team.status}
                </span>
              </div>

              <p className="text-slate-300 mb-4 line-clamp-3">
                {team.description}
              </p>

              {team.requiredSkills.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {team.requiredSkills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {team.requiredSkills.length > 3 && (
                      <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
                        +{team.requiredSkills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <img
                    src={`https://ui-avatars.com/api/?name=${team.leader.name}&size=24&background=3B82F6&color=fff`}
                    alt={team.leader.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span>{team.leader.name}</span>
                </div>

                {team.status === 'recruiting' &&
                  !team.members.some(member => member.user._id === user?.userId) && (
                    <button
                      onClick={() => handleJoinRequest(team._id, team.name)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Request to Join
                    </button>
                  )}

                <Link
                  to={`/teams/${team._id}`}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No teams found</h3>
          <p className="text-slate-400 mb-4">
            {searchTerm || statusFilter
              ? 'Try adjusting your search criteria'
              : 'Be the first to create a team!'}
          </p>
          <Link
            to="/teams/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Team</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Teams;