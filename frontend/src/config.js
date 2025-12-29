// Check if hostname is an IP address (for local network testing) or localhost
const isLocalNetwork = window.location.hostname === 'localhost' || window.location.hostname.match(/^(\d{1,3}\.){3}\d{1,3}$/);

const API_URL = import.meta.env.VITE_API_URL ||
    (isLocalNetwork
        ? `http://${window.location.hostname}:4000`
        : "https://your-backend-url-here.com"); // Needs HTTPS backend for Netlify


export default API_URL;
