import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { FiChevronLeft, FiPhone, FiMessageSquare, FiMapPin, FiClock, FiUsers, FiCheck, FiX } from 'react-icons/fi'
import { BiLogoWhatsapp } from 'react-icons/bi'

const MEAL_ICONS = {
  breakfast: '🥞',
  lunch: '🍽️',
  dinner: '🍽️'
}

const TRAVEL_MODE_ICONS = {
  train: '🚆',
  bus: '🚌',
  flight: '✈️',
  car: '🚗'
}

// Countdown Timer Component
const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime()
      const now = new Date().getTime()
      const difference = target - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        })
      } else {
        setTimeLeft(null)
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  if (!timeLeft) return <span className="text-red-600 font-bold">Offer Expired</span>

  return (
    <span className="font-bold text-orange-600">
      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
    </span>
  )
}

export default function PackageDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [packageData, setPackageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedDeparture, setSelectedDeparture] = useState(null)
  const [selectedRoomType, setSelectedRoomType] = useState('double')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    fetchPackageDetail()
  }, [id])

  const fetchPackageDetail = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/packages/${id}`)
      if (response.data.success) {
        setPackageData(response.data.package)
        if (response.data.package.departures && response.data.package.departures.length > 0) {
          setSelectedDeparture(response.data.package.departures[0])
        }
      }
    } catch (error) {
      toast.error('Failed to load package details')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading package details...</p>
        </div>
      </div>
    )
  }

  if (!packageData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Package not found</p>
          <button onClick={() => navigate('/packages')} className="bg-blue-600 text-white px-6 py-2 rounded-lg">
            Back to Packages
          </button>
        </div>
      </div>
    )
  }

  const getAllImages = () => {
    const images = []
    if (packageData.bannerImage) images.push(packageData.bannerImage)
    if (packageData.galleryImages && packageData.galleryImages.length > 0) {
      images.push(...packageData.galleryImages)
    }
    return images
  }

  const handleEnquiry = () => {
    navigate(`/user/booking?package=${id}`)
  }

  const handleCall = () => {
    toast.success('Redirecting to call...')
    // In production, integrate with backend to get phone number
    window.location.href = 'tel:+919876543210'
  }

  const handleWhatsApp = () => {
    const message = `Hi, I'm interested in the ${packageData.title} package. Could you please provide more details?`
    const encoded = encodeURIComponent(message)
    window.open(`https://wa.me/919876543210?text=${encoded}`, '_blank')
  }

  const getNextDepartureDate = () => {
    if (!packageData.departures || packageData.departures.length === 0) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return packageData.departures.find(d => new Date(d.date) >= today)
  }

  const images = getAllImages()
  const currentPrice = packageData.discountPrice || packageData.basePrice
  const discount = packageData.discountPrice ? Math.round(((packageData.basePrice - packageData.discountPrice) / packageData.basePrice) * 100) : 0
  const selectedPrice = packageData.roomTypePricing?.[selectedRoomType] || currentPrice

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="sticky top-0 bg-white shadow-sm z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => navigate('/packages')} className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
            <FiChevronLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex-1 truncate">{packageData.title}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2">
            {/* IMAGE GALLERY */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="relative bg-gray-900 h-96 md:h-[500px]">
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[currentImageIndex]}
                      alt={`Package ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {discount > 0 && (
                      <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                        -{discount}% OFF
                      </div>
                    )}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full transition-colors"
                        >
                          ❮
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full transition-colors"
                        >
                          ❯
                        </button>
                      </>
                    )}
                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <p className="text-lg">No images available</p>
                    </div>
                  </div>
                )}
              </div>
              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="p-4 bg-gray-100 flex gap-2 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        currentImageIndex === idx ? 'border-blue-600 ring-2 ring-blue-400' : 'border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* QUICK INFO CARDS */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center border border-blue-200">
                <div className="flex items-center justify-center gap-2 text-blue-600 mb-1">
                  <FiClock className="w-5 h-5" />
                  <span className="font-semibold text-lg">{packageData.duration?.days}D</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600">Duration</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-center border border-green-200">
                <div className="flex items-center justify-center gap-2 text-green-600 mb-1">
                  <FiMapPin className="w-5 h-5" />
                  <span className="font-semibold text-lg">{packageData.destinations?.length || 0}</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600">Destinations</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg text-center border border-purple-200">
                <div className="flex items-center justify-center gap-2 text-purple-600 mb-1">
                  <FiUsers className="w-5 h-5" />
                  <span className="font-semibold text-lg">{packageData.maxGroupSize}</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600">Group Size</p>
              </div>
            </div>

            {/* TABS */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="border-b border-gray-200 flex bg-gray-50">
                {['overview', 'itinerary', 'pricing', 'info'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 px-4 font-semibold transition-all ${
                      activeTab === tab
                        ? 'bg-white text-blue-600 border-b-2 border-blue-600 text-center'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="p-6 md:p-8">
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {packageData.subtitle && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 text-lg">Highlights</h3>
                        <p className="text-gray-700 text-lg font-medium text-blue-600">{packageData.subtitle}</p>
                      </div>
                    )}

                    {packageData.description && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 text-lg">Description</h3>
                        <p className="text-gray-700 leading-relaxed">{packageData.description}</p>
                      </div>
                    )}

                    {packageData.highlights && packageData.highlights.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-4 text-lg">Key Highlights</h3>
                        <ul className="space-y-3">
                          {packageData.highlights.map((h, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <FiCheck className="text-green-600 font-bold mt-1 flex-shrink-0 w-5 h-5" />
                              <span className="text-gray-700">{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {packageData.inclusions && Object.values(packageData.inclusions).some(v => v) && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-4 text-lg">What's Included</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.entries(packageData.inclusions).map(([key, value]) => (
                            value && (
                              <div key={key} className="flex items-center gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
                                <FiCheck className="text-green-600 font-bold" />
                                <span className="text-gray-700 capitalize text-sm md:text-base">{key}</span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ITINERARY TAB */}
                {activeTab === 'itinerary' && (
                  <div className="space-y-4">
                    {packageData.itinerary && packageData.itinerary.length > 0 ? (
                      <div className="relative">
                        {packageData.itinerary.map((day, idx) => (
                          <div key={idx} className="relative pl-8 pb-8">
                            {/* Vertical Line */}
                            {idx !== packageData.itinerary.length - 1 && (
                              <div className="absolute left-2 top-8 w-1 h-12 bg-blue-200"></div>
                            )}
                            {/* Circle */}
                            <div className="absolute left-0 top-0 w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-md"></div>
                            
                            <div className="bg-white border border-gray-200 rounded-lg p-4 ml-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-bold text-gray-900 text-lg">Day {day.day}</h4>
                                  <p className="text-blue-600 font-semibold text-base mt-1">{day.title}</p>
                                </div>
                                {day.travelMode && (
                                  <span className="text-3xl">{TRAVEL_MODE_ICONS[day.travelMode]}</span>
                                )}
                              </div>
                              {day.route && (
                                <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                                  <FiMapPin className="w-4 h-4 text-blue-600" />
                                  <span className="font-medium">{day.route}</span>
                                </p>
                              )}
                              {day.description && <p className="text-gray-700 text-sm mb-3 leading-relaxed">{day.description}</p>}
                              {day.meals && day.meals.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {day.meals.map((meal) => (
                                    <span key={meal} className="inline-flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full text-xs font-medium border border-yellow-200">
                                      {MEAL_ICONS[meal]} {meal.charAt(0).toUpperCase() + meal.slice(1)}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {day.accommodation && (
                                <p className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded border border-blue-200">
                                  <strong>Stay:</strong> {day.accommodation}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center py-8">No itinerary details available</p>
                    )}
                  </div>
                )}

                {/* PRICING TAB */}
                {activeTab === 'pricing' && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-gray-900 mb-4 text-lg">Room Type Pricing</h3>
                      {packageData.roomTypePricing && Object.keys(packageData.roomTypePricing).some(r => packageData.roomTypePricing[r] > 0) ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {Object.entries(packageData.roomTypePricing).map(([room, price]) => (
                            price > 0 && (
                              <div
                                key={room}
                                onClick={() => setSelectedRoomType(room)}
                                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                  selectedRoomType === room
                                    ? 'border-blue-600 bg-white shadow-lg'
                                    : 'border-gray-300 bg-white hover:border-blue-400'
                                }`}
                              >
                                <p className="font-semibold text-gray-900 capitalize text-center">{room}</p>
                                <p className="text-blue-600 font-bold text-xl text-center mt-2">₹{price.toLocaleString()}</p>
                              </div>
                            )
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600">Pricing details not available</p>
                      )}
                    </div>

                    {packageData.exclusions && packageData.exclusions.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-4 text-lg">Exclusions</h3>
                        <ul className="space-y-3">
                          {packageData.exclusions.map((e, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <FiX className="text-red-600 font-bold mt-1 flex-shrink-0 w-5 h-5" />
                              <span className="text-gray-700">{e}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* TOUR INFO TAB */}
                {activeTab === 'info' && (
                  <div className="space-y-4">
                    {packageData.pickupLocation && (
                      <div className="border-l-4 border-blue-600 pl-4 py-2">
                        <p className="font-semibold text-gray-900">Pickup Location</p>
                        <p className="text-gray-700 mt-1">{packageData.pickupLocation}</p>
                      </div>
                    )}
                    {packageData.minAge > 0 && (
                      <div className="border-l-4 border-blue-600 pl-4 py-2">
                        <p className="font-semibold text-gray-900">Minimum Age</p>
                        <p className="text-gray-700 mt-1">{packageData.minAge} years</p>
                      </div>
                    )}
                    {packageData.tourType && (
                      <div className="border-l-4 border-blue-600 pl-4 py-2">
                        <p className="font-semibold text-gray-900">Tour Type</p>
                        <p className="text-gray-700 mt-1 capitalize">{packageData.tourType}</p>
                      </div>
                    )}
                    {packageData.destinations && packageData.destinations.length > 0 && (
                      <div className="border-l-4 border-blue-600 pl-4 py-2">
                        <p className="font-semibold text-gray-900">Destinations</p>
                        <p className="text-gray-700 mt-1">{packageData.destinations.join(', ')}</p>
                      </div>
                    )}
                    {packageData.terms && (
                      <div className="border-l-4 border-blue-600 pl-4 py-2">
                        <p className="font-semibold text-gray-900">Terms & Conditions</p>
                        <p className="text-gray-700 text-sm mt-1 leading-relaxed">{packageData.terms}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SIDEBAR - 1/3 width (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* PRICE CARD */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-600">
                <p className="text-gray-600 text-sm mb-2 font-medium">Starting from</p>
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    {packageData.discountPrice && (
                      <span className="text-gray-400 line-through text-lg">₹{packageData.basePrice?.toLocaleString()}</span>
                    )}
                    <span className="text-4xl font-bold text-blue-600">₹{selectedPrice?.toLocaleString()}</span>
                  </div>
                  <p className="text-gray-600 text-xs mt-1">per person</p>
                </div>

                {discount > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-center">
                    <p className="text-red-600 font-bold text-lg">Save {discount}%!</p>
                    <p className="text-red-600 text-xs">Limited time offer</p>
                  </div>
                )}

                {/* NEXT DEPARTURE INFO */}
                {getNextDepartureDate() && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center mb-4">
                    <p className="text-gray-600 text-xs mb-1">Next Departure</p>
                    <p className="text-blue-600 font-semibold">
                      {new Date(getNextDepartureDate().date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>

              {/* DEPARTURE & ROOM SELECTION */}
              {packageData.departures && packageData.departures.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Select Departure</h3>
                  <select
                    value={selectedDeparture ? new Date(selectedDeparture.date).toISOString() : ''}
                    onChange={(e) => {
                      const dept = packageData.departures.find(d => new Date(d.date).toISOString() === e.target.value)
                      setSelectedDeparture(dept)
                    }}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:border-blue-600 focus:outline-none mb-3"
                  >
                    {packageData.departures.map((dept, idx) => {
                      const seatsLeft = dept.seatsAvailable - dept.seatsSold
                      return (
                        <option key={idx} value={new Date(dept.date).toISOString()}>
                          {new Date(dept.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {seatsLeft} seats
                        </option>
                      )
                    })}
                  </select>

                  {selectedDeparture && (
                    <div className={`p-3 rounded-lg text-sm font-medium text-center ${
                      selectedDeparture.seatsAvailable - selectedDeparture.seatsSold > 0
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {selectedDeparture.seatsAvailable - selectedDeparture.seatsSold > 0
                        ? `✓ ${selectedDeparture.seatsAvailable - selectedDeparture.seatsSold} seats available`
                        : '✗ No seats available'}
                    </div>
                  )}
                </div>
              )}

              {/* ROOM TYPE SELECTOR */}
              {packageData.roomTypePricing && Object.keys(packageData.roomTypePricing).some(r => packageData.roomTypePricing[r] > 0) && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Room Type</h3>
                  <select
                    value={selectedRoomType}
                    onChange={(e) => setSelectedRoomType(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:border-blue-600 focus:outline-none"
                  >
                    {Object.entries(packageData.roomTypePricing).map(([room, price]) =>
                      price > 0 ? (
                        <option key={room} value={room}>
                          {room.charAt(0).toUpperCase() + room.slice(1)} - ₹{price.toLocaleString()}
                        </option>
                      ) : null
                    )}
                  </select>
                </div>
              )}

              {/* CTA BUTTONS */}
              <div className="bg-white rounded-xl shadow-lg p-6 space-y-3">
                <button
                  onClick={handleEnquiry}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-md"
                >
                  🎫 Enquire Now
                </button>

                <button
                  onClick={handleCall}
                  className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <FiPhone className="w-5 h-5" />
                  Call Us
                </button>

                <button
                  onClick={handleWhatsApp}
                  className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <BiLogoWhatsapp className="w-5 h-5" />
                  WhatsApp
                </button>
              </div>

              {/* TRUST BADGES */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-4 rounded-xl">
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2 text-gray-700">
                    <FiCheck className="text-green-600 w-4 h-4" />
                    <span className="font-semibold">Best Price Guaranteed</span>
                  </p>
                  <p className="flex items-center gap-2 text-gray-700">
                    <FiCheck className="text-green-600 w-4 h-4" />
                    <span className="font-semibold">24/7 Support</span>
                  </p>
                  <p className="flex items-center gap-2 text-gray-700">
                    <FiCheck className="text-green-600 w-4 h-4" />
                    <span className="font-semibold">Easy Cancellation</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
