import React, { useState, useEffect } from 'react'
import {
    HiCheck,
    HiX,
    HiEye,
    HiRefresh,
    HiFilter,
    HiOutlineUser,
    HiOutlineCalendar,
    HiOutlineClock,
} from 'react-icons/hi'
import axios from 'axios'

/* ================= TYPES ================= */

export interface DayOffItem {
    _id: string
    employee_name?: string
    supervisor_name?: string
    user_id:
        | string
        | {
              _id: string
              first_name_en?: string
              last_name_en?: string
              email?: string
          }
    employee_id:
        | string
        | {
              _id: string
              employee_id?: string
              first_name_en?: string
              last_name_en?: string
          }
    supervisor_id:
        | string
        | {
              _id: string
              employee_id?: string
              first_name_en?: string
              last_name_en?: string
          }
    day_off_type: 'FULL_DAY' | 'HALF_DAY'
    start_date_time: string
    end_date_time: string
    date_off_number: number
    title: string
    status: 'Pending' | 'Accepted' | 'Rejected'
    created_at?: string
}

interface Props {
    dayOffs?: DayOffItem[]
    onApprove: (id: string) => void
    onReject: (id: string) => void
    onView?: (item: DayOffItem) => void
    refetch?: () => void
}

/* ================= UTILITY FUNCTIONS ================= */

const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
}

const getEmployeeDisplayName = (d: DayOffItem): string => {
    if (d.employee_name) return d.employee_name

    if (typeof d.employee_id === 'string') {
        return d.employee_id
    }

    if (typeof d.employee_id === 'object' && d.employee_id !== null) {
        return `${d.employee_id.first_name_en || ''} ${d.employee_id.last_name_en || ''}`.trim()
    }

    return '-'
}

const getEmployeeId = (employeeData: string | any): string => {
    if (!employeeData) return 'N/A'

    if (typeof employeeData === 'string') {
        return employeeData
    }

    if (typeof employeeData === 'object' && employeeData !== null) {
        if (employeeData.employee_id) {
            return employeeData.employee_id
        }
        if (employeeData._id) {
            return employeeData._id.toString()
        }
    }

    return 'N/A'
}

const getSupervisorName = (supervisorData: string | any): string => {
    if (!supervisorData) return 'Unknown Supervisor'

    if (typeof supervisorData === 'string') {
        if (/^[0-9a-fA-F]{24}$/.test(supervisorData)) {
            return `SPV-${supervisorData.substring(0, 6)}...`
        }
        return supervisorData
    }

    if (typeof supervisorData === 'object' && supervisorData !== null) {
        const firstName = supervisorData.first_name_en || ''
        const lastName = supervisorData.last_name_en || ''

        if (firstName && lastName) {
            return `${firstName} ${lastName}`
        } else if (firstName) {
            return firstName
        } else if (lastName) {
            return lastName
        }

        if (supervisorData.email) {
            return supervisorData.email.split('@')[0]
        }

        if (supervisorData.employee_id) {
            return `SPV-${supervisorData.employee_id}`
        }

        if (supervisorData._id) {
            return `SPV-${supervisorData._id.toString().substring(0, 6)}...`
        }
    }

    return 'Unknown Supervisor'
}

/* ================= MAIN COMPONENT ================= */

