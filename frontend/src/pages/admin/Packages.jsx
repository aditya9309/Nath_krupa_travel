import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit, FiTrash2, FiImage, FiChevronDown } from 'react-icons/fi'
import { TableSkeleton } from '../../components/SkeletonLoader'

const PACKAGE_TYPES = [
  { value: 'domestic', label: '🏨 Domestic Tours', icon: '🏨' },
  { value: 'religious', label: '🛕 Religious Tours', icon: '🛕' },
  { value: 'student', label: '🎓 Student Tours', icon: '🎓' },
  { value: 'honeymoon', label: '💑 Honeymoon Tours', icon: '💑' }
];

const TRAVEL_MODES = ['train', 'bus', 'flight', 'car'];
const MEALS = ['breakfast', 'lunch', 'dinner'];

const Packages = () => {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('domestic')
  const [showForm, setShowForm] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [previewImages, setPreviewImages] = useState([])
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    overview: '',
    tourType: 'group',
    destinations: [],
    pickupLocation: '',
    minAge: 0,
    maxGroupSize: 10,
    basePrice: 0,
    discountPrice: 0,
    roomTypePricing: {
      single: 0,
      double: 0,
      triple: 0,
      sharing: 0,
      infant: 0
    },
    duration: {
      days: 0,
      nights: 0
    },
    departures: [],
    inclusions: {
      hotel: false,
      transport: false,
      meals: false,
      sightseeing: false,
      guide: false,
      insurance: false
    },
    routes: [],
    itinerary: [],
    bannerImage: '',
    galleryImages: [],
    highlights: [],
    exclusions: [],
    terms: ''
  });

  const [itineraryDay, setItineraryDay] = useState({
    day: 1,
    title: '',
    route: '',
    description: '',
    meals: [],
    activities: [],
    accommodation: '',
    travelMode: 'bus'
  });

  const [departureInput, setDepartureInput] = useState({
    date: '',
    seatsAvailable: 10
  });

  useEffect(() => {
    fetchPackages()
  }, [activeTab])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/packages?packageType=${activeTab}`)
      if (response.data.success) {
        setPackages(response.data.packages)
      }
    } catch (error) {
      toast.error('Failed to load packages')
    } finally {
      setLoading(false)
    }
  }

  const handleBasicChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDurationChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      duration: {
        ...prev.duration,
        [name]: parseInt(value)
      }
    }))
  }

  const handlePriceChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }))
  }

  const handleRoomPriceChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      roomTypePricing: {
        ...prev.roomTypePricing,
        [name]: parseFloat(value)
      }
    }))
  }

  const handleInclusionChange = (inclusion) => {
    setFormData(prev => ({
      ...prev,
      inclusions: {
        ...prev.inclusions,
        [inclusion]: !prev.inclusions[inclusion]
      }
    }))
  }

  const handleDestinationsChange = (e) => {
    const value = e.target.value.split(',').map(d => d.trim()).filter(d => d)
    setFormData(prev => ({
      ...prev,
      destinations: value
    }))
  }

  const handleHighlightsChange = (e) => {
    const value = e.target.value.split('\n').map(h => h.trim()).filter(h => h)
    setFormData(prev => ({
      ...prev,
      highlights: value
    }))
  }

  const handleExclusionsChange = (e) => {
    const value = e.target.value.split('\n').map(e => e.trim()).filter(e => e)
    setFormData(prev => ({
      ...prev,
      exclusions: value
    }))
  }

  const handleAddItineraryDay = () => {
    if (!itineraryDay.title || !itineraryDay.route) {
      toast.error('Please fill title and route')
      return
    }
    setFormData(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, { ...itineraryDay }]
    }))
    setItineraryDay({
      day: formData.itinerary.length + 2,
      title: '',
      route: '',
      description: '',
      meals: [],
      activities: [],
      accommodation: '',
      travelMode: 'bus'
    })
    toast.success('Day added to itinerary')
  }

  const handleItineraryChange = (e) => {
    const { name, value } = e.target
    setItineraryDay(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleMealToggle = (meal) => {
    setItineraryDay(prev => ({
      ...prev,
      meals: prev.meals.includes(meal)
        ? prev.meals.filter(m => m !== meal)
        : [...prev.meals, meal]
    }))
  }

  const handleAddDeparture = () => {
    if (!departureInput.date || departureInput.seatsAvailable <= 0) {
      toast.error('Please fill departure date and seats')
      return
    }
    setFormData(prev => ({
      ...prev,
      departures: [...prev.departures, { ...departureInput, seatsSold: 0, isActive: true }]
    }))
    setDepartureInput({ date: '', seatsAvailable: 10 })
    toast.success('Departure added')
  }

  const handleRemoveDeparture = (index) => {
    setFormData(prev => ({
      ...prev,
      departures: prev.departures.filter((_, i) => i !== index)
    }))
  }

  const handleDepartureInputChange = (e) => {
    const { name, value } = e.target
    setDepartureInput(prev => ({
      ...prev,
      [name]: name === 'date' ? value : parseInt(value)
    }))
  }

  const handleBannerImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          bannerImage: reader.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGalleryImagesUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          galleryImages: [...prev.galleryImages, reader.result]
        }))
        setPreviewImages(prev => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.basePrice || !formData.bannerImage) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      const response = await api.post(
        `/packages?category=${activeTab}&packageType=${activeTab}`,
        formData
      )

      if (response.data.success) {
        toast.success('Package created successfully!')
        resetForm()
        setShowForm(false)
        fetchPackages()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create package')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      overview: '',
      tourType: 'group',
      destinations: [],
      pickupLocation: '',
      minAge: 0,
      maxGroupSize: 10,
      basePrice: 0,
      discountPrice: 0,
      roomTypePricing: {
        single: 0,
        double: 0,
        triple: 0,
        sharing: 0,
        infant: 0
      },
      duration: {
        days: 0,
        nights: 0
      },
      departures: [],
      inclusions: {
        hotel: false,
        transport: false,
        meals: false,
        sightseeing: false,
        guide: false,
        insurance: false
      },
      routes: [],
      itinerary: [],
      bannerImage: '',
      galleryImages: [],
      highlights: [],
      exclusions: [],
      terms: ''
    })
    setEditingPackage(null)
    setPreviewImages([])
  }

  const handleDelete = async (packageId) => {
    if (!window.confirm('Are you sure you want to delete this package?')) return

    try {
      await api.delete(`/packages/${packageId}`)
      toast.success('Package deleted successfully')
      fetchPackages()
    } catch (error) {
      toast.error('Failed to delete package')
    }
  }

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Manage Packages</h1>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <FiPlus className="w-5 h-5" />
            Add Package
          </button>
        </div>

        {/* TAB NAVIGATION */}
        <div className="bg-white rounded-lg shadow-md mb-6 p-4 overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            {PACKAGE_TYPES.map(ptype => (
              <button
                key={ptype.value}
                onClick={() => setActiveTab(ptype.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                  activeTab === ptype.value
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <span>{ptype.icon}</span>
                {ptype.label}
              </button>
            ))}
          </div>
        </div>

        {/* FORM SECTION */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">
              Create Package - {PACKAGE_TYPES.find(c => c.value === activeTab)?.label}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* BASIC DETAILS */}
              <section className="pb-6 border-b">
                <h3 className="text-lg font-bold mb-4 text-gray-800">Basic Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" name="title" placeholder="Package Title *" value={formData.title} onChange={handleBasicChange} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                  <input type="text" name="subtitle" placeholder="Subtitle / Tagline" value={formData.subtitle} onChange={handleBasicChange} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  <input type="number" name="days" placeholder="Days *" value={formData.duration.days} onChange={handleDurationChange} className="px-4 py-2 border border-gray-300 rounded-lg" required min="1" />
                  <input type="number" name="nights" placeholder="Nights" value={formData.duration.nights} onChange={handleDurationChange} className="px-4 py-2 border border-gray-300 rounded-lg" />
                  <select name="tourType" value={formData.tourType} onChange={handleBasicChange} className="px-4 py-2 border border-gray-300 rounded-lg">
                    <option value="group">Group</option>
                    <option value="personal">Personal</option>
                    <option value="couple">Couple</option>
                  </select>
                  <input type="number" name="maxGroupSize" placeholder="Max Group Size" value={formData.maxGroupSize} onChange={handleBasicChange} className="px-4 py-2 border border-gray-300 rounded-lg" />
                  <input type="text" placeholder="Destinations (comma-separated)" value={formData.destinations.join(', ')} onChange={handleDestinationsChange} className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg" />
                  <input type="text" name="pickupLocation" placeholder="Pickup Location" value={formData.pickupLocation} onChange={handleBasicChange} className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg" />
                  <textarea name="description" placeholder="Description *" value={formData.description} onChange={handleBasicChange} rows="4" className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg" required />
                </div>
              </section>

              {/* PRICING */}
              <section className="pb-6 border-b">
                <h3 className="text-lg font-bold mb-4 text-gray-800">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input type="number" name="basePrice" placeholder="Base Price *" value={formData.basePrice} onChange={handlePriceChange} className="px-4 py-2 border border-gray-300 rounded-lg" required step="100" />
                  <input type="number" name="discountPrice" placeholder="Discount Price" value={formData.discountPrice} onChange={handlePriceChange} className="px-4 py-2 border border-gray-300 rounded-lg" step="100" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {Object.keys(formData.roomTypePricing).map(room => (
                    <input key={room} type="number" name={room} placeholder={room.charAt(0).toUpperCase() + room.slice(1)} value={formData.roomTypePricing[room]} onChange={handleRoomPriceChange} className="px-2 py-2 border border-gray-300 rounded text-sm" step="100" />
                  ))}
                </div>
              </section>

              {/* DEPARTURES */}
              <section className="pb-6 border-b">
                <h3 className="text-lg font-bold mb-4 text-gray-800">📅 Departure Dates</h3>
                {formData.departures.length > 0 && (
                  <div className="mb-4 space-y-2 max-h-48 overflow-y-auto">
                    {formData.departures.map((dept, idx) => (
                      <div key={idx} className="bg-green-50 p-3 rounded border border-green-200 flex justify-between items-center">
                        <div className="text-sm">
                          <p className="font-semibold text-gray-900">{new Date(dept.date).toLocaleDateString('en-IN')}</p>
                          <p className="text-gray-600">{dept.seatsAvailable} seats available</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDeparture(idx)}
                          className="text-red-600 hover:text-red-800 font-semibold text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <input
                    type="date"
                    name="date"
                    value={departureInput.date}
                    onChange={handleDepartureInputChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    name="seatsAvailable"
                    placeholder="Total Seats"
                    value={departureInput.seatsAvailable}
                    onChange={handleDepartureInputChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                  <button
                    type="button"
                    onClick={handleAddDeparture}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold"
                  >
                    + Add Departure
                  </button>
                </div>
              </section>

              {/* INCLUSIONS */}
              <section className="pb-6 border-b">
                <h3 className="text-lg font-bold mb-4 text-gray-800">Inclusions</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.keys(formData.inclusions).map(inclusion => (
                    <label key={inclusion} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.inclusions[inclusion]} onChange={() => handleInclusionChange(inclusion)} className="w-4 h-4" />
                      <span className="capitalize">{inclusion}</span>
                    </label>
                  ))}
                </div>
              </section>

              {/* ITINERARY */}
              <section className="pb-6 border-b">
                <h3 className="text-lg font-bold mb-4 text-gray-800">Itinerary</h3>
                {formData.itinerary.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {formData.itinerary.map((day, idx) => (
                      <div key={idx} className="bg-blue-50 p-3 rounded flex justify-between items-start">
                        <div>
                          <p className="font-semibold">Day {day.day}: {day.title}</p>
                          <p className="text-sm text-gray-600">{day.route}</p>
                        </div>
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, itinerary: prev.itinerary.filter((_, i) => i !== idx) }))} className="text-red-600 text-sm">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="bg-blue-50 p-4 rounded">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <input type="number" name="day" placeholder="Day #" value={itineraryDay.day} onChange={handleItineraryChange} className="px-3 py-2 border border-gray-300 rounded text-sm" min="1" />
                    <input type="text" name="title" placeholder="Day title" value={itineraryDay.title} onChange={handleItineraryChange} className="px-3 py-2 border border-gray-300 rounded text-sm" />
                    <input type="text" name="route" placeholder="Route (City → City)" value={itineraryDay.route} onChange={handleItineraryChange} className="px-3 py-2 border border-gray-300 rounded text-sm" />
                    <select name="travelMode" value={itineraryDay.travelMode} onChange={handleItineraryChange} className="px-3 py-2 border border-gray-300 rounded text-sm">
                      {TRAVEL_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <textarea name="description" placeholder="Description" value={itineraryDay.description} onChange={handleItineraryChange} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-3" />
                  <div className="flex gap-2 mb-3">
                    {MEALS.map(meal => (
                      <label key={meal} className="flex items-center gap-1 text-sm cursor-pointer">
                        <input type="checkbox" checked={itineraryDay.meals.includes(meal)} onChange={() => handleMealToggle(meal)} className="w-3 h-3" />
                        {meal}
                      </label>
                    ))}
                  </div>
                  <button type="button" onClick={handleAddItineraryDay} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">+ Add Day</button>
                </div>
              </section>

              {/* MEDIA */}
              <section className="pb-6 border-b">
                <h3 className="text-lg font-bold mb-4 text-gray-800">Media</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Banner Image *</label>
                  <input type="file" accept="image/*" onChange={handleBannerImageUpload} className="w-full" />
                  {formData.bannerImage && <img src={formData.bannerImage} alt="Banner" className="mt-2 h-32 w-full object-cover rounded" />}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Gallery Images</label>
                  <input type="file" multiple accept="image/*" onChange={handleGalleryImagesUpload} className="w-full" />
                  {previewImages.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 md:grid-cols-5 gap-2">
                      {previewImages.map((img, idx) => <img key={idx} src={img} alt="Gallery" className="h-20 w-full object-cover rounded" />)}
                    </div>
                  )}
                </div>
              </section>

              {/* HIGHLIGHTS & EXCLUSIONS */}
              <section className="pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Highlights</label>
                    <textarea value={formData.highlights.join('\n')} onChange={handleHighlightsChange} rows="4" placeholder="One per line" className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Exclusions</label>
                    <textarea value={formData.exclusions.join('\n')} onChange={handleExclusionsChange} rows="4" placeholder="One per line" className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
                  </div>
                </div>
              </section>

              <div className="flex gap-4">
                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-semibold">Create Package</button>
                <button type="button" onClick={() => { setShowForm(false); resetForm() }} className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* PACKAGES LIST */}
        {loading ? (
          <TableSkeleton />
        ) : (
          <div>
            {packages.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-600 text-lg">No packages in this category yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map(pkg => (
                  <div key={pkg._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
                    {pkg.bannerImage && <img src={pkg.bannerImage} alt={pkg.title} className="w-full h-40 object-cover" />}
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2">{pkg.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{pkg.description}</p>
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-blue-600 font-bold">₹{pkg.basePrice?.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">{pkg.duration?.days}D / {pkg.duration?.nights}N</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingPackage(pkg); setShowForm(true) }} className="flex-1 text-blue-600 hover:text-blue-800 font-medium text-sm py-1">Edit</button>
                        <button onClick={() => handleDelete(pkg._id)} className="flex-1 text-red-600 hover:text-red-800 font-medium text-sm py-1">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Packages
