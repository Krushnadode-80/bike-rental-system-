import axios from 'axios';

// Resolve API base URL dynamically based on environment, Vercel services binding, or local dev
const resolveBaseUrl = () => {
  // 1. Bound internal service URL (injected by Vercel Services if running in server context)
  if (typeof process !== 'undefined' && process.env?.BACKEND_URL) {
    return process.env.BACKEND_URL;
  }
  // 2. Explicit REACT_APP_API_BASE_URL environment variable
  if (process.env.REACT_APP_API_BASE_URL !== undefined) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  // 3. In browser production (Vercel deployment on same domain)
  if (typeof window !== 'undefined' && window.location && window.location.hostname !== 'localhost') {
    return ''; // Same-origin relative calls routed via Vercel /api rewrite
  }
  // 4. Default local development server
  return 'http://localhost:8000';
};

const API_BASE_URL = resolveBaseUrl();

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper for resolving image/media URLs without hardcoded hostnames
export const getMediaUrl = (photoPath) => {
  if (!photoPath) return null;
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }
  const base = API_BASE_URL ? API_BASE_URL.replace(/\/api$/, '') : '';
  const cleanPath = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;
  return `${base}${cleanPath}`;
};

// Request interceptor to append JWT token and ensure /api routing prefix when calling same-origin
client.interceptors.request.use(
  (config) => {
    // When using same-origin base URL on Vercel, ensure the request has the /api prefix
    if (!config.baseURL || config.baseURL === '' || config.baseURL === '/api' || config.baseURL.startsWith('/')) {
      if (config.url && !config.url.startsWith('/api') && !config.url.startsWith('http')) {
        config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
      }
      if (config.url) {
        config.url = config.url.replace(/^\/api\/api(\/|$)/, '/api$1');
      }
    }
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry / unauthorized requests
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear auth local state and reload to force redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;
export { API_BASE_URL };
