import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/dashboard.css';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const role = localStorage.getItem('userRole');
  const name = localStorage.getItem('userName') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    window.location.href = '/login';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation items based on role
  const getNavItems = () => {
    switch (role) {
      case 'patient':
        return [
          { path: '/patient-dashboard', label: 'Dashboard' },
          { path: '/patient-dashboard/book', label: 'Book Appointment' },
          { path: '/patient-dashboard/appointments', label: 'My Appointments' },
        ];
      case 'doctor':
        return [
          { path: '/doctor-dashboard', label: 'Dashboard' },
          { path: '/doctor-dashboard/appointments', label: 'My Appointments' },
        ];
      case 'admin':
        return [
          { path: '/admin-dashboard', label: 'Dashboard' },
          { path: '/admin-dashboard/users', label: 'All Users' },
          { path: '/admin-dashboard/appointments', label: 'All Appointments' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  const roleDisplay = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User';

  return (
    <div className="dashboard-layout">
      {/* Top Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-content">

          {/* Left: Brand */}
          <div className="nav-brand">
            <div className="nav-brand-logo">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span>MediLink</span>
          </div>

          {/* Center: Desktop Navigation Links */}
          <div className="nav-links">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== `/${role}-dashboard` && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side: User Profile Dropdown */}
          <div className="nav-profile" ref={dropdownRef}>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="user-menu-btn"
              >
                <div className="user-avatar">
                  {name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden-mobile text-left">
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{name}</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{roleDisplay}</p>
                </div>
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{
                    color: '#94a3b8',
                    transition: 'transform 0.2s',
                    transform: isProfileDropdownOpen ? 'rotate(180deg)' : 'none'
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="dropdown-menu">
                  <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9' }} className="hidden-desktop">
                    <p style={{ fontWeight: 700 }}>{name}</p>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{roleDisplay}</p>
                  </div>

                  <Link to={`/${role}-dashboard`} className="dropdown-item">Dashboard</Link>
                  {role === 'patient' && (
                    <Link to="/patient-dashboard/appointments" className="dropdown-item">My Appointments</Link>
                  )}

                  <div style={{ borderTop: '1px solid #f1f5f9', margin: '0.5rem 0' }}></div>

                  <button
                    onClick={handleLogout}
                    className="dropdown-item dropdown-btn logout"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button - simplified for this iteration to focus on desktop look */}
            <div className="hidden-desktop" style={{ marginLeft: '1rem' }}>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: '#64748b' }}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="mobile-menu-dropdown" style={{ background: 'white', position: 'absolute', width: '100%', top: '100%', left: 0, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 40 }}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="mobile-nav-link"
                style={{ display: 'block', padding: '1rem', borderBottom: '1px solid #f1f5f9', textDecoration: 'none', color: '#334155', fontWeight: 600 }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
