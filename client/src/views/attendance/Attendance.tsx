import React, { useState, useEffect } from 'react'
import { FaRegEye, FaPlus, FaCalendarAlt, FaClock, FaUserCheck } from "react-icons/fa"
import { getAllUsers } from '../../services/Create_user/api'
import type { UserData } from '../../services/Create_user/api'


interface AttendanceRecord {
    id: string
    user_id: string
    year: number
    month: number
    ot_hours: number
    leave_days: number
    created_at: string
}

interface AttendanceWithUser extends AttendanceRecord {
    user: UserData
}

interface DayOffRequest {
    id: string
    employee_id: string
    supervisor_id?: string
    day_off_type: 'Full day' | 'Half day'
    start_date_time: string
    end_date_time: string
    date_off_number: number
    title: 'OT' | 'FIELD WORK'
    reason: string
    status: 'Pending' | 'Accept' | 'Reject'
    created_at: string
    user: UserData
}

const Attendance: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([])
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceWithUser[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
    const [viewMode, setViewMode] = useState<'users' | 'attendance'>('attendance')

    // Day-off requests state
    const [dayOffRequests, setDayOffRequests] = useState<DayOffRequest[]>([])

    // Form state for adding a day off request
    const [formData, setFormData] = useState({
        employee_id: '',
        supervisor_id: '',
        day_off_type: 'Full day',
        start_date_time: '',
        end_date_time: '',
        date_off_number: 1,
        title: 'OT',
        reason: '',
        status: 'Pending',
    })

    useEffect(() => {
        fetchUsers()
        fetchAttendanceRecords()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await getAllUsers()
            setUsers(response.users)
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchAttendanceRecords = async () => {
        try {
            setLoading(true)
            // Mock data - replace with actual API call
            const mockAttendance: AttendanceRecord[] = [
                {
                    id: 'att1',
                    user_id: '1',
                    year: 2025,
                    month: 1,
                    ot_hours: 15.5,
                    leave_days: 2,
                    created_at: '2025-01-05T10:00:00Z'
                },
                {
                    id: 'att2',
                    user_id: '2',
                    year: 2025,
                    month: 1,
                    ot_hours: 8.0,
                    leave_days: 0,
                    created_at: '2025-01-05T10:00:00Z'
                },
                {
                    id: 'att3',
                    user_id: '1',
                    year: 2024,
                    month: 12,
                    ot_hours: 20.0,
                    leave_days: 3,
                    created_at: '2024-12-05T10:00:00Z'
                }
            ]

            // Combine with user data
            // const mockUsers: UserData[] = [
            //     {
            //         _id: '1',
            //         first_name_en: 'John',
            //         last_name_en: 'Doe',
            //         first_name_la: 'ຈອນ',
            //         last_name_la: 'ໂດ',
            //         email: 'john.doe@example.com'
            //     },
            //     {
            //         _id: '2',
            //         first_name_en: 'Jane',
            //         last_name_en: 'Smith',
            //         first_name_la: 'ເຈນ',
            //         last_name_la: 'ສະມິດ',
            //         email: 'jane.smith@example.com'
            //     }
            // ]

            // const combined = mockAttendance.map(att => ({
            //     ...att,
            //     user: mockUsers.find(u => u._id === att.user_id)!
            // }))

            // setAttendanceRecords(combined)
        } catch (error) {
            console.error('Error fetching attendance:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleViewDetail = (user: UserData) => {
        setSelectedUser(user)
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setSelectedUser(null)
    }

    const closeAddModal = () => {
        setShowAddModal(false)
        setFormData({
            employee_id: '',
            supervisor_id: '',
            day_off_type: 'Full day',
            start_date_time: '',
            end_date_time: '',
            date_off_number: 1,
            title: 'OT',
            reason: '',
            status: 'Pending',
        })
    }

    const handleSubmitDayOffRequest = () => {
        // Basic validation
        if (!formData.employee_id) { alert('Please select an employee'); return }
        if (!formData.start_date_time || !formData.end_date_time) { alert('Please select start and end date/time'); return }

        const start = new Date(formData.start_date_time)
        const end = new Date(formData.end_date_time)
        if (isNaN(start.getTime()) || isNaN(end.getTime())) { alert('Invalid date/time'); return }
        if (start > end) { alert('Start date/time cannot be after end date/time'); return }

        // Calculate decimal number of days
        let date_off_number = 0
        if (formData.day_off_type === 'Half day') {
            // Half day must be within the same date
            if (start.toDateString() !== end.toDateString()) { alert('Half day must be within the same date'); return }
            date_off_number = 0.5
        } else {
            date_off_number = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
        }

        const newReq: DayOffRequest = {
            id: `req${Date.now()}`,
            employee_id: formData.employee_id,
            supervisor_id: formData.supervisor_id || undefined,
            day_off_type: formData.day_off_type as 'Full day' | 'Half day',
            start_date_time: formData.start_date_time,
            end_date_time: formData.end_date_time,
            date_off_number,
            title: formData.title as 'OT' | 'FIELD WORK',
            reason: formData.reason,
            status: (formData.status as 'Pending' | 'Accept' | 'Reject') || 'Pending',
            created_at: new Date().toISOString(),
            user: users.find(u => u._id === formData.employee_id)!
        }

        setDayOffRequests([...dayOffRequests, newReq])
        closeAddModal()
    }


    const getMonthName = (month: number) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December']
        return months[month - 1]
    }

    const filteredAttendance = attendanceRecords.filter(record =>
        record.year === selectedYear && record.month === selectedMonth
    )

    const getUserAttendanceHistory = (userId: string) => {
        return attendanceRecords
            .filter(record => record.user_id === userId)
            .sort((a, b) => {
                if (a.year !== b.year) return b.year - a.year
                return b.month - a.month
            })
    }

    const getTotalStats = () => {
        const totalOT = filteredAttendance.reduce((sum, record) => sum + record.ot_hours, 0)
        const totalLeave = filteredAttendance.reduce((sum, record) => sum + record.leave_days, 0)
        return { totalOT, totalLeave }
    }

    const stats = getTotalStats()

    return (
        <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800">Attendance Management</h2>
            </div>

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
                <div className="ml-auto text-sm text-gray-600">
                    Showing attendance for <span className="font-medium">{getMonthName(selectedMonth)} {selectedYear}</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b-2 border-gray-200">
                            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name (EN)</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name (LA)</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                            <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">OT Hours</th>
                            <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Leave Days</th>
                            <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => {
                            const rec = attendanceRecords.find(r => r.user_id === user._id && r.year === selectedYear && r.month === selectedMonth)
                            const ot = rec ? rec.ot_hours : 0
                            const leave = rec ? rec.leave_days : 0
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
                                    <td className="px-4 py-4 text-center">
                                        <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium text-sm">
                                            <FaClock size={12} />
                                            {ot.toFixed(1)}h
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <div className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 px-3 py-1 rounded-full font-medium text-sm">
                                            {leave} days
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

                {users.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                        <div className="text-5xl mb-4 opacity-50">👥</div>
                        <p className="mb-2">No users found</p>
                    </div>
                )}
            </div>

            {/* User Detail Modal with Attendance History */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-t-xl">
                            <h3 className="text-xl font-semibold text-white">Employee Attendance History</h3>
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

                            {/* Attendance History */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Attendance History</h4>
                                <div className="space-y-3">
                                    {getUserAttendanceHistory(selectedUser._id).map((record) => (
                                        <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FaCalendarAlt className="text-gray-400" size={14} />
                                                        <span className="font-medium text-gray-800">
                                                            {getMonthName(record.month)} {record.year}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Created: {new Date(record.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <div className="text-center">
                                                        <div className="text-xs text-gray-500 mb-1">OT Hours</div>
                                                        <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold text-sm">
                                                            {record.ot_hours.toFixed(1)}h
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-xs text-gray-500 mb-1">Leave Days</div>
                                                        <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold text-sm">
                                                            {record.leave_days}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {getUserAttendanceHistory(selectedUser._id).length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <div className="text-3xl mb-2 opacity-50">📋</div>
                                            <p>No attendance records found</p>
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