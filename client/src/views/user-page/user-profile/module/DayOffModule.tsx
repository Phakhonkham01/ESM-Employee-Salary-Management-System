import { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

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
      .catch(console.error)
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

  /* =====================
     Submit
  ===================== */
  const handleSubmit = async () => {
    if (!loggedUser?._id) {
      alert('User not logged in')
      return
    }

    if (!supervisorId) {
      alert('Please select a supervisor')
      return
    }

    if (!startDate) {
      alert('Please select start date')
      return
    }

    if (dayOffType === 'FULL_DAY' && !endDate) {
      alert('Please select end date')
      return
    }

    if (!title.trim()) {
      alert('Please enter a reason')
      return
    }

    // 🔐 Decide employee_id
    const targetEmployeeId =
      role === 'Admin' ? employeeId : loggedUser._id

    if (!targetEmployeeId) {
      alert('Please select an employee')
      return
    }

    let startDateTime: string
    let endDateTime: string

    if (dayOffType === 'FULL_DAY') {
      if (!endDate) {
        alert('Please select end date')
        return
      }
      
      if (endDate < startDate) {
        alert('End date must be later than or equal to start date')
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

      onClose()
    } catch (error) {
      console.error(error)
      alert('Failed to submit day off request')
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
              Day Off Type
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
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="FULL_DAY">Full Day</option>
              <option value="HALF_DAY">Half Day</option>
            </select>
          </div>

          {/* FULL DAY: Show Start Date and End Date */}
          {dayOffType === 'FULL_DAY' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Start Date
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
                  End Date
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
                  Date
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
                  Period
                </label>
                <select
                  value={halfDayPeriod}
                  onChange={(e) =>
                    setHalfDayPeriod(e.target.value as 'MORNING' | 'AFTERNOON')
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="MORNING">Morning (8:30 AM - 12:00 PM)</option>
                  <option value="AFTERNOON">Afternoon (1:30 PM - 5:00 PM)</option>
                </select>
              </div>
            </>
          )}

          {/* Employee (Admin only) */}
          {role === 'Admin' && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Employee
              </label>
              <input
                type="text"
                placeholder="Employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          )}

          {/* Supervisor */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Supervisor
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
              Reason
            </label>
            <textarea
              rows={3}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {/* Total Days Off Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">
                Total Days Off:
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
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}

export default DayOffModule