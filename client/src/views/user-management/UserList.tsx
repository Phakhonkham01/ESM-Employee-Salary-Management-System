'use client'

import type React from 'react'
import { useState, useEffect, useMemo } from 'react'
import { getAllUsers, deleteUser } from '../../services/Create_user/api'
import type { UserData } from '../../services/Create_user/api'
import {
    HiPencil,
    HiTrash,
    HiUserAdd,
    HiOutlineExclamationCircle,
    HiX,
    HiFilter,
    HiSearch,
    HiRefresh
} from 'react-icons/hi'
import UserFormModal from './UserFormModal'
import Swal from 'sweetalert2'

interface UserListProps {
    onEdit: (user: UserData) => void
}

const UserList: React.FC<UserListProps> = ({ onEdit }) => {
    const [users, setUsers] = useState<UserData[]>([])
    const [loading, setLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<UserData | null>(null)
    const [refreshTrigger, setRefreshTrigger] = useState(0)
  

    // --- Filter States ---
    const [filterPosition, setFilterPosition] = useState('')
    const [filterDepartment, setFilterDepartment] = useState('')
    const [filterRole, setFilterRole] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [filterGender, setFilterGender] = useState('')

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

    // --- Filter Logic ---
    const [searchTerm, setSearchTerm] = useState('')
    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const searchLower = searchTerm.toLowerCase()
            const matchesSearch = !searchTerm || 
                user.first_name_en?.toLowerCase().includes(searchLower) ||
                user.last_name_en?.toLowerCase().includes(searchLower) ||
                user.first_name_la?.includes(searchTerm) ||
                user.last_name_la?.includes(searchTerm) ||
                user.nickname_en?.toLowerCase().includes(searchLower)
            const matchPosition = !filterPosition || user.position_id?.position_name === filterPosition
            const matchDepartment = !filterDepartment || user.department_id?.department_name === filterDepartment
            const matchRole = !filterRole || user.role === filterRole
            const matchStatus = !filterStatus || user.status === filterStatus
            const matchGender = !filterGender || user.gender === filterGender
            return matchPosition && matchesSearch && matchDepartment && matchRole && matchStatus && matchGender
        })
    }, [users, searchTerm, filterPosition, filterDepartment, filterRole, filterStatus, filterGender])

    // Get unique options for dropdowns dynamically from data
    const positions = Array.from(new Set(users.map(u => u.position_id?.position_name).filter(Boolean)))
    const departments = Array.from(new Set(users.map(u => u.department_id?.department_name).filter(Boolean)))

    const resetFilters = () => {
        setSearchTerm('')
        setFilterPosition('')
        setFilterDepartment('')
        setFilterRole('')
        setFilterStatus('')
        setFilterGender('')
    }

    // ... (Keep existing handle functions: handleCreateUser, handleEditUser, etc.)
    const handleCreateUser = () => { setEditingUser(null); setIsModalOpen(true); }
    const handleEditUser = (user: UserData) => { setEditingUser(user); setIsModalOpen(true); }
    const handleModalClose = () => { setIsModalOpen(false); setEditingUser(null); }
    const handleSuccess = () => { setRefreshTrigger((prev) => prev + 1); setIsModalOpen(false); setEditingUser(null); }
    const handleDeleteClick = async (user: UserData) => {
    const result = await Swal.fire({
        title: 'Confirm Deletion',
        html: `You are about to delete <b>${user.first_name_en}</b>.<br/>This action is permanent.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#9B1C1C',
        cancelButtonColor: '#E5E7EB',
        reverseButtons: true,
    })

    if (result.isConfirmed) {
        try {
            await deleteUser(user._id)

            Swal.fire({
                title: 'Deleted!',
                text: 'User has been deleted successfully.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
            })

            setRefreshTrigger((prev) => prev + 1)
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Failed to delete user.',
                icon: 'error',
            })
        }
    }
}


    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case 'Admin': return 'bg-[#1F3A5F] text-white border-[#1F3A5F]'
            case 'Supervisor': return 'bg-[#F52727] text-white border-[#F52727]'
            default: return 'bg-[#27F2F5] text-[#080808] border-[#27F2F5]'
        }
    }

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-[#76FF70] text-[#2E7D32] border-[#C8E6C9]'
            case 'Inactive': return 'bg-[#FDE8E8] text-[#9B1C1C] border-[#FECACA]'
            case 'On Leave': return 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
            default: return 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]'
        }
    }

    const getStatusDotClass = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-[#2E7D32]'
            case 'Inactive': return 'bg-[#9B1C1C]'
            case 'On Leave': return 'bg-[#B45309]'
            default: return 'bg-[#6B7280]'
        }
    }

    return (
        <div className="min-h-screen w-full bg-[#F9FAFB] flex flex-col font-sans">
            <main className="flex-1 p-8">
                {/* Title & Create Button */}
          

                {/* Filter Bar */}
            <div className="bg-white border border-[#E5E7EB] rounded p-4 mb-6 shadow-sm">
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2 text-[#1F3A5F] font-medium">
      <HiFilter />
      <span>Filter Users</span>
    </div>

    <button
      onClick={handleCreateUser}
      className="px-5 py-2.5 bg-[#27F584] hover:bg-[#1fd371] text-[#1F3A5F] rounded text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
    >
      <HiUserAdd size={18} />
      Create New User
    </button>
  </div>
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                              <div className="md:col-span-2 relative">
                            <label className="block text-xs font-bold text-[#6B7280] mb-1 uppercase">Search Name</label>
                            <div className="relative">
                                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="text"
                                    placeholder="Search by name or nickname..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded text-sm focus:ring-2 focus:ring-[#1F3A5F] focus:outline-none transition-all"
                                />
                            </div>
                        </div>
                        {/* Role Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase">Role</label>
                            <select 
                                value={filterRole} 
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="w-full border border-[#E5E7EB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1F3A5F]"
                            >
                                <option value="">All Roles</option>
                                <option value="Admin">Admin</option>
                                <option value="Supervisor">Supervisor</option>
                                <option value="User">User</option>
                            </select>
                        </div>
                        {/* Department Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase">Department</label>
                            <select 
                                value={filterDepartment} 
                                onChange={(e) => setFilterDepartment(e.target.value)}
                                className="w-full border border-[#E5E7EB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1F3A5F]"
                            >
                                <option value="">All Departments</option>
                                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                            </select>
                        </div>
                        {/* Position Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase">Position</label>
                            <select 
                                value={filterPosition} 
                                onChange={(e) => setFilterPosition(e.target.value)}
                                className="w-full border border-[#E5E7EB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1F3A5F]"
                            >
                                <option value="">All Positions</option>
                                {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                            </select>
                        </div>
                        {/* Status Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase">Status</label>
                            <select 
                                value={filterStatus} 
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full border border-[#E5E7EB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1F3A5F]"
                            >
                                <option value="">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="On Leave">On Leave</option>
                            </select>
                        </div>
                        {/* Gender Filter */}
                        <div className="flex items-end gap-2">
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase">Gender</label>
                                <select 
                                    value={filterGender} 
                                    onChange={(e) => setFilterGender(e.target.value)}
                                    className="w-full border border-[#E5E7EB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1F3A5F]"
                                >
                                    <option value="">All Genders</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <button 
                                onClick={resetFilters}
                                className="p-2 text-[#6B7280] hover:text-[#1F3A5F] hover:bg-gray-100 rounded transition-colors"
                                title="Reset Filters"
                            >
                                <HiRefresh size={20} />
                            </button>
                        </div>
                    </div>
                          <div className="flex items-center justify-between">
                    <div>
                        
                        {/* <p className="text-sm text-[#6B7280] mt-1">Showing {filteredUsers.length} of {users.length} users</p> */}
                    </div>
               
                </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-white border border-[#E5E7EB] rounded p-4 shadow-sm">
                        <div className="text-sm text-[#6B7280] mb-1 text-xs font-bold uppercase">Filtered Result</div>
                        <div className="text-2xl font-semibold text-[#1F3A5F]">{filteredUsers.length}</div>
                    </div>
                    <div className="bg-[#76FF70]/10 border border-[#76FF70]/30 rounded p-4 shadow-sm">
                        <div className="text-sm text-[#2E7D32] mb-1 text-xs font-bold uppercase">Active</div>
                        <div className="text-2xl font-semibold text-[#2E7D32]">{filteredUsers.filter(u => u.status === 'Active').length}</div>
                    </div>
                    <div className="bg-[#FEF3C7]/50 border border-[#FDE68A] rounded p-4 shadow-sm">
                        <div className="text-sm text-[#B45309] mb-1 text-xs font-bold uppercase">On Leave</div>
                        <div className="text-2xl font-semibold text-[#B45309]">{filteredUsers.filter(u => u.status === 'On Leave').length}</div>
                    </div>
                    <div className="bg-[#FDE8E8] border border-[#FECACA] rounded p-4 shadow-sm">
                        <div className="text-sm text-[#9B1C1C] mb-1 text-xs font-bold uppercase">Inactive</div>
                        <div className="text-2xl font-semibold text-[#9B1C1C]">{filteredUsers.filter(u => u.status === 'Inactive').length}</div>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white border border-[#E5E7EB] rounded shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="px-6 py-16 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#E5E7EB] border-t-[#1F3A5F] mb-4"></div>
                            <p className="text-[#6B7280] text-sm">Loading user data...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">Name (EN)</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">Email</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">Role</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">Position</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">Department</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E7EB]">
                                    {filteredUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-[#F9FAFB] transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-medium text-[#1F3A5F]">{user.first_name_en} {user.last_name_en}</div>
                                                <div className="text-xs text-[#6B7280]">{user.nickname_en} • {user.gender}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[#1F3A5F]">{user.email}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold border ${getRoleBadgeClass(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[#1F3A5F]">{user.position_id?.position_name || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-[#1F3A5F]">{user.department_id?.department_name || '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold border ${getStatusBadgeClass(user.status)}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusDotClass(user.status)}`}></span>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => handleEditUser(user)} className="p-2 hover:bg-[#1F3A5F]/10 text-[#1F3A5F] rounded transition-colors" title="Edit">
                                                        <HiPencil size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteClick(user)} className="p-2 hover:bg-[#9B1C1C]/10 text-[#9B1C1C] rounded transition-colors" title="Delete">
                                                        <HiTrash size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredUsers.length === 0 && (
                                <div className="px-6 py-16 text-center">
                                    <HiOutlineExclamationCircle className="w-12 h-12 text-[#6B7280] mx-auto mb-4" />
                                    <p className="text-[#1F3A5F] font-medium">No users match your filters</p>
                                    <button onClick={resetFilters} className="text-[#1F3A5F] text-sm underline mt-2">Clear all filters</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Modals remain the same... */}
       

            <UserFormModal isOpen={isModalOpen} onClose={handleModalClose} editingUser={editingUser} onSuccess={handleSuccess} />
        </div>
    )
}

export default UserList