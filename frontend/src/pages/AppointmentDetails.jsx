import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAppointments } from '../context/AppointmentContext';

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading appointment details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/patient-dashboard/appointments')}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center">
            <p className="text-gray-600">Appointment not found</p>
            <button
              onClick={() => navigate('/patient-dashboard/appointments')}
              className="mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
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
      <div className="space-y-10 max-w-5xl mx-auto pb-20 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/patient-dashboard/appointments')}
              className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-4 transition-colors font-bold uppercase tracking-wide text-xs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to My Appointments</span>
            </button>
            <h1 className="text-4xl font-heading font-bold text-slate-900">Appointment Details</h1>
          </div>
          <span className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wide border ${getStatusColor(appointment.status)}`}>
            {appointment.status}
          </span>
        </div>

        {/* Main Details Card */}
        <div className="bg-white rounded-none shadow-2xl border border-slate-100 overflow-hidden">
          <div className="bg-slate-50/50 px-10 py-8 border-b border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-none flex items-center justify-center text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Appointment Information</h2>
              <p className="text-slate-500 font-medium">View full details of your visit</p>
            </div>
          </div>

          <div className="p-10 md:p-14 space-y-10">
            {/* Doctor Information */}
            <div className="pb-10 border-b border-slate-100">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-none flex items-center justify-center flex-shrink-0 border border-blue-100">
                  <span className="text-3xl font-bold text-blue-600">{appointment.doctorName.split(' ')[1][0]}</span>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-3xl font-bold text-slate-900 mb-2">{appointment.doctorName}</h3>
                  {appointment.specialization && (
                    <p className="text-lg text-blue-600 font-medium uppercase tracking-wide">{appointment.specialization}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-50 rounded-none p-8 border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Appointment Date</p>
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="text-xl font-bold text-slate-900">{formatDate(appointment.date)}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-none p-8 border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Appointment Time</p>
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-xl font-bold text-slate-900">{formatTime(appointment.time)}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-none p-8 border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Current Status</p>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${appointment.status === 'confirmed' ? 'bg-emerald-500' : appointment.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                  <p className="text-xl font-bold text-slate-900 capitalize">{appointment.status}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-none p-8 border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Created At</p>
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-xl font-bold text-slate-900">{formatDate(appointment.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Reason for Visit */}
            <div className="bg-slate-50 rounded-none p-10 border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Reason for Visit</p>
              <p className="text-slate-700 text-lg leading-relaxed font-medium">{appointment.reason}</p>
            </div>

            {/* Appointment ID */}
            <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Appointment ID</p>
              <span className="font-mono text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-none">{appointment._id || appointment.id}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/patient-dashboard/appointments')}
            className="px-8 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-none hover:bg-slate-50 hover:text-slate-900 transition-all uppercase tracking-wide text-sm"
          >
            Back to My Appointments
          </button>
          {appointment.status === 'pending' && (
            <button
              className="px-8 py-4 bg-rose-50 text-rose-600 border border-rose-100 font-bold rounded-none hover:bg-rose-100 transition-all uppercase tracking-wide text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              Cancel Appointment
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AppointmentDetails;
