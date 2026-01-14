import React, { useState, useEffect } from 'react'
import { HiCheck, HiX, HiEye, HiRefresh, HiFilter } from 'react-icons/hi'
import axios from 'axios'

/* ================= TYPES ================= */

export interface DayOffItem {
    _id: string
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

// Function to get employee DISPLAY NAME (not ID)
const getEmployeeDisplayName = (employeeData: string | any): string => {
    if (!employeeData) return 'Unknown Employee'

    // If it's already a string (ObjectId or name), check if it looks like an ID
    if (typeof employeeData === 'string') {
        // Check if it's a MongoDB ObjectId (24 hex chars)
        if (/^[0-9a-fA-F]{24}$/.test(employeeData)) {
            return `EMP-${employeeData.substring(0, 6)}...`
        }
        return employeeData
    }

    // If it's an object with populated data
    if (typeof employeeData === 'object' && employeeData !== null) {
        // First priority: Use first_name_en + last_name_en
        const firstName = employeeData.first_name_en || ''
        const lastName = employeeData.last_name_en || ''

        if (firstName && lastName) {
            return `${firstName} ${lastName}`
        } else if (firstName) {
            return firstName
        } else if (lastName) {
            return lastName
        }

        // Second priority: Use email
        if (employeeData.email) {
            return employeeData.email.split('@')[0] // Just the username part
        }

        // Third priority: Use nickname if available
        if (employeeData.nickname_en) {
            return employeeData.nickname_en
        }

        // Fallback: Use employee_id if it exists
        if (employeeData.employee_id) {
            return `EMP-${employeeData.employee_id}`
        }

        // Last resort: Use part of _id
        if (employeeData._id) {
            return `EMP-${employeeData._id.toString().substring(0, 6)}...`
        }
    }

    return 'Unknown Employee'
}

// Function to get employee ID (for display under name)
const getEmployeeId = (employeeData: string | any): string => {
    if (!employeeData) return 'N/A'

    if (typeof employeeData === 'string') {
        return employeeData
    }

    if (typeof employeeData === 'object' && employeeData !== null) {
        // Try to get employee_id field
        if (employeeData.employee_id) {
            return employeeData.employee_id
        }
        // Fallback to _id
        if (employeeData._id) {
            return employeeData._id.toString()
        }
    }

    return 'N/A'
}

// Function to get supervisor name
const getSupervisorName = (supervisorData: string | any): string => {
    if (!supervisorData) return 'Unknown Supervisor'

    if (typeof supervisorData === 'string') {
        // Check if it's a MongoDB ObjectId
        if (/^[0-9a-fA-F]{24}$/.test(supervisorData)) {
            return `SPV-${supervisorData.substring(0, 6)}...`
        }
        return supervisorData
    }

    if (typeof supervisorData === 'object' && supervisorData !== null) {
        // Try to get supervisor name
        const firstName = supervisorData.first_name_en || ''
        const lastName = supervisorData.last_name_en || ''

        if (firstName && lastName) {
            return `${firstName} ${lastName}`
        } else if (firstName) {
            return firstName
        } else if (lastName) {
            return lastName
        }

        // Try email
        if (supervisorData.email) {
            return supervisorData.email.split('@')[0]
        }

        // Try employee_id
        if (supervisorData.employee_id) {
            return `SPV-${supervisorData.employee_id}`
        }

        // Fallback
        if (supervisorData._id) {
            return `SPV-${supervisorData._id.toString().substring(0, 6)}...`
        }
    }

    return 'Unknown Supervisor'
}

/* ================= STYLED COMPONENTS ================= */

const Card = ({
    children,
    className = '',
}: {
    children: React.ReactNode
    className?: string
}) => (
    <div
        className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
    >
        {children}
    </div>
)

const CardHeader = ({ children }: { children: React.ReactNode }) => (
    <div className="px-6 py-4 border-b border-gray-200">{children}</div>
)

const CardBody = ({ children }: { children: React.ReactNode }) => (
    <div className="p-6">{children}</div>
)

const Badge = ({
    children,
    variant = 'primary',
}: {
    children: React.ReactNode
    variant?: string
}) => {
    const variants: Record<string, string> = {
        warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        success: 'bg-green-100 text-green-800 border-green-200',
        danger: 'bg-red-100 text-red-800 border-red-200',
        primary: 'bg-blue-100 text-blue-800 border-blue-200',
    }

    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold border ${variants[variant]}`}
        >
            {children}
        </span>
    )
}

/* ================= STATS CARD ================= */

const StatsCard = ({
    label,
    count,
    icon,
    color,
}: {
    label: string
    count: number
    icon: string
    color: string
}) => (
    <Card>
        <CardBody>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                        {label}
                    </p>
                    <h3 className="text-3xl font-bold" style={{ color }}>
                        {count}
                    </h3>
                </div>
                <div
                    className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${color}15` }}
                >
                    {icon}
                </div>
            </div>
        </CardBody>
    </Card>
)

