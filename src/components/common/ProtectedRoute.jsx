import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from './Loading';

export default function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    // Redirect to login, save intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user logged in but no username, redirect to setup
  if (!profile?.username && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />;
  }

  // If user has username but trying to access setup, redirect to dashboard
  if (profile?.username && location.pathname === '/setup') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}