import axios from 'axios'
import toast from 'react-hot-toast'

// ✅ BASE URL FROM ENV (PRODUCTION SAFE)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // MUST include /api
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🔴 Network / CORS / backend unreachable
    if (!error.response) {
      toast.error('Network error. Please check your connection.')
      return Promise.reject(error)
    }

    const status = error.response.status
    const message = error.response.data?.message || 'An error occurred'

    if (status === 401) {
      // token expired / not logged in
    } else if (status === 403) {
      toast.error(message || 'Access denied')
    } else if (status === 404) {
      toast.error(message || 'Resource not found')
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (status >= 400) {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

export default api
