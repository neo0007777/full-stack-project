import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAppointments } from '../context/AppointmentContext';
import '../styles/dashboard.css';

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAppointmentById, loading } = useAppointments();
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAppointment = async () => {
      try {
        setError(null);
        const data = await getAppointmentById(id);
        setAppointment(data);
      } catch (err) {
        console.error('Error loading appointment:', err);
        setError(err.message || 'Failed to load appointment details');
      }
    };

    if (id) {
      loadAppointment();
    }
  }, [id, getAppointmentById]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', borderBottom: '2px solid #2563eb', margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ color: '#4b5563' }}>Loading appointment details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="details-card" style={{ maxWidth: '600px', margin: '0 auto', borderRadius: '0.75rem' }}>
          <div className="details-card-body" style={{ textAlign: 'center' }}>
            <div style={{ width: '4rem', height: '4rem', backgroundColor: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#dc2626' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>Error</h2>
            <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>{error}</p>
            <button
              onClick={() => navigate('/patient-dashboard/appointments')}
              className="btn btn-primary"
            >
              Back to My Appointments
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!appointment) {
    return (
      <DashboardLayout>
        <div className="details-card" style={{ maxWidth: '600px', margin: '0 auto', borderRadius: '0.75rem' }}>
          <div className="details-card-body" style={{ textAlign: 'center' }}>
            <p style={{ color: '#4b5563', fontSize: '1.125rem' }}>Appointment not found</p>
            <button
              onClick={() => navigate('/patient-dashboard/appointments')}
              className="btn btn-primary"
              style={{ marginTop: '1rem' }}
            >
              Back to My Appointments
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="details-container animate-fade-in-up">
        {/* Header */}
        <div className="details-header">
          <div>
            <button
              onClick={() => navigate('/patient-dashboard/appointments')}
              className="back-link"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to My Appointments</span>
            </button>
            <h1 className="dashboard-title">Appointment Details</h1>
          </div>
          <span className={`status-badge ${appointment.status === 'confirmed' ? 'success' :
              appointment.status === 'pending' ? 'warning' : 'error'
            }`} style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
            {appointment.status}
          </span>
        </div>

        {/* Main Details Card */}
        <div className="details-card">
          <div className="details-card-header">
            <div style={{ width: '3rem', height: '3rem', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Appointment Information</h2>
              <p style={{ color: '#64748b', fontWeight: 500 }}>View full details of your visit</p>
            </div>
          </div>

          <div className="details-card-body">
            {/* Doctor Information */}
            <div style={{ paddingBottom: '2.5rem', borderBottom: '1px solid #f1f5f9', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                <div style={{ width: '5rem', height: '5rem', background: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #dbeafe', flexShrink: 0 }}>
                  <span style={{ fontSize: '1.875rem', fontWeight: 700, color: '#2563eb' }}>{appointment.doctorName.split(' ')[1] ? appointment.doctorName.split(' ')[1][0] : 'D'}</span>
                </div>
                <div style={{ flex: 1, paddingTop: '0.25rem' }}>
                  <h3 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>{appointment.doctorName}</h3>
                  {appointment.specialization && (
                    <p style={{ fontSize: '1.125rem', color: '#2563eb', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.025em' }}>{appointment.specialization}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="details-grid">
              <div className="detail-item">
                <p className="detail-label">Appointment Date</p>
                <div className="detail-value">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#3b82f6' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="detail-value-text">{formatDate(appointment.date)}</p>
                </div>
              </div>

              <div className="detail-item">
                <p className="detail-label">Appointment Time</p>
                <div className="detail-value">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#3b82f6' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="detail-value-text">{formatTime(appointment.time)}</p>
                </div>
              </div>

              <div className="detail-item">
                <p className="detail-label">Current Status</p>
                <div className="detail-value">
                  <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', backgroundColor: appointment.status === 'confirmed' ? '#10b981' : appointment.status === 'pending' ? '#f59e0b' : '#f43f5e' }}></div>
                  <p className="detail-value-text" style={{ textTransform: 'capitalize' }}>{appointment.status}</p>
                </div>
              </div>

              <div className="detail-item">
                <p className="detail-label">Created At</p>
                <div className="detail-value">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#94a3b8' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="detail-value-text">{formatDate(appointment.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Reason for Visit */}
            <div className="detail-item" style={{ marginTop: '2rem', padding: '2.5rem' }}>
              <p className="detail-label" style={{ marginBottom: '1rem' }}>Reason for Visit</p>
              <p style={{ color: '#334155', fontSize: '1.125rem', lineHeight: 1.6, fontWeight: 500 }}>{appointment.reason}</p>
            </div>

            {/* Appointment ID */}
            <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
              <p className="detail-label" style={{ margin: 0 }}>Appointment ID</p>
              <span style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.25rem 0.75rem' }}>{appointment._id || appointment.id}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '2.5rem' }}>
          <button
            onClick={() => navigate('/patient-dashboard/appointments')}
            className="btn btn-outline"
            style={{ padding: '1rem 2rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem' }}
          >
            Back to My Appointments
          </button>

          {appointment.status === 'pending' && (
            <button
              // In a real app, this should call a cancel function
              onClick={() => {
                if (window.confirm('Are you sure you want to cancel this appointment?')) {
                  // Logic to cancel would go here or redirect
                  alert('Cancellation logic not implemented in this view.');
                }
              }}
              className="btn btn-danger"
              style={{ padding: '1rem 2rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              Cancel Appointment
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AppointmentDetails;
