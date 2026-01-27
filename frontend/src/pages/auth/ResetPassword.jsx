import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('form') // form, success, error

  useEffect(() => {
    const resetToken = searchParams.get('token')
    if (!resetToken) {
      setStatus('error')
      toast.error('Invalid reset link')
      return
    }
    setToken(resetToken)
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword
      })

      if (response.data.success) {
        setStatus('success')
        toast.success('Password reset successfully!')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } catch (error) {
      setStatus('error')
      toast.error(error.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-blue-600 to-indigo-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-black opacity-10 pointer-events-none"></div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 relative z-20">
        <h2 className="text-3xl font-bold text-center mb-8">Reset Password</h2>

        {status === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                Enter your new password below. Make sure it's at least 6 characters long.
              </p>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength="6"
                placeholder="••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength="6"
                placeholder="••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full bg-gradient-to-r from-primary-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {status === 'success' && (
          <div className="text-center space-y-4">
            <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h3 className="text-2xl font-bold text-green-600">Success!</h3>
            <p className="text-gray-600">
              Your password has been reset successfully. You'll be redirected to login shortly.
            </p>
            <Link
              to="/login"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center space-y-4">
            <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h3 className="text-2xl font-bold text-red-600">Invalid Link</h3>
            <p className="text-gray-600">
              The password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
            >
              Request New Link
            </Link>
          </div>
        )}

        {status === 'form' && (
          <p className="mt-6 text-center text-gray-600">
            Remember your password?{' '}
            <Link to="/login" className="text-primary-600 hover:underline font-semibold">
              Login here
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
