const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:4000' : `http://${window.location.hostname}:4000`);

export default API_URL;
