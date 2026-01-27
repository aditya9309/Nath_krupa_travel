import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { FiX, FiTrash2, FiEye, FiLock, FiUnlock } from 'react-icons/fi'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', search: '' })
  
  // Modal states
  const [blockModal, setBlockModal] = useState({ isOpen: false, userId: null, reason: '' })
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null })
  const [activityModal, setActivityModal] = useState({ isOpen: false, activity: null })
  const [blockAction, setBlockAction] = useState('block') // block or unblock
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [filters])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)

      const response = await api.get(`/admin/users?${params.toString()}`)
      if (response.data.success) {
        setUsers(response.data.users)
      }
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleViewActivity = async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}/activity`)
      if (response.data.success) {
        setActivityModal({ isOpen: true, activity: response.data.activity })
      }
    } catch (error) {
      toast.error('Failed to load activity')
    }
  }

  const handleBlockClick = (userId, isCurrentlyBlocked) => {
    setBlockAction(isCurrentlyBlocked ? 'unblock' : 'block')
    setBlockModal({ isOpen: true, userId, reason: '' })
  }

  const handleBlockSubmit = async () => {
    if (blockAction === 'block' && !blockModal.reason.trim()) {
      toast.error('Please provide a reason for blocking')
      return
    }

    setSubmitting(true)
    try {
      const response = await api.put(`/admin/users/${blockModal.userId}/toggle-block`, {
        reason: blockModal.reason
      })
      if (response.data.success) {
        toast.success(`User ${blockAction}ed successfully`)
        setBlockModal({ isOpen: false, userId: null, reason: '' })
        fetchUsers()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClick = (userId) => {
    setDeleteModal({ isOpen: true, userId })
  }

  const handleDeleteSubmit = async () => {
    setSubmitting(true)
    try {
      const response = await api.delete(`/admin/users/${deleteModal.userId}`)
      if (response.data.success) {
        toast.success('User deleted successfully')
        setDeleteModal({ isOpen: false, userId: null })
        fetchUsers()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Manage Users</h1>

        {/* FILTERS */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="">All Users ({users.length})</option>
            <option value="blocked">Blocked</option>
            <option value="active">Active</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No users found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Last Login</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.createdAt ? new Date(user.createdAt).toLocaleTimeString('en-IN') : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('en-IN') : 'Never'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleTimeString('en-IN') : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                            <FiLock className="w-3 h-3" />
                            Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                            ✓ Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewActivity(user._id)}
                            title="View Activity"
                            className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition-colors"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleBlockClick(user._id, user.isBlocked)}
                            title={user.isBlocked ? 'Unblock' : 'Block'}
                            className={`p-2 rounded transition-colors ${
                              user.isBlocked
                                ? 'text-green-600 hover:text-green-800 hover:bg-green-50'
                                : 'text-orange-600 hover:text-orange-800 hover:bg-orange-50'
                            }`}
                          >
                            {user.isBlocked ? (
                              <FiUnlock className="w-4 h-4" />
                            ) : (
                              <FiLock className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user._id)}
                            title="Delete User"
                            className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ACTIVITY MODAL */}
      {activityModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold">User Activity</h3>
              <button
                onClick={() => setActivityModal({ isOpen: false, activity: null })}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-2"><strong>Joined:</strong></p>
                <p className="text-lg font-semibold text-blue-600">
                  {activityModal.activity?.joinedDate 
                    ? new Date(activityModal.activity.joinedDate).toLocaleDateString('en-IN')
                    : 'N/A'}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-2"><strong>Last Login:</strong></p>
                <p className="text-lg font-semibold text-green-600">
                  {activityModal.activity?.lastLogin
                    ? new Date(activityModal.activity.lastLogin).toLocaleDateString('en-IN')
                    : 'Never'}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-2"><strong>Total Bookings:</strong></p>
                <p className="text-lg font-semibold text-purple-600">{activityModal.activity?.bookingsCount || 0}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-2"><strong>Trip Requests:</strong></p>
                <p className="text-lg font-semibold text-orange-600">{activityModal.activity?.tripRequestsCount || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BLOCK/UNBLOCK MODAL */}
      {blockModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b bg-orange-50">
              <h3 className="text-xl font-bold">
                {blockAction === 'block' ? 'Block User' : 'Unblock User'}
              </h3>
              <button
                onClick={() => setBlockModal({ isOpen: false, userId: null, reason: '' })}
                disabled={submitting}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {blockAction === 'block' && (
                <>
                  <p className="text-gray-700 text-sm">
                    This user will be unable to access their account. Provide a reason for this action.
                  </p>
                  <textarea
                    value={blockModal.reason}
                    onChange={(e) => setBlockModal({ ...blockModal, reason: e.target.value })}
                    placeholder="Reason for blocking (e.g., Suspicious activity, Violation of terms, etc.)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent resize-none h-24"
                    disabled={submitting}
                  />
                </>
              )}
              {blockAction === 'unblock' && (
                <p className="text-gray-700 text-sm">
                  This user will regain access to their account. Are you sure?
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setBlockModal({ isOpen: false, userId: null, reason: '' })}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlockSubmit}
                  disabled={submitting}
                  className={`flex-1 px-4 py-2 rounded-lg text-white font-semibold transition-all disabled:opacity-50 ${
                    blockAction === 'block'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {submitting ? 'Processing...' : blockAction === 'block' ? 'Block User' : 'Unblock User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b bg-red-50">
              <h3 className="text-xl font-bold text-red-700">Delete User</h3>
              <button
                onClick={() => setDeleteModal({ isOpen: false, userId: null })}
                disabled={submitting}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700 font-semibold">⚠️ Warning</p>
              <p className="text-gray-700 text-sm">
                This action is <strong>permanent</strong> and cannot be undone. The user and all their associated data (bookings, trip requests, etc.) will be deleted.
              </p>
              <p className="text-gray-700 text-sm">
                Are you absolutely sure you want to delete this user?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ isOpen: false, userId: null })}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSubmit}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
                >
                  {submitting ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
