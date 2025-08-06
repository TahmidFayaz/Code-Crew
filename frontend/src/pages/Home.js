import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Users, 
  BookOpen, 
  Library, 
  Trophy, 
  ArrowRight,
  Code2,
  Target,
  Zap,
  Heart
} from 'lucide-react';
import { hackathonAPI, blogAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Home = () => {
  const { data: upcomingHackathons, isLoading: hackathonsLoading } = useQuery(
    'upcomingHackathons',
    () => hackathonAPI.getUpcomingHackathons({ limit: 3 }),
    { staleTime: 5 * 60 * 1000 }
  );

  const { data: trendingBlogs, isLoading: blogsLoading } = useQuery(
    'trendingBlogs',
    () => blogAPI.getTrendingBlogs({ limit: 3 }),
    { staleTime: 5 * 60 * 1000 }
  );

  const features = [
    {
      icon: Users,
      title: 'Team Formation',
      description: 'Find compatible teammates based on skills and experience for your next hackathon.'
    },
    {
      icon: Trophy,
      title: 'Hackathon Listings',
      description: 'Discover upcoming hackathons and competitions from around the world.'
    },
    {
      icon: BookOpen,
      title: 'Knowledge Sharing',
      description: 'Read and share insights, tips, and experiences through our blog platform.'
    },
    {
      icon: Library,
      title: 'Resource Library',
      description: 'Access curated tools, tutorials, and resources to boost your development skills.'
    }
  ];

  const stats = [
    { label: 'Active Teams', value: '500+', icon: Users },
    { label: 'Hackathons Listed', value: '200+', icon: Trophy },
    { label: 'Blog Posts', value: '1000+', icon: BookOpen },
    { label: 'Resources Shared', value: '300+', icon: Library }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Code2 className="w-12 h-12 text-blue-600" />
              <h1 className="text-5xl font-bold text-gray-900">Code Crew</h1>
            </div>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              The ultimate collaborative platform for hackathon enthusiasts. 
              Connect with like-minded developers, form winning teams, and build amazing projects together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/teams" className="btn btn-primary btn-lg">
                Find Your Team
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/hackathons" className="btn btn-outline btn-lg">
                Browse Hackathons
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Hackathon Success
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From team formation to resource sharing, we provide all the tools 
              you need to excel in hackathons and collaborative development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-16">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Hackathons */}
      <section className="py-20">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Upcoming Hackathons
              </h2>
              <p className="text-gray-600">
                Don't miss out on these exciting opportunities
              </p>
            </div>
            <Link to="/hackathons" className="btn btn-outline">
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {hackathonsLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingHackathons?.data?.hackathons?.map((hackathon) => (
                <Link
                  key={hackathon._id}
                  to={`/hackathons/${hackathon._id}`}
                  className="card hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="badge badge-primary">
                      {hackathon.location.type}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {hackathon.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {hackathon.description}
                  </p>
                  <div className="text-sm text-gray-500">
                    {new Date(hackathon.startDate).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trending Blogs */}
      <section className="bg-gray-50 py-20">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Trending Blog Posts
              </h2>
              <p className="text-gray-600">
                Latest insights from the community
              </p>
            </div>
            <Link to="/blogs" className="btn btn-outline">
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {blogsLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trendingBlogs?.data?.blogs?.map((blog) => (
                <Link
                  key={blog._id}
                  to={`/blogs/${blog._id}`}
                  className="card hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="badge badge-secondary">
                      {blog.category}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Heart className="w-4 h-4" />
                      {blog.likes?.length || 0}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {blog.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>By {blog.author?.username}</span>
                    <span>•</span>
                    <span>{blog.readTime} min read</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are already building amazing projects together. 
            Your next great collaboration is just a click away.
          </p>
          <Link to="/register" className="btn bg-white text-blue-600 hover:bg-gray-100 btn-lg">
            Get Started Today
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;