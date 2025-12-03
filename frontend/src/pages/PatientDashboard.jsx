import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

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
      <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans selection:bg-blue-100 selection:text-blue-900">
        <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 pt-8 space-y-16">

          {/* Welcome Section - Minimalist & Elegant - Only show on main dashboard */}
          {!showBooking && location.pathname === '/patient-dashboard' && (
            <div className="relative animate-fade-in">
              <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-12">
                <div>
                  <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight text-slate-900 mb-4">
                    Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user.name.split(' ')[0]}</span>
                  </h1>
                  <p className="text-slate-500 text-xl font-light max-w-2xl leading-relaxed">
                    Your health overview for this week. You have <span className="font-semibold text-slate-900">{appointments.filter(a => a.status === 'confirmed').length} upcoming</span> appointments.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/patient-dashboard/book')}
                  className="group relative px-8 py-4 bg-slate-900 text-white rounded-none font-medium text-sm tracking-wide overflow-hidden shadow-xl shadow-slate-200 hover:shadow-2xl hover:shadow-slate-300 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center gap-3">
                    Book Appointment
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </span>
                </button>
              </div>

              {/* Glass Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Card 1 */}
                <div className="glass-panel p-8 rounded-none relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    <svg className="w-32 h-32 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>
                  </div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-none bg-blue-50 text-blue-600 flex items-center justify-center mb-6 shadow-sm">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <h3 className="text-4xl font-heading font-bold text-slate-900 mb-2">{appointments.filter(a => a.status === 'confirmed').length}</h3>
                    <p className="text-slate-500 font-medium tracking-wide uppercase text-xs">Upcoming Visits</p>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="glass-panel p-8 rounded-none relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    <svg className="w-32 h-32 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" /></svg>
                  </div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-none bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 shadow-sm">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="text-4xl font-heading font-bold text-slate-900 mb-2">{appointments.filter(a => a.status === 'confirmed' && new Date(a.date) < new Date()).length}</h3>
                    <p className="text-slate-500 font-medium tracking-wide uppercase text-xs">Completed Visits</p>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="glass-panel p-8 rounded-none relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    <svg className="w-32 h-32 text-purple-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>
                  </div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-none bg-purple-50 text-purple-600 flex items-center justify-center mb-6 shadow-sm">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <h3 className="text-4xl font-heading font-bold text-slate-900 mb-2">{appointments.length}</h3>
                    <p className="text-slate-500 font-medium tracking-wide uppercase text-xs">Number of Meetings</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity - Clean List */}
          {!showBooking && (
            <div className="animate-slide-up">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-slate-900">My Appointments</h2>
                  <p className="text-slate-500 mt-1 text-sm font-light">Manage your scheduled visits and history.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['all', 'upcoming', 'pending', 'past', 'cancelled'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all border ${activeTab === tab
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-105'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-900 hover:shadow-sm'
                        }`}
                    >
                      {tab}
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
                    <div key={app.id} className="bg-white border border-slate-100 rounded-none p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col md:flex-row md:items-center gap-6 group">
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
                <div className="flex justify-center items-center gap-4 mt-8">
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
                <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-heading font-bold text-blue-900 mb-4 tracking-tight">Book Appointment</h2>
                  <p className="text-blue-500 text-lg font-light">Schedule your visit with our world-class specialists.</p>
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

