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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (formRef.current && gsap) {
      gsap.fromTo(
        formRef.current,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: 'power1.out' }
      )
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(formData.email, formData.password)

    setLoading(false)

    if (!result?.success) {
      toast.error(result?.message || 'Login failed')
      return
    }

    toast.success('Login successful')

    if (result.user?.role === 'admin') {
      navigate('/admin', { replace: true })
    } else {
      navigate('/dashboard', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-blue-600 to-indigo-700 flex items-center justify-center px-4">
      <div ref={formRef} className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-center mb-8">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* EMAIL */}
          <div>
            <label className="block font-semibold mb-2">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="input"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block font-semibold mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* FORGOT */}
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-primary-600 hover:underline inline-flex items-center gap-1 font-semibold"
            >
              <FiKey />
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-primary-600 font-semibold">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
