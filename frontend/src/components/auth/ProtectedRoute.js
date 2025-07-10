import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ requiredRole = null }) => {
  const { user, loading } = useAuth();

  // If still loading, show a loading spinner
  if (loading) {
    return (
      <div className="loading-container" style={{ padding: '50px 0' }}>
        <LoadingSpinner size="large" text="Verifying authentication..." />
      </div>
    );
  }

  // If not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If role check is required and user doesn't have the required role
  if (requiredRole && user.role !== requiredRole) {
    // For admin-only routes
    if (requiredRole === 'admin') {
      return <Navigate to="/" replace />;
    }
    
    // For editor-only routes, allow admin access too
    if (requiredRole === 'editor' && user.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
    
    // For reviewer-only routes, allow admin and editor access too
    if (requiredRole === 'reviewer' && user.role !== 'admin' && user.role !== 'editor') {
      return <Navigate to="/" replace />;
    }
  }

  // If all checks pass, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
