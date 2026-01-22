import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import api from '../utils/api'

gsap.registerPlugin(ScrollTrigger)

const Routes = () => {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const routesRef = useRef(null)

  useEffect(() => {
    fetchRoutes()
  }, [])

  useEffect(() => {
    // Ensure routes are visible immediately
    if (routesRef.current && routes.length > 0) {
      Array.from(routesRef.current.children).forEach((child) => {
        if (child.style) {
          child.style.opacity = '1'
          child.style.visibility = 'visible'
          child.style.transform = 'translateX(0)'
        }
      })
    }
  }, [routes])

  const fetchRoutes = async () => {
    try {
      const response = await api.get('/routes?isActive=true')
      if (response.data.success) {
        setRoutes(response.data.routes)
      }
    } catch (error) {
      console.error('Error fetching routes:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 md:mb-8">Travel Routes</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : routes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No routes found</p>
          </div>
        ) : (
          <div ref={routesRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {routes.map((route) => (
              <Link
                key={route._id}
                to={`/routes/${route._id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {route.image && (
                  <img
                    src={route.image}
                    alt={route.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{route.name}</h3>
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <span>{route.source}</span>
                    <span>→</span>
                    <span>{route.destination}</span>
                  </div>
                  {route.distance && (
                    <p className="text-sm text-gray-500">Distance: {route.distance}</p>
                  )}
                  {route.duration && (
                    <p className="text-sm text-gray-500">Duration: {route.duration}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Routes
