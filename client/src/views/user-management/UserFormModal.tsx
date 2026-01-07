import React, { useState, useEffect } from 'react'
import { createUser, updateUser } from '../../services/Create_user/api'
import type { CreateUserData, UserData } from '../../services/Create_user/api'
import { HiUserAdd, HiPencil, HiX } from 'react-icons/hi'

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
    const [formData, setFormData] = useState<CreateUserData>({
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
    })

    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{
        type: 'success' | 'error'
        text: string
    } | null>(null)

    useEffect(() => {
        if (editingUser && isOpen) {
            setFormData({
                email: editingUser.email,
                password: '', // ไม่ต้องใส่ password เวลา edit
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
                position_id: editingUser.position_id,
                department_id: editingUser.department_id,
                status: editingUser.status,
            })
        } else if (!editingUser && isOpen) {
            resetForm()
        }
    }, [editingUser, isOpen])

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
        })
        setMessage(null)
    }

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text })
        setTimeout(() => setMessage(null), 5000)
    }

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'vacation_days' ? parseInt(value) || 0 : value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            const submitData = { ...formData }

            // ถ้าเป็น edit และไม่ได้กรอก password ให้ลบ password ออก
            if (editingUser && !submitData.password) {
                delete submitData.password
            }

            if (editingUser) {
                await updateUser(editingUser._id, submitData)
                showMessage('success', 'User updated successfully!')
            } else {
                await createUser(submitData)
                showMessage('success', 'User created successfully!')
            }

            // รอสักครู่ให้เห็นข้อความ success ก่อนปิด
            setTimeout(() => {
                onSuccess()
                resetForm()
                onClose()
            }, 1000)
        } catch (error: any) {
            showMessage('error', error.message || 'Something went wrong!')
        } finally {
            setLoading(false)
        }
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

                            <div>
                                <label style={labelStyle}>Position ID *</label>
                                <input
                                    type="text"
                                    name="position_id"
                                    value={formData.position_id}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="IT001"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>
                                    Department ID *
                                </label>
                                <input
                                    type="text"
                                    name="department_id"
                                    value={formData.department_id}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="CX001"
                                    style={inputStyle}
                                />
                            </div>

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
