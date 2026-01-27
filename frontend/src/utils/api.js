import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    // Handle specific error status codes
    const status = error.response?.status;
    const message = error.response?.data?.message || 'An error occurred';

    if (status === 401) {
      // Unauthorized - token might be expired
      // Don't show toast here as individual components handle it
    } else if (status === 403) {
      toast.error(message || 'Access denied');
    } else if (status === 404) {
      toast.error(message || 'Resource not found');
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (status >= 400) {
      // Show validation errors
      if (message) toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
