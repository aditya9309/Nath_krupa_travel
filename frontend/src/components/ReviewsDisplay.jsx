import { useState, useEffect } from 'react'
import { FiStar } from 'react-icons/fi'
import api from '../utils/api'

const ReviewsDisplay = ({ refreshTrigger }) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)

  useEffect(() => {
    fetchReviews()
  }, [refreshTrigger])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await api.get('/reviews')
      if (response.data.success) {
        const visibleReviews = response.data.reviews.filter(r => r.isVisible)
        setReviews(visibleReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
        
        // Calculate average rating
        if (visibleReviews.length > 0) {
          const avg = visibleReviews.reduce((sum, r) => sum + r.rating, 0) / visibleReviews.length
          setAverageRating(avg.toFixed(1))
        }
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading reviews...</div>
  }

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Guest Reviews</h2>
          <div className="flex justify-center items-center gap-4">
            {averageRating > 0 && (
              <>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold text-gray-900">{averageRating}</div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(averageRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-gray-600">Based on {reviews.length} reviews</div>
              </>
            )}
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 text-lg">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map(review => (
              <div key={review._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>

                <p className="text-gray-900 font-semibold mb-2">{review.userId?.name || 'Guest'}</p>
                <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default ReviewsDisplay
