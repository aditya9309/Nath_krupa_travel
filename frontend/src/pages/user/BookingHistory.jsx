import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const BookingHistory = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/my-bookings')
      if (response.data.success) {
        setBookings(response.data.bookings)
      }
    } catch (error) {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-gray-900">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">No bookings found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-xl shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-900">
                      {booking.source} → {booking.destination}
                    </h3>
                    <p className="text-gray-600 text-sm md:text-base">
                      Date: {new Date(booking.journeyDate).toLocaleDateString('en-GB')}
                    </p>
                    <p className="text-gray-600 text-sm md:text-base">
                      Passengers: {booking.passengers.length}
                    </p>
                    {booking.packageId && (
                      <p className="text-gray-500 text-sm mt-1">Package Booking</p>
                    )}
                  </div>
                  <div className="text-left md:text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    <p className="text-xl md:text-2xl font-bold text-primary-600 mt-2">
                      ₹{booking.totalAmount?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Passengers:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {booking.passengers.map((passenger, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        {passenger.name} ({passenger.gender})
                      </div>
                    ))}
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

export default BookingHistory
