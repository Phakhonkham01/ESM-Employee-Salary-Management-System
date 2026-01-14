'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { getAllUsers, deleteUser } from '../../services/Create_user/api'
import type { UserData } from '../../services/Create_user/api'
import {
    HiPencil,
    HiTrash,
    HiUserAdd,
    HiOutlineExclamationCircle,
    HiX,
} from 'react-icons/hi'
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
    const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserData | null>(
        null,
    )
    const [isDeleting, setIsDeleting] = useState(false)

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

    const handleDeleteClick = (user: UserData) => {
        setDeleteConfirmUser(user)
    }

    const handleDeleteConfirm = async () => {
        if (!deleteConfirmUser) return
        try {
            setIsDeleting(true)
            await deleteUser(deleteConfirmUser._id)
            setRefreshTrigger((prev) => prev + 1)
            setDeleteConfirmUser(null)
        } catch (error: any) {
            console.error('Error deleting user:', error)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleDeleteCancel = () => {
        setDeleteConfirmUser(null)
    }

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case 'Admin':
                return 'bg-[#1F3A5F] text-white border-[#1F3A5F]'
            case 'Supervisor':
                return 'bg-[#E8EEF6] text-[#1F3A5F] border-[#CBD5E1]'
            default:
                return 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]'
        }
    }

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-[#E6F4EA] text-[#2E7D32] border-[#C8E6C9]'
            case 'Inactive':
                return 'bg-[#FDE8E8] text-[#9B1C1C] border-[#FECACA]'
            case 'On Leave':
                return 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
            default:
                return 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]'
        }
    }

    const getStatusDotClass = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-[#2E7D32]'
            case 'Inactive':
                return 'bg-[#9B1C1C]'
            case 'On Leave':
                return 'bg-[#B45309]'
            default:
                return 'bg-[#6B7280]'
        }
    }

    return (
        <div className="min-h-screen w-full bg-[#F9FAFB] flex flex-col font-sans">
            {/* Header Bar */}
            {/* <header className="w-full bg-[#1F3A5F] text-white px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <h1 className="text-lg font-medium tracking-wide">
                        User Management System
                    </h1>
                    <nav className="flex items-center gap-1 ml-8">
                        <span className="px-4 py-2 text-sm bg-white/10 rounded">
                            User List
                        </span>
                        <span className="px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded cursor-pointer transition-colors">
                            Departments
                        </span>
                        <span className="px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded cursor-pointer transition-colors">
                            Positions
                        </span>
                        <span className="px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded cursor-pointer transition-colors">
                            Settings
                        </span>
                    </nav>
                </div>
                <div className="text-sm text-white/80">
                    System Version: 2.4.1
                </div>
            </header> */}

            {/* Main Content */}
            <main className="flex-1 p-8">
                {/* Page Title and Actions */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-medium text-[#1F3A5F]">
                            User List
                        </h2>
                        <p className="text-sm text-[#6B7280] mt-1">
                            Total registered users: {users.length}
                        </p>
                    </div>
                    <button
                        onClick={handleCreateUser}
                        className="px-5 py-2.5 bg-[#1F3A5F] hover:bg-[#152642] text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <HiUserAdd size={18} />
                        Create New User
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-white border border-[#E5E7EB] rounded p-4">
                        <div className="text-sm text-[#6B7280] mb-1">
                            Total Users
                        </div>
                        <div className="text-2xl font-semibold text-[#1F3A5F]">
                            {users.length}
                        </div>
                    </div>
                    <div className="bg-white border border-[#E5E7EB] rounded p-4">
                        <div className="text-sm text-[#6B7280] mb-1">
                            Active
                        </div>
                        <div className="text-2xl font-semibold text-[#2E7D32]">
                            {users.filter((u) => u.status === 'Active').length}
                        </div>
                    </div>
                    <div className="bg-white border border-[#E5E7EB] rounded p-4">
                        <div className="text-sm text-[#6B7280] mb-1">
                            On Leave
                        </div>
                        <div className="text-2xl font-semibold text-[#B45309]">
                            {
                                users.filter((u) => u.status === 'On Leave')
                                    .length
                            }
                        </div>
                    </div>
                    <div className="bg-white border border-[#E5E7EB] rounded p-4">
                        <div className="text-sm text-[#6B7280] mb-1">
                            Inactive
                        </div>
                        <div className="text-2xl font-semibold text-[#9B1C1C]">
                            {
                                users.filter((u) => u.status === 'Inactive')
                                    .length
                            }
                        </div>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white border border-[#E5E7EB] rounded">
                    {/* Loading State */}
                    {loading ? (
                        <div className="px-6 py-16 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#E5E7EB] border-t-[#1F3A5F] mb-4"></div>
                            <p className="text-[#6B7280] text-sm">
                                Loading user data...
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Users Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                                            <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                                                Name (EN)
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                                                Name (LA)
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                                                Gender
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                                                Position
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                                                Department
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E5E7EB]">
                                        {users.map((user) => (
                                            <tr
                                                key={user._id}
                                                className="hover:bg-[#F9FAFB] transition-colors"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="text-sm font-medium text-[#1F3A5F]">
                                                        {user.first_name_en}{' '}
                                                        {user.last_name_en}
                                                    </div>
                                                    <div className="text-xs text-[#6B7280]">
                                                        ({user.nickname_en})
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm font-medium text-[#1F3A5F]">
                                                        {user.first_name_la}{' '}
                                                        {user.last_name_la}
                                                    </div>
                                                    <div className="text-xs text-[#6B7280]">
                                                        ({user.nickname_la})
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-[#1F3A5F]">
                                                    {user.email}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium border ${getRoleBadgeClass(user.role)}`}
                                                    >
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-[#1F3A5F]">
                                                    {user.gender}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-[#1F3A5F]">
                                                    {user.position_id
                                                        ?.position_name || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-[#1F3A5F]">
                                                    {user.department_id
                                                        ?.department_name ||
                                                        '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium border ${getStatusBadgeClass(user.status)}`}
                                                    >
                                                        <span
                                                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusDotClass(user.status)}`}
                                                        ></span>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleEditUser(
                                                                    user,
                                                                )
                                                            }
                                                            className="px-3 py-1.5 bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#1F3A5F] rounded text-xs font-medium transition-colors flex items-center gap-1"
                                                            title="Edit user"
                                                        >
                                                            <HiPencil
                                                                size={12}
                                                            />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteClick(
                                                                    user,
                                                                )
                                                            }
                                                            className="px-3 py-1.5 bg-white border border-[#FECACA] hover:bg-[#FDE8E8] text-[#9B1C1C] rounded text-xs font-medium transition-colors flex items-center gap-1"
                                                            title="Delete user"
                                                        >
                                                            <HiTrash
                                                                size={12}
                                                            />
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
                            {users.length === 0 && !loading && (
                                <div className="px-6 py-16 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F3F4F6] rounded-full mb-4">
                                        <HiOutlineExclamationCircle className="w-8 h-8 text-[#6B7280]" />
                                    </div>
                                    <p className="text-[#1F3A5F] mb-1">
                                        No users found
                                    </p>
                                    <p className="text-[#6B7280] text-sm">
                                        Click "Create New User" to add users to
                                        the system.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full bg-white border-t border-[#E5E7EB] px-8 py-4">
                <div className="flex justify-between items-center text-sm text-[#6B7280]">
                    <div>User Management System</div>
                    <div>Last Updated: {new Date().toLocaleDateString()}</div>
                </div>
            </footer>

            {/* Delete Confirmation Dialog */}
            {deleteConfirmUser && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded w-full max-w-md mx-4 shadow-lg">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
                            <h3 className="text-lg font-medium text-[#1F3A5F]">
                                Confirm Deletion
                            </h3>
                            <button
                                onClick={handleDeleteCancel}
                                className="text-[#6B7280] hover:text-[#1F3A5F] transition-colors"
                            >
                                <HiX size={20} />
                            </button>
                        </div>
                        <div className="px-6 py-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-[#FDE8E8] rounded-full flex items-center justify-center flex-shrink-0">
                                    <HiOutlineExclamationCircle className="w-5 h-5 text-[#9B1C1C]" />
                                </div>
                                <div>
                                    <p className="text-[#1F3A5F] mb-2">
                                        Are you sure you want to delete this
                                        user?
                                    </p>
                                    <p className="text-sm text-[#6B7280]">
                                        <span className="font-medium">
                                            {deleteConfirmUser.first_name_en}{' '}
                                            {deleteConfirmUser.last_name_en}
                                        </span>
                                        <br />
                                        {deleteConfirmUser.email}
                                    </p>
                                    <p className="text-xs text-[#9B1C1C] mt-3">
                                        This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
                            <button
                                onClick={handleDeleteCancel}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#1F3A5F] rounded text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-[#9B1C1C] hover:bg-[#7F1D1D] text-white rounded text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isDeleting && (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                )}
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* User Form Modal */}
            <UserFormModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                editingUser={editingUser}
                onSuccess={handleSuccess}
            />
        </div>
    )
}

export default UserList
