import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { isRoleAllowed } from '../utils/roles.js';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  const { isAuthenticated, loading, token, user } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated || !token || !user) {
    const redirectPath = `${location.pathname}${location.search}`;

    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirectPath)}`}
        replace
        state={{ from: location }}
      />
    );
  }

  if (!isRoleAllowed(user.role, allowedRoles)) {
    return <Navigate to="/forbidden" replace state={{ deniedPath: location.pathname }} />;
  }

  return children || <Outlet />;
}

export default ProtectedRoute;
