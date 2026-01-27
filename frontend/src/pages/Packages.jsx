import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import api from '../utils/api'
import { PackageCardSkeleton } from '../components/SkeletonLoader'
import { FiMapPin, FiClock, FiTag } from 'react-icons/fi'

gsap.registerPlugin(ScrollTrigger)

const Packages = () => {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    priceRange: '',
    duration: '',
    travelType: ''
  })
  const packagesRef = useRef(null)

  useEffect(() => {
    fetchPackages()
  }, [filters])

  useEffect(() => {
    if (packagesRef.current && packages.length > 0) {
      // Ensure cards are visible immediately
      Array.from(packagesRef.current.children).forEach((child) => {
        if (child.style) {
          child.style.opacity = '1'
          child.style.visibility = 'visible'
        }
      })
      
      // Soft scroll animation - content stays visible
      if (typeof gsap !== 'undefined' && gsap) {
        try {
          gsap.fromTo(
            packagesRef.current.children,
            { y: 20, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.4,
              stagger: 0.06,
              ease: 'power1.out',
              scrollTrigger: {
                trigger: packagesRef.current,
                start: 'top 85%',
                toggleActions: 'play none none none',
                once: true
              },
              onComplete: () => {
                // Ensure all cards remain visible
                Array.from(packagesRef.current.children).forEach((child) => {
                  if (child.style) {
                    child.style.opacity = '1'
                    child.style.visibility = 'visible'
                  }
                })
              }
            }
          )
        } catch (error) {
          console.error('Animation error:', error)
        }
      }
    }
  }, [packages])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.category) params.append('category', filters.category)
      if (filters.search) params.append('search', filters.search)
      params.append('isActive', 'true')

      const response = await api.get(`/packages?${params.toString()}`)
      if (response.data.success) {
        setPackages(response.data.packages)
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-8">Travel Packages</h1>

        {/* Enhanced Filters */}
        <div className="mb-8 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Filter Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search packages..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
            />
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white"
            >
            <option value="">All Categories</option>
            <option value="domestic">Domestic Tours</option>
            <option value="group">Group Tours</option>
            <option value="summer-special">Summer Special</option>
            <option value="student">Student Tours</option>
            <option value="religious">Religious Tours</option>
            </select>
            <select
              value={filters.duration}
              onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white"
            >
              <option value="">All Durations</option>
              <option value="1-3">1-3 Days</option>
              <option value="4-7">4-7 Days</option>
              <option value="8+">8+ Days</option>
            </select>
            <select
              value={filters.priceRange}
              onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white"
            >
              <option value="">All Prices</option>
              <option value="0-5000">₹0 - ₹5,000</option>
              <option value="5000-10000">₹5,000 - ₹10,000</option>
              <option value="10000-20000">₹10,000 - ₹20,000</option>
              <option value="20000+">₹20,000+</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div ref={packagesRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <PackageCardSkeleton key={i} />
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No packages found</p>
          </div>
        ) : (
          <div ref={packagesRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group"
              >
                {/* Image Container */}
                <div className="relative h-56 overflow-hidden">
                  {pkg.images && pkg.images[0] ? (
                    <img
                      src={pkg.images[0]}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-400 to-blue-500"></div>
                  )}
                  {/* Category Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase shadow-lg">
                      {pkg.category || 'Domestic'}
                    </span>
                  </div>
                  {/* Trending/Best Seller Badge */}
                  {(pkg.isTrending || pkg.isBestSeller) && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                        <FiTag className="w-3 h-3" />
                        {pkg.isTrending ? 'Trending' : 'Best Seller'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
                    {pkg.title}
                  </h3>
                  
                  {/* Destination & Duration */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    {pkg.route && (
                      <span className="flex items-center gap-1">
                        <FiMapPin className="w-4 h-4" />
                        {pkg.route}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <FiClock className="w-4 h-4" />
                      {pkg.duration}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                    {pkg.description}
                  </p>

                  {/* Highlights */}
                  {pkg.highlights && pkg.highlights.length > 0 && (
                    <div className="mb-4">
                      <ul className="text-xs text-gray-500 space-y-1">
                        {pkg.highlights.slice(0, 2).map((highlight, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-500 mt-1">✓</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-2xl font-bold text-primary-600">
                        ₹{pkg.price?.toLocaleString() || '0'}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">per person</span>
                    </div>
                    <Link
                      to={`/packages/${pkg._id}`}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Tour
                    </Link>
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

export default Packages
