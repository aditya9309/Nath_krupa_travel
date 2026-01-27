import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { FiPlus, FiTrash2, FiImage, FiFilter } from 'react-icons/fi'
import { MdDragIndicator } from 'react-icons/md'

const GALLERY_CATEGORIES = [
  { value: 'home', label: '🏠 Home Sections' },
  { value: 'category', label: '📂 Categories' },
  { value: 'package', label: '🎫 Packages' },
  { value: 'destination', label: '🗺️ Destinations' }
]

const Gallery = () => {
  const [images, setImages] = useState([])
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [previewImages, setPreviewImages] = useState([])
  const [activeCategory, setActiveCategory] = useState('home')
  const [filterType, setFilterType] = useState('all')

  const [formData, setFormData] = useState({
    images: [],
    type: 'package',
    relatedId: '',
    relatedModel: 'Package',
    title: '',
    description: '',
    isActive: true
  })

  useEffect(() => {
    fetchImages()
    fetchPackages()
  }, [])

  const fetchImages = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/manage/gallery/items')
      if (response.data.success) {
        setImages(response.data.data)
      }
    } catch (error) {
      toast.error('Failed to load gallery images')
    } finally {
      setLoading(false)
    }
  }

  const fetchPackages = async () => {
    try {
      const response = await api.get('/packages?isActive=true')
      if (response.data.success) {
        setPackages(response.data.packages)
      }
    } catch (error) {
      console.error('Failed to fetch packages')
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result]
        }))
        setPreviewImages(prev => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemovePreview = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
    setPreviewImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleCategoryChange = (e) => {
    const newType = e.target.value
    let newModel = 'Package'
    if (newType === 'category') newModel = 'CategoryCard'
    
    setFormData(prev => ({
      ...prev,
      type: newType,
      relatedModel: newModel,
      relatedId: newType === 'package' ? prev.relatedId : ''
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.images.length === 0) {
      toast.error('Please upload at least one image')
      return
    }

    try {
      // Upload each image
      const uploadPromises = formData.images.map(img =>
        api.post('/admin/manage/gallery/items', {
          image: img,
          type: formData.type,
          relatedId: formData.relatedId,
          relatedModel: formData.relatedModel,
          title: formData.title,
          description: formData.description,
          isActive: formData.isActive
        })
      )

      await Promise.all(uploadPromises)
      toast.success(`${formData.images.length} image(s) uploaded successfully!`)
      resetForm()
      setShowForm(false)
      fetchImages()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload images')
    }
  }

  const resetForm = () => {
    setFormData({
      images: [],
      type: 'package',
      relatedId: '',
      relatedModel: 'Package',
      title: '',
      description: '',
      isActive: true
    })
    setPreviewImages([])
  }

  const handleDelete = async (imageId) => {
    if (!window.confirm('Delete this image?')) return

    try {
      await api.delete(`/admin/manage/gallery/items/${imageId}`)
      toast.success('Image deleted successfully')
      fetchImages()
    } catch (error) {
      toast.error('Failed to delete image')
    }
  }

  const handleToggleActive = async (imageId, currentStatus) => {
    try {
      await api.put(`/admin/manage/gallery/items/${imageId}`, { isActive: !currentStatus })
      toast.success('Status updated')
      fetchImages()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const filteredImages = images.filter(img => {
    if (filterType === 'all') return true
    return img.linkedType === filterType
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">📸 Manage Gallery</h1>
            <p className="text-gray-600 mt-1">Upload and organize gallery images</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            Upload Images
          </button>
        </div>

        {/* UPLOAD FORM */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border-2 border-blue-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Upload Gallery Images</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* CATEGORY SELECTION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">Gallery Type</label>
                  <select
                    value={formData.linkedType}
                    onChange={handleCategoryChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    required
                  >
                    <option value="HOME">🏠 Home Sections</option>
                    <option value="CATEGORY">📂 Category Cards</option>
                    <option value="PACKAGE">🎫 Package</option>
                    <option value="DESTINATION">🗺️ Destinations</option>
                  </select>
                </div>

                {formData.linkedType === 'PACKAGE' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">Select Package</label>
                    <select
                      value={formData.referenceId}
                      onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                      required={formData.linkedType === 'PACKAGE'}
                    >
                      <option value="">Choose a package...</option>
                      {packages.map(pkg => (
                        <option key={pkg._id} value={pkg._id}>{pkg.title}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* IMAGE UPLOAD */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-900">Upload Images (Multiple)</label>
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:bg-blue-50 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="imageInput"
                  />
                  <label htmlFor="imageInput" className="cursor-pointer">
                    <FiImage className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                    <p className="text-gray-900 font-semibold">Click to upload or drag & drop</p>
                    <p className="text-gray-600 text-sm">PNG, JPG, GIF up to 5MB</p>
                  </label>
                </div>
              </div>

              {/* IMAGE PREVIEWS */}
              {previewImages.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-3 text-gray-900">Preview ({previewImages.length} image{previewImages.length !== 1 ? 's' : ''})</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {previewImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img} alt={`Preview ${idx}`} className="w-full h-32 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => handleRemovePreview(idx)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity"
                        >
                          <FiTrash2 className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DESCRIPTION */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  placeholder="Add description for these images..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* ACTIVE TOGGLE */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 cursor-pointer"
                />
                <label htmlFor="isActive" className="text-gray-900 font-semibold cursor-pointer">
                  Activate immediately after upload
                </label>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Upload {previewImages.length > 0 ? `${previewImages.length} Image(s)` : 'Images'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* FILTER TABS */}
        <div className="bg-white rounded-xl shadow-md mb-6 p-4 overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Images
            </button>
            {['HOME', 'CATEGORY', 'PACKAGE', 'DESTINATION'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  filterType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {type === 'HOME' && '🏠'}
                {type === 'CATEGORY' && '📂'}
                {type === 'PACKAGE' && '🎫'}
                {type === 'DESTINATION' && '🗺️'}
                {' '}{type}
              </button>
            ))}
          </div>
        </div>

        {/* GALLERY GRID */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading gallery...</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-16 text-center">
            <FiImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No images found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredImages.map((image, idx) => (
              <div key={image._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
                {/* IMAGE */}
                <div className="relative overflow-hidden bg-gray-100 h-48">
                  <img
                    src={image.images?.[0] || image.image}
                    alt="Gallery"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {!image.isActive && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-red-600 text-white px-3 py-1 rounded-lg font-semibold">Disabled</span>
                    </div>
                  )}
                </div>

                {/* INFO */}
                <div className="p-4">
                  <div className="mb-3">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                      {image.linkedType || 'Gallery'}
                    </span>
                  </div>

                  {image.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{image.description}</p>
                  )}

                  <div className="text-xs text-gray-500 mb-4">
                    Uploaded: {new Date(image.createdAt).toLocaleDateString('en-IN')}
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive(image._id, image.isActive)}
                      className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-colors ${
                        image.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {image.isActive ? '✓ Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => handleDelete(image._id)}
                      className="flex-1 bg-red-100 text-red-700 hover:bg-red-200 py-2 rounded-lg font-semibold text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Gallery
