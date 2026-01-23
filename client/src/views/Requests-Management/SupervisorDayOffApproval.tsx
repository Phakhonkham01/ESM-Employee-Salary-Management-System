import React, { useState, useEffect, useMemo } from 'react'
import {
    HiCheck,
    HiX,
    HiEye,
    HiRefresh,
    HiFilter,
    HiOutlineUser,
    HiOutlineCalendar,
    HiOutlineClock,
    HiChevronLeft,
    HiChevronRight,
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

    // 1. เพิ่ม State สำหรับ Pagination
    const [currentPage, setCurrentPage] = useState<number>(1)
    const itemsPerPage = 8 // กำหนดให้แสดงหน้าละ 8 รายการ

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

    // 2. Reset หน้าเป็น 1 เมื่อ filter เปลี่ยน
    useEffect(() => {
        setCurrentPage(1)
    }, [selectedStatus, selectedMonth])

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

    const filteredDayOffs = useMemo(() => {
        return dayOffs.filter((d) => {
            if (selectedStatus !== 'all' && d.status !== selectedStatus)
                return false
            if (selectedMonth) {
                const month = new Date(d.start_date_time)
                    .toISOString()
                    .slice(0, 7)
                if (month !== selectedMonth) return false
            }
            return true
        })
    }, [dayOffs, selectedStatus, selectedMonth])

    // 3. คำนวณข้อมูลสำหรับ Pagination
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = filteredDayOffs.slice(
        indexOfFirstItem,
        indexOfLastItem,
    )
    const totalPages = Math.ceil(filteredDayOffs.length / itemsPerPage)

    // ฟังก์ชันสำหรับสร้าง array ของ page numbers
    const getPageNumbers = () => {
        const pageNumbers = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages) {
            // ถ้ามีหน้าทั้งหมดน้อยกว่าหรือเท่ากับ 5 แสดงทุกหน้า
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i)
            }
        } else {
            // ถ้ามีหน้ามากกว่า 5 แสดงแบบมี ellipsis
            if (currentPage <= 3) {
                // หน้า 1-3: แสดงหน้า 1-5
                for (let i = 1; i <= 5; i++) {
                    pageNumbers.push(i)
                }
                pageNumbers.push('...')
                pageNumbers.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                // หน้าสุดท้าย: แสดงหน้าแรก, ..., และ 5 หน้าสุดท้าย
                pageNumbers.push(1)
                pageNumbers.push('...')
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pageNumbers.push(i)
                }
            } else {
                // ตรงกลาง: แสดงหน้าแรก, ..., หน้าปัจจุบัน±1, ..., หน้าสุดท้าย
                pageNumbers.push(1)
                pageNumbers.push('...')
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pageNumbers.push(i)
                }
                pageNumbers.push('...')
                pageNumbers.push(totalPages)
            }
        }

        return pageNumbers
    }

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
        <div className="min-h-screen bg-gray-50 p-2 font-sans [&>*]:font-semibold">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex justify-between items-start">
                    {supervisorName && (
                        <div className="bg-white border border-gray-300 px-4 py-2 rounded-sm flex items-center justify-between w-full">
                            {/* Left: Supervisor Info */}
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    Supervisor: {supervisorName}
                                </p>
                                <p className="text-xs text-gray-600 mt-0.5">
                                    ID: {supervisorId.substring(0, 8)}...
                                </p>
                            </div>

                            {/* Right: Filters */}
                            <div className="flex items-center gap-3 ml-auto">
                                <div className="flex items-center gap-2">
                                    <HiFilter className="text-gray-500 w-4 h-4" />
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) =>
                                            setSelectedStatus(e.target.value)
                                        }
                                        className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="Pending">Pending</option>
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
                                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
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
                    )}
                </div>
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
                        <div className="bg-[#FFFFFF]/10 border border-none rounded p-4 shadow-sm">
                            <div className="text-xs text-gray-600 mb-1">
                                Total Requests
                            </div>
                            <div className="text-xl font-medium text-gray-900">
                                {filteredDayOffs.length}
                            </div>
                            <div className="h-1 w-full bg-gray-200 mt-2">
                                <div className="h-full bg-[#1F3A5F] w-full"></div>
                            </div>
                        </div>
                        <div className="bg-[#FEF3C7]/50 border border-none rounded p-4">
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
                        <div className="bg-[#76FF70]/10 border border-none rounded p-4">
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
                        <div className="bg-[#FDE8E8] border border-none rounded p-4">
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
                        {/* Table Content */}
                        <div className="p-6">
                            {currentItems.length === 0 ? (
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
                                <>
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
                                                {currentItems.map((d) => {
                                                    const employeeDisplayName: string =
                                                        getEmployeeDisplayName(
                                                            d,
                                                        )

                                                    const employeeId =
                                                        typeof d.employee_id ===
                                                        'string'
                                                            ? d.employee_id
                                                            : ''

                                                    const statusStyle =
                                                        getStatusStyle(d.status)
                                                    const typeStyle =
                                                        getTypeStyle(
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
                                                                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
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
                                                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium border"
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
                                                                <span className="px-3 py-1.5 border border-gray-300 rounded-md text-sm">
                                                                    {d.date_off_number ===
                                                                    0.5
                                                                        ? '0.5'
                                                                        : d.date_off_number}{' '}
                                                                    day(s)
                                                                </span>
                                                            </td>

                                                            <td className="px-6 py-4 max-w-xs relative group">
                                                                <div
                                                                    className="text-sm text-gray-700 truncate cursor-pointer"
                                                                    title={
                                                                        d.title
                                                                    } // fallback native tooltip
                                                                >
                                                                    {d.title}
                                                                </div>
                                                                {/* Tooltip */}
                                                                <div className="absolute left-0 bottom-full mb-1 w-max max-w-xs bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal z-50">
                                                                    {d.title}
                                                                </div>
                                                            </td>

                                                            <td className="px-6 py-4">
                                                                <span
                                                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium border"
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
                                                                    {/* Approve Button */}
                                                                    <button
                                                                        onClick={() =>
                                                                            handleApprove(
                                                                                d._id,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            !isPending
                                                                        }
                                                                        className="group inline-flex items-center justify-center px-3 py-2 bg-[#1BC570] hover:bg-[#0BB8B0] disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 text-sm font-semibold rounded transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98] border border-[#1BC5BD] hover:border-[#0BB8B0] disabled:border-gray-300 min-h-[34px]"
                                                                    >
                                                                        <HiCheck className="mr-1.5 transition-transform group-hover:scale-110 w-3 h-3" />
                                                                        <span className="transition-all group-hover:tracking-wide">
                                                                            Approve
                                                                        </span>
                                                                    </button>

                                                                    {/* Reject Button */}
                                                                    <button
                                                                        onClick={() =>
                                                                            handleReject(
                                                                                d._id,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            !isPending
                                                                        }
                                                                        className="group inline-flex items-center justify-center px-3 py-2 bg-[#F64E60] hover:bg-[#EE2D41] disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 text-sm font-semibold rounded transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98] border border-[#F64E60] hover:border-[#EE2D41] disabled:border-gray-300 min-h-[34px]"
                                                                    >
                                                                        <HiX className="mr-1.5 transition-transform group-hover:scale-110 w-3 h-3" />
                                                                        <span className="transition-all group-hover:tracking-wide">
                                                                            Reject
                                                                        </span>
                                                                    </button>

                                                                    {/* View Details Button */}
                                                                    {onView && (
                                                                        <button
                                                                            onClick={() =>
                                                                                onView(
                                                                                    d,
                                                                                )
                                                                            }
                                                                            className="group inline-flex items-center justify-center px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98] border border-gray-300 hover:border-gray-400 min-h-[34px]"
                                                                        >
                                                                            <HiEye className="mr-1.5 transition-transform group-hover:scale-110 w-3 h-3" />
                                                                            <span className="transition-all group-hover:tracking-wide">
                                                                                Details
                                                                            </span>
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

                                    {/* 4. เพิ่ม Pagination UI */}
                                    {filteredDayOffs.length > itemsPerPage && (
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                {/* Info Text */}
                                                <div className="text-sm text-gray-600">
                                                    Showing{' '}
                                                    <span className="font-semibold text-gray-900">
                                                        {Math.min(
                                                            indexOfFirstItem +
                                                                1,
                                                            filteredDayOffs.length,
                                                        )}
                                                    </span>{' '}
                                                    to{' '}
                                                    <span className="font-semibold text-gray-900">
                                                        {Math.min(
                                                            indexOfLastItem,
                                                            filteredDayOffs.length,
                                                        )}
                                                    </span>{' '}
                                                    of{' '}
                                                    <span className="font-semibold text-gray-900">
                                                        {filteredDayOffs.length}
                                                    </span>{' '}
                                                    requests
                                                </div>

                                                {/* Pagination Controls */}
                                                <div className="flex items-center gap-2">
                                                    {/* Previous Button */}
                                                    <button
                                                        onClick={() =>
                                                            setCurrentPage(
                                                                (prev) =>
                                                                    Math.max(
                                                                        prev -
                                                                            1,
                                                                        1,
                                                                    ),
                                                            )
                                                        }
                                                        disabled={
                                                            currentPage === 1
                                                        }
                                                        className={`inline-flex items-center justify-center p-2 rounded-md border ${
                                                            currentPage === 1
                                                                ? 'text-gray-400 border-gray-300 bg-gray-50 cursor-not-allowed'
                                                                : 'text-gray-700 border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400'
                                                        } transition-colors`}
                                                    >
                                                        <HiChevronLeft className="w-4 h-4" />
                                                    </button>

                                                    {/* Page Numbers */}
                                                    <div className="flex items-center gap-1">
                                                        {getPageNumbers().map(
                                                            (
                                                                pageNum,
                                                                index,
                                                            ) => (
                                                                <div
                                                                    key={index}
                                                                >
                                                                    {pageNum ===
                                                                    '...' ? (
                                                                        <span className="px-2 py-1 text-gray-400">
                                                                            ...
                                                                        </span>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() =>
                                                                                setCurrentPage(
                                                                                    Number(
                                                                                        pageNum,
                                                                                    ),
                                                                                )
                                                                            }
                                                                            className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium border ${
                                                                                currentPage ===
                                                                                pageNum
                                                                                    ? 'bg-[#45cc67] text-white border-none'
                                                                                    : 'text-gray-700 border-gray-300 bg-white hover:bg-gray-50'
                                                                            } transition-colors`}
                                                                        >
                                                                            {
                                                                                pageNum
                                                                            }
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>

                                                    {/* Next Button */}
                                                    <button
                                                        onClick={() =>
                                                            setCurrentPage(
                                                                (prev) =>
                                                                    Math.min(
                                                                        prev +
                                                                            1,
                                                                        totalPages,
                                                                    ),
                                                            )
                                                        }
                                                        disabled={
                                                            currentPage ===
                                                            totalPages
                                                        }
                                                        className={`inline-flex items-center justify-center p-2 rounded-md border ${
                                                            currentPage ===
                                                            totalPages
                                                                ? 'text-gray-400 border-gray-300 bg-gray-50 cursor-not-allowed'
                                                                : 'text-gray-700 border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400'
                                                        } transition-colors`}
                                                    >
                                                        <HiChevronRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default SupervisorDayOffApproval
