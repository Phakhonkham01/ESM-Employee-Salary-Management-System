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
    HiOutlineTrash,
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

    // 直接在这里管理模态框状态 - 需要两个不同的状态
    const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false)
    const [isPositionCreateModalOpen, setIsPositionCreateModalOpen] =
        useState(false) // 新增：用于创建职位
    const [isPositionEditModalOpen, setIsPositionEditModalOpen] =
        useState(false) // 用于编辑职位
    const [editingDepartment, setEditingDepartment] =
        useState<DepartmentData | null>(null)
    const [editingPosition, setEditingPosition] = useState<PositionData | null>(
        null,
    )

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
            setFormData((prev) => ({
                ...prev,
                [name]: value,
                position_id: '',
            }))
            if (value) {
                fetchPositionsByDepartment(value)
            }
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
        if (formData.department_id) {
            fetchPositionsByDepartment(formData.department_id)
        }
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value)
    }

    // 添加部门函数
    const handleAddDepartment = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        console.log('Opening department modal from UserFormModal')
        setEditingDepartment(null)
        setIsDepartmentModalOpen(true)
    }

    // 编辑部门函数
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

    // 添加职位函数 - 修改这里
    const handleAddPosition = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        console.log('Opening position create modal from UserFormModal')
        setIsPositionCreateModalOpen(true)
    }

    // 编辑职位函数 - 修改这里
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

    return (
        <>
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 rounded-md">
                <div
                    className="bg-white border border-gray-300 w-full max-w-6xl max-h-[1280px] shadow-lgq rounded-md"
                    onClick={(e) => e.stopPropagation()} // 阻止点击内容时关闭
                >
                    {/* Header */}
                    <div className="bg-[#FFFFFF] px-4 py-5 flex items-center justify-between border-b border-[#FFFFFF] rounded-md">
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
                    <div className="p-[60px] overflow-y-auto max-h-[calc(90vh-140px)] bg-gray-50 no-scrollbar">
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 mb-1">
                                            Password{' '}
                                            <span className="text-red-600">
                                                *
                                            </span>
                                            {editingUser && (
                                                <span className="text-gray-500 text-xs ml-1">
                                                    (leave blank to keep
                                                    current)
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
                                            <span className="text-red-600">
                                                *
                                            </span>
                                        </label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F] bg-white"
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
                                    <div className="w-1 h-5 bg-[#1F3A5F] mr-2"></div>
                                    <h3 className="text-base font-medium text-gray-900">
                                        Personal Information (English)
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
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
                                            <span className="text-red-600">
                                                *
                                            </span>
                                        </label>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F] bg-white"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">
                                                Female
                                            </option>
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

                            {/* Employment Details - SIMPLIFIED VERSION */}
                            <div className="mb-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-1 h-5 bg-[#1F3A5F] mr-2"></div>
                                    <h3 className="text-base font-medium text-gray-900">
                                        Employment Details
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Department Field - 简化版本 */}
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
                                                onClick={handleAddDepartment}
                                                className="flex items-center gap-1 text-xs text-[#1F3A5F] hover:text-[#1F3A5F]/80 transition-colors"
                                                title="Add new department"
                                            >
                                                <HiPlus className="w-3 h-3" />
                                                Add
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <select
                                                name="department_id"
                                                value={formData.department_id}
                                                onChange={handleInputChange}
                                                required
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F] bg-white"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <option value="">
                                                    Select Department
                                                </option>
                                                {departments.map((dept) => (
                                                    <option
                                                        key={dept._id}
                                                        value={dept._id}
                                                    >
                                                        {dept.department_name}
                                                    </option>
                                                ))}
                                            </select>
                                            {formData.department_id && (
                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleEditDepartment
                                                    }
                                                    className="px-3 py-2 text-sm text-gray-600 hover:text-[#1F3A5F] hover:bg-gray-100 rounded-sm"
                                                    title="Edit department"
                                                >
                                                    <HiOutlinePencil className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Position Field - 简化版本 */}
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
                                                disabled={
                                                    !formData.department_id
                                                }
                                                className={`flex items-center gap-1 text-xs transition-colors ${
                                                    !formData.department_id
                                                        ? 'text-gray-400 cursor-not-allowed'
                                                        : 'text-[#1F3A5F] hover:text-[#1F3A5F]/80'
                                                }`}
                                                title={
                                                    !formData.department_id
                                                        ? 'Please select a department first'
                                                        : 'Add new position'
                                                }
                                            >
                                                <HiPlus className="w-3 h-3" />
                                                Add
                                            </button>
                                        </div>

                                        <div className="flex gap-2">
                                            <select
                                                name="position_id"
                                                value={formData.position_id}
                                                onChange={handleInputChange}
                                                required
                                                disabled={
                                                    !formData.department_id ||
                                                    loadingPositions
                                                }
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F] bg-white disabled:bg-gray-100"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <option value="">
                                                    {loadingPositions
                                                        ? 'Loading positions...'
                                                        : !formData.department_id
                                                          ? 'Select department first'
                                                          : filteredPositions.length ===
                                                              0
                                                            ? 'No positions available'
                                                            : 'Select position'}
                                                </option>
                                                {filteredPositions.map(
                                                    (pos) => (
                                                        <option
                                                            key={pos._id}
                                                            value={pos._id}
                                                        >
                                                            {pos.position_name}
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
                                                    disabled={
                                                        !formData.position_id
                                                    }
                                                    className={`px-3 py-2 text-sm rounded-sm flex items-center gap-1 ${
                                                        !formData.position_id
                                                            ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                                                            : 'text-[#1F3A5F] hover:text-white hover:bg-[#45cc67] bg-white border border-gray-300'
                                                    }`}
                                                    title="Edit position"
                                                >
                                                    <HiOutlinePencil className="w-4 h-4" />
                                                    Edit
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 mb-1">
                                            Base Salary (LAK){' '}
                                            <span className="text-red-600">
                                                *
                                            </span>
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
                                                    {formatCurrency(
                                                        formData.base_salary,
                                                    )}
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
                                            min="-365"
                                            placeholder="0"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
                                        />
                                    </div>

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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F] bg-white"
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
                                        className="px-4 py-2 text-sm font-medium text-white bg-[#45CC67] border border-[#45CC67] rounded-sm hover:bg-[#45CC67] disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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

            {/* 直接在这里渲染部门模态框 */}
            <DepartmentModal
                isOpen={isDepartmentModalOpen}
                onClose={() => {
                    console.log('Closing department modal from parent')
                    setIsDepartmentModalOpen(false)
                    setEditingDepartment(null)
                }}
                onSuccess={() => {
                    console.log('Department modal success from parent')
                    handleDepartmentSuccess()
                    setIsDepartmentModalOpen(false)
                    setEditingDepartment(null)
                }}
                editingDepartment={editingDepartment}
            />

            {/* 直接在这里渲染创建职位模态框 */}
            <PositionModal
                isOpen={isPositionCreateModalOpen}
                onClose={() => {
                    console.log('Closing position create modal from parent')
                    setIsPositionCreateModalOpen(false)
                }}
                onSuccess={() => {
                    console.log('Position create modal success from parent')
                    handlePositionSuccess()
                    setIsPositionCreateModalOpen(false)
                }}
                editingPosition={null} // 传递null表示创建模式
                selectedDepartmentId={formData.department_id} // 传递当前选中的部门ID
            />

            {/* 直接在这里渲染编辑职位模态框 */}
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
                selectedDepartmentId={formData.department_id}
            />
        </>
    )
}

export default UserFormModal
