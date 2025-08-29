import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { adminService } from '../../services/admin';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Calendar,
  Users,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Eye,
  Trophy,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  UserCheck,
  Target,
  Globe,
  MapPin as Location
} from 'lucide-react';
import toast from 'react-hot-toast';

const ManageHackathons = () => {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [editingDates, setEditingDates] = useState(null);

  useEffect(() => {
    fetchHackathons();
  }, [searchTerm, statusFilter, locationFilter]);

  const fetchHackathons = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (locationFilter) params.location = locationFilter;

      const data = await adminService.getAllHackathons(params);
      setHackathons(data.hackathons);
    } catch (error) {
      console.error('Error fetching hackathons:', error);
      toast.error('Failed to fetch hackathons');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (hackathonId, newStatus) => {
    setActionLoading(hackathonId);
    try {
      await adminService.updateHackathonStatus(hackathonId, newStatus);
      toast.success(`Hackathon status updated to ${newStatus}`);
      fetchHackathons();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to update hackathon status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDateUpdate = async (hackathonId, dates) => {
    console.log('Updating hackathon dates:', { hackathonId, dates });
    setActionLoading(hackathonId);
    try {
      const result = await adminService.updateHackathonDates(hackathonId, dates);
      console.log('Date update result:', result);
      toast.success('Hackathon dates updated successfully');
      setEditingDates(null);
      fetchHackathons();
    } catch (error) {
      console.error('Date update error:', error);
      toast.error(error.response?.data?.msg || 'Failed to update hackathon dates');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteHackathon = async (hackathonId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(hackathonId);
    try {
      await adminService.deleteHackathon(hackathonId);
      toast.success('Hackathon deleted successfully');
      fetchHackathons();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to delete hackathon');
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



  const getTeamCount = (hackathon) => {
    // Count unique teams from participants
    const teams = new Set();
    hackathon.participants?.forEach(participant => {
      if (participant.team) {
        teams.add(participant.team);
      }
    });
    return teams.size;
  };

  const StatusDropdown = ({ hackathon, onStatusChange, isLoading }) => {
    const [isOpen, setIsOpen] = useState(false);

    const statusOptions = [
      { value: 'upcoming', label: 'Upcoming', icon: Clock, color: 'text-blue-400' },
      { value: 'ongoing', label: 'Ongoing', icon: Play, color: 'text-green-400' },
      { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'text-gray-400' },
      { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'text-red-400' }
    ];

    const currentStatus = statusOptions.find(s => s.value === hackathon.status);
    const CurrentIcon = currentStatus?.icon || Clock;

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (isOpen && !event.target.closest('.status-dropdown')) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
      <div className="relative status-dropdown">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className="flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-full border bg-slate-700 border-slate-600 text-white hover:bg-slate-600 disabled:opacity-50"
        >
          <CurrentIcon className="h-3 w-3" />
          <span>{currentStatus?.label || hackathon.status}</span>
          <ChevronDown className="h-3 w-3" />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-32 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-10">
            {statusOptions.map((option) => {
              const OptionIcon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onStatusChange(hackathon._id, option.value);
                    setIsOpen(false);
                  }}
                  disabled={option.value === hackathon.status || isLoading}
                  className={`w-full flex items-center space-x-2 px-3 py-2 text-xs hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed ${option.value === hackathon.status ? 'bg-slate-600' : ''
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

  const DateEditor = ({ hackathon, onSave, onCancel, isLoading }) => {
    const formatDateForInput = (dateString) => {
      const date = new Date(dateString);
      // Adjust for timezone offset to get local date
      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
      return localDate.toISOString().split('T')[0];
    };

    const [dates, setDates] = useState({
      startDate: formatDateForInput(hackathon.startDate),
      endDate: formatDateForInput(hackathon.endDate),
      registrationDeadline: formatDateForInput(hackathon.registrationDeadline)
    });

    const handleSubmit = (e) => {
      e.preventDefault();

      // Validate dates
      const startDate = new Date(dates.startDate);
      const endDate = new Date(dates.endDate);
      const regDeadline = new Date(dates.registrationDeadline);

      console.log('Date validation:', { startDate, endDate, regDeadline, dates });

      if (regDeadline > startDate) {
        toast.error('Registration deadline must be before or on start date');
        return;
      }

      if (startDate >= endDate) {
        toast.error('Start date must be before end date');
        return;
      }

      // Convert dates to ISO format for server
      const formattedDates = {
        startDate: dates.startDate,
        endDate: dates.endDate,
        registrationDeadline: dates.registrationDeadline
      };

      console.log('Formatted dates being sent:', formattedDates);

      onSave(hackathon._id, formattedDates);
    };

    const handleDateChange = (field, value) => {
      setDates(prev => ({
        ...prev,
        [field]: value
      }));
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-2 p-3 bg-slate-700 rounded-lg">
        <div>
          <label className="block text-xs text-slate-300 mb-1">Registration Deadline</label>
          <input
            type="date"
            value={dates.registrationDeadline}
            onChange={(e) => handleDateChange('registrationDeadline', e.target.value)}
            className="w-full text-xs bg-slate-600 border border-slate-500 text-white rounded px-2 py-1"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-slate-300 mb-1">Start Date</label>
          <input
            type="date"
            value={dates.startDate}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            className="w-full text-xs bg-slate-600 border border-slate-500 text-white rounded px-2 py-1"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-slate-300 mb-1">End Date</label>
          <input
            type="date"
            value={dates.endDate}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            className="w-full text-xs bg-slate-600 border border-slate-500 text-white rounded px-2 py-1"
            required
          />
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-xs px-2 py-1 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
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
          <h1 className="text-3xl font-bold text-white">Manage Hackathons</h1>
          <p className="text-slate-400">Create, edit, and manage hackathons</p>
        </div>
        <Link
          to="/admin/hackathons/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Hackathon</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search hackathons..."
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Locations</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
              <option value="in-person">In-Person</option>
            </select>
          </div>
        </div>
      </div>

      {/* Hackathons Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Hackathon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Participation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {hackathons.map((hackathon) => (
                <tr key={hackathon._id} className="hover:bg-slate-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white line-clamp-1">
                          {hackathon.title}
                        </div>
                        <div className="text-sm text-slate-400">
                          by {hackathon.organizer}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          {hackathon.difficulty && (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${hackathon.difficulty === 'advanced' ? 'bg-red-600/20 text-red-400 border-red-600/30' :
                              hackathon.difficulty === 'intermediate' ? 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30' :
                                'bg-green-600/20 text-green-400 border-green-600/30'
                              }`}>
                              {hackathon.difficulty}
                            </span>
                          )}
                          {hackathon.prizes?.length > 0 && (
                            <Trophy className="h-3 w-3 text-yellow-400" title="Has prizes" />
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusDropdown
                      hackathon={hackathon}
                      onStatusChange={handleStatusChange}
                      isLoading={actionLoading === hackathon._id}
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {editingDates === hackathon._id ? (
                      <DateEditor
                        hackathon={hackathon}
                        onSave={handleDateUpdate}
                        onCancel={() => setEditingDates(null)}
                        isLoading={actionLoading === hackathon._id}
                      />
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1 text-xs text-slate-400">
                          <Clock className="h-3 w-3" />
                          <span>Reg: {formatDate(hackathon.registrationDeadline)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span>{formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}</span>
                        </div>
                        {/* <button
                          // onClick={() => setEditingDates(hackathon._id)}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          Edit dates
                        </button> */}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-1">
                        <UserCheck className="h-4 w-4 text-slate-400" />
                        <span>{hackathon.currentParticipants || 0}/{hackathon.maxParticipants || 'Unlimited'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-slate-400" />
                        <span>{getTeamCount(hackathon)} teams</span>
                      </div>
                      {hackathon.maxParticipants && (
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min((hackathon.currentParticipants / hackathon.maxParticipants) * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1">
                        {hackathon.location === 'online' ? (
                          <Globe className="h-4 w-4 text-blue-400" />
                        ) : hackathon.location === 'hybrid' ? (
                          <Target className="h-4 w-4 text-purple-400" />
                        ) : (
                          <Location className="h-4 w-4 text-green-400" />
                        )}
                        <span className="capitalize">{hackathon.location}</span>
                      </div>
                      {hackathon.venue && (
                        <div className="text-xs text-slate-400 max-w-32 truncate" title={hackathon.venue}>
                          {hackathon.venue}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/hackathons/${hackathon._id}`}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      {/* <Link
                        to={`/admin/hackathons/${hackathon._id}/edit`}
                        className="text-yellow-400 hover:text-yellow-300 p-1"
                        title="Edit Hackathon"
                      >
                        <Edit className="h-4 w-4" />
                      </Link> */}
                      <button
                        onClick={() => handleDeleteHackathon(hackathon._id, hackathon.title)}
                        disabled={actionLoading === hackathon._id}
                        className="text-red-400 hover:text-red-300 p-1 disabled:opacity-50"
                        title="Delete Hackathon"
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

        {hackathons.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No hackathons found</h3>
            <p className="text-slate-400 mb-4">
              {searchTerm || statusFilter || locationFilter
                ? 'Try adjusting your search criteria'
                : 'Create your first hackathon to get started!'}
            </p>
            <Link
              to="/admin/hackathons/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Hackathon</span>
            </Link>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Hackathons</p>
              <p className="text-2xl font-bold text-white">{hackathons.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Upcoming</p>
              <p className="text-2xl font-bold text-white">
                {hackathons.filter(h => h.status === 'upcoming').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Ongoing</p>
              <p className="text-2xl font-bold text-white">
                {hackathons.filter(h => h.status === 'ongoing').length}
              </p>
            </div>
            <Play className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Completed</p>
              <p className="text-2xl font-bold text-white">
                {hackathons.filter(h => h.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Participants</p>
              <p className="text-2xl font-bold text-white">
                {hackathons.reduce((acc, h) => acc + (h.currentParticipants || 0), 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageHackathons;