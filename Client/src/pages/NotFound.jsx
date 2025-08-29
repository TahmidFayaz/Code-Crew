import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-slate-700">404</h1>
          <div className="text-4xl font-bold text-white mb-4">Page Not Found</div>
          <p className="text-xl text-slate-400 mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
          >
            <Home className="h-5 w-5" />
            <span>Go Home</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;