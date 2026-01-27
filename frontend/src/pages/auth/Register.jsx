import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { gsap } from 'gsap'
import toast from 'react-hot-toast'
import { FiClock, FiEye, FiEyeOff } from 'react-icons/fi'

const OTP_DURATION = 300 // 5 minutes

const Register = () => {
  const navigate = useNavigate()
  const { register, verifyOTP, resendOTP } = useAuth()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

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

  const formRef = useRef(null)
  const timerRef = useRef(null)
  const resendRef = useRef(null)

  /* ------------------ Animation ------------------ */
  useEffect(() => {
    if (!formRef.current) return
    gsap.fromTo(
      formRef.current,
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.3, ease: 'power1.out' }
    )
  }, [])

  /* ------------------ OTP Countdown ------------------ */
  useEffect(() => {
    if (step !== 2 || otpTimer <= 0) return

    timerRef.current = setInterval(() => {
      setOtpTimer(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [step, otpTimer])

  /* ------------------ OTP Expired Toast (ONCE) ------------------ */
  useEffect(() => {
    if (step === 2 && otpTimer === 0) {
      toast.error('OTP expired. Please resend OTP.')
    }
  }, [otpTimer, step])

  /* ------------------ Resend Cooldown ------------------ */
  useEffect(() => {
    if (resendCooldown <= 0) return

    resendRef.current = setInterval(() => {
      setResendCooldown(prev => prev - 1)
    }, 1000)

    return () => clearInterval(resendRef.current)
  }, [resendCooldown])

  /* ------------------ Handlers ------------------ */
  const handleRegister = async (e) => {
    e.preventDefault()
    if (loading) return

    setLoading(true)
    const result = await register(formData)
    setLoading(false)

    if (result?.success) {
      setStep(2)
      setOtp('')
      setOtpTimer(OTP_DURATION)
      setResendCooldown(0)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    if (otpTimer === 0 || otp.length !== 6) return

    setLoading(true)
    const result = await verifyOTP(formData.email, otp)
    setLoading(false)

    if (result?.success) {
      toast.success('Registration completed. Please login.')
      navigate('/login')
    }
  }

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return

    const result = await resendOTP(formData.email)
    if (result?.success) {
      setOtp('')
      setOtpTimer(OTP_DURATION)
      setResendCooldown(30)
      toast.success('OTP resent successfully')
    }
  }

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  /* ------------------ UI ------------------ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-blue-600 to-indigo-700 flex items-center justify-center px-4">
      <div
        ref={formRef}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
      >
        <h2 className="text-3xl font-bold text-center mb-8">Register</h2>

        {step === 1 ? (
          <form onSubmit={handleRegister} className="space-y-5">
            <input
              placeholder="Full Name"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="input"
            />

            <input
              type="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="input"
            />

            <input
              type="tel"
              placeholder="Phone"
              pattern="[0-9]{10}"
              maxLength="10"
              required
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="input"
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                minLength={6}
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <button disabled={loading} className="btn-primary">
              {loading ? 'Please wait...' : 'Register'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <p className="text-center text-sm text-gray-600">
              OTP sent to <b>{formData.email}</b>
            </p>

            <div className="flex justify-center items-center gap-2 bg-gray-100 p-2 rounded">
              <FiClock />
              <span className="font-bold">{formatTime(otpTimer)}</span>
            </div>

            <input
              type="text"
              placeholder="000000"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              className="input text-center tracking-widest text-xl"
            />

            <button disabled={loading || otp.length !== 6} className="btn-primary">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              disabled={resendCooldown > 0}
              onClick={handleResendOTP}
              className="text-primary-600 text-sm"
            >
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : 'Resend OTP'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
