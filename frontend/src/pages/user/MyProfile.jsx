import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { FiEye, FiEyeOff, FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiClock, FiUpload } from 'react-icons/fi'
import { gsap } from 'gsap'

const MyProfile = () => {
  const { user, logout } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })
  const [profileImage, setProfileImage] = useState(user?.profilePhoto || null)
  const [profileImagePreview, setProfileImagePreview] = useState(user?.profilePhoto || null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef(null)
  const [passwordChangeStep, setPasswordChangeStep] = useState(1) // 1: Request OTP, 2: Enter OTP, 3: Set New Password
  const [passwordData, setPasswordData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [otpTimer, setOtpTimer] = useState(0)
  const [resendCooldown, setResendCooldown] = useState(0)
  const formRef = useRef(null)
  const timerInterval = useRef(null)
  const cooldownInterval = useRef(null)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      })
      setPasswordData(prev => ({
        ...prev,
        email: user.email || ''
      }))
    }

    if (formRef.current) {
      gsap.fromTo(
        formRef.current,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: 'power1.out' }
      )
    }
  }, [user])

  // OTP Timer
  useEffect(() => {
    if (passwordChangeStep === 2 && otpTimer === 0 && resendCooldown === 0) {
      setOtpTimer(300) // 5 minutes
    }
  }, [passwordChangeStep])

  useEffect(() => {
    if (otpTimer > 0 && passwordChangeStep === 2) {
      timerInterval.current = setInterval(() => {
        setOtpTimer(prev => prev - 1)
      }, 1000)
    } else if (otpTimer === 0 && passwordChangeStep === 2) {
      clearInterval(timerInterval.current)
    }
    return () => clearInterval(timerInterval.current)
  }, [otpTimer, passwordChangeStep])

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

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, GIF, and WebP images are allowed')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfileImagePreview(reader.result)
      setProfileImage(file)
    }
    reader.readAsDataURL(file)
  }

  const handleUploadProfileImage = async () => {
    if (!profileImage) {
      toast.error('Please select an image first')
      return
    }

    try {
      setUploadingImage(true)
      const formDataToSend = new FormData()
      formDataToSend.append('photo', profileImage)

      const response = await api.post('/profile/upload-photo', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        toast.success('Profile image updated successfully!')
        setProfileImage(null)
        // Image preview will be updated by user context refresh
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.put('/profile/update', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      })

      if (response.data.success) {
        toast.success('Profile updated successfully!')
        // Update local user context would require AuthContext update function
      } else {
        toast.error(response.data.message || 'Failed to update profile')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (passwordChangeStep === 1) {
      // Request OTP
      setChangingPassword(true)
      try {
        const response = await api.post('/auth/request-password-change-otp', {
          email: passwordData.email
        })
        if (response.data.success) {
          toast.success('OTP sent to your email')
          setPasswordChangeStep(2)
          setOtpTimer(300)
          setResendCooldown(0)
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to send OTP')
      } finally {
        setChangingPassword(false)
      }
    } else if (passwordChangeStep === 2) {
      // Verify OTP
      if (!passwordData.otp || passwordData.otp.length !== 6) {
        toast.error('Please enter a valid 6-digit OTP')
        return
      }
      setChangingPassword(true)
      try {
        const response = await api.post('/auth/verify-password-change-otp', {
          email: passwordData.email,
          otp: passwordData.otp
        })
        if (response.data.success) {
          setPasswordChangeStep(3)
          toast.success('OTP verified! Now set your new password')
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Invalid OTP')
      } finally {
        setChangingPassword(false)
      }
    } else if (passwordChangeStep === 3) {
      // Set new password
      if (!passwordData.newPassword || !passwordData.confirmPassword) {
        toast.error('Both password fields are required')
        return
      }
      if (passwordData.newPassword.length < 6) {
        toast.error('Password must be at least 6 characters')
        return
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('Passwords do not match')
        return
      }

      setChangingPassword(true)
      try {
        const response = await api.post('/auth/change-password', {
          email: passwordData.email,
          newPassword: passwordData.newPassword
        })
        if (response.data.success) {
          toast.success('Password changed successfully! Please login again.')
          setPasswordData({
            email: user.email || '',
            otp: '',
            newPassword: '',
            confirmPassword: ''
          })
          setPasswordChangeStep(1)
          setTimeout(() => {
            logout()
          }, 1500)
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to change password')
      } finally {
        setChangingPassword(false)
      }
    }
  }

  const handleResendOtp = async () => {
    setResendCooldown(60)
    try {
      await api.post('/auth/resend-password-change-otp', {
        email: passwordData.email
      })
      toast.success('OTP resent successfully')
    } catch (error) {
      toast.error('Failed to resend OTP')
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please login to view your profile</p>
          <a href="/login" className="text-primary-600 hover:underline">Go to Login</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div ref={formRef} className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-blue-600 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <FiUser className="w-8 h-8 text-primary-600" />
                )}
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-blue-100">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'profile'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FiUser className="inline mr-2" />
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'password'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FiLock className="inline mr-2" />
              Change Password
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Profile Image Upload */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-4">Profile Picture</label>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-blue-400 rounded-full flex items-center justify-center overflow-hidden border-4 border-gray-200">
                      {profileImagePreview ? (
                        <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <FiUser className="w-12 h-12 text-white" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleProfileImageChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
                      >
                        <FiUpload className="w-4 h-4" />
                        Choose Image
                      </button>
                      {profileImage && (
                        <button
                          type="button"
                          onClick={handleUploadProfileImage}
                          disabled={uploadingImage}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold mt-2 w-full transition-all disabled:opacity-50"
                        >
                          {uploadingImage ? 'Uploading...' : 'Save Image'}
                        </button>
                      )}
                      <p className="text-xs text-gray-600 mt-2">Max 5MB • JPEG, PNG, GIF, or WebP</p>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200" />

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    <FiUser className="inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    <FiMail className="inline mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    <FiPhone className="inline mr-2" />
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleProfileChange}
                    pattern="[0-9]{10}"
                    maxLength="10"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    <FiMapPin className="inline mr-2" />
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleProfileChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-blue-800 text-sm">
                    ℹ️ We'll send an OTP to your email for security verification before changing your password.
                  </p>
                </div>

                {/* STEP 1: Request OTP */}
                {passwordChangeStep === 1 && (
                  <>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Email</label>
                      <input
                        type="email"
                        value={passwordData.email}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-600 mt-2">OTP will be sent to this email</p>
                    </div>
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="w-full bg-gradient-to-r from-primary-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {changingPassword ? 'Sending OTP...' : 'Request OTP'}
                    </button>
                  </>
                )}

                {/* STEP 2: Enter OTP */}
                {passwordChangeStep === 2 && (
                  <>
                    <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
                      otpTimer < 60 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
                    }`}>
                      <FiClock className={`w-5 h-5 ${otpTimer < 60 ? 'text-red-600' : 'text-green-600'}`} />
                      <span className={`font-bold ${otpTimer < 60 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatTime(otpTimer)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Enter OTP</label>
                      <input
                        type="text"
                        value={passwordData.otp}
                        onChange={(e) => setPasswordData({ ...passwordData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                        maxLength="6"
                        placeholder="000000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent text-center text-2xl tracking-widest"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={changingPassword || otpTimer === 0 || passwordData.otp.length !== 6}
                      className="w-full bg-gradient-to-r from-primary-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {changingPassword ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || otpTimer === 0}
                      className="w-full text-primary-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed py-2"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                    </button>
                  </>
                )}

                {/* STEP 3: Set New Password */}
                {passwordChangeStep === 3 && (
                  <>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          minLength="6"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showNewPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">At least 6 characters required</p>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          minLength="6"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                          required
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
                      disabled={changingPassword}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {changingPassword ? 'Setting Password...' : 'Set New Password'}
                    </button>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyProfile
