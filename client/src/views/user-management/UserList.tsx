import React, { useState, useEffect } from 'react'
import { getAllUsers, deleteUser } from '../../services/Create_user/api'
import type { UserData } from '../../services/Create_user/api'
import { HiPencil, HiTrash, HiUserAdd } from 'react-icons/hi'
import UserFormModal from './UserFormModal'

interface UserListProps {
    onEdit: (user: UserData) => void
}

const UserList: React.FC<UserListProps> = ({ onEdit }) => {
    const [users, setUsers] = useState<UserData[]>([])
    const [loading, setLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<UserData | null>(null)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    useEffect(() => {
        fetchUsers()
    }, [refreshTrigger])

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

    const handleCreateUser = () => {
        setEditingUser(null)
        setIsModalOpen(true)
    }

    const handleEditUser = (user: UserData) => {
        setEditingUser(user)
        setIsModalOpen(true)
    }

    const handleModalClose = () => {
        setIsModalOpen(false)
        setEditingUser(null)
    }

    const handleSuccess = () => {
        setRefreshTrigger((prev) => prev + 1)
        setIsModalOpen(false)
        setEditingUser(null)
    }

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(id)
                setRefreshTrigger((prev) => prev + 1)
            } catch (error: any) {
                console.error('Error deleting user:', error)
            }
        }
    }

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case 'Admin':
                return 'bg-blue-100 text-blue-800'
            case 'Supervisor':
                return 'bg-amber-100 text-amber-800'
            default:
                return 'bg-indigo-100 text-indigo-800'
        }
    }

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-green-800'
            case 'Inactive':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-amber-100 text-amber-800'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Active':
                return '✅'
            case 'Inactive':
                return '❌'
            case 'On Leave':
                return '🏖️'
            default:
                return ''
        }
    }

    const getGenderIcon = (gender: string) => {
        switch (gender) {
            case 'Male':
                return '♂️'
            case 'Female':
                return '♀️'
            default:
                return '⚧'
        }
    }

    return (
        <div className="px-5">
            <div className="bg-white rounded-xl p-8 shadow-sm">
                {/* Header */}
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-semibold text-gray-800 m-0">
                        📋 Users List ({users.length})
                    </h2>
                    <button
                        onClick={handleCreateUser}
                        className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2"
                    >
                        <HiUserAdd size={18} />
                        Create New User
                    </button>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="text-center py-10 text-gray-500 text-sm">
                        Loading users...
                    </div>
                ) : (
                    <>
                        {/* Users Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 border-b-2 border-gray-200">
                                        <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            Name (EN)
                                        </th>
                                        <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            Name (LA)
                                        </th>
                                        <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            Email
                                        </th>
                                        <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            Role
                                        </th>
                                        <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            Gender
                                        </th>
                                        <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            Position
                                        </th>
                                        <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            Department
                                        </th>
                                        <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            Status
                                        </th>
                                        <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr
                                            key={user._id}
                                            className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                                        >
                                            <td className="px-3 py-3.5 text-sm text-gray-700">
                                                <div className="font-medium">
                                                    {user.first_name_en}{' '}
                                                    {user.last_name_en}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    ({user.nickname_en})
                                                </div>
                                            </td>
                                            <td className="px-3 py-3.5 text-sm text-gray-700">
                                                <div className="font-medium">
                                                    {user.first_name_la}{' '}
                                                    {user.last_name_la}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    ({user.nickname_la})
                                                </div>
                                            </td>
                                            <td className="px-3 py-3.5 text-sm text-gray-700">
                                                {user.email}
                                            </td>
                                            <td className="px-3 py-3.5 text-sm text-gray-700">
                                                <span
                                                    className={`px-2.5 py-1 rounded-md text-xs font-medium ${getRoleBadgeClass(user.role)}`}
                                                >
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3.5 text-sm text-gray-700">
                                                {getGenderIcon(user.gender)}{' '}
                                                {user.gender}
                                            </td>
                                            <td className="px-3 py-3.5 text-sm text-gray-700">
                                                {user.position_id
                                                    ?.position_name || '-'}
                                            </td>
                                            <td className="px-3 py-3.5 text-sm text-gray-700">
                                                {user.department_id
                                                    ?.department_name || '-'}
                                            </td>
                                            <td className="px-3 py-3.5 text-sm text-gray-700">
                                                <span
                                                    className={`px-2.5 py-1 rounded-md text-xs font-medium ${getStatusBadgeClass(user.status)}`}
                                                >
                                                    {getStatusIcon(user.status)}{' '}
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3.5 text-sm text-gray-700 text-center">
                                                <div className="flex gap-2 justify-center">
                                                    <button
                                                        onClick={() =>
                                                            handleEditUser(user)
                                                        }
                                                        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs font-medium transition-all duration-300 flex items-center gap-1"
                                                        title="Edit user"
                                                    >
                                                        <HiPencil size={14} />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                user._id,
                                                            )
                                                        }
                                                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs font-medium transition-all duration-300 flex items-center gap-1"
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

                        {/* Empty State */}
                        {users.length === 0 && (
                            <div className="text-center py-15 px-5 text-gray-500 text-sm">
                                <div className="text-5xl mb-4 opacity-50">
                                    👥
                                </div>
                                <p className="m-0 mb-2">No users found</p>
                            </div>
                        )}
                    </>
                )}

                {/* User Form Modal */}
                <UserFormModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    editingUser={editingUser}
                    onSuccess={handleSuccess}
                />
            </div>
        </div>
    )
}

export default UserList
