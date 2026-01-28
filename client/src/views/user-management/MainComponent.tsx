import React, { useState } from 'react'
import UserList from './UserList'
import UserFormModal from './UserFormModal'
import type { UserData } from '../../services/Create_user/api'
import {
    HiUserAdd,
    HiOutlineOfficeBuilding,
    HiOutlineUserGroup,
} from 'react-icons/hi'

const MainComponent: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<UserData | null>(null)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

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
    }

    return (
        <div className="min-h-screen bg-[#FFFFFF] font-sans">
            {/* Top Navigation Bar */}
            {/* <div className="bg-white border-b border-gray-300 px-6 py-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <HiOutlineOfficeBuilding className="w-6 h-6 text-[#1F3A5F]" />
                        <div>
                            <h1 className="text-lg font-medium text-gray-900">
                                Human Resources Management System
                            </h1>
                            <p className="text-xs text-gray-600 mt-0.5">
                                User Administration Module
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-600">
                            System ID: HRMS-2024
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                            Version: 2.4.1
                        </p>
                    </div>
                </div>
            </div> */}

            {/* Main Content Area */}
            <div className="">
                {/* Left Sidebar Navigation */}
                {/* <div className="w-64 bg-white border-r border-gray-300 min-h-[calc(100vh-64px)]">
                    <div className="p-5 border-b border-gray-300">
                        <div className="flex items-center gap-2 text-[#1F3A5F]">
                            <HiOutlineUserGroup className="w-5 h-5" />
                            <span className="font-medium text-sm">
                                User Management
                            </span>
                        </div>
                    </div>

                    <nav className="p-3">
                        <ul className="space-y-1">
                            <li>
                                <button
                                    onClick={handleCreateUser}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm bg-[#1F3A5F] text-white hover:bg-[#152642] transition-colors rounded-sm"
                                >
                                    <HiUserAdd className="w-4 h-4" />
                                    Register New User
                                </button>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors rounded-sm"
                                >
                                    <span className="w-4 h-4 flex items-center justify-center">
                                        📋
                                    </span>
                                    Active Users
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors rounded-sm"
                                >
                                    <span className="w-4 h-4 flex items-center justify-center">
                                        📊
                                    </span>
                                    User Reports
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors rounded-sm"
                                >
                                    <span className="w-4 h-4 flex items-center justify-center">
                                        ⚙️
                                    </span>
                                    System Settings
                                </a>
                            </li>
                        </ul>
                    </nav>

                    <div className="mt-auto p-5 border-t border-gray-300">
                        <div className="text-xs text-gray-500">
                            <p className="mb-2">
                                Last Updated:{' '}
                                {new Date().toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                            <p>© 2024 Company HR System</p>
                        </div>
                    </div>
                </div> */}

                {/* Main Content */}
                <div className="">
                    {/* User List Component */}
                    <div className="bg-[#ffffff] border border-none rounded-sm">
                        <UserList
                            onEdit={handleEditUser}
                            key={refreshTrigger}
                        />
                    </div>

                    {/* Footer Note */}
                </div>
            </div>

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

export default MainComponent
