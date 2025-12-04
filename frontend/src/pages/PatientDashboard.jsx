import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import heroImage from '../assets/medium-shot-scientists-posing-together.jpg';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [showBooking, setShowBooking] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
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

  const API_BASE = window.API_BASE_URL || 'http://localhost:4000';
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
    // Sync state with URL - Robust matching
    const path = location.pathname.replace(/\/+$/, ''); // Remove trailing slash
    if (path === '/patient-dashboard/book') {
      setShowBooking(true);
    } else {
      setShowBooking(false);
    }

    fetchAppointments(1);
  }, [navigate, location.pathname, activeTab]); // Add activeTab dependency

  const fetchAppointments = async (page = 1) => {
    try {
      const response = await fetch(apiUrl(`/api/appointments?page=${page}&limit=5&tab=${activeTab}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Map backend _id to frontend id for consistency if needed, or just use _id
        const formattedAppointments = data.appointments.map(app => ({
          ...app,
          id: app._id, // Ensure we have an id property for existing logic
          doctor: app.doctorName || app.doctor || 'Unknown Doctor' // Map doctorName to doctor
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
          doctor: formData.doctor, // This is the doctor ID/value from the select
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
      setFormData({ doctor: '', doctorName: '', specialization: '', date: '', time: '', reason: '' });
      fetchAppointments(1); // Refresh list and go to page 1 to show new appointment
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Client-side filtering removed - handled by backend
  const filteredAppointments = appointments;

  if (!user) return null;

  return (
    <DashboardLayout role="patient">
      <div className="min-h-screen bg-[#f8fafc] pb-32 font-sans selection:bg-blue-100 selection:text-blue-900">
        <div className="w-full max-w-[1400px] mx-auto px-8 lg:px-16 xl:px-20 pt-16 pb-12 space-y-32">

          {/* Hero Section - Simple & Clean */}
          {!showBooking && location.pathname === '/patient-dashboard' && (
            <div className="relative w-full mb-32 overflow-hidden rounded-3xl shadow-xl">
              {/* Full Image */}
              <img
                src={heroImage}
                alt="Healthcare professionals"
                className="w-full h-auto object-cover object-center"
                style={{ maxHeight: '70vh' }}
              />

              {/* Simple Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/40 to-transparent"></div>

              {/* Text and Buttons Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 lg:px-12">
                <h1 className="text-4xl md:text-6xl font-heading font-bold text-white tracking-tight leading-tight mb-6 drop-shadow-lg">
                  Making Health Care Better Together
                </h1>

                <p className="text-xl md:text-2xl text-blue-50 font-light leading-relaxed max-w-2xl mb-10 drop-shadow-md">
                  Book and manage your appointments in seconds with our intelligent healthcare platform.
                </p>

                <div className="flex flex-col sm:flex-row gap-6">
                  <button
                    onClick={() => navigate('/patient-dashboard/book')}
                    className="px-10 py-4 bg-blue-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-blue-700 transition-all hover:-translate-y-1"
                  >
                    Book Appointment
                  </button>

                  <button
                    onClick={() => navigate('/patient-dashboard/appointments')}
                    className="px-10 py-4 bg-white/20 backdrop-blur-md border border-white/40 text-white font-bold text-lg rounded-xl hover:bg-white/30 transition-all hover:-translate-y-1"
                  >
                    My Appointments
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard Stats - Modern Interactive Cards */}
          {!showBooking && location.pathname === '/patient-dashboard' && (
            <div className="relative animate-fade-in-up mb-16">
              {/* Glass Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Card 1 - Upcoming Visits */}
                <div className="group relative bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-10 lg:p-12 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-3 transition-all duration-500 overflow-hidden">
                  {/* Animated Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Floating Icon */}
                  <div className="absolute top-4 right-4 w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>

                  {/* Pulse Ring */}
                  <div className="absolute top-6 right-6 w-12 h-12 border-2 border-blue-400/30 rounded-full animate-ping"></div>

                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mb-6 shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-5xl font-heading font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {appointments.filter(a => a.status === 'confirmed').length}
                    </h3>
                    <p className="text-slate-600 font-semibold tracking-wide uppercase text-sm group-hover:text-blue-500 transition-colors">Upcoming Visits</p>
                  </div>
                </div>

                {/* Card 2 - Completed Visits */}
                <div className="group relative bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-3 transition-all duration-500 overflow-hidden">
                  {/* Animated Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Floating Icon */}
                  <div className="absolute top-4 right-4 w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>

                  {/* Pulse Ring */}
                  <div className="absolute top-6 right-6 w-12 h-12 border-2 border-emerald-400/30 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>

                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center mb-6 shadow-lg group-hover:shadow-emerald-500/50 transition-shadow">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-5xl font-heading font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                      {appointments.filter(a => a.status === 'confirmed' && new Date(a.date) < new Date()).length}
                    </h3>
                    <p className="text-slate-600 font-semibold tracking-wide uppercase text-sm group-hover:text-emerald-500 transition-colors">Completed Visits</p>
                  </div>
                </div>

                {/* Card 3 - Total Meetings */}
                <div className="group relative bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-3 transition-all duration-500 overflow-hidden">
                  {/* Animated Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Floating Icon */}
                  <div className="absolute top-6 right-6 w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>

                  {/* Pulse Ring */}
                  <div className="absolute top-8 right-8 w-12 h-12 border-2 border-purple-400/30 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>

                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center mb-8 shadow-lg group-hover:shadow-purple-500/50 transition-shadow">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-5xl font-heading font-bold text-slate-900 mb-3 group-hover:text-purple-600 transition-colors">
                      {appointments.length}
                    </h3>
                    <p className="text-slate-600 font-semibold tracking-wide uppercase text-sm group-hover:text-purple-500 transition-colors">Total Meetings</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appointments Section - Modern Interactive Design */}
          {!showBooking && (
            <div className="animate-slide-up">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16">
                <div className="animate-fade-in-left">
                  <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-2">My Appointments</h2>
                  <p className="text-slate-600 text-lg font-light">Manage your scheduled visits and history with ease.</p>
                </div>
                <div className="flex flex-wrap gap-3 animate-fade-in-right">
                  {['all', 'upcoming', 'pending', 'past', 'cancelled'].map((tab, index) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`group relative px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-300 border-2 overflow-hidden ${activeTab === tab
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg shadow-blue-500/25 transform scale-105'
                          : 'bg-white/80 backdrop-blur-sm text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1'
                        }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Animated Background */}
                      <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-opacity duration-300 ${activeTab === tab ? 'opacity-100' : 'opacity-0 group-hover:opacity-20'
                        }`}></div>

                      <span className="relative z-10">{tab}</span>

                      {/* Active Indicator */}
                      {activeTab === tab && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {filteredAppointments.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-none p-16 text-center shadow-sm">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No appointments found</h3>
                  <p className="text-slate-500 mb-8 max-w-md mx-auto text-sm">You don't have any {activeTab} appointments.</p>
                  {activeTab === 'upcoming' && (
                    <button
                      onClick={() => setShowBooking(true)}
                      className="bg-slate-900 text-white px-8 py-3 rounded-none font-bold text-xs hover:bg-slate-800 hover:shadow-lg hover:-translate-y-1 transition-all uppercase tracking-wide"
                    >
                      Book Your First Visit
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAppointments.map((app) => (
                    <div key={app.id} className="bg-white border border-slate-100 rounded-2xl p-8 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row md:items-center gap-8 group animate-cosmic-explosion">
                      <div className="flex items-center gap-6 flex-1">
                        <div className="h-16 w-16 rounded-none bg-slate-50 flex items-center justify-center text-slate-900 font-bold text-xl shadow-sm group-hover:scale-105 transition-transform">
                          {app.doctor.split(' ').length > 1 ? app.doctor.split(' ')[1][0] : app.doctor[0]}
                        </div>
                        <div>
                          <div className="text-lg font-bold text-slate-900 mb-1">{app.doctor}</div>
                          <div className="text-slate-500 font-medium text-sm">{app.specialization}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-8 md:justify-end flex-1">
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date & Time</div>
                          <div className="text-base font-bold text-slate-900">{app.date} <span className="text-slate-300 mx-2">|</span> {app.time}</div>
                        </div>

                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</div>
                          <span className={`px-3 py-1 inline-flex text-[10px] leading-4 font-bold rounded-full uppercase tracking-wide border ${app.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            app.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'
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
                          className={`w-10 h-10 rounded-none flex items-center justify-center transition-all ${app.status === 'cancelled'
                            ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                            : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white hover:shadow-lg hover:shadow-rose-200'
                            }`}
                          title="Cancel Appointment"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {filteredAppointments.length > 0 && (
                <div className="flex justify-center items-center gap-6 mt-12">
                  <button
                    onClick={() => fetchAppointments(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-sm uppercase tracking-wide hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  <span className="text-slate-500 font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => fetchAppointments(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-sm uppercase tracking-wide hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* BOOKING WIZARD - Clean Blue & White Theme */}
          {showBooking && (
            <div className="w-full animate-fade-in pb-20 pt-10">
              <div className="max-w-[1200px] mx-auto px-8">

                {/* Header */}
                <div className="text-center mb-20">
                  <h2 className="text-4xl md:text-5xl font-heading font-bold text-blue-900 mb-6 tracking-tight">Book Appointment</h2>
                  <p className="text-blue-500 text-xl font-light">Schedule your visit with our world-class specialists.</p>
                </div>

                {/* Progress Steps - Centered & Aligned */}
                <div className="flex justify-center mb-16">
                  <div className="w-full max-w-3xl relative">
                    {/* Connecting Line */}
                    <div className="absolute top-5 left-0 w-full h-0.5 bg-blue-100 -z-10"></div>

                    <div className="flex justify-between w-full">
                      {/* Step 1 */}
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-200 ring-4 ring-white">1</div>
                        <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">Specialist</span>
                      </div>

                      {/* Step 2 */}
                      <div className="flex flex-col items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ring-4 ring-white ${formData.date ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-2 border-blue-100 text-blue-300'}`}>2</div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${formData.date ? 'text-blue-900' : 'text-blue-300'}`}>Details</span>
                      </div>

                      {/* Step 3 */}
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white border-2 border-blue-100 text-blue-300 flex items-center justify-center font-bold text-sm ring-4 ring-white">3</div>
                        <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">Confirm</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-none shadow-xl shadow-blue-100/50 border border-blue-50 overflow-hidden relative">

                  <div className="p-8 md:p-12 relative z-10 space-y-12">

                    {/* Section 1: Specialist Selection */}
                    <div>
                      <h3 className="text-xl font-bold text-blue-900 mb-8 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm">1</span>
                        Select a Specialist
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {doctors.map((doc) => (
                          <div
                            key={doc.value}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, doctor: doc.value, doctorName: doc.name, specialization: doc.specialization }));
                              setFormErrors(prev => ({ ...prev, doctor: '' }));
                            }}
                            className={`cursor-pointer group relative p-8 rounded-none border transition-all duration-300 flex flex-col items-center text-center ${formData.doctor === doc.value
                              ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-200 transform scale-[1.02]'
                              : 'bg-white border-blue-50 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 hover:-translate-y-1'
                              }`}
                          >
                            <div className={`w-20 h-20 rounded-none mb-6 flex items-center justify-center text-2xl font-bold transition-colors ${formData.doctor === doc.value ? 'bg-white/10 text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
                              }`}>
                              {doc.name.split(' ').length > 1 ? doc.name.split(' ')[1][0] : doc.name[0]}
                            </div>
                            <h4 className={`text-lg font-bold mb-1 ${formData.doctor === doc.value ? 'text-white' : 'text-blue-900'}`}>{doc.name}</h4>
                            <p className={`text-xs font-bold uppercase tracking-widest mb-6 ${formData.doctor === doc.value ? 'text-blue-100' : 'text-blue-400'}`}>{doc.specialization}</p>

                            {formData.doctor === doc.value && (
                              <div className="absolute top-4 right-4 w-6 h-6 bg-white rounded-full flex items-center justify-center text-blue-600">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {formErrors.doctor && <p className="text-rose-500 font-medium mt-6 text-center animate-pulse">Please select a specialist.</p>}
                    </div>

                    <div className="w-full h-px bg-blue-50"></div>

                    {/* Section 2: Details */}
                    <div>
                      <h3 className="text-xl font-bold text-blue-900 mb-8 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm">2</span>
                        Appointment Details
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-3">
                          <label className="block text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">Date</label>
                          <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full p-4 rounded-none bg-blue-50/50 border border-blue-100 text-lg font-bold text-blue-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:outline-none transition-all placeholder-blue-300 appearance-none"
                          />
                          {formErrors.date && <p className="text-sm text-rose-500 font-medium pl-2">{formErrors.date}</p>}
                        </div>
                        <div className="space-y-3">
                          <label className="block text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">Time</label>
                          <input
                            type="time"
                            name="time"
                            value={formData.time}
                            onChange={handleInputChange}
                            className="w-full p-4 rounded-none bg-blue-50/50 border border-blue-100 text-lg font-bold text-blue-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:outline-none transition-all placeholder-blue-300 appearance-none"
                          />
                          {formErrors.time && <p className="text-sm text-rose-500 font-medium pl-2">{formErrors.time}</p>}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">Reason for Visit</label>
                        <textarea
                          name="reason"
                          value={formData.reason}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full p-5 rounded-none bg-blue-50/50 border border-blue-100 text-lg font-medium text-blue-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:outline-none transition-all resize-none placeholder-blue-300"
                          placeholder="Please describe your symptoms..."
                        />
                        {formErrors.reason && <p className="text-sm text-rose-500 font-medium pl-2">{formErrors.reason}</p>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col md:flex-row items-center justify-end gap-6 pt-10 border-t border-blue-50 mt-8">
                      <button
                        type="button"
                        onClick={() => setShowBooking(false)}
                        className="w-full md:w-auto px-10 py-4 rounded-none text-blue-400 font-bold text-sm hover:bg-blue-50 hover:text-blue-700 transition-all uppercase tracking-widest"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full md:w-auto bg-blue-600 text-white px-12 py-4 rounded-none font-bold text-sm hover:bg-blue-700 hover:shadow-xl hover:-translate-y-1 transition-all shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest flex items-center justify-center gap-4"
                      >
                        {submitting ? 'Processing...' : 'Confirm Booking'}
                        {!submitting && <span className="text-xl">→</span>}
                      </button>
                    </div>

                  </div>
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

