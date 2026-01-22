import { useState } from 'react'
import { FiX } from 'react-icons/fi'

const GroupTourForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    destinations: [],
    groupSize: 0,
    pricePerPerson: 0,
    departureDates: [],
    inclusions: [],
    galleryImages: []
  })

  const [newDestination, setNewDestination] = useState('')
  const [newDepartureDate, setNewDepartureDate] = useState('')
  const [newInclusion, setNewInclusion] = useState('')

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

  const handleAddDepartureDate = () => {
    if (newDepartureDate) {
      setFormData(prev => ({
        ...prev,
        departureDates: [...(prev.departureDates || []), newDepartureDate]
      }))
      setNewDepartureDate('')
    }
  }

  const handleRemoveDepartureDate = (index) => {
    setFormData(prev => ({
      ...prev,
      departureDates: (prev.departureDates || []).filter((_, i) => i !== index)
    }))
  }

  const handleAddInclusion = () => {
    if (newInclusion.trim()) {
      setFormData(prev => ({
        ...prev,
        inclusions: [...(prev.inclusions || []), newInclusion]
      }))
      setNewInclusion('')
    }
  }

  const handleRemoveInclusion = (index) => {
    setFormData(prev => ({
      ...prev,
      inclusions: (prev.inclusions || []).filter((_, i) => i !== index)
    }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Size') || name.includes('Price') ? parseInt(value) : value
    }))
  }

  return (
    <div className="bg-white rounded-lg p-6 border-2 border-purple-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Group Tour Package</h3>
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
            placeholder="e.g., Family Outing Package"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
            />
            <button
              type="button"
              onClick={handleAddDestination}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(formData.destinations || []).map((dest, i) => (
              <span key={i} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                {dest}
                <button
                  type="button"
                  onClick={() => handleRemoveDestination(i)}
                  className="text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Group Size (min)</label>
            <input
              type="number"
              name="groupSize"
              value={formData.groupSize}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Price per Person (₹)</label>
            <input
              type="number"
              name="pricePerPerson"
              value={formData.pricePerPerson}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Departure Dates</label>
          <div className="flex gap-2 mb-2">
            <input
              type="date"
              value={newDepartureDate}
              onChange={(e) => setNewDepartureDate(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
            />
            <button
              type="button"
              onClick={handleAddDepartureDate}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(formData.departureDates || []).map((date, i) => (
              <span key={i} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                {new Date(date).toLocaleDateString()}
                <button
                  type="button"
                  onClick={() => handleRemoveDepartureDate(i)}
                  className="text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Inclusions</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newInclusion}
              onChange={(e) => setNewInclusion(e.target.value)}
              placeholder="e.g., Accommodation, Meals, Transport"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
            />
            <button
              type="button"
              onClick={handleAddInclusion}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(formData.inclusions || []).map((inc, i) => (
              <span key={i} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                {inc}
                <button
                  type="button"
                  onClick={() => handleRemoveInclusion(i)}
                  className="text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => onSubmit(formData)}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
          >
            Save Group Tour
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

export default GroupTourForm
