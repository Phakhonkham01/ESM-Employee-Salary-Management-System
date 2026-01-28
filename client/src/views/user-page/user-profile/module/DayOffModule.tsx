// components/DayOffForm.tsx
import { useState, useEffect, useMemo } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Swal from 'sweetalert2'
import {
  X,
  Calendar,
  User,
  FileText,
  Clock,
  Sun,
  Moon,
  Coffee,
  AlertTriangle
} from 'lucide-react'
import { getAllUsers, UserData } from '@/services/Create_user/api'
import { getAllDepartments, DepartmentData } from '@/services/departments/api'
import { createDayOffRequest, updateDayOffRequest, DayOffRequestData } from '@/services/User_Page/day_off_request_api'

export interface DayOffFormData {
  _id?: string
  user_id: string
  employee_id: string
  supervisor_id: string
  day_off_type: 'FULL_DAY' | 'HALF_DAY'
  start_date_time: string
  end_date_time: string
  title: string
  status?: 'Pending' | 'Approved' | 'Rejected'
}

type Supervisor = {
  _id: string
  first_name_en: string
  last_name_en: string
  role: 'Supervisor'
  department_id?: string | string[] | { _id: string }[]
  status: 'Active' | 'Inactive' | 'On Leave'
}

type Props = {
  open: boolean
  onClose: () => void
  requestData?: DayOffFormData // For editing
  onSuccess?: () => void // Callback after successful submit
}

