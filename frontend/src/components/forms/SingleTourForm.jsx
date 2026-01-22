import { useState } from 'react'
import { FiX } from 'react-icons/fi'

const SingleTourForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    destinations: [],
    duration: { days: 1, nights: 0 },
    basePrice: 0,
    pickupLocation: '',
    itinerary: [],
    galleryImages: []
  })

  const [newDestination, setNewDestination] = useState('')

  const handleAddDestination = () => {
    if (newDestination.trim()) {
      setFormData(prev => ({
        ...prev,
        destinations: [...(prev.destinations || []), newDestination]
      }))
      setNewDestination('')
    }
  }

  const handleRemoveDestination = (index) => {
    setFormData(prev => ({
      ...prev,
      destinations: (prev.destinations || []).filter((_, i) => i !== index)
    }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="bg-white rounded-lg p-6 border-2 border-blue-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Single Tour Package</h3>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <FiX className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Package Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Goa Beach Escape"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Destinations (Multi-select)</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newDestination}
              onChange={(e) => setNewDestination(e.target.value)}
              placeholder="Enter destination"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="button"
              onClick={handleAddDestination}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(formData.destinations || []).map((dest, i) => (
              <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                {dest}
                <button
                  type="button"
                  onClick={() => handleRemoveDestination(i)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Days</label>
            <input
              type="number"
              name="days"
              value={formData.duration?.days || 1}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                duration: { ...prev.duration, days: parseInt(e.target.value) }
              }))}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Price (₹)</label>
            <input
              type="number"
              name="basePrice"
              value={formData.basePrice}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Pickup City</label>
          <input
            type="text"
            name="pickupLocation"
            value={formData.pickupLocation}
            onChange={handleChange}
            placeholder="e.g., Mumbai"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => onSubmit(formData)}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
          >
            Save Single Tour
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default SingleTourForm
