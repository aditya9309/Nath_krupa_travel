import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { gsap } from 'gsap'
import { FiMail, FiClock, FiEye, FiEyeOff } from 'react-icons/fi'

export default function ForgotPassword() {
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otpTimer, setOtpTimer] = useState(0)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()
  const formRef = useRef(null)
  const timerInterval = useRef(null)
  const cooldownInterval = useRef(null)

  useEffect(() => {
    if (formRef.current) {
      formRef.current.style.opacity = '1'
      formRef.current.style.visibility = 'visible'
      if (typeof gsap !== 'undefined' && gsap) {
        gsap.fromTo(
          formRef.current,
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, ease: 'power1.out' }
        )
      }
    }
  }, [])

  // OTP Timer
  useEffect(() => {
    if (step === 2 && otpTimer === 0 && resendCooldown === 0) {
      setOtpTimer(300) // 5 minutes
    }
  }, [step])

  useEffect(() => {
    if (otpTimer > 0 && step === 2) {
      timerInterval.current = setInterval(() => {
        setOtpTimer(prev => prev - 1)
      }, 1000)
    } else if (otpTimer === 0 && step === 2) {
      clearInterval(timerInterval.current)
    }
    return () => clearInterval(timerInterval.current)
  }, [otpTimer, step])

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      cooldownInterval.current = setInterval(() => {
        setResendCooldown(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(cooldownInterval.current)
  }, [resendCooldown])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.post('/auth/request-password-change-otp', { email })
      if (response.data.success) {
        setStep(2)
        setOtpTimer(300)
        setResendCooldown(0)
        toast.success('OTP sent to your email')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    if (otpTimer === 0) {
      toast.error('OTP has expired')
      return
    }
    setLoading(true)
    try {
      const response = await api.post('/auth/verify-password-change-otp', { email, otp })
      if (response.data.success) {
        setStep(3)
        toast.success('OTP verified. Set your new password')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
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
      const response = await api.post('/auth/change-password', {
        email,
        newPassword
      })
      if (response.data.success) {
        toast.success('Password changed successfully!')
        navigate('/login')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0) {
      toast.error(`Please wait ${resendCooldown}s`)
      return
    }
    setLoading(true)
    try {
      const response = await api.post('/auth/request-password-change-otp', { email })
      if (response.data.success) {
        setOtpTimer(300)
        setResendCooldown(30)
        toast.success('OTP resent successfully')
      }
    } catch (error) {
      toast.error('Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-blue-600 to-indigo-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-black opacity-10 pointer-events-none"></div>
      <div ref={formRef} className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 relative z-20" style={{ opacity: 1, visibility: 'visible' }}>
        <h2 className="text-3xl font-bold text-center mb-2">Reset Password</h2>
        <p className="text-center text-gray-600 mb-8">Step {step} of 3</p>

        {/* STEP 1: EMAIL */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Enter the email address associated with your account
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* STEP 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                We've sent a verification code to <strong>{email}</strong>
              </p>
            </div>

            <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
              otpTimer < 60 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
            }`}>
              <FiClock className={`w-5 h-5 ${otpTimer < 60 ? 'text-red-600' : 'text-green-600'}`} />
              <span className={`font-bold ${otpTimer < 60 ? 'text-red-600' : 'text-green-600'}`}>
                {formatTime(otpTimer)}
              </span>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength="6"
                disabled={otpTimer === 0}
                placeholder="000000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent text-center text-2xl tracking-widest disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otpTimer === 0 || otp.length !== 6}
              className="w-full bg-gradient-to-r from-primary-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0}
              className="w-full text-primary-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed py-2"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
            </button>
          </form>
        )}

        {/* STEP 3: NEW PASSWORD */}
        {step === 3 && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                ✓ Email verified successfully. Now set your new password.
              </p>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength="6"
                  placeholder="••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                At least 6 characters
              </p>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength="6"
                  placeholder="••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Setting Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-gray-600">
          Remember your password?{' '}
          <Link to="/login" className="text-primary-600 hover:underline font-semibold">
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}
