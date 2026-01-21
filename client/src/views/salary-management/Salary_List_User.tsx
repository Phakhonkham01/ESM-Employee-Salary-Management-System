'use client'

import type React from 'react'
import { useState, useEffect, useMemo } from 'react'
import {
    Search,
    Plus,
    AlertCircle,
    Calendar,
    Users,
    DollarSign,
    Briefcase,
    ChevronDown,
} from 'lucide-react'
import axios from 'axios'
import SalaryCalculator from './SalaryCalculator'

// Interface for users
interface User {
    _id: string
    first_name_en: string
    last_name_en: string
    email: string
    role: string
    status: string
    base_salary?: number
    department_id?: {
        _id: string
        department_name: string
    }
    position_id?: {
        _id: string
        position_name: string
    }
    vacation_days?: number
}

// Interface for existing salaries
interface ExistingSalary {
    _id: string
    month: number
    year: number
    status: string
    net_salary: number
}

const SalaryListUser: React.FC = () => {
    const [users, setUsers] = useState<User[]>([])
    const [filteredUsers, setFilteredUsers] = useState<User[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [filterDepartment, setFilterDepartment] = useState<string>('all')
    const [filterPosition, setFilterPosition] = useState<string>('all')
    const [filterStatus, setFilterStatus] = useState<string>('all')

    // State for Dialog
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [openCalculator, setOpenCalculator] = useState(false)
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
    const [existingSalaries, setExistingSalaries] = useState<ExistingSalary[]>(
        [],
    )
    const [selectedMonth, setSelectedMonth] = useState<number>(
        new Date().getMonth() + 1,
    )
    const [selectedYear, setSelectedYear] = useState<number>(
        new Date().getFullYear(),
    )

    const departments = useMemo(() => {
        const deptSet = new Set<string>()
        users.forEach((user) => {
            if (user.department_id?.department_name) {
                deptSet.add(user.department_id.department_name)
            }
        })
        return Array.from(deptSet).sort()
    }, [users])

    const positions = useMemo(() => {
        const posSet = new Set<string>()
        users.forEach((user) => {
            if (user.position_id?.position_name) {
                posSet.add(user.position_id.position_name)
            }
        })
        return Array.from(posSet).sort()
    }, [users])

    const statuses = useMemo(() => {
        const statusSet = new Set<string>()
        users.forEach((user) => {
            if (user.status) {
                statusSet.add(user.status)
            }
        })
        return Array.from(statusSet).sort()
    }, [users])

    // Fetch users
    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await axios.get('/api/users')
            if (response.data && response.data.users) {
                setUsers(response.data.users)
                setFilteredUsers(response.data.users)
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch users')
            console.error('Error fetching users:', err)
        } finally {
            setLoading(false)
        }
    }

    // Fetch existing salaries for selected user
    const fetchExistingSalaries = async (userId: string) => {
        try {
            const response = await axios.get(`/api/salaries?userId=${userId}`)
            if (response.data && response.data.salaries) {
                setExistingSalaries(response.data.salaries)
            }
        } catch (err) {
            console.error('Error fetching existing salaries:', err)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    useEffect(() => {
        let filtered = users

        // Search filter
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(
                (user) =>
                    `${user.first_name_en} ${user.last_name_en}`
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    user.email
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    user.role.toLowerCase().includes(searchTerm.toLowerCase()),
            )
        }

        // Department filter
        if (filterDepartment !== 'all') {
            filtered = filtered.filter(
                (user) =>
                    user.department_id?.department_name === filterDepartment,
            )
        }

        // Position filter
        if (filterPosition !== 'all') {
            filtered = filtered.filter(
                (user) => user.position_id?.position_name === filterPosition,
            )
        }

        // Status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter((user) => user.status === filterStatus)
        }

        setFilteredUsers(filtered)
    }, [searchTerm, users, filterDepartment, filterPosition, filterStatus])

    // Check if salary for selected month already exists
    const checkExistingSalary = (
        userId: string,
        month: number,
        year: number,
    ) => {
        return existingSalaries.some(
            (salary) => salary.month === month && salary.year === year,
        )
    }

    const handleOpenCalculator = (user: User) => {
        setSelectedUser(user)
        fetchExistingSalaries(user._id)
        setOpenConfirmDialog(true)
    }

    const handleConfirmCalculate = () => {
        setOpenConfirmDialog(false)
        setOpenCalculator(true)
    }

    const handleCloseCalculator = () => {
        setOpenCalculator(false)
        setSelectedUser(null)
        setExistingSalaries([])
    }

    const handleSuccessCalculation = () => {
        if (selectedUser) {
            fetchExistingSalaries(selectedUser._id)
        }
        fetchUsers()
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            case 'Inactive':
                return 'bg-red-50 text-red-700 border border-red-200'
            default:
                return 'bg-gray-50 text-gray-700 border border-gray-200'
        }
    }

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'Admin':
                return 'bg-red-50 text-red-700 border border-red-200'
            case 'Supervisor':
                return 'bg-amber-50 text-amber-700 border border-amber-200'
            case 'User':
                return 'bg-blue-50 text-blue-700 border border-blue-200'
            default:
                return 'bg-gray-50 text-gray-700 border border-gray-200'
        }
    }

    const formatCurrency = (amount: number | undefined) => {
        if (!amount) return '-'
        return amount.toLocaleString('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 2,
        })
    }

    const getMonthName = (month: number) => {
        const months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ]
        return months[month - 1] || ''
    }

    // Summary statistics
    const totalUsers = users.length
    const activeUsers = users.filter((u) => u.status === 'Active').length
    const totalBaseSalary = users.reduce(
        (sum, u) => sum + (u.base_salary || 0),
        0,
    )

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] flex justify-center items-center">
                <div className="text-[#6B7280]">Loading users...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            {/* Header */}

            <div className="p-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white border border-[#E5E7EB] rounded p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#1F3A5F]/10 rounded flex items-center justify-center">
                                <Users className="w-5 h-5 text-[#1F3A5F]" />
                            </div>
                            <div>
                                <p className="text-sm text-[#6B7280]">
                                    Total Employees
                                </p>
                                <p className="text-xl font-semibold text-[#1F3A5F]">
                                    {totalUsers}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#76FF70]/10 border border-[#76FF70]/30 rounded p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 rounded flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm text-[#6B7280]">
                                    Active Employees
                                </p>
                                <p className="text-xl font-semibold text-[#1F3A5F]">
                                    {activeUsers}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#52FFFF]/50 border border-[#52FFFF] rounded p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-[#6B7280]">
                                    Total Base Salary
                                </p>
                                <p className="text-xl font-semibold text-[#1F3A5F]">
                                    {formatCurrency(totalBaseSalary)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Alert */}

                {/* Search and Filter */}
                <div className="bg-white border border-[#E5E7EB] rounded mb-6">
                    <div className="p-4 border-b border-[#E5E7EB]">
                        <div className="flex flex-col gap-4">
                            {/* Search row */}
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or role..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="w-full pl-10 pr-4 py-2 text-sm border border-[#E5E7EB] rounded focus:outline-none focus:ring-1 focus:ring-[#1F3A5F] focus:border-[#1F3A5F]"
                                    />
                                </div>
                                {/* <span className="text-sm text-[#6B7280]">
                                    Showing {filteredUsers.length} of{' '}
                                    {totalUsers} employees
                                </span> */}
                                <div className="flex items-center gap-4 flex-wrap">
                                    <span className="text-sm font-medium text-[#6B7280]">
                                        Filter by:
                                               <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6 flex items-start gap-2 text-sm">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>
                      ເລືອກພະນັກງານເພື່ອຄິດໄລ່ເງິນເດືອນສຳລັບປັດຈຸບັນ
                     ({getMonthName(selectedMonth)} {selectedYear}).
                        ໃຫ້ຄລິກໃສ່ປຸ່ມ "ຄິດໄລ່ເງິນເດືອນ" ເພື່ອເລີ່ມຕົ້ນ.
                    </span>
                </div>
                                    </span>

                                    {/* Department Filter */}
                                    <div className="relative">
                                        <select
                                            value={filterDepartment}
                                            onChange={(e) =>
                                                setFilterDepartment(
                                                    e.target.value,
                                                )
                                            }
                                            className="appearance-none pl-3 pr-8 py-2 text-sm border border-[#E5E7EB] rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#1F3A5F] focus:border-[#1F3A5F] min-w-[160px]"
                                        >
                                            <option value="all">
                                                All Departments
                                            </option>
                                            {departments.map((dept) => (
                                                <option key={dept} value={dept}>
                                                    {dept}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
                                    </div>

                                    {/* Position Filter */}
                                    <div className="relative">
                                        <select
                                            value={filterPosition}
                                            onChange={(e) =>
                                                setFilterPosition(
                                                    e.target.value,
                                                )
                                            }
                                            className="appearance-none pl-3 pr-8 py-2 text-sm border border-[#E5E7EB] rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#1F3A5F] focus:border-[#1F3A5F] min-w-[160px]"
                                        >
                                            <option value="all">
                                                All Positions
                                            </option>
                                            {positions.map((pos) => (
                                                <option key={pos} value={pos}>
                                                    {pos}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
                                    </div>

                                    {/* Status Filter */}
                                    <div className="relative">
                                        <select
                                            value={filterStatus}
                                            onChange={(e) =>
                                                setFilterStatus(e.target.value)
                                            }
                                            className="appearance-none pl-3 pr-8 py-2 text-sm border border-[#E5E7EB] rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#1F3A5F] focus:border-[#1F3A5F] min-w-[140px]"
                                        >
                                            <option value="all">
                                                All Status
                                            </option>
                                            {statuses.map((status) => (
                                                <option
                                                    key={status}
                                                    value={status}
                                                >
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
                                    </div>

                                    {/* Clear Filters Button */}
                                    {(filterDepartment !== 'all' ||
                                        filterPosition !== 'all' ||
                                        filterStatus !== 'all') && (
                                        <button
                                            onClick={() => {
                                                setFilterDepartment('all')
                                                setFilterPosition('all')
                                                setFilterStatus('all')
                                            }}
                                            className="px-3 py-2 text-sm font-medium text-[#1F3A5F] border border-[#1F3A5F] rounded hover:bg-[#1F3A5F] hover:text-white transition-colors"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Filter row */}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                                    <th className="px-4 py-3 text-left font-medium text-[#6B7280]">
                                        No.
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-[#6B7280]">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-[#6B7280]">
                                        Email
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-[#6B7280]">
                                        Role
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-[#6B7280]">
                                        Department
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-[#6B7280]">
                                        Position
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium text-[#6B7280]">
                                        Base Salary
                                    </th>
                                    <th className="px-4 py-3 text-center font-medium text-[#6B7280]">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-center font-medium text-[#6B7280]">
                                        Vacation
                                    </th>
                                    <th className="px-4 py-3 text-center font-medium text-[#6B7280]">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={10}
                                            className="px-4 py-8 text-center text-[#6B7280]"
                                        >
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user, index) => (
                                        <tr
                                            key={user._id}
                                            className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                                        >
                                            <td className="px-4 py-3 text-[#6B7280]">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-[#1F2937]">
                                                {user.first_name_en}{' '}
                                                {user.last_name_en}
                                            </td>
                                            <td className="px-4 py-3 text-[#6B7280]">
                                                {user.email}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`px-2 py-0.5 text-xs font-medium rounded ${getRoleBadge(user.role)}`}
                                                >
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-[#6B7280]">
                                                {user.department_id
                                                    ?.department_name || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-[#6B7280]">
                                                {user.position_id
                                                    ?.position_name || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-[#1F2937]">
                                                {formatCurrency(
                                                    user.base_salary,
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span
                                                    className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusBadge(user.status)}`}
                                                >
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-50 text-gray-700 border border-gray-200">
                                                    {user.vacation_days || 0}{' '}
                                                    days
                                                </span>
                                            </td>
                              <td className="px-4 py-3 text-center">
  <button
    onClick={() => handleOpenCalculator(user)}
    disabled={user.status !== 'Active'}
    className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
      user.status === 'Active'
        ? 'bg-[#45CC67] text-white hover:bg-[#3DB75B]'
        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
    }`}
  >
    <Plus className="w-3.5 h-3.5" />
    Calculate
  </button>
</td>

                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {openConfirmDialog && (
                <div className="min-h-[600px] min-w-[600px] ">
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-10 border border-gray-300 rounded-md">
                            {/* Dialog Header */}
                            <div className="bg-[#FFFFFF] px-6 py-4 border-b border-[#FFFFFF]">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-medium text-dark ">
                                            Confirm Salary Calculation
                                        </h2>
                                        <p className="text-gray-300 text-xs mt-0.5">
                                            Review details before proceeding
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Dialog Body */}
                            <div className="p-6">
                                {/* Employee Summary Card */}
                                <div className="mb-6 p-4 bg-gray-50 border border-gray-300 rounded-sm">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-sm flex items-center justify-center">
                                                <span className="text-gray-700 text-sm font-medium">
                                                    ID
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm text-gray-600">
                                                    Employee
                                                </div>
                                                <div className="font-medium text-gray-900">
                                                    {
                                                        selectedUser?.first_name_en
                                                    }{' '}
                                                    {selectedUser?.last_name_en}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-xs text-gray-500 mb-0.5">
                                                    Email
                                                </div>
                                                <div className="text-sm text-gray-900 truncate">
                                                    {selectedUser?.email}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 mb-0.5">
                                                    Base Salary
                                                </div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(
                                                        selectedUser?.base_salary,
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Period Selection */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                                        Select Processing Period
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-normal text-gray-700 mb-1.5">
                                                Month
                                            </label>
                                            <select
                                                value={selectedMonth}
                                                onChange={(e) =>
                                                    setSelectedMonth(
                                                        parseInt(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
                                            >
                                                {Array.from(
                                                    { length: 12 },
                                                    (_, i) => i + 1,
                                                ).map((month) => (
                                                    <option
                                                        key={month}
                                                        value={month}
                                                    >
                                                        {getMonthName(month)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-normal text-gray-700 mb-1.5">
                                                Year
                                            </label>
                                            <input
                                                type="number"
                                                value={selectedYear}
                                                onChange={(e) =>
                                                    setSelectedYear(
                                                        parseInt(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Existing Salaries Warning */}
                                {selectedUser &&
                                    checkExistingSalary(
                                        selectedUser._id,
                                        selectedMonth,
                                        selectedYear,
                                    ) && (
                                        <div className="mb-6 p-3 bg-[#FEF3C7] border border-[#B45309] text-[#B45309] text-sm rounded-sm">
                                            <div className="flex items-start gap-2">
                                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <div className="font-medium mb-0.5">
                                                        ຄຳເຕືອນກ່ຽວກັບບັນທຶກຊໍ້າກັນ
                                                    </div>
                                                    <div>
                                                        ບັນທຶກເງິນເດືອນສຳລັບ{' '}
                                                        {getMonthName(
                                                            selectedMonth,
                                                        )}{' '}
                                                        {selectedYear}
                                                 ມີຢູ່ແລ້ວ. ດຳເນີນການສ້າງການຄິດໄລ່ໃໝ່.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                {/* Existing Salaries Preview */}
                                {existingSalaries.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-sm font-medium text-gray-900 mb-2">
                                            Existing Salary Records
                                        </h3>
                                        <div className="space-y-2">
                                            {existingSalaries
                                                .slice(0, 3)
                                                .map((salary) => (
                                                    <div
                                                        key={salary._id}
                                                        className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-sm"
                                                    >
                                                        <div className="text-sm text-gray-700">
                                                            {getMonthName(
                                                                salary.month,
                                                            )}{' '}
                                                            {salary.year}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-gray-900">
                                                                ฿
                                                                {salary.net_salary.toLocaleString()}
                                                            </span>
                                                            <span
                                                                className={`px-2 py-0.5 text-xs rounded-sm ${salary.status === 'paid' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}
                                                            >
                                                                {salary.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            {existingSalaries.length > 3 && (
                                                <div className="text-xs text-gray-500 text-center mt-1">
                                                    +{' '}
                                                    {existingSalaries.length -
                                                        3}{' '}
                                                    more records
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Dialog Footer */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-300 flex justify-end gap-3">
                                <button
                                    onClick={() => setOpenConfirmDialog(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors rounded-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmCalculate}
                                    className="px-4 py-2 text-sm font-medium text-white bg-[#45CC67] hover:bg-[#3aa85a] transition-colors rounded-sm flex items-center gap-1.5"
                                >
                                    Proceed to Calculation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Salary Calculator Dialog */}
            {selectedUser && (
                <SalaryCalculator
                    open={openCalculator}
                    onClose={handleCloseCalculator}
                    onSuccess={handleSuccessCalculation}
                    user={selectedUser}
                    month={selectedMonth}
                    year={selectedYear}
                />
            )}
        </div>
    )
}

export default SalaryListUser
