import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { invitationService } from '../services/invitations';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Mail,
  Users,
  Calendar,
  Check,
  X,
  Clock,
  Send,
  Inbox as InboxIcon,
  Filter,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';



const Inbox = () => {
  const [activeTab, setActiveTab] = useState('received');
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const { } = useAuth();

  useEffect(() => {
    fetchInvitations();
  }, [activeTab, statusFilter]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      let data;
      if (activeTab === 'received') {
        data = await invitationService.getMyInvitations();
      } else {
        data = await invitationService.getSentInvitations();
      }

      let filteredInvitations = data.invitations;
      if (statusFilter) {
        filteredInvitations = data.invitations.filter(inv => inv.status === statusFilter);
      }

      setInvitations(filteredInvitations);
    } catch {
      toast.error('Failed to fetch invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (invitationId, response) => {
    try {
      await invitationService.respondToInvitation(invitationId, response);
      toast.success(`Invitation ${response}!`);
      fetchInvitations();
    } catch (error) {
      toast.error(error.response?.data?.msg || `Failed to ${response} invitation`);
    }
  };

  const handleCancel = async (invitationId) => {
    try {
      await invitationService.cancelInvitation(invitationId);
      toast.success('Invitation cancelled');
      fetchInvitations();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to cancel invitation');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'team-invite':
      case 'team-request':
      case 'team-accepted':
      case 'team-declined':
        return Users;
      case 'hackathon-invite':
        return Calendar;
      default:
        return Mail;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'accepted': return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'declined': return 'bg-red-600/20 text-red-400 border-red-600/30';
      case 'cancelled': return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
      default: return 'bg-slate-600/20 text-slate-400 border-slate-600/30';
    }
  };

  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="min-h-64" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Inbox</h1>
          <p className="text-slate-400">Manage your invitations and requests</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800 rounded-lg border border-slate-700">
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'received'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-700/50'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <InboxIcon className="h-4 w-4" />
              <span>Received</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'sent'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-700/50'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Send className="h-4 w-4" />
              <span>Sent</span>
            </div>
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center space-x-4">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Invitations List */}
        <div className="divide-y divide-slate-700">
          {invitations.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No {activeTab} invitations
              </h3>
              <p className="text-slate-400">
                {activeTab === 'received'
                  ? 'You have no pending invitations at the moment.'
                  : 'You haven\'t sent any invitations yet.'}
              </p>
            </div>
          ) : (
            invitations.map((invitation) => {
              const TypeIcon = getTypeIcon(invitation.type);
              const expired = invitation.expiresAt && isExpired(invitation.expiresAt);

              return (
                <div key={invitation._id} className="p-6 hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
                        <TypeIcon className="h-5 w-5 text-blue-400" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-medium text-white">
                            {invitation.type === 'team-invite' && 'Team Invitation'}
                            {invitation.type === 'team-request' && 'Team Request'}
                            {invitation.type === 'team-accepted' && 'Team Request Accepted'}
                            {invitation.type === 'team-declined' && 'Team Request Declined'}
                            {invitation.type === 'hackathon-invite' && 'Hackathon Invitation'}
                          </h3>
                          <p className="text-sm text-slate-400">
                            {activeTab === 'received' ? 'From' : 'To'}: {
                              activeTab === 'received' ? invitation.from.name : invitation.to.name
                            }
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(invitation.status)}`}>
                            {invitation.status}
                          </span>
                          {expired && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-600/20 text-red-400 border border-red-600/30">
                              Expired
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mb-3">
                        {invitation.team && (
                          <p className="text-white font-medium">
                            Team: <Link to={`/teams/${invitation.team._id}`} className="text-blue-400 hover:text-blue-300">{invitation.team.name}</Link>
                          </p>
                        )}
                        {invitation.hackathon && (
                          <p className="text-white font-medium">
                            Hackathon: <Link to={`/hackathons/${invitation.hackathon._id}`} className="text-blue-400 hover:text-blue-300">{invitation.hackathon.title}</Link>
                          </p>
                        )}
                      </div>

                      {invitation.message && (
                        <p className="text-slate-300 mb-3">
                          "{invitation.message}"
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatDate(invitation.createdAt)}</span>
                          </div>
                          {invitation.expiresAt && !expired && (
                            <span>Expires: {formatDate(invitation.expiresAt)}</span>
                          )}
                          {invitation.respondedAt && (
                            <span>Responded: {formatDate(invitation.respondedAt)}</span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2">
                          {activeTab === 'received' && invitation.status === 'pending' && !expired &&
                            !['team-accepted', 'team-declined'].includes(invitation.type) && (
                              <>
                                <button
                                  onClick={() => handleRespond(invitation._id, 'accepted')}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                                >
                                  <Check className="h-4 w-4" />
                                  <span>Accept</span>
                                </button>
                                <button
                                  onClick={() => handleRespond(invitation._id, 'declined')}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                                >
                                  <X className="h-4 w-4" />
                                  <span>Decline</span>
                                </button>
                              </>
                            )}

                          {activeTab === 'sent' && invitation.status === 'pending' && !expired && (
                            <button
                              onClick={() => handleCancel(invitation._id)}
                              className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 rounded text-sm"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;