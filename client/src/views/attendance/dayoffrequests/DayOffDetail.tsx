import React from 'react'
import { FaTimes } from 'react-icons/fa'
import type { DayOffRequest } from '@/services/Day_off_api/api'
import type { UserData } from '../../../services/Create_user/api'

type RequestStatus = 'Pending' | 'Accept' | 'Reject'

interface DayOffDetailProps {
  showDetailModal: boolean
  setShowDetailModal: (show: boolean) => void
  selectedRequest: DayOffRequest | null
  users: UserData[]
}

const DayOffDetail: React.FC<DayOffDetailProps> = ({
  showDetailModal,
  setShowDetailModal,
  selectedRequest,
  users
}) => {
  
  const getUserName = (userRef: any): string => {
    if (!userRef) return 'Unknown User'
    
    if (typeof userRef === 'object') {
      if (userRef.name) return userRef.name
      
      if (userRef.first_name_en || userRef.last_name_en) {
        const firstName = userRef.first_name_en || ''
        const lastName = userRef.last_name_en || ''
        return `${firstName} ${lastName}`.trim() || userRef.email || 'Unknown User'
      }
      
      if (userRef.email) return userRef.email
      
      if (userRef._id) {
        const user = users.find(u => u._id === userRef._id)
        if (user) {
          return `${user.first_name_en} ${user.last_name_en}`.trim() || user.email
        }
      }
    }
    
    if (typeof userRef === 'string') {
      const user = users.find(u => u._id === userRef)
      if (user) {
        return `${user.first_name_en} ${user.last_name_en}`.trim() || user.email
      }
    }
    
    return 'Unknown User'
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

  const getStatusLabel = (status: RequestStatus) => {
    return status === 'Accept' ? 'Accepted' : status === 'Reject' ? 'Rejected' : status
  }

  if (!showDetailModal || !selectedRequest) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50">
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
              <p className="text-gray-900 mt-1">
                {getUserName(selectedRequest.employee_id || selectedRequest.user_id)}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-500">Supervisor</label>
              <p className="text-gray-900 mt-1">
                {getUserName(selectedRequest.supervisor_id)}
              </p>
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
                {getStatusLabel(selectedRequest.status)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DayOffDetail