const DayOffForm = ({ open, onClose, requestData, onSuccess }: Props) => {
  /* =====================
     State
  ===================== */
  const [dayOffType, setDayOffType] = useState<'FULL_DAY' | 'HALF_DAY'>('FULL_DAY')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [halfDayPeriod, setHalfDayPeriod] = useState<'MORNING' | 'AFTERNOON'>('MORNING')
  const [title, setTitle] = useState('')
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [departments, setDepartments] = useState<DepartmentData[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  const auth = JSON.parse(localStorage.getItem('auth') || 'null')
  const loggedUser = auth?.user

  /* =====================
     Initialize form for edit mode
  ===================== */
  useEffect(() => {
    if (requestData) {
      setIsEditMode(true)

      // Parse day off type
      setDayOffType(requestData.day_off_type)

      // Parse dates from ISO string
      const startDateTime = new Date(requestData.start_date_time)
      const endDateTime = new Date(requestData.end_date_time)

      if (requestData.day_off_type === 'FULL_DAY') {
        setStartDate(startDateTime)
        setEndDate(endDateTime)
      } else {
        // For half day, check period based on time
        setStartDate(startDateTime)
        const hour = startDateTime.getHours()
        setHalfDayPeriod(hour < 12 ? 'MORNING' : 'AFTERNOON')
      }

      // Set other fields
      setTitle(requestData.title || '')
    } else {
      setIsEditMode(false)
      resetForm()
    }
  }, [requestData, open])

  /* =====================
     Load supervisors and departments
  ===================== */
  useEffect(() => {
    if (!open) return

    const loadSupervisors = async () => {
      try {
        const response = await getAllUsers()

        // Filter users with role 'Supervisor' and active status
        const supervisorUsers = response.users.filter((user: UserData) =>
          user.role === 'Supervisor' && user.status === 'Active'
        )

        // Transform to Supervisor type
        const transformedSupervisors: Supervisor[] = supervisorUsers.map((user: UserData) => ({
          _id: user._id,
          first_name_en: user.first_name_en,
          last_name_en: user.last_name_en,
          role: user.role as 'Supervisor',
          department_id: user.department_id,
          status: user.status as 'Active' | 'Inactive' | 'On Leave'
        }))

        setSupervisors(transformedSupervisors)
      } catch (error) {
        setSupervisors([])
      }
    }

    loadSupervisors()
  }, [open])

  useEffect(() => {
    if (!open) return
    getAllDepartments()
      .then((res) => {
        setDepartments(res.departments || [])
      })
      .catch(error => {
        console.error('Error loading departments:', error)
        setDepartments([])
      })
  }, [open])

  /* =====================
     Normalize department IDs
  ===================== */
  const normalizeDeptIds = (dept: any): string[] => {
    if (!dept) return []
    if (Array.isArray(dept)) {
      return dept.map(d => {
        if (typeof d === 'string') return d
        if (typeof d === 'object' && d?._id) return d._id
        return null
      }).filter((id): id is string => id !== null)
    }
    if (typeof dept === 'string') return [dept]
    if (typeof dept === 'object' && dept._id) return [dept._id]
    return []
  }

  /* =====================
     Find user's department(s)
  ===================== */
  const userDepartments = useMemo(() => {
    if (!loggedUser?.department_id || departments.length === 0) return []
    const userDeptIds = normalizeDeptIds(loggedUser.department_id)
    return departments.filter(dept => userDeptIds.includes(dept._id))
  }, [departments, loggedUser?.department_id])

  /* =====================
     Find user's supervisor automatically
  ===================== */
  const userSupervisor = useMemo(() => {
    if (!loggedUser?.department_id || supervisors.length === 0) return null

    const userDeptIds = normalizeDeptIds(loggedUser.department_id)

    // Find supervisor in the same department
    const matchingSupervisor = supervisors.find(s => {
      const sDeptIds = normalizeDeptIds(s.department_id)
      return sDeptIds.some(id => userDeptIds.includes(id))
    })

    return matchingSupervisor || null
  }, [supervisors, loggedUser?.department_id])

  const selectedSupervisor = useMemo(() => {
    // First check if we have the original supervisor from requestData
    if (isEditMode && requestData?.supervisor_id) {
      const originalSupervisor = supervisors.find(s => s._id === requestData.supervisor_id)
      if (originalSupervisor) {
        return originalSupervisor
      }
    }

    return userSupervisor
  }, [isEditMode, requestData?.supervisor_id, supervisors, userSupervisor])


  /* =====================
     Date Range for Current Month
  ===================== */
  const today = new Date()
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  /* =====================
     Helpers
  ===================== */
  const getDateTimeForFullDay = (date: Date, isStart: boolean) => {
    const d = new Date(date)
    if (isStart) {
      d.setHours(0, 0, 0, 0) // Start of day
    } else {
      d.setHours(23, 59, 59, 999) // End of day
    }
    return d.toISOString()
  }

  const getDateTimeForHalfDay = (date: Date, period: 'MORNING' | 'AFTERNOON') => {
    const d = new Date(date)
    if (period === 'MORNING') {
      // Morning: 8:30 AM to 12:00 PM
      d.setHours(8, 30, 0, 0)
      return {
        start: d.toISOString(),
        end: new Date(d.setHours(12, 0, 0, 0)).toISOString()
      }
    } else {
      // Afternoon: 1:30 PM to 5:00 PM
      d.setHours(13, 30, 0, 0)
      return {
        start: d.toISOString(),
        end: new Date(d.setHours(17, 0, 0, 0)).toISOString()
      }
    }
  }

  /* =====================
     Calculate Total Days
  ===================== */
  const calculateTotalDays = () => {
    if (dayOffType === 'FULL_DAY') {
      if (!startDate || !endDate) return 0
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays + 1 // Include both start and end day
    } else {
      // HALF_DAY
      return 0.5
    }
  }

  const totalDays = calculateTotalDays()

  const resetForm = () => {
    setDayOffType('FULL_DAY')
    setStartDate(null)
    setEndDate(null)
    setHalfDayPeriod('MORNING')
    setTitle('')
    setIsSubmitting(false)
  }

  /* =====================
     Validation
  ===================== */
  const validateForm = (): { valid: boolean; message?: string } => {
    // Check user login
    if (!loggedUser?._id) {
      return { valid: false, message: 'ຜູ້ໃຊ້ບໍ່ໄດ້ເຂົ້າສູ່ລະບົບ' }
    }

    // Check supervisor exists
    if (!selectedSupervisor) {
      return {
        valid: false,
        message: 'ບໍ່ມີຫົວໜ້າໃນລະບົບ.'
      }
    }


    // Check date
    if (!startDate) {
      return { valid: false, message: 'ກະລຸນາເລືອກວັນທີ' }
    }

    if (dayOffType === 'FULL_DAY' && !endDate) {
      return { valid: false, message: 'ກະລຸນາເລືອກວັນທີສິ້ນສຸດ' }
    }

    if (!title.trim()) {
      return { valid: false, message: 'ກະລຸນາໃສ່ເຫດຜົນ' }
    }

    if (dayOffType === 'FULL_DAY' && endDate && endDate < startDate) {
      return {
        valid: false,
        message: 'ວັນທີສິ້ນສຸດຕ້ອງຊ້າກວ່າ ຫຼື ເທົ່າກັບວັນທີເລີ່ມຕົ້ນ'
      }
    }

    return { valid: true }
  }

  /* =====================
     Submit Handler
  ===================== */
  const handleSubmit = async () => {
    // Validate form
    const validation = validateForm()
    if (!validation.valid) {
      Swal.fire({
        icon: 'error',
        title: 'ຂໍ້ຜິດພາດ',
        text: validation.message,
        confirmButtonColor: '#2563eb',
      })
      return
    }

    let startDateTime: string
    let endDateTime: string

    if (dayOffType === 'FULL_DAY') {
      startDateTime = getDateTimeForFullDay(startDate!, true)
      endDateTime = getDateTimeForFullDay(endDate!, false)
    } else {
      // HALF_DAY
      const halfDayTimes = getDateTimeForHalfDay(startDate!, halfDayPeriod)
      startDateTime = halfDayTimes.start
      endDateTime = halfDayTimes.end
    }

    setIsSubmitting(true)
    try {
      const formData = {
        user_id: isEditMode ? requestData!.user_id : loggedUser._id,
        employee_id: isEditMode ? requestData!.employee_id : loggedUser._id,
        supervisor_id: selectedSupervisor!._id,
        day_off_type: dayOffType,
        start_date_time: startDateTime,
        end_date_time: endDateTime,
        title,
      }

      if (isEditMode && requestData?._id) {
        // Update existing request
        await updateDayOffRequest(requestData._id, formData)
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'ແກ້ໄຂຄຳຂໍມື້ພັກສຳເລັດ',
          timer: 2000,
          showConfirmButton: false,

        })
      } else {
        // Create new request
        await createDayOffRequest(formData)
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'ສົ່ງຄຳຂໍມື້ພັກສຳເລັດ',
          timer: 2000,
          showConfirmButton: false,

        })
      }

      resetForm()
      onClose()
      if (onSuccess) {
        onSuccess()
      }

    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        title: isEditMode ? 'ແກ້ໄຂບໍ່ສຳເລັດ' : 'ສົ່ງຄຳຂໍບໍ່ສຳເລັດ',
        text: isEditMode
          ? 'ການແກ້ໄຂຄຳຂໍມື້ພັກບໍ່ສຳເລັດ. ກະລຸນາລອງໃໝ່ອີກຄັ້ງ.'
          : 'ສົ່ງຄຳຂໍມື້ພັກບໍ່ສຳເລັດ. ກະລຸນາລອງໃໝ່ອີກຄັ້ງ.',
        confirmButtonColor: '#2563eb',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-white p-6 text-black border-b border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-2xl font-bold">
                <Coffee className="inline mr-2" size={24} />
                {isEditMode ? 'ແກ້ໄຂຄຳຂໍມື້ພັກ' : 'ຄຳຂໍມື້ພັກ'}
              </h2>
              <p className="text-black text-sm">
                {isEditMode
                  ? 'ແກ້ໄຂຂໍ້ມູນການຂໍມື້ພັກ'
                  : 'ກະລຸນາຕື່ມຂໍ້ມູນການຂໍມື້ພັກຕາມຟອມຂ້າງລຸ່ມນີ້'
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={26} />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-8 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto no-scrollbar">
          {/* Mode Indicator */}
          {isEditMode && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <span className="font-medium">ສະຖານະ:</span> {requestData?.status || 'Pending'}
              </p>
            </div>
          )}

          {/* Auto Selected Supervisor Info */}
          <div className={`border rounded-lg p-4 ${selectedSupervisor ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
            <div className={`flex items-center gap-2 mb-1 ${selectedSupervisor ? 'text-green-700' : 'text-amber-700'}`}>
              <User size={16} />
              <span className="font-medium">ຫົວໜ້າທີ່ຮັບຜິດຊອບ</span>
            </div>
            {selectedSupervisor ? (
              <>
                <p className="text-sm text-green-800">
                  {selectedSupervisor.first_name_en} {selectedSupervisor.last_name_en}
                </p>
                {userDepartments.length > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    ພະແນກ: {userDepartments.map(dept => dept.department_name).join(', ')}
                  </p>
                )}

              </>
            ) : (
              <div>
                <p className="text-sm text-amber-800 flex items-center gap-1">
                  <AlertTriangle size={14} />
                  <span>ບໍ່ພົບຫົວໜ້າໃນລະບົບ</span>
                </p>
              </div>
            )}
          </div>

          {/* Day Off Type Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Clock size={18} className="text-blue-600" />
              ປະເພດການພັກ
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  if (isEditMode && requestData?.status !== 'Pending') return
                  setDayOffType('FULL_DAY')
                  setEndDate(null)
                }}
                disabled={isEditMode && requestData?.status !== 'Pending'}
                className={`flex-1 px-6 py-4 rounded-xl border-2 transition-all ${dayOffType === 'FULL_DAY'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-25'
                  } ${isEditMode && requestData?.status !== 'Pending' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex flex-col items-center">
                  <div className="text-lg font-semibold">ໝົດມື້</div>
                  <div className="text-sm text-gray-500 mt-1">ພັກທັງໝົດມື້</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isEditMode && requestData?.status !== 'Pending') return
                  setDayOffType('HALF_DAY')
                  setEndDate(null)
                }}
                disabled={isEditMode && requestData?.status !== 'Pending'}
                className={`flex-1 px-6 py-4 rounded-xl border-2 transition-all ${dayOffType === 'HALF_DAY'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-25'
                  } ${isEditMode && requestData?.status !== 'Pending' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex flex-col items-center">
                  <div className="text-lg font-semibold">ເຄິ່ງມື້</div>
                  <div className="text-sm text-gray-500 mt-1">ພັກສະເພາະຊ່ວງ</div>
                </div>
              </button>
            </div>
          </div>

          {/* Date Selection Section */}
          {dayOffType === 'FULL_DAY' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Date */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Calendar size={18} className="text-blue-600" />
                  ວັນທີເລີ່ມຕົ້ນ
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="ເລືອກວັນທີເລີ່ມ"
                  minDate={currentMonthStart}
                  maxDate={currentMonthEnd}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  readOnly={isEditMode && requestData?.status !== 'Pending'}
                />
                <p className="text-xs text-gray-500">
                  ສາມາດເລືອກວັນທີພາຍໃນເດືອນນີ້ເທົ່ານັ້ນ
                </p>
              </div>

              {/* End Date */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Calendar size={18} className="text-blue-600" />
                  ວັນທີສິ້ນສຸດ
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => setEndDate(date)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="ເລືອກວັນທີສິ້ນສຸດ"
                  minDate={startDate ?? currentMonthStart}
                  maxDate={currentMonthEnd}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  readOnly={isEditMode && requestData?.status !== 'Pending'}
                />
                <p className="text-xs text-gray-500">
                  ວັນທີສິ້ນສຸດຕ້ອງບໍ່ຕ່ຳກວ່າວັນທີເລີ່ມ
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Date for Half Day */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Calendar size={18} className="text-blue-600" />
                  ວັນທີພັກ
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="ເລືອກວັນທີ"
                  minDate={currentMonthStart}
                  maxDate={currentMonthEnd}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  readOnly={isEditMode && requestData?.status !== 'Pending'}
                />
              </div>

              {/* Half Day Period Selection */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Clock size={18} className="text-blue-600" />
                  ຊ່ວງເວລາທີ່ພັກ
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (isEditMode && requestData?.status !== 'Pending') return
                      setHalfDayPeriod('MORNING')
                    }}
                    disabled={isEditMode && requestData?.status !== 'Pending'}
                    className={`px-6 py-4 rounded-xl border-2 transition-all ${halfDayPeriod === 'MORNING'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-25'
                      } ${isEditMode && requestData?.status !== 'Pending' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <Sun size={20} className={halfDayPeriod === 'MORNING' ? 'text-blue-500' : 'text-gray-400'} />
                      <div className="text-left">
                        <div className="font-semibold">ຊ່ວງເຊົ້າ</div>
                        <div className="text-sm text-gray-500">8:30 AM - 12:00 PM</div>
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (isEditMode && requestData?.status !== 'Pending') return
                      setHalfDayPeriod('AFTERNOON')
                    }}
                    disabled={isEditMode && requestData?.status !== 'Pending'}
                    className={`px-6 py-4 rounded-xl border-2 transition-all ${halfDayPeriod === 'AFTERNOON'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-25'
                      } ${isEditMode && requestData?.status !== 'Pending' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <Moon size={20} className={halfDayPeriod === 'AFTERNOON' ? 'text-blue-500' : 'text-gray-400'} />
                      <div className="text-left">
                        <div className="font-semibold">ຊ່ວງບ່າຍ</div>
                        <div className="text-sm text-gray-500">1:30 PM - 5:00 PM</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FileText size={18} className="text-blue-600" />
              ເຫດຜົນ ແລະ ລາຍລະອຽດ
            </label>
            <textarea
              rows={4}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="ອະທິບາຍເຫດຜົນການຂໍມື້ພັກໃຫ້ຊັດເຈນ..."
              disabled={isEditMode && requestData?.status !== 'Pending'}
            />
          </div>

          {/* Total Days Display */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-gray-800">
                  ຈຳນວນມື້ພັກທັງໝົດ
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {dayOffType === 'FULL_DAY' && startDate && endDate
                    ? `${startDate.toLocaleDateString('en-GB')} ຫາ ${endDate.toLocaleDateString('en-GB')}`
                    : dayOffType === 'HALF_DAY' && startDate
                      ? `ວັນທີ ${startDate.toLocaleDateString('en-GB')} (${halfDayPeriod === 'MORNING' ? 'ເຊົ້າ' : 'ບາຍ'})`
                      : 'ກະລຸນາເລືອກວັນທີ'
                  }
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {totalDays > 0 ? totalDays.toFixed(1) : '0.0'}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {dayOffType === 'FULL_DAY' ? 'ມື້' : 'ມື້ (ເຄິ່ງມື້)'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-8 bg-gray-50">
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base"
            >
              ຍົກເລິກ
            </button>
            {(!isEditMode || (isEditMode && requestData?.status === 'Pending')) && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedSupervisor}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base shadow-md"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isEditMode ? 'ກຳລັງແກ້ໄຂ...' : 'ກຳລັງສົ່ງຄຳຂໍ...'}
                  </span>
                ) : (
                  isEditMode ? 'ບັນທຶກການປ່ຽນແປງ' : 'ຍື່ນຄຳຂໍມື້ພັກ'
                )}
              </button>
            )}
            {isEditMode && requestData?.status !== 'Pending' && (
              <div className="text-sm text-gray-600 flex items-center">
                ບໍ່ສາມາດແກ້ໄຂໄດ້ເນື່ອງຈາກຄຳຂໍໄດ້ຮັບການອະນຸມັດແລ້ວ
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DayOffForm