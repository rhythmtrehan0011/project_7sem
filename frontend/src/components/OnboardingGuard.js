import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OnboardingGuard = ({ children }) => {
  const { user, isNewUser, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return null;
  }

  // If user is authenticated but is a new user, redirect to onboarding
  if (user && isNewUser) {
    return <Navigate to="/onboarding" replace />;
  }

  // Otherwise, render the protected content
  return children;
};

export default OnboardingGuard;
