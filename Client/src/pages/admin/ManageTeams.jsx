import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { teamService } from '../../services/teams';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Users,
  Search,
  Filter,
  Eye,
  Trash2,
  Calendar,
  User,
  Crown,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

const ManageTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

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

  const handleDeleteTeam = async (teamId, teamName) => {
    if (!window.confirm(`Are you sure you want to delete team "${teamName}"? This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(teamId);
    try {
      await teamService.deleteTeam(teamId);
      toast.success('Team deleted successfully');
      fetchTeams();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to delete team');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'disbanded': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
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
          <h1 className="text-3xl font-bold text-white">Manage Teams</h1>
          <p className="text-slate-400">View and manage platform teams</p>
        </div>
        <div className="text-sm text-slate-400">
          Total Teams: {teams.length}
        </div>
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="disbanded">Disbanded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teams Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Leader
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Members
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {teams.map((team) => (
                <tr key={team._id} className="hover:bg-slate-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {team.name}
                        </div>
                        <div className="text-sm text-slate-400">
                          {team.description ? team.description.substring(0, 50) + '...' : 'No description'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <img
                        src={`https://ui-avatars.com/api/?name=${team.leader.name}&size=32&background=3B82F6&color=fff`}
                        alt={team.leader.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="text-sm font-medium text-white flex items-center space-x-1">
                          <span>{team.leader.name}</span>
                          <Crown className="h-3 w-3 text-yellow-400" />
                        </div>
                        <div className="text-sm text-slate-400">{team.leader.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex -space-x-2">
                        {team.members.slice(0, 3).map((member, index) => (
                          <img
                            key={index}
                            src={`https://ui-avatars.com/api/?name=${member.name}&size=24&background=3B82F6&color=fff`}
                            alt={member.name}
                            className="w-6 h-6 rounded-full border-2 border-slate-800"
                            title={member.name}
                          />
                        ))}
                        {team.members.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-slate-600 border-2 border-slate-800 flex items-center justify-center">
                            <span className="text-xs text-white">+{team.members.length - 3}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-slate-400">
                        {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(team.status)}`}>
                      {team.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>{formatDate(team.createdAt)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/teams/${team._id}`}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="View Team"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteTeam(team._id, team.name)}
                        disabled={deleteLoading === team._id}
                        className="text-red-400 hover:text-red-300 p-1 disabled:opacity-50"
                        title="Delete Team"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {teams.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No teams found</h3>
            <p className="text-slate-400">
              {searchTerm || statusFilter
                ? 'Try adjusting your search criteria'
                : 'No teams created yet'}
            </p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Teams</p>
              <p className="text-2xl font-bold text-white">{teams.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Active Teams</p>
              <p className="text-2xl font-bold text-white">
                {teams.filter(t => t.status === 'active').length}
              </p>
            </div>
            <Shield className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Members</p>
              <p className="text-2xl font-bold text-white">
                {teams.reduce((acc, team) => acc + team.members.length, 0)}
              </p>
            </div>
            <User className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Avg Team Size</p>
              <p className="text-2xl font-bold text-white">
                {teams.length > 0
                  ? Math.round(teams.reduce((acc, team) => acc + team.members.length, 0) / teams.length)
                  : 0}
              </p>
            </div>
            <Users className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageTeams;