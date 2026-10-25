import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner text="Authenticating session..." />;
  }

  if (!isAuthenticated) {
    // Redirect to login while saving the intended path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-red-200 rounded-2xl text-center shadow-sm">
        <h2 className="text-xl font-bold text-red-600 mb-2">Access Restricted</h2>
        <p className="text-gray-600 text-sm mb-6">
          Your current role (<span className="font-semibold">{user.role}</span>) does not have authorization to view this section.
        </p>
        <a href="/dashboard" className="btn-primary inline-block">
          Return to Dashboard
        </a>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
