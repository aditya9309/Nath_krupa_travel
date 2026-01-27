import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import { FiUsers, FiCalendar, FiMap, FiDollarSign, FiTrendingUp, FiActivity } from 'react-icons/fi'
import { DashboardStatsSkeleton } from '../../components/SkeletonLoader'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats')
      if (response.data.success) {
        setStats(response.data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
          <DashboardStatsSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.bookings?.total || 0}</p>
                <p className="text-sm text-green-600 mt-2">{stats?.bookings?.confirmed || 0} confirmed</p>
              </div>
              <FiCalendar className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Daily Revenue</p>
                <p className="text-3xl font-bold text-gray-900">₹{stats?.revenue?.daily?.toLocaleString() || 0}</p>
                <p className="text-sm text-gray-500 mt-2">Total: ₹{stats?.revenue?.total?.toLocaleString() || 0}</p>
              </div>
              <FiDollarSign className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Active Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.users?.active || 0}</p>
                <p className="text-sm text-gray-500 mt-2">Total: {stats?.users?.total || 0}</p>
              </div>
              <FiActivity className="w-12 h-12 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Popular Trips</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.popularTrips?.length || 0}</p>
                <p className="text-sm text-gray-500 mt-2">Top packages</p>
              </div>
              <FiTrendingUp className="w-12 h-12 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Popular Trips Section */}
        {stats?.popularTrips && stats.popularTrips.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Popular Trips</h2>
            <div className="space-y-3">
              {stats.popularTrips.map((trip, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{trip.title}</p>
                    <p className="text-sm text-gray-600">{trip.bookings} bookings</p>
                  </div>
                  <Link
                    to={`/admin/packages`}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/admin/users"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-2"
          >
            <h3 className="text-xl font-semibold mb-2">Manage Users</h3>
            <p className="text-gray-600">View and manage user accounts</p>
          </Link>

          <Link
            to="/admin/bookings"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-2"
          >
            <h3 className="text-xl font-semibold mb-2">Manage Bookings</h3>
            <p className="text-gray-600">View and manage all bookings</p>
          </Link>

          <Link
            to="/admin/trip-requests"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-2"
          >
            <h3 className="text-xl font-semibold mb-2">Trip Requests</h3>
            <p className="text-gray-600">Review custom trip requests</p>
          </Link>

          <Link
            to="/admin/packages"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-2"
          >
            <h3 className="text-xl font-semibold mb-2">Manage Packages</h3>
            <p className="text-gray-600">Add and edit travel packages</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
