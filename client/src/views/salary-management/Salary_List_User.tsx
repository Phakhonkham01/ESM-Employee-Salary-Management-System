import React, { useState, useEffect } from 'react'
import { Search, Plus, AlertCircle, Calendar } from 'lucide-react'
import axios from 'axios'
import SalaryCalculator from './SalaryCalculator'

// Interface สำหรับผู้ใช้
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

// Interface สำหรับเงินเดือนที่มีอยู่แล้ว
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

    // State สำหรับ Dialog
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

    // ดึงข้อมูลผู้ใช้
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

    // ดึงข้อมูลเงินเดือนที่มีอยู่สำหรับผู้ใช้ที่เลือก
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
        if (searchTerm.trim() === '') {
            setFilteredUsers(users)
        } else {
            const filtered = users.filter(
                (user) =>
                    `${user.first_name_en} ${user.last_name_en}`
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    user.email
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    user.role.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            setFilteredUsers(filtered)
        }
    }, [searchTerm, users])

    // ตรวจสอบว่าเงินเดือนสำหรับเดือนที่เลือกมีอยู่แล้วหรือไม่
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-green-800'
            case 'Inactive':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'Admin':
                return 'bg-red-100 text-red-800'
            case 'Supervisor':
                return 'bg-yellow-100 text-yellow-800'
            case 'User':
                return 'bg-blue-100 text-blue-800'
            default:
                return 'bg-gray-100 text-gray-800'
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

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-lg text-gray-600">Loading users...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-4">
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    Salary Calculation
                </h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or role"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Information Alert */}
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>
                    Select an employee to calculate salary for the current month
                    ({getMonthName(selectedMonth)} {selectedYear}). Click the
                    "Calculate Salary" button to start.
                </span>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    No.
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Department
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Position
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Base Salary
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vacation Days
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={10}
                                        className="px-6 py-4 text-center text-gray-500"
                                    >
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user, index) => (
                                    <tr
                                        key={user._id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.first_name_en}{' '}
                                                {user.last_name_en}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.department_id
                                                ?.department_name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.position_id?.position_name ||
                                                '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {formatCurrency(user.base_salary)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.status)}`}
                                            >
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border border-gray-300 text-gray-700">
                                                {user.vacation_days || 0} days
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() =>
                                                    handleOpenCalculator(user)
                                                }
                                                disabled={
                                                    user.status !== 'Active'
                                                }
                                                className={`inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium ${
                                                    user.status === 'Active'
                                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                            >
                                                <Plus className="w-4 h-4" />
                                                Calculate Salary
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {openConfirmDialog && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Calculate Salary for{' '}
                                {selectedUser?.first_name_en}{' '}
                                {selectedUser?.last_name_en}
                            </h2>
                        </div>

                        <div className="px-6 py-4">
                            <div className="mb-4">
                                <p className="text-gray-700 mb-3">
                                    You are about to calculate salary for:
                                </p>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p>
                                        • Name: {selectedUser?.first_name_en}{' '}
                                        {selectedUser?.last_name_en}
                                    </p>
                                    <p>• Email: {selectedUser?.email}</p>
                                    <p>
                                        • Base Salary:{' '}
                                        {formatCurrency(
                                            selectedUser?.base_salary,
                                        )}
                                    </p>
                                    <p>
                                        • Month: {getMonthName(selectedMonth)}{' '}
                                        {selectedYear}
                                    </p>
                                </div>
                            </div>

                            {/* แสดงเงินเดือนที่มีอยู่แล้ว */}
                            {existingSalaries.length > 0 && (
                                <div className="mt-4 mb-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">
                                        Existing Salaries:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {existingSalaries.map((salary) => (
                                            <span
                                                key={salary._id}
                                                className={`px-3 py-1 text-xs font-medium rounded-full border ${
                                                    salary.status === 'paid'
                                                        ? 'border-green-300 bg-green-50 text-green-800'
                                                        : 'border-blue-300 bg-blue-50 text-blue-800'
                                                }`}
                                            >
                                                {getMonthName(salary.month)}{' '}
                                                {salary.year}:{' '}
                                                {salary.net_salary.toLocaleString()}{' '}
                                                THB ({salary.status})
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ตรวจสอบว่าเงินเดือนสำหรับเดือนนี้มีอยู่แล้วหรือไม่ */}
                            {selectedUser &&
                                checkExistingSalary(
                                    selectedUser._id,
                                    selectedMonth,
                                    selectedYear,
                                ) && (
                                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-start gap-2 mb-4">
                                        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">
                                            Salary for{' '}
                                            {getMonthName(selectedMonth)}{' '}
                                            {selectedYear} already exists! You
                                            can still proceed to create a new
                                            one.
                                        </span>
                                    </div>
                                )}

                            {/* เลือกเดือน/ปี */}
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Month
                                    </label>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) =>
                                            setSelectedMonth(
                                                parseInt(e.target.value),
                                            )
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setOpenConfirmDialog(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmCalculate}
                                disabled={!selectedUser}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Proceed to Calculate
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
