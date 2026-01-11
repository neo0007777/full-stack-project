// Check if hostname is an IP address (for local network testing) or localhost
const isLocalNetwork = window.location.hostname === 'localhost' || window.location.hostname.match(/^(\d{1,3}\.){3}\d{1,3}$/);

const API_URL = import.meta.env.VITE_API_URL ||
    (isLocalNetwork
        ? `http://${window.location.hostname}:4000`
        : import.meta.env.VITE_API_URL || "https://full-stack-project-7-tcxq.onrender.com");

if (!isLocalNetwork && API_URL.includes("replace-me")) {
    console.error("CRITICAL ERROR: You are on production (Netlify) but have not set VITE_API_URL. The app cannot connect to your local backend. See the 'How to fix' notification.");
}


export default API_URL;
