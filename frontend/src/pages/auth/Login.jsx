import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { gsap } from 'gsap'
import toast from 'react-hot-toast'
import { FiKey, FiEye, FiEyeOff } from 'react-icons/fi'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const formRef = useRef(null)

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(formData.email, formData.password)
    if (result.success) {
      if (result.user?.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-blue-600 to-indigo-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-black opacity-10 pointer-events-none"></div>
      <div ref={formRef} className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 relative z-20" style={{ opacity: 1, visibility: 'visible' }}>
        <h2 className="text-3xl font-bold text-center mb-8">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
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

          {/* FORGOT PASSWORD LINK */}
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-primary-600 hover:underline inline-flex items-center gap-1 font-semibold"
            >
              <FiKey className="w-4 h-4" />
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
          >
            Login
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:underline font-semibold">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
