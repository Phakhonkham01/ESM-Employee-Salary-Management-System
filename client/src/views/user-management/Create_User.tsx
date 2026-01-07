import React, { useState, useEffect } from 'react'
import {
    createUser,
    getAllUsers,
    updateUser,
    deleteUser,
} from '../../services/Create_user/api'
import type { CreateUserData, UserData } from '../../services/Create_user/api'
import { HiUserAdd, HiPencil, HiTrash, HiX, HiCheck } from 'react-icons/hi'

const Create_Supervisor_and_Admin: React.FC = () => {
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

    const [users, setUsers] = useState<UserData[]>([])
    const [editingId, setEditingId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{
        type: 'success' | 'error'
        text: string
    } | null>(null)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const response = await getAllUsers()
            setUsers(response.users)
        } catch (error: any) {
            showMessage('error', error.message)
        }
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

        try {
            if (editingId) {
                await updateUser(editingId, formData)
                showMessage('success', 'User updated successfully!')
                setEditingId(null)
            } else {
                await createUser(formData)
                showMessage('success', 'User created successfully!')
            }

            resetForm()
            fetchUsers()
        } catch (error: any) {
            showMessage('error', error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (user: UserData) => {
        setFormData({
            email: user.email,
            password: '',
            role: user.role,
            first_name_en: user.first_name_en,
            last_name_en: user.last_name_en,
            nickname_en: user.nickname_en,
            first_name_la: user.first_name_la,
            last_name_la: user.last_name_la,
            nickname_la: user.nickname_la,
            date_of_birth: user.date_of_birth.split('T')[0],
            start_work: user.start_work.split('T')[0],
            vacation_days: user.vacation_days,
            gender: user.gender,
            position_id: user.position_id,
            department_id: user.department_id,
            status: user.status,
        })
        setEditingId(user._id)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(id)
                showMessage('success', 'User deleted successfully!')
                fetchUsers()
            } catch (error: any) {
                showMessage('error', error.message)
            }
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
        })
        setEditingId(null)
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

    const sectionHeaderStyle = {
        gridColumn: '1 / -1',
        marginTop: '20px',
        marginBottom: '10px',
        paddingBottom: '8px',
        borderBottom: '2px solid #3b82f6',
        color: '#1f2937',
        fontSize: '18px',
        fontWeight: '600',
    }

    return (
        <div
            style={{
                padding: '30px',
                maxWidth: '1400px',
                margin: '0 auto',
                backgroundColor: '#f9fafb',
                minHeight: '100vh',
            }}
        >
            {/* Header */}
            <div
                style={{
                    marginBottom: '30px',
                    padding: '24px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
            >
                <h1
                    style={{
                        margin: 0,
                        fontSize: '28px',
                        fontWeight: '700',
                        color: '#1f2937',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}
                >
                    <HiUserAdd size={32} color="#3b82f6" />
                    User Management System
                </h1>
                <p
                    style={{
                        margin: '8px 0 0 0',
                        color: '#6b7280',
                        fontSize: '14px',
                    }}
                >
                    Create, edit, and manage user accounts
                </p>
            </div>

            {/* Alert Message */}
            {message && (
                <div
                    style={{
                        padding: '16px 20px',
                        marginBottom: '24px',
                        borderRadius: '12px',
                        backgroundColor:
                            message.type === 'success' ? '#d1fae5' : '#fee2e2',
                        color:
                            message.type === 'success' ? '#065f46' : '#991b1b',
                        border: `1px solid ${message.type === 'success' ? '#6ee7b7' : '#fca5a5'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '14px',
                        fontWeight: '500',
                        animation: 'slideIn 0.3s ease-out',
                    }}
                >
                    {message.type === 'success' ? (
                        <HiCheck size={20} />
                    ) : (
                        <HiX size={20} />
                    )}
                    {message.text}
                </div>
            )}

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                style={{
                    backgroundColor: 'white',
                    padding: '30px',
                    borderRadius: '12px',
                    marginBottom: '30px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
            >
                <h2
                    style={{
                        margin: '0 0 24px 0',
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#1f2937',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    {editingId ? (
                        <>
                            <HiPencil size={24} color="#3b82f6" />
                            Edit User
                        </>
                    ) : (
                        <>
                            <HiUserAdd size={24} color="#3b82f6" />
                            Create New User
                        </>
                    )}
                </h2>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '20px',
                    }}
                >
                    {/* English Name Section */}
                    <div style={sectionHeaderStyle}>🇬🇧 English Name</div>

                    <div>
                        <label style={labelStyle}>First Name (EN) *</label>
                        <input
                            type="text"
                            name="first_name_en"
                            value={formData.first_name_en}
                            onChange={handleInputChange}
                            required
                            placeholder="John"
                            style={inputStyle}
                            onFocus={(e) =>
                                (e.target.style.borderColor = '#3b82f6')
                            }
                            onBlur={(e) =>
                                (e.target.style.borderColor = '#e0e0e0')
                            }
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Last Name (EN) *</label>
                        <input
                            type="text"
                            name="last_name_en"
                            value={formData.last_name_en}
                            onChange={handleInputChange}
                            required
                            placeholder="Doe"
                            style={inputStyle}
                            onFocus={(e) =>
                                (e.target.style.borderColor = '#3b82f6')
                            }
                            onBlur={(e) =>
                                (e.target.style.borderColor = '#e0e0e0')
                            }
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Nickname (EN) *</label>
                        <input
                            type="text"
                            name="nickname_en"
                            value={formData.nickname_en}
                            onChange={handleInputChange}
                            required
                            placeholder="Johnny"
                            style={inputStyle}
                            onFocus={(e) =>
                                (e.target.style.borderColor = '#3b82f6')
                            }
                            onBlur={(e) =>
                                (e.target.style.borderColor = '#e0e0e0')
                            }
                        />
                    </div>

                    {/* Lao Name Section */}
                    <div style={sectionHeaderStyle}>🇱🇦 Lao Name (ຊື່ລາວ)</div>

                    <div>
                        <label style={labelStyle}>First Name (LA) *</label>
                        <input
                            type="text"
                            name="first_name_la"
                            value={formData.first_name_la}
                            onChange={handleInputChange}
                            required
                            placeholder="ຈອນ"
                            style={inputStyle}
                            onFocus={(e) =>
                                (e.target.style.borderColor = '#3b82f6')
                            }
                            onBlur={(e) =>
                                (e.target.style.borderColor = '#e0e0e0')
                            }
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Last Name (LA) *</label>
                        <input
                            type="text"
                            name="last_name_la"
                            value={formData.last_name_la}
                            onChange={handleInputChange}
                            required
                            placeholder="ໂດ"
                            style={inputStyle}
                            onFocus={(e) =>
                                (e.target.style.borderColor = '#3b82f6')
                            }
                            onBlur={(e) =>
                                (e.target.style.borderColor = '#e0e0e0')
                            }
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Nickname (LA) *</label>
                        <input
                            type="text"
                            name="nickname_la"
                            value={formData.nickname_la}
                            onChange={handleInputChange}
                            required
                            placeholder="ຈອນນີ"
                            style={inputStyle}
                            onFocus={(e) =>
                                (e.target.style.borderColor = '#3b82f6')
                            }
                            onBlur={(e) =>
                                (e.target.style.borderColor = '#e0e0e0')
                            }
                        />
                    </div>

                    {/* Account Information */}
                    <div style={sectionHeaderStyle}>🔐 Account Information</div>

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
                            onFocus={(e) =>
                                (e.target.style.borderColor = '#3b82f6')
                            }
                            onBlur={(e) =>
                                (e.target.style.borderColor = '#e0e0e0')
                            }
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>
                            Password{' '}
                            {editingId && '(leave blank to keep current)'} *
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required={!editingId}
                            placeholder="••••••••"
                            style={inputStyle}
                            onFocus={(e) =>
                                (e.target.style.borderColor = '#3b82f6')
                            }
                            onBlur={(e) =>
                                (e.target.style.borderColor = '#e0e0e0')
                            }
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
                            onFocus={(e) =>
                                (e.target.style.borderColor = '#3b82f6')
                            }
                            onBlur={(e) =>
                                (e.target.style.borderColor = '#e0e0e0')
                            }
                        >
                            <option value="Employee">👤 Employee</option>
                            <option value="Supervisor">👥 Supervisor</option>
                            <option value="Admin">⚙️ Admin</option>
                        </select>
                    </div>

                    {/* Personal Information */}
                    <div style={sectionHeaderStyle}>
                        👤 Personal Information
                    </div>

                    <div>
                        <label style={labelStyle}>Date of Birth *</label>
                        <input
                            type="date"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleInputChange}
                            required
                            style={inputStyle}
                            onFocus={(e) =>
                                (e.target.style.borderColor = '#3b82f6')
                            }
                            onBlur={(e) =>
                                (e.target.style.borderColor = '#e0e0e0')
                            }
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
                            onFocus={(e) =>
                                (e.target.style.borderColor = '#3b82f6')
                            }
                            onBlur={(e) =>
                                (e.target.style.borderColor = '#e0e0e0')
                            }
                        >
                            <option value="Male">♂️ Male</option>
                            <option value="Female">♀️ Female</option>
                            <option value="Other">⚧ Other</option>
                        </select>
                    </div>

                    <div>
                        <label style={labelStyle}>Start Work Date *</label>
                        <input
                            type="date"
                            name="start_work"
                            value={formData.start_work}
                            onChange={handleInputChange}
                            required
                            style={inputStyle}
                            onFocus={(e) =>
                                (e.target.style.borderColor = '#3b82f6')
                            }
                            onBlur={(e) =>
                                (e.target.style.borderColor = '#e0e0e0')
                            }
                        />
                    </div>

                    {/* Work Information */}
                    <div style={sectionHeaderStyle}>💼 Work Information</div>

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
                            onFocus={(e) =>
                                (e.target.style.borderColor = '#3b82f6')
                            }
                            onBlur={(e) =>
                                (e.target.style.borderColor = '#e0e0e0')
                            }
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Department ID *</label>
                        <input
                            type="text"
                            name="department_id"
                            value={formData.department_id}
                            onChange={handleInputChange}
                            required
                            placeholder="CX001"
                            style={inputStyle}
                            onFocus={(e) =>
                                (e.target.style.borderColor = '#3b82f6')
                            }
                            onBlur={(e) =>
                                (e.target.style.borderColor = '#e0e0e0')
                            }
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
                            onFocus={(e) =>
                                (e.target.style.borderColor = '#3b82f6')
                            }
                            onBlur={(e) =>
                                (e.target.style.borderColor = '#e0e0e0')
                            }
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
                            onFocus={(e) =>
                                (e.target.style.borderColor = '#3b82f6')
                            }
                            onBlur={(e) =>
                                (e.target.style.borderColor = '#e0e0e0')
                            }
                        >
                            <option value="Active">✅ Active</option>
                            <option value="Inactive">❌ Inactive</option>
                            <option value="On Leave">🏖️ On Leave</option>
                        </select>
                    </div>
                </div>

                {/* Buttons */}
                <div
                    style={{
                        marginTop: '32px',
                        display: 'flex',
                        gap: '12px',
                        paddingTop: '24px',
                        borderTop: '1px solid #e5e7eb',
                    }}
                >
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                        onMouseEnter={(e) =>
                            !loading &&
                            (e.currentTarget.style.backgroundColor = '#2563eb')
                        }
                        onMouseLeave={(e) =>
                            !loading &&
                            (e.currentTarget.style.backgroundColor = '#3b82f6')
                        }
                    >
                        {loading
                            ? '⏳ Processing...'
                            : editingId
                              ? '✏️ Update User'
                              : '➕ Create User'}
                    </button>

                    {editingId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#6b7280',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
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
                            ❌ Cancel
                        </button>
                    )}
                </div>
            </form>

            {/* Users Table */}
            <div
                style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '30px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
            >
                <h2
                    style={{
                        margin: '0 0 20px 0',
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#1f2937',
                    }}
                >
                    📋 Users List ({users.length})
                </h2>

                <div style={{ overflowX: 'auto' }}>
                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                        }}
                    >
                        <thead>
                            <tr
                                style={{
                                    backgroundColor: '#f3f4f6',
                                    borderBottom: '2px solid #e5e7eb',
                                }}
                            >
                                <th
                                    style={{
                                        padding: '14px 12px',
                                        textAlign: 'left',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    Name (EN)
                                </th>
                                <th
                                    style={{
                                        padding: '14px 12px',
                                        textAlign: 'left',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    Name (LA)
                                </th>
                                <th
                                    style={{
                                        padding: '14px 12px',
                                        textAlign: 'left',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    Email
                                </th>
                                <th
                                    style={{
                                        padding: '14px 12px',
                                        textAlign: 'left',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    Role
                                </th>
                                <th
                                    style={{
                                        padding: '14px 12px',
                                        textAlign: 'left',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    Gender
                                </th>
                                <th
                                    style={{
                                        padding: '14px 12px',
                                        textAlign: 'left',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    Position
                                </th>
                                <th
                                    style={{
                                        padding: '14px 12px',
                                        textAlign: 'left',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    Department
                                </th>
                                <th
                                    style={{
                                        padding: '14px 12px',
                                        textAlign: 'center',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    Vacation
                                </th>
                                <th
                                    style={{
                                        padding: '14px 12px',
                                        textAlign: 'center',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    Status
                                </th>
                                <th
                                    style={{
                                        padding: '14px 12px',
                                        textAlign: 'center',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => (
                                <tr
                                    key={user._id}
                                    style={{
                                        borderBottom: '1px solid #e5e7eb',
                                        transition:
                                            'background-color 0.2s ease',
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                            '#f9fafb')
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                            'white')
                                    }
                                >
                                    <td
                                        style={{
                                            padding: '14px 12px',
                                            fontSize: '14px',
                                            color: '#111827',
                                        }}
                                    >
                                        <div style={{ fontWeight: '500' }}>
                                            {user.first_name_en}{' '}
                                            {user.last_name_en}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '12px',
                                                color: '#6b7280',
                                                marginTop: '2px',
                                            }}
                                        >
                                            ({user.nickname_en})
                                        </div>
                                    </td>
                                    <td
                                        style={{
                                            padding: '14px 12px',
                                            fontSize: '14px',
                                            color: '#111827',
                                        }}
                                    >
                                        <div style={{ fontWeight: '500' }}>
                                            {user.first_name_la}{' '}
                                            {user.last_name_la}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '12px',
                                                color: '#6b7280',
                                                marginTop: '2px',
                                            }}
                                        >
                                            ({user.nickname_la})
                                        </div>
                                    </td>
                                    <td
                                        style={{
                                            padding: '14px 12px',
                                            fontSize: '14px',
                                            color: '#374151',
                                        }}
                                    >
                                        {user.email}
                                    </td>
                                    <td style={{ padding: '14px 12px' }}>
                                        <span
                                            style={{
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                backgroundColor:
                                                    user.role === 'Admin'
                                                        ? '#dbeafe'
                                                        : user.role ===
                                                            'Supervisor'
                                                          ? '#fef3c7'
                                                          : '#e0e7ff',
                                                color:
                                                    user.role === 'Admin'
                                                        ? '#1e40af'
                                                        : user.role ===
                                                            'Supervisor'
                                                          ? '#92400e'
                                                          : '#3730a3',
                                            }}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td
                                        style={{
                                            padding: '14px 12px',
                                            fontSize: '14px',
                                            color: '#374151',
                                        }}
                                    >
                                        {user.gender === 'Male'
                                            ? '♂️'
                                            : user.gender === 'Female'
                                              ? '♀️'
                                              : '⚧'}{' '}
                                        {user.gender}
                                    </td>
                                    <td
                                        style={{
                                            padding: '14px 12px',
                                            fontSize: '14px',
                                            color: '#374151',
                                        }}
                                    >
                                        {user.position_id}
                                    </td>
                                    <td
                                        style={{
                                            padding: '14px 12px',
                                            fontSize: '14px',
                                            color: '#374151',
                                        }}
                                    >
                                        {user.department_id}
                                    </td>
                                    <td
                                        style={{
                                            padding: '14px 12px',
                                            fontSize: '14px',
                                            color: '#374151',
                                            textAlign: 'center',
                                        }}
                                    >
                                        {user.vacation_days} days
                                    </td>
                                    <td
                                        style={{
                                            padding: '14px 12px',
                                            textAlign: 'center',
                                        }}
                                    >
                                        <span
                                            style={{
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                backgroundColor:
                                                    user.status === 'Active'
                                                        ? '#d1fae5'
                                                        : user.status ===
                                                            'Inactive'
                                                          ? '#fee2e2'
                                                          : '#fef3c7',
                                                color:
                                                    user.status === 'Active'
                                                        ? '#065f46'
                                                        : user.status ===
                                                            'Inactive'
                                                          ? '#991b1b'
                                                          : '#92400e',
                                            }}
                                        >
                                            {user.status === 'Active' && '✅'}
                                            {user.status === 'Inactive' && '❌'}
                                            {user.status === 'On Leave' &&
                                                '🏖️'}{' '}
                                            {user.status}
                                        </span>
                                    </td>
                                    <td
                                        style={{
                                            padding: '14px 12px',
                                            textAlign: 'center',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                gap: '8px',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <button
                                                onClick={() => handleEdit(user)}
                                                style={{
                                                    padding: '8px 12px',
                                                    backgroundColor: '#3b82f6',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                    transition: 'all 0.3s ease',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                }}
                                                onMouseEnter={(e) =>
                                                    (e.currentTarget.style.backgroundColor =
                                                        '#2563eb')
                                                }
                                                onMouseLeave={(e) =>
                                                    (e.currentTarget.style.backgroundColor =
                                                        '#3b82f6')
                                                }
                                                title="Edit user"
                                            >
                                                <HiPencil size={14} />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(user._id)
                                                }
                                                style={{
                                                    padding: '8px 12px',
                                                    backgroundColor: '#ef4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                    transition: 'all 0.3s ease',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                }}
                                                onMouseEnter={(e) =>
                                                    (e.currentTarget.style.backgroundColor =
                                                        '#dc2626')
                                                }
                                                onMouseLeave={(e) =>
                                                    (e.currentTarget.style.backgroundColor =
                                                        '#ef4444')
                                                }
                                                title="Delete user"
                                            >
                                                <HiTrash size={14} />
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {users.length === 0 && (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            color: '#6b7280',
                            fontSize: '15px',
                        }}
                    >
                        <div
                            style={{
                                fontSize: '48px',
                                marginBottom: '16px',
                                opacity: 0.5,
                            }}
                        >
                            👥
                        </div>
                        <p style={{ margin: 0, marginBottom: '8px' }}>
                            No users found
                        </p>
                        <p
                            style={{
                                margin: 0,
                                fontSize: '14px',
                                opacity: 0.8,
                            }}
                        >
                            Start by creating your first user above
                        </p>
                    </div>
                )}

                {/* Table Footer */}
                <div
                    style={{
                        marginTop: '24px',
                        paddingTop: '20px',
                        borderTop: '1px solid #e5e7eb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '13px',
                        color: '#6b7280',
                    }}
                >
                    <div>
                        Showing{' '}
                        <span style={{ fontWeight: '600', color: '#374151' }}>
                            {users.length}
                        </span>{' '}
                        users
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                        }}
                    >
                        <button
                            onClick={fetchUsers}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#f3f4f6',
                                color: '#374151',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                    '#e5e7eb')
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                    '#f3f4f6')
                            }
                            title="Refresh users list"
                        >
                            🔄 Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div
                style={{
                    marginTop: '30px',
                    padding: '20px',
                    textAlign: 'center',
                    color: '#6b7280',
                    fontSize: '13px',
                    borderTop: '1px solid #e5e7eb',
                }}
            >
                <p style={{ margin: 0 }}>
                    User Management System v1.0 • Created with React &
                    TypeScript
                </p>
                <p
                    style={{
                        margin: '4px 0 0 0',
                        fontSize: '12px',
                        opacity: 0.8,
                    }}
                >
                    Total Users: {users.length} • Last updated:{' '}
                    {new Date().toLocaleDateString()}
                </p>
            </div>

            {/* Add some global styles for animations */}
            <style>
                {`
                @keyframes slideIn {
                    from {
                        transform: translateY(-10px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                
                input:focus, select:focus {
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                
                tr {
                    animation: fadeIn 0.5s ease-out;
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                `}
            </style>
        </div>
    )
}

export default Create_Supervisor_and_Admin
