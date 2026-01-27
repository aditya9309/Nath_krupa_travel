import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../utils/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me')
      if (response.data.success) {
        setUser(response.data.user)
      }
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post(
        '/auth/login',
        { email, password }
      )
      if (response.data.success) {
        setUser(response.data.user)
        toast.success('Login successful!')
        return { success: true, user: response.data.user }
      }
      return { success: false, message: 'Login failed' }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      if (response.data.success) {
        toast.success('OTP sent to your email!')
        return { success: true, email: response.data.email }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  const verifyOTP = async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp })
      if (response.data.success) {
        toast.success('OTP verified! Account pending admin approval.')
        return { success: true }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'OTP verification failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  const resendOTP = async (email) => {
    try {
      const response = await api.post('/auth/resend-otp', { email })
      if (response.data.success) {
        toast.success('OTP resent to your email!')
        return { success: true }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend OTP'
      toast.error(message)
      return { success: false, message }
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout', {})
      setUser(null)
      toast.success('Logged out successfully!')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const updateUser = (userData) => {
    setUser(userData)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        verifyOTP,
        resendOTP,
        logout,
        updateUser,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
