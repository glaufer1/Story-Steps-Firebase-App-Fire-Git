import { Navigate, Outlet } from 'react-router-dom';
import type { AppUser } from '../interfaces';

interface ProtectedRouteProps {
  user: AppUser | null;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ user }) => {
  if (!user) {
    // If the user is not logged in, redirect them to the login page
    return <Navigate to="/login" replace />;
  }

  // If the user is logged in, allow them to see the nested routes
  return <Outlet />;
};

export default ProtectedRoute;
