import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { FiPlus, FiTrash2 } from 'react-icons/fi'

const BookingForm = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const packageId = searchParams.get('package')
  const [packageData, setPackageData] = useState(null)
  const [loadingPackage, setLoadingPackage] = useState(false)
  const [formData, setFormData] = useState({
    packageId: packageId || '',
    source: '',
    destination: '',
    journeyDate: '',
    totalAmount: '',
    passengers: [
      { name: '', dob: '', gender: 'male' }
    ]
  })

  useEffect(() => {
    if (packageId) {
      fetchPackage()
    }
  }, [packageId])

  const fetchPackage = async () => {
    try {
      setLoadingPackage(true)
      const response = await api.get(`/packages/${packageId}`)
      if (response.data.success) {
        const pkg = response.data.package
        setPackageData(pkg)
        // Pre-fill form with package data
        setFormData(prev => ({
          ...prev,
          packageId: packageId,
          source: pkg.route || pkg.destination || '',
          destination: pkg.destination || pkg.route || '',
          totalAmount: pkg.price || ''
        }))
      }
    } catch (error) {
      console.error('Error fetching package:', error)
    } finally {
      setLoadingPackage(false)
    }
  }

  const addPassenger = () => {
    if (formData.passengers.length >= 20) {
      toast.error('Maximum 20 passengers allowed')
      return
    }
    setFormData({
      ...formData,
      passengers: [...formData.passengers, { name: '', dob: '', gender: 'male' }]
    })
  }

  const removePassenger = (index) => {
    if (formData.passengers.length === 1) {
      toast.error('At least one passenger is required')
      return
    }
    setFormData({
      ...formData,
      passengers: formData.passengers.filter((_, i) => i !== index)
    })
  }

  const updatePassenger = (index, field, value) => {
    const updatedPassengers = [...formData.passengers]
    updatedPassengers[index][field] = value
    setFormData({ ...formData, passengers: updatedPassengers })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate all passengers have required fields
    const invalidPassengers = formData.passengers.filter(p => !p.name || !p.dob || !p.gender)
    if (invalidPassengers.length > 0) {
      toast.error('Please fill all passenger details')
      return
    }

    // Validate journey date is in future
    if (new Date(formData.journeyDate) < new Date()) {
      toast.error('Journey date must be in the future')
      return
    }

    try {
      const bookingData = {
        source: formData.source.trim(),
        destination: formData.destination.trim(),
        journeyDate: new Date(formData.journeyDate),
        totalAmount: parseFloat(formData.totalAmount),
        passengers: formData.passengers.map(p => ({
          name: p.name.trim(),
          dob: new Date(p.dob),
          gender: p.gender
        }))
      }

      // Add packageId if available
      if (formData.packageId) {
        bookingData.packageId = formData.packageId
      }

      const response = await api.post('/bookings', bookingData)
      if (response.data.success) {
        toast.success('Booking created successfully! Confirmation email sent.')
        navigate('/my-bookings')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create booking'
      toast.error(errorMessage)
      console.error('Booking error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">Book Your Trip</h1>
        
        {loadingPackage && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-600">Loading package details...</p>
          </div>
        )}
        
        {packageData && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-800 font-semibold">Booking for: {packageData.title}</p>
            <p className="text-green-700 text-sm">Price: ₹{packageData.price?.toLocaleString()}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          {/* Trip Details */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Trip Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Source</label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Destination</label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Journey Date</label>
                <input
                  type="date"
                  value={formData.journeyDate}
                  onChange={(e) => setFormData({ ...formData, journeyDate: e.target.value })}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Total Amount (₹)</label>
                <input
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Passengers */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Passengers ({formData.passengers.length}/20)</h2>
              <button
                type="button"
                onClick={addPassenger}
                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                <FiPlus className="w-5 h-5" />
                <span>Add Passenger</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.passengers.map((passenger, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Passenger {index + 1}</h3>
                    {formData.passengers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePassenger(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                      <input
                        type="text"
                        value={passenger.name}
                        onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Date of Birth</label>
                      <input
                        type="date"
                        value={passenger.dob}
                        onChange={(e) => updatePassenger(index, 'dob', e.target.value)}
                        required
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Gender</label>
                      <select
                        value={passenger.gender}
                        onChange={(e) => updatePassenger(index, 'gender', e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              Submit Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BookingForm
