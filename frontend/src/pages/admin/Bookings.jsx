import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { FiTrash2 } from 'react-icons/fi'

const Bookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: ''
  })

  useEffect(() => {
    fetchBookings()
  }, [filters])

  const fetchBookings = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)

      const response = await api.get(`/admin/bookings?${params.toString()}`)
      if (response.data.success) {
        setBookings(response.data.bookings)
      }
    } catch (error) {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (bookingId, status) => {
    try {
      const response = await api.put(`/bookings/${bookingId}/status`, { status })
      if (response.data.success) {
        toast.success('Booking status updated')
        fetchBookings()
      }
    } catch (error) {
      toast.error('Failed to update booking status')
    }
  }

  const handleDelete = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return
    }

    try {
      const response = await api.delete(`/bookings/${bookingId}`)
      if (response.data.success) {
        toast.success('Booking deleted successfully')
        fetchBookings()
      }
    } catch (error) {
      toast.error('Failed to delete booking')
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

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-gray-900">Manage Bookings</h1>

        <div className="mb-6">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow-md p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {booking.source} → {booking.destination}
                    </h3>
                    <p className="text-gray-600">
                      User: {booking.userId?.name} ({booking.userId?.email})
                    </p>
                    <p className="text-gray-600">
                      Date: {new Date(booking.journeyDate).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                      Passengers: {booking.passengers.length}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <p className="text-xl md:text-2xl font-bold text-primary-600 mt-2">
                      ₹{booking.totalAmount?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  {booking.status !== 'confirmed' && (
                    <button
                      onClick={() => updateStatus(booking._id, 'confirmed')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Confirm
                    </button>
                  )}
                  {booking.status !== 'cancelled' && (
                    <button
                      onClick={() => updateStatus(booking._id, 'cancelled')}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(booking._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Bookings
