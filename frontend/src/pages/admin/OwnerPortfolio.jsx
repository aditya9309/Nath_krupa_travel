import { useState, useEffect, useRef } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { FiUpload, FiTrash2, FiEdit2 } from 'react-icons/fi'

const AdminOwnerPortfolio = () => {
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [isActive, setIsActive] = useState(false)
  const fileInputRef = useRef(null)
  const [formData, setFormData] = useState({
    ownerName: '',
    designation: '',
    bio: '',
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
      whatsapp: ''
    }
  })

  useEffect(() => {
    fetchPortfolio()
  }, [])

  const fetchPortfolio = async () => {
    try {
      setLoading(true)
      const response = await api.get('/home/owner-portfolio')
      if (response.data.success && response.data.portfolio) {
        const p = response.data.portfolio
        setPortfolio(p)
        setFormData({
          ownerName: p.ownerName || '',
          designation: p.designation || '',
          bio: p.bio || '',
          socialLinks: p.socialLinks || {
            facebook: '',
            instagram: '',
            twitter: '',
            linkedin: '',
            whatsapp: ''
          }
        })
        setImagePreview(p.profileImage || null)
        setIsActive(p.isActive || false)
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error)
      toast.error('Failed to load portfolio')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
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

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
      setImageFile(file)
    }
    reader.readAsDataURL(file)
  }

  const handleUploadImage = async () => {
    if (!imageFile) {
      toast.error('Please select an image')
      return
    }

    try {
      setSaving(true)
      const formDataToSend = new FormData()
      formDataToSend.append('photo', imageFile)

      const response = await api.post('/profile/upload-photo', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        setImagePreview(response.data.profilePhoto)
        setImageFile(null)
        toast.success('Image uploaded successfully')
        fetchPortfolio()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload image')
    } finally {
      setSaving(false)
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('social_')) {
      const socialKey = name.replace('social_', '')
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSavePortfolio = async (e) => {
    e.preventDefault()

    if (!formData.ownerName.trim()) {
      toast.error('Owner name is required')
      return
    }
    if (!formData.designation.trim()) {
      toast.error('Designation is required')
      return
    }
    if (!formData.bio.trim()) {
      toast.error('Bio is required')
      return
    }
    if (!imagePreview) {
      toast.error('Profile image is required')
      return
    }

    try {
      setSaving(true)
      const payload = {
        ownerName: formData.ownerName.trim(),
        designation: formData.designation.trim(),
        bio: formData.bio.trim(),
        profileImage: imagePreview,
        isActive: isActive,
        socialLinks: formData.socialLinks
      }

      const response = await api.post('/admin/owner-portfolio', payload)

      if (response.data.success) {
        toast.success('Portfolio saved successfully')
        setImageFile(null)
        fetchPortfolio()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save portfolio')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePortfolio = async () => {
    if (!window.confirm('Are you sure you want to delete the portfolio?')) return

    try {
      setSaving(true)
      const response = await api.delete('/admin/owner-portfolio')

      if (response.data.success) {
        toast.success('Portfolio deleted successfully')
        setPortfolio(null)
        setFormData({
          ownerName: '',
          designation: '',
          bio: '',
          socialLinks: {
            facebook: '',
            instagram: '',
            twitter: '',
            linkedin: '',
            whatsapp: ''
          }
        })
        setImagePreview(null)
        setIsActive(false)
      }
    } catch (error) {
      toast.error('Failed to delete portfolio')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Owner Portfolio Management</h1>
          <p className="text-gray-600 mt-2">Manage your owner profile and portfolio details</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSavePortfolio} className="space-y-8">
            {/* Profile Image Section */}
            <div className="border-b pb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FiUpload className="w-6 h-6" />
                Profile Image
              </h2>
              <div className="flex items-center gap-8">
                <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-gray-500">
                      <div className="text-4xl mb-2">📷</div>
                      <p className="text-sm">No image</p>
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all mb-2 block"
                  >
                    Choose Image
                  </button>
                  {imageFile && (
                    <button
                      type="button"
                      onClick={handleUploadImage}
                      disabled={saving}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
                    >
                      {saving ? 'Uploading...' : 'Upload Image'}
                    </button>
                  )}
                  <p className="text-xs text-gray-600 mt-4">Max 5MB • JPEG, PNG, GIF, or WebP</p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="border-b pb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FiEdit2 className="w-6 h-6" />
                Basic Information
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Owner Name</label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="e.g., John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="e.g., Founder & CEO"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleFormChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                    placeholder="Write a brief bio about the owner..."
                    required
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
                  />
                  <label htmlFor="isActive" className="text-gray-700 font-semibold">
                    Active on About Page
                  </label>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="pb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Social Links (Optional)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Facebook</label>
                  <input
                    type="url"
                    name="social_facebook"
                    value={formData.socialLinks.facebook}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="https://facebook.com/..."
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Instagram</label>
                  <input
                    type="url"
                    name="social_instagram"
                    value={formData.socialLinks.instagram}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Twitter/X</label>
                  <input
                    type="url"
                    name="social_twitter"
                    value={formData.socialLinks.twitter}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="https://twitter.com/..."
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">LinkedIn</label>
                  <input
                    type="url"
                    name="social_linkedin"
                    value={formData.socialLinks.linkedin}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="https://linkedin.com/..."
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">WhatsApp</label>
                  <input
                    type="tel"
                    name="social_whatsapp"
                    value={formData.socialLinks.whatsapp}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-8 border-t">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Portfolio'}
              </button>
              {portfolio && (
                <button
                  type="button"
                  onClick={handleDeletePortfolio}
                  disabled={saving}
                  className="px-6 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <FiTrash2 className="w-5 h-5" />
                  Delete
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminOwnerPortfolio
