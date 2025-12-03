import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const RoleProtectedRoute = ({ allowedRoles }) => {
  const location = useLocation();
  const [authState, setAuthState] = useState({ token: null, role: null, loading: true });

  useEffect(() => {
    // Check authentication after component mounts
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    setAuthState({ token, role, loading: false });
  }, []);

  // Show nothing while checking (prevents flash of redirect)
  if (authState.loading) {
    return null;
  }

  // If no token, redirect to login
  if (!authState.token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If no role stored, redirect to login (shouldn't happen, but safety check)
  if (!authState.role) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If role is not in allowed roles, redirect to appropriate dashboard
  if (!allowedRoles.includes(authState.role)) {
    const roleDashboards = {
      patient: '/patient-dashboard',
      doctor: '/doctor-dashboard',
      admin: '/admin-dashboard'
    };

    const defaultDashboard = roleDashboards[authState.role] || '/patient-dashboard';
    return <Navigate to={defaultDashboard} replace />;
  }

  // Role is allowed, render the route (persists on refresh)
  return <Outlet />;
};

export default RoleProtectedRoute;