const SupervisorDayOffApproval: React.FC<Props> = ({
    dayOffs: propDayOffs,
    onApprove: propOnApprove,
    onReject: propOnReject,
    onView,
    refetch: propRefetch,
}) => {
    const [selectedStatus, setSelectedStatus] = useState<string>('all')
    const [selectedMonth, setSelectedMonth] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(!propDayOffs)
    const [dayOffs, setDayOffs] = useState<DayOffItem[]>(propDayOffs || [])
    const [error, setError] = useState<string>('')
    const [supervisorId, setSupervisorId] = useState<string>('')
    const [supervisorName, setSupervisorName] = useState<string>('')

    useEffect(() => {
        const authData = localStorage.getItem('auth')
        if (authData) {
            try {
                const auth = JSON.parse(authData)
                const user = auth.user

                if (user.role === 'Supervisor' && user._id) {
                    setSupervisorId(user._id)

                    if (user.first_name_en && user.last_name_en) {
                        setSupervisorName(
                            `${user.first_name_en} ${user.last_name_en}`,
                        )
                    } else if (user.employee_id) {
                        setSupervisorName(`S-${user.employee_id}`)
                    } else {
                        setSupervisorName(user.email || 'Supervisor')
                    }
                } else {
                    setError(
                        'Access denied. Only supervisors can view this page.',
                    )
                }
            } catch (error) {
                setError('Failed to load user data')
            }
        } else {
            setError('Please login to access this page')
        }
    }, [])

    const fetchDayOffRequests = async () => {
        if (!supervisorId) {
            return
        }

        try {
            setLoading(true)
            setError('')

            const response = await axios.get('/api/day-off-requests/allusers')

            if (response.data.success) {
                const allRequests = response.data.requests || []
                const filteredRequests = allRequests.filter((req: any) => {
                    const supervisorIdValue = req.supervisor_id || ''
                    const supervisorNameValue = req.supervisor_name || ''

                    if (supervisorIdValue === supervisorId) return true

                    if (
                        typeof supervisorIdValue === 'object' &&
                        supervisorIdValue._id === supervisorId
                    ) {
                        return true
                    }

                    if (
                        supervisorName &&
                        supervisorNameValue.includes(
                            supervisorName.split(' ')[0],
                        )
                    ) {
                        return true
                    }

                    return false
                })

                setDayOffs(filteredRequests)
            } else {
                setError('Failed to fetch data')
                setDayOffs([])
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Network error')
            setDayOffs([])
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (id: string) => {
        if (!window.confirm('Approve this leave request?')) {
            return
        }

        try {
            const response = await axios.patch(
                `/api/day-off-requests/${id}/status`,
                {
                    status: 'Accepted',
                },
            )

            if (response.data.success) {
                fetchDayOffRequests()
                if (propOnApprove) propOnApprove(id)
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to approve request')
        }
    }

    const handleReject = async (id: string) => {
        if (!window.confirm('Reject this leave request?')) {
            return
        }

        try {
            const response = await axios.patch(
                `/api/day-off-requests/${id}/status`,
                {
                    status: 'Rejected',
                },
            )

            if (response.data.success) {
                fetchDayOffRequests()
                if (propOnReject) propOnReject(id)
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to reject request')
        }
    }

    useEffect(() => {
        if (!propDayOffs && supervisorId) {
            fetchDayOffRequests()
        } else if (propDayOffs) {
            setDayOffs(propDayOffs)
        }
    }, [propDayOffs, supervisorId])

    const filteredDayOffs = dayOffs.filter((d) => {
        if (selectedStatus !== 'all' && d.status !== selectedStatus)
            return false
        if (selectedMonth) {
            const month = new Date(d.start_date_time).toISOString().slice(0, 7)
            if (month !== selectedMonth) return false
        }
        return true
    })

    const availableMonths = Array.from(
        new Set(
            dayOffs.map((d) =>
                new Date(d.start_date_time).toISOString().slice(0, 7),
            ),
        ),
    ).sort()

    const stats = {
        pending: dayOffs.filter((d) => d.status === 'Pending').length,
        accepted: dayOffs.filter((d) => d.status === 'Accepted').length,
        rejected: dayOffs.filter((d) => d.status === 'Rejected').length,
        total: dayOffs.length,
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Pending':
                return {
                    background: '#FEF3C7',
                    color: '#B45309',
                    border: '#FDE68A',
                }
            case 'Accepted':
                return {
                    background: '#E6F4EA',
                    color: '#2E7D32',
                    border: '#C8E6C9',
                }
            case 'Rejected':
                return {
                    background: '#FDE8E8',
                    color: '#9B1C1C',
                    border: '#FECACA',
                }
            default:
                return {
                    background: '#F3F4F6',
                    color: '#6B7280',
                    border: '#E5E7EB',
                }
        }
    }

    const getTypeStyle = (type: string) => {
        return type === 'HALF_DAY'
            ? { background: '#E8EEF6', color: '#1F3A5F', border: '#CBD5E1' }
            : { background: '#F3F4F6', color: '#6B7280', border: '#E5E7EB' }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-medium text-gray-900 mb-1">
                            Leave Request Management System
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Supervisor: Review and approve employee leave
                            requests
                        </p>
                    </div>

                    {supervisorName && (
                        <div className="bg-white border border-gray-300 px-4 py-2 rounded-sm">
                            <p className="text-sm font-medium text-gray-900">
                                Supervisor: {supervisorName}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">
                                ID: {supervisorId.substring(0, 8)}...
                            </p>
                        </div>
                    )}
                </div>
                <div className="h-[1px] bg-gray-200 mt-4"></div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-6 p-4 bg-[#FDE8E8] border border-[#9B1C1C] text-[#9B1C1C] text-sm rounded-sm">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="font-medium mb-1">System Alert</div>
                            <div>{error}</div>
                        </div>
                        <button
                            onClick={fetchDayOffRequests}
                            className="px-4 py-1.5 text-sm font-medium text-white bg-[#9B1C1C] hover:bg-[#7F1D1D] transition-colors flex items-center gap-1.5"
                        >
                            <HiRefresh className="w-3 h-3" />
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Access Denied */}
            {!supervisorId && !loading ? (
                <div className="bg-white border border-gray-300 rounded-sm p-8">
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <HiOutlineUser className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Authorization Required
                        </h3>
                        <p className="text-gray-600 text-center max-w-md mb-4 text-sm">
                            Supervisor-level access is required to manage leave
                            requests.
                        </p>
                    </div>
                </div>
            ) : loading ? (
                <div className="bg-white border border-gray-300 rounded-sm p-12">
                    <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A5F] mb-4"></div>
                        <p className="text-gray-600 text-sm">
                            Loading leave requests...
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Statistics Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white border border-gray-300 p-4 rounded-sm">
                            <div className="text-xs text-gray-600 mb-1">
                                Total Requests
                            </div>
                            <div className="text-xl font-medium text-gray-900">
                                {stats.total}
                            </div>
                            <div className="h-1 w-full bg-gray-200 mt-2">
                                <div className="h-full bg-[#1F3A5F] w-full"></div>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-300 p-4 rounded-sm">
                            <div className="text-xs text-gray-600 mb-1">
                                Pending Review
                            </div>
                            <div className="text-xl font-medium text-gray-900">
                                {stats.pending}
                            </div>
                            <div className="h-1 w-full bg-gray-200 mt-2">
                                <div className="h-full bg-[#B45309] w-full"></div>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-300 p-4 rounded-sm">
                            <div className="text-xs text-gray-600 mb-1">
                                Approved
                            </div>
                            <div className="text-xl font-medium text-gray-900">
                                {stats.accepted}
                            </div>
                            <div className="h-1 w-full bg-gray-200 mt-2">
                                <div className="h-full bg-[#2E7D32] w-full"></div>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-300 p-4 rounded-sm">
                            <div className="text-xs text-gray-600 mb-1">
                                Rejected
                            </div>
                            <div className="text-xl font-medium text-gray-900">
                                {stats.rejected}
                            </div>
                            <div className="h-1 w-full bg-gray-200 mt-2">
                                <div className="h-full bg-[#9B1C1C] w-full"></div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="bg-white border border-gray-300 rounded-sm">
                        {/* Table Header */}
                        <div className="px-6 py-4 border-b border-gray-300">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-medium text-gray-900">
                                        Leave Request Queue
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-0.5">
                                        Showing {filteredDayOffs.length} of{' '}
                                        {dayOffs.length} requests
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex items-center gap-2">
                                        <HiFilter className="text-gray-500 w-4 h-4" />
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) =>
                                                setSelectedStatus(
                                                    e.target.value,
                                                )
                                            }
                                            className="px-3 py-1.5 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
                                        >
                                            <option value="all">
                                                All Status
                                            </option>
                                            <option value="Pending">
                                                Pending
                                            </option>
                                            <option value="Accepted">
                                                Approved
                                            </option>
                                            <option value="Rejected">
                                                Rejected
                                            </option>
                                        </select>
                                    </div>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) =>
                                            setSelectedMonth(e.target.value)
                                        }
                                        className="px-3 py-1.5 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
                                    >
                                        <option value="">All Periods</option>
                                        {availableMonths.map((month) => (
                                            <option key={month} value={month}>
                                                {new Date(
                                                    month + '-01',
                                                ).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                })}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Table Content */}
                        <div className="p-6">
                            {filteredDayOffs.length === 0 ? (
                                <div className="text-center py-16 px-5">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                        <HiOutlineCalendar className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-600 mb-1">
                                        No matching leave requests found
                                    </p>
                                    <p className="text-gray-500 text-sm">
                                        {dayOffs.length === 0
                                            ? 'There are currently no leave requests requiring your approval.'
                                            : 'Adjust filter criteria to see results.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-300">
                                                <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Employee
                                                </th>
                                                <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Start Date
                                                </th>
                                                <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    End Date
                                                </th>
                                                <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Duration
                                                </th>
                                                <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Reason
                                                </th>
                                                <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {filteredDayOffs.map((d) => {
                                                const employeeDisplayName: string =
                                                    getEmployeeDisplayName(d)

                                                const employeeId =
                                                    typeof d.employee_id ===
                                                    'string'
                                                        ? d.employee_id
                                                        : ''

                                                const statusStyle =
                                                    getStatusStyle(d.status)
                                                const typeStyle = getTypeStyle(
                                                    d.day_off_type,
                                                )
                                                const isPending =
                                                    d.status === 'Pending'

                                                return (
                                                    <tr
                                                        key={d._id}
                                                        className="hover:bg-gray-50 transition-colors duration-150"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-sm flex items-center justify-center">
                                                                    <HiOutlineUser className="w-4 h-4 text-gray-500" />
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-gray-900 text-sm">
                                                                        {
                                                                            employeeDisplayName
                                                                        }
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                                        ID:{' '}
                                                                        {employeeId
                                                                            ? `${employeeId.substring(0, 8)}...`
                                                                            : '-'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <span
                                                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border"
                                                                style={{
                                                                    backgroundColor:
                                                                        typeStyle.background,
                                                                    color: typeStyle.color,
                                                                    borderColor:
                                                                        typeStyle.border,
                                                                    borderWidth:
                                                                        '1px',
                                                                }}
                                                            >
                                                                {d.day_off_type ===
                                                                'HALF_DAY' ? (
                                                                    <HiOutlineClock className="w-3 h-3" />
                                                                ) : (
                                                                    <HiOutlineCalendar className="w-3 h-3" />
                                                                )}
                                                                {d.day_off_type ===
                                                                'HALF_DAY'
                                                                    ? 'Half Day'
                                                                    : 'Full Day'}
                                                            </span>
                                                        </td>

                                                        <td className="px-6 py-4 text-sm text-gray-900">
                                                            {formatDate(
                                                                d.start_date_time,
                                                            )}
                                                        </td>

                                                        <td className="px-6 py-4 text-sm text-gray-900">
                                                            {formatDate(
                                                                d.end_date_time,
                                                            )}
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300">
                                                                {d.date_off_number ===
                                                                0.5
                                                                    ? '0.5'
                                                                    : d.date_off_number}{' '}
                                                                day(s)
                                                            </span>
                                                        </td>

                                                        <td className="px-6 py-4 max-w-xs">
                                                            <div
                                                                className="text-sm text-gray-700 truncate"
                                                                title={d.title}
                                                            >
                                                                {d.title}
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <span
                                                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border"
                                                                style={{
                                                                    backgroundColor:
                                                                        statusStyle.background,
                                                                    color: statusStyle.color,
                                                                    borderColor:
                                                                        statusStyle.border,
                                                                    borderWidth:
                                                                        '1px',
                                                                }}
                                                            >
                                                                {d.status}
                                                            </span>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() =>
                                                                        handleApprove(
                                                                            d._id,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        !isPending
                                                                    }
                                                                    className="px-3 py-1.5 bg-white border border-green-600 hover:bg-green-50 text-green-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed rounded-sm text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                                                                >
                                                                    <HiCheck className="w-3 h-3" />
                                                                    Approve
                                                                </button>

                                                                <button
                                                                    onClick={() =>
                                                                        handleReject(
                                                                            d._id,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        !isPending
                                                                    }
                                                                    className="px-3 py-1.5 bg-white border border-red-600 hover:bg-red-50 text-red-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed rounded-sm text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                                                                >
                                                                    <HiX className="w-3 h-3" />
                                                                    Reject
                                                                </button>

                                                                {onView && (
                                                                    <button
                                                                        onClick={() =>
                                                                            onView(
                                                                                d,
                                                                            )
                                                                        }
                                                                        className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-sm text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                                                                    >
                                                                        <HiEye className="w-3 h-3" />
                                                                        Details
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* System Footer */}
            {/* <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm text-gray-500">
                    <div>
                        <span className="font-medium">System:</span> Leave
                        Management Module v2.1
                    </div>
                    <div>
                        <span className="font-medium">Last Updated:</span>{' '}
                        {new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </div>
                </div>
            </div> */}
        </div>
    )
}

export default SupervisorDayOffApproval
