import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'

const RouteDetail = () => {
  const { id } = useParams()
  const [route, setRoute] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoute()
  }, [id])

  const fetchRoute = async () => {
    try {
      const response = await api.get(`/routes/${id}`)
      if (response.data.success) {
        setRoute(response.data.route)
      }
    } catch (error) {
      toast.error('Failed to load route details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!route) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Route not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {route.image && (
          <img
            src={route.image}
            alt={route.name}
            className="w-full h-96 object-cover rounded-lg mb-8"
          />
        )}

        <h1 className="text-4xl font-bold mb-4">{route.name}</h1>
        <div className="flex items-center space-x-4 text-gray-600 mb-6">
          <span className="text-lg font-semibold">{route.source}</span>
          <span className="text-2xl">→</span>
          <span className="text-lg font-semibold">{route.destination}</span>
        </div>

        {route.description && (
          <p className="text-gray-600 text-lg mb-8">{route.description}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {route.distance && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Distance</h3>
              <p className="text-gray-600">{route.distance}</p>
            </div>
          )}
          {route.duration && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Duration</h3>
              <p className="text-gray-600">{route.duration}</p>
            </div>
          )}
        </div>

        {route.highlights && route.highlights.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Route Highlights</h2>
            <ul className="space-y-2">
              {route.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-primary-600 mt-1">✓</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default RouteDetail
