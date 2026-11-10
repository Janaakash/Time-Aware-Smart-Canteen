export const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL !== undefined 
    ? import.meta.env.VITE_API_BASE_URL 
    : (window.location.port === '5173' || window.location.port === '3000')
      ? `http://${window.location.hostname}:5000`
      : '';

