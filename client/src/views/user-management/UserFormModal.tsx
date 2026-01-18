'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { createUser, updateUser } from '../../services/Create_user/api'
import {
  getAllDepartments,
  getAllPositions,
  getPositionsByDepartment,
  updateDepartment,
  deleteDepartment,
  updatePosition,
  deletePosition,
} from '../../services/departments/api'
import type { CreateUserData, UserData } from '../../services/Create_user/api'
import type {
  DepartmentData,
  PositionData,
} from '../../services/departments/api'
import {
  HiUserAdd,
  HiPencil,
  HiX,
  HiPlus,
  HiCheckCircle,
  HiXCircle,
  HiOutlinePencil,
  HiOutlineTrash
} from 'react-icons/hi'
import DepartmentModal from './Department_Position/DepartmentModal'
import PositionModal from './Department_Position/PositionModal'
import Swal from 'sweetalert2'

interface UserFormModalProps {
  isOpen: boolean
  onClose: () => void
  editingUser: UserData | null
  onSuccess: () => void
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  editingUser,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<
    Omit<CreateUserData, 'base_salary'> & { base_salary: number }
  >({
    email: '',
    password: '',
    role: 'Employee',
    first_name_en: '',
    last_name_en: '',
    nickname_en: '',
    first_name_la: '',
    last_name_la: '',
    nickname_la: '',
    date_of_birth: '',
    start_work: '',
    vacation_days: 0,
    gender: 'Male',
    position_id: '',
    department_id: '',
    status: 'Active',
    base_salary: 0,
  })

  const [departments, setDepartments] = useState<DepartmentData[]>([])
  const [positions, setPositions] = useState<PositionData[]>([])
  const [filteredPositions, setFilteredPositions] = useState<PositionData[]>([])
  const [departmentModalOpen, setDepartmentModalOpen] = useState(false)
  const [positionModalOpen, setPositionModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const [loadingPositions, setLoadingPositions] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // 编辑模式状态
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null)
  const [editingPositionId, setEditingPositionId] = useState<string | null>(null)
  const [editDepartmentName, setEditDepartmentName] = useState('')
  const [editPositionName, setEditPositionName] = useState('')
  

  useEffect(() => {
    if (isOpen) {
      fetchDepartments()
      fetchAllPositions()

      if (editingUser && isOpen) {
        const baseSalary = editingUser.base_salary
        const salaryValue =
          typeof baseSalary === 'string'
            ? Number.parseFloat(baseSalary) || 0
            : typeof baseSalary === 'number'
              ? baseSalary
              : 0

        setFormData({
          email: editingUser.email,
          password: '',
          role: editingUser.role,
          first_name_en: editingUser.first_name_en,
          last_name_en: editingUser.last_name_en,
          nickname_en: editingUser.nickname_en,
          first_name_la: editingUser.first_name_la,
          last_name_la: editingUser.last_name_la,
          nickname_la: editingUser.nickname_la,
          date_of_birth: editingUser.date_of_birth.split('T')[0],
          start_work: editingUser.start_work.split('T')[0],
          vacation_days: editingUser.vacation_days,
          gender: editingUser.gender,
          position_id:
            typeof editingUser.position_id === 'string'
              ? editingUser.position_id
              : editingUser.position_id?._id,
          department_id:
            typeof editingUser.department_id === 'string'
              ? editingUser.department_id
              : editingUser.department_id?._id,
          status: editingUser.status,
          base_salary: salaryValue,
        })
      } else if (!editingUser && isOpen) {
        resetForm()
      }
    }
  }, [isOpen, editingUser])

