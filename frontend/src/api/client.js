import axios from 'axios';

/**
 * Determine the correct API base URL.
 * 
 * Rules:
 * 1. Running in a browser on a deployed host (e.g. *.vercel.app, bike-rental-system-platform.vercel.app):
 *    - If an external remote HTTPS API URL is provided via REACT_APP_API_BASE_URL (and NOT localhost/127.0.0.1), use it.
 *    - Otherwise, use same-domain '/api'. Vercel rewrites will route /api/(.*) to the backend service.
 *    - Localhost / 127.0.0.1 must NEVER be used on a deployed domain.
 * 2. Running locally (localhost / 127.0.0.1):
 *    - If REACT_APP_API_BASE_URL is provided, use it.
 *    - Otherwise, default to 'http://localhost:8000/api' so all requests consistently target /api.
 */
const resolveBaseUrl = () => {
  const isBrowser = typeof window !== 'undefined' && Boolean(window.location);
  const hostname = isBrowser ? window.location.hostname : '';
  const isLocalDev = Boolean(
    !hostname ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.local')
  );

  const envUrl = (process.env.REACT_APP_API_BASE_URL || '').trim();

  // Deployed production environment (e.g., Vercel)
  if (isBrowser && !isLocalDev) {
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1') && !envUrl.includes('0.0.0.0')) {
      const trimmed = envUrl.replace(/\/+$/, '');
      return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
    }
    // Same-origin relative API route proxied by Vercel rewrites to the FastAPI service
    return '/api';
  }

  // Local development environment
  if (envUrl) {
    const trimmed = envUrl.replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }

  return 'http://localhost:8000/api';
};

const API_BASE_URL = resolveBaseUrl();

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Helper for resolving image/media URLs without hardcoded hostnames or breaking on localhost paths.
 */
export const getMediaUrl = (photoPath) => {
  if (!photoPath || typeof photoPath !== 'string') return null;

  // If already an absolute external URL (e.g. Cloudinary, Unsplash)
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    // If it's a legacy hardcoded localhost/127.0.0.1 upload URL from local DB test records
    if (photoPath.includes('localhost:8000') || photoPath.includes('127.0.0.1:8000')) {
      const relative = photoPath.replace(/^https?:\/\/(?:localhost|127\.0\.0\.1):8000/, '');
      const base = API_BASE_URL.replace(/\/api$/, '');
      const cleanPath = relative.startsWith('/') ? relative : `/${relative}`;
      return `${base}${cleanPath}`;
    }
    return photoPath;
  }

  const base = API_BASE_URL.replace(/\/api$/, '');
  const cleanPath = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;
  return `${base}${cleanPath}`;
};

// Request interceptor to append JWT token and sanitize URL path against duplicate /api prefixes
client.interceptors.request.use(
  (config) => {
    // Normalize URL path to prevent duplicate /api prefixes if callers already prefix /api
    if (config.url && typeof config.url === 'string') {
      if (!config.url.startsWith('http://') && !config.url.startsWith('https://')) {
        let cleanPath = config.url.startsWith('/') ? config.url : `/${config.url}`;
        // Strip duplicate leading /api if present because baseURL already includes /api
        if (cleanPath.startsWith('/api')) {
          cleanPath = cleanPath.replace(/^(\/api)+/, '');
          if (!cleanPath.startsWith('/')) {
            cleanPath = `/${cleanPath}`;
          }
        }
        config.url = cleanPath;
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
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;
export { API_BASE_URL };
