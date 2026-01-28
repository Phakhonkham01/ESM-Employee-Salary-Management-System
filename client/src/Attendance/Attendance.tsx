import React, { useState, useEffect } from 'react'
import { getAllUsers, deleteUser } from '../services/Create_user/api'
import type { UserData } from '../services/Create_user/api'
import { HiPencil, HiTrash, HiRefresh } from 'react-icons/hi'

interface UserListProps {
    onEdit: (user: UserData) => void
}
//dkfchdsuhscduh
const asso = 'asso'
const SalaryCalculation: React.FC<UserListProps> = ({ onEdit }) => {
    const [users, setUsers] = useState<UserData[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await getAllUsers()
            setUsers(response.users)
        } catch (error: any) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(id)
                fetchUsers()
            } catch (error: any) {
                console.error('Error deleting user:', error)
            }
        }
    }

    return (
        <div
            style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '30px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                }}
            >
                <h2
                    style={{
                        margin: 0,
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#1f2937',
                    }}
                >
                    📋 Users List ({users.length})
                </h2>
            </div>

            {loading ? (
                <div
                    style={{
                        textAlign: 'center',
                        padding: '40px',
                        color: '#6b7280',
                        fontSize: '14px',
                    }}
                >
                    Loading users...
                </div>
            ) : (
                <>
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
                                    <th style={tableHeaderStyle}>Name (EN)</th>
                                    <th style={tableHeaderStyle}>Name (LA)</th>
                                    <th style={tableHeaderStyle}>Email</th>
                                    <th style={tableHeaderStyle}>Role</th>
                                    <th style={tableHeaderStyle}>Gender</th>
                                    <th style={tableHeaderStyle}>Position</th>
                                    <th style={tableHeaderStyle}>Department</th>
                                    <th style={tableHeaderStyle}>Status</th>
                                    <th style={tableHeaderStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
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
                                        <td style={tableCellStyle}>
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
                                        <td style={tableCellStyle}>
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
                                        <td style={tableCellStyle}>
                                            {user.email}
                                        </td>
                                        <td style={tableCellStyle}>
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
                                        <td style={tableCellStyle}>
                                            {user.gender === 'Male'
                                                ? '♂️'
                                                : user.gender === 'Female'
                                                  ? '♀️'
                                                  : '⚧'}{' '}
                                            {user.gender}
                                        </td>
                                        <td style={tableCellStyle}>
                                            {user.position_id?.position_name ||
                                                '-'}
                                        </td>

                                        <td style={tableCellStyle}>
                                            {user.department_id
                                                ?.department_name || '-'}
                                        </td>

                                        <td style={tableCellStyle}>
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
                                                {user.status === 'Active' &&
                                                    '✅'}
                                                {user.status === 'Inactive' &&
                                                    '❌'}
                                                {user.status === 'On Leave' &&
                                                    '🏖️'}{' '}
                                                {user.status}
                                            </span>
                                        </td>
                                        <td
                                            style={{
                                                ...tableCellStyle,
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
                                                    onClick={() => onEdit(user)}
                                                    style={actionButtonStyle(
                                                        '#3b82f6',
                                                        '#2563eb',
                                                    )}
                                                    title="Edit user"
                                                >
                                                    <HiPencil size={14} />
                                                    Salary c
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
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

const tableHeaderStyle = {
    padding: '14px 12px',
    textAlign: 'left' as const,
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
}

const tableCellStyle = {
    padding: '14px 12px',
    fontSize: '14px',
    color: '#374151',
}

const actionButtonStyle = (bgColor: string, hoverColor: string) => ({
    padding: '8px 12px',
    backgroundColor: bgColor,
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
    onMouseEnter: (e: any) =>
        (e.currentTarget.style.backgroundColor = hoverColor),
    onMouseLeave: (e: any) => (e.currentTarget.style.backgroundColor = bgColor),
})

export default SalaryCalculation
