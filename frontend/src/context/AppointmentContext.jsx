import { createContext, useContext, useState, useEffect } from 'react';

import API_URL from '../config';

const API_BASE = API_URL;
const apiUrl = (path) => `${API_BASE}${path}`;

const AppointmentContext = createContext();

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointments must be used within AppointmentProvider');
  }
  return context;
};

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAppointments = async () => {
    const currentToken = localStorage.getItem('authToken');
    if (!currentToken) return;

    try {
      setLoading(true);
      setError(null);

      const url = apiUrl('/api/appointments');
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Non-JSON response received:', text.substring(0, 200));
        throw new Error(`Server error: Received ${response.status} ${response.statusText}. Please check if the backend is running.`);
      }

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userName');
          // Don't redirect immediately here to avoid loops, just clear data
          setAppointments([]);
          return;
        }
        throw new Error(data.message || `Failed to fetch appointments: ${response.status} ${response.statusText}`);
      }

      setAppointments(data.appointments || []);
    } catch (err) {
      setError(err.message);
      console.error('❌ Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (appointmentData) => {
    try {
      setLoading(true);
      setError(null);

      const currentToken = localStorage.getItem('authToken');

      // Construct the exact URL
      const url = apiUrl('/api/appointments');
      console.log('📤 POSTING TO:', url);
      console.log('📤 API_BASE:', API_BASE);
      console.log('📤 Payload:', appointmentData);
      console.log('📤 Token exists:', !!currentToken);

      if (!currentToken) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Non-JSON response received:', text.substring(0, 500));

        if (response.status === 404) {
          throw new Error(`Route not found (404). The backend route POST /api/appointments may not exist or the backend server is not running on ${API_BASE}. Please verify the backend is running and the route is registered.`);
        }

        throw new Error(`Server error: Received ${response.status} ${response.statusText}. Response: ${text.substring(0, 200)}`);
      }

      const data = await response.json();
      console.log('📥 Response data:', data);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userName');
          window.location.href = '/login';
          throw new Error('Session expired. Please log in again.');
        }

        const errorMsg = data.message || `Failed to create appointment: ${response.status} ${response.statusText}`;
        console.error('❌ API Error:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('✅ Appointment created successfully:', data);

      // Refresh appointments list
      await fetchAppointments();

      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to create appointment. Please try again.';
      setError(errorMessage);
      console.error('❌ Error creating appointment:', err);
      console.error('❌ Error stack:', err.stack);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getAppointmentById = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const currentToken = localStorage.getItem('authToken');
      const url = apiUrl(`/api/appointments/${id}`);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Non-JSON response received:', text.substring(0, 200));
        throw new Error(`Server error: Received ${response.status} ${response.statusText}. Please check if the backend is running.`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to fetch appointment: ${response.status} ${response.statusText}`);
      }

      return data.appointment;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch appointment';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteAppointment = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const currentToken = localStorage.getItem('authToken');
      const url = apiUrl(`/api/appointments/${id}`);
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userName');
          window.location.href = '/login';
          throw new Error('Session expired. Please log in again.');
        }
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete appointment');
      }

      // Refresh appointments list
      await fetchAppointments();
      return true;
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete appointment';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const currentToken = localStorage.getItem('authToken');
      const url = apiUrl(`/api/appointments/${id}/cancel`);
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userName');
          window.location.href = '/login';
          throw new Error('Session expired. Please log in again.');
        }
        const data = await response.json();
        throw new Error(data.message || 'Failed to cancel appointment');
      }

      // Refresh appointments list
      await fetchAppointments();
      return true;
    } catch (err) {
      const errorMessage = err.message || 'Failed to cancel appointment';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(apt =>
      apt.status === 'pending' || apt.status === 'confirmed'
    ).length,
    pending: appointments.filter(apt => apt.status === 'pending').length,
    confirmed: appointments.filter(apt => apt.status === 'confirmed').length
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    appointments,
    loading,
    error,
    stats,
    fetchAppointments,
    createAppointment,
    getAppointmentById,
    deleteAppointment,
    cancelAppointment
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};

