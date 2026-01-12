import React, { useState, useEffect } from 'react'
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
} from 'react-icons/hi'
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
    const [departmentModalOpen, setDepartmentModalOpen] = useState(false)
    const [positionModalOpen, setPositionModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loadingDepartments, setLoadingDepartments] = useState(false)
    const [loadingPositions, setLoadingPositions] = useState(false)
    const [message, setMessage] = useState<{
        type: 'success' | 'error'
        text: string
    } | null>(null)

    useEffect(() => {
        if (isOpen) {
            fetchDepartments()
            fetchAllPositions()

            if (editingUser && isOpen) {
                const baseSalary = editingUser.base_salary
                const salaryValue =
                    typeof baseSalary === 'string'
                        ? parseFloat(baseSalary) || 0
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
            const numericValue = parseFloat(value) || 0
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
        const numericValue = parseFloat(value) || 0
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
        setMessage(null)

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
                setMessage({
                    type: 'success',
                    text: 'User updated successfully!',
                })
            } else {
                await createUser(submitData)
                setMessage({
                    type: 'success',
                    text: 'User created successfully!',
                })
            }

            setTimeout(() => {
                onSuccess()
                resetForm()
                onClose()
            }, 1000)
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.message || 'Something went wrong!',
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

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value)
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white">
                        {editingUser ? (
                            <>
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <HiPencil className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">
                                        Edit User
                                    </h2>
                                    <p className="text-blue-100 text-sm">
                                        {editingUser.first_name_en}{' '}
                                        {editingUser.last_name_en}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <HiUserAdd className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">
                                        Create New User
                                    </h2>
                                    <p className="text-blue-100 text-sm">
                                        Add a new team member
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
                    >
                        <HiX className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {message && (
                        <div
                            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                                message.type === 'success'
                                    ? 'bg-green-50 border border-green-200 text-green-800'
                                    : 'bg-red-50 border border-red-200 text-red-800'
                            }`}
                        >
                            {message.type === 'success' ? (
                                <HiCheckCircle className="w-5 h-5 flex-shrink-0" />
                            ) : (
                                <HiXCircle className="w-5 h-5 flex-shrink-0" />
                            )}
                            <span className="font-medium">{message.text}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Account Section */}
                        <div className="bg-gray-50 rounded-lg p-5">
                            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-1 h-5 bg-blue-600 rounded"></span>
                                Account Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="user@example.com"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password {editingUser && '(optional)'}{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required={!editingUser}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Role{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none cursor-pointer"
                                    >
                                        <option value="Employee">
                                            👤 Employee
                                        </option>
                                        <option value="Supervisor">
                                            👥 Supervisor
                                        </option>
                                        <option value="Admin">⚙️ Admin</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Personal Information - English */}
                        <div className="bg-gray-50 rounded-lg p-5">
                            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-1 h-5 bg-green-600 rounded"></span>
                                Personal Information (English)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="first_name_en"
                                        value={formData.first_name_en}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="John"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="last_name_en"
                                        value={formData.last_name_en}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Doe"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nickname{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="nickname_en"
                                        value={formData.nickname_en}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Johnny"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Personal Information - Lao */}
                        <div className="bg-gray-50 rounded-lg p-5">
                            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-1 h-5 bg-purple-600 rounded"></span>
                                Personal Information (Lao)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="first_name_la"
                                        value={formData.first_name_la}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="ຈອນ"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="last_name_la"
                                        value={formData.last_name_la}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="ໂດ"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nickname{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="nickname_la"
                                        value={formData.nickname_la}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="ຈອນນີ"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Additional Details */}
                        <div className="bg-gray-50 rounded-lg p-5">
                            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-1 h-5 bg-orange-600 rounded"></span>
                                Additional Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gender{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none cursor-pointer"
                                    >
                                        <option value="Male">♂️ Male</option>
                                        <option value="Female">
                                            ♀️ Female
                                        </option>
                                        <option value="Other">⚧ Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date of Birth{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        value={formData.date_of_birth}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Work Date{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="start_work"
                                        value={formData.start_work}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Work Information */}
                        <div className="bg-gray-50 rounded-lg p-5">
                            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-1 h-5 bg-indigo-600 rounded"></span>
                                Work Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Department{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setDepartmentModalOpen(true)
                                            }
                                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
                                        >
                                            <HiPlus className="w-3 h-3" />
                                            Add
                                        </button>
                                    </div>
                                    <select
                                        name="department_id"
                                        value={formData.department_id}
                                        onChange={handleInputChange}
                                        required
                                        disabled={loadingDepartments}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        <option value="">
                                            {loadingDepartments
                                                ? 'Loading...'
                                                : 'Select Department'}
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
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Position{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPositionModalOpen(true)
                                            }
                                            disabled={
                                                !formData.department_id ||
                                                loadingPositions
                                            }
                                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            <HiPlus className="w-3 h-3" />
                                            Add
                                        </button>
                                    </div>
                                    <select
                                        name="position_id"
                                        value={formData.position_id}
                                        onChange={handleInputChange}
                                        required
                                        disabled={
                                            !formData.department_id ||
                                            loadingPositions
                                        }
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        <option value="">
                                            {loadingPositions
                                                ? 'Loading positions...'
                                                : !formData.department_id
                                                  ? 'Select department first'
                                                  : filteredPositions.length ===
                                                      0
                                                    ? 'No positions found'
                                                    : 'Select Position'}
                                        </option>
                                        {filteredPositions.map((pos) => (
                                            <option
                                                key={pos._id}
                                                value={pos._id}
                                            >
                                                {pos.position_name}
                                            </option>
                                        ))}
                                    </select>
                                    {formData.department_id &&
                                        filteredPositions.length > 0 && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Found {filteredPositions.length}{' '}
                                                position(s)
                                            </p>
                                        )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        💰 Base Salary{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                                            ₭
                                        </span>
                                        <input
                                            type="text"
                                            name="base_salary"
                                            value={getSalaryDisplayValue()}
                                            onChange={handleSalaryChange}
                                            required
                                            placeholder="0.00"
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                        />
                                        {formData.base_salary > 0 && (
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 italic">
                                                {formatCurrency(
                                                    formData.base_salary,
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Vacation Days
                                    </label>
                                    <input
                                        type="number"
                                        name="vacation_days"
                                        value={formData.vacation_days}
                                        onChange={handleInputChange}
                                        min="0"
                                        placeholder="0"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none cursor-pointer"
                                    >
                                        <option value="Active">
                                            ✅ Active
                                        </option>
                                        <option value="Inactive">
                                            ❌ Inactive
                                        </option>
                                        <option value="On Leave">
                                            🏖️ On Leave
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg
                                            className="animate-spin h-4 w-4"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
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
                                    'Create User'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <DepartmentModal
                isOpen={departmentModalOpen}
                onClose={() => setDepartmentModalOpen(false)}
                onSuccess={handleDepartmentSuccess}
            />

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

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </div>
    )
}

export default UserFormModal
