import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { FiLock, FiCheckCircle } from 'react-icons/fi'

export default function ResetPassword() {
  const navigate = useNavigate()

  const [step, setStep] = useState(1) // 1=email, 2=otp, 3=new password
  const [loading, setLoading] = useState(false)

  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetToken, setResetToken] = useState('')

  /* ---------------- STEP 1: REQUEST OTP ---------------- */
  const requestOTP = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await api.post('/auth/request-password-change-otp', { email })
      if (res.data.success) {
        toast.success('OTP sent to email')
        setStep(2)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- STEP 2: VERIFY OTP ---------------- */
  const verifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await api.post('/auth/verify-password-change-otp', { email, otp })
      if (res.data.success) {
        setResetToken(res.data.token) // temporary JWT
        toast.success('OTP verified')
        setStep(3)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- STEP 3: CHANGE PASSWORD ---------------- */
  const changePassword = async (e) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const res = await api.post(
        '/auth/change-password',
        { email, newPassword },
        { headers: { Authorization: `Bearer ${resetToken}` } }
      )

      if (res.data.success) {
        toast.success('Password changed successfully')
        navigate('/login')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-indigo-700 px-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={requestOTP} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
            />
            <button disabled={loading} className="btn-primary">
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={verifyOTP} className="space-y-4">
            <input
              type="text"
              placeholder="Enter OTP"
              maxLength={6}
              required
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              className="input text-center tracking-widest"
            />
            <button disabled={loading} className="btn-primary">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <form onSubmit={changePassword} className="space-y-4">
            <input
              type="password"
              placeholder="New password"
              minLength={6}
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="input"
            />
            <input
              type="password"
              placeholder="Confirm password"
              minLength={6}
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="input"
            />
            <button disabled={loading} className="btn-primary">
              {loading ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          Back to <Link to="/login" className="text-primary-600 font-semibold">Login</Link>
        </p>
      </div>
    </div>
  )
}
