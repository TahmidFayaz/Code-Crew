import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hackathonService } from '../services/hackathons';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  ArrowLeft,
  ExternalLink,
  Tag,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const HackathonDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (id) {
      fetchHackathonDetails();
    } else {
      toast.error('Invalid hackathon ID');
      navigate('/hackathons');
    }
  }, [id]);

  const fetchHackathonDetails = async () => {
    try {
      const data = await hackathonService.getHackathonById(id);
      console.log('Hackathon data:', data);
      setHackathon(data.hackathon);
    } catch (error) {
      console.error('Error fetching hackathon details:', error);
      toast.error(error.response?.data?.msg || 'Failed to fetch hackathon details');
      navigate('/hackathons');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinHackathon = async () => {
    setJoining(true);
    try {
      await hackathonService.joinHackathon(id);
      toast.success('Successfully joined hackathon!');
      fetchHackathonDetails();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to join hackathon');
    } finally {
      setJoining(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
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

  const isUserJoined = hackathon?.participants?.some(p =>
    p.user === user?.userId || p.user?._id === user?.userId
  );

  if (loading) {
    return <LoadingSpinner size="lg" className="min-h-64" />;
  }

  if (!loading && !hackathon) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-white mb-2">Hackathon not found</h3>
        <p className="text-slate-400 mb-4">The hackathon you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/hackathons')}
          className="text-blue-400 hover:text-blue-300"
        >
          Back to Hackathons
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/hackathons')}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">{hackathon.title}</h1>
          <p className="text-slate-400">Organized by {hackathon.organizer}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status and Difficulty */}
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(hackathon.status)}`}>
              {hackathon.status}
            </span>
            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getDifficultyColor(hackathon.difficulty)}`}>
              {hackathon.difficulty}
            </span>
          </div>

          {/* Description */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">About</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 whitespace-pre-wrap">{hackathon.description}</p>
            </div>
          </div>

          {/* Themes */}
          {hackathon.themes && hackathon.themes.length > 0 && (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Themes</h2>
              <div className="flex flex-wrap gap-2">
                {hackathon.themes.map((theme, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-full text-sm flex items-center space-x-1"
                  >
                    <Tag className="h-3 w-3" />
                    <span>{theme}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Prizes */}
          {hackathon.prizes && hackathon.prizes.length > 0 && (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Prizes</h2>
              <div className="space-y-3">
                {hackathon.prizes.map((prize, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Trophy className="h-5 w-5 text-yellow-400" />
                      <span className="text-white font-medium">{prize.position}</span>
                    </div>
                    <span className="text-green-400 font-semibold">{prize.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules */}
          {hackathon.rules && (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Rules</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-slate-300 whitespace-pre-wrap">{hackathon.rules}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Join Button */}
          {hackathon.status === 'upcoming' && !isUserJoined && (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <button
                onClick={handleJoinHackathon}
                disabled={joining || (hackathon.maxParticipants && (hackathon.currentParticipants || hackathon.participants?.length || 0) >= hackathon.maxParticipants)}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium"
              >
                {joining ? 'Joining...' : 'Join Hackathon'}
              </button>
              {hackathon.maxParticipants && (hackathon.currentParticipants || hackathon.participants?.length || 0) >= hackathon.maxParticipants && (
                <p className="text-red-400 text-sm mt-2 text-center">Registration Full</p>
              )}
            </div>
          )}

          {isUserJoined && (
            <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-6">
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">You're registered!</span>
              </div>
            </div>
          )}

          {/* Event Details */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Event Details</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Start Date</p>
                  <p className="text-slate-400 text-sm">{formatDate(hackathon.startDate)}</p>
                  <p className="text-slate-400 text-sm">{formatTime(hackathon.startDate)}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium">End Date</p>
                  <p className="text-slate-400 text-sm">{formatDate(hackathon.endDate)}</p>
                  <p className="text-slate-400 text-sm">{formatTime(hackathon.endDate)}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Location</p>
                  <p className="text-slate-400 text-sm capitalize">{hackathon.location}</p>
                  {hackathon.venue && (
                    <p className="text-slate-400 text-sm">{hackathon.venue}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Participants</p>
                  <p className="text-slate-400 text-sm">
                    {hackathon.currentParticipants || hackathon.participants?.length || 0} / {hackathon.maxParticipants || 'Unlimited'}
                  </p>
                </div>
              </div>

              {hackathon.website && (
                <div className="pt-4 border-t border-slate-700">
                  <a
                    href={hackathon.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Visit Website</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HackathonDetails;