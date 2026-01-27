import axios from 'axios'
import toast from 'react-hot-toast'

/* 🔥 GLOBAL FIX (VERY IMPORTANT) */
axios.defaults.withCredentials = true

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // MUST be .../api
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

/* ================= REQUEST INTERCEPTOR ================= */
api.interceptors.request.use(
  (config) => {
    // 🔍 DEBUG (optional)
    // console.log('API Request:', config.method, config.url)
    return config
  },
  (error) => Promise.reject(error)
)

/* ================= RESPONSE INTERCEPTOR ================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error('Network error. Please check your connection.')
      return Promise.reject(error)
    }

    const { status, data } = error.response
    const message = data?.message || 'Something went wrong'

    /* 🔥 AUTH HANDLING */
    if (status === 401) {
      // cookie missing / expired
      // ⚠️ admin pages ko protect karne ke liye
      toast.error('Session expired. Please login again.')

      // OPTIONAL but RECOMMENDED
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/login'
      }
    }
    else if (status === 403) {
      toast.error(message || 'Access denied')
    }
    else if (status === 404) {
      toast.error('Resource not found')
    }
    else if (status >= 500) {
      toast.error('Server error. Please try again later.')
    }
    else {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

export default api
