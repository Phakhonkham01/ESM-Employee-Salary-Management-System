import React, { useState, useEffect } from 'react'
import { FaPlus, FaTimes, FaCheck, FaEdit, FaTrash, FaEye, FaFilePdf } from "react-icons/fa"
import { getAllUsers, updateUser } from '../../services/Create_user/api'
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
} from "lucide-react"

type DayOffType = 'FULL_DAY' | 'HALF_DAY'
type RequestStatus = 'Pending' | 'Accepted' | 'Rejected'

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
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
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

      // ✅ Day off type filter (FULL / HALF)
      if (filterDayOffType !== 'ALL' && request.day_off_type !== filterDayOffType) {
        return false
      }

      // ✅ Status filter
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
    filterDayOffType, // ✅ IMPORTANT
    filterStatus,     // ✅ IMPORTANT
    users
  ])


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
        title: 'Missing information',
        text: 'Please fill in all required fields.',
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
        title: 'Success',
        text: 'Day off request created successfully!',
        confirmButtonColor: '#3085d6'
      })

      setShowAddModal(false)
      await loadDayOffRequests()

    } catch (error) {
      console.error(error)

      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to create day off request',
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
        title: 'Missing information',
        text: 'Please fill in all required fields.',
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
        title: 'Success',
        text: 'ອັບເດດຄຳຮ້ອງຂໍວັນພັກສຳເລັດແລ້ວ!',
        confirmButtonColor: '#3085d6'
      })

      setShowEditModal(false)
      setSelectedRequest(null)
      await loadDayOffRequests()

    } catch (error) {
      console.error(error)

      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update day off request',
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
      title: 'ຕ້ອງການຍົກເລິກຄຳຂໍ?',
      html: 'ການຍົກເລິກນີ້ບໍ່ສາມາດກັບຄືນໄດ້',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ດຳເນີນການຕໍ່',
      cancelButtonText: 'ບໍ່, ຍົກເລິກ',
      reverseButtons: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      customClass: {
        confirmButton: 'swal2-confirm',
        cancelButton: 'swal2-cancel'
      }
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
      }

      await loadDayOffRequests()

      Swal.fire({
        title: "Success",
        text: `Request ${newStatus.toLowerCase()} successfully`,
        icon: "success"
      })

    } catch (error) {
      console.error('Error updating status:', error)
      Swal.fire({
        title: "Error",
        text: "Failed to update request status",
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
    return status
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
            <h1 className="text-3xl font-bold text-gray-900">ຂໍ້ມູນການລາພັກວຽກ</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportToPDF}
              disabled={loading || filteredRequests.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
        <div className="flex items-center gap-4 mb-4 bg-white p-4 rounded-lg shadow-sm">
          <div>
            <label className="text-xs text-gray-600 font-medium mb-1 block">ປີ</label>
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
            <label className="text-xs text-gray-600 font-medium mb-1 block">ເດືອນ</label>
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
            <label className="text-xs text-gray-600 font-medium mb-1 block">ພະແໜກ</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full border border-[#E5E7EB] rounded px-3 py-2 text-sm"
            >
              <option value="">ພະແໜກທັງໝົດ</option>

              {departments.map((dept: DepartmentData) => (
                <option key={dept._id} value={dept._id}>
                  {dept.department_name}
                </option>
              ))}
            </select>

          </div>
          {/* Day off type */}
          <div>
            <label className="text-xs text-gray-600 font-medium mb-1 block">ປະເພດ</label>
            <select
              value={filterDayOffType}
              onChange={(e) => setFilterDayOffType(e.target.value as DayOffType | 'ALL')}
              className="w-full border border-[#E5E7EB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1F3A5F]"
            >
              <option value="ALL">ປະເພດທັງໝົດ</option>
              <option value="FULL_DAY">ໝົດມື້</option>
              <option value="HALF_DAY">ເຄີ່ງມື້</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-600 font-medium mb-1 block">ສະຖານະ</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as RequestStatus | 'ALL')}
              className="w-full border border-[#E5E7EB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1F3A5F]"
            >
              <option value="ALL">ສະຖານະທັງໝົດ</option>
              <option value="Pending">ກຳລັງດຳເນີນການ</option>
              <option value="Accepted">ອະນຸມັດແລ້ວ</option>
              <option value="Rejected">ປະຕິເສດ</option>
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">ມື້</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">ເລືອງ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">ສະຖານະ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500 text-sm">
                      Loading...
                    </td>
                  </tr>
                ) : filteredRequests.map((request) => {
                  const isDisabled = request.status === 'Rejected' || request.status === 'Accepted'
                  return (
                    <tr key={request._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3.5 text-gray-900 text-sm whitespace-nowrap">{getUserName(request.employee_id || request.user_id)}</td>
                      <td className="px-4 py-3.5 text-gray-900 font-medium text-sm whitespace-nowrap">{request.day_off_type}</td>
                      <td className="px-4 py-3.5 text-gray-900 font-semibold text-sm whitespace-nowrap">{request.date_off_number}</td>
                      <td className="px-4 py-3.5 text-gray-900 text-sm whitespace-nowrap">{request.title}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-md text-xs font-medium ${getStatusColor(request.status)}`}>
                          {getStatusLabel(request.status)}
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
                            onClick={() => handleEdit(request)}
                            disabled={loading || isDisabled}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${isDisabled
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-[#45CC67] hover:bg-[#1fd371] text-white'
                              }`}
                          >
                            <FaEdit className="text-xs" /> ແກ້ໄຂ
                          </button>
                          <button
                            onClick={() => handleStatusChange(request._id, 'Rejected')}
                            disabled={loading || isDisabled}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${isDisabled
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-red-600 text-white hover:bg-red-700'
                              }`}
                          >
                            <FaTrash className="text-xs" /> ຍົກເລີກ
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {!loading && filteredRequests.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No requests found for the selected filters
            </div>
          )}
        </div>
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
                  <p className="w-full px-3 py-4 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF] mt-1">{getUserName(selectedRequest.employee_id || selectedRequest.user_id)}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">ຫົວໜ້າ</label>
                  <p className="w-full px-3 py-4 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF] mt-1">{getUserName(selectedRequest.supervisor_id)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500">ເລືອງ</label>
                <p className="w-full px-3 py-4 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF] mt-1">{selectedRequest.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-500">ປະເພດມື້ພັກ</label>
                  <p className="w-full px-3 py-4 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF] mt-1">{selectedRequest.day_off_type}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">ຈຳນວນມື້</label>
                  <p className="w-full px-3 py-4 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF] mt-1">{selectedRequest.date_off_number} ມື້</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-500">ວັນທິ່ເລີ່ມ</label>
                  <p className="w-full px-3 py-4 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF] mt-1">{formatDateTime(selectedRequest.start_date_time)}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">ຮອດວັນທີ່</label>
                  <p className="w-full px-3 py-4 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF] mt-1">{formatDateTime(selectedRequest.end_date_time)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500">ສະຖານະປັດຈຸບັນ</label>
                <div className="mt-2">
                  <span className={`px-4 py-2 rounded-lg text-sm font-medium ${getStatusColor(selectedRequest.status)}`}>
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