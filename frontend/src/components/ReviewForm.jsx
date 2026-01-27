import { useState } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { FiStar, FiX } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

const ReviewForm = ({ onReviewSubmitted, onClose }) => {
  const { user } = useAuth()
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!reviewText.trim()) {
      toast.error('Please write a review')
      return
    }

    if (reviewText.trim().length < 10) {
      toast.error('Review must be at least 10 characters')
      return
    }

    try {
      setLoading(true)
      const response = await api.post('/reviews', {
        rating,
        comment: reviewText,
        title: `${rating}-star review`
      })

      if (response.data.success) {
        toast.success('Review submitted successfully!')
        setReviewText('')
        setRating(5)
        if (onReviewSubmitted) onReviewSubmitted()
        if (onClose) onClose()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p className="text-blue-800">Please <a href="/login" className="font-bold underline">login</a> to submit a review</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">Share Your Experience</h3>
        {onClose && <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><FiX className="w-5 h-5" /></button>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* RATING */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Rating *</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform transform hover:scale-110"
              >
                <FiStar
                  className={`w-8 h-8 ${
                    (hoverRating || rating) >= star
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-1">{rating} out of 5 stars</p>
        </div>

        {/* REVIEW TEXT */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Your Review *</label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience with us... (minimum 10 characters)"
            maxLength={1000}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-600 mt-1">{reviewText.length}/1000 characters</p>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default ReviewForm
