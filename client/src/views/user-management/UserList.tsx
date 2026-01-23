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
    HiSearch,
    HiRefresh,
    HiFilter,
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
    const [filterPosition, setFilterPosition] = useState('')
    const [filterDepartment, setFilterDepartment] = useState('')
    const [filterRole, setFilterRole] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [filterGender, setFilterGender] = useState('')
    const [searchTerm, setSearchTerm] = useState('')

    // 1. เพิ่ม State และ Constants สำหรับ Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 8 // กำหนดให้แสดงหน้าละ 8 คน

    // ทุกครั้งที่ Filter เปลี่ยนหน้า ต้องกลับไปเริ่มหน้า 1 ใหม่
    useEffect(() => {
        setCurrentPage(1)
    }, [
        searchTerm,
        filterPosition,
        filterDepartment,
        filterRole,
        filterStatus,
        filterGender,
    ])

    useEffect(() => {
        fetchUsers()
    }, [refreshTrigger])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await getAllUsers()
            console.log('Raw Users Data:', response.users)
            setUsers(response.users)
        } catch (error: any) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    const getDepartmentDisplay = (user: UserData): string => {
        const depts = user.department_id

        if (!depts) return '-'

        // กรณีเป็น Array (เช่น [ {name: 'IT'}, {name: 'HR'} ])
        if (Array.isArray(depts)) {
            const names = depts
                .map((d: any) => {
                    if (typeof d === 'object' && d !== null) {
                        return d.department_name || d._id
                    }
                    return d // กรณีเป็น string ID
                })
                .filter(Boolean)

            return names.length > 0 ? names.join(', ') : '-'
        }

        // กรณีเป็น Object เดียว
        if (typeof depts === 'object' && 'department_name' in depts) {
            return (depts as any).department_name
        }

        // กรณีเป็น String เดียว
        return String(depts) || '-'
    }

    // ✅ Helper function to check if user matches department filter
    const matchesDepartmentFilter = (
        user: UserData,
        filterDept: string,
    ): boolean => {
        if (!filterDept) return true
        if (!user.department_id) return false

        if (Array.isArray(user.department_id)) {
            return user.department_id.some((dept) => {
                const deptName =
                    typeof dept === 'string' ? dept : dept.department_name
                return deptName === filterDept
            })
        }

        if (
            typeof user.department_id === 'object' &&
            'department_name' in user.department_id
        ) {
            return user.department_id.department_name === filterDept
        }

        return false
    }

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const searchLower = searchTerm.toLowerCase()
            const matchesSearch =
                !searchTerm ||
                user.first_name_en?.toLowerCase().includes(searchLower) ||
                user.last_name_en?.toLowerCase().includes(searchLower) ||
                user.first_name_la?.includes(searchTerm) ||
                user.last_name_la?.includes(searchTerm) ||
                user.nickname_en?.toLowerCase().includes(searchLower)

            const matchPosition =
                !filterPosition ||
                (typeof user.position_id === 'object' &&
                    user.position_id?.position_name === filterPosition)

            const matchDepartment = matchesDepartmentFilter(
                user,
                filterDepartment,
            )
            const matchRole = !filterRole || user.role === filterRole
            const matchStatus = !filterStatus || user.status === filterStatus
            const matchGender = !filterGender || user.gender === filterGender

            return (
                matchPosition &&
                matchesSearch &&
                matchDepartment &&
                matchRole &&
                matchStatus &&
                matchGender
            )
        })
    }, [
        users,
        searchTerm,
        filterPosition,
        filterDepartment,
        filterRole,
        filterStatus,
        filterGender,
    ])

    // 2. คำนวณข้อมูลที่จะแสดงในแต่ละหน้า
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    // ตัดข้อมูลมาแค่ 8 รายการของหน้านั้นๆ
    const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)

    // คำนวณจำนวนหน้าทั้งหมด
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

    // ✅ Get unique departments from all users (including arrays)
    const departments = useMemo(() => {
        const deptSet = new Set<string>()

        users.forEach((user) => {
            if (!user.department_id) return

            if (Array.isArray(user.department_id)) {
                user.department_id.forEach((dept) => {
                    const deptName =
                        typeof dept === 'string' ? dept : dept.department_name
                    if (deptName) deptSet.add(deptName)
                })
            } else if (
                typeof user.department_id === 'object' &&
                'department_name' in user.department_id
            ) {
                if (user.department_id.department_name) {
                    deptSet.add(user.department_id.department_name)
                }
            }
        })

        return Array.from(deptSet).sort()
    }, [users])

    const positions = useMemo(() => {
        return Array.from(
            new Set(
                users
                    .map((u) =>
                        typeof u.position_id === 'object'
                            ? u.position_id?.position_name
                            : null,
                    )
                    .filter(Boolean) as string[],
            ),
        ).sort()
    }, [users])

    const resetFilters = () => {
        setSearchTerm('')
        setFilterPosition('')
        setFilterDepartment('')
        setFilterRole('')
        setFilterStatus('')
        setFilterGender('')
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
            case 'Admin':
                return 'bg-[#FBFFC4] text-[#677300] border-none'
            case 'Supervisor':
                return 'bg-[#FFC4C4] text-[#240000] border-none'
            default:
                return 'bg-[#C4FFFF] text-[#002424] border-none'
        }
    }

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-[#B8FFB8] text-[#009E00] border-none'
            case 'Inactive':
                return 'bg-[#FDE8E8] text-[#9B1C1C] border-none'
            case 'On Leave':
                return 'bg-[#FEF3C7] text-[#B45309] border-none'
            default:
                return 'bg-[#F3F4F6] text-[#6B7280] border-none'
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
        <div className="min-h-screen w-full bg-[#ffffff] flex flex-col font-sans">
            <main className="flex-1 p-2">
                <div className="bg-white border border-none rounded p-4 mb-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-[#1F3A5F] font-semibold">
                            <HiFilter />
                            <span>Filter Users</span>
                        </div>
                        <button
                            onClick={handleCreateUser}
                            className="px-5 py-2.5 h-[50px] bg-[#45CC67] hover:bg-[#1fd371] text-[#FFFFFF] rounded text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <HiUserAdd size={18} />
                            Create New User
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                        <div className="md:col-span-2 relative">
                            <label className="block text-xs font-bold text-[#6B7280] mb-1 uppercase">
                                Search Name
                            </label>
                            <div className="relative">
                                <HiSearch
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={18}
                                />
                                <input
                                    type="text"
                                    placeholder="Search by name or nickname..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full h-[50px] pl-10 px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#4b5675] mb-1 uppercase">
                                Role
                            </label>
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="w-full h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm font-semibold"
                            >
                                <option value="">All Roles</option>
                                <option value="Admin">Admin</option>
                                <option value="Supervisor">Supervisor</option>
                                <option value="Employee">Employee</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase">
                                Department
                            </label>
                            <select
                                value={filterDepartment}
                                onChange={(e) =>
                                    setFilterDepartment(e.target.value)
                                }
                                className="w-full h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm font-semibold"
                            >
                                <option value="">All Departments</option>
                                {departments.map((dept) => (
                                    <option key={dept} value={dept}>
                                        {dept}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase">
                                Position
                            </label>
                            <select
                                value={filterPosition}
                                onChange={(e) =>
                                    setFilterPosition(e.target.value)
                                }
                                className="w-full h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm font-semibold"
                            >
                                <option value="">All Positions</option>
                                {positions.map((pos) => (
                                    <option key={pos} value={pos}>
                                        {pos}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase">
                                Status
                            </label>
                            <select
                                value={filterStatus}
                                onChange={(e) =>
                                    setFilterStatus(e.target.value)
                                }
                                className="w-full h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm font-semibold"
                            >
                                <option value="">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="On Leave">On Leave</option>
                            </select>
                        </div>

                        <div className="flex items-end gap-2">
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase">
                                    Gender
                                </label>
                                <select
                                    value={filterGender}
                                    onChange={(e) =>
                                        setFilterGender(e.target.value)
                                    }
                                    className="w-full h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm font-semibold"
                                >
                                    <option value="">All Genders</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <button
                                onClick={resetFilters}
                                className="w-[45px] h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm"
                                title="Reset Filters"
                            >
                                <HiRefresh size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-white border border-none rounded p-4 shadow-sm">
                        <div className="text-sm text-[#6B7280] mb-1 text-xs font-bold uppercase">
                            Filtered Result
                        </div>
                        <div className="text-2xl font-semibold text-[#1F3A5F]">
                            {filteredUsers.length}
                        </div>
                    </div>
                    <div className="bg-[#76FF70]/10 border border-none rounded p-4 shadow-sm">
                        <div className="text-sm text-[#2E7D32] mb-1 text-xs font-bold uppercase">
                            Active
                        </div>
                        <div className="text-2xl font-semibold text-[#2E7D32]">
                            {
                                filteredUsers.filter(
                                    (u) => u.status === 'Active',
                                ).length
                            }
                        </div>
                    </div>
                    <div className="bg-[#FEF3C7]/50 border border-none rounded p-4 shadow-sm">
                        <div className="text-sm text-[#B45309] mb-1 text-xs font-bold uppercase">
                            On Leave
                        </div>
                        <div className="text-2xl font-semibold text-[#B45309]">
                            {
                                filteredUsers.filter(
                                    (u) => u.status === 'On Leave',
                                ).length
                            }
                        </div>
                    </div>
                    <div className="bg-[#FDE8E8] border border-none rounded p-4 shadow-sm">
                        <div className="text-sm text-[#9B1C1C] mb-1 text-xs font-bold uppercase">
                            Inactive
                        </div>
                        <div className="text-2xl font-semibold text-[#9B1C1C]">
                            {
                                filteredUsers.filter(
                                    (u) => u.status === 'Inactive',
                                ).length
                            }
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="px-6 py-16 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#E5E7EB] border-t-[#1F3A5F] mb-4"></div>
                            <p className="text-[#6B7280] text-sm">
                                Loading user data...
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-[#ffffff] border-b border-[#E5E7EB]">
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#6B7280] uppercase">
                                            Name (EN)
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#6B7280] uppercase">
                                            Email
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#6B7280] uppercase">
                                            Role
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#6B7280] uppercase">
                                            Position
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#6B7280] uppercase">
                                            Department
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#6B7280] uppercase">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#6B7280] uppercase text-center">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E7EB]">
                                    {/* 3. แก้ไขส่วนการแสดงผลในตาราง */}
                                    {currentItems.map((user) => (
                                        <tr
                                            key={user._id}
                                            className="hover:bg-[#ffffff] transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-medium text-[#1F3A5F]">
                                                    {user.first_name_en}{' '}
                                                    {user.last_name_en}
                                                </div>
                                                <div className="text-xs text-[#6B7280]">
                                                    {user.nickname_en} •{' '}
                                                    {user.gender}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[#1F3A5F]">
                                                {user.email}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold border ${getRoleBadgeClass(user.role)}`}
                                                >
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[#1F3A5F]">
                                                {typeof user.position_id ===
                                                'object'
                                                    ? user.position_id
                                                          ?.position_name || '-'
                                                    : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[#1F3A5F]">
                                                {getDepartmentDisplay(user)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold border ${getStatusBadgeClass(user.status)}`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusDotClass(user.status)}`}
                                                    ></span>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-center gap-3">
                                                    {/* ปุ่ม Edit */}
                                                    <button
                                                        onClick={() =>
                                                            handleEditUser(user)
                                                        }
                                                        className="flex items-center justify-center w-9 h-9 border border-none bg-blue-50 text-[#1F3A5F] rounded-lg shadow-sm hover:bg-blue-100 hover:border-blue-300 transition-all active:scale-95"
                                                        title="Edit"
                                                    >
                                                        <HiPencil size={18} />
                                                    </button>

                                                    {/* ปุ่ม Delete */}
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteClick(
                                                                user,
                                                            )
                                                        }
                                                        className="flex items-center justify-center w-9 h-9 border border-none bg-red-50 text-[#9B1C1C] rounded-lg shadow-sm hover:bg-red-100 hover:border-red-300 transition-all active:scale-95"
                                                        title="Delete"
                                                    >
                                                        <HiTrash size={18} />
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
                                    <p className="text-[#1F3A5F] font-medium">
                                        No users match your filters
                                    </p>
                                    <button
                                        onClick={resetFilters}
                                        className="text-[#1F3A5F] text-sm underline mt-2"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 4. เพิ่ม UI ส่วน Pagination */}
                    {filteredUsers.length > 0 && (
                        <div className="flex items-center justify-between px-4 py-4 bg-white border-t border-gray-100">
                            <div className="text-sm text-gray-500 font-medium">
                                Showing{' '}
                                <span className="text-[#1F3A5F] font-bold">
                                    {Math.min(
                                        indexOfFirstItem + 1,
                                        filteredUsers.length,
                                    )}
                                </span>{' '}
                                to{' '}
                                <span className="text-[#1F3A5F] font-bold">
                                    {Math.min(
                                        indexOfLastItem,
                                        filteredUsers.length,
                                    )}
                                </span>{' '}
                                of{' '}
                                <span className="text-[#1F3A5F] font-bold">
                                    {filteredUsers.length}
                                </span>{' '}
                                Users
                            </div>

                            <div className="flex items-center gap-2">
                                {/* ปุ่ม ย้อนกลับ */}
                                <button
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.max(prev - 1, 1),
                                        )
                                    }
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 disabled:opacity-40 transition-colors"
                                >
                                    Previous
                                </button>

                                {/* แสดงเลขหน้า (แบบย่อถ้าหน้าเยอะ) */}
                                <div className="flex gap-1">
                                    {[...Array(totalPages)].map((_, index) => {
                                        const pageNum = index + 1
                                        // แสดงเลขหน้าปัจจุบันรอบๆ 2 หน้า (Optional logic)
                                        if (
                                            totalPages > 5 &&
                                            (pageNum < currentPage - 1 ||
                                                pageNum > currentPage + 1) &&
                                            pageNum !== 1 &&
                                            pageNum !== totalPages
                                        ) {
                                            if (
                                                pageNum === currentPage - 2 ||
                                                pageNum === currentPage + 2
                                            )
                                                return (
                                                    <span key={pageNum}>
                                                        ...
                                                    </span>
                                                )
                                            return null
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() =>
                                                    setCurrentPage(pageNum)
                                                }
                                                className={`w-9 h-9 rounded text-sm font-bold transition-all ${
                                                    currentPage === pageNum
                                                        ? 'bg-[#45cc67] text-white shadow-md'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        )
                                    })}
                                </div>

                                {/* ปุ่ม ถัดไป */}
                                <button
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.min(prev + 1, totalPages),
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 border border-[#45cc67] rounded text-sm font-medium hover:bg-[#45cc67] disabled:opacity-40 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

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
