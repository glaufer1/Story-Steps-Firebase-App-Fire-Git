import React from 'react';
import { Navigate } from 'react-router-dom';
import type { AppUser } from '../interfaces';

interface AuthWrapperProps {
  user: AppUser | null;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ user }) => {
  if (!user) {
    return <Navigate to="/landing" />;
  }

  // Redirect based on user role
  switch (user.role) {
    case 'Admin':
      return <Navigate to="/admin/tour-creator" />;
    case 'Creator':
      return <Navigate to="/admin/tour-creator" />;
    default:
      return <Navigate to="/home" />;
  }
};

export default AuthWrapper;
