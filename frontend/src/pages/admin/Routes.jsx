import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const Routes = () => {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    source: '',
    destination: '',
    distance: '',
    duration: '',
    highlights: [],
    image: '',
    description: ''
  })

  useEffect(() => {
    fetchRoutes()
  }, [])

  const fetchRoutes = async () => {
    try {
      const response = await api.get('/routes')
      if (response.data.success) {
        setRoutes(response.data.routes)
      }
    } catch (error) {
      toast.error('Failed to load routes')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/routes', formData)
      toast.success('Route created successfully')
      setShowForm(false)
      setFormData({
        name: '',
        source: '',
        destination: '',
        distance: '',
        duration: '',
        highlights: [],
        image: '',
        description: ''
      })
      fetchRoutes()
    } catch (error) {
      toast.error('Failed to create route')
    }
  }

  const handleDelete = async (routeId) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return

    try {
      await api.delete(`/routes/${routeId}`)
      toast.success('Route deleted successfully')
      fetchRoutes()
    } catch (error) {
      toast.error('Failed to delete route')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Manage Routes</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Add Route
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Add Route</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">Route Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Source</label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Destination</label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Distance</label>
                  <input
                    type="text"
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Image URL</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.map((route) => (
              <div key={route._id} className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-2">{route.name}</h3>
                <p className="text-gray-600 mb-2">
                  {route.source} → {route.destination}
                </p>
                {route.distance && <p className="text-sm text-gray-500">Distance: {route.distance}</p>}
                {route.duration && <p className="text-sm text-gray-500">Duration: {route.duration}</p>}
                <button
                  onClick={() => handleDelete(route._id)}
                  className="mt-4 text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Routes
