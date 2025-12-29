import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import heroImage from '../assets/medium-shot-scientists-posing-together.jpg';
import '../styles/dashboard.css';

import API_URL from '../config';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [showBooking, setShowBooking] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    doctor: '',
    doctorName: '',
    specialization: '',
    date: '',
    time: '',
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Mock Data
  const doctors = [
    { value: 'dr-smith', name: 'Dr. Sarah Smith', specialization: 'Cardiologist', rating: 4.9 },
    { value: 'dr-jones', name: 'Dr. Mike Jones', specialization: 'Dermatologist', rating: 4.8 },
    { value: 'dr-lee', name: 'Dr. Emily Lee', specialization: 'Pediatrician', rating: 4.9 },
    { value: 'dr-wilson', name: 'Dr. John Wilson', specialization: 'Neurologist', rating: 4.7 },
    { value: 'dr-brown', name: 'Dr. Lisa Brown', specialization: 'General', rating: 4.8 },
  ];

  const location = useLocation();

  const API_BASE = API_URL;
  const apiUrl = (path) => `${API_BASE}${path}`;
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }

    // Sync state with URL
    const path = location.pathname.replace(/\/+$/, ''); // Remove trailing slash
    if (path === '/patient-dashboard/book') {
      setShowBooking(true);
    } else {
      setShowBooking(false);
    }

    fetchAppointments(1);
  }, [navigate, location.pathname, activeTab, searchQuery]);

  const fetchAppointments = async (page = 1) => {
    try {
      const response = await fetch(apiUrl(`/api/appointments?page=${page}&limit=5&tab=${activeTab}&search=${encodeURIComponent(searchQuery)}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const formattedAppointments = data.appointments.map(app => ({
          ...app,
          id: app._id,
          doctor: app.doctorName || app.doctor || 'Unknown Doctor'
        }));
        setAppointments(formattedAppointments);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.doctor) errors.doctor = 'Please select a specialist';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.time) errors.time = 'Time is required';
    if (!formData.reason || formData.reason.length < 10) errors.reason = 'Reason must be at least 10 characters';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(apiUrl('/api/appointments'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctor: formData.doctor,
          doctorName: formData.doctorName,
          specialization: formData.specialization,
          date: formData.date,
          time: formData.time,
          reason: formData.reason
        })
      });

      if (!response.ok) {
        throw new Error('Failed to book appointment');
      }

      const data = await response.json();
      alert('Appointment booked successfully!');
      setShowBooking(false);
      setFormData({ doctor: '', doctorName: '', specialization: '', date: '', time: '', reason: '' });
      fetchAppointments(1);
    } catch (error) {
      console.error('Error booking appointment:', error);
      let errorMessage = 'Failed to book appointment. Please try again.';
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Network Error: Unable to reach the server. Please ensure the backend is running.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAppointments = appointments;

  if (!user) return null;

  return (
    <DashboardLayout role="patient">
      <div className="dashboard-container">
        <div className="dashboard-wrapper">

          {/* Hero / Welcome Section */}
          {!showBooking && location.pathname === '/patient-dashboard' && (
            <div className="welcome-section animate-fade-in">
              <div className="welcome-bg-decoration">
                <div className="deco-circle deco-1"></div>
                <div className="deco-circle deco-2"></div>
              </div>

              <div className="welcome-content-wrapper">
                <div className="welcome-badge">Patient Portal</div>
                <h1 className="welcome-heading">
                  Your Health, <br /> Our Priority.
                </h1>
                <p className="welcome-subtext">
                  Book appointments, view history, and manage your care plan seamlessly.
                </p>

                <div className="welcome-actions">
                  <button
                    onClick={() => navigate('/patient-dashboard/book')}
                    className="btn-welcome btn-welcome-primary"
                  >
                    Book Appointment
                  </button>
                  <button
                    onClick={() => navigate('/patient-dashboard/appointments')}
                    className="btn-welcome btn-welcome-outline"
                  >
                    My Appointments
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard Stats */}
          {!showBooking && location.pathname === '/patient-dashboard' && (
            <div className="stats-container animate-fade-in">
              {/* Upcoming Visits */}
              <div className="stat-card">
                <div className="stat-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="stat-value">
                  {appointments.filter(a => a.status === 'confirmed').length}
                </h3>
                <p className="stat-label">Upcoming Visits</p>
              </div>

              {/* Completed Visits */}
              <div className="stat-card">
                <div className="stat-icon-wrapper" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="stat-value">
                  {appointments.filter(a => a.status === 'confirmed' && new Date(a.date) < new Date()).length}
                </h3>
                <p className="stat-label">Completed Visits</p>
              </div>

              {/* Total Meetings */}
              <div className="stat-card">
                <div className="stat-icon-wrapper" style={{ backgroundColor: '#faf5ff', color: '#9333ea' }}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="stat-value">
                  {appointments.length}
                </h3>
                <p className="stat-label">Total Meetings</p>
              </div>
            </div>
          )}

          {/* Appointments Section */}
          {!showBooking && (
            <div className="animate-slide-up" style={{ marginTop: '2rem' }}>
              <div className="section-header-modern">
                <div>
                  <h2 className="section-title-modern">My Appointments</h2>
                  <p style={{ color: '#64748b' }}>Manage your scheduled visits and history.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '0.75rem' }}>
                  {['all', 'upcoming', 'pending', 'past'].map((tab) => (
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
                        transition: 'all 0.2s'
                      }}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar - Modernized */}
              <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '400px' }}>
                <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by doctor name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value) setActiveTab('all');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                    borderRadius: '1rem',
                    border: '1px solid #e2e8f0',
                    outline: 'none',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 4px rgba(79, 70, 229, 0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {filteredAppointments.length === 0 ? (
                <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', borderRadius: '1.5rem' }}>
                  <div style={{ width: '4rem', height: '4rem', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#94a3b8' }}>
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>No appointments found</h3>
                  <p style={{ color: '#64748b' }}>You don't have any {activeTab} appointments.</p>
                  {activeTab === 'upcoming' && (
                    <button
                      onClick={() => setShowBooking(true)}
                      className="btn-modern-primary"
                      style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Book Your First Visit
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <div className="list-container">
                    {filteredAppointments.map((app) => (
                      <div key={app.id} className="appointment-item">
                        <div className="apt-info">
                          <div className="apt-avatar">
                            {app.doctor.split(' ').length > 1 ? app.doctor.split(' ')[1][0] : app.doctor[0]}
                          </div>
                          <div className="apt-details">
                            <h4>{app.doctor}</h4>
                            <p>{app.specialization}</p>
                          </div>
                        </div>

                        <div className="apt-meta">
                          <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Date & Time</div>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{app.date} <span style={{ color: '#cbd5e1' }}>|</span> {app.time}</div>
                          </div>

                          <div>
                            <span className={`status-badge ${app.status === 'confirmed' ? 'status-confirmed' :
                              app.status === 'pending' ? 'status-pending' :
                                app.status === 'cancelled' ? 'status-cancelled' : 'status-info'
                              }`}>
                              {app.status}
                            </span>
                          </div>

                          <button
                            onClick={async () => {
                              if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
                              try {
                                const response = await fetch(apiUrl(`/api/appointments/${app._id}/cancel`), {
                                  method: 'PUT',
                                  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                                });
                                if (response.ok) fetchAppointments(currentPage);
                                else alert('Failed to cancel appointment');
                              } catch (error) {
                                console.error('Error cancelling appointment:', error);
                                alert('Error cancelling appointment');
                              }
                            }}
                            disabled={app.status === 'cancelled'}
                            style={{
                              padding: '0.5rem',
                              borderRadius: '0.5rem',
                              border: '1px solid #fee2e2',
                              background: '#fef2f2',
                              color: '#dc2626',
                              cursor: app.status === 'cancelled' ? 'not-allowed' : 'pointer',
                              opacity: app.status === 'cancelled' ? 0.5 : 1,
                              transition: 'all 0.2s'
                            }}
                            title="Cancel Appointment"
                          >
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pagination Controls */}
              {filteredAppointments.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', marginTop: '3rem' }}>
                  <button
                    onClick={() => fetchAppointments(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="btn btn-outline"
                    style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
                  >
                    Previous
                  </button>
                  <span style={{ color: '#64748b', fontWeight: 500 }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => fetchAppointments(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="btn btn-outline"
                    style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* BOOKING WIZARD */}
          {showBooking && (
            <div className="wizard-container animate-fade-in">
              <div className="text-center" style={{ marginBottom: '2rem' }}>
                <h2 className="section-title-modern" style={{ textAlign: 'center' }}>Book Appointment</h2>
                <p style={{ color: '#64748b' }}>Schedule your visit with our world-class specialists.</p>
              </div>

              {/* Progress Steps */}
              <div className="wizard-steps">
                <div className="progress-track"></div>

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', width: '60%' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="step-indicator active">1</div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>Specialist</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div className={`step-indicator ${formData.date ? 'active' : ''}`} style={{ background: formData.date ? '#4f46e5' : '#f1f5f9', color: formData.date ? 'white' : '#94a3b8', borderColor: 'white' }}>2</div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: formData.date ? '#0f172a' : '#94a3b8' }}>Details</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="step-indicator" style={{ background: '#f1f5f9', color: '#94a3b8', borderColor: 'white' }}>3</div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8' }}>Confirm</span>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #eff6ff', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '2rem' }}>

                {/* Section 1: Specialist Selection */}
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1e293b' }}>1. Select a Specialist</h3>
                  <div className="doctor-grid">
                    {doctors.map((doc) => (
                      <div
                        key={doc.value}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, doctor: doc.value, doctorName: doc.name, specialization: doc.specialization }));
                          setFormErrors(prev => ({ ...prev, doctor: '' }));
                        }}
                        className={`doctor-select-card ${formData.doctor === doc.value ? 'selected' : ''}`}
                      >
                        <div style={{
                          width: '4rem', height: '4rem', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700,
                          backgroundColor: formData.doctor === doc.value ? '#3b82f6' : '#eff6ff',
                          color: formData.doctor === doc.value ? 'white' : '#2563eb',
                          borderRadius: '1rem', transition: 'all 0.2s'
                        }}>
                          {doc.name.split(' ').length > 1 ? doc.name.split(' ')[1][0] : doc.name[0]}
                        </div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>{doc.name}</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{doc.specialization}</p>
                      </div>
                    ))}
                  </div>
                  {formErrors.doctor && <p className="error-text" style={{ textAlign: 'center', marginTop: '1.5rem' }}>Please select a specialist.</p>}
                </div>

                <div style={{ height: '1px', backgroundColor: '#eff6ff', margin: '3rem 0' }}></div>

                {/* Section 2: Details */}
                <div>
                  <h3 className="section-title" style={{ marginBottom: '2rem' }}>2. Appointment Details</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase' }}>Date</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="search-input"
                        style={{ padding: '1rem', fontWeight: 700 }}
                      />
                      {formErrors.date && <p className="error-text">{formErrors.date}</p>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase' }}>Time</label>
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        className="search-input"
                        style={{ padding: '1rem', fontWeight: 700 }}
                      />
                      {formErrors.time && <p className="error-text">{formErrors.time}</p>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase' }}>Reason for Visit</label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      rows={4}
                      className="search-input"
                      style={{ padding: '1.25rem', resize: 'none' }}
                      placeholder="Please describe your symptoms..."
                    />
                    {formErrors.reason && <p className="error-text">{formErrors.reason}</p>}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    onClick={() => setShowBooking(false)}
                    className="btn-welcome btn-welcome-outline"
                    style={{ color: '#64748b', borderColor: '#cbd5e1' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn-modern-primary"
                    style={{ padding: '0.75rem 2rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {submitting ? 'Processing...' : 'Confirm Booking'}
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
