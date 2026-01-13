import React, { useState, useEffect } from 'react'
import { FaRegEye, FaPlus, FaCalendarAlt, FaClock, FaUserCheck, FaTimes, FaCheck, FaFilter } from "react-icons/fa"
import { getAllUsers } from '../../services/Create_user/api'
import type { UserData } from '../../services/Create_user/api'

type DayOffType = 'Full day' | 'Half day'
type RequestStatus = 'Pending' | 'Accept' | 'Reject'

interface DayOffRequest {
  id: number
  user_id: number
  supervisor_id: number
  employee_id: number
  day_off_type: DayOffType
  start_date_time: string
  end_date_time: string
  date_off_number: number
  title: string
  status: RequestStatus
  created_at: string
}

const DayoffRequests: React.FC = () => {
  const [requests, setRequests] = useState<DayOffRequest[]>([])
  const [users, setUsers] = useState<UserData[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<DayOffRequest | null>(null)
  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'All'>('All')
  const [searchTerm, setSearchTerm] = useState('')
  
  const [formData, setFormData] = useState({
    employee_id: '',
    supervisor_id: '',
    day_off_type: 'Full day' as DayOffType,
    start_date_time: '',
    end_date_time: '',
    title: ''
  })

  useEffect(() => {
    loadUsers()
    loadMockRequests()
  }, [])

  const loadUsers = async () => {
    try {
      const userData = await getAllUsers()
      setUsers(userData.users)
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadMockRequests = () => {
    const mockRequests: DayOffRequest[] = [
      {
        id: 1,
        user_id: 1,
        supervisor_id: 2,
        employee_id: 1,
        day_off_type: 'Full day',
        start_date_time: '2026-01-20',
        end_date_time: '2026-01-22',
        date_off_number: 3,
        title: 'Family Vacation',
        status: 'Pending',
        created_at: '2026-01-10'
      },
      {
        id: 2,
        user_id: 3,
        supervisor_id: 2,
        employee_id: 3,
        day_off_type: 'Half day',
        start_date_time: '2026-01-15',
        end_date_time: '2026-01-15',
        date_off_number: 0.5,
        title: 'Medical Appointment',
        status: 'Accept',
        created_at: '2026-01-05'
      },
      {
        id: 3,
        user_id: 4,
        supervisor_id: 2,
        employee_id: 4,
        day_off_type: 'Full day',
        start_date_time: '2026-01-18',
        end_date_time: '2026-01-19',
        date_off_number: 2,
        title: 'Personal Matter',
        status: 'Reject',
        created_at: '2026-01-08'
      }
    ]
    setRequests(mockRequests)
  }

  const calculateDaysOff = (start: string, end: string, type: DayOffType): number => {
    if (!start || !end) return 0
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return type === 'Half day' ? diffDays * 0.5 : diffDays
  }

  const handleSubmit = () => {
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

    const newRequest: DayOffRequest = {
      id: requests.length + 1,
      user_id: parseInt(formData.employee_id),
      supervisor_id: parseInt(formData.supervisor_id),
      employee_id: parseInt(formData.employee_id),
      day_off_type: formData.day_off_type,
      start_date_time: formData.start_date_time,
      end_date_time: formData.end_date_time,
      date_off_number: daysOff,
      title: formData.title,
      status: 'Pending',
      created_at: new Date().toISOString().split('T')[0]
    }

    setRequests([newRequest, ...requests])
    setShowModal(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      employee_id: '',
      supervisor_id: '',
      day_off_type: 'Full day',
      start_date_time: '',
      end_date_time: '',
      title: '',
    })
  }

  const handleStatusChange = (id: number, newStatus: RequestStatus) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: newStatus } : req
    ))
    setShowDetailModal(false)
  }

  const getUserName = (userId: number) => {
    const user = users.find(u => u._id === userId.toString())
    return user ? `${user.first_name_en} ${user.last_name_en}` : `User ${userId}`
  }

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Accept': return 'bg-green-100 text-green-800'
      case 'Reject': return 'bg-red-100 text-red-800'
    }
  }

  const filteredRequests = requests.filter(req => {
    const matchesStatus = filterStatus === 'All' || req.status === filterStatus
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Day Off Requests</h1>
            <p className="text-gray-600 mt-1">Manage employee time off requests</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            <FaPlus /> New Request
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search by title or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as RequestStatus | 'All')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Accept">Accepted</option>
                <option value="Reject">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Employee</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Dates</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Days</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{getUserName(request.employee_id)}</div>
                    <div className="text-sm text-gray-500">Supervisor: {getUserName(request.supervisor_id)}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{request.title}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                      <FaClock className="text-gray-500" />
                      {request.day_off_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="flex items-center gap-1">
                      <FaCalendarAlt className="text-gray-500" />
                      {request.start_date_time} to {request.end_date_time}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">{request.date_off_number}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedRequest(request)
                        setShowDetailModal(true)
                      }}
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      <FaRegEye className="text-xl" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRequests.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No requests found
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">New Day Off Request</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee *</label>
                  <select
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supervisor *</label>
                  <select
                    value={formData.supervisor_id}
                    onChange={(e) => setFormData({ ...formData, supervisor_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Day Off Type</label>
                <select
                  value={formData.day_off_type}
                  onChange={(e) => setFormData({ ...formData, day_off_type: e.target.value as DayOffType })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Full day">Full Day</option>
                  <option value="Half day">Half Day</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Family Vacation"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={formData.start_date_time}
                    onChange={(e) => setFormData({ ...formData, start_date_time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                  <input
                    type="date"
                    value={formData.end_date_time}
                    onChange={(e) => setFormData({ ...formData, end_date_time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {formData.start_date_time && formData.end_date_time && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Total Days Off:</strong> {calculateDaysOff(formData.start_date_time, formData.end_date_time, formData.day_off_type)} days
                  </p>
                </div>
              )}

              <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Request Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Employee</label>
                  <p className="text-gray-900">{getUserName(selectedRequest.employee_id)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Supervisor</label>
                  <p className="text-gray-900">{getUserName(selectedRequest.supervisor_id)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Title</label>
                <p className="text-lg font-semibold text-gray-900">{selectedRequest.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Day Off Type</label>
                  <p className="text-gray-900">{selectedRequest.day_off_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Days</label>
                  <p className="text-gray-900 font-semibold">{selectedRequest.date_off_number} days</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Start Date</label>
                  <p className="text-gray-900">{selectedRequest.start_date_time}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">End Date</label>
                  <p className="text-gray-900">{selectedRequest.end_date_time}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Current Status</label>
                <div className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
              </div>
            </div>
            {selectedRequest.status === 'Pending' && (
              <div className="p-6 border-t border-gray-200 flex gap-4">
                <button
                  onClick={() => handleStatusChange(selectedRequest.id, 'Accept')}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                >
                  <FaCheck /> Accept
                </button>
                <button
                  onClick={() => handleStatusChange(selectedRequest.id, 'Reject')}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
                >
                  <FaTimes /> Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DayoffRequests