  useEffect(() => {
    if (formData.department_id) {
      fetchPositionsByDepartment(formData.department_id)

      if (editingUser && formData.position_id) {
        const positionExists = positions.some(
          (pos) =>
            pos._id === formData.position_id &&
            pos.department_id === formData.department_id,
        )
        if (!positionExists) {
          setFormData((prev) => ({ ...prev, position_id: '' }))
        }
      }
    } else {
      setFilteredPositions([])
      setFormData((prev) => ({ ...prev, position_id: '' }))
    }
  }, [formData.department_id, editingUser])

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true)
      const response = await getAllDepartments()
      setDepartments(response.departments || [])
    } catch (error) {
      console.error('Error fetching departments:', error)
      setMessage({ type: 'error', text: 'Failed to load departments' })
    } finally {
      setLoadingDepartments(false)
    }
  }

  const fetchAllPositions = async () => {
    try {
      setLoadingPositions(true)
      const response = await getAllPositions()
      setPositions(response.positions || [])
    } catch (error) {
      console.error('Error fetching positions:', error)
    } finally {
      setLoadingPositions(false)
    }
  }

  const fetchPositionsByDepartment = async (departmentId: string) => {
    try {
      setLoadingPositions(true)
      const response = await getPositionsByDepartment(departmentId)
      setFilteredPositions(response.positions || [])

      if (response.positions.length === 0) {
        setFormData((prev) => ({ ...prev, position_id: '' }))
      }
    } catch (error) {
      console.error('Error fetching positions by department:', error)
      setFilteredPositions([])
    } finally {
      setLoadingPositions(false)
    }
  }

  const handleDepartmentChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const departmentId = e.target.value
    setFormData((prev) => ({
      ...prev,
      department_id: departmentId,
      position_id: '',
    }))
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target

    if (name === 'vacation_days' || name === 'base_salary') {
      const numericValue = Number.parseFloat(value) || 0
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }))
    } else if (name === 'department_id') {
      handleDepartmentChange(e as React.ChangeEvent<HTMLSelectElement>)
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '')
    const numericValue = Number.parseFloat(value) || 0
    setFormData((prev) => ({
      ...prev,
      base_salary: numericValue,
    }))
  }

  const getSalaryDisplayValue = () => {
    if (formData.base_salary === 0) {
      return ''
    }
    return formData.base_salary.toString()
  }
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    const submitData: CreateUserData = {
      email: formData.email,
      password: formData.password,
      role: formData.role,
      first_name_en: formData.first_name_en,
      last_name_en: formData.last_name_en,
      nickname_en: formData.nickname_en,
      first_name_la: formData.first_name_la,
      last_name_la: formData.last_name_la,
      nickname_la: formData.nickname_la,
      date_of_birth: formData.date_of_birth,
      start_work: formData.start_work,
      vacation_days: formData.vacation_days,
      gender: formData.gender,
      position_id: formData.position_id,
      department_id: formData.department_id,
      status: formData.status,
      base_salary: formData.base_salary,
    }

    if (editingUser && !submitData.password) {
      delete submitData.password
    }

    if (editingUser) {
      await updateUser(editingUser._id, submitData)

      await Swal.fire({
        icon: 'success',
        title: 'Updated Successfully',
        text: 'User has been updated successfully.',
        timer: 1500,
        showConfirmButton: false,
      })
    } else {
      await createUser(submitData)

      await Swal.fire({
        icon: 'success',
        title: 'Created Successfully',
        text: 'User has been created successfully.',
        timer: 1500,
        showConfirmButton: false,
      })
    }

    onSuccess()
    resetForm()
    onClose()
  } catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'Operation Failed',
      text: error.message || 'An error occurred. Please try again.',
    })
  } finally {
    setLoading(false)
  }
}
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      role: 'Employee',
      first_name_en: '',
      last_name_en: '',
      nickname_en: '',
      first_name_la: '',
      last_name_la: '',
      nickname_la: '',
      date_of_birth: '',
      start_work: '',
      vacation_days: 0,
      gender: 'Male',
      position_id: '',
      department_id: '',
      status: 'Active',
      base_salary: 0,
    })
    setMessage(null)
    setEditingDepartmentId(null)
    setEditingPositionId(null)
    setEditDepartmentName('')
    setEditPositionName('')
    
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const handleDepartmentSuccess = () => {
    fetchDepartments()
  }

  const handlePositionSuccess = () => {
    fetchAllPositions()
    if (formData.department_id) {
      fetchPositionsByDepartment(formData.department_id)
    }
  }

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
  type: 'department' | 'position'
  id: string
  name: string
} | null>(null)
const handleEditPosition = (positionId: string, currentName: string) => { setEditingPositionId(positionId)}
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  // 编辑部门的函数
  const handleEditDepartment = (departmentId: string, currentName: string) => {
    setEditingDepartmentId(departmentId)
    setEditDepartmentName(currentName)
  }

  // 保存部门编辑
  const handleSaveDepartmentEdit = async () => {
    if (!editingDepartmentId || !editDepartmentName.trim()) return

    try {
      setLoadingDepartments(true)
      await updateDepartment(editingDepartmentId, {
        department_name: editDepartmentName
      })
      await fetchDepartments()
      setEditingDepartmentId(null)
      setEditDepartmentName('')
      setMessage({
        type: 'success',
        text: 'Department updated successfully'
      })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to update department'
      })
    } finally {
      setLoadingDepartments(false)
    }
  }

  // 删除部门

const handleDeleteDepartment = async (
  departmentId: string,
  departmentName: string
) => {
  const result = await Swal.fire({
    title: 'Delete Department?',
    html: `Department <b>${departmentName}</b> will be permanently removed.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#9B1C1C',
    cancelButtonColor: '#E5E7EB',
    reverseButtons: true,
  })

  if (!result.isConfirmed) return

  try {
    setLoadingDepartments(true)
    await deleteDepartment(departmentId)
    await fetchDepartments()

    if (formData.department_id === departmentId) {
      setFormData((prev) => ({
        ...prev,
        department_id: '',
        position_id: '',
      }))
    }

    Swal.fire({
      icon: 'success',
      title: 'Deleted',
      text: 'Department deleted successfully',
      timer: 1500,
      showConfirmButton: false,
    })
  } catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'Failed to delete department',
    })
  } finally {
    setLoadingDepartments(false)
  }
}

  // 确认删除部门
  

  // 编辑职位的函数
const handleDeletePosition = async (
  positionId: string,
  positionName: string
) => {
  const result = await Swal.fire({
    title: 'Delete Position?',
    html: `Position <b>${positionName}</b> will be permanently removed.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#9B1C1C',
    cancelButtonColor: '#E5E7EB',
    reverseButtons: true,
  })

  if (!result.isConfirmed) return

  try {
    setLoadingPositions(true)
    await deletePosition(positionId)
    await fetchAllPositions()

    if (formData.department_id) {
      await fetchPositionsByDepartment(formData.department_id)
    }

    if (formData.position_id === positionId) {
      setFormData((prev) => ({
        ...prev,
        position_id: '',
      }))
    }

    Swal.fire({
      icon: 'success',
      title: 'Deleted',
      text: 'Position deleted successfully',
      timer: 1500,
      showConfirmButton: false,
    })
  } catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'Failed to delete position',
    })
  } finally {
    setLoadingPositions(false)
  }
}

  // 保存职位编辑
  const handleSavePositionEdit = async () => {
    if (!editingPositionId || !editPositionName.trim()) return

    try {
      setLoadingPositions(true)
      await updatePosition(editingPositionId, {
        position_name: editPositionName
      })
      await fetchAllPositions()
      if (formData.department_id) {
        await fetchPositionsByDepartment(formData.department_id)
      }
      setEditingPositionId(null)
      setEditPositionName('')
      setMessage({
        type: 'success',
        text: 'Position updated successfully'
      })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to update position'
      })
    } finally {
      setLoadingPositions(false)
    }
  }

  // 删除职位

  // 确认删除职位


  if (!isOpen) return null

  const DatePicker = ({
    label,
    value,
    onChange,
    required = false,
  }: {
    label: string
    value: string
    onChange: (date: string) => void
    required?: boolean
  }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [viewDate, setViewDate] = useState(() => {
      if (value) {
        const [year, month, day] = value.split('-').map(Number)
        return new Date(year, month - 1, day)
      }
      return new Date()
    })

    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]

    const years = Array.from(
      { length: 100 },
      (_, i) => new Date().getFullYear() - 80 + i,
    )

    const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear()
      const month = date.getMonth()
      const firstDay = new Date(year, month, 1).getDay()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const days: (number | null)[] = []

      for (let i = 0; i < firstDay; i++) {
        days.push(null)
      }
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(i)
      }
      while (days.length < 42) {
        days.push(null)
      }
      return days
    }

    const handleSelectDate = (day: number) => {
      const year = viewDate.getFullYear()
      const month = viewDate.getMonth()
      const date = day

      const formatted = `${year}-${(month + 1).toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`
      onChange(formatted)
      setIsOpen(false)
    }

    const formatDisplayDate = (dateStr: string) => {
      if (!dateStr) return ''
      const [year, month, day] = dateStr.split('-').map(Number)
      const date = new Date(year, month - 1, day)

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }

    const selectedDate = value
      ? (() => {
          const [year, month, day] = value.split('-').map(Number)
          return new Date(year, month - 1, day)
        })()
      : null

    const handlePrevMonth = () => {
      setViewDate(
        new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1),
      )
    }

    const handleNextMonth = () => {
      setViewDate(
        new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1),
      )
    }

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const monthIndex = months.indexOf(e.target.value)
      setViewDate(new Date(viewDate.getFullYear(), monthIndex, 1))
    }

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setViewDate(
        new Date(parseInt(e.target.value), viewDate.getMonth(), 1),
      )
    }

    const days = getDaysInMonth(viewDate)
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

    const isDateSelected = (day: number) => {
      if (!selectedDate || !day) return false
      return (
        day === selectedDate.getDate() &&
        viewDate.getMonth() === selectedDate.getMonth() &&
        viewDate.getFullYear() === selectedDate.getFullYear()
      )
    }

    const isToday = (day: number) => {
      const today = new Date()
      return (
        day === today.getDate() &&
        viewDate.getMonth() === today.getMonth() &&
        viewDate.getFullYear() === today.getFullYear()
      )
    }

    return (
      <div className="relative">
        <label className="block text-sm font-normal text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
        <div
          className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F] cursor-pointer bg-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {value
            ? formatDisplayDate(value)
            : `Select ${label.toLowerCase()}`}
        </div>

        {isOpen && (
          <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg w-64">
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900"
                >
                  ‹
                </button>

                <div className="flex gap-2">
                  <select
                    value={months[viewDate.getMonth()]}
                    onChange={handleMonthChange}
                    className="text-sm border-none focus:ring-0 focus:outline-none bg-transparent"
                  >
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>

                  <select
                    value={viewDate.getFullYear()}
                    onChange={handleYearChange}
                    className="text-sm border-none focus:ring-0 focus:outline-none bg-transparent"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900"
                >
                  ›
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs text-gray-500 font-medium"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const selected = isDateSelected(day || 0)
                  const today = isToday(day || 0)

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() =>
                        day && handleSelectDate(day)
                      }
                      disabled={!day}
                      className={`
                        h-8 w-8 text-sm rounded flex items-center justify-center
                        ${!day ? 'invisible' : ''}
                        ${
                          selected
                            ? 'bg-[#1F3A5F] text-white'
                            : today
                              ? 'bg-blue-50 text-blue-600 border border-blue-200'
                              : 'text-gray-700 hover:bg-gray-100'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date()
                    const formatted = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`
                    onChange(formatted)
                    setIsOpen(false)
                  }}
                  className="w-full text-sm text-[#1F3A5F] hover:text-[#152642] font-medium py-1 hover:bg-gray-50 rounded"
                >
                  Select Today
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      
    >
      <div className="bg-white border border-gray-300 w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-[#27F584] px-6 py-4 flex items-center justify-between border-b border-[#27F584]">
          <div className="flex items-center gap-3 text-white">
            {editingUser ? (
              <>
                <div className="p-1">
                  <HiPencil className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-medium">
                    Edit User
                  </h2>
                </div>
              </>
            ) : (
              <>
                <div className="p-1">
                  <HiUserAdd className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-medium">
                    Create New User
                  </h2>
                  <p className="text-gray-300 text-xs mt-0.5">
                    User Registration Form
                  </p>
                </div>
              </>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/10 p-2 rounded transition-colors"
            title="Close"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] bg-gray-50">
          {message && (
            <div
              className={`mb-6 p-3 rounded border text-sm font-medium ${
                message.type === 'success'
                  ? 'bg-[#E6F4EA] border-[#2E7D32] text-[#2E7D32]'
                  : 'bg-[#FDE8E8] border-[#9B1C1C] text-[#9B1C1C]'
              }`}
            >
              <div className="flex items-center gap-2">
                {message.type === 'success' ? (
                  <HiCheckCircle className="w-4 h-4" />
                ) : (
                  <HiXCircle className="w-4 h-4" />
                )}
                {message.text}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Account Information Section */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="w-1 h-5 bg-[#1F3A5F] mr-2"></div>
                <h3 className="text-base font-medium text-gray-900">
                  Account Information
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-1">
                    Email Address{' '}
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-1">
                    Password{' '}
                    <span className="text-red-600">*</span>
                    {editingUser && (
                      <span className="text-gray-500 text-xs ml-1">
                        (leave blank to keep current)
                      </span>
                    )}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingUser}
                    placeholder="Enter password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-1">
                    User Role{' '}
                    <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F] bg-white"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Personal Information - English */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="w-1 h-5 bg-[#1F3A5F] mr-2"></div>
                <h3 className="text-base font-medium text-gray-900">
                  Personal Information (English)
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-1">
                    First Name{' '}
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name_en"
                    value={formData.first_name_en}
                    onChange={handleInputChange}
                    required
                    placeholder="First name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-1">
                    Last Name{' '}
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name_en"
                    value={formData.last_name_en}
                    onChange={handleInputChange}
                    required
                    placeholder="Last name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-1">
                    Nickname{' '}
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="nickname_en"
                    value={formData.nickname_en}
                    onChange={handleInputChange}
                    required
                    placeholder="Nickname"
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
                  />
                </div>
              </div>
            </div>

            {/* Personal Information - Lao */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="w-1 h-5 bg-[#1F3A5F] mr-2"></div>
                <h3 className="text-base font-medium text-gray-900">
                  Personal Information (Lao)
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-1">
                    First Name{' '}
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name_la"
                    value={formData.first_name_la}
                    onChange={handleInputChange}
                    required
                    placeholder="ຊື່"
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-1">
                    Last Name{' '}
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name_la"
                    value={formData.last_name_la}
                    onChange={handleInputChange}
                    required
                    placeholder="ນາມສະກຸນ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-1">
                    Nickname{' '}
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="nickname_la"
                    value={formData.nickname_la}
                    onChange={handleInputChange}
                    required
                    placeholder="ຊື່ຫຍໍ້"
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
                  />
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="w-1 h-5 bg-[#1F3A5F] mr-2"></div>
                <h3 className="text-base font-medium text-gray-900">
                  Basic Information
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-1">
                    Gender{' '}
                    <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F] bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <DatePicker
                    label="Date of Birth"
                    value={formData.date_of_birth}
                    onChange={(date) =>
                      setFormData((prev) => ({
                        ...prev,
                        date_of_birth: date,
                      }))
                    }
                    required
                  />
                </div>

                <div>
                  <DatePicker
                    label="Start Work"
                    value={formData.start_work}
                    onChange={(date) =>
                      setFormData((prev) => ({
                        ...prev,
                        start_work: date,
                      }))
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {/* Employment Details with Edit/Delete Functionality */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="w-1 h-5 bg-[#1F3A5F] mr-2"></div>
                <h3 className="text-base font-medium text-gray-900">
                  Employment Details
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Department Field with Edit/Delete Buttons */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-normal text-gray-700">
                      Department <span className="text-red-600">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setDepartmentModalOpen(true)}
                      className="text-xs text-[#1F3A5F] hover:text-[#152642] flex items-center gap-1"
                    >
                      <HiPlus className="w-3 h-3" />
                      Add New
                    </button>
                  </div>
                  
                  {editingDepartmentId ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editDepartmentName}
                        onChange={(e) => setEditDepartmentName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
                        placeholder="Enter department name"
                      />
                      <button
                        type="button"
                        onClick={handleSaveDepartmentEdit}
                        disabled={loadingDepartments}
                        className="px-3 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-sm disabled:bg-gray-400"
                      >
                        {loadingDepartments ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDepartmentId(null)
                          setEditDepartmentName('')
                        }}
                        className="px-3 py-2 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        name="department_id"
                        value={formData.department_id}
                        onChange={handleInputChange}
                        required
                        disabled={loadingDepartments}
                        className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F] bg-white disabled:bg-gray-100 pr-20"
                      >
                        <option value="">
                          {loadingDepartments
                            ? 'Loading departments...'
                            : 'Select department'}
                        </option>
                        {departments.map((dept) => (
                          <option key={dept._id} value={dept._id}>
                            {dept.department_name}
                          </option>
                        ))}
                      </select>
                      
                      {formData.department_id && (
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const dept = departments.find(d => d._id === formData.department_id)
                              if (dept) handleEditDepartment(dept._id, dept.department_name)
                            }}
                            className="p-1.5 text-gray-600 hover:text-[#1F3A5F] hover:bg-gray-100 rounded-sm"
                            title="Edit department"
                          >
                            <HiOutlinePencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const dept = departments.find(d => d._id === formData.department_id)
                              if (dept) handleDeleteDepartment(dept._id, dept.department_name)
                            }}
                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-sm"
                            title="Delete department"
                          >
                            <HiOutlineTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Position Field with Edit/Delete Buttons */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-normal text-gray-700">
                      Position <span className="text-red-600">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setPositionModalOpen(true)}
                      disabled={!formData.department_id || loadingPositions}
                      className="text-xs text-[#1F3A5F] hover:text-[#152642] flex items-center gap-1 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <HiPlus className="w-3 h-3" />
                      Add New
                    </button>
                  </div>
                  
                  {editingPositionId ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editPositionName}
                        onChange={(e) => setEditPositionName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
                        placeholder="Enter position name"
                      />
                      <button
                        type="button"
                        onClick={handleSavePositionEdit}
                        disabled={loadingPositions}
                        className="px-3 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-sm disabled:bg-gray-400"
                      >
                        {loadingPositions ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPositionId(null)
                          setEditPositionName('')
                        }}
                        className="px-3 py-2 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        name="position_id"
                        value={formData.position_id}
                        onChange={handleInputChange}
                        required
                        disabled={!formData.department_id || loadingPositions}
                        className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F] bg-white disabled:bg-gray-100 pr-20"
                      >
                        <option value="">
                          {loadingPositions
                            ? 'Loading...'
                            : !formData.department_id
                              ? 'Select department first'
                              : filteredPositions.length === 0
                                ? 'No positions available'
                                : 'Select position'}
                        </option>
                        {filteredPositions.map((pos) => (
                          <option key={pos._id} value={pos._id}>
                            {pos.position_name}
                          </option>
                        ))}
                      </select>
                      
                      {formData.position_id && (
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const pos = filteredPositions.find(p => p._id === formData.position_id)
                              if (pos) handleEditPosition(pos._id, pos.position_name)
                            }}
                            className="p-1.5 text-gray-600 hover:text-[#1F3A5F] hover:bg-gray-100 rounded-sm"
                            title="Edit position"
                          >
                            <HiOutlinePencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const pos = filteredPositions.find(p => p._id === formData.position_id)
                              if (pos) handleDeletePosition(pos._id, pos.position_name)
                            }}
                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-sm"
                            title="Delete position"
                          >
                            <HiOutlineTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-1">
                    Base Salary (LAK){' '}
                    <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">
                      ₭
                    </span>
                    <input
                      type="text"
                      name="base_salary"
                      value={getSalaryDisplayValue()}
                      onChange={handleSalaryChange}
                      required
                      placeholder="0.00"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
                    />
                    {formData.base_salary > 0 && (
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                        {formatCurrency(formData.base_salary)}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-1">
                    Annual Vacation Days
                  </label>
                  <input
                    type="number"
                    name="vacation_days"
                    value={formData.vacation_days}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-1">
                    Employment Status{' '}
                    <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F] bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-6 border-t border-gray-300">
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#27F584] border border-[#27F584] rounded-sm hover:bg-[#27F584] disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </>
                  ) : editingUser ? (
                    'Update User'
                  ) : (
                    'Register User'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Department Modal */}
        <DepartmentModal
            isOpen={departmentModalOpen}
            onClose={() => setDepartmentModalOpen(false)}
            onSuccess={handleDepartmentSuccess}
        />

      {/* Position Modal */}
      <PositionModal
        isOpen={positionModalOpen}
        onClose={() => setPositionModalOpen(false)}
        onSuccess={handlePositionSuccess}
        selectedDepartmentId={
          typeof formData.department_id === 'string'
            ? formData.department_id
            : ''
        }
      />

      {/* Delete Confirmation Dialog */}
      
    </div>
  )
}

export default UserFormModal