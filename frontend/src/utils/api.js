import axios from 'axios'
import toast from 'react-hot-toast'

/* 🔥 GLOBAL FIX (CRITICAL FOR COOKIE AUTH) */
axios.defaults.withCredentials = true

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // e.g. https://nath-krupa1.onrender.com/api
  withCredentials: true
})

/* ================= REQUEST INTERCEPTOR ================= */
api.interceptors.request.use(
  (config) => {
    // ❌ Authorization header mat add karo (cookie-based auth hai)
    // console.log('[API]', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => Promise.reject(error)
)

/* ================= RESPONSE INTERCEPTOR ================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    /* 🔴 Network / CORS / Backend down */
    if (!error.response) {
      toast.error('Network error. Please try again.')
      return Promise.reject(error)
    }

    const { status, data } = error.response
    const message = data?.message || 'Something went wrong'

    /* 🔐 AUTH ERRORS */
    if (status === 401) {
      // ⚠️ IMPORTANT: sirf admin routes pe redirect
      if (window.location.pathname.startsWith('/admin')) {
        toast.error('Session expired. Please login again.')
        setTimeout(() => {
          window.location.href = '/login'
        }, 500)
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
