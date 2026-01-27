import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import api from '../utils/api'

gsap.registerPlugin(ScrollTrigger)

const Gallery = () => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  const galleryRef = useRef(null)

  useEffect(() => {
    fetchImages()
  }, [selectedCategory])

  useEffect(() => {
    if (galleryRef.current && images.length > 0) {
      // Ensure images are visible immediately
      Array.from(galleryRef.current.children).forEach((child) => {
        if (child.style) {
          child.style.opacity = '1'
          child.style.visibility = 'visible'
          child.style.transform = 'scale(1)'
        }
      })
      
      // Soft scroll animation only - content stays visible
      if (typeof gsap !== 'undefined' && gsap) {
        try {
          gsap.fromTo(
            galleryRef.current.children,
            { scale: 0.95, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.3,
              stagger: 0.03,
              ease: 'power1.out',
              scrollTrigger: {
                trigger: galleryRef.current,
                start: 'top 85%',
                toggleActions: 'play none none none',
                once: true
              },
              onComplete: () => {
                // Ensure all images remain visible
                Array.from(galleryRef.current.children).forEach((child) => {
                  if (child.style) {
                    child.style.opacity = '1'
                    child.style.visibility = 'visible'
                    child.style.transform = 'scale(1)'
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
  }, [images])

  const fetchImages = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory) params.append('category', selectedCategory)
      params.append('isActive', 'true')

      const response = await api.get(`/gallery?${params.toString()}`)
      if (response.data.success) {
        setImages(response.data.images)
      }
    } catch (error) {
      console.error('Error fetching gallery:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-8">Gallery</h1>

        {/* Category Filter */}
        <div className="mb-8 flex justify-center">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="destination">Destinations</option>
            <option value="activity">Activities</option>
            <option value="transport">Transport</option>
            <option value="other">Other</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No images found</p>
          </div>
        ) : (
          <div
            ref={galleryRef}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {images.map((image) => (
              <div
                key={image._id}
                className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition transform hover:scale-105"
              >
                <img
                  src={image.image || image.url || '/placeholder-image.jpg'}
                  alt={image.title || 'Gallery Image'}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg'
                    e.target.onerror = null
                  }}
                />
                <div className="p-4">
                  <h3 className="font-semibold">{image.title}</h3>
                  {image.description && (
                    <p className="text-sm text-gray-600 mt-1">{image.description}</p>
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

export default Gallery
