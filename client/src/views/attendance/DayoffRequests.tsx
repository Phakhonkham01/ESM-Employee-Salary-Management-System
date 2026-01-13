import React, { useState, useEffect } from 'react'
import { FaPlus, FaTimes, FaCheck, FaEdit, FaTrash, FaUmbrellaBeach, FaEye } from "react-icons/fa"
import { getAllUsers } from '../../services/Create_user/api'
import type { UserData } from '../../services/Create_user/api'
import { 
  getAllDayOffRequests, 
  createDayOffRequest, 
  updateDayOffStatus,
  type DayOffRequest,
  type CreateDayOffRequestPayload 
} from '@/services/Day_off_api/api'

type DayOffType = 'FULL_DAY' | 'HALF_DAY'
type RequestStatus = 'Pending' | 'Accept' | 'Reject'

const DayoffRequests: React.FC = () => {
  const [requests, setRequests] = useState<DayOffRequest[]>([])
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<DayOffRequest | null>(null)

  const [formData, setFormData] = useState({
    employee_id: '',
    supervisor_id: '',
    day_off_type: 'FULL_DAY' as DayOffType,
    start_date_time: '',
    end_date_time: '',
    title: '',
  })

  useEffect(() => {
    loadUsers()
    loadDayOffRequests()
  }, [])

  const loadUsers = async () => {
    try {
      const userData = await getAllUsers()
      setUsers(userData.users)
    } catch (error) {
      console.error('Error loading users:', error)
      alert('Failed to load users')
    }
  }

  const loadDayOffRequests = async () => {
    try {
      setLoading(true)
      const res = await getAllDayOffRequests()
      setRequests(res.requests)
    } catch (error) {
      console.error('Error loading day off requests:', error)
      alert('Failed to load day off requests')
    } finally {
      setLoading(false)
    }
  }

  const calculateDaysOff = (start: string, end: string, type: DayOffType): number => {
    if (!start || !end) return 0
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return type === 'HALF_DAY' ? diffDays * 0.5 : diffDays
  }

  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.supervisor_id || !formData.title ||
      !formData.start_date_time || !formData.end_date_time) {
      alert('Please fill in all required fields')
      return
    }

    const daysOff = calculateDaysOff(
      formData.start_date_time,
      formData.end_date_time,
      formData.day_off_type
    )

    const payload: CreateDayOffRequestPayload = {
      user_id: formData.employee_id,
      supervisor_id: formData.supervisor_id,
      employee_id: formData.employee_id,
      day_off_type: formData.day_off_type,
      start_date_time: new Date(formData.start_date_time).toISOString(),
      end_date_time: new Date(formData.end_date_time).toISOString(),
      date_off_number: daysOff,
      title: formData.title,
    }

    try {
      setLoading(true)
      await createDayOffRequest(payload)
      alert('Day off request created successfully!')
      setShowModal(false)
      resetForm()
      await loadDayOffRequests()
    } catch (error) {
      console.error('Error creating request:', error)
      alert('Failed to create day off request')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      employee_id: '',
      supervisor_id: '',
      day_off_type: 'FULL_DAY',
      start_date_time: '',
      end_date_time: '',
      title: ''
    })
  }

  const handleStatusChange = async (requestId: string, newStatus: 'Accept' | 'Reject') => {
    try {
      setLoading(true)
      await updateDayOffStatus(requestId, newStatus)
      alert(`Request ${newStatus.toLowerCase()}ed successfully!`)
      await loadDayOffRequests()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update request status')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (request: DayOffRequest) => {
    setSelectedRequest(request)
    setShowModal(true)
    // Populate form with existing data
    setFormData({
      employee_id: typeof request.employee_id === 'object' ? request.employee_id._id : request.employee_id || request.user_id._id,
      supervisor_id: typeof request.supervisor_id === 'object' ? request.supervisor_id._id : request.supervisor_id,
      day_off_type: request.day_off_type,
      start_date_time: new Date(request.start_date_time).toISOString().slice(0, 16),
      end_date_time: new Date(request.end_date_time).toISOString().slice(0, 16),
      title: request.title,
    })
  }

  const getUserName = (userRef: any) => {
    if (!userRef) return 'Unknown User'
    if (typeof userRef === 'object' && userRef.name) {
      return userRef.name
    }
    if (typeof userRef === 'object' && userRef.email) {
      return userRef.email
    }
    const userId = typeof userRef === 'string' ? userRef : userRef._id
    const user = users.find(u => u._id === userId)
    return user ? `${user.first_name_en} ${user.last_name_en}` : 'Unknown User'
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Accept': return 'bg-green-100 text-green-800'
      case 'Reject': return 'bg-red-100 text-red-800'
    }
  }

  const calculatedDaysOff = calculateDaysOff(
    formData.start_date_time,
    formData.end_date_time,
    formData.day_off_type
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-400 rounded-lg flex items-center justify-center">
              <FaUmbrellaBeach className="text-white text-lg" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Day Off Requests</h1>
          </div>
          <button
            onClick={() => {
              setSelectedRequest(null)
              resetForm()
              setShowModal(true)
            }}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm"
          >
            <FaPlus /> New Request
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Supervisor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Start date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">End date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Days</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && requests.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500 text-sm">
                      Loading...
                    </td>
                  </tr>
                ) : requests.map((request) => {
                  const isDisabled = request.status === 'Reject' || request.status === 'Accept'
                  return (
                    <tr key={request._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3.5 text-gray-900 text-sm whitespace-nowrap">{getUserName(request.employee_id || request.user_id)}</td>
                      <td className="px-4 py-3.5 text-gray-900 text-sm whitespace-nowrap">{getUserName(request.supervisor_id)}</td>
                      <td className="px-4 py-3.5 text-gray-900 font-medium text-sm whitespace-nowrap">{request.day_off_type}</td>
                      <td className="px-4 py-3.5 text-gray-900 text-sm whitespace-nowrap">{formatDate(request.start_date_time)}</td>
                      <td className="px-4 py-3.5 text-gray-900 text-sm whitespace-nowrap">{formatDate(request.end_date_time)}</td>
                      <td className="px-4 py-3.5 text-gray-900 font-semibold text-sm whitespace-nowrap">{request.date_off_number}</td>
                      <td className="px-4 py-3.5 text-gray-900 text-sm whitespace-nowrap">{request.title}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-md text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(request)
                              setShowDetailModal(true)
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition bg-gray-600 text-white hover:bg-gray-700"
                          >
                            <FaEye className="text-xs" /> Detail
                          </button>
                          <button
                            onClick={() => handleEdit(request)}
                            disabled={loading || isDisabled}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                              isDisabled 
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            <FaEdit className="text-xs" /> Edit
                          </button>
                          <button
                            onClick={() => handleStatusChange(request._id, 'Reject')}
                            disabled={loading || isDisabled}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                              isDisabled
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                          >
                            <FaTrash className="text-xs" /> Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {!loading && requests.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No requests found
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">
                {selectedRequest ? 'Edit Day Off Request' : 'New Day Off Request'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                  setSelectedRequest(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Employee *</label>
                  <select
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Employee</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.first_name_en} {user.last_name_en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Supervisor *</label>
                  <select
                    value={formData.supervisor_id}
                    onChange={(e) => setFormData({ ...formData, supervisor_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Supervisor</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.first_name_en} {user.last_name_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Family Vacation"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Day Off Type *</label>
                <select
                  value={formData.day_off_type}
                  onChange={(e) => setFormData({ ...formData, day_off_type: e.target.value as DayOffType })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="FULL_DAY">FULL_DAY</option>
                  <option value="HALF_DAY">HALF_DAY</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_date_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date_time: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end_date_time}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date_time: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {formData.start_date_time && formData.end_date_time && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Days Off</p>
                      <p className="text-4xl font-bold text-blue-600">{calculatedDaysOff}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {formData.day_off_type === 'FULL_DAY' ? '1 day per calendar day' : '0.5 days per calendar day'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">From</p>
                      <p className="font-semibold text-gray-900">{new Date(formData.start_date_time).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600 mt-2">To</p>
                      <p className="font-semibold text-gray-900">{new Date(formData.end_date_time).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 justify-end pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                    setSelectedRequest(null)
                  }}
                  disabled={loading}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : selectedRequest ? 'Update Request' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Request Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-500">Employee</label>
                  <p className="text-gray-900 mt-1">{getUserName(selectedRequest.employee_id || selectedRequest.user_id)}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">Supervisor</label>
                  <p className="text-gray-900 mt-1">{getUserName(selectedRequest.supervisor_id)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500">Reason</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">{selectedRequest.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-500">Day Off Type</label>
                  <p className="text-gray-900 mt-1">{selectedRequest.day_off_type}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">Total Days</label>
                  <p className="text-gray-900 font-semibold mt-1">{selectedRequest.date_off_number} days</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-500">Start Date & Time</label>
                  <p className="text-gray-900 mt-1">{formatDateTime(selectedRequest.start_date_time)}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">End Date & Time</label>
                  <p className="text-gray-900 mt-1">{formatDateTime(selectedRequest.end_date_time)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500">Current Status</label>
                <div className="mt-2">
                  <span className={`px-4 py-2 rounded-lg text-sm font-medium ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DayoffRequests