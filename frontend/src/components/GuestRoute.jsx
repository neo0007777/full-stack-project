import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const GuestRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const role = localStorage.getItem('userRole');

        setIsAuthenticated(!!token);
        setUserRole(role);
    }, []);

    if (isAuthenticated === null) {
        return null; // Prevent flash of content
    }

    if (isAuthenticated) {
        const roleDashboards = {
            patient: '/patient-dashboard',
            doctor: '/doctor-dashboard',
            admin: '/admin-dashboard'
        };

        const targetDashboard = roleDashboards[userRole] || '/patient-dashboard';

        // Redirect to dashboard, preserving the state source if needed, though usually not for login
        return <Navigate to={targetDashboard} replace />;
    }

    return <Outlet />;
};

export default GuestRoute;
