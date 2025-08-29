import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/users';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  Ban,
  CheckCircle,
  Mail,
  Calendar,
  Eye,
  UserCheck,
  UserX,
  Crown,
  Shield,
  User,
  ChevronDown,
  MapPin,
  Github,
  Linkedin,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const data = await userService.getAllUsers(params);
      setUsers(data.users);
    } catch {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId, userName) => {
    const reason = prompt(`Enter reason for banning ${userName}:`, 'Violation of terms of service');
    if (!reason) return;

    setActionLoading(userId);
    try {
      await userService.banUser(userId, reason);
      toast.success('User banned successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to ban user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnbanUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to unban ${userName}?`)) return;

    setActionLoading(userId);
    try {
      await userService.unbanUser(userId);
      toast.success('User unbanned successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to unban user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangeUserRole = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    setActionLoading(userId);
    try {
      await userService.updateUserRole(userId, newRole);
      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to update user role');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-600/20 text-red-400 border-red-600/30';
      case 'moderator': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'user': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      default: return 'bg-slate-600/20 text-slate-400 border-slate-600/30';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return Crown;
      case 'moderator': return Shield;
      case 'user': return User;
      default: return User;
    }
  };

  const getStatusColor = (isBanned) => {
    return isBanned
      ? 'bg-red-600/20 text-red-400 border-red-600/30'
      : 'bg-green-600/20 text-green-400 border-green-600/30';
  };

  const RoleDropdown = ({ user, onRoleChange, isLoading }) => {
    const [isOpen, setIsOpen] = useState(false);

    const roleOptions = [
      { value: 'user', label: 'User', icon: User, color: 'text-blue-400' },
      { value: 'moderator', label: 'Moderator', icon: Shield, color: 'text-yellow-400' },
      { value: 'admin', label: 'Admin', icon: Crown, color: 'text-red-400' }
    ];

    const currentRole = roleOptions.find(r => r.value === user.role);
    const CurrentIcon = currentRole?.icon || User;

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (isOpen && !event.target.closest('.role-dropdown')) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    if (user.role === 'admin') {
      return (
        <div className="flex items-center space-x-1">
          <Crown className="h-3 w-3 text-red-400" />
          <span className="text-xs font-semibold px-2 py-1 rounded-full border bg-red-600/20 text-red-400 border-red-600/30">
            Admin
          </span>
        </div>
      );
    }

    return (
      <div className="relative role-dropdown">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className="flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-full border bg-slate-700 border-slate-600 text-white hover:bg-slate-600 disabled:opacity-50"
        >
          <CurrentIcon className="h-3 w-3" />
          <span>{currentRole?.label || user.role}</span>
          <ChevronDown className="h-3 w-3" />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-32 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-10">
            {roleOptions.map((option) => {
              const OptionIcon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onRoleChange(user._id, option.value);
                    setIsOpen(false);
                  }}
                  disabled={option.value === user.role || isLoading}
                  className={`w-full flex items-center space-x-2 px-3 py-2 text-xs hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed ${option.value === user.role ? 'bg-slate-600' : ''
                    }`}
                >
                  <OptionIcon className={`h-3 w-3 ${option.color}`} />
                  <span className="text-white">{option.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="min-h-64" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Manage Users</h1>
          <p className="text-slate-400">View and manage platform users</p>
        </div>
        <div className="text-sm text-slate-400">
          Total Users: {users.length}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="user">User</option>
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={`https://ui-avatars.com/api/?name=${user.name}&size=40&background=3B82F6&color=fff`}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">
                          {user.name}
                        </div>
                        <div className="text-sm text-slate-400 flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{user.email}</span>
                        </div>
                        {user.location && (
                          <div className="text-xs text-slate-500 flex items-center space-x-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            <span>{user.location}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          {user.github && (
                            <a href={user.github} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">
                              <Github className="h-3 w-3" />
                            </a>
                          )}
                          {user.linkedin && (
                            <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">
                              <Linkedin className="h-3 w-3" />
                            </a>
                          )}
                          {user.portfolio && (
                            <a href={user.portfolio} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">
                              <Globe className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <RoleDropdown
                      user={user}
                      onRoleChange={handleChangeUserRole}
                      isLoading={actionLoading === user._id}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(user.isBanned)}`}>
                        {user.isBanned ? 'Banned' : 'Active'}
                      </span>
                      {user.isBanned && user.banReason && (
                        <div className="text-xs text-red-400 max-w-32 truncate" title={user.banReason}>
                          {user.banReason}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${user.experience === 'advanced' ? 'bg-green-600/20 text-green-400 border-green-600/30' :
                        user.experience === 'intermediate' ? 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30' :
                          'bg-blue-600/20 text-blue-400 border-blue-600/30'
                        }`}>
                        {user.experience || 'beginner'}
                      </span>
                      {user.workStyle && (
                        <div className="text-xs text-slate-400 capitalize">
                          {user.workStyle}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>{formatDate(user.createdAt)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {/* <Link
                        to={`/users/${user._id}`}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="View Profile"
                      >
                        <Eye className="h-4 w-4" />
                      </Link> */}

                      {user.role !== 'admin' && (
                        <>
                          {user.isBanned ? (
                            <button
                              onClick={() => handleUnbanUser(user._id, user.name)}
                              disabled={actionLoading === user._id}
                              className="text-green-400 hover:text-green-300 p-1 disabled:opacity-50"
                              title="Unban User"
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBanUser(user._id, user.name)}
                              disabled={actionLoading === user._id}
                              className="text-red-400 hover:text-red-300 p-1 disabled:opacity-50"
                              title="Ban User"
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No users found</h3>
            <p className="text-slate-400">
              {searchTerm || roleFilter || statusFilter
                ? 'Try adjusting your search criteria'
                : 'No users registered yet'}
            </p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Users</p>
              <p className="text-2xl font-bold text-white">{users.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Active Users</p>
              <p className="text-2xl font-bold text-white">
                {users.filter(u => !u.isBanned).length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Admins</p>
              <p className="text-2xl font-bold text-white">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <Crown className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Moderators</p>
              <p className="text-2xl font-bold text-white">
                {users.filter(u => u.role === 'moderator').length}
              </p>
            </div>
            <Shield className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Banned</p>
              <p className="text-2xl font-bold text-white">
                {users.filter(u => u.isBanned).length}
              </p>
            </div>
            <Ban className="h-8 w-8 text-red-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;