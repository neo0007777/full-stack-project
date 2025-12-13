import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/dashboard.css';

const API_BASE = window.API_BASE_URL || 'http://localhost:4000';
const apiUrl = (path) => `${API_BASE}${path}`;

const AdminDashboard = () => {
  const name = localStorage.getItem('userName') || 'Administrator';
  const token = localStorage.getItem('authToken');

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [promoting, setPromoting] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

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

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <DashboardLayout>
      <div className="dashboard-wrapper">

        {/* Welcome Section */}
        <div className="welcome-section animate-fade-in">
          <div className="welcome-bg-decoration">
            <div className="deco-circle deco-1"></div>
            <div className="deco-circle deco-2"></div>
          </div>
          <div className="welcome-content-wrapper">
            <div className="welcome-badge">Admin Portal</div>
            <h1 className="welcome-heading">
              Welcome, <br />
              <span style={{ color: '#bae6fd' }}>{name}</span>
            </h1>
            <p className="welcome-subtext">
              Manage system users, appointments, and platform settings.
            </p>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="stats-container animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: '#2563eb', bg: '#eff6ff' },
            { label: 'Total Doctors', value: stats.totalDoctors, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: '#059669', bg: '#ecfdf5' },
            { label: 'Total Patients', value: stats.totalPatients, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: '#9333ea', bg: '#faf5ff' }
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

        {/* Users Table */}
        <div className="animate-slide-up" style={{ marginTop: '2rem' }}>
          <div className="section-header-modern" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 className="section-title-modern">User Management</h2>
              <p style={{ color: '#64748b' }}>View and manage all registered users</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Search Input */}
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '0.6rem 1rem 0.6rem 2.5rem',
                    borderRadius: '0.75rem',
                    border: '1px solid #e2e8f0',
                    outline: 'none',
                    fontSize: '0.875rem',
                    width: '200px'
                  }}
                />
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0',
                  outline: 'none',
                  fontSize: '0.875rem',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Roles</option>
                <option value="patient">Patients</option>
                <option value="doctor">Doctors</option>
                <option value="admin">Admins</option>
              </select>

              <button
                onClick={fetchUsers}
                className="btn-modern btn-modern-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', borderBottom: '2px solid #2563eb', margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }}></div>
              <p style={{ color: '#64748b', fontWeight: 500 }}>Loading users...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <p style={{ color: '#e11d48', fontWeight: 500, marginBottom: '1rem' }}>{error}</p>
              <button
                onClick={fetchUsers}
                className="btn-modern-primary"
                style={{ padding: '0.5rem 1.5rem' }}
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="list-container">
              <table className="glass-panel" style={{ width: '100%', borderCollapse: 'collapse', overflow: 'hidden', borderRadius: '1rem' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase' }}>Name</th>
                    <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase' }}>Email</th>
                    <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase' }}>Role</th>
                    <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id || user._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem', color: '#2563eb', fontWeight: 700, border: '1px solid #dbeafe' }}>
                              {user.name?.charAt(0) || 'U'}
                            </div>
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>{user.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', color: '#475569' }}>{user.email}</td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <span className={`status-badge ${user.role === 'doctor' ? 'status-confirmed' :
                            user.role === 'admin' ? 'status-info' : 'status-pending'
                            }`}>
                            {user.role}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          {user.role === 'patient' ? (
                            <button
                              onClick={() => handlePromoteToDoctor(user.id || user._id)}
                              disabled={promoting === (user.id || user._id)}
                              className="btn-modern-primary"
                              style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                            >
                              {promoting === (user.id || user._id) ? 'Promoting...' : 'Make Doctor'}
                            </button>
                          ) : (
                            <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.75rem', fontWeight: 500 }}>
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
