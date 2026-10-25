import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
        <HelpCircle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">404</h1>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Page Not Found</h2>
      <p className="text-sm text-gray-500 max-w-sm mb-6">
        The requested screen or URL does not exist or may have been moved.
      </p>
      <Link to="/" className="btn-primary inline-flex items-center gap-2">
        <Home className="w-4 h-4" /> Return to Course Catalog
      </Link>
    </div>
  );
};

export default NotFoundPage;
