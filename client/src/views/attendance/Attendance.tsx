import React, { useState, useEffect } from 'react'
import { FaRegEye, FaCalendarCheck, FaFilePdf } from "react-icons/fa"
import { getAllUsers } from '../../services/Create_user/api'
import type { UserData } from '../../services/Create_user/api'
import { getAllDayOffRequests, type DayOffRequest } from '../../services/Day_off_api/api'
import { getAllDepartments, type DepartmentData } from '../../services/departments/api'
import { useExportAttendanceToPDF } from './ExportToPDF'

interface UserAttendanceStats {
    userId: string
    user: UserData
    year: number
    month: number
    leaveDays: number
    attendanceDays: number
}

const Attendance: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([])
    const [dayOffRequests, setDayOffRequests] = useState<DayOffRequest[]>([])
    const [departments, setDepartments] = useState<DepartmentData[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
    const [selectedDepartment, setSelectedDepartment] = useState<string>('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [usersResponse, dayOffResponse, departmentsResponse] = await Promise.all([
                getAllUsers(),
                getAllDayOffRequests(),
                getAllDepartments()
            ])
            setUsers(usersResponse.users)
            setDayOffRequests(dayOffResponse.requests)
            setDepartments(departmentsResponse.departments)
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const getWorkingDaysInMonth = (year: number, month: number): number => {
        const daysInMonth = new Date(year, month, 0).getDate()
        let workingDays = 0

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day)
            const dayOfWeek = date.getDay()
            // Count Monday to Friday (1-5) as working days
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                workingDays++
            }
        }

        return workingDays
    }

    const calculateLeaveDays = (userId: string, year: number, month: number): number => {
        const leaveRequests = dayOffRequests.filter(req => {
            const requestUserId = typeof req.user_id === 'string' ? req.user_id : req.user_id?._id
            const employeeId = typeof req.employee_id === 'string' ? req.employee_id : req.employee_id?._id

            const matchesUser = requestUserId === userId || employeeId === userId
            if (!matchesUser || req.status !== 'Accepted') return false

            const startDate = new Date(req.start_date_time)
            const requestYear = startDate.getFullYear()
            const requestMonth = startDate.getMonth() + 1

            // Only count actual leave (not OT)
            const isNotOT = !req.title?.toUpperCase().includes('OT')

            return requestYear === year && requestMonth === month && isNotOT
        })

        return leaveRequests.reduce((sum, req) => sum + (req.date_off_number || 0), 0)
    }


    const calculateAttendanceDays = (userId: string, year: number, month: number): number => {
        const workingDays = getWorkingDaysInMonth(year, month)
        const leaveDays = calculateLeaveDays(userId, year, month)
        return Math.max(0, workingDays - leaveDays)
    }

    const getUserStats = (userId: string): UserAttendanceStats => {
        const user = users.find(u => u._id === userId)!
        return {
            userId,
            user,
            year: selectedYear,
            month: selectedMonth,
            leaveDays: calculateLeaveDays(userId, selectedYear, selectedMonth),
            attendanceDays: calculateAttendanceDays(userId, selectedYear, selectedMonth)
        }
    }

    const getUserRequestHistory = (userId: string) => {
        return dayOffRequests
            .filter(req => {
                const requestUserId = typeof req.user_id === 'string' ? req.user_id : req.user_id?._id
                const employeeId = typeof req.employee_id === 'string' ? req.employee_id : req.employee_id?._id
                return requestUserId === userId || employeeId === userId
            })
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    const handleViewDetail = (user: UserData) => {
        setSelectedUser(user)
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setSelectedUser(null)
    }

    const getMonthName = (month: number) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December']
        return months[month - 1]
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Accept': return 'bg-green-100 text-green-700'
            case 'Reject': return 'bg-red-100 text-red-700'
            case 'Pending': return 'bg-yellow-100 text-yellow-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const getUniqueDepartments = () => {
        // Use fetched departments from API
        return departments.map(dept => ({
            _id: dept._id,
            name: dept.department_name
        }))
    }

    const getFilteredUsers = () => {
        if (!selectedDepartment) return users
        return users.filter(user => {
            const deptId = typeof user.department_id === 'object' && user.department_id !== null
                ? user.department_id._id
                : user.department_id
            return deptId === selectedDepartment
        })
    }

    const getTotalStats = () => {
        const filteredUsers = getFilteredUsers()
        const totalLeave = filteredUsers.reduce((sum, user) =>
            sum + calculateLeaveDays(user._id, selectedYear, selectedMonth), 0)
        const totalAttendance = filteredUsers.reduce((sum, user) =>
            sum + calculateAttendanceDays(user._id, selectedYear, selectedMonth), 0)
        return { totalLeave, totalAttendance }
    }

    const stats = getTotalStats()
    const workingDaysInMonth = getWorkingDaysInMonth(selectedYear, selectedMonth)

    // Prepare user stats for export
    const userStatsForExport = getFilteredUsers().map(user => getUserStats(user._id))

    // Export to PDF hook
    const handleExportToPDF = useExportAttendanceToPDF({
        users: getFilteredUsers(),
        userStats: userStatsForExport,
        summaryStats: {
            totalOT: 0,
            totalLeave: stats.totalLeave,
            totalAttendance: stats.totalAttendance,
            workingDaysInMonth: workingDaysInMonth
        },
        otData: [],
        selectedYear,
        selectedMonth,
        selectedDepartment,
        departments,
        getMonthName
    })

    return (
        <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800">Attendance</h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportToPDF}
                        disabled={loading || getFilteredUsers().length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaFilePdf /> Export to PDF
                    </button>
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        Refresh Data
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm text-green-600 font-medium mb-1">Total Attendance Days</div>
                    <div className="text-2xl font-bold text-green-700">{stats.totalAttendance}</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                    <div className="text-sm text-orange-600 font-medium mb-1">Total Leave Days</div>
                    <div className="text-2xl font-bold text-orange-700">{stats.totalLeave.toFixed(1)}</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm text-purple-600 font-medium mb-1">Working Days</div>
                    <div className="text-2xl font-bold text-purple-700">{workingDaysInMonth}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
                <div>
                    <label className="text-xs text-gray-600 font-medium mb-1 block">Year</label>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {[2023, 2024, 2025, 2026].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-600 font-medium mb-1 block">Month</label>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                            <option key={month} value={month}>{getMonthName(month)}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-600 font-medium mb-1 block">Department</label>
                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
                        disabled={loading}
                    >
                        <option value="">All Departments</option>
                        {getUniqueDepartments().map(dept => (
                            <option key={dept._id} value={dept._id}>{dept.name}</option>
                        ))}
                    </select>
                </div>
                <div className="ml-auto text-sm text-gray-600">
                    Showing attendance for <span className="font-medium">{getMonthName(selectedMonth)} {selectedYear}</span>
                    {selectedDepartment && (
                        <span className="ml-2">
                            • <span className="font-medium">{getUniqueDepartments().find(d => d._id === selectedDepartment)?.name}</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b-2 border-gray-200">
                            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name (EN)</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name (LA)</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                            <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Year</th>
                            <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Month</th>
                            <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Leave Days</th>
                            <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Attendance Days</th>
                            <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="text-center py-8 text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : getFilteredUsers().length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center py-8 text-gray-500">
                                    No users found for the selected filters
                                </td>
                            </tr>
                        ) : getFilteredUsers().map((user) => {
                            const stats = getUserStats(user._id)
                            return (
                                <tr
                                    key={user._id}
                                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-4 py-4 text-sm text-gray-700">
                                        <div className="font-medium">
                                            {user.first_name_en} {user.last_name_en}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-700">
                                        <div>
                                            {user.first_name_la} {user.last_name_la}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-700">
                                        {user.email}
                                    </td>
                                    <td className="px-4 py-4 text-center text-sm font-medium text-gray-800">
                                        {stats.year}
                                    </td>
                                    <td className="px-4 py-4 text-center text-sm font-medium text-gray-800">
                                        {getMonthName(stats.month)}
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <div className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 px-3 py-1 rounded-full font-medium text-sm">
                                            {stats.leaveDays.toFixed(1)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium text-sm">
                                            <FaCalendarCheck size={12} />
                                            {stats.attendanceDays}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <button
                                            onClick={() => handleViewDetail(user)}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors"
                                        >
                                            <FaRegEye size={14} />
                                            View History
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                {users.length === 0 && !loading && (
                    <div className="text-center py-16 text-gray-500">
                        <div className="text-5xl mb-4 opacity-50">👥</div>
                        <p className="mb-2">No users found</p>
                    </div>
                )}
            </div>

            {/* User Detail Modal */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-t-xl">
                            <h3 className="text-xl text-white font-semibold">Employee Request History</h3>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* User Information */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Employee Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Name (English)</p>
                                        <p className="text-sm font-medium text-gray-800">
                                            {selectedUser.first_name_en} {selectedUser.last_name_en}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Name (Lao)</p>
                                        <p className="text-sm font-medium text-gray-800">
                                            {selectedUser.first_name_la} {selectedUser.last_name_la}
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs text-gray-500 mb-1">Email</p>
                                        <p className="text-sm font-medium text-gray-800">{selectedUser.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Request History */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Request History</h4>
                                <div className="space-y-3">
                                    {getUserRequestHistory(selectedUser._id).map((request) => (
                                        <div key={request._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium text-gray-800">{request.title}</span>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                                            {request.status}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Type: {request.day_off_type}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold text-sm">
                                                        {request.date_off_number} {request.date_off_number === 1 ? 'day' : 'days'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div>
                                                    <span className="text-gray-500">Start:</span>
                                                    <span className="ml-1 text-gray-700">
                                                        {new Date(request.start_date_time).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">End:</span>
                                                    <span className="ml-1 text-gray-700">
                                                        {new Date(request.end_date_time).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-2 text-xs text-gray-500">
                                                Created: {new Date(request.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}

                                    {getUserRequestHistory(selectedUser._id).length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <div className="text-3xl mb-2 opacity-50">📋</div>
                                            <p>No request records found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200">
                            <button
                                onClick={closeModal}
                                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Attendance