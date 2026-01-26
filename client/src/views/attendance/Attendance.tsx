import React, { useState, useEffect } from 'react'
import { FaRegEye, FaCalendarCheck, FaFilePdf, FaTimes } from "react-icons/fa"
import { getAllUsers } from '../../services/Create_user/api'
import type { UserData } from '../../services/Create_user/api'
import { getAllDayOffRequests, type DayOffRequest } from '../../services/Day_off_api/api'
import { getAllDepartments, type DepartmentData } from '../../services/departments/api'
import { useExportAttendanceToPDF } from './ExportToPDF'
import {
    Download,
} from "lucide-react"
import { FaEye } from "react-icons/fa"

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
            return user.department_id?.some(dept => dept._id === selectedDepartment)
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

    // เพิ่มฟังก์ชันใหม่สำหรับกรองประวัติตามเดือนและปี
    const getUserRequestHistoryByMonth = (userId: string, year: number, month: number) => {
        return dayOffRequests
            .filter(req => {
                const requestUserId = typeof req.user_id === 'string' ? req.user_id : req.user_id?._id
                const employeeId = typeof req.employee_id === 'string' ? req.employee_id : req.employee_id?._id
                const matchesUser = requestUserId === userId || employeeId === userId

                if (!matchesUser) return false

                // ตรวจสอบเดือนและปี
                const startDate = new Date(req.start_date_time)
                const requestYear = startDate.getFullYear()
                const requestMonth = startDate.getMonth() + 1

                return requestYear === year && requestMonth === month
            })
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    return (
        <div className="bg-white rounded-xl p-2 shadow-sm">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800">ຂໍ້ມູນການມາວຽກ</h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportToPDF}
                        disabled={loading || getFilteredUsers().length === 0}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export to PDF
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm text-green-600 font-medium mb-1">ຈຳນວນມາວຽກທັງໝົດ</div>
                    <div className="text-2xl font-bold text-green-700">{stats.totalAttendance}</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                    <div className="text-sm text-orange-600 font-medium mb-1">ຈຳນວນພັກວຽກທັງໝົດ</div>
                    <div className="text-2xl font-bold text-orange-700">{stats.totalLeave.toFixed(1)}</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm text-purple-600 font-medium mb-1">ຈຳນວນມື້ເຮັດວຽກທັງໝົດ</div>
                    <div className="text-2xl font-bold text-purple-700">{workingDaysInMonth}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
                <div>
                    <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase">ປີ</label>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="w-full border border-[#E5E7EB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1F3A5F]"
                    >
                        {[2023, 2024, 2025, 2026].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase">ເດືອນ</label>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="w-full border border-[#E5E7EB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1F3A5F]"
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                            <option key={month} value={month}>{getMonthName(month)}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase">ພະແໜກ</label>
                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="w-full border border-[#E5E7EB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1F3A5F]"
                        disabled={loading}
                    >
                        <option value="">ພະແໜກທັງໝົດ</option>
                        {getUniqueDepartments().map(dept => (
                            <option key={dept._id} value={dept._id}>{dept.name}</option>
                        ))}
                    </select>
                </div>
                <div className="ml-auto text-sm text-gray-600">
                    ສະແດງມື້ເຮັດວຽກສຳຫຼັບ <span className="font-medium">{getMonthName(selectedMonth)} {selectedYear}</span>
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
                            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ຊື່ (LA)</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ອີເມວ</th>
                            <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">ປີ</th>
                            <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">ເດືອນ</th>
                            <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">ມື້ພັກ</th>
                            <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">ມື້ມາວຽກ</th>
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
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition bg-gray-600 hover:bg-gray-700 text-white"
                                        >
                                            <FaEye className="text-xs" /> ລາຍລະອຽດ
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

            {showModal && selectedUser && (
                <div className="fixed bg-black/40 bg-opacity-50 inset-0 z-50 flex items-center justify-center p-10">
                    {/* Backdrop with blur effect */}
                    <div
                        className="absolute inset-0 transition-opacity"
                        onClick={closeModal}
                    />

                    {/* Modal Container */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
                        {/* Header */}
                        <div className="sticky top-0 z-10 from-emerald-500 to-teal-600 px-6 py-5 border-b border-gray-200">
                            <div className="flex items-center justify-between px-[30px] py-[20px]">
                                <div>
                                    <h3 className="font-bold text-gray-900">
                                        ປະຫວັດການຂໍລາພັກ
                                    </h3>
                                    <p className="ext-gray mt-2">
                                        {getMonthName(selectedMonth)} {selectedYear} • {selectedUser.first_name_la} {selectedUser.last_name_la}
                                    </p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-120px)] no-scrollbar  px-[60px] py-[20px]">
                            {/* Employee Info Card */}
                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5 shadow-sm">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    ຂໍ້ມູນພະນັກງານ
                                </h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-xs text-gray-400 mb-1">🇬🇧 ຊື່ (English)</p>
                                            <p className="text-sm font-medium text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">
                                                {selectedUser.first_name_en} {selectedUser.last_name_en}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-xs text-gray-400 mb-1">🇱🇦 ຊື່ (Lao)</p>
                                            <p className="text-sm font-medium text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">
                                                {selectedUser.first_name_la} {selectedUser.last_name_la}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <div>
                                            <p className="text-xs text-gray-400 mb-1">📧 ອີເມວ</p>
                                            <p className="text-sm font-medium text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">
                                                {selectedUser.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs text-gray-400 mb-1">ພະແໜກ3</p>
                                        <p className="text-sm font-medium text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">
                                            {selectedUser.department_id && typeof selectedUser.department_id === 'object'
                                                ? selectedUser.department_id.map((dept: any) => dept.department_name).join(', ')
                                                : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Request History */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                        </svg>
                                        ປະຫວັດຄຳຂໍ
                                    </h4>
                                    <span className="text-xs font-medium px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                                        {getUserRequestHistoryByMonth(selectedUser._id, selectedYear, selectedMonth).length} ລາຍການ
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {getUserRequestHistoryByMonth(selectedUser._id, selectedYear, selectedMonth).map((request) => (
                                        <div
                                            key={request._id}
                                            className="group border border-gray-200 hover:border-emerald-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 bg-white"
                                        >
                                            {/* Request Header */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        {/* Status Badge with Colors */}
                                                        {request.status === 'Accepted' && (
                                                            <div className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                                {request.status}
                                                            </div>
                                                        )}
                                                        {request.status === 'Pending' && (
                                                            <div className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                                                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                                                {request.status}
                                                            </div>
                                                        )}
                                                        {request.status === 'Rejected' && (
                                                            <div className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                                                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                                                {request.status}
                                                            </div>
                                                        )}
                                                        {!['Accepted', 'Pending', 'Rejected'].includes(request.status) && (
                                                            <div className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
                                                                {request.status}
                                                            </div>
                                                        )}

                                                        <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                            {request.day_off_type}
                                                        </div>
                                                    </div>
                                                    <h5 className="font-medium text-gray-800 group-hover:text-emerald-700 transition-colors">
                                                        {request.title}
                                                    </h5>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <div className="text-lg font-bold text-purple-600">
                                                        {request.date_off_number}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {request.date_off_number === 1 ? 'ມື້' : 'ມື້'}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Date Information */}
                                            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1 text-gray-400">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-xs">ເລີ່ມ</span>
                                                    </div>
                                                    <span className="text-gray-700 font-medium">
                                                        {new Date(request.start_date_time).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1 text-gray-400">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-xs">ຮອດ</span>
                                                    </div>
                                                    <span className="text-gray-700 font-medium">
                                                        {new Date(request.end_date_time).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                                                <div className="flex items-center gap-1 text-gray-400">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                    </svg>
                                                    ສ້າງໃນ: {new Date(request.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Empty State */}
                                    {getUserRequestHistoryByMonth(selectedUser._id, selectedYear, selectedMonth).length === 0 && (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <p className="text-gray-500 font-medium">ບໍ່ມີຂໍ້ມູນການຂໍລາໃນເດືອນນີ້</p>
                                            <p className="text-sm text-gray-400 mt-1">ພະນັກງານຍັງບໍ່ທັນມີການຂໍລາພັກໃນ {getMonthName(selectedMonth)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Attendance