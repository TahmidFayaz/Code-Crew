import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  User,
  Mail,
  MapPin,
  Github,
  Linkedin,
  Globe,
  Edit,
  Save,
  X,
  Star,
  Award,
  Calendar,
  Users,
  Code,
  Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';

const profileSchema = yup.object({
  name: yup.string().min(3, 'Name must be at least 3 characters').required('Name is required'),
  bio: yup.string().max(500, 'Bio must be less than 500 characters'),
  skills: yup.string(),
  experience: yup.string().oneOf(['beginner', 'intermediate', 'advanced']),
  github: yup.string().url('Invalid URL'),
  linkedin: yup.string().url('Invalid URL'),
  portfolio: yup.string().url('Invalid URL'),
  personalityType: yup.string().oneOf(['leader', 'collaborator', 'innovator', 'executor', 'analyst']),
  workStyle: yup.string().oneOf(['frontend', 'backend', 'fullstack', 'design', 'data', 'mobile']),
  availability: yup.string().oneOf(['full-time', 'part-time', 'weekends']),
  location: yup.string().max(100, 'Location must be less than 100 characters'),
});

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { user, updateUser } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
      skills: user?.skills?.join(', ') || '',
      experience: user?.experience || 'beginner',
      github: user?.github || '',
      linkedin: user?.linkedin || '',
      portfolio: user?.portfolio || '',
      personalityType: user?.personalityType || '',
      workStyle: user?.workStyle || '',
      availability: user?.availability || 'part-time',
      location: user?.location || '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        bio: user.bio || '',
        skills: user.skills?.join(', ') || '',
        experience: user.experience || 'beginner',
        github: user.github || '',
        linkedin: user.linkedin || '',
        portfolio: user.portfolio || '',
        personalityType: user.personalityType || '',
        workStyle: user.workStyle || '',
        availability: user.availability || 'part-time',
        location: user.location || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      // Convert skills string to array
      const skillsArray = data.skills
        ? data.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
        : [];

      const updateData = {
        ...data,
        skills: skillsArray,
      };

      // Mock API call - replace with actual service
      console.log('Updating profile:', updateData);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update user context
      updateUser({ ...user, ...updateData });

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const getPersonalityDescription = (type) => {
    const descriptions = {
      leader: 'Natural leader who guides teams to success',
      collaborator: 'Team player who works well with others',
      innovator: 'Creative thinker who brings new ideas',
      executor: 'Gets things done efficiently and effectively',
      analyst: 'Detail-oriented problem solver',
    };
    return descriptions[type] || '';
  };

  const getExperienceColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'intermediate': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'advanced': return 'bg-red-600/20 text-red-400 border-red-600/30';
      default: return 'bg-slate-600/20 text-slate-400 border-slate-600/30';
    }
  };

  // Mock stats - replace with actual data
  const stats = [
    { label: 'Teams Joined', value: '12', icon: Users },
    { label: 'Hackathons', value: '8', icon: Calendar },
    { label: 'Projects', value: '15', icon: Code },
    { label: 'Awards', value: '3', icon: Award },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <p className="text-slate-400">Manage your profile and preferences</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="text-center mb-6">
              <img
                src={`https://ui-avatars.com/api/?name=${user?.name}&size=120&background=3B82F6&color=fff`}
                alt={user?.name}
                className="w-30 h-30 rounded-full mx-auto mb-4"
              />
              <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
              <p className="text-slate-400">{user?.email}</p>
              {user?.location && (
                <div className="flex items-center justify-center space-x-1 text-slate-400 mt-2">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
              )}
            </div>

            {/* Experience Level */}
            {user?.experience && (
              <div className="mb-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getExperienceColor(user.experience)}`}>
                  {user.experience} level
                </span>
              </div>
            )}

            {/* Bio */}
            {user?.bio && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">About</h3>
                <p className="text-slate-300 text-sm">{user.bio}</p>
              </div>
            )}

            {/* Social Links */}
            <div className="space-y-2">
              {user?.github && (
                <a
                  href={user.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
                >
                  <Github className="h-4 w-4" />
                  <span>GitHub</span>
                </a>
              )}
              {user?.linkedin && (
                <a
                  href={user.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                  <span>LinkedIn</span>
                </a>
              )}
              {user?.portfolio && (
                <a
                  href={user.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  <span>Portfolio</span>
                </a>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-600/20 rounded-full mx-auto mb-2">
                      <Icon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-slate-400">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Profile Information</h3>
              {isEditing && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCancel}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isSubmitting ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  <input
                    {...register('name')}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Location
                  </label>
                  <input
                    {...register('location')}
                    disabled={!isEditing}
                    placeholder="City, Country"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-400">{errors.location.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Experience Level
                  </label>
                  <select
                    {...register('experience')}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Availability
                  </label>
                  <select
                    {...register('availability')}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="weekends">Weekends</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Personality Type
                  </label>
                  <select
                    {...register('personalityType')}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select type</option>
                    <option value="leader">Leader</option>
                    <option value="collaborator">Collaborator</option>
                    <option value="innovator">Innovator</option>
                    <option value="executor">Executor</option>
                    <option value="analyst">Analyst</option>
                  </select>
                  {user?.personalityType && (
                    <p className="mt-1 text-xs text-slate-400">
                      {getPersonalityDescription(user.personalityType)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Work Style
                  </label>
                  <select
                    {...register('workStyle')}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select style</option>
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="fullstack">Full-stack</option>
                    <option value="design">Design</option>
                    <option value="data">Data Science</option>
                    <option value="mobile">Mobile</option>
                  </select>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bio
                </label>
                <textarea
                  {...register('bio')}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {errors.bio && (
                  <p className="mt-1 text-sm text-red-400">{errors.bio.message}</p>
                )}
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Skills
                </label>
                <input
                  {...register('skills')}
                  disabled={!isEditing}
                  placeholder="JavaScript, React, Node.js, Python..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Separate skills with commas
                </p>
              </div>

              {/* Social Links */}
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    GitHub URL
                  </label>
                  <input
                    {...register('github')}
                    disabled={!isEditing}
                    placeholder="https://github.com/username"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {errors.github && (
                    <p className="mt-1 text-sm text-red-400">{errors.github.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    LinkedIn URL
                  </label>
                  <input
                    {...register('linkedin')}
                    disabled={!isEditing}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {errors.linkedin && (
                    <p className="mt-1 text-sm text-red-400">{errors.linkedin.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Portfolio URL
                  </label>
                  <input
                    {...register('portfolio')}
                    disabled={!isEditing}
                    placeholder="https://yourportfolio.com"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {errors.portfolio && (
                    <p className="mt-1 text-sm text-red-400">{errors.portfolio.message}</p>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;