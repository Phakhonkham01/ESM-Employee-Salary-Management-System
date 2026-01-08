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
import { HiUserAdd, HiPencil, HiX, HiPlus } from 'react-icons/hi'
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
    // State
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

    // State สำหรับ Departments และ Positions
    const [departments, setDepartments] = useState<DepartmentData[]>([])
    const [positions, setPositions] = useState<PositionData[]>([])
    const [filteredPositions, setFilteredPositions] = useState<PositionData[]>(
        [],
    )

    // State สำหรับ Modals
    const [departmentModalOpen, setDepartmentModalOpen] = useState(false)
    const [positionModalOpen, setPositionModalOpen] = useState(false)

    const [loading, setLoading] = useState(false)
    const [loadingDepartments, setLoadingDepartments] = useState(false)
    const [loadingPositions, setLoadingPositions] = useState(false)
    const [message, setMessage] = useState<{
        type: 'success' | 'error'
        text: string
    } | null>(null)

    // โหลด Departments และ Positions เมื่อ Modal เปิด
    useEffect(() => {
        if (isOpen) {
            fetchDepartments()
            fetchAllPositions()

            // ตั้งค่า form data ถ้ากำลังแก้ไข user
            if (editingUser && isOpen) {
                // แก้ไขการแปลงค่า base_salary ให้เป็น number
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

                    // ✅ สำคัญมาก
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

    // เมื่อเลือก Department ให้ดึง Positions ของ Department นั้น
    useEffect(() => {
        if (formData.department_id) {
            fetchPositionsByDepartment(formData.department_id)

            // ถ้าเป็น edit mode และ user มี position_id อยู่แล้ว
            // ให้ตรวจสอบว่า position_id นี้อยู่ใน department นี้หรือไม่
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

    // ดึงข้อมูล Departments
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

    // ดึงข้อมูล Positions ทั้งหมด (ใช้สำหรับตรวจสอบ)
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

    // ดึง Positions ตาม Department ที่เลือก
    const fetchPositionsByDepartment = async (departmentId: string) => {
        try {
            setLoadingPositions(true)
            const response = await getPositionsByDepartment(departmentId)
            setFilteredPositions(response.positions || [])

            // ถ้าไม่มี positions ใน department นี้ ให้เคลียร์ position_id
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

    // Handle Department Change
    const handleDepartmentChange = async (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const departmentId = e.target.value
        setFormData((prev) => ({
            ...prev,
            department_id: departmentId,
            position_id: '', // เคลียร์ position เมื่อเปลี่ยน department
        }))
    }

    // Handle Input Change (ทั่วไป)
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

    // ฟังก์ชันสำหรับแสดงค่าใน input
    const getSalaryDisplayValue = () => {
        if (formData.base_salary === 0) {
            return ''
        }
        return formData.base_salary.toString()
    }

    // Handle Submit Form (User)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            // สร้างข้อมูลสำหรับส่ง
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

            // ถ้าเป็น edit และไม่ได้กรอก password ให้ลบ password ออก
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

            // รอสักครู่ให้เห็นข้อความ success ก่อนปิด
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

    // Reset Form
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

    // Handle Close Modal
    const handleClose = () => {
        resetForm()
        onClose()
    }

    // Handle Backdrop Click
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            handleClose()
        }
    }

    // เพิ่มฟังก์ชันสำหรับ Department และ Position
    const handleDepartmentSuccess = () => {
        fetchDepartments()
    }

    const handlePositionSuccess = () => {
        fetchAllPositions()
        if (formData.department_id) {
            fetchPositionsByDepartment(formData.department_id)
        }
    }

    // ฟังก์ชันจัดรูปแบบตัวเลขเป็นสกุลเงิน
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value)
    }

    if (!isOpen) return null

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px',
            }}
            onClick={handleBackdropClick}
        >
            <div
                style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: '900px',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                }}
            >
                {/* Modal Header */}
                <div
                    style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        position: 'sticky',
                        top: 0,
                        backgroundColor: 'white',
                        zIndex: 10,
                    }}
                >
                    <h2
                        style={{
                            margin: 0,
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#1f2937',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        {editingUser ? (
                            <>
                                <HiPencil size={24} color="#3b82f6" />
                                Edit User: {editingUser.first_name_en}{' '}
                                {editingUser.last_name_en}
                            </>
                        ) : (
                            <>
                                <HiUserAdd size={24} color="#3b82f6" />
                                Create New User
                            </>
                        )}
                    </h2>
                    <button
                        onClick={handleClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: '#6b7280',
                            padding: '4px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.color = '#374151')
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.color = '#6b7280')
                        }
                    >
                        <HiX />
                    </button>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '24px' }}>
                    {message && (
                        <div
                            style={{
                                padding: '12px 16px',
                                marginBottom: '20px',
                                borderRadius: '8px',
                                backgroundColor:
                                    message.type === 'success'
                                        ? '#d1fae5'
                                        : '#fee2e2',
                                color:
                                    message.type === 'success'
                                        ? '#065f46'
                                        : '#991b1b',
                                border: `1px solid ${message.type === 'success' ? '#6ee7b7' : '#fca5a5'}`,
                                fontSize: '14px',
                                fontWeight: '500',
                            }}
                        >
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '16px',
                                marginBottom: '24px',
                            }}
                        >
                            {/* Account Information */}
                            <div>
                                <label style={labelStyle}>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="user@example.com"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>
                                    Password{' '}
                                    {editingUser &&
                                        '(leave blank to keep current)'}{' '}
                                    *
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required={!editingUser}
                                    placeholder="••••••••"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Role *</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    required
                                    style={{ ...inputStyle, cursor: 'pointer' }}
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

                            {/* Salary Information */}
                            <div>
                                <label style={labelStyle}>
                                    💰 Base Salary *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        name="base_salary"
                                        value={getSalaryDisplayValue()}
                                        onChange={handleSalaryChange}
                                        required
                                        placeholder="0.00"
                                        style={{
                                            ...inputStyle,
                                            paddingLeft: '40px',
                                        }}
                                    />
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#6b7280',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                        }}
                                    >
                                        ₭
                                    </div>
                                    {formData.base_salary > 0 && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                right: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#6b7280',
                                                fontSize: '12px',
                                                fontStyle: 'italic',
                                            }}
                                        >
                                            {formatCurrency(
                                                formData.base_salary,
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* English Name Section */}
                            <div>
                                <label style={labelStyle}>
                                    First Name (EN) *
                                </label>
                                <input
                                    type="text"
                                    name="first_name_en"
                                    value={formData.first_name_en}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="John"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>
                                    Last Name (EN) *
                                </label>
                                <input
                                    type="text"
                                    name="last_name_en"
                                    value={formData.last_name_en}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Doe"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>
                                    Nickname (EN) *
                                </label>
                                <input
                                    type="text"
                                    name="nickname_en"
                                    value={formData.nickname_en}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Johnny"
                                    style={inputStyle}
                                />
                            </div>

                            {/* Lao Name Section */}
                            <div>
                                <label style={labelStyle}>
                                    First Name (LA) *
                                </label>
                                <input
                                    type="text"
                                    name="first_name_la"
                                    value={formData.first_name_la}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="ຈອນ"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>
                                    Last Name (LA) *
                                </label>
                                <input
                                    type="text"
                                    name="last_name_la"
                                    value={formData.last_name_la}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="ໂດ"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>
                                    Nickname (LA) *
                                </label>
                                <input
                                    type="text"
                                    name="nickname_la"
                                    value={formData.nickname_la}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="ຈອນນີ"
                                    style={inputStyle}
                                />
                            </div>

                            {/* Personal Information */}
                            <div>
                                <label style={labelStyle}>Gender *</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    required
                                    style={{ ...inputStyle, cursor: 'pointer' }}
                                >
                                    <option value="Male">♂️ Male</option>
                                    <option value="Female">♀️ Female</option>
                                    <option value="Other">⚧ Other</option>
                                </select>
                            </div>

                            <div>
                                <label style={labelStyle}>
                                    Date of Birth *
                                </label>
                                <input
                                    type="date"
                                    name="date_of_birth"
                                    value={formData.date_of_birth}
                                    onChange={handleInputChange}
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>
                                    Start Work Date *
                                </label>
                                <input
                                    type="date"
                                    name="start_work"
                                    value={formData.start_work}
                                    onChange={handleInputChange}
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            {/* Work Information Section */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <h3
                                    style={{
                                        margin: '20px 0 10px 0',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        borderBottom: '2px solid #e5e7eb',
                                        paddingBottom: '8px',
                                    }}
                                >
                                    💼 Work Information
                                </h3>
                            </div>

                            {/* Department Input with Add Button */}
                            <div>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginBottom: '8px',
                                    }}
                                >
                                    <label style={labelStyle}>
                                        Department *
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setDepartmentModalOpen(true)
                                        }
                                        style={{
                                            marginLeft: 'auto',
                                            padding: '6px 12px',
                                            backgroundColor: '#10b981',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                        }}
                                        title="Add new department"
                                    >
                                        <HiPlus size={12} />
                                        Add
                                    </button>
                                </div>
                                <select
                                    name="department_id"
                                    value={formData.department_id}
                                    onChange={handleInputChange}
                                    required
                                    disabled={loadingDepartments}
                                    style={{
                                        ...inputStyle,
                                        cursor: loadingDepartments
                                            ? 'wait'
                                            : 'pointer',
                                        backgroundColor: loadingDepartments
                                            ? '#f9fafb'
                                            : 'white',
                                    }}
                                >
                                    <option value="">
                                        {loadingDepartments
                                            ? 'Loading...'
                                            : 'Select Department'}
                                    </option>
                                    {departments.map((dept) => (
                                        <option key={dept._id} value={dept._id}>
                                            {dept.department_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Position Input with Add Button */}
                            <div>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginBottom: '8px',
                                    }}
                                >
                                    <label style={labelStyle}>Position *</label>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPositionModalOpen(true)
                                        }
                                        disabled={
                                            !formData.department_id ||
                                            loadingPositions
                                        }
                                        style={{
                                            marginLeft: 'auto',
                                            padding: '6px 12px',
                                            backgroundColor:
                                                formData.department_id &&
                                                !loadingPositions
                                                    ? '#10b981'
                                                    : '#9ca3af',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor:
                                                formData.department_id &&
                                                !loadingPositions
                                                    ? 'pointer'
                                                    : 'not-allowed',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                        }}
                                        title={
                                            formData.department_id
                                                ? 'Add new position'
                                                : 'Select department first'
                                        }
                                    >
                                        <HiPlus size={12} />
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
                                    style={{
                                        ...inputStyle,
                                        cursor:
                                            formData.department_id &&
                                            !loadingPositions
                                                ? 'pointer'
                                                : 'not-allowed',
                                        backgroundColor:
                                            !formData.department_id ||
                                            loadingPositions
                                                ? '#f9fafb'
                                                : 'white',
                                    }}
                                >
                                    <option value="">
                                        {loadingPositions
                                            ? 'Loading positions...'
                                            : !formData.department_id
                                              ? 'Select department first'
                                              : filteredPositions.length === 0
                                                ? 'No positions found'
                                                : 'Select Position'}
                                    </option>
                                    {filteredPositions.map((pos) => (
                                        <option key={pos._id} value={pos._id}>
                                            {pos.position_name}
                                        </option>
                                    ))}
                                </select>
                                {formData.department_id &&
                                    filteredPositions.length > 0 && (
                                        <div
                                            style={{
                                                fontSize: '12px',
                                                color: '#6b7280',
                                                marginTop: '4px',
                                            }}
                                        >
                                            Found {filteredPositions.length}{' '}
                                            position(s)
                                        </div>
                                    )}
                            </div>

                            {/* Vacation Days และ Status */}
                            <div>
                                <label style={labelStyle}>Vacation Days</label>
                                <input
                                    type="number"
                                    name="vacation_days"
                                    value={formData.vacation_days}
                                    onChange={handleInputChange}
                                    min="0"
                                    placeholder="0"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Status *</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    required
                                    style={{ ...inputStyle, cursor: 'pointer' }}
                                >
                                    <option value="Active">✅ Active</option>
                                    <option value="Inactive">
                                        ❌ Inactive
                                    </option>
                                    <option value="On Leave">
                                        🏖️ On Leave
                                    </option>
                                </select>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px',
                                paddingTop: '20px',
                                borderTop: '1px solid #e5e7eb',
                            }}
                        >
                            <button
                                type="button"
                                onClick={handleClose}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#6b7280',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.3s ease',
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.backgroundColor =
                                        '#4b5563')
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.backgroundColor =
                                        '#6b7280')
                                }
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: loading
                                        ? '#9ca3af'
                                        : '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.3s ease',
                                }}
                                onMouseEnter={(e) =>
                                    !loading &&
                                    (e.currentTarget.style.backgroundColor =
                                        '#2563eb')
                                }
                                onMouseLeave={(e) =>
                                    !loading &&
                                    (e.currentTarget.style.backgroundColor =
                                        '#3b82f6')
                                }
                            >
                                {loading
                                    ? 'Processing...'
                                    : editingUser
                                      ? 'Update User'
                                      : 'Create User'}
                            </button>
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
        </div>
    )
}

const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    outline: 'none',
}

const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
}

export default UserFormModal