/* ================= ACTION BUTTON ================= */

const ActionButton = ({
    onClick,
    disabled,
    variant = 'primary',
    icon,
    children,
}: {
    onClick: () => void
    disabled?: boolean
    variant?: 'success' | 'danger' | 'secondary' | 'primary'
    icon?: React.ReactNode
    children: React.ReactNode
}) => {
    const variants = {
        success: 'bg-green-500 hover:bg-green-600 text-white',
        danger: 'bg-red-500 hover:bg-red-600 text-white',
        secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
        primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    }

    return (
        <button
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                ${disabled ? 'bg-gray-300 text-gray-500' : variants[variant]}
            `}
        >
            {icon}
            {children}
        </button>
    )
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

    // ดึง supervisor_id จาก localStorage
    useEffect(() => {
        const authData = localStorage.getItem('auth')
        if (authData) {
            try {
                const auth = JSON.parse(authData)
                const user = auth.user

                console.log('👤 Current user data:', user)

                if (user.role === 'Supervisor' && user._id) {
                    console.log('✅ Supervisor found:', user._id)
                    setSupervisorId(user._id)

                    // Set supervisor name from user data
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
                    console.warn('⚠️ User is not a Supervisor')
                    setError(
                        'Access denied. Only supervisors can view this page.',
                    )
                }
            } catch (error) {
                console.error('❌ Error parsing auth data:', error)
                setError('Failed to load user data')
            }
        } else {
            console.warn('⚠️ No auth data in localStorage')
            setError('Please login to access this page')
        }
    }, [])

    // Fetch data from API
    const fetchDayOffRequests = async () => {
        if (!supervisorId) {
            console.log('⏳ Waiting for supervisor ID...')
            return
        }

        try {
            setLoading(true)
            setError('')

            // ใช้ API ใหม่ที่ส่งข้อมูลผู้คนมาอย่างถูกต้อง
            const response = await axios.get('/api/day-off-requests/allusers')

            console.log('📥 API Response:', response.data)

            if (response.data.success) {
                const allRequests = response.data.requests || []

                // Debug: ดูโครงสร้างข้อมูล
                if (allRequests.length > 0) {
                    console.log('🔍 First request structure:', allRequests[0])
                    console.log(
                        '👤 Employee data type:',
                        typeof allRequests[0].employee_id,
                    )
                    console.log(
                        '👤 Employee data value:',
                        allRequests[0].employee_id,
                    )

                    // Check if we have employee_name field
                    if (allRequests[0].employee_name) {
                        console.log(
                            '✅ We have employee_name:',
                            allRequests[0].employee_name,
                        )
                    }
                }

                // Filter เฉพาะของ supervisor นี้
                const filteredRequests = allRequests.filter((req: any) => {
                    // Try different ways to match supervisor
                    const supervisorIdValue = req.supervisor_id || ''
                    const supervisorNameValue = req.supervisor_name || ''

                    // Check if supervisorId matches
                    if (supervisorIdValue === supervisorId) return true

                    // If it's an object, check _id
                    if (
                        typeof supervisorIdValue === 'object' &&
                        supervisorIdValue._id === supervisorId
                    ) {
                        return true
                    }

                    // Check if current supervisor name matches
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

                console.log('✅ Filtered requests:', filteredRequests.length)
                setDayOffs(filteredRequests)
            } else {
                setError('Failed to fetch data')
                setDayOffs([])
            }
        } catch (err: any) {
            console.error('❌ Error fetching day off requests:', err)
            setError(err.response?.data?.message || 'Network error')
            setDayOffs([])
        } finally {
            setLoading(false)
        }
    }

    // Handle approve
    const handleApprove = async (id: string) => {
        if (!window.confirm('Are you sure you want to approve this request?')) {
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
                alert('Request approved successfully!')
                fetchDayOffRequests()
                if (propOnApprove) propOnApprove(id)
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to approve request')
        }
    }

    // Handle reject
    const handleReject = async (id: string) => {
        if (!window.confirm('Are you sure you want to reject this request?')) {
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
                alert('Request rejected successfully!')
                fetchDayOffRequests()
                if (propOnReject) propOnReject(id)
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to reject request')
        }
    }

    // Fetch เมื่อมี supervisorId
    useEffect(() => {
        if (!propDayOffs && supervisorId) {
            fetchDayOffRequests()
        } else if (propDayOffs) {
            setDayOffs(propDayOffs)
        }
    }, [propDayOffs, supervisorId])

    // Filter data
    const filteredDayOffs = dayOffs.filter((d) => {
        if (selectedStatus !== 'all' && d.status !== selectedStatus)
            return false
        if (selectedMonth) {
            const month = new Date(d.start_date_time).toISOString().slice(0, 7)
            if (month !== selectedMonth) return false
        }
        return true
    })

    // Get available months
    const availableMonths = Array.from(
        new Set(
            dayOffs.map((d) =>
                new Date(d.start_date_time).toISOString().slice(0, 7),
            ),
        ),
    ).sort()

    // Calculate stats
    const stats = {
        pending: dayOffs.filter((d) => d.status === 'Pending').length,
        accepted: dayOffs.filter((d) => d.status === 'Accepted').length,
        rejected: dayOffs.filter((d) => d.status === 'Rejected').length,
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Day Off Management
                        </h1>
                        <p className="text-gray-600">
                            Manage and approve employee day off requests
                        </p>
                    </div>

                    {/* Supervisor Info */}
                    {supervisorName && (
                        <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-800 font-medium">
                                👨‍💼 Supervisor: {supervisorName}
                            </p>
                            <p className="text-xs text-blue-600">
                                Total Requests: {dayOffs.length}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="text-red-500 text-xl">⚠️</div>
                            <div>
                                <p className="font-semibold text-red-800">
                                    Error
                                </p>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                        <button
                            onClick={fetchDayOffRequests}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
                        >
                            <HiRefresh size={16} />
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {!supervisorId && !loading ? (
                <Card>
                    <CardBody>
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="text-5xl mb-4">🔒</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Access Restricted
                            </h3>
                            <p className="text-gray-600 text-center max-w-md mb-6">
                                You need to be logged in as a Supervisor to
                                access this page.
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Reload Page
                            </button>
                        </div>
                    </CardBody>
                </Card>
            ) : loading ? (
                <Card>
                    <CardBody>
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-600 font-medium">
                                Loading day off requests...
                            </p>
                        </div>
                    </CardBody>
                </Card>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <StatsCard
                            label="Pending Requests"
                            count={stats.pending}
                            icon="⏳"
                            color="#f59e0b"
                        />
                        <StatsCard
                            label="Approved"
                            count={stats.accepted}
                            icon="✅"
                            color="#10b981"
                        />
                        <StatsCard
                            label="Rejected"
                            count={stats.rejected}
                            icon="❌"
                            color="#ef4444"
                        />
                    </div>

                    {/* Main Table Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Day Off Requests
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Showing {filteredDayOffs.length} of{' '}
                                        {dayOffs.length} requests for your
                                        approval
                                    </p>
                                </div>

                                {/* Filters */}
                                <div className="flex flex-wrap gap-3">
                                    <div className="flex items-center gap-2">
                                        <HiFilter
                                            className="text-gray-500"
                                            size={18}
                                        />
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) =>
                                                setSelectedStatus(
                                                    e.target.value,
                                                )
                                            }
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                                        >
                                            <option value="all">
                                                All Status
                                            </option>
                                            <option value="Pending">
                                                Pending
                                            </option>
                                            <option value="Accepted">
                                                Accepted
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
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                                    >
                                        <option value="">All Months</option>
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
                        </CardHeader>

                        <CardBody>
                            {filteredDayOffs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                        <span className="text-5xl">📭</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        No Requests Found
                                    </h3>
                                    <p className="text-gray-600 text-center max-w-md">
                                        {dayOffs.length === 0
                                            ? 'You have no day off requests waiting for your approval.'
                                            : 'There are no day off requests matching your filters. Try adjusting your search criteria.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-4 px-4 font-semibold text-xs text-gray-700 uppercase tracking-wider">
                                                    Employee
                                                </th>
                                                <th className="text-left py-4 px-4 font-semibold text-xs text-gray-700 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th className="text-left py-4 px-4 font-semibold text-xs text-gray-700 uppercase tracking-wider">
                                                    Start Date
                                                </th>
                                                <th className="text-left py-4 px-4 font-semibold text-xs text-gray-700 uppercase tracking-wider">
                                                    End Date
                                                </th>
                                                <th className="text-left py-4 px-4 font-semibold text-xs text-gray-700 uppercase tracking-wider">
                                                    Days
                                                </th>
                                                <th className="text-left py-4 px-4 font-semibold text-xs text-gray-700 uppercase tracking-wider">
                                                    Reason
                                                </th>
                                                <th className="text-left py-4 px-4 font-semibold text-xs text-gray-700 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="text-center py-4 px-4 font-semibold text-xs text-gray-700 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {filteredDayOffs.map((d) => {
                                                const isPending =
                                                    d.status === 'Pending'
                                                const statusVariant =
                                                    d.status === 'Pending'
                                                        ? 'warning'
                                                        : d.status ===
                                                            'Accepted'
                                                          ? 'success'
                                                          : 'danger'

                                                // Get employee display name (not ID)
                                                const employeeDisplayName =
                                                    getEmployeeDisplayName(
                                                        d.employee_id,
                                                    )

                                                // Get employee ID for subtext
                                                const employeeId =
                                                    getEmployeeId(d.employee_id)

                                                return (
                                                    <tr
                                                        key={d._id}
                                                        className="hover:bg-gray-50 transition-colors"
                                                    >
                                                        <td className="py-4 px-4">
                                                            <div>
                                                                <span className="font-semibold text-sm text-gray-900 block">
                                                                    {
                                                                        employeeDisplayName
                                                                    }
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    ID:{' '}
                                                                    {employeeId.substring(
                                                                        0,
                                                                        8,
                                                                    )}
                                                                    ...
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <span className="text-sm text-gray-700">
                                                                {d.day_off_type ===
                                                                'HALF_DAY'
                                                                    ? '🕐 Half Day'
                                                                    : '📅 Full Day'}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4 text-sm text-gray-700">
                                                            {formatDate(
                                                                d.start_date_time,
                                                            )}
                                                        </td>
                                                        <td className="py-4 px-4 text-sm text-gray-700">
                                                            {formatDate(
                                                                d.end_date_time,
                                                            )}
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <span className="inline-flex items-center justify-center w-12 h-8 rounded-md bg-blue-50 text-blue-700 font-semibold text-sm">
                                                                {d.date_off_number ===
                                                                0.5
                                                                    ? '0.5'
                                                                    : d.date_off_number}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4 max-w-xs">
                                                            <p
                                                                className="text-sm text-gray-700 truncate"
                                                                title={d.title}
                                                            >
                                                                {d.title}
                                                            </p>
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <Badge
                                                                variant={
                                                                    statusVariant
                                                                }
                                                            >
                                                                {d.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <ActionButton
                                                                    variant="success"
                                                                    disabled={
                                                                        !isPending
                                                                    }
                                                                    onClick={() =>
                                                                        handleApprove(
                                                                            d._id,
                                                                        )
                                                                    }
                                                                    icon={
                                                                        <HiCheck
                                                                            size={
                                                                                14
                                                                            }
                                                                        />
                                                                    }
                                                                >
                                                                    Approve
                                                                </ActionButton>

                                                                <ActionButton
                                                                    variant="danger"
                                                                    disabled={
                                                                        !isPending
                                                                    }
                                                                    onClick={() =>
                                                                        handleReject(
                                                                            d._id,
                                                                        )
                                                                    }
                                                                    icon={
                                                                        <HiX
                                                                            size={
                                                                                14
                                                                            }
                                                                        />
                                                                    }
                                                                >
                                                                    Reject
                                                                </ActionButton>

                                                                {onView && (
                                                                    <ActionButton
                                                                        variant="secondary"
                                                                        onClick={() =>
                                                                            onView(
                                                                                d,
                                                                            )
                                                                        }
                                                                        icon={
                                                                            <HiEye
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />
                                                                        }
                                                                    >
                                                                        View
                                                                    </ActionButton>
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
                        </CardBody>
                    </Card>
                </>
            )}
        </div>
    )
}

export default SupervisorDayOffApproval
