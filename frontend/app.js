const API_BASE = window.API_BASE_URL || 'http://localhost:4000';
const apiUrl = (path) => `${API_BASE}${path}`;
const tokenKey = 'authToken';
const roleKey = 'userRole';
const loginSection = document.getElementById('loginSection');
const signupSection = document.getElementById('signupSection');
const successSection = document.getElementById('successSection');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginMessage = document.querySelector('[data-login-message]');
const signupMessage = document.querySelector('[data-signup-message]');
const profileDetails = document.getElementById('profileDetails');
const logoutBtn = document.getElementById('logoutBtn');
const toSignupBtn = document.getElementById('toSignup');
const toLoginBtn = document.getElementById('toLogin');

const setMessage = (element, text, type = 'error') => {
  element.textContent = text;
  element.className = `form-message ${text ? type : ''}`;
};

const toggleView = (view) => {
  const sections = [loginSection, signupSection, successSection];
  sections.forEach((section) => {
    section.classList.toggle('hidden', section.id !== view);
  });
};

const setLoading = (form, state) => {
  const button = form.querySelector('button[type="submit"]');
  if (!button.dataset.defaultLabel) {
    button.dataset.defaultLabel = button.textContent;
  }
  button.disabled = state;
  button.textContent = state ? 'Please wait…' : button.dataset.defaultLabel;
};

const updateProfileDetails = (user) => {
  if (!user) {
    profileDetails.textContent = '';
    return;
  }
  const roleDisplay = user.role ? `<br /><strong>Role:</strong> ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}` : '';
  profileDetails.innerHTML = `<strong>Name:</strong> ${user.name}<br /><strong>Email:</strong> ${user.email}${roleDisplay}`;
};

const redirectToDashboard = (role) => {
  const dashboards = {
    patient: '/patient-dashboard.html',
    doctor: '/doctor-dashboard.html',
    admin: '/admin-dashboard.html'
  };
  
  const dashboardPath = dashboards[role] || '/patient-dashboard.html';
  
  // For now, we'll show a message. In a real app, you'd navigate to the dashboard
  // window.location.href = dashboardPath;
  console.log(`Would redirect to: ${dashboardPath} for role: ${role}`);
};

const request = async (endpoint, payload, token) => {
  const response = await fetch(apiUrl(endpoint), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

const fetchProfile = async () => {
  const token = localStorage.getItem(tokenKey);
  if (!token) return null;
  const response = await fetch(apiUrl('/api/auth/me'), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Session expired');
  }
  return data.user;
};

const handleLoginSubmit = async (event) => {
  event.preventDefault();
  setMessage(loginMessage, '');

  const existingToken = localStorage.getItem(tokenKey);
  if (existingToken) {
    alert('You are already signed in.');
    try {
      const user = await fetchProfile();
      updateProfileDetails(user);
    } catch (error) {
      console.warn(error.message);
    }
    toggleView('successSection');
    return;
  }

  const formData = Object.fromEntries(new FormData(loginForm));
  try {
    setLoading(loginForm, true);
    const data = await request('/api/auth/login', formData);
    localStorage.setItem(tokenKey, data.token);
    localStorage.setItem(roleKey, data.user.role);
    updateProfileDetails(data.user);
    
    // Redirect based on role
    redirectToDashboard(data.user.role);
    
    toggleView('successSection');
  } catch (error) {
    setMessage(loginMessage, error.message);
  } finally {
    setLoading(loginForm, false);
  }
};

const handleSignupSubmit = async (event) => {
  event.preventDefault();
  setMessage(signupMessage, '');
  const formData = Object.fromEntries(new FormData(signupForm));

  if (formData.password !== formData.confirmPassword) {
    setMessage(signupMessage, 'Passwords do not match. Please try again.');
    return;
  }

  delete formData.confirmPassword;
  
  // Role defaults to patient if not provided
  if (!formData.role) {
    formData.role = 'patient';
  }
  
  try {
    setLoading(signupForm, true);
    const data = await request('/api/auth/signup', formData);
    localStorage.setItem(tokenKey, data.token);
    localStorage.setItem(roleKey, data.user.role);
    updateProfileDetails(data.user);
    
    // Redirect based on role
    redirectToDashboard(data.user.role);
    
    setMessage(signupMessage, 'Account created successfully!', 'success');
    toggleView('successSection');
  } catch (error) {
    setMessage(signupMessage, error.message);
  } finally {
    setLoading(signupForm, false);
  }
};

const handleLogout = async () => {
  const token = localStorage.getItem(tokenKey);
  if (token) {
    try {
      await request('/api/auth/logout', {}, token);
    } catch (error) {
      console.warn(error.message);
    }
  }
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(roleKey);
  updateProfileDetails(null);
  toggleView('loginSection');
};

const hydrateSession = async () => {
  try {
    const user = await fetchProfile();
    if (user) {
      // Store role if not already stored
      if (user.role) {
        localStorage.setItem(roleKey, user.role);
      }
      updateProfileDetails(user);
      toggleView('successSection');
      return;
    }
  } catch (error) {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(roleKey);
  }
  toggleView('loginSection');
};

loginForm.addEventListener('submit', handleLoginSubmit);
signupForm.addEventListener('submit', handleSignupSubmit);
logoutBtn.addEventListener('click', handleLogout);
toSignupBtn.addEventListener('click', () => {
  toggleView('signupSection');
});
toLoginBtn.addEventListener('click', () => {
  toggleView('loginSection');
});

hydrateSession();
