import React, { useState, useEffect, useMemo } from 'react'
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
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { useExportOTToPDF } from './ExportToPDF'
import Swal from 'sweetalert2'

type RequestStatus = 'Pending' | 'Accept' | 'Reject'
type RequestTitle = 'OT' | 'FIELD_WORK'

const ITEMS_PER_PAGE = 8

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
  const [currentPage, setCurrentPage] = useState(1)

  const useUsersMap = (users: UserData[]) => {
    return React.useMemo(() => {
      const map = new Map<string, UserData>()
      users.forEach(u => map.set(u._id, u))
      return map
    }, [users])
  }

  const usersMap = useUsersMap(users)

  // Pagination logic
  const { paginatedRequests, totalPages } = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const paginated = requests.slice(startIndex, endIndex)
    const pages = Math.ceil(requests.length / ITEMS_PER_PAGE)
    
    return {
      paginatedRequests: paginated,
      totalPages: pages
    }
  }, [requests, currentPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedYear, selectedMonth, selectedDepartment, filterTitle, filterStatus])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
              ? String(user.department_id[0]._id)
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
      title: 'ຢືນຢັນການລົບ',
      text: 'ທ່ານຕ້ອງການລົບຄຳຂໍນີ້ບໍ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ແມ່ນ, ລົບເລີຍ',
      cancelButtonText: 'ຍົກເລີກ',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
    })

    if (!result.isConfirmed) return

    try {
      setLoading(true)
      await deleteRequest(requestId)
      await Swal.fire({
        icon: 'success',
        title: 'ສຳເລັດ',
        text: 'ລົບຄຳຂໍສຳເລັດແລ້ວ!',
        confirmButtonColor: '#3085d6',
        timer: 2000
      })

      await loadRequests()

    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'ລົບບໍ່ສຳເລັດ',
        text: error?.message || 'ເກີດຂໍ້ຜິດພາດໃນການລົບຄຳຂໍ',
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
    const months = ['ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ',
      'ກໍລະກົດ', 'ສິງຫາ', 'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ']
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
            <h1 className="text-3xl font-bold text-gray-900">ຂໍ້ມູນການເຮັດ Overtime(OT) ແລະ ວຽກນອກ</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportToPDF}
              disabled={loading || otDataForExport.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="text-sm text-purple-600 font-medium mb-1">ຄຳຂໍວຽກນອກ</div>
            <div className="text-2xl font-bold text-purple-700">{stats.fieldWorkRequests}</div>
          </div>
          <div className="bg-cyan-50 rounded-lg p-4">
            <div className="text-sm text-cyan-600 font-medium mb-1">ຊົ່ວໂມງທັງໝົດ</div>
            <div className="text-2xl font-bold text-cyan-700">{stats.totalHours.toFixed(1)}h</div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">ປີ</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full h-[42px] px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">ເດືອນ</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full h-[42px] px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>{getMonthName(month)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">ພະແໜກ</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full h-[42px] px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <option value="">ພະແໜກທັງໝົດ</option>
              {getUniqueDepartments().map(dept => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">ປະເພດ</label>
            <select
              value={filterTitle}
              onChange={(e) => setFilterTitle(e.target.value as 'OT' | 'FIELD_WORK' | 'ALL')}
              className="w-full h-[42px] px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            >
              <option value="ALL">ປະເພດທັງໝົດ</option>
              <option value="OT">ວຽກລ່ວງເວລາ(OT)</option>
              <option value="FIELD_WORK">ວຽກນອກ</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">ສະຖານະ</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as RequestStatus | 'ALL')}
              className="w-full h-[42px] px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            >
              <option value="ALL">ສະຖານະທັງໝົດ</option>
              <option value="Pending">ກຳລັງດຳເນີນການ</option>
              <option value="Accept">ອະນຸມັດແລ້ວ</option>
              <option value="Reject">ປະຕິເສດ</option>
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4 text-sm text-gray-600 flex justify-between items-center">
          <div>
            ສະແດງ <span className="font-semibold text-gray-900">
              {paginatedRequests.length > 0 ? ((currentPage - 1) * ITEMS_PER_PAGE + 1) : 0}
            </span> - <span className="font-semibold text-gray-900">
              {Math.min(currentPage * ITEMS_PER_PAGE, requests.length)}
            </span> ຈາກທັງໝົດ <span className="font-semibold text-gray-900">{requests.length}</span> ລາຍການ
          </div>
          {totalPages > 1 && (
            <div className="text-gray-500">
              ໜ້າ {currentPage} / {totalPages}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    ພະນັກງານ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    ປະເພດ
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    ຊົ່ວໂມງ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    ເລືອງ
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    ສະຖານະ
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {loading && requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>ກຳລັງໂຫລດຂໍ້ມູນ...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-base font-medium">ບໍ່ພົບຂໍ້ມູນ</span>
                        <span className="text-xs text-gray-400">ກະລຸນາປ່ຽນຕົວກອງຂໍ້ມູນເພື່ອຄົ້ນຫາຄຳຂໍ</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedRequests.map((request) => {
                    const isDisabled = request.status === 'Reject' || request.status === 'Accept'
                    const hours = parseTimeToHours(request.start_hour as any, request.end_hour as any)
                    return (
                      <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-900 text-sm">
                          <div className="font-medium">{getUserName(request.user_id)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getTitleColor(request.title)}`}>
                            {request.title === 'OT' ? 'ວຽກລ່ວງເວລາ' : 'ວຽກນອກ'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium text-sm">
                            <FaClock size={12} />
                            {hours.toFixed(1)}h
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900 text-sm max-w-xs truncate" title={request.reason}>
                          {request.reason}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status === 'Accept' ? 'ອະນຸມັດແລ້ວ' : request.status === 'Pending' ? 'ກຳລັງດຳເນີນການ' : 'ປະຕິເສດ'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedRequest(request)
                                setShowDetailModal(true)
                              }}
                              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors bg-gray-600 hover:bg-gray-700 text-white shadow-sm hover:shadow-md"
                              title="ເບິ່ງລາຍລະອຽດ"
                            >
                              <FaEye size={12} />
                              <span>ລາຍລະອຽດ</span>
                            </button>
                            
                            <button
                              onClick={() => handleDelete(request._id)}
                              disabled={loading || isDisabled}
                              className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                                isDisabled
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md'
                              }`}
                              title={isDisabled ? 'ບໍ່ສາມາດລົບໄດ້' : 'ລົບຄຳຂໍ'}
                            >
                              <FaTrash size={12} />
                              <span>ລົບ</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between bg-white px-6 py-4 rounded-lg shadow-sm">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  ກຳລັງສະແດງ <span className="font-medium">{((currentPage - 1) * ITEMS_PER_PAGE + 1)}</span> ເຖິງ{' '}
                  <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, requests.length)}</span> ຈາກທັງໝົດ{' '}
                  <span className="font-medium">{requests.length}</span> ລາຍການ
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center gap-1 rounded-l-md px-3 py-2 text-sm font-medium transition-colors ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    <ChevronLeft size={16} />
                    <span className="hidden sm:inline">ກ່ອນໜ້າ</span>
                  </button>

                  <div className="hidden md:flex">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      const showPage = 
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      
                      const showEllipsis = 
                        (page === currentPage - 2 && currentPage > 3) ||
                        (page === currentPage + 2 && currentPage < totalPages - 2)

                      if (showEllipsis) {
                        return (
                          <span key={page} className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-400 bg-white border border-gray-300">
                            ...
                          </span>
                        )
                      }

                      if (!showPage) return null

                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium transition-colors ${
                            currentPage === page
                              ? 'z-10 bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center gap-1 rounded-r-md px-3 py-2 text-sm font-medium transition-colors ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    <span className="hidden sm:inline">ຕໍ່ໄປ</span>
                    <ChevronRight size={16} />
                  </button>
                </nav>
              </div>
            </div>

            {/* Mobile Pagination */}
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                ກ່ອນໜ້າ
              </button>
              <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                ຕໍ່ໄປ
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex justify-between items-center z-10 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">ລາຍລະອຽດຄຳຂໍ</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">ພະນັກງານ</label>
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-sm">
                    {getUserName(selectedRequest.user_id)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">ຫົວໜ້າ</label>
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-sm">
                    {getUserName(selectedRequest.supervisor_id)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">ເລືອງ</label>
                <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-sm">
                  {selectedRequest.reason}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">ປະເພດ</label>
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getTitleColor(selectedRequest.title)}`}>
                      {selectedRequest.title === 'OT' ? 'ວຽກລ່ວງເວລາ' : 'ວຽກນອກ'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">ຊົ່ວໂມງ</label>
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-sm font-semibold">
                    {parseTimeToHours(selectedRequest.start_hour as any, selectedRequest.end_hour as any).toFixed(1)}h
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">ວັນທີ່</label>
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-sm">
                    {formatDate(selectedRequest.date)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">ເວລາ</label>
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-sm">
                    {formatTimeRange(selectedRequest.start_hour, selectedRequest.end_hour)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">ສະຖານະປັດຈຸບັນ</label>
                <div className="mt-2">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status === 'Accept' ? 'ອະນຸມັດແລ້ວ' : selectedRequest.status === 'Pending' ? 'ກຳລັງດຳເນີນການ' : 'ປະຕິເສດ'}
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