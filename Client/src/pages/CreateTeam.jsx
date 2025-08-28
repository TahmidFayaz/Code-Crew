import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teamService } from '../services/teams';
import { hackathonService } from '../services/hackathons';
import { useAuth } from '../hooks/useAuth';
import { Users, Plus, X, ArrowLeft, Github, Tag, Lightbulb, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateTeam = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hackathons, setHackathons] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxMembers: 4,
    requiredSkills: [],
    hackathon: '',
    projectIdea: '',
    githubRepo: '',
    tags: [],
    lookingFor: ''
  });
  const [skillInput, setSkillInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    try {
      const data = await hackathonService.getAllHackathons({ upcoming: 'true' });
      setHackathons(data.hackathons);
    } catch (error) {
      console.error('Failed to fetch hackathons:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.requiredSkills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate GitHub URL if provided
      if (formData.githubRepo && !formData.githubRepo.match(/^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+$/)) {
        toast.error('Please provide a valid GitHub repository URL');
        setLoading(false);
        return;
      }

      // Prepare data for submission
      const teamData = {
        name: formData.name,
        description: formData.description,
        maxMembers: formData.maxMembers,
        requiredSkills: formData.requiredSkills,
        hackathon: formData.hackathon || undefined,
        projectIdea: formData.projectIdea || undefined,
        githubRepo: formData.githubRepo || undefined,
        tags: formData.tags
      };
      console.log(teamData)

      await teamService.createTeam(teamData);
      toast.success('Team created successfully!');
      navigate('/teams');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/teams')}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Create Team</h1>
          <p className="text-slate-400">Start building your hackathon team</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Team Information</h2>
          <p className="text-slate-400 text-sm">
            Create your team profile to attract the right members for your project.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-white border-b border-slate-700 pb-2">
              Basic Information
            </h3>

            {/* Team Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Team Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your team name"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your team's goals, project ideas, or what you're looking for..."
              />
            </div>

            {/* Max Members */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Maximum Team Size
              </label>
              <select
                name="maxMembers"
                value={formData.maxMembers}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={2}>2 members</option>
                <option value={3}>3 members</option>
                <option value={4}>4 members</option>
                <option value={5}>5 members</option>
                <option value={6}>6 members</option>
                <option value={7}>7 members</option>
                <option value={8}>8 members</option>
                <option value={9}>9 members</option>
                <option value={10}>10 members</option>
              </select>
              <p className="text-xs text-slate-400 mt-1">
                Including yourself as the team leader
              </p>
            </div>

            {/* Required Skills */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Required Skills
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a skill (e.g., React, Python, UI/UX)"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </button>
              </div>
              {formData.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.requiredSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-600/20 text-blue-400 border border-blue-600/30 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Hackathon Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Hackathon (Optional)
              </label>
              <select
                name="hackathon"
                value={formData.hackathon}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a hackathon (optional)</option>
                {hackathons.map((hackathon) => (
                  <option key={hackathon._id} value={hackathon._id}>
                    {hackathon.title} - {new Date(hackathon.startDate).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Idea */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Lightbulb className="inline h-4 w-4 mr-1" />
                Project Idea (Optional)
              </label>
              <textarea
                name="projectIdea"
                value={formData.projectIdea}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your project idea or what you want to build..."
              />
            </div>

            {/* GitHub Repository */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Github className="inline h-4 w-4 mr-1" />
                GitHub Repository (Optional)
              </label>
              <input
                type="url"
                name="githubRepo"
                value={formData.githubRepo}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://github.com/"
              />
              <p className="text-xs text-slate-400 mt-1">
                Link to your project repository if you already have one
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Tag className="inline h-4 w-4 mr-1" />
                Tags
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add tags (e.g., AI, Web3, Mobile, Gaming)"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-slate-700 text-slate-300 border border-slate-600 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* What you're looking for */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                What are you looking for?
              </label>
              <textarea
                name="lookingFor"
                value={formData.lookingFor}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what kind of team members you're looking for..."
              />
            </div>

          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700">
            <button
              type="button"
              onClick={() => navigate('/teams')}
              className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>{loading ? 'Creating...' : 'Create Team'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeam;