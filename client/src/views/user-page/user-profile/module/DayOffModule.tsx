import { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Swal from 'sweetalert2'

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
  const [dayOffType, setDayOffType] =
    useState<'FULL_DAY' | 'HALF_DAY'>('FULL_DAY')

  // 📅 Date (calendar)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  // ⏰ Half Day: Morning or Afternoon
  const [halfDayPeriod, setHalfDayPeriod] = useState<'MORNING' | 'AFTERNOON'>('MORNING')

  const [title, setTitle] = useState('')

  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [supervisorId, setSupervisorId] = useState('')

  // Admin only
  const [employeeId, setEmployeeId] = useState('')

  const auth = JSON.parse(localStorage.getItem('auth') || 'null')
  const loggedUser = auth?.user
  const role = loggedUser?.role // "Admin" | "Employee"

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
    setEmployeeId('')
    setSupervisorId('')
    setDayOffType('FULL_DAY')
    setStartDate(null)
    setEndDate(null)
    setTitle('')
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

    if (!supervisorId) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'ກະລຸນາເລືອກຫົວຫນ້າ',
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

    // 🔐 Decide employee_id
    const targetEmployeeId =
      role === 'Admin' ? employeeId : loggedUser._id

    if (!targetEmployeeId) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'ກະລຸນາເລືອກພະນັກງານ',
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

      if (endDate < startDate) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Date Range',
          text: 'ວັນທີສິ້ນສຸດຕ້ອງຊ້າກວ່າ ຫຼື ເທົ່າກັບວັນທີເລີ່ມຕົ້ນ',
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

    try {
      await createDayOffRequest({
        user_id: loggedUser._id,        // actor
        employee_id: targetEmployeeId,  // target employee
        supervisor_id: supervisorId,
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
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Day Off Request
        </h2>

        <div className="space-y-4">
          {/* Day Off Type */}
          <div>
            <label className="block text-sm font-medium mb-1">
              ປະເພດການພັກ
            </label>
            <select
              value={dayOffType}
              onChange={(e) => {
                setDayOffType(e.target.value as 'FULL_DAY' | 'HALF_DAY')
                // Reset end date when switching to half day
                if (e.target.value === 'HALF_DAY') {
                  setEndDate(null)
                }
              }}
              className="w-full h-[50px] px-3 py-2 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
            >
              <option value="FULL_DAY">ໝົດມື້</option>
              <option value="HALF_DAY">ເຄີ່ງມື້</option>
            </select>
          </div>

          {/* FULL DAY: Show Start Date and End Date */}
          {dayOffType === 'FULL_DAY' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  ວັນທີ່ເລີ່ມ
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select date"
                  minDate={currentMonthStart}
                  maxDate={currentMonthEnd}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  ຮອດ
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => setEndDate(date)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select date"
                  minDate={startDate ?? currentMonthStart}
                  maxDate={currentMonthEnd}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}

          {/* HALF DAY: Show only Date and Morning/Afternoon selector */}
          {dayOffType === 'HALF_DAY' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">
                  ວັນທີ່
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select date"
                  minDate={currentMonthStart}
                  maxDate={currentMonthEnd}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  ຊ່ວງເວລາ
                </label>
                <select
                  value={halfDayPeriod}
                  onChange={(e) =>
                    setHalfDayPeriod(e.target.value as 'MORNING' | 'AFTERNOON')
                  }className="w-full h-[50px] px-3 py-2 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                >
                  <option value="MORNING">ຊ່ວງເຊົ້າ (8:30 AM - 12:00 PM)</option>
                  <option value="AFTERNOON">ຊ່ວງບາຍ (1:30 PM - 5:00 PM)</option>
                </select>
              </div>
            </>
          )}

          {/* Supervisor */}
          <div>
            <label className="block text-sm font-medium mb-1">
              ຫົວໜ້າ
            </label>
            <select
              value={supervisorId}
              onChange={(e) => setSupervisorId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select Supervisor</option>
              {supervisors.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.first_name_en} {s.last_name_en}
                </option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium mb-1">
              ເລື່ອງ
            </label>
            <textarea
              rows={3}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-[50px] px-3 py-2 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
            />
          </div>

          {/* Total Days Off Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">
                ວັນພັກທັງໝົດ:
              </span>
              <span className="text-lg font-bold text-blue-600">
                {totalDays > 0 ? `${totalDays} ${totalDays === 1 ? 'day' : 'days'}` : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
          >
            ຍົກເລີກ
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            ຍືນຍັນ
          </button>
        </div>
      </div>
    </div>
  )
}

export default DayOffModule