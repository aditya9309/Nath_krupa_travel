import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { gsap } from 'gsap'
import toast from 'react-hot-toast'
import { FiClock, FiEye, FiEyeOff } from 'react-icons/fi'

const Register = () => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpTimer, setOtpTimer] = useState(0)
  const [resendCooldown, setResendCooldown] = useState(0)
  const { register, verifyOTP, resendOTP } = useAuth()
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

  // OTP Timer - starts at 5 minutes
  useEffect(() => {
    if (step === 2 && otpTimer === 0) {
      setOtpTimer(300) // 5 minutes
    }
  }, [step])

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (otpTimer > 0 && step === 2) {
      timerInterval.current = setInterval(() => {
        setOtpTimer(prev => prev - 1)
      }, 1000)
    } else if (otpTimer === 0 && step === 2) {
      clearInterval(timerInterval.current)
      if (timerInterval.current) {
        toast.error('OTP expired. Please request a new one.')
      }
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

  const handleRegister = async (e) => {
    e.preventDefault()
    const result = await register(formData)
    if (result.success) {
      setStep(2)
      setOtpTimer(300)
      setResendCooldown(0)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    if (otpTimer === 0) {
      toast.error('OTP has expired. Please request a new one.')
      return
    }
    const result = await verifyOTP(formData.email, otp)
    if (result.success) {
      navigate('/login')
    }
  }

  const handleResendOTP = async () => {
    if (resendCooldown > 0) {
      toast.error(`Please wait ${resendCooldown}s before resending`)
      return
    }
    const result = await resendOTP(formData.email)
    if (result.success) {
      setOtpTimer(300)
      setResendCooldown(30)
      toast.success('OTP sent successfully')
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-blue-600 to-indigo-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-black opacity-10 pointer-events-none"></div>
      <div ref={formRef} className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 relative z-20" style={{ opacity: 1, visibility: 'visible' }}>
        <h2 className="text-3xl font-bold text-center mb-8">Register</h2>

        {step === 1 ? (
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                pattern="[0-9]{10}"
                maxLength="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              Register
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 text-sm">
                We've sent a verification code to <strong>{formData.email}</strong>
              </p>
            </div>

            {/* OTP TIMER */}
            <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
              otpTimer < 60 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
            }`}>
              <FiClock className={`w-5 h-5 ${otpTimer < 60 ? 'text-red-600' : 'text-green-600'}`} />
              <span className={`font-bold ${otpTimer < 60 ? 'text-red-600' : 'text-green-600'}`}>
                {formatTime(otpTimer)}
              </span>
              <span className={`text-xs ${otpTimer < 60 ? 'text-red-600' : 'text-green-600'}`}>
                {otpTimer < 60 ? 'Expiring soon' : 'Valid for'}
              </span>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Enter Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength="6"
                pattern="[0-9]{6}"
                disabled={otpTimer === 0}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent text-center text-2xl tracking-widest disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="000000"
              />
            </div>

            <button
              type="submit"
              disabled={otpTimer === 0 || otp.length !== 6}
              className="w-full bg-gradient-to-r from-primary-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify Code
            </button>

            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendCooldown > 0}
              className="w-full text-primary-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed py-2"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:underline font-semibold">
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
