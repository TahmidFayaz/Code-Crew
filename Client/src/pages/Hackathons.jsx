import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hackathonService } from '../services/hackathons';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Search,
  Filter,
  Bookmark,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

const Hackathons = () => {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchHackathons();
  }, [searchTerm, statusFilter, difficultyFilter]);

  const fetchHackathons = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (difficultyFilter) params.difficulty = difficultyFilter;

      const data = await hackathonService.getAllHackathons(params);
      setHackathons(data.hackathons);
    } catch {
      toast.error('Failed to fetch hackathons');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinHackathon = async (hackathonId) => {
    try {
      await hackathonService.joinHackathon(hackathonId);
      toast.success('Successfully joined hackathon!');
      fetchHackathons();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to join hackathon');
    }
  };

  const handleBookmark = async (hackathonId) => {
    try {
      await hackathonService.bookmarkHackathon(hackathonId);
      toast.success('Hackathon bookmarked!');
      fetchHackathons();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to bookmark hackathon');
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
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ongoing': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'intermediate': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'advanced': return 'bg-red-600/20 text-red-400 border-red-600/30';
      default: return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
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
          <h1 className="text-3xl font-bold text-white">Hackathons</h1>
          <p className="text-slate-400">Discover and join exciting hackathons</p>
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
              </select>
            </div>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="all-levels">All Levels</option>
            </select>
          </div>
        </div>
      </div>

      {/* Hackathons Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hackathons.map((hackathon) => (
          <div key={hackathon._id} className="bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2">
                    {hackathon.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-2">{hackathon.organizer}</p>
                </div>
                <button
                  onClick={() => handleBookmark(hackathon._id)}
                  className="text-slate-400 hover:text-yellow-400 p-1"
                >
                  <Bookmark className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(hackathon.status)}`}>
                  {hackathon.status}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(hackathon.difficulty)}`}>
                  {hackathon.difficulty}
                </span>
              </div>

              <p className="text-slate-300 mb-4 line-clamp-3 text-sm">
                {hackathon.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <MapPin className="h-4 w-4" />
                  <span className="capitalize">{hackathon.location}</span>
                  {hackathon.venue && <span>• {hackathon.venue}</span>}
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <Users className="h-4 w-4" />
                  <span>{hackathon.currentParticipants}/{hackathon.maxParticipants} participants</span>
                </div>
              </div>

              {hackathon.themes && hackathon.themes.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {hackathon.themes.slice(0, 3).map((theme, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full"
                      >
                        {theme}
                      </span>
                    ))}
                    {hackathon.themes.length > 3 && (
                      <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
                        +{hackathon.themes.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {hackathon.prizes && hackathon.prizes.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <Trophy className="h-4 w-4" />
                    <span>Prize Pool: {hackathon.prizes[0]?.amount}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                <div className="flex items-center space-x-2">
                  {hackathon.status === 'upcoming' &&
                    !hackathon.participants?.some(p => p.user === user?.userId) && (
                      <button
                        onClick={() => handleJoinHackathon(hackathon._id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Join
                      </button>
                    )}
                  <Link
                    to={`/hackathons/${hackathon._id}`}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    View Details
                  </Link>
                </div>
                {hackathon.website && (
                  <a
                    href={hackathon.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {hackathons.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No hackathons found</h3>
          <p className="text-slate-400 mb-4">
            {searchTerm || statusFilter || difficultyFilter
              ? 'Try adjusting your search criteria'
              : 'Check back later for upcoming hackathons!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Hackathons;