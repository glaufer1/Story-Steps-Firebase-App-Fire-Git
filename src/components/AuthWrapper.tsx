import { Navigate } from 'react-router-dom';
import type { AppUser } from '../interfaces';

interface AuthWrapperProps {
  user: AppUser | null;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ user }) => {
  if (!user) {
    // If the user is not logged in, send them to the landing page
    return <Navigate to="/landing" replace />;
  }

  // If the user is logged in, redirect them based on their role
  const targetPath = (user.role === 'Admin' || user.role === 'Creator') ? '/admin' : '/home';
  return <Navigate to={targetPath} replace />;
};

export default AuthWrapper;
