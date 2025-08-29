import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teamService } from '../services/teams';
import { invitationService } from '../services/invitations';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Users,
  Calendar,
  MapPin,
  Github,
  Mail,
  Star,
  UserPlus,
  UserMinus,
  Edit,
  Trash2,
  Crown,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const TeamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);

  useEffect(() => {
    fetchTeamDetails();
  }, [id]);

  useEffect(() => {
    if (team && user) {
      fetchJoinRequests();
    }
  }, [team, user]);

  const fetchTeamDetails = async () => {
    try {
      const data = await teamService.getTeamById(id);
      console.log(data.team)
      setTeam(data.team);
    } catch (error) {
      toast.error('Failed to fetch team details');
      navigate('/teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinRequests = async () => {
    if (!team || team.leader._id !== user?.userId) return;

    try {
      const data = await invitationService.getMyInvitations({
        type: 'team-request',
        status: 'pending'
      });
      setJoinRequests(data.invitations.filter(inv => inv.team?._id === team._id));
    } catch (error) {
      console.error('Failed to fetch join requests:', error);
    }
  };

  const handleJoinRequest = async () => {
    setActionLoading(true);
    try {
      await teamService.requestToJoinTeam(team._id, `${user.name} wants to join your team "${team.name}"`);
      toast.success('Join request sent successfully!');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to send join request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm('Are you sure you want to leave this team?')) return;

    setActionLoading(true);
    try {
      await teamService.leaveTeam(team._id);
      toast.success('Successfully left the team');
      fetchTeamDetails();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to leave team');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRespondToRequest = async (invitationId, response) => {
    try {
      await invitationService.respondToInvitation(invitationId, response);
      toast.success(`Request ${response} successfully`);
      fetchJoinRequests();
      fetchTeamDetails();
    } catch (error) {
      toast.error(error.response?.data?.msg || `Failed to ${response} request`);
    }
  };

  const isTeamMember = team?.members?.some(member => member.user._id === user?.userId);
  const isTeamLeader = team?.leader._id === user?.userId;
  const canJoin = team?.status === 'recruiting' && team?.members?.length < team?.maxMembers && !isTeamMember;

  if (loading) {
    return <LoadingSpinner size="lg" className="min-h-64" />;
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Team not found</h3>
        <p className="text-slate-400">The team you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{team.name}</h1>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${team.status === 'recruiting'
                ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                : team.status === 'full'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                  : 'bg-red-600/20 text-red-400 border border-red-600/30'
                }`}>
                {team.status}
              </span>
            </div>

            <p className="text-slate-300 mb-4">{team.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{team.members.length}/{team.maxMembers} members</span>
              </div>

              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{team.hackathon?.title || 'No hackathon selected'}</span>
              </div>

              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Created {new Date(team.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {canJoin && (
              <button
                onClick={handleJoinRequest}
                disabled={actionLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
              >
                <UserPlus className="h-4 w-4" />
                <span>Request to Join</span>
              </button>
            )}

            {isTeamMember && !isTeamLeader && (
              <button
                onClick={handleLeaveTeam}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
              >
                <UserMinus className="h-4 w-4" />
                <span>Leave Team</span>
              </button>
            )}

            {/* {isTeamLeader && (
              <button
                onClick={() => navigate(`/teams/${team._id}/edit`)}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Team</span>
              </button>
            )} */}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Team Members */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Team Members</span>
            </h2>

            <div className="space-y-4">
              {team.members.map((member) => (
                <div key={member.user._id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img
                      src={`https://ui-avatars.com/api/?name=${member.user.name}&size=40&background=3B82F6&color=fff`}
                      alt={member.user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-white">{member.user.name}</h3>
                        {team.leader._id === member.user._id && (
                          <Crown className="h-4 w-4 text-yellow-400" title="Team Leader" />
                        )}
                        {member.role === 'co-leader' && (
                          <Shield className="h-4 w-4 text-blue-400" title="Co-Leader" />
                        )}
                      </div>
                      <p className="text-sm text-slate-400">{member.user.email}</p>
                      {member.user.skills && member.user.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.user.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {member.user.skills.length > 3 && (
                            <span className="px-2 py-1 bg-slate-600 text-slate-300 text-xs rounded-full">
                              +{member.user.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-slate-400">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Join Requests (only visible to team leader) */}
          {isTeamLeader && joinRequests.length > 0 && (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>Join Requests</span>
              </h2>

              <div className="space-y-4">
                {joinRequests.map((request) => (
                  <div key={request._id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={`https://ui-avatars.com/api/?name=${request.from.name}&size=40&background=3B82F6&color=fff`}
                        alt={request.from.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h3 className="font-medium text-white">{request.from.name}</h3>
                        <p className="text-sm text-slate-400">{request.from.email}</p>
                        {request.message && (
                          <p className="text-sm text-slate-300 mt-1">{request.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRespondToRequest(request._id, 'accepted')}
                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg"
                        title="Accept"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRespondToRequest(request._id, 'declined')}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                        title="Decline"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Team Leader */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Team Leader</h3>
            <div className="flex items-center space-x-3">
              <img
                src={`https://ui-avatars.com/api/?name=${team.leader.name}&size=48&background=3B82F6&color=fff`}
                alt={team.leader.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h4 className="font-medium text-white">{team.leader.name}</h4>
                <p className="text-sm text-slate-400">{team.leader.email}</p>
              </div>
            </div>
          </div>

          {/* Required Skills */}
          {team.requiredSkills && team.requiredSkills.length > 0 && (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {team.requiredSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-600/20 text-blue-400 text-sm rounded-full border border-blue-600/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Project Info */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Project</h3>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-300 mb-2">Project Idea</h4>
              <p className="text-slate-400 text-sm">
                {team.projectIdea || 'No project idea specified yet'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-2">Repository</h4>
              {team.githubRepo ? (
                <a
                  href={team.githubRepo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm"
                >
                  <Github className="h-4 w-4" />
                  <span>View on GitHub</span>
                </a>
              ) : (
                <p className="text-slate-500 text-sm">No repository linked yet</p>
              )}
            </div>
          </div>

          {/* Tags */}
          {team.tags && team.tags.length > 0 && (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {team.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamDetails;