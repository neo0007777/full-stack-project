import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

const API_BASE = window.API_BASE_URL || 'http://localhost:4000';
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

  // Filter appointments based on the current page
  const filteredAppointments = isAppointmentsPage
    ? appointments.filter(apt => apt.status === 'confirmed')
    : appointments;

  return (
    <DashboardLayout>
      <div className="space-y-16 animate-fade-in pb-20">
        {!isAppointmentsPage && (
          <>
            {/* Welcome Card */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-none shadow-xl p-16 md:p-20 text-white mb-16">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/20 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8 opacity-80">
                  <span className="px-5 py-2 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider border border-white/10">Doctor Portal</span>
                  <span className="text-sm font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <h1 className="text-6xl md:text-7xl font-heading font-bold mb-8 leading-tight">
                  Welcome, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">Dr. {name}</span>
                </h1>
                <p className="text-blue-100 text-xl md:text-2xl max-w-3xl leading-relaxed">
                  Manage your appointments and patient care with ease.
                </p>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
              {[
                { label: 'Total Appointments', value: appointments.length, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', bg: 'bg-white border border-slate-100', text: 'text-slate-900', iconColor: 'text-blue-600', iconBg: 'bg-blue-50' },
                { label: 'Pending Requests', value: appointments.filter(a => a.status === 'pending').length, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-white border border-slate-100', text: 'text-slate-900', iconColor: 'text-amber-600', iconBg: 'bg-amber-50' },
                { label: 'Confirmed Visits', value: appointments.filter(a => a.status === 'confirmed').length, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z', bg: 'bg-white border border-slate-100', text: 'text-slate-900', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50' }
              ].map((stat, idx) => (
                <div key={idx} className={`${stat.bg} p-14 rounded-none shadow-sm hover:shadow-xl transition-all group`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-16 h-16 ${stat.iconBg} rounded-none flex items-center justify-center`}>
                      <svg className={`w-8 h-8 ${stat.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
                    </div>
                    <span className={`text-5xl font-bold ${stat.text}`}>{stat.value}</span>
                  </div>
                  <p className="text-slate-500 font-bold text-xl">{stat.label}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Appointments List */}
        <div className="bg-white rounded-none shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-12 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-heading font-bold text-slate-900 mb-2">
                {isAppointmentsPage ? 'My Appointments' : 'Appointment Requests'}
              </h2>
              <p className="text-slate-500 font-medium text-lg">
                {isAppointmentsPage ? 'View your confirmed schedule' : 'Manage your patient schedule'}
              </p>
            </div>
            <button
              onClick={fetchAppointments}
              className="px-8 py-4 bg-white border border-slate-200 text-blue-600 font-bold rounded-none hover:bg-blue-50 transition-colors text-sm flex items-center gap-3 uppercase tracking-wide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Refresh
            </button>
          </div>

          <div className="p-12">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-blue-600 mx-auto mb-6"></div>
                <p className="text-slate-500 font-medium text-lg">Loading appointments...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-rose-600 font-medium mb-6 text-lg">{error}</p>
                <button onClick={fetchAppointments} className="text-blue-600 font-bold hover:underline text-lg">Try Again</button>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <p className="text-xl font-medium">No appointments found.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredAppointments.map((appointment, index) => (
                  <div
                    key={appointment._id}
                    className="p-10 bg-white rounded-none border border-slate-100 hover:shadow-lg transition-all duration-300 group animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                      <div className="flex-1">
                        <div className="flex items-center space-x-8 mb-6 md:mb-0">
                          <div className="w-20 h-20 bg-blue-50 rounded-none flex items-center justify-center text-blue-600 font-bold text-2xl border border-blue-100 group-hover:scale-110 transition-transform duration-300">
                            {/* Use patient name initial if available, else 'P' */}
                            P
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-xl mb-2">Patient ID: <span className="text-slate-500 text-lg font-normal">{appointment.patientId.substring(0, 8)}...</span></h3>
                            <p className="text-slate-500 font-medium text-lg">{appointment.reason}</p>

                            <div className="flex flex-wrap items-center gap-8 text-base text-slate-600 mt-4">
                              <span className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {formatDate(appointment.date)}
                              </span>
                              <span className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {appointment.time}
                              </span>
                              <span className={`px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wide border ${appointment.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border-amber-100'
                                : appointment.status === 'confirmed'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                  : 'bg-rose-50 text-rose-700 border-rose-100'
                                }`}>
                                {appointment.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {appointment.status === 'pending' && (
                        <div className="flex items-center gap-6">
                          <button
                            onClick={() => updateStatus(appointment._id, 'confirmed')}
                            disabled={processingId === appointment._id}
                            className="px-8 py-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-none font-bold hover:bg-emerald-100 transition-all flex items-center gap-3 disabled:opacity-50 uppercase tracking-wide text-sm"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            {processingId === appointment._id ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => updateStatus(appointment._id, 'rejected')}
                            disabled={processingId === appointment._id}
                            className="px-8 py-4 bg-rose-50 text-rose-700 border border-rose-100 rounded-none font-bold hover:bg-rose-100 transition-all flex items-center gap-3 disabled:opacity-50 uppercase tracking-wide text-sm"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            Reject
                          </button>
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
    </DashboardLayout>
  );
};

export default DoctorDashboard;
