import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';

const API_BASE = window.API_BASE_URL || 'http://localhost:4000';
const apiUrl = (path) => `${API_BASE}${path}`;

const AdminDashboard = () => {
  const name = localStorage.getItem('userName') || 'Administrator';
  const token = localStorage.getItem('authToken');

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [promoting, setPromoting] = useState(null);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiUrl('/api/admin/users'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
      setError('');
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Promote user to doctor
  const handlePromoteToDoctor = async (userId) => {
    try {
      setPromoting(userId);
      const response = await fetch(apiUrl(`/api/admin/make-doctor/${userId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to promote user');
      }

      // Refresh user list
      await fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to promote user');
      console.error('Error promoting user:', err);
    } finally {
      setPromoting(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Calculate stats from real data
  const stats = {
    totalUsers: users.length,
    totalDoctors: users.filter(u => u.role === 'doctor').length,
    totalPatients: users.filter(u => u.role === 'patient').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-10 animate-fade-in pb-10">
        {/* Welcome Card */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-3xl shadow-xl p-8 md:p-12 text-white mb-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/20 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4 opacity-80">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider border border-white/10">Admin Portal</span>
              <span className="text-sm font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 leading-tight">
              Welcome, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">{name}</span>
            </h1>
            <p className="text-blue-100 text-lg md:text-xl max-w-2xl leading-relaxed">
              Manage system users, appointments, and platform settings.
            </p>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', bg: 'bg-white border border-slate-100', text: 'text-slate-900', iconColor: 'text-blue-600', iconBg: 'bg-blue-50' },
            { label: 'Total Doctors', value: stats.totalDoctors, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', bg: 'bg-white border border-slate-100', text: 'text-slate-900', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50' },
            { label: 'Total Patients', value: stats.totalPatients, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', bg: 'bg-white border border-slate-100', text: 'text-slate-900', iconColor: 'text-purple-600', iconBg: 'bg-purple-50' }
          ].map((stat, idx) => (
            <div key={idx} className={`${stat.bg} p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all group`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 ${stat.iconBg} rounded-2xl flex items-center justify-center`}>
                  <svg className={`w-7 h-7 ${stat.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
                </div>
                <span className={`text-4xl font-bold ${stat.text}`}>{stat.value}</span>
              </div>
              <p className="text-slate-500 font-bold text-lg">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
            <div>
              <h2 className="text-2xl font-heading font-bold text-slate-900 mb-1">User Management</h2>
              <p className="text-slate-500 font-medium">View and manage all registered users</p>
            </div>
            <button
              onClick={fetchUsers}
              className="px-5 py-2.5 text-sm font-bold text-blue-600 bg-white border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-100 transition-all shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh List
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-500 font-medium">Loading users...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-rose-600 font-medium mb-4">{error}</p>
              <button
                onClick={fetchUsers}
                className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-8 py-12 text-center text-slate-500 font-medium">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id || user._id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mr-4 text-blue-600 font-bold shadow-sm border border-blue-100 group-hover:scale-110 transition-transform">
                              {user.name?.charAt(0) || 'U'}
                            </div>
                            <div className="text-sm font-bold text-slate-900">{user.name}</div>
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="text-sm text-slate-600 font-medium">{user.email}</div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold uppercase tracking-wide rounded-full ${user.role === 'doctor'
                            ? 'bg-emerald-100 text-emerald-700'
                            : user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                            }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-sm font-medium">
                          {user.role === 'patient' ? (
                            <button
                              onClick={() => handlePromoteToDoctor(user.id || user._id)}
                              disabled={promoting === (user.id || user._id)}
                              className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all duration-200 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-xs"
                            >
                              {promoting === (user.id || user._id) ? 'Promoting...' : 'Promote to Doctor'}
                            </button>
                          ) : (
                            <span className="text-slate-400 italic text-xs font-medium">
                              {user.role === 'doctor' ? 'Doctor Account' : 'Admin Account'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
