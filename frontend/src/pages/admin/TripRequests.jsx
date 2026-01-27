import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const TripRequests = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: ''
  })

  useEffect(() => {
    fetchRequests()
  }, [filters])

  const fetchRequests = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)

      const response = await api.get(`/admin/trip-requests?${params.toString()}`)
      if (response.data.success) {
        setRequests(response.data.tripRequests)
      }
    } catch (error) {
      toast.error('Failed to load trip requests')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (requestId, status, adminNotes = '') => {
    try {
      const response = await api.put(`/trip-requests/${requestId}/status`, {
        status,
        adminNotes
      })
      if (response.data.success) {
        toast.success('Trip request status updated')
        fetchRequests()
      }
    } catch (error) {
      toast.error('Failed to update trip request')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Trip Requests</h1>

        <div className="mb-6">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{request.name}</h3>
                    <p className="text-gray-600">Email: {request.email}</p>
                    <p className="text-gray-600">Phone: {request.phone}</p>
                    <p className="text-gray-600">Trip Type: {request.tripType}</p>
                    <p className="text-gray-600">Members: {request.members}</p>
                    <p className="text-gray-600">Budget: ₹{request.budget}</p>
                    {request.message && (
                      <p className="text-gray-600 mt-2">Message: {request.message}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>

                <div className="flex space-x-2">
                  {request.status !== 'approved' && (
                    <button
                      onClick={() => updateStatus(request._id, 'approved')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approve
                    </button>
                  )}
                  {request.status !== 'rejected' && (
                    <button
                      onClick={() => updateStatus(request._id, 'rejected')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TripRequests
