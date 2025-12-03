import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

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
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Navigation Bar - Fixed, Centered, Sharp */}
      <nav className="bg-white border-b border-slate-200 fixed top-0 left-0 right-0 z-50 h-20 flex justify-center">
        <div className="w-full max-w-[1200px] mx-auto px-8 h-full">
          <div className="flex justify-between items-center h-full">

            {/* Left: Logo (Fixed Width for centering balance) */}
            <div className="flex-shrink-0 flex items-center gap-3 w-48">
              <div className="w-9 h-9 bg-blue-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">MediLink</span>
            </div>

            {/* Center: Desktop Navigation Links */}
            <div className="hidden md:flex items-center justify-center flex-1 gap-8">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== `/${role}-dashboard` && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`text-sm font-bold transition-colors duration-200 uppercase tracking-wide ${isActive
                      ? 'text-blue-600'
                      : 'text-slate-500 hover:text-blue-600'
                      }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Right Side: User Profile Dropdown (Fixed Width for centering balance) */}
            <div className="flex items-center justify-end w-64" ref={dropdownRef}>
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-3 focus:outline-none group"
                >
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{name}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">{roleDisplay}</p>
                  </div>
                  <div className="w-10 h-10 bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold overflow-hidden hover:border-blue-300 transition-colors">
                    {/* Avatar Image Placeholder or Initials */}
                    <span className="text-sm">{name.charAt(0).toUpperCase()}</span>
                  </div>
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 shadow-xl py-1 z-50 animate-fade-in-down origin-top-right">
                    <div className="px-4 py-3 border-b border-slate-100 lg:hidden">
                      <p className="text-sm font-bold text-slate-900">{name}</p>
                      <p className="text-xs text-slate-500">{roleDisplay}</p>
                    </div>

                    <Link to={`/${role}-dashboard/profile`} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 font-medium">
                      My Profile
                    </Link>
                    <Link to={`/${role}-dashboard`} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 font-medium">
                      Dashboard
                    </Link>
                    {role === 'patient' && (
                      <Link to="/patient-dashboard/appointments" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 font-medium">
                        My Appointments
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="flex items-center md:hidden ml-4">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 shadow-lg absolute w-full left-0 z-40">
            <div className="py-2 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== `/${role}-dashboard` && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-6 py-3 text-base font-bold transition-colors ${isActive
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'
                      }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content - Aligned with Navbar */}
      <main className="w-full flex justify-center" style={{ marginTop: '110px' }}>
        <div className="w-full max-w-[1200px] mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
