import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppointmentProvider } from './context/AppointmentContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AppointmentDetails from './pages/AppointmentDetails';

function App() {
  // Check if user is already authenticated on app load
  const token = localStorage.getItem('authToken');
  const role = localStorage.getItem('userRole');

  return (
    <BrowserRouter>
      <AppointmentProvider>
      <Routes>
        {/* Public Routes - redirect to dashboard if already logged in */}
        <Route 
          path="/login" 
          element={
            token && role ? (
              <Navigate 
                to={
                  role === 'patient' ? '/patient-dashboard' :
                  role === 'doctor' ? '/doctor-dashboard' :
                  role === 'admin' ? '/admin-dashboard' :
                  '/patient-dashboard'
                } 
                replace 
              />
            ) : (
              <Login />
            )
          } 
        />
        <Route 
          path="/signup" 
          element={
            token && role ? (
              <Navigate 
                to={
                  role === 'patient' ? '/patient-dashboard' :
                  role === 'doctor' ? '/doctor-dashboard' :
                  role === 'admin' ? '/admin-dashboard' :
                  '/patient-dashboard'
                } 
                replace 
              />
            ) : (
              <Signup />
            )
          } 
        />

        {/* Protected Routes with Role-Based Access */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleProtectedRoute allowedRoles={['patient']} />}>
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/patient-dashboard/book" element={<PatientDashboard />} />
            <Route path="/patient-dashboard/appointments" element={<PatientDashboard />} />
            <Route path="/patient-dashboard/appointments/:id" element={<AppointmentDetails />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={['doctor']} />}>
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor-dashboard/appointments" element={<DoctorDashboard />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin-dashboard/users" element={<AdminDashboard />} />
            <Route path="/admin-dashboard/appointments" element={<AdminDashboard />} />
          </Route>
        </Route>

        {/* Default redirect - if authenticated, go to appropriate dashboard */}
        <Route 
          path="/" 
          element={
            token && role ? (
              <Navigate 
                to={
                  role === 'patient' ? '/patient-dashboard' :
                  role === 'doctor' ? '/doctor-dashboard' :
                  role === 'admin' ? '/admin-dashboard' :
                  '/login'
                } 
                replace 
              />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      </AppointmentProvider>
    </BrowserRouter>
  );
}

export default App;

