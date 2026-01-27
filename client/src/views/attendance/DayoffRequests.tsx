import React, { useState, useEffect, useMemo } from 'react'
import { FaPlus, FaTimes, FaCheck, FaEdit, FaTrash, FaEye, FaFilePdf } from "react-icons/fa"
import { getAllUsers, updateUser } from '../../services/Create_user/api'
import { createAttendanceSummary } from '../../services/Attendance/api'
import type { UserData } from '../../services/Create_user/api'
import { getAllDepartments, type DepartmentData } from '../../services/departments/api'
import {
  getAllDayOffRequests,
  createDayOffRequest,
  updateDayOffRequest,
  updateDayOffStatus,
  type DayOffRequest,
  type CreateDayOffRequestPayload
} from '@/services/Day_off_api/api'
import { useExportToPDF } from './ExportToPDF'
import AddFormRequest from './dayoffrequests/AddFormRequrst'
import EditFormRequest from './dayoffrequests/EditFormRequest'
import Swal from 'sweetalert2'
import {
  Download,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

type DayOffType = 'FULL_DAY' | 'HALF_DAY'
type RequestStatus = 'Pending' | 'Accepted' | 'Rejected'

const ITEMS_PER_PAGE = 8

const DayoffRequests: React.FC = () => {
  const [requests, setRequests] = useState<DayOffRequest[]>([])
  const [users, setUsers] = useState<UserData[]>([])
  const [departments, setDepartments] = useState<DepartmentData[]>([])
  const [loading, setLoading] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<DayOffRequest | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Filter states
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [selectedDepartment, setSelectedDepartment] = useState<string>('')
  const [filterTitle, setFilterTitle] = useState<'OT' | 'FIELD_WORK' | 'ALL'>('ALL')
  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'ALL'>('ALL')
  const [filterDayOffType, setFilterDayOffType] =
    useState<DayOffType | 'ALL'>('ALL')

  const useUsersMap = (users: UserData[]) => {
    return React.useMemo(() => {
      const map = new Map<string, UserData>()
      users.forEach(user => {
        map.set(user._id, user)
      })
      return map
    }, [users])
  }

  const usersMap = useUsersMap(users)

  // Helper function to get month name
  const getMonthName = (month: number): string => {
    const months = [
      'ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ',
      'ກໍລະກົດ', 'ສິງຫາ', 'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ'
    ]
    return months[month - 1] || ''
  }

  // Load users first, then requests
  useEffect(() => {
    const initializeData = async () => {
      try {
        await loadUsers()
        await loadDepartments()
        setDataLoaded(true)
      } catch (error) {
        console.error('Error initializing data:', error)
      }
    }
    initializeData()
  }, [])

  // Load requests only after users are loaded
  useEffect(() => {
    if (dataLoaded) {
      loadDayOffRequests()
    }
  }, [dataLoaded])

  const loadUsers = async () => {
    try {
      const userData = await getAllUsers()
      setUsers(userData.users)
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadDepartments = async () => {
    const deptData = await getAllDepartments()
    setDepartments(deptData.departments)
  }

  const calculatedVacationDays = () => {
    return users.map(user => {
      const userRequests = requests.filter(req => {
        const reqUserId =
          typeof req.user_id === 'string'
            ? req.user_id
            : req.user_id?._id

        return reqUserId === user._id && req.status === 'Accepted'
      })

      const totalDaysOff = userRequests.reduce(
        (sum, req) => sum + (req.date_off_number || 0),
        0
      )

      return {
        ...user,
        vacation_days: user.vacation_days - totalDaysOff
      }
    })
  }

  const usersWithUpdatedVacationDays = calculatedVacationDays()

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

  // Filter requests based on selected criteria
  const filteredRequests = React.useMemo(() => {
    return requests.filter(request => {
      const startDate = new Date(request.start_date_time)
      const requestYear = startDate.getFullYear()
      const requestMonth = startDate.getMonth() + 1

      // Year
      if (requestYear !== selectedYear) return false

      // Month
      if (requestMonth !== selectedMonth) return false

      // Department
      if (selectedDepartment) {
        const employeeId =
          typeof request.employee_id === 'string'
            ? request.employee_id
            : request.employee_id?._id

        const employee = users.find(u => u._id === employeeId)

        const employeeDeptId =
          typeof employee?.department_id === 'string'
            ? employee.department_id
            : employee?.department_id?.[0]._id

        if (employeeDeptId !== selectedDepartment) {
          return false
        }
      }

      // Day off type filter
      if (filterDayOffType !== 'ALL' && request.day_off_type !== filterDayOffType) {
        return false
      }

      // Status filter
      if (filterStatus !== 'ALL' && request.status !== filterStatus) {
        return false
      }

      return true
    })
  }, [
    requests,
    selectedYear,
    selectedMonth,
    selectedDepartment,
    filterDayOffType,
    filterStatus,
    users
  ])

  // Pagination logic
  const { paginatedRequests, totalPages } = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const paginated = filteredRequests.slice(startIndex, endIndex)
    const pages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE)
    
    return {
      paginatedRequests: paginated,
      totalPages: pages
    }
  }, [filteredRequests, currentPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedYear, selectedMonth, selectedDepartment, filterDayOffType, filterStatus])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const calculateDaysOff = (start: string, end: string, type: DayOffType): number => {
    if (!start || !end) return 0
    const startDate = new Date(start)
    const endDate = new Date(end)

    if (type === 'HALF_DAY') {
      return 0.5
    } else {
      const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
      const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
      const diffTime = endDay.getTime() - startDay.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
      return diffDays
    }
  }

  // Handle CREATE
  const handleCreate = async (formData: {
    employee_id: string
    supervisor_id: string
    department_id: string
    day_off_type: DayOffType
    start_date_time: string
    end_date_time: string
    title: string
  }) => {
    if (
      !formData.employee_id ||
      !formData.supervisor_id ||
      !formData.title ||
      !formData.start_date_time ||
      !formData.end_date_time
    ) {
      await Swal.fire({
        icon: 'warning',
        title: 'ຂາດຂໍ້ມູນ',
        text: 'ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ',
        confirmButtonColor: '#3085d6'
      })
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

      await Swal.fire({
        icon: 'success',
        title: 'ສຳເລັດ',
        text: 'ສ້າງຄຳຂໍລາພັກສຳເລັດແລ້ວ!',
        confirmButtonColor: '#3085d6',
        timer: 2000
      })

      setShowAddModal(false)
      await loadDayOffRequests()

    } catch (error) {
      console.error(error)

      await Swal.fire({
        icon: 'error',
        title: 'ຜິດພາດ',
        text: 'ບໍ່ສາມາດສ້າງຄຳຂໍລາພັກໄດ້',
        confirmButtonColor: '#d33'
      })

    } finally {
      setLoading(false)
    }
  }

  // Handle UPDATE
  const handleUpdate = async (requestId: string, formData: {
    employee_id: string
    supervisor_id: string
    department_id: string
    day_off_type: DayOffType
    start_date_time: string
    end_date_time: string
    title: string
  }) => {
    if (
      !formData.employee_id ||
      !formData.supervisor_id ||
      !formData.title ||
      !formData.start_date_time ||
      !formData.end_date_time
    ) {
      await Swal.fire({
        icon: 'warning',
        title: 'ຂາດຂໍ້ມູນ',
        text: 'ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ',
        confirmButtonColor: '#3085d6'
      })
      return
    }

    const daysOff = calculateDaysOff(
      formData.start_date_time,
      formData.end_date_time,
      formData.day_off_type
    )

    const payload = {
      employee_id: formData.employee_id,
      supervisor_id: formData.supervisor_id,
      day_off_type: formData.day_off_type,
      start_date_time: new Date(formData.start_date_time).toISOString(),
      end_date_time: new Date(formData.end_date_time).toISOString(),
      date_off_number: daysOff,
      title: formData.title,
    }

    try {
      setLoading(true)
      await updateDayOffRequest(requestId, payload)

      await Swal.fire({
        icon: 'success',
        title: 'ສຳເລັດ',
        text: 'ອັບເດດຄຳຂໍສຳເລັດແລ້ວ!',
        confirmButtonColor: '#3085d6',
        timer: 2000
      })

      setShowEditModal(false)
      setSelectedRequest(null)
      await loadDayOffRequests()

    } catch (error) {
      console.error(error)

      await Swal.fire({
        icon: 'error',
        title: 'ຜິດພາດ',
        text: 'ບໍ່ສາມາດອັບເດດຄຳຂໍໄດ້',
        confirmButtonColor: '#d33'
      })

    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (
    requestId: string,
    newStatus: 'Accepted' | 'Rejected'
  ) => {
    const result = await Swal.fire({
      title: "ຢືນຢັນ?",
      text: `ທ່ານກຳລັງຈະ ${newStatus === 'Accepted' ? 'ອະນຸມັດ' : 'ປະຕິເສດ'} ຄຳຂໍນີ້`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `ແມ່ນ, ${newStatus === 'Accepted' ? 'ອະນຸມັດ' : 'ປະຕິເສດ'}`,
      cancelButtonText: 'ຍົກເລີກ'
    })

    if (!result.isConfirmed) return

    try {
      setLoading(true)

      const targetRequest = requests.find(req => req._id === requestId)
      if (!targetRequest) {
        throw new Error("Request not found")
      }
      await updateDayOffStatus(requestId, newStatus)

      if (newStatus === 'Accepted') {
        await Promise.all(
          usersWithUpdatedVacationDays.map(user =>
            updateUser(user._id, { vacation_days: user.vacation_days })
          )
        )

        const startDate = new Date(targetRequest.start_date_time)
        const year = startDate.getFullYear()
        const month = startDate.getMonth() + 1

        const userId =
          typeof targetRequest.user_id === 'string'
            ? targetRequest.user_id
            : targetRequest.user_id?._id ||
            (typeof targetRequest.employee_id === 'string'
              ? targetRequest.employee_id
              : targetRequest.employee_id?._id)

        if (userId) {
          try {
            await createAttendanceSummary({
              user_id: userId,
              year,
              month,
              leave_days: targetRequest.date_off_number || 0,
              ot_hours: 0,
              attendance_days: 0,
            })
          } catch (err) {
            console.error('Attendance summary error:', err)
          }
        }
      }

      await loadDayOffRequests()

      Swal.fire({
        title: "ສຳເລັດ",
        text: `${newStatus === 'Accepted' ? 'ອະນຸມັດ' : 'ປະຕິເສດ'}ຄຳຂໍສຳເລັດແລ້ວ`,
        icon: "success",
        timer: 2000
      })

    } catch (error) {
      console.error('Error updating status:', error)
      Swal.fire({
        title: "ຜິດພາດ",
        text: "ບໍ່ສາມາດອັບເດດສະຖານະໄດ້",
        icon: "error"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (request: DayOffRequest) => {
    setSelectedRequest(request)
    setShowEditModal(true)
  }

  const getUserName = (userRef: any): string => {
    if (!userRef) return '—'

    // Case 1: populated object
    if (typeof userRef === 'object' && userRef.first_name_en) {
      return `${userRef.first_name_en} ${userRef.last_name_en}`
    }

    // Case 2: extract ID
    const userId =
      typeof userRef === 'string'
        ? userRef
        : userRef._id

    if (!userId) return '—'

    const user = usersMap.get(userId)

    return user
      ? `${user.first_name_en} ${user.last_name_en}`
      : '—'
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
      case 'Accepted': return 'bg-green-100 text-green-800'
      case 'Rejected': return 'bg-red-100 text-red-800'
    }
  }

  const getStatusLabel = (status: RequestStatus) => {
    switch (status) {
      case 'Pending': return 'ກຳລັງດຳເນີນການ'
      case 'Accepted': return 'ອະນຸມັດແລ້ວ'
      case 'Rejected': return 'ປະຕິເສດ'
    }
  }

  const getDayOffTypeLabel = (type: DayOffType) => {
    return type === 'FULL_DAY' ? 'ໝົດມື້' : 'ເຄີ່ງມື້'
  }

  const handleExportToPDF = useExportToPDF({ requests: filteredRequests, users })

  const getTotalStats = () => {
    const totalRequests = filteredRequests.length
    const pendingRequests = filteredRequests.filter(r => r.status === 'Pending').length
    const acceptedRequests = filteredRequests.filter(r => r.status === 'Accepted').length
    const rejectedRequests = filteredRequests.filter(r => r.status === 'Rejected').length
    const otRequests = filteredRequests.filter(r => r.title === 'OT').length
    const fieldWorkRequests = filteredRequests.filter(r => r.title === 'FIELD_WORK').length
    const totalDays = filteredRequests
      .filter(r => r.status === 'Accepted')
      .reduce((sum, r) => sum + (r.date_off_number || 0), 0)

    return {
      totalRequests,
      pendingRequests,
      acceptedRequests,
      rejectedRequests,
      otRequests,
      fieldWorkRequests,
      totalDays
    }
  }

  const stats = getTotalStats()

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900">🏖 ຂໍ້ມູນການລາພັກວຽກ</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportToPDF}
              disabled={loading || filteredRequests.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export to PDF
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              disabled={loading}
              className="flex items-center gap-2 bg-[#45CC67] hover:bg-[#1fd371] text-white px-5 py-2.5 rounded-lg transition disabled:opacity-50 text-sm"
            >
              <FaPlus /> ຂໍລາພັກວຽກ
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500 font-medium mb-1">ຈຳນວນຄຳຂໍທັງໝົດ</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalRequests}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-sm text-yellow-600 font-medium mb-1">ກຳລັງດຳເນີນການ</div>
            <div className="text-2xl font-bold text-yellow-700">{stats.pendingRequests}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium mb-1">ອະນຸມັດແລ້ວ</div>
            <div className="text-2xl font-bold text-green-700">{stats.acceptedRequests}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-sm text-red-600 font-medium mb-1">ປະຕິເສດ</div>
            <div className="text-2xl font-bold text-red-700">{stats.rejectedRequests}</div>
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
              className="w-full h-[42px] px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            >
              <option value="">ພະແໜກທັງໝົດ</option>
              {departments.map((dept: DepartmentData) => (
                <option key={dept._id} value={dept._id}>
                  {dept.department_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">ປະເພດ</label>
            <select
              value={filterDayOffType}
              onChange={(e) => setFilterDayOffType(e.target.value as DayOffType | 'ALL')}
              className="w-full h-[42px] px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            >
              <option value="ALL">ປະເພດທັງໝົດ</option>
              <option value="FULL_DAY">ໝົດມື້</option>
              <option value="HALF_DAY">ເຄີ່ງມື້</option>
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
              <option value="Accepted">ອະນຸມັດແລ້ວ</option>
              <option value="Rejected">ປະຕິເສດ</option>
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4 text-sm text-gray-600 flex justify-between items-center">
          <div>
            ສະແດງ <span className="font-semibold text-gray-900">
              {paginatedRequests.length > 0 ? ((currentPage - 1) * ITEMS_PER_PAGE + 1) : 0}
            </span> - <span className="font-semibold text-gray-900">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredRequests.length)}
            </span> ຈາກທັງໝົດ <span className="font-semibold text-gray-900">{filteredRequests.length}</span> ລາຍການ
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
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    ປະເພດ
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    ມື້
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
                {loading && filteredRequests.length === 0 ? (
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
                    const isDisabled = request.status === 'Rejected' || request.status === 'Accepted'
                    return (
                      <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-900 text-sm">
                          <div className="font-medium">{getUserName(request.employee_id || request.user_id)}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            request.day_off_type === 'FULL_DAY' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {getDayOffTypeLabel(request.day_off_type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-cyan-50 text-cyan-700 px-3 py-1.5 rounded-full font-semibold text-sm">
                            {request.date_off_number} ມື້
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900 text-sm max-w-xs truncate" title={request.title}>
                          {request.title}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {getStatusLabel(request.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedRequest(request)
                                setShowDetailModal(true)
                              }}
                              className="inline-flex items-center justify-center p-2 rounded-lg text-xs font-medium transition-colors bg-gray-600 hover:bg-gray-700 text-white shadow-sm hover:shadow-md"
                              title="ເບິ່ງລາຍລະອຽດ"
                            >
                              <FaEye size={14} />
                            </button>

                            <button
                              onClick={() => handleEdit(request)}
                              disabled={loading || isDisabled}
                              className={`inline-flex items-center justify-center p-2 rounded-lg text-xs font-medium transition-colors ${
                                isDisabled
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-[#45CC67] hover:bg-[#1fd371] text-white shadow-sm hover:shadow-md'
                              }`}
                              title={isDisabled ? 'ບໍ່ສາມາດແກ້ໄຂໄດ້' : 'ແກ້ໄຂ'}
                            >
                              <FaEdit size={14} />
                            </button>

                            <button
                              onClick={() => handleStatusChange(request._id, 'Rejected')}
                              disabled={loading || isDisabled}
                              className={`inline-flex items-center justify-center p-2 rounded-lg text-xs font-medium transition-colors ${
                                isDisabled
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md'
                              }`}
                              title={isDisabled ? 'ບໍ່ສາມາດລົບໄດ້' : 'ປະຕິເສດ'}
                            >
                              <FaTrash size={14} />
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
                  <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredRequests.length)}</span> ຈາກທັງໝົດ{' '}
                  <span className="font-medium">{filteredRequests.length}</span> ລາຍການ
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

      {/* Add Form Modal */}
      <AddFormRequest
        showModal={showAddModal}
        setShowModal={setShowAddModal}
        users={users}
        loading={loading}
        onSubmit={handleCreate}
      />

      {/* Edit Form Modal */}
      <EditFormRequest
        showModal={showEditModal}
        setShowModal={setShowEditModal}
        selectedRequest={selectedRequest}
        users={users}
        loading={loading}
        onUpdate={handleUpdate}
      />

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
                    {getUserName(selectedRequest.employee_id || selectedRequest.user_id)}
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
                  {selectedRequest.title}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">ປະເພດມື້ພັກ</label>
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      selectedRequest.day_off_type === 'FULL_DAY' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {getDayOffTypeLabel(selectedRequest.day_off_type)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">ຈຳນວນມື້</label>
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-sm font-semibold">
                    {selectedRequest.date_off_number} ມື້
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">ວັນທີ່ເລີ່ມ</label>
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-sm">
                    {formatDateTime(selectedRequest.start_date_time)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">ຮອດວັນທີ່</label>
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-sm">
                    {formatDateTime(selectedRequest.end_date_time)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">ສະຖານະປັດຈຸບັນ</label>
                <div className="mt-2">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedRequest.status)}`}>
                    {getStatusLabel(selectedRequest.status)}
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