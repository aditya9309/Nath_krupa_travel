import { useEffect, useState } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { FiFacebook, FiInstagram, FiLinkedin, FiTwitter, FiMessageCircle } from 'react-icons/fi'

export default function About() {
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPortfolio()
  }, [])

  const fetchPortfolio = async () => {
    try {
      const response = await api.get('/home/owner-portfolio')
      if (response.data.success && response.data.portfolio) {
        setPortfolio(response.data.portfolio)
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading about page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-white">
      {/* OWNER PORTFOLIO SECTION - Immediately After Navbar */}
      {portfolio && (
        <section className="bg-gradient-to-br from-primary-50 via-white to-blue-50 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Meet Our Founder</h2>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center p-8 md:p-12">
                {portfolio.profileImage && (
                  <div className="md:col-span-1">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-blue-400 rounded-xl blur opacity-20"></div>
                      <img
                        src={portfolio.profileImage}
                        alt={portfolio.ownerName}
                        className="relative w-full rounded-xl shadow-lg object-cover aspect-square"
                      />
                    </div>
                  </div>
                )}
                <div className={portfolio.profileImage ? 'md:col-span-2' : 'md:col-span-3'}>
                  <h3 className="text-4xl font-bold text-gray-900 mb-2">{portfolio.ownerName}</h3>
                  <p className="text-xl text-primary-600 font-semibold mb-6 inline-block px-4 py-2 bg-primary-50 rounded-lg">
                    {portfolio.designation}
                  </p>
                  <p className="text-gray-700 text-lg leading-relaxed mb-8">{portfolio.bio}</p>
                  
                  {/* Social Links */}
                  {portfolio.socialLinks && (
                    <div className="flex gap-4 flex-wrap">
                      {portfolio.socialLinks.facebook && (
                        <a
                          href={portfolio.socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110"
                          title="Facebook"
                        >
                          <FiFacebook className="w-5 h-5" />
                        </a>
                      )}
                      {portfolio.socialLinks.instagram && (
                        <a
                          href={portfolio.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-600 hover:text-white transition-all transform hover:scale-110"
                          title="Instagram"
                        >
                          <FiInstagram className="w-5 h-5" />
                        </a>
                      )}
                      {portfolio.socialLinks.twitter && (
                        <a
                          href={portfolio.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white transition-all transform hover:scale-110"
                          title="Twitter"
                        >
                          <FiTwitter className="w-5 h-5" />
                        </a>
                      )}
                      {portfolio.socialLinks.linkedin && (
                        <a
                          href={portfolio.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-700 hover:text-white transition-all transform hover:scale-110"
                          title="LinkedIn"
                        >
                          <FiLinkedin className="w-5 h-5" />
                        </a>
                      )}
                      {portfolio.socialLinks.whatsapp && (
                        <a
                          href={`https://wa.me/${portfolio.socialLinks.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all transform hover:scale-110"
                          title="WhatsApp"
                        >
                          <FiMessageCircle className="w-5 h-5" />
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

      {/* HERO SECTION */}
      <section className="relative min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-blue-50 opacity-90"></div>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center py-20">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">About Nath Krupa Travels</h1>
          <p className="text-xl md:text-2xl text-gray-700 font-medium">
            Crafting Unforgettable Journey Experiences Across India & Beyond
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* MISSION SECTION */}
        <section className="mb-20">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 md:p-12 border border-blue-100">
            <div className="max-w-3xl">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                At Nath Krupa Travels, we're committed to transforming the way you explore the world. We believe that travel should be accessible, affordable, and truly unforgettable. With our expertly curated collection of packages and dedicated team, we help you discover hidden gems and create memories that last a lifetime.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                From peaceful domestic getaways to thrilling international adventures, spiritual pilgrimages to educational tours, we have carefully crafted experiences for everyone. Our unwavering commitment to quality service, transparent pricing, and exceptional customer satisfaction sets us apart in the travel industry.
              </p>
            </div>
          </div>
        </section>

        {/* CORE VALUES SECTION */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border-l-4 border-blue-600 hover:shadow-lg transition-all">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">🎯 Customer First</h3>
              <p className="text-gray-700 leading-relaxed">Your satisfaction is our top priority. We go the extra mile to ensure every trip is perfect and every traveler leaves with unforgettable memories.</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 border-l-4 border-green-600 hover:shadow-lg transition-all">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">⭐ Quality Service</h3>
              <p className="text-gray-700 leading-relaxed">We maintain the highest standards in accommodation, transportation, and guided experiences, ensuring excellence in every detail.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8 border-l-4 border-purple-600 hover:shadow-lg transition-all">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">💎 Transparency</h3>
              <p className="text-gray-700 leading-relaxed">Honest pricing and clear communication - we believe in no hidden charges or surprises, just straightforward and ethical business practices.</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-8 border-l-4 border-orange-600 hover:shadow-lg transition-all">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">🚀 Innovation</h3>
              <p className="text-gray-700 leading-relaxed">Continuously evolving to offer unique experiences and advanced booking technology that makes travel planning effortless.</p>
            </div>
          </div>
        </section>

        {/* TRUST & STATS SECTION */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Why Choose Nath Krupa Travels</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl text-center hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Award Winning</h3>
              <p className="text-gray-700 text-sm">Recognized for excellence in travel services and customer satisfaction</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl text-center hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="text-5xl mb-4">✈️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">50+ Destinations</h3>
              <p className="text-gray-700 text-sm">Carefully curated packages across India and destinations worldwide</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-xl text-center hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">10,000+ Customers</h3>
              <p className="text-gray-700 text-sm">Happy travelers who trust us with their precious vacations</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-xl text-center hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="text-5xl mb-4">📞</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-700 text-sm">Round-the-clock assistance for all your travel needs</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
