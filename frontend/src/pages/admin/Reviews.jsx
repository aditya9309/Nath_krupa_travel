import { useState, useEffect } from 'react'
import { FiTrash2 } from 'react-icons/fi'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const AdminReviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(null)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await api.get('/reviews/admin/all')
      if (response.data.success) {
        setReviews(response.data.reviews || [])
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveReview = async (reviewId) => {
    try {
      setDeleteLoading(reviewId)
      const response = await api.delete(`/reviews/${reviewId}`)
      if (response.data.success) {
        toast.success('Review deleted successfully')
        fetchReviews()
      }
    } catch (error) {
      toast.error('Failed to delete review')
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleToggleVisibility = async (reviewId) => {
    // Not needed anymore - removed
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return

    try {
      setDeleteLoading(reviewId)
      const response = await api.delete(`/reviews/${reviewId}`)
      if (response.data.success) {
        toast.success('Review deleted successfully')
        fetchReviews()
      }
    } catch (error) {
      toast.error('Failed to delete review')
    } finally {
      setDeleteLoading(null)
    }
  }

  const getFilteredReviews = () => {
    return reviews
  }

  const filteredReviews = getFilteredReviews()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">User Reviews Management</h1>
          <p className="text-gray-600 mt-2">Manage and moderate user reviews from the platform</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-4 mb-6">
          <p className="text-gray-600 font-semibold">Total Reviews: {reviews.length}</p>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredReviews.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No reviews found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rating</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Review</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviews.map((review) => (
                    <tr key={review._id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{review.user?.name || 'Unknown User'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-600">{review.user?.email || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                              ★
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-600 truncate max-w-xs">{review.comment}</p>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          disabled={deleteLoading === review._id}
                          className="text-red-600 hover:text-red-800 disabled:text-gray-400 transition-colors flex items-center gap-1"
                          title="Delete review"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminReviews
