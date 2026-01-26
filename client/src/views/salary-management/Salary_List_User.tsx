'use client'

import type React from 'react'
import { useState, useEffect, useMemo } from 'react'
import {
    Search,
    AlertCircle,
    Users,
    DollarSign,
    Briefcase,
} from 'lucide-react'
import axios from 'axios'
import SalaryCalculator from './SalaryCalculator'

// Interface for users - ปรับให้รองรับทั้ง Array และ Object
interface User {
    _id: string
    first_name_en: string
    last_name_en: string
    email: string
    role: string
    status: string
    base_salary?: number
    // รองรับทั้ง Array ของ Object และ Object เดียว
    department_id?: Array<{
        _id: string
        department_name?: string
        name?: string
    }> | {
        _id: string
        department_name?: string
        name?: string
    }
    position_id?: {
        _id: string
        position_name?: string
        name?: string
    }
    vacation_days?: number
    created_at?: string
    date_of_birth?: string
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
    const [existingSalaries, setExistingSalaries] = useState<ExistingSalary[]>([])
    const [selectedMonth, setSelectedMonth] = useState<number>(
        new Date().getMonth() + 1,
    )
    const [selectedYear, setSelectedYear] = useState<number>(
        new Date().getFullYear(),
    )

    // ฟังก์ชัน helper เพื่อดึงชื่อ department - แก้ไขให้รองรับทุกกรณี
    const getDepartmentName = (user: User): string => {
        if (!user.department_id) {
            return '-'
        }
        
        // ตรวจสอบว่าเป็น Array หรือ Object
        if (Array.isArray(user.department_id)) {
            // เป็น Array
            if (user.department_id.length === 0) {
                return '-'
            }
            
            const department = user.department_id[0]
            // ตรวจสอบว่า department เป็น object ที่มีข้อมูลไหม
            if (!department || typeof department !== 'object') {
                return '-'
            }
            
            // ดึงชื่อจาก field ที่เป็นไปได้
            if (department.department_name) {
                return department.department_name
            }
            if (department.name) {
                return department.name
            }
            return '-'
        } else {
            // เป็น Object เดียว
            const department = user.department_id
            if (department.department_name) {
                return department.department_name
            }
            if (department.name) {
                return department.name
            }
            return '-'
        }
    }

    // ฟังก์ชัน helper เพื่อดึงชื่อ position
    const getPositionName = (user: User): string => {
        if (!user.position_id) {
            return '-'
        }
        
        const position = user.position_id
        if (position.position_name) {
            return position.position_name
        }
        if (position.name) {
            return position.name
        }
        return '-'
    }

    // ฟังก์ชัน helper เพื่อดึง department object
    const getDepartmentObject = (user: User) => {
        if (!user.department_id) {
            return null
        }
        
        if (Array.isArray(user.department_id)) {
            return user.department_id.length > 0 ? user.department_id[0] : null
        } else {
            return user.department_id
        }
    }

    // ฟังก์ชัน helper เพื่อดึง position object
    const getPositionObject = (user: User) => {
        return user.position_id || null
    }

    const departments = useMemo(() => {
        const deptSet = new Set<string>()
        users.forEach((user) => {
            const deptName = getDepartmentName(user)
            if (deptName && deptName !== '-') {
                deptSet.add(deptName)
            }
        })
        return Array.from(deptSet).sort()
    }, [users])

    const positions = useMemo(() => {
        const posSet = new Set<string>()
        users.forEach((user) => {
            const posName = getPositionName(user)
            if (posName && posName !== '-') {
                posSet.add(posName)
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
            setError(null)
            
            const response = await axios.get('/api/users')
            
            console.log('API Response received')
            
            if (response.data && response.data.users) {
                // Debug: ตรวจสอบโครงสร้างข้อมูล
                if (response.data.users.length > 0) {
                    const firstUser = response.data.users[0]
                    console.log('First user department structure:', {
                        raw: firstUser.department_id,
                        type: typeof firstUser.department_id,
                        isArray: Array.isArray(firstUser.department_id),
                        arrayLength: Array.isArray(firstUser.department_id) ? firstUser.department_id.length : 'N/A',
                        extractedName: getDepartmentName(firstUser)
                    })
                    console.log('First user position structure:', {
                        raw: firstUser.position_id,
                        extractedName: getPositionName(firstUser)
                    })
                }
                
                // กรองเฉพาะผู้ใช้ที่มี role เป็น employee
                const employees = response.data.users.filter(
                    (user: User) => 
                        user.role.toLowerCase() === 'employee' ||
                        user.role.toLowerCase() === 'พนักงาน'
                )
                
                console.log(`Found ${employees.length} employees`)
                
                setUsers(employees)
                setFilteredUsers(employees)
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch users'
            setError(errorMessage)
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
                    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    getDepartmentName(user).toLowerCase().includes(searchTerm.toLowerCase()) ||
                    getPositionName(user).toLowerCase().includes(searchTerm.toLowerCase()),
            )
        }

        // Department filter
        if (filterDepartment !== 'all') {
            filtered = filtered.filter(
                (user) => getDepartmentName(user) === filterDepartment,
            )
        }

        // Position filter
        if (filterPosition !== 'all') {
            filtered = filtered.filter(
                (user) => getPositionName(user) === filterPosition,
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
        return 'bg-blue-50 text-blue-700 border border-blue-200'
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
                <div className="text-[#6B7280]">Loading employees...</div>
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
            <div className="p-2">
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
                    <div className="bg-[#76FF70]/10 border border-none rounded p-4 shadow-sm">
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
                    <div className="bg-[#52FFFF]/50 border border-none rounded p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                       
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
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6 flex items-start gap-2 text-sm">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>
                        ເລືອກພະນັກງານເພື່ອຄິດໄລ່ເງິນເດືອນສຳລັບປັດຈຸບັນ
                        ({getMonthName(selectedMonth)} {selectedYear}).
                        ໃຫ້ຄລິກໃສ່ປຸ່ມ "ຄິດໄລ່ເງິນເດືອນ" ເພື່ອເລີ່ມຕົ້ນ.
                    </span>
                </div>

                {/* Debug Info - สามารถลบออกได้หลังจากทำงานปกติ */}
                {/* {users.length > 0 && (
                    <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded text-sm">
                        <p className="font-medium text-gray-700">ข้อมูลระบบ:</p>
                        <p className="text-gray-600">จำนวนพนักงานทั้งหมด: {users.length}</p>
                        <p className="text-gray-600">แผนกที่พบ: {departments.length} แผนก</p>
                        <p className="text-gray-600">ตำแหน่งที่พบ: {positions.length} ตำแหน่ง</p>
                        <div className="mt-2 text-xs text-gray-500">
                            <p>ตัวอย่างข้อมูลแผนกของพนักงานคนแรก:</p>
                            <p>• ชื่อ: {users[0]?.first_name_en} {users[0]?.last_name_en}</p>
                            <p>• แผนก: {getDepartmentName(users[0])}</p>
                            <p>• ตำแหน่ง: {getPositionName(users[0])}</p>
                        </div>
                    </div>
                )} */}

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
                                        placeholder="Search by name, email, department..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="w-full pl-10 h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                                    />
                                </div>
                                <div className="flex items-center gap-4 flex-wrap">
                                    <span className="text-sm font-medium text-[#6B7280]">
                                        Filter by:
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
                                            className="w-full h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
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
                                            className="w-full h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
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
                                    </div>

                                    {/* Status Filter */}
                                    <div className="relative">
                                        <select
                                            value={filterStatus}
                                            onChange={(e) =>
                                                setFilterStatus(e.target.value)
                                            }
                                            className="w-full h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
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
                                            No employees found
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
                                                {getDepartmentName(user)}
                                            </td>
                                            <td className="px-4 py-3 text-[#6B7280]">
                                                {getPositionName(user)}
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
                                                    onClick={() =>
                                                        handleOpenCalculator(
                                                            user,
                                                        )
                                                    }
                                                    disabled={
                                                        user.status !== 'Active'
                                                    }
                                                    className={`inline-flex flex-col items-center justify-center gap-0.5 w-30 h-[45px] text-[15px] font-medium rounded transition-colors ${
                                                        user.status === 'Active'
                                                            ? 'bg-[#45CC67] text-white hover:bg-[#3DB75B]'
                                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    }`}
                                                >
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
            {openConfirmDialog && selectedUser && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-10">
                    <div className="bg-white p-10 rounded-lg shadow-xl max-w-[600px] h-[600px] w-full mx-4">
                        {/* Dialog Header */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Confirm Salary Calculation
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Review employee details before proceeding
                            </p>
                        </div>

                        {/* Dialog Body */}
                        <div className="px-6 py-4">
                            {/* Employee Details */}
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Users className="w-6 h-6 text-blue-600" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            {selectedUser.first_name_en} {selectedUser.last_name_en}
                                        </h3>
                                        <p className="text-sm text-gray-500">{selectedUser.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Department</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {getDepartmentName(selectedUser)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Position</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {getPositionName(selectedUser)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Status</p>
                                        <span className={`px-2 py-1 text-xs rounded ${getStatusBadge(selectedUser.status)}`}>
                                            {selectedUser.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Base Salary</p>
                                        <p className="text-sm font-medium text-green-600">
                                            {formatCurrency(selectedUser.base_salary)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Period Selection */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-900 mb-3">
                                    Select Calculation Period
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">
                                            Month
                                        </label>
                                        <select
                                            value={selectedMonth}
                                            onChange={(e) =>
                                                setSelectedMonth(
                                                    parseInt(e.target.value),
                                                )
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {Array.from(
                                                { length: 12 },
                                                (_, i) => i + 1,
                                            ).map((month) => (
                                                <option key={month} value={month}>
                                                    {getMonthName(month)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">
                                            Year
                                        </label>
                                        <input
                                            type="number"
                                            value={selectedYear}
                                            onChange={(e) =>
                                                setSelectedYear(
                                                    parseInt(e.target.value),
                                                )
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Warning if salary exists */}
                            {checkExistingSalary(
                                selectedUser._id,
                                selectedMonth,
                                selectedYear,
                            ) && (
                                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium">Warning: Duplicate Record</p>
                                            <p className="mt-1">
                                                Salary for {getMonthName(selectedMonth)} {selectedYear} already exists.
                                                Creating new calculation will overwrite existing record.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Dialog Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setOpenConfirmDialog(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmCalculate}
                                className="h-[45px] px-4 py-2 text-sm font-medium text-white bg-[#45CC67] hover:bg-[#3DB75B] rounded-sm transition-colors"
                            >
                                Proceed to Calculator
                            </button>
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