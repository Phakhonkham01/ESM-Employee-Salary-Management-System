import React, { useState, useEffect } from 'react'
import { FaTimes, FaCheck, FaTrash, FaClock, FaFilePdf, FaEye } from "react-icons/fa"
import { getAllUsers } from '../../services/Create_user/api'
import type { UserData } from '../../services/Create_user/api'
import { getAllDepartments, type DepartmentData } from '../../services/departments/api'
import {
  getAllRequests,
  updateRequestStatus,
  deleteRequest,
  type RequestData
} from '../../services/requests/api'
import {
  Download,

} from "lucide-react"
import { useExportOTToPDF } from './ExportToPDF'
import Swal from 'sweetalert2'

type RequestStatus = 'Pending' | 'Accept' | 'Reject'
type RequestTitle = 'OT' | 'FIELD_WORK'

const OTandFieldWork: React.FC = () => {
  const [requests, setRequests] = useState<RequestData[]>([])
  const [users, setUsers] = useState<UserData[]>([])
  const [departments, setDepartments] = useState<DepartmentData[]>([])
  const [loading, setLoading] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedDepartment, setSelectedDepartment] = useState<string>('')
  const [filterTitle, setFilterTitle] = useState<'OT' | 'FIELD_WORK' | 'ALL'>('ALL')
  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'ALL'>('ALL')

  const useUsersMap = (users: UserData[]) => {
    return React.useMemo(() => {
      const map = new Map<string, UserData>()
      users.forEach(u => map.set(u._id, u))
      return map
    }, [users])
  }

  const usersMap = useUsersMap(users)


  useEffect(() => {
    loadUsers()
    loadDepartments()
  }, [])

  // โหลดครั้งแรก หลัง users มาแล้ว
  useEffect(() => {
    if (users.length > 0) {
      loadRequests()
    }
  }, [users])

  // โหลดเมื่อ filter เปลี่ยน
  useEffect(() => {
    if (users.length > 0) {
      loadRequests()
    }
  }, [selectedYear, selectedMonth, selectedDepartment, filterTitle, filterStatus])


  const loadUsers = async () => {
    try {
      const userData = await getAllUsers()
      setUsers(userData.users)
    } catch (error) {
      console.error('Error loading users:', error)
      alert('Failed to load users')
    }
  }

  const loadDepartments = async () => {
    try {
      const deptData = await getAllDepartments()
      setDepartments(deptData.departments)
    } catch (error) {
      console.error('Error loading departments:', error)
    }
  }

  const formatDateForAPI = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const loadRequests = async () => {
    try {
      setLoading(true)
      const startDate = new Date(selectedYear, selectedMonth - 1, 1, 0, 0, 0)
      const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999)
      const res = await getAllRequests({
        startDate: formatDateForAPI(startDate),
        endDate: formatDateForAPI(endDate),
      })

      let filteredRequests = (res.requests || []).map(r => ({
        ...r,
        status: normalizeStatus(r.status),
      }))

      // Type
      if (filterTitle !== 'ALL') {
        filteredRequests = filteredRequests.filter(r => r.title === filterTitle)
      }

      // Status
      if (filterStatus !== 'ALL') {
        filteredRequests = filteredRequests.filter(r => r.status === filterStatus)
      }

      // Department (frontend-safe)
      if (selectedDepartment) {
        filteredRequests = filteredRequests.filter(req => {
          const userId =
            typeof req.user_id === 'string'
              ? req.user_id
              : req.user_id?._id

          const user = users.find(u => u._id === userId)
          if (!user || !user.department_id) return false

          const deptId =
            typeof user.department_id === 'object'
              ? String(user.department_id._id)
              : String(user.department_id)

          return deptId === String(selectedDepartment)
        })
      }

      setRequests(filteredRequests)
    } catch (error) {
      console.error(error)
      alert('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  const normalizeStatus = (status: string): RequestStatus => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pending'
      case 'accept':
      case 'accepted':
        return 'Accept'
      case 'reject':
      case 'rejected':
        return 'Reject'
      default:
        return 'Pending'
    }
  }

  const parseTimeToHours = (startHour: string, endHour: string): number => {
    const parseHour = (hourStr: string): number => {
      if (typeof hourStr === 'number') return hourStr
      const [hours, minutes] = hourStr.split(':').map(Number)
      return hours + minutes / 60
    }

    const start = parseHour(startHour)
    const end = parseHour(endHour)
    return Math.max(0, end - start)
  }

  const formatHourToTime = (hour: number | string): string => {
    if (typeof hour === 'string') {
      // Already in HH:mm format
      return hour
    }
    const hours = Math.floor(hour)
    const minutes = Math.round((hour - hours) * 60)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  const formatTimeRange = (startHour: string | number, endHour: string | number): string => {
    const start = formatHourToTime(startHour)
    const end = formatHourToTime(endHour)
    return `${start} - ${end}`
  }

  const handleDelete = async (requestId: string) => {
    const result = await Swal.fire({
      title: 'Confirm Deletion',
      text: 'Do you want to delete this request?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      reverseButtons: true,
    })

    if (!result.isConfirmed) return

    try {
      setLoading(true)
      await deleteRequest(requestId)
      await Swal.fire({
        icon: 'success',
        title: 'Deleted',
        text: 'Request deleted successfully!',
        confirmButtonColor: '#3085d6'
      })

      await loadRequests()

    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Delete failed',
        text: error?.message || 'Failed to delete request',
        confirmButtonColor: '#d33'
      })

    } finally {
      setLoading(false)
    }
  }

  const getUserName = (userRef: any) => {
    if (!userRef) return 'Unknown User'
    if (typeof userRef === 'object' && userRef.first_name_en) {
      return `${userRef.first_name_en} ${userRef.last_name_en}`
    }
    if (typeof userRef === 'object' && userRef.email) {
      return userRef.email
    }
    const userId = typeof userRef === 'string' ? userRef : userRef._id
    const user = users.find(u => u._id === userId)
    return user ? `${user.first_name_en} ${user.last_name_en}` : 'Unknown User'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Accept': return 'bg-green-100 text-green-800'
      case 'Reject': return 'bg-red-100 text-red-800'
    }
  }

  const getTitleColor = (title: RequestTitle) => {
    switch (title) {
      case 'OT': return 'bg-blue-100 text-blue-800'
      case 'FIELD_WORK': return 'bg-purple-100 text-purple-800'
    }
  }

  const getMonthName = (month: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']
    return months[month - 1]
  }

  const getUniqueDepartments = () => {
    return departments.map(dept => ({
      _id: dept._id,
      name: dept.department_name
    }))
  }

  const getTotalStats = () => {
    const totalRequests = requests.length
    const pendingRequests = requests.filter(r => r.status === 'Pending').length
    const acceptedRequests = requests.filter(r => r.status === 'Accept').length
    const rejectedRequests = requests.filter(r => r.status === 'Reject').length
    const otRequests = requests.filter(r => r.title === 'OT').length
    const fieldWorkRequests = requests.filter(r => r.title === 'FIELD_WORK').length
    const totalHours = requests
      .filter(r => r.status === 'Accept')
      .reduce((sum, r) => sum + parseTimeToHours(r.start_hour as any, r.end_hour as any), 0)

    return {
      totalRequests,
      pendingRequests,
      acceptedRequests,
      rejectedRequests,
      otRequests,
      fieldWorkRequests,
      totalHours
    }
  }

  const stats = getTotalStats()

  // Prepare data for export
  const otDataForExport = requests
    .filter(r => r.title === 'OT')
    .map(r => ({
      Type: r.title,
      Date: formatDate(r.date),
      Time: formatTimeRange(r.start_hour, r.end_hour),
      Reason: r.reason,
      Status: r.status
    }))

  // Export to PDF hook
  const handleExportToPDF = useExportOTToPDF({
    requests: otDataForExport,
    selectedYear,
    selectedMonth,
    selectedDepartment,
    departments,
    getMonthName
  })

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900">⏰ ຂໍ້ມູນການເຮັດ Overtime(OT) ແລະ ວຽກນອກ</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportToPDF}
              disabled={loading || otDataForExport.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export to PDF
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium mb-1">ຄຳຂໍທັງໝົດ</div>
            <div className="text-2xl font-bold text-blue-700">{stats.totalRequests}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-sm text-yellow-600 font-medium mb-1">ກຳລັງດຳເນີນການ</div>
            <div className="text-2xl font-bold text-yellow-700">{stats.pendingRequests}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium mb-1">ອະນຸມັດແລ້ວ</div>
            <div className="text-2xl font-bold text-green-700">{stats.acceptedRequests}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-sm text-red-600 font-medium mb-1">ປະຕິເສດ</div>
            <div className="text-2xl font-bold text-red-700">{stats.rejectedRequests}</div>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="text-sm text-indigo-600 font-medium mb-1">ຄຳຂໍເຮັດ OT</div>
            <div className="text-2xl font-bold text-indigo-700">{stats.otRequests}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-purple-600 font-medium mb-1">ຄຳຂໍເຮັດວຽກນອກ</div>
            <div className="text-2xl font-bold text-purple-700">{stats.fieldWorkRequests}</div>
          </div>
          <div className="bg-cyan-50 rounded-lg p-4">
            <div className="text-sm text-cyan-600 font-medium mb-1">ຈຳນວນຊົ່ວໂມງ</div>
            <div className="text-2xl font-bold text-cyan-700">{stats.totalHours.toFixed(1)}h</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase">ປີ</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full border border-[#E5E7EB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1F3A5F]"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase">ເດືອນ</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full border border-[#E5E7EB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1F3A5F]"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>{getMonthName(month)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase">ພະແໜກ</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full border border-[#E5E7EB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1F3A5F]"
              disabled={loading}
            >
              <option value="">ພະແໜກທັງໝົດ</option>
              {getUniqueDepartments().map(dept => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase">ປະເພດ</label>
            <select
              value={filterTitle}
              onChange={(e) => setFilterTitle(e.target.value as 'OT' | 'FIELD_WORK' | 'ALL')}
              className="w-full border border-[#E5E7EB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1F3A5F]"
            >
              <option value="ALL">ປະເພດທັງໝົດ</option>
              <option value="OT">ວຽກລ່ວງເວລາ(OT)</option>
              <option value="FIELD_WORK">ວຽກນອກ</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase">ສະຖານະ</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as RequestStatus | 'ALL')}
              className="w-full border border-[#E5E7EB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1F3A5F]"
            >
              <option value="ALL">ສະຖານະທັງໝົດ</option>
              <option value="Pending">ກຳລັງດຳເນີນການ</option>
              <option value="Accept">ອະນຸມັດແລ້ວ</option>
              <option value="Reject">ປະຕິເສດ</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">ພະນັກງານ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">ປະເພດ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">ຊົ່ວໂມງ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">ເລືອງ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">ສະຖານະ</th>
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
                  const hours = parseTimeToHours(request.start_hour as any, request.end_hour as any)
                  return (
                    <tr key={request._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3.5 text-gray-900 text-sm whitespace-nowrap">{getUserName(request.user_id)}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-md text-xs font-medium ${getTitleColor(request.title)}`}>
                          {request.title}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-900 font-semibold text-sm whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium text-sm">
                          <FaClock size={12} />
                          {hours.toFixed(1)}h
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-900 text-sm whitespace-nowrap">{request.reason}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-md text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status === 'Accept' ? 'Accepted' : request.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(request)
                              setShowDetailModal(true)
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition bg-gray-600 hover:bg-gray-700 text-white"
                          >
                            <FaEye className="text-xs" /> ລາຍລະອຽດ
                          </button>
                          <button
                            onClick={() => handleDelete(request._id)}
                            disabled={loading || isDisabled}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${isDisabled
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-red-600 text-white hover:bg-red-700'
                              }`}
                          >
                            <FaTrash className="text-xs" /> ລົບ
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

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center px-[60px] py-[40px]">
              <h2 className="text-2xl font-bold text-gray-900">ລາຍລະອຽດຄຳຂໍ</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            <div className="p-6 space-y-6 px-[60px] py-[40px]">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-500">ພະນັກງານ</label>
                  <p className="w-full px-3 py-4 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF] mt-1">{getUserName(selectedRequest.user_id)}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">ຫົວໜ້າ</label>
                  <p className="w-full px-3 py-4 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF] mt-1">{getUserName(selectedRequest.supervisor_id)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500">ເລືອງ</label>
                <p className="text-lg font-semibold w-full px-3 py-4 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF] mt-1">{selectedRequest.reason}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-500">ປະເພດ</label>
                  <p className="w-full px-3 py-4 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF] mt-1">
                    <span className={`px-3 py-1 rounded-md text-sm font-medium ${getTitleColor(selectedRequest.title)}`}>
                      {selectedRequest.title}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">ຊົ່ວໂມງ</label>
                  <p className="w-full px-3 py-4 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF] mt-1">
                    {parseTimeToHours(selectedRequest.start_hour as any, selectedRequest.end_hour as any).toFixed(1)}h
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-500">ວັນທິ່</label>
                  <p className="w-full px-3 py-4 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF] mt-1">{formatDate(selectedRequest.date)}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">ເວລາ</label>
                  <p className="w-full px-3 py-4 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF] mt-1">{formatTimeRange(selectedRequest.start_hour, selectedRequest.end_hour)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500">ສະຖານະປັດຈຸບັນ</label>
                <div className="mt-2">
                  <span className={`px-4 py-2 rounded-lg text-sm font-medium ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status === 'Accept' ? 'ອານຸມັດແລ້ວ' : selectedRequest.status}
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

export default OTandFieldWork
