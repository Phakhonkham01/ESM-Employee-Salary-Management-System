import React, { useState, useEffect } from 'react'
import { FaTimes } from 'react-icons/fa'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import type { UserData } from '../../../services/Create_user/api'
import type { DayOffRequest } from '@/services/Day_off_api/api'
import { getAllDepartments, type DepartmentData } from '@/services/departments/api'

type DayOffType = 'FULL_DAY' | 'HALF_DAY'

interface EditFormRequestProps {
  showModal: boolean
  setShowModal: (show: boolean) => void
  selectedRequest: DayOffRequest | null
  users: UserData[]
  loading: boolean
  onUpdate: (requestId: string, formData: {
    employee_id: string
    supervisor_id: string
    department_id: string
    day_off_type: DayOffType
    start_date_time: string
    end_date_time: string
    title: string
  }) => Promise<void>
}

const EditFormRequest: React.FC<EditFormRequestProps> = ({
  showModal,
  setShowModal,
  selectedRequest,
  users,
  loading,
  onUpdate
}) => {
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [halfDayPeriod, setHalfDayPeriod] = useState<'MORNING' | 'AFTERNOON'>('MORNING')
  const [departments, setDepartments] = useState<DepartmentData[]>([])
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  
  const [formData, setFormData] = useState({
    employee_id: '',
    supervisor_id: '',
    department_id: '',
    day_off_type: 'FULL_DAY' as DayOffType,
    start_date_time: '',
    end_date_time: '',
    title: '',
  })

  // Get current month's first and last day
  const getCurrentMonthRange = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return { firstDay, lastDay }
  }

  const { firstDay: minDate, lastDay: maxDate } = getCurrentMonthRange()

  // Filter users by role - only show Supervisors
  const supervisors = users.filter(user => user.role === 'Supervisor')

  // Filter employees by selected department
  const filteredEmployees = formData.department_id
    ? users.filter(
        user =>
          user.role === 'Employee' &&
          user.department_id?._id === formData.department_id
      )
    : []

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true)
      try {
        const response = await getAllDepartments()
        setDepartments(response.departments)
      } catch (error) {
        console.error('Error fetching departments:', error)
      } finally {
        setLoadingDepartments(false)
      }
    }

    if (showModal) {
      fetchDepartments()
    }
  }, [showModal])

  // Load selected request data
  useEffect(() => {
    if (selectedRequest && showModal) {
      const employeeId = typeof selectedRequest.employee_id === 'object' 
        ? selectedRequest.employee_id._id 
        : selectedRequest.employee_id || (typeof selectedRequest.user_id === 'object' ? selectedRequest.user_id._id : selectedRequest.user_id)
      
      const supervisorId = typeof selectedRequest.supervisor_id === 'object'
        ? selectedRequest.supervisor_id._id
        : selectedRequest.supervisor_id

      // Find employee's department
      const employee = users.find(u => u._id === employeeId)
      const departmentId = employee?.department_id?._id || ''

      setFormData({
        employee_id: employeeId,
        supervisor_id: supervisorId,
        department_id: departmentId,
        day_off_type: selectedRequest.day_off_type,
        start_date_time: new Date(selectedRequest.start_date_time).toISOString().slice(0, 16),
        end_date_time: new Date(selectedRequest.end_date_time).toISOString().slice(0, 16),
        title: selectedRequest.title,
      })

      const start = new Date(selectedRequest.start_date_time)
      const end = new Date(selectedRequest.end_date_time)
      setStartDate(start)
      setEndDate(end)

      // Detect half-day period
      if (selectedRequest.day_off_type === 'HALF_DAY') {
        const hours = start.getHours()
        setHalfDayPeriod(hours < 13 ? 'MORNING' : 'AFTERNOON')
      }
    }
  }, [selectedRequest, showModal, users])

  // Half day time presets
  const getHalfDayTimes = (period: 'MORNING' | 'AFTERNOON') => {
    if (period === 'MORNING') {
      return { start: '08:30', end: '12:00' }
    } else {
      return { start: '13:30', end: '17:00' }
    }
  }

  // Update formData when date changes
  useEffect(() => {
    if (formData.day_off_type === 'HALF_DAY' && startDate) {
      const times = getHalfDayTimes(halfDayPeriod)
      const [startHours, startMinutes] = times.start.split(':')
      const [endHours, endMinutes] = times.end.split(':')

      const startDateTime = new Date(startDate)
      startDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0)

      const endDateTime = new Date(startDate)
      endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0)

      setFormData(prev => ({
        ...prev,
        start_date_time: startDateTime.toISOString().slice(0, 16),
        end_date_time: endDateTime.toISOString().slice(0, 16)
      }))

      setEndDate(startDate)
    } else if (formData.day_off_type === 'FULL_DAY') {
      if (startDate) {
        const dateTime = new Date(startDate)
        dateTime.setHours(8, 30, 0, 0)
        setFormData(prev => ({ ...prev, start_date_time: dateTime.toISOString().slice(0, 16) }))
      }
      if (endDate) {
        const dateTime = new Date(endDate)
        dateTime.setHours(17, 0, 0, 0)
        setFormData(prev => ({ ...prev, end_date_time: dateTime.toISOString().slice(0, 16) }))
      }
    }
  }, [startDate, endDate, formData.day_off_type, halfDayPeriod])

  if (!showModal || !selectedRequest) return null

  // Calculate days off correctly
  const calculatedDaysOff = (() => {
    if (!formData.start_date_time || !formData.end_date_time) return 0
    
    const start = new Date(formData.start_date_time)
    const end = new Date(formData.end_date_time)
    
    if (formData.day_off_type === 'HALF_DAY') {
      return 0.5
    } else {
      const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate())
      const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate())
      const diffTime = endDay.getTime() - startDay.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
      return diffDays
    }
  })()

  const handleClose = () => {
    setShowModal(false)
  }

  const handleSubmit = async () => {
    if (!selectedRequest?._id) return
    await onUpdate(selectedRequest._id, formData)
  }

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-900">Edit Day Off Request</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes className="text-2xl" />
          </button>
        </div>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Department *</label>
              <select
                value={formData.department_id}
                onChange={(e) => {
                  const newDeptId = e.target.value
                  setFormData({ 
                    ...formData, 
                    department_id: newDeptId,
                    employee_id: ''
                  })
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loadingDepartments}
              >
                <option value="">
                  {loadingDepartments ? 'Loading departments...' : 'Select Department'}
                </option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>
                    {dept.department_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Employee *</label>
              <select
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!formData.department_id}
              >
                <option value="">
                  {!formData.department_id ? 'Please select a department first' : 'Select Employee'}
                </option>
                {filteredEmployees.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.first_name_en} {user.last_name_en}
                  </option>
                ))}
              </select>
              {formData.department_id && filteredEmployees.length === 0 && (
                <p className="text-sm text-amber-600 mt-1">No employees found in this department</p>
              )}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Supervisor *</label>
              <select
                value={formData.supervisor_id}
                onChange={(e) => setFormData({ ...formData, supervisor_id: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Supervisor</option>
                {supervisors.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.first_name_en} {user.last_name_en}
                  </option>
                ))}
              </select>
              {supervisors.length === 0 && (
                <p className="text-sm text-amber-600 mt-1">No supervisors found</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Reason *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Family Vacation"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Day Off Type *</label>
            <select
              value={formData.day_off_type}
              onChange={(e) => {
                const newType = e.target.value as DayOffType
                setFormData({ ...formData, day_off_type: newType })
                if (newType === 'HALF_DAY') {
                  setEndDate(null)
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="FULL_DAY">FULL_DAY</option>
              <option value="HALF_DAY">HALF_DAY</option>
            </select>
          </div>

          {formData.day_off_type === 'HALF_DAY' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Period *</label>
              <select
                value={halfDayPeriod}
                onChange={(e) => setHalfDayPeriod(e.target.value as 'MORNING' | 'AFTERNOON')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="MORNING">Morning (08:30 - 12:00)</option>
                <option value="AFTERNOON">Afternoon (13:30 - 17:00)</option>
              </select>
            </div>
          )}

          {formData.day_off_type === 'FULL_DAY' ? (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date *</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => {
                    setStartDate(date)
                    if (date && endDate && endDate < date) {
                      setEndDate(null)
                    }
                  }}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select date"
                  minDate={minDate}
                  maxDate={maxDate}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">End Date *</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => setEndDate(date)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select date"
                  minDate={startDate ?? minDate}
                  maxDate={maxDate}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select date"
                  minDate={minDate}
                  maxDate={maxDate}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Time Period</p>
                <p className="text-lg font-bold text-blue-600">
                  {getHalfDayTimes(halfDayPeriod).start} - {getHalfDayTimes(halfDayPeriod).end}
                </p>
              </div>
            </>
          )}

          {formData.start_date_time && formData.end_date_time && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Days Off</p>
                  <p className="text-4xl font-bold text-blue-600">{calculatedDaysOff}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">From</p>
                  <p className="font-semibold text-gray-900">{startDate?.toLocaleDateString('en-GB')}</p>
                  <p className="text-sm text-gray-600 mt-2">To</p>
                  <p className="font-semibold text-gray-900">{endDate?.toLocaleDateString('en-GB')}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-end pt-6 border-t border-gray-200">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditFormRequest