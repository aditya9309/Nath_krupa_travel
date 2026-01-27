import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import ReviewForm from '../components/ReviewForm'
import ReviewsDisplay from '../components/ReviewsDisplay'

const Home = () => {
  const navigate = useNavigate()
  const [heroSection, setHeroSection] = useState(null)
  const [topDestinations, setTopDestinations] = useState([])
  const [categoryCards, setCategoryCards] = useState([])
  const [ownerPortfolio, setOwnerPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [destCarouselIndex, setDestCarouselIndex] = useState(0)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0)

  useEffect(() => {
    fetchHomeSections()
  }, [])

  const fetchHomeSections = async () => {
    try {
      setLoading(true)
      const [heroRes, destRes, catRes, ownerRes] = await Promise.all([
        api.get('/home/hero-section'),
        api.get('/home/top-destinations'),
        api.get('/home/category-cards'),
        api.get('/home/owner-portfolio')
      ])

      if (heroRes.data.success) setHeroSection(heroRes.data.heroSection)
      if (destRes.data.success) setTopDestinations(destRes.data.destinations || [])
      if (catRes.data.success) setCategoryCards(catRes.data.categories || [])
      if (ownerRes.data.success && ownerRes.data.portfolio?.isActive) setOwnerPortfolio(ownerRes.data.portfolio)
    } catch (error) {
      console.error('Error fetching home sections:', error)
      toast.error('Failed to load home sections')
    } finally {
      setLoading(false)
    }
  }

  const scrollDestinations = (direction) => {
    if (direction === 'next') {
      setDestCarouselIndex((prev) => (prev + 1) % topDestinations.length)
    } else {
      setDestCarouselIndex((prev) => (prev === 0 ? topDestinations.length - 1 : prev - 1))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading home page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* HERO SECTION - Admin Controlled or Fallback */}
      <section
        className="relative min-h-screen flex items-center justify-center text-white overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: heroSection?.backgroundImage ? `url(${heroSection.backgroundImage})` : 'url("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGFkdmVudHVyZXxlbnwwfHwwfHx8MA%3D%3D?auto=format&fit=crop&w=2000&q=80")',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">{heroSection?.title || 'Explore Your Next Adventure'}</h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-100">{heroSection?.subtitle || 'Discover breathtaking journeys with Nath Krupa Travels'}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {heroSection?.primaryButtonText && heroSection?.primaryButtonURL ? (
              <a
                href={heroSection.primaryButtonURL}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                {heroSection.primaryButtonText}
              </a>
            ) : (
              <Link
                to="/packages"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                Explore Packages
              </Link>
            )}
            {heroSection?.secondaryButtonText && heroSection?.secondaryButtonURL && (
              <a
                href={heroSection.secondaryButtonURL}
                className="bg-white/20 backdrop-blur border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/30 transition-all transform hover:scale-105 shadow-lg"
              >
                {heroSection.secondaryButtonText}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Best Prices', description: 'Competitive pricing with exclusive deals', icon: '💰' },
              { title: 'Expert Team', description: 'Experienced guides and support staff', icon: '🧑‍💼' },
              { title: '24/7 Support', description: 'Always here to help your journey', icon: '📱' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all text-center">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOP DESTINATIONS CAROUSEL - Admin Controlled */}
      {topDestinations.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16">Best Top Rated Locations</h2>
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {topDestinations.slice(destCarouselIndex, destCarouselIndex + 3).map((dest, idx) => (
                  <div key={idx} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-2">
                    <div className="relative h-64 overflow-hidden">
                      <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold mb-2">{dest.name}</h3>
                      <p className="text-gray-600 mb-4">{dest.description}</p>
                      <p className="text-sm text-blue-600 font-semibold">👥 {dest.customersCount} customers visited</p>
                    </div>
                  </div>
                ))}
              </div>
              {topDestinations.length > 3 && (
                <div className="flex gap-4 mt-8 justify-center">
                  <button
                    onClick={() => scrollDestinations('prev')}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-all"
                  >
                    <FiChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => scrollDestinations('next')}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-all"
                  >
                    <FiChevronRight className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CATEGORY CARDS - Admin Controlled */}
      {categoryCards.length > 0 && (
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16">Explore Top Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categoryCards.map((card) => (
                <div key={card._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-2">
                  <div className="relative h-56 overflow-hidden">
                    <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-2">{card.name}</h3>
                    <p className="text-gray-600 mb-6">{card.description}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/packages?category=${card.packageCategory}`)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-all"
                      >
                        Get Details
                      </button>
                      <button
                        onClick={() => navigate('/contact')}
                        className="flex-1 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-2 rounded-lg font-semibold transition-all"
                      >
                        Enquire
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* OWNER PORTFOLIO - Admin Controlled */}
      {ownerPortfolio && (
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16">About Our Founder</h2>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center p-8 md:p-12">
                {ownerPortfolio.profileImage && (
                  <div className="md:col-span-1">
                    <img
                      src={ownerPortfolio.profileImage}
                      alt={ownerPortfolio.ownerName}
                      className="w-64 h-64 mx-auto rounded-lg shadow-lg object-cover"
                    />
                  </div>
                )}
                <div className={ownerPortfolio.profileImage ? 'md:col-span-2' : 'md:col-span-3'}>
                  <h3 className="text-3xl font-bold mb-2">{ownerPortfolio.ownerName}</h3>
                  <p className="text-blue-600 font-semibold mb-4 text-lg">{ownerPortfolio.designation}</p>
                  <p className="text-gray-700 mb-6 leading-relaxed text-lg">{ownerPortfolio.bio}</p>
                  {ownerPortfolio.socialLinks && (
                    <div className="flex gap-4">
                      {ownerPortfolio.socialLinks.facebook && (
                        <a href={ownerPortfolio.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-3xl">
                          f
                        </a>
                      )}
                      {ownerPortfolio.socialLinks.instagram && (
                        <a href={ownerPortfolio.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800 text-3xl">
                          📷
                        </a>
                      )}
                      {ownerPortfolio.socialLinks.linkedin && (
                        <a href={ownerPortfolio.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900 text-3xl">
                          in
                        </a>
                      )}
                      {ownerPortfolio.socialLinks.whatsapp && (
                        <a href={`https://wa.me/${ownerPortfolio.socialLinks.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 text-3xl">
                          💬
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA SECTION */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready for Your Next Adventure?</h2>
          <p className="text-xl mb-8 text-blue-100">Book your dream trip today and create unforgettable memories</p>
          <Link
            to="/packages"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg"
          >
            Browse Packages
          </Link>
        </div>
      </section>

      {/* USER REVIEWS SECTION */}
      <section className="py-12 md:py-16 bg-white border-t">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <ReviewsDisplay refreshTrigger={reviewRefreshTrigger} />
          </div>

          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {showReviewForm ? 'Hide Form' : 'Write Review'}
            </button>
          </div>

          {showReviewForm && (
            <div className="max-w-2xl mx-auto">
              <ReviewForm
                onReviewSubmitted={() => {
                  setReviewRefreshTrigger(prev => prev + 1)
                  setShowReviewForm(false)
                }}
                onClose={() => setShowReviewForm(false)}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
