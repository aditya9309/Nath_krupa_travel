import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FiCalendar, FiMap, FiUser, FiPlus } from 'react-icons/fi'

const Dashboard = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Welcome, {user?.name}!</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            to="/book"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-2"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-primary-100 p-4 rounded-lg">
                <FiPlus className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">New Booking</h3>
                <p className="text-gray-600">Book a new trip</p>
              </div>
            </div>
          </Link>

          <Link
            to="/my-bookings"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-2"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-4 rounded-lg">
                <FiCalendar className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">My Bookings</h3>
                <p className="text-gray-600">View booking history</p>
              </div>
            </div>
          </Link>

          <Link
            to="/custom-trip"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-2"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-4 rounded-lg">
                <FiMap className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Custom Trip</h3>
                <p className="text-gray-600">Request custom trip</p>
              </div>
            </div>
          </Link>

          <Link
            to="/profile"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-2"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-4 rounded-lg">
                <FiUser className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Profile</h3>
                <p className="text-gray-600">Manage profile</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/packages"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 transition text-center"
            >
              Browse Packages
            </Link>
            <Link
              to="/routes"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 transition text-center"
            >
              Explore Routes
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
