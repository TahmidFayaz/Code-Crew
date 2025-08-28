import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { hackathonService } from '../../services/hackathons';
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Plus,
  X,
  ArrowLeft,
  Save
} from 'lucide-react';
import toast from 'react-hot-toast';

const schema = yup.object({
  title: yup.string().min(3, 'Title must be at least 3 characters').required('Title is required'),
  description: yup.string().min(10, 'Description must be at least 10 characters').required('Description is required'),
  organizer: yup.string().required('Organizer is required'),
  startDate: yup.date().required('Start date is required').min(new Date(), 'Start date must be in the future'),
  endDate: yup.date().required('End date is required').min(yup.ref('startDate'), 'End date must be after start date'),
  registrationDeadline: yup.date().required('Registration deadline is required').max(yup.ref('startDate'), 'Registration deadline must be before start date'),
  location: yup.string().oneOf(['online', 'hybrid', 'in-person']).required('Location is required'),
  venue: yup.string().when('location', {
    is: (val) => val === 'in-person' || val === 'hybrid',
    then: (schema) => schema.required('Venue is required for in-person/hybrid events'),
    otherwise: (schema) => schema.notRequired()
  }),
  maxParticipants: yup.number().min(10, 'Must allow at least 10 participants').max(10000, 'Maximum 10,000 participants').required('Max participants is required'),
  difficulty: yup.string().oneOf(['beginner', 'intermediate', 'advanced', 'all-levels']).required('Difficulty is required'),
  website: yup.string().url('Invalid URL'),
  contactEmail: yup.string().email('Invalid email'),
  rules: yup.string(),
  themes: yup.string(),
  requirements: yup.string(),
  tags: yup.string(),
});

const CreateHackathon = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      location: 'online',
      difficulty: 'all-levels',
      prizes: [{ position: '1st Place', amount: '', description: '' }]
    }
  });

  const { fields: prizeFields, append: appendPrize, remove: removePrize } = useFieldArray({
    control,
    name: 'prizes'
  });

  const watchLocation = watch('location');

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Process form data
      const hackathonData = {
        ...data,
        themes: data.themes ? data.themes.split(',').map(t => t.trim()).filter(t => t) : [],
        requirements: data.requirements ? data.requirements.split(',').map(r => r.trim()).filter(r => r) : [],
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        prizes: data.prizes.filter(p => p.position && p.amount),
      };

      await hackathonService.createHackathon(hackathonData);
      toast.success('Hackathon created successfully!');
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to create hackathon');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/admin')}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Create Hackathon</h1>
          <p className="text-slate-400">Set up a new hackathon event</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Hackathon Title *
              </label>
              <input
                {...register('title')}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="AI Innovation Challenge 2024"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Organizer *
              </label>
              <input
                {...register('organizer')}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tech Corp Inc."
              />
              {errors.organizer && (
                <p className="mt-1 text-sm text-red-400">{errors.organizer.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description *
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the hackathon, its goals, and what participants can expect..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Start Date *
              </label>
              <input
                {...register('startDate')}
                type="datetime-local"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-400">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                End Date *
              </label>
              <input
                {...register('endDate')}
                type="datetime-local"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-400">{errors.endDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Registration Deadline *
              </label>
              <input
                {...register('registrationDeadline')}
                type="datetime-local"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.registrationDeadline && (
                <p className="mt-1 text-sm text-red-400">{errors.registrationDeadline.message}</p>
              )}
            </div>
          </div>

          {/* Location & Venue */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Location Type *
              </label>
              <select
                {...register('location')}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
                <option value="in-person">In-Person</option>
              </select>
              {errors.location && (
                <p className="mt-1 text-sm text-red-400">{errors.location.message}</p>
              )}
            </div>

            {(watchLocation === 'in-person' || watchLocation === 'hybrid') && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Venue *
                </label>
                <input
                  {...register('venue')}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Convention Center, City"
                />
                {errors.venue && (
                  <p className="mt-1 text-sm text-red-400">{errors.venue.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Participants & Difficulty */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Max Participants *
              </label>
              <input
                {...register('maxParticipants')}
                type="number"
                min="10"
                max="10000"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="500"
              />
              {errors.maxParticipants && (
                <p className="mt-1 text-sm text-red-400">{errors.maxParticipants.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Difficulty Level *
              </label>
              <select
                {...register('difficulty')}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all-levels">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              {errors.difficulty && (
                <p className="mt-1 text-sm text-red-400">{errors.difficulty.message}</p>
              )}
            </div>
          </div>

          {/* Prizes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-slate-300">
                Prizes
              </label>
              <button
                type="button"
                onClick={() => appendPrize({ position: '', amount: '', description: '' })}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add Prize</span>
              </button>
            </div>

            <div className="space-y-3">
              {prizeFields.map((field, index) => (
                <div key={field.id} className="grid md:grid-cols-4 gap-3 items-end">
                  <div>
                    <input
                      {...register(`prizes.${index}.position`)}
                      placeholder="1st Place"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      {...register(`prizes.${index}.amount`)}
                      placeholder="$5,000"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      {...register(`prizes.${index}.description`)}
                      placeholder="Cash prize + mentorship"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => removePrize(index)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Website URL
              </label>
              <input
                {...register('website')}
                type="url"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://hackathon.example.com"
              />
              {errors.website && (
                <p className="mt-1 text-sm text-red-400">{errors.website.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Contact Email
              </label>
              <input
                {...register('contactEmail')}
                type="email"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="contact@hackathon.com"
              />
              {errors.contactEmail && (
                <p className="mt-1 text-sm text-red-400">{errors.contactEmail.message}</p>
              )}
            </div>
          </div>

          {/* Themes, Requirements, Tags */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Themes
              </label>
              <input
                {...register('themes')}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="AI, Machine Learning, Web Development (comma-separated)"
              />
              <p className="mt-1 text-xs text-slate-400">Separate themes with commas</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Requirements
              </label>
              <input
                {...register('requirements')}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Team size 2-4, Original idea, Working prototype (comma-separated)"
              />
              <p className="mt-1 text-xs text-slate-400">Separate requirements with commas</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tags
              </label>
              <input
                {...register('tags')}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="innovation, startup, technology (comma-separated)"
              />
              <p className="mt-1 text-xs text-slate-400">Separate tags with commas</p>
            </div>
          </div>

          {/* Rules */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Rules & Guidelines
            </label>
            <textarea
              {...register('rules')}
              rows={6}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1. Teams must consist of 2-4 members&#10;2. All code must be written during the event&#10;3. Use of external APIs is allowed&#10;..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-700">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Creating...' : 'Create Hackathon'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateHackathon;