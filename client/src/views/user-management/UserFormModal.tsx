import type React from 'react'
import { useState, useEffect } from 'react'
import { createUser, updateUser } from '../../services/Create_user/api'
import {
    getAllDepartments,
    getAllPositions,
    getPositionsByDepartment,
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
} from 'react-icons/hi'
import DatePicker from './DatePicker'
import Swal from 'sweetalert2'
import DepartmentModal from './Department_Position/DepartmentModal'
import PositionModal from './Department_Position/PositionModal'

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
    // State สำหรับ form data
    const [formData, setFormData] = useState<{
        email: string
        password: string
        role: 'Supervisor' | 'Admin' | 'Employee'
        first_name_en: string
        last_name_en: string
        nickname_en: string
        first_name_la: string
        last_name_la: string
        nickname_la: string
        date_of_birth: string
        start_work: string
        vacation_days: number
        gender: 'Male' | 'Female' | 'Other'
        position_id: string
        department_id: string | string[] // เปลี่ยนเป็น string หรือ array
        status: 'Active' | 'Inactive' | 'On Leave'
        base_salary: number
    }>({
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
        department_id: '', // เริ่มต้นเป็น string
        status: 'Active',
        base_salary: 0,
    })

    const [departments, setDepartments] = useState<DepartmentData[]>([])
    const [positions, setPositions] = useState<PositionData[]>([])
    const [filteredPositions, setFilteredPositions] = useState<PositionData[]>(
        [],
    )
    const [loading, setLoading] = useState(false)
    const [loadingDepartments, setLoadingDepartments] = useState(false)
    const [loadingPositions, setLoadingPositions] = useState(false)
    const [message, setMessage] = useState<{
        type: 'success' | 'error'
        text: string
    } | null>(null)

    // Modal states
    const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false)
    const [isPositionCreateModalOpen, setIsPositionCreateModalOpen] =
        useState(false)
    const [isPositionEditModalOpen, setIsPositionEditModalOpen] =
        useState(false)
    const [editingDepartment, setEditingDepartment] =
        useState<DepartmentData | null>(null)
    const [editingPosition, setEditingPosition] = useState<PositionData | null>(
        null,
    )

    const isSupervisor = formData.role === 'Supervisor'

    const shouldShowPositionSalaryVacationFields = () => {
        return !isSupervisor
    }

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

                // แปลง department_id
                let deptId: string | string[] = ''
                if (editingUser.role === 'Supervisor') {
                    // Supervisor อาจมีหลาย department
                    if (Array.isArray(editingUser.department_id)) {
                        deptId = editingUser.department_id.map((dept) =>
                            typeof dept === 'string' ? dept : dept._id,
                        )
                    } else if (editingUser.department_id) {
                        const singleDept =
                            typeof editingUser.department_id === 'string'
                                ? editingUser.department_id
                                : editingUser.department_id._id
                        deptId = [singleDept]
                    }
                } else {
                    // Employee/Admin มี department เดียว
                    if (Array.isArray(editingUser.department_id)) {
                        const firstDept = editingUser.department_id[0]
                        deptId =
                            typeof firstDept === 'string'
                                ? firstDept
                                : firstDept?._id || ''
                    } else if (editingUser.department_id) {
                        deptId =
                            typeof editingUser.department_id === 'string'
                                ? editingUser.department_id
                                : editingUser.department_id._id
                    }
                }

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
                        (typeof editingUser.position_id === 'string'
                            ? editingUser.position_id
                            : editingUser.position_id?._id) || '',
                    department_id: deptId,
                    status: editingUser.status,
                    base_salary: salaryValue,
                })
            } else if (!editingUser && isOpen) {
                resetForm()
            }
        }
    }, [isOpen, editingUser])

    // ตรวจจับการเปลี่ยน Role
    useEffect(() => {
        if (formData.role === 'Supervisor') {
            setFormData((prev) => ({
                ...prev,
                position_id: '',
                base_salary: 0,
                vacation_days: 0,
                // เปลี่ยนเป็น array ถ้ายังเป็น string
                department_id: Array.isArray(prev.department_id)
                    ? prev.department_id
                    : prev.department_id
                      ? [prev.department_id]
                      : [],
            }))
        } else {
            // เปลี่ยนเป็น string ถ้าเป็น array
            setFormData((prev) => ({
                ...prev,
                department_id: Array.isArray(prev.department_id)
                    ? prev.department_id[0] || ''
                    : prev.department_id,
            }))
        }
    }, [formData.role])

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

    // Handle department selection change
    const handleDepartmentChange = (selectedIds: string[]) => {
        if (isSupervisor) {
            setFormData((prev) => ({
                ...prev,
                department_id: selectedIds,
            }))
        } else {
            setFormData((prev) => ({
                ...prev,
                department_id: selectedIds[0] || '',
                position_id: '',
            }))
            if (selectedIds[0]) {
                fetchPositionsByDepartment(selectedIds[0])
            }
        }
    }

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target

        if (name === 'role') {
            const roleValue = value as 'Supervisor' | 'Admin' | 'Employee'
            setFormData((prev) => ({
                ...prev,
                role: roleValue,
            }))
        } else if (name === 'vacation_days' || name === 'base_salary') {
            if (formData.role === 'Supervisor') return
            const numericValue = Number.parseFloat(value) || 0
            setFormData((prev) => ({
                ...prev,
                [name]: numericValue,
            }))
        } else if (name === 'position_id') {
            if (formData.role === 'Supervisor') return
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }))
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }))
        }
    }

    const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (formData.role === 'Supervisor') return
        const value = e.target.value.replace(/[^0-9.]/g, '')
        const numericValue = Number.parseFloat(value) || 0
        setFormData((prev) => ({
            ...prev,
            base_salary: numericValue,
        }))
    }

    const getSalaryDisplayValue = () => {
        if (formData.base_salary === 0) return ''
        return formData.base_salary.toString()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const submitData: CreateUserData = {
                email: formData.email,
                password: formData.password || undefined,
                role: formData.role,
                first_name_en: formData.first_name_en,
                last_name_en: formData.last_name_en,
                nickname_en: formData.nickname_en,
                first_name_la: formData.first_name_la,
                last_name_la: formData.last_name_la,
                nickname_la: formData.nickname_la,
                date_of_birth: formData.date_of_birth,
                start_work: formData.start_work,
                gender: formData.gender,
                status: formData.status,
                department_id: formData.department_id || undefined,
            }

            if (formData.role !== 'Supervisor') {
                submitData.vacation_days = formData.vacation_days
                submitData.position_id = formData.position_id || undefined
                submitData.base_salary = formData.base_salary
            }

            if (editingUser && !formData.password) {
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
        setIsDepartmentModalOpen(false)
        setIsPositionCreateModalOpen(false)
        setIsPositionEditModalOpen(false)
        setEditingDepartment(null)
        setEditingPosition(null)
    }

    const handleClose = () => {
        resetForm()
        onClose()
    }

    const handleDepartmentSuccess = () => {
        fetchDepartments()
    }

    const handlePositionSuccess = () => {
        fetchAllPositions()
        const deptId = Array.isArray(formData.department_id)
            ? formData.department_id[0]
            : formData.department_id
        if (deptId) {
            fetchPositionsByDepartment(deptId)
        }
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value)
    }

    const handleAddDepartment = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setEditingDepartment(null)
        setIsDepartmentModalOpen(true)
    }

    const handleAddPosition = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsPositionCreateModalOpen(true)
    }
    const handleEditDepartment = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!formData.department_id) return

        const department = departments.find(
            (d) => d._id === formData.department_id,
        )
        if (department) {
            setEditingDepartment(department)
            setIsDepartmentModalOpen(true)
        }
    }

    const handleEditPositionClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!formData.position_id) return
        const position = filteredPositions.find(
            (p) => p._id === formData.position_id,
        )
        if (position) {
            setEditingPosition(position)
            setIsPositionEditModalOpen(true)
        }
    }

    if (!isOpen) return null

    const selectedDepartmentIds = Array.isArray(formData.department_id)
        ? formData.department_id
        : formData.department_id
          ? [formData.department_id]
          : []

    return (
        <>
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 rounded-md">
                <div
                    className="bg-white border border-gray-300 w-full max-w-6xl max-h-[1280px] shadow-lgq rounded-md"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-[#FFFFFF] px-20 py-10 flex items-center justify-between border-b border-[#FFFFFF] rounded-md">
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
                            className="text-dark hover:bg-white/10 p-2 rounded transition-colors"
                            title="Close"
                        >
                            <HiX className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-[120px] py-[50px] overflow-y-auto max-h-[calc(90vh-140px)] bg-gray-50 no-scrollbar">
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
                            <div className="mb-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 mb-1">
                                            Email Address{' '}
                                            <span className="text-red-600">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Enter email address"
                                            className="w-full h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 mb-1">
                                            Password{' '}
                                            <span className="text-red-600">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required={!editingUser}
                                            placeholder="Enter password"
                                            className="w-full h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 mb-1">
                                            User Role{' '}
                                            <span className="text-red-600">
                                                *
                                            </span>
                                        </label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                                        >
                                            <option value="Employee">
                                                Employee
                                            </option>
                                            <option value="Supervisor">
                                                Supervisor
                                            </option>
                                            <option value="Admin">
                                                Administrator
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information - English */}
                            <div className="mb-6">
                                <div className="flex items-center mb-4">
                                    <h3 className="text-base font-medium text-gray-900">
                                        ຂໍ້ມູນສ່ວນຕົວ (ພາສາອັງກິດ)
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 mb-1">
                                            First Name{' '}
                                            <span className="text-red-600">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="first_name_en"
                                            value={formData.first_name_en}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="First name"
                                            className="w-full h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 mb-1">
                                            Last Name{' '}
                                            <span className="text-red-600">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="last_name_en"
                                            value={formData.last_name_en}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Last name"
                                            className="w-full h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 mb-1">
                                            Nickname{' '}
                                            <span className="text-red-600">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="nickname_en"
                                            value={formData.nickname_en}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Nickname"
                                            className="w-full h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information - Lao */}
                            <div className="mb-6">
                                <div className="flex items-center mb-4">
                                    <h3 className="text-base font-medium text-gray-900">
                                        ຂໍ້ມູນສ່ວນຕົວ (ພາສາລາວ)
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 mb-1">
                                            First Name{' '}
                                            <span className="text-red-600">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="first_name_la"
                                            value={formData.first_name_la}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="ຊື່"
                                            className="w-full h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 mb-1">
                                            Last Name{' '}
                                            <span className="text-red-600">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="last_name_la"
                                            value={formData.last_name_la}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="ນາມສະກຸນ"
                                            className="w-full h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 mb-1">
                                            Nickname{' '}
                                            <span className="text-red-600">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="nickname_la"
                                            value={formData.nickname_la}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="ຊື່ຫຍໍ້"
                                            className="w-full h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Basic Information */}
                            <div className="mb-6">
                                <div className="flex items-center mb-4">
                                    <h3 className="text-base font-medium text-gray-900">
                                        ຂໍ້ມູນພື້ນຖານ
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 mb-1">
                                            Gender{' '}
                                            <span className="text-red-600">
                                                *
                                            </span>
                                        </label>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">
                                                Female
                                            </option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="mb-7">
                                        {/* Use the wrapper to force the 50px height and gray background */}
                                        <div className="">
                                            <DatePicker
                                                label="Date of Birth" // This fixes the 'Property label is missing' error
                                                value={formData.date_of_birth}
                                                onChange={(date: any) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        date_of_birth: date,
                                                    }))
                                                }
                                            />
                                        </div>
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

                            {/* Employment Details */}
                            <div className="mb-6">
                                <div className="flex items-center mb-4">
                                    <h3 className="text-base font-medium text-gray-900">
                                        ລາຍລະອຽດການຈ້າງງານ
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* แสดงข้อมูลสำหรับ Supervisor */}
                                    {isSupervisor && (
                                        <div className="col-span-2">
                                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <div className="flex items-start">
                                                    <svg
                                                        className="w-5 h-5 text-blue-500 mr-2 mt-0.5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        ></path>
                                                    </svg>
                                                    <div>
                                                        <p className="text-sm text-blue-800 font-medium">
                                                            Supervisor
                                                            Information
                                                        </p>
                                                        <p className="text-xs text-blue-600 mt-1">
                                                            For Supervisor
                                                            users, Position,
                                                            Base Salary, and
                                                            Vacation Days are
                                                            not required and
                                                            will be
                                                            automatically set.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Department Field - แสดงเสมอ */}
                                    {/* สำหรับ Supervisor - แสดง Checkbox แบบหลายตัวเลือก */}
                                    {isSupervisor ? (
                                        <div>
                                            <label className="block text-sm font-normal text-gray-700 mb-1">
                                                Departments{' '}
                                                <span className="text-red-600">
                                                    *
                                                </span>
                                            </label>
                                            <div className="border border-gray-300 rounded-lg bg-[#F2F2F2] p-3 max-h-40 overflow-y-auto">
                                                {departments.map((dept) => (
                                                    <label
                                                        key={dept._id}
                                                        className="flex items-center gap-2 mb-2 cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedDepartmentIds.includes(
                                                                dept._id,
                                                            )}
                                                            onChange={(e) => {
                                                                const newIds = e
                                                                    .target
                                                                    .checked
                                                                    ? [
                                                                          ...selectedDepartmentIds,
                                                                          dept._id,
                                                                      ]
                                                                    : selectedDepartmentIds.filter(
                                                                          (
                                                                              id,
                                                                          ) =>
                                                                              id !==
                                                                              dept._id,
                                                                      )
                                                                handleDepartmentChange(
                                                                    newIds,
                                                                )
                                                            }}
                                                            className="w-4 h-4"
                                                        />
                                                        <span className="text-sm">
                                                            {
                                                                dept.department_name
                                                            }
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        /* สำหรับ Employee/Admin - Select ธรรมดา */
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-sm font-normal text-gray-700">
                                                    Department{' '}
                                                    <span className="text-red-600">
                                                        *
                                                    </span>
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleAddDepartment
                                                    }
                                                    className="flex items-center justify-center gap-1 w-[60px] h-[45px] rounded-[10px] bg-[#F2F2F2] text-xs text-[#1F3A5F] hover:text-[#1F3A5F]/80 transition-colors"
                                                    title="Add new department"
                                                >
                                                    <HiPlus className="w-3 h-3" />
                                                    Add
                                                </button>
                                            </div>

                                            {/* เพิ่ม className "flex gap-2" ที่ div ตัวนี้ */}
                                            <div className="flex gap-2 items-center">
                                                <select
                                                    name="department_id"
                                                    value={
                                                        Array.isArray(
                                                            formData.department_id,
                                                        )
                                                            ? ''
                                                            : formData.department_id
                                                    }
                                                    onChange={(e) =>
                                                        handleDepartmentChange([
                                                            e.target.value,
                                                        ])
                                                    }
                                                    required
                                                    className="flex-1 h-[50px] px-3 py-2 rounded-lg bg-[#F2F2F2]" // เพิ่ม flex-1 เพื่อให้ select ขยายเต็มพื้นที่ที่เหลือ
                                                >
                                                    <option value="">
                                                        Select Department
                                                    </option>
                                                    {departments.map((dept) => (
                                                        <option
                                                            key={dept._id}
                                                            value={dept._id}
                                                        >
                                                            {
                                                                dept.department_name
                                                            }
                                                        </option>
                                                    ))}
                                                </select>

                                                {formData.department_id && (
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            handleEditDepartment
                                                        }
                                                        className="w-[45px] h-[50px] flex items-center justify-center rounded-lg bg-[#F2F2F2] hover:bg-gray-200 transition-colors"
                                                        title="Edit department"
                                                    >
                                                        <HiOutlinePencil className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {/* Position Field - แสดงเฉพาะที่ไม่ใช่ Supervisor */}
                                    {shouldShowPositionSalaryVacationFields() ? (
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-sm font-normal text-gray-700">
                                                    Position{' '}
                                                    <span className="text-red-600">
                                                        *
                                                    </span>
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={handleAddPosition}
                                                    className="flex items-center justify-center gap-1 w-[60px] h-[45px] rounded-[10px] bg-[#F2F2F2] text-xs text-[#1F3A5F] hover:text-[#1F3A5F]/80 transition-colors"
                                                    title="Add new position"
                                                >
                                                    <HiPlus className="w-3 h-3" />
                                                    ADD
                                                </button>
                                            </div>
                                            <div className="flex gap-2">
                                                <select
                                                    name="position_id"
                                                    value={formData.position_id}
                                                    onChange={handleInputChange}
                                                    required={!isSupervisor}
                                                    disabled={
                                                        !formData.department_id
                                                    }
                                                    className="w-full h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                                                >
                                                    <option value="">
                                                        {formData.department_id
                                                            ? 'Select Position'
                                                            : 'Select Department first'}
                                                    </option>
                                                    {filteredPositions.map(
                                                        (pos) => (
                                                            <option
                                                                key={pos._id}
                                                                value={pos._id}
                                                            >
                                                                {
                                                                    pos.position_name
                                                                }
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                                {formData.position_id && (
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            handleEditPositionClick
                                                        }
                                                        className="w-[45px] h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                                                        title="Edit position"
                                                    >
                                                        <HiOutlinePencil className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-sm font-normal text-gray-700 mb-1">
                                                Position
                                            </label>
                                            <input
                                                type="text"
                                                value="Not required for Supervisor"
                                                readOnly
                                                disabled
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 text-gray-500"
                                            />
                                        </div>
                                    )}

                                    {/* Base Salary Field - แสดงเฉพาะที่ไม่ใช่ Supervisor */}
                                    {shouldShowPositionSalaryVacationFields() ? (
                                        <div>
                                            <label className="block text-sm font-normal text-gray-700 mb-1">
                                                Base Salary (LAK){' '}
                                                <span className="text-red-600">
                                                    *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="base_salary"
                                                    value={getSalaryDisplayValue()}
                                                    onChange={
                                                        handleSalaryChange
                                                    }
                                                    required={!isSupervisor}
                                                    placeholder="0"
                                                    className="w-full h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                                                />
                                                {formData.base_salary >= 0 && (
                                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                                                        {formatCurrency(
                                                            formData.base_salary,
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-sm font-normal text-gray-700 mb-1">
                                                Base Salary (LAK)
                                            </label>
                                            <input
                                                type="text"
                                                value="Not required for Supervisor"
                                                readOnly
                                                disabled
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 text-gray-500"
                                            />
                                        </div>
                                    )}

                                    {/* Annual Vacation Days Field - แสดงเฉพาะที่ไม่ใช่ Supervisor */}
                                    {shouldShowPositionSalaryVacationFields() ? (
                                        <div>
                                            <label className="block text-sm font-normal text-gray-700 mb-1">
                                                Annual Vacation Days
                                            </label>
                                            <input
                                                type="number"
                                                name="vacation_days"
                                                value={formData.vacation_days}
                                                onChange={handleInputChange}
                                                min="-365"
                                                max="365"
                                                placeholder="0"
                                                className="w-full h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-sm font-normal text-gray-700 mb-1">
                                                Annual Vacation Days
                                            </label>
                                            <input
                                                type="text"
                                                value="Not required for Supervisor"
                                                readOnly
                                                disabled
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 text-gray-500"
                                            />
                                        </div>
                                    )}

                                    {/* Employment Status Field - แสดงเสมอ */}
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 mb-1">
                                            Employment Status{' '}
                                            <span className="text-red-600">
                                                *
                                            </span>
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                                        >
                                            <option value="Active">
                                                Active
                                            </option>
                                            <option value="Inactive">
                                                Inactive
                                            </option>
                                            <option value="On Leave">
                                                On Leave
                                            </option>
                                        </select>
                                        {!editingUser && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                New users are automatically set
                                                to Active
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-6 border-t border-gray-300">
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 text-sm font-medium text-white bg-[#45CC67] border border-[#45CC67] rounded-lg hover:bg-[#45CC67] disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
            </div>

            {/* Department Modal */}
            <DepartmentModal
                isOpen={isDepartmentModalOpen}
                onClose={() => {
                    setIsDepartmentModalOpen(false)
                    setEditingDepartment(null)
                }}
                onSuccess={() => {
                    handleDepartmentSuccess()
                    setIsDepartmentModalOpen(false)
                    setEditingDepartment(null)
                }}
                editingDepartment={editingDepartment}
            />

            {/* Position Create Modal */}
            <PositionModal
                isOpen={isPositionCreateModalOpen}
                onClose={() => {
                    setIsPositionCreateModalOpen(false)
                }}
                onSuccess={() => {
                    handlePositionSuccess()
                    setIsPositionCreateModalOpen(false)
                }}
                editingPosition={null}
                selectedDepartmentId={
                    Array.isArray(formData.department_id)
                        ? formData.department_id[0]
                        : formData.department_id
                } // ✅ แก้ไขตรงนี้ - ส่งเฉพาะ department แรก
            />

            {/* Position Edit Modal */}
            <PositionModal
                isOpen={isPositionEditModalOpen}
                onClose={() => {
                    setIsPositionEditModalOpen(false)
                    setEditingPosition(null)
                }}
                onSuccess={() => {
                    handlePositionSuccess()
                    setIsPositionEditModalOpen(false)
                    setEditingPosition(null)
                }}
                editingPosition={editingPosition}
                selectedDepartmentId={
                    Array.isArray(formData.department_id)
                        ? formData.department_id[0]
                        : formData.department_id
                } // ✅ แก้ไขตรงนี้ - ส่งเฉพาะ department แรก
            />
        </>
    )
}

export default UserFormModal
