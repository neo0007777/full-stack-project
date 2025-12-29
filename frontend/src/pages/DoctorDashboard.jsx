import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import API_URL from '../config';
import '../styles/dashboard.css';

const API_BASE = API_URL;
const apiUrl = (path) => `${API_BASE}${path}`;

const DoctorDashboard = () => {
  const location = useLocation();
  const isAppointmentsPage = location.pathname.includes('/appointments');
  const name = localStorage.getItem('userName') || 'Doctor';
  const token = localStorage.getItem('authToken');

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiUrl('/api/doctor/appointments'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      setAppointments(data.appointments || []);
      setError('');
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setProcessingId(id);
      const response = await fetch(apiUrl(`/api/appointments/${id}/status`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Refresh list
      await fetchAppointments();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update appointment status');
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getFilteredAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (activeTab === 'pending') return appointments.filter(a => a.status === 'pending');

    if (activeTab === 'upcoming') {
      return appointments.filter(a =>
        a.status === 'confirmed' &&
        new Date(a.date) >= today
      );
    }

    if (activeTab === 'past') {
      return appointments.filter(a =>
        new Date(a.date) < today
      );
    }

    return appointments;
  };

  const filteredAppointments = getFilteredAppointments();

  return (
    <DashboardLayout>
      <div className="dashboard-wrapper">
        {!isAppointmentsPage && (
          <>
            {/* Welcome Section */}
            <div className="welcome-section animate-fade-in">
              <div className="welcome-bg-decoration">
                <div className="deco-circle deco-1"></div>
                <div className="deco-circle deco-2"></div>
              </div>

              <div className="welcome-content-wrapper">
                <div className="welcome-badge">Doctor's Portal</div>
                <h1 className="welcome-heading">
                  Welcome, <br />
                  <span style={{ color: '#bae6fd' }}>Dr. {name}</span>
                </h1>
                <p className="welcome-subtext">
                  Here's your schedule and patient requests for {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-container animate-fade-in" style={{ animationDelay: '0.1s' }}>
              {[
                { label: 'Total Appointments', value: appointments.length, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: '#2563eb', bg: '#eff6ff' },
                { label: 'Pending Requests', value: appointments.filter(a => a.status === 'pending').length, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: '#d97706', bg: '#fffbeb' },
                { label: 'Confirmed Visits', value: appointments.filter(a => a.status === 'confirmed').length, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: '#059669', bg: '#ecfdf5' }
              ].map((stat, idx) => (
                <div key={idx} className="stat-card">
                  <div className="stat-icon-wrapper" style={{ backgroundColor: stat.bg, color: stat.color }}>
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
                  </div>
                  <h3 className="stat-value">{stat.value}</h3>
                  <p className="stat-label">{stat.label}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Appointments List */}
        <div className="animate-slide-up" style={{ marginTop: '2rem' }}>
          <div className="section-header-modern">
            <div>
              <h2 className="section-title-modern">
                {isAppointmentsPage ? 'My Appointments' : 'Appointment Requests'}
              </h2>
              <p style={{ color: '#64748b' }}>
                {isAppointmentsPage ? 'View your confirmed schedule' : 'Manage your patient schedule'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '0.75rem' }}>
                {['pending', 'upcoming', 'past'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      background: activeTab === tab ? 'white' : 'transparent',
                      color: activeTab === tab ? '#0f172a' : '#64748b',
                      boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.2s',
                      textTransform: 'capitalize'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <button
                onClick={fetchAppointments}
                className="btn-modern btn-modern-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Refresh
              </button>
            </div>
          </div>

          <div className="list-container">
            <div style={{ padding: '0' }}> {/* Cleaned up padding */}
              {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                  <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', borderBottom: '2px solid #2563eb', margin: '0 auto 1.5rem', animation: 'spin 1s linear infinite' }}></div>
                  <p style={{ color: '#64748b', fontWeight: 500, fontSize: '1.125rem' }}>Loading appointments...</p>
                </div>
              ) : error ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                  <p style={{ color: '#e11d48', fontWeight: 500, marginBottom: '1.5rem', fontSize: '1.125rem' }}>{error}</p>
                  <button onClick={fetchAppointments} style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'underline', fontSize: '1.125rem', background: 'none', border: 'none', cursor: 'pointer' }}>Try Again</button>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
                  <p style={{ fontSize: '1.25rem', fontWeight: 500 }}>No {activeTab} appointments found.</p>
                </div>
              ) : (
                <div className="list-container">
                  {filteredAppointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="appointment-item"
                    >
                      <div className="apt-info">
                        <div className="apt-avatar" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>P</div>
                        <div className="apt-details">
                          {/* Fetch user name if possible, for now using Patient ID or Generic */}
                          <h4>Patient</h4>
                          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{appointment.reason}</p>
                        </div>
                      </div>

                      <div className="apt-meta">
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Date & Time</div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{formatDate(appointment.date)} <span style={{ color: '#cbd5e1' }}>|</span> {appointment.time}</div>
                        </div>

                        <div>
                          <span className={`status-badge ${appointment.status === 'confirmed' ? 'status-confirmed' :
                            appointment.status === 'pending' ? 'status-pending' :
                              appointment.status === 'cancelled' ? 'status-cancelled' : 'status-info'
                            }`}>
                            {appointment.status}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        {appointment.status === 'pending' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button
                              onClick={() => updateStatus(appointment._id, 'confirmed')}
                              disabled={processingId === appointment._id}
                              className="btn-modern"
                              style={{ backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #d1fae5', padding: '0.5rem 1rem', fontSize: '0.875rem', cursor: 'pointer' }}
                            >
                              {processingId === appointment._id ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => updateStatus(appointment._id, 'rejected')}
                              disabled={processingId === appointment._id} // Fixed typo
                              className="btn-modern"
                              style={{ backgroundColor: '#fff1f2', color: '#be123c', border: '1px solid #ffe4e6', padding: '0.5rem 1rem', fontSize: '0.875rem', cursor: 'pointer' }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {/* Status Label for non-pending */}
                        {appointment.status !== 'pending' && (
                          <div style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: appointment.status === 'confirmed' ? '#059669' :
                              appointment.status === 'cancelled' ? '#dc2626' : '#64748b'
                          }}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
