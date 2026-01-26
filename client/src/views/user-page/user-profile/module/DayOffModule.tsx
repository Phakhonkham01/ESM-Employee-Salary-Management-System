import { useEffect, useState, useMemo } from 'react'
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

import { getSupervisors, Supervisor } from '@/services/User_Page/user_api'
import { createDayOffRequest } from '@/services/User_Page/day_off_request_api'

type Props = {
  open: boolean
  onClose: () => void
}

const DayOffModule = ({ open, onClose }: Props) => {
  /* =====================
     State
  ===================== */
  const [dayOffType, setDayOffType] = useState<'FULL_DAY' | 'HALF_DAY'>('FULL_DAY')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [halfDayPeriod, setHalfDayPeriod] = useState<'MORNING' | 'AFTERNOON'>('MORNING')
  const [title, setTitle] = useState('')
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const auth = JSON.parse(localStorage.getItem('auth') || 'null')
  const loggedUser = auth?.user
  const role = loggedUser?.role // "Admin" | "Employee"

  /* =====================
     Find user's supervisor automatically
  ===================== */
  const userSupervisor = useMemo(() => {
    if (!loggedUser?.department_id || !supervisors.length) {
      return null
    }
    
    // Find supervisor who is in the same department as the user
    return supervisors.find(supervisor => 
      supervisor.department_id === loggedUser.department_id
    ) || null
  }, [supervisors, loggedUser?.department_id])

  /* =====================
     Find any available supervisor (fallback)
  ===================== */
  const fallbackSupervisor = useMemo(() => {
    if (supervisors.length > 0 && !userSupervisor) {
      // Return first active supervisor as fallback
      const activeSupervisors = supervisors.filter(s => s.status === 'Active')
      return activeSupervisors.length > 0 ? activeSupervisors[0] : supervisors[0]
    }
    return null
  }, [supervisors, userSupervisor])

  // Use fallback if no department-specific supervisor found
  const selectedSupervisor = userSupervisor || fallbackSupervisor

  /* =====================
     Date Range for Current Month
  ===================== */
  const today = new Date()
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  /* =====================
     Load supervisors
  ===================== */
  useEffect(() => {
    if (!open) return

    getSupervisors()
      .then((res) => setSupervisors(res.supervisors))
      .catch((error) => {
        console.error(error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load supervisors',
          confirmButtonColor: '#2563eb',
        })
      })
  }, [open])

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
    setTitle('')
    setIsSubmitting(false)
  }

  /* =====================
     Submit
  ===================== */
  const handleSubmit = async () => {
    if (!loggedUser?._id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'ຜູ້ໃຊ້ບໍ່ໄດ້ເຂົ້າສູ່ລະບົບ',
        confirmButtonColor: '#2563eb',
      })
      return
    }

    // Check if supervisor exists
    if (!selectedSupervisor) {
      Swal.fire({
        icon: 'error',
        title: 'ບໍ່ພົບຫົວໜ້າ',
        text: 'ບໍ່ມີຫົວໜ້າໃນລະບົບ. ກະລຸນາຕິດຕໍ່ຜູ້ເບິ່ງແຍງລະບົບ.',
        confirmButtonColor: '#2563eb',
      })
      return
    }

    if (!startDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'ກະລຸນາເລືອກວັນທີເລີ່ມຕົ້ນ',
        confirmButtonColor: '#2563eb',
      })
      return
    }

    if (dayOffType === 'FULL_DAY' && !endDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'ກະລຸນາເລືອກວັນທີສິ້ນສຸດ',
        confirmButtonColor: '#2563eb',
      })
      return
    }

    if (!title.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'ກະລຸນາໃສ່ເຫດຜົນ',
        confirmButtonColor: '#2563eb',
      })
      return
    }

    if (dayOffType === 'FULL_DAY' && endDate && endDate < startDate) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Date Range',
        text: 'ວັນທີສິ້ນສຸດຕ້ອງຊ້າກວ່າ ຫຼື ເທົ່າກັບວັນທີເລີ່ມຕົ້ນ',
        confirmButtonColor: '#2563eb',
      })
      return
    }

    let startDateTime: string
    let endDateTime: string

    if (dayOffType === 'FULL_DAY') {
      if (!endDate) {
        Swal.fire({
          icon: 'warning',
          title: 'Missing Information',
          text: 'ກະລຸນາເລືອກວັນທີສິ້ນສຸດ',
          confirmButtonColor: '#2563eb',
        })
        return
      }

      startDateTime = getDateTimeForFullDay(startDate, true)
      endDateTime = getDateTimeForFullDay(endDate, false)
    } else {
      // HALF_DAY
      const halfDayTimes = getDateTimeForHalfDay(startDate, halfDayPeriod)
      startDateTime = halfDayTimes.start
      endDateTime = halfDayTimes.end
    }

    setIsSubmitting(true)
    try {
      await createDayOffRequest({
        user_id: loggedUser._id,        // actor
        employee_id: loggedUser._id,    // target employee (always the logged user)
        supervisor_id: selectedSupervisor._id, // Auto select supervisor
        day_off_type: dayOffType,
        start_date_time: startDateTime,
        end_date_time: endDateTime,
        title,
      })

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'ສົ່ງຄຳຂໍມື້ພັກສຳເລັດ',
        confirmButtonColor: '#2563eb',
        timer: 2000,
      })

      resetForm()
      onClose()

    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: 'ສົ່ງຄຳຂໍມື້ພັກບໍ່ສຳເລັດ',
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
            <h2 className="text-2xl font-bold">
              <Coffee className="inline mr-2" size={24} />
              ຄຳຂໍມື້ພັກ
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={26} />
            </button>
          </div>
          <p className="text-black text-sm">
            ກະລຸນາຕື່ມຂໍ້ມູນການຂໍມື້ພັກຕາມຟອມຂ້າງລຸ່ມນີ້
          </p>
        </div>

        {/* Form */}
        <div className="p-8 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto no-scrollbar">
          {/* Auto Selected Supervisor Info */}
          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-700 mb-1">
              <User size={16} />
              <span className="font-medium">ຫົວໜ້າທີ່ຮັບຜິດຊອບ</span>
            </div>
            {selectedSupervisor ? (
              <>
                <p className="text-sm text-green-800">
                  {selectedSupervisor.first_name_en} {selectedSupervisor.last_name_en}
                  {selectedSupervisor.status !== 'Active' && (
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                      ({selectedSupervisor.status})
                    </span>
                  )}
                </p>
                {userSupervisor ? (
                  <p className="text-xs text-green-600 mt-1">
                    ຫົວໜ້າພາກສ່ວນຂອງທ່ານ
                  </p>
                ) : (
                  <p className="text-xs text-green-600 mt-1">
                    ຫົວໜ້າທີ່ພົບໄດ້ (ການຈັດການຊົ່ວຄາວ)
                  </p>
                )}
              </>
            ) : (
              <div>
                <p className="text-sm text-green-800 flex items-center gap-1">
                  <AlertTriangle size={14} />
                  <span>ກຳລັງຄົ້ນຫາຫົວໜ້າ...</span>
                </p>
                <p className="text-xs text-green-600 mt-1">
                  (ລະບົບຈະສົ່ງຄຳຂໍໃຫ້ຫົວໜ້າທີ່ພົບໄດ້ອັດຕະໂນມັດ)
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
                  setDayOffType('FULL_DAY')
                  setEndDate(null)
                }}
                className={`flex-1 px-6 py-4 rounded-xl border-2 transition-all ${dayOffType === 'FULL_DAY'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-25'
                  }`}
              >
                <div className="flex flex-col items-center">
                  <div className="text-lg font-semibold">ໝົດມື້</div>
                  <div className="text-sm text-gray-500 mt-1">ພັກທັງໝົດມື້</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDayOffType('HALF_DAY')
                  setEndDate(null)
                }}
                className={`flex-1 px-6 py-4 rounded-xl border-2 transition-all ${dayOffType === 'HALF_DAY'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-25'
                  }`}
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
                    onClick={() => setHalfDayPeriod('MORNING')}
                    className={`px-6 py-4 rounded-xl border-2 transition-all ${halfDayPeriod === 'MORNING'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-25'
                      }`}
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
                    onClick={() => setHalfDayPeriod('AFTERNOON')}
                    className={`px-6 py-4 rounded-xl border-2 transition-all ${halfDayPeriod === 'AFTERNOON'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-25'
                      }`}
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
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedSupervisor}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base shadow-md"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ກຳລັງສົ່ງຄຳຂໍ...
                </span>
              ) : (
                'ຍື່ນຄຳຂໍມື້ພັກ'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DayOffModule