import React, { useState, useEffect } from 'react'
import { FaRegEye, FaPlus, FaCalendarAlt, FaClock, FaUserCheck } from "react-icons/fa"

interface UserData {
    _id: string
    first_name_en: string
    last_name_en: string
    first_name_la: string
    last_name_la: string
    email: string
}

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

const AttendanceManagement: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([])
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceWithUser[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
    const [viewMode, setViewMode] = useState<'users' | 'attendance'>('attendance')

    // Form state for adding attendance
    const [formData, setFormData] = useState({
        user_id: '',
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        ot_hours: 0,
        leave_days: 0
    })

    useEffect(() => {
        fetchUsers()
        fetchAttendanceRecords()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            // Mock data - replace with actual API call
            const mockUsers: UserData[] = [
                {
                    _id: '1',
                    first_name_en: 'John',
                    last_name_en: 'Doe',
                    first_name_la: 'ຈອນ',
                    last_name_la: 'ໂດ',
                    email: 'john.doe@example.com'
                },
                {
                    _id: '2',
                    first_name_en: 'Jane',
                    last_name_en: 'Smith',
                    first_name_la: 'ເຈນ',
                    last_name_la: 'ສະມິດ',
                    email: 'jane.smith@example.com'
                },
                {
                    _id: '3',
                    first_name_en: 'Bob',
                    last_name_en: 'Johnson',
                    first_name_la: 'ບອບ',
                    last_name_la: 'ຈອນສັນ',
                    email: 'bob.johnson@example.com'
                }
            ]
            setUsers(mockUsers)
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
            const mockUsers: UserData[] = [
                {
                    _id: '1',
                    first_name_en: 'John',
                    last_name_en: 'Doe',
                    first_name_la: 'ຈອນ',
                    last_name_la: 'ໂດ',
                    email: 'john.doe@example.com'
                },
                {
                    _id: '2',
                    first_name_en: 'Jane',
                    last_name_en: 'Smith',
                    first_name_la: 'ເຈນ',
                    last_name_la: 'ສະມິດ',
                    email: 'jane.smith@example.com'
                }
            ]

            const combined = mockAttendance.map(att => ({
                ...att,
                user: mockUsers.find(u => u._id === att.user_id)!
            }))

            setAttendanceRecords(combined)
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

    const handleAddAttendance = () => {
        setShowAddModal(true)
    }

    const closeAddModal = () => {
        setShowAddModal(false)
        setFormData({
            user_id: '',
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            ot_hours: 0,
            leave_days: 0
        })
    }

    const handleSubmitAttendance = () => {
        // Add logic to submit attendance record
        console.log('Submitting attendance:', formData)
        
        // Mock adding the record to the list
        const newRecord: AttendanceWithUser = {
            id: `att${Date.now()}`,
            user_id: formData.user_id,
            year: formData.year,
            month: formData.month,
            ot_hours: formData.ot_hours,
            leave_days: formData.leave_days,
            created_at: new Date().toISOString(),
            user: users.find(u => u._id === formData.user_id)!
        }
        
        setAttendanceRecords([...attendanceRecords, newRecord])
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
                <button
                    onClick={handleAddAttendance}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                >
                    <FaPlus size={14} />
                    Add Attendance Record
                </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setViewMode('attendance')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        viewMode === 'attendance'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    <FaCalendarAlt className="inline mr-2" size={14} />
                    Attendance Records
                </button>
                <button
                    onClick={() => setViewMode('users')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        viewMode === 'users'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    <FaUserCheck className="inline mr-2" size={14} />
                    User List
                </button>
            </div>

            {viewMode === 'attendance' && (
                <>
                    {/* Date Filter */}
                    <div className="flex items-center gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
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
                        <div className="ml-auto flex gap-4">
                            <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                                <div className="text-xs text-gray-500 mb-1">Total OT Hours</div>
                                <div className="text-xl font-bold text-blue-600">{stats.totalOT.toFixed(1)}</div>
                            </div>
                            <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                                <div className="text-xs text-gray-500 mb-1">Total Leave Days</div>
                                <div className="text-xl font-bold text-orange-600">{stats.totalLeave}</div>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Table */}
                    {loading ? (
                        <div className="text-center py-10 text-gray-500 text-sm">
                            Loading attendance records...
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 border-b-2 border-gray-200">
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                        <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Period</th>
                                        <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">OT Hours</th>
                                        <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Leave Days</th>
                                        <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAttendance.map((record) => (
                                        <tr 
                                            key={record.id}
                                            className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 py-4 text-sm text-gray-700">
                                                <div className="font-medium">
                                                    {record.user.first_name_en} {record.user.last_name_en}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {record.user.first_name_la} {record.user.last_name_la}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-700">
                                                {record.user.email}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-700 text-center">
                                                <div className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                                                    <FaCalendarAlt size={12} className="text-gray-500" />
                                                    {getMonthName(record.month)} {record.year}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium text-sm">
                                                    <FaClock size={12} />
                                                    {record.ot_hours.toFixed(1)}h
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 px-3 py-1 rounded-full font-medium text-sm">
                                                    {record.leave_days} days
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <button
                                                    onClick={() => handleViewDetail(record.user)}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors"
                                                >
                                                    <FaRegEye size={14} />
                                                    View History
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredAttendance.length === 0 && (
                                <div className="text-center py-16 text-gray-500">
                                    <div className="text-5xl mb-4 opacity-50">📋</div>
                                    <p className="mb-2">No attendance records for {getMonthName(selectedMonth)} {selectedYear}</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {viewMode === 'users' && (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b-2 border-gray-200">
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name (EN)</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name (LA)</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
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
                                        <button
                                            onClick={() => handleViewDetail(user)}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors"
                                        >
                                            <FaRegEye size={14} />
                                            View History
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

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

            {/* Add Attendance Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-t-xl">
                            <h3 className="text-xl font-semibold text-white">Add Attendance Record</h3>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Employee
                                </label>
                                <select
                                    value={formData.user_id}
                                    onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">Select an employee</option>
                                    {users.map(user => (
                                        <option key={user._id} value={user._id}>
                                            {user.first_name_en} {user.last_name_en}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Year
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.year}
                                        onChange={(e) => setFormData({...formData, year: Number(e.target.value)})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Month
                                    </label>
                                    <select
                                        value={formData.month}
                                        onChange={(e) => setFormData({...formData, month: Number(e.target.value)})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                            <option key={month} value={month}>{getMonthName(month)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    OT Hours
                                </label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={formData.ot_hours}
                                    onChange={(e) => setFormData({...formData, ot_hours: Number(e.target.value)})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Leave Days
                                </label>
                                <input
                                    type="number"
                                    value={formData.leave_days}
                                    onChange={(e) => setFormData({...formData, leave_days: Number(e.target.value)})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeAddModal}
                                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmitAttendance}
                                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                                >
                                    Add Record
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AttendanceManagement