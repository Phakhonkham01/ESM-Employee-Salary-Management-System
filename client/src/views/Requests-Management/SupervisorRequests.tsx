import type { FC, ReactElement } from 'react'
import { useState, useEffect } from 'react'
import { HiCheck, HiX, HiClock, HiCalendar, HiFilter } from 'react-icons/hi'
import {
    getRequestsBySupervisor,
    updateRequestStatus,
    type RequestData,
    type User,
    type ApiResponse,
} from '../../services/requests/api'

// ==================== Helper Functions ====================
const formatDate = (dateString: string): string => {
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    } catch {
        return 'Invalid Date'
    }
}

const formatHour = (hour: number): string => {
    const hours = Math.floor(hour)
    const minutes = Math.round((hour - hours) * 60)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

const calculateDuration = (start: number, end: number): string => {
    const duration = end - start
    return `${duration.toFixed(1)} hours`
}

const getStatusBadgeClass = (status: string): string => {
    const statusMap: Record<string, string> = {
        Pending: 'bg-amber-100 text-amber-800',
        Accept: 'bg-green-100 text-green-800',
        Reject: 'bg-red-100 text-red-800',
    }
    return statusMap[status] || 'bg-gray-100 text-gray-800'
}

const getStatusIcon = (status: string): ReactElement | null => {
    const iconMap: Record<string, ReactElement> = {
        Pending: <HiClock className="inline" size={14} />,
        Accept: <HiCheck className="inline" size={14} />,
        Reject: <HiX className="inline" size={14} />,
    }
    return iconMap[status] || null
}

const getTitleBadgeClass = (title: string): string => {
    return title === 'OT'
        ? 'bg-blue-100 text-blue-800'
        : 'bg-purple-100 text-purple-800'
}

// ==================== Main Component ====================
const SupervisorRequests: FC = () => {
    // State Management
    const [requests, setRequests] = useState<RequestData[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [selectedMonth, setSelectedMonth] = useState<string>('')
    const [selectedStatus, setSelectedStatus] = useState<string>('all')
    const [supervisorId, setSupervisorId] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [userRole, setUserRole] = useState<string>('')

    // Initialize supervisor ID from localStorage
    // Initialize supervisor ID from localStorage
    useEffect(() => {
        console.log('🔄 Initializing supervisor ID...')
        const authData = localStorage.getItem('auth') // Changed from 'user' to 'auth'

        if (authData) {
            try {
                const auth = JSON.parse(authData)
                console.log('🔑 Full Auth data from localStorage:', auth) // DEBUG

                // Now extract the user from the auth object
                const user = auth.user
                console.log('👤 User data:', user)
                console.log('🆔 User ID:', user._id)
                console.log('👔 User Role:', user.role)
                console.log(
                    '👤 User Name:',
                    `${user.first_name_en} ${user.last_name_en}`,
                )

                // ตรวจสอบว่า user มี role เป็น Supervisor หรือไม่
                setUserRole(user.role || '')

                if (user.role !== 'Supervisor') {
                    console.warn('⚠️ User is not a Supervisor:', user.role)
                    setError(
                        'Access denied. Only supervisors can view this page.',
                    )
                    setSupervisorId('') // เคลียร์ supervisorId
                } else if (user._id) {
                    console.log('✅ Setting supervisor ID:', user._id)
                    setSupervisorId(user._id)
                } else {
                    console.error('❌ User has no _id field')
                    setError('User data is invalid: Missing _id')
                }
            } catch (error) {
                console.error('❌ Error parsing auth data:', error)
                console.error('❌ Raw authData:', authData)
                setError('Failed to load user data')
            }
        } else {
            console.warn('⚠️ No auth data in localStorage')
            console.log(
                '📦 Available localStorage items:',
                Object.keys(localStorage),
            )
            setError('Please login to access this page')
        }
    }, [])

    // Fetch requests when supervisor ID is available
    useEffect(() => {
        console.log('📊 supervisorId changed:', supervisorId)
        console.log('📊 supervisorId length:', supervisorId.length)
        console.log(
            '📊 Is supervisorId valid?',
            supervisorId && supervisorId.length > 0,
        )

        if (supervisorId && supervisorId.length > 0) {
            console.log('✅ Supervisor ID available:', supervisorId)
            console.log('✅ Fetching requests...')
            fetchRequests()
        } else {
            console.log('⏸️ Supervisor ID not available yet')
        }
    }, [supervisorId])

    // API Functions
    const fetchRequests = async (): Promise<void> => {
        try {
            setLoading(true)
            setError('')
            console.log('📡 Fetching requests for supervisor:', supervisorId)

            // ตรวจสอบว่า supervisorId ไม่ว่าง
            if (!supervisorId || supervisorId.trim().length === 0) {
                console.error('❌ supervisorId is empty!')
                setError('Supervisor ID is not available. Please login again.')
                return
            }

            const response: ApiResponse<RequestData[]> =
                await getRequestsBySupervisor(supervisorId)
            console.log('📥 API Response:', response)

            // Handle response structure
            if (response && response.requests) {
                console.log('📊 Requests found:', response.requests.length)
                setRequests(response.requests)
            } else {
                console.log('📭 No requests found in response')
                setRequests([])
            }
        } catch (error: any) {
            console.error('❌ Error fetching requests:', error)

            // แสดง error ที่ละเอียดขึ้น
            if (error.message.includes('Network Error')) {
                setError(
                    'Cannot connect to server. Please check if backend is running.',
                )
            } else if (error.message.includes('404')) {
                setError('Supervisor not found or no requests available.')
            } else if (error.message.includes('400')) {
                setError('Invalid supervisor ID. Please login again.')
            } else {
                setError(error.message || 'Failed to fetch requests')
            }

            setRequests([])
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (
        requestId: string,
        newStatus: 'Accept' | 'Reject',
    ): Promise<void> => {
        if (
            !window.confirm(
                `Are you sure you want to ${newStatus.toLowerCase()} this request?`,
            )
        ) {
            return
        }

        try {
            await updateRequestStatus(requestId, newStatus)
            // Refresh the list after successful update
            await fetchRequests()
        } catch (error: any) {
            console.error('Error updating status:', error)
            alert(error.message || 'Failed to update status')
        }
    }

    // Filtering Logic
    const filteredRequests = requests.filter((request) => {
        if (selectedStatus !== 'all' && request.status !== selectedStatus)
            return false
        if (selectedMonth) {
            try {
                const requestMonth = new Date(request.date)
                    .toISOString()
                    .slice(0, 7)
                if (requestMonth !== selectedMonth) return false
            } catch {
                return false
            }
        }
        return true
    })

    // Get unique months for filter dropdown
    const availableMonths = Array.from(
        new Set(
            requests
                .map((req) => {
                    try {
                        return new Date(req.date).toISOString().slice(0, 7)
                    } catch {
                        return ''
                    }
                })
                .filter(Boolean),
        ),
    )
        .sort()
        .reverse()

    // ==================== Render ====================
    return (
        <div className="px-5">
            <div className="bg-white rounded-xl p-8 shadow-sm">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 m-0">
                        📋 Supervisor Requests Management (
                        {filteredRequests.length})
                    </h2>

                    <div className="flex items-center gap-4">
                        {/* Show user role badge */}
                        {userRole && (
                            <span
                                className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                    userRole === 'Supervisor'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                {userRole}
                            </span>
                        )}

                        <button
                            onClick={fetchRequests}
                            disabled={loading || !supervisorId}
                            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                                loading || !supervisorId
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
                            }`}
                        >
                            {loading ? 'Loading...' : 'Refresh'}
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        <div className="font-semibold mb-2">Error</div>
                        <div>{error}</div>
                        {!supervisorId && (
                            <div className="mt-2 text-xs">
                                Please check that you are logged in as a
                                Supervisor.
                            </div>
                        )}
                    </div>
                )}

                {/* Debug Info - Remove in production */}
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <strong>Supervisor ID:</strong>
                            <div className="text-xs font-mono break-all">
                                {supervisorId || 'Not set'}
                            </div>
                        </div>
                        <div>
                            <strong>User Role:</strong> {userRole || 'Unknown'}
                        </div>
                        <div>
                            <strong>Total Requests:</strong> {requests.length}
                        </div>
                        <div>
                            <strong>Filtered:</strong> {filteredRequests.length}
                        </div>
                    </div>
                </div>

                {/* ถ้ายังไม่มี supervisorId */}
                {!supervisorId && !loading && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                        <div className="font-semibold mb-2">
                            ⚠️ Not Logged In as Supervisor
                        </div>
                        <p>
                            Please login with a Supervisor account to view
                            requests.
                        </p>
                        <button
                            onClick={() => {
                                // Redirect to login or refresh page
                                window.location.href = '/login'
                            }}
                            className="mt-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm"
                        >
                            Go to Login
                        </button>
                    </div>
                )}

                {/* Filters Section */}
                {supervisorId && (
                    <>
                        <div className="flex gap-4 mb-6 flex-wrap">
                            {/* Status Filter */}
                            <div className="flex items-center gap-2">
                                <HiFilter className="text-gray-500" />
                                <select
                                    value={selectedStatus}
                                    onChange={(e) =>
                                        setSelectedStatus(e.target.value)
                                    }
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Accept">Accepted</option>
                                    <option value="Reject">Rejected</option>
                                </select>
                            </div>

                            {/* Month Filter */}
                            <div className="flex items-center gap-2">
                                <HiCalendar className="text-gray-500" />
                                <select
                                    value={selectedMonth}
                                    onChange={(e) =>
                                        setSelectedMonth(e.target.value)
                                    }
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                        {/* Content Section */}
                        {loading ? (
                            <LoadingState />
                        ) : filteredRequests.length === 0 ? (
                            <EmptyState
                                hasFilters={
                                    selectedMonth !== '' ||
                                    selectedStatus !== 'all'
                                }
                                totalRequests={requests.length}
                            />
                        ) : (
                            <RequestsTable
                                requests={filteredRequests}
                                onStatusUpdate={handleStatusUpdate}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

// ==================== Sub Components ====================

const LoadingState: FC = () => (
    <div className="text-center py-10 text-gray-500 text-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        Loading requests...
    </div>
)

interface EmptyStateProps {
    hasFilters: boolean
    totalRequests: number
}

const EmptyState: FC<EmptyStateProps> = ({ hasFilters, totalRequests }) => (
    <div className="text-center py-15 px-5 text-gray-500 text-sm">
        <div className="text-5xl mb-4 opacity-50">📋</div>
        <p className="m-0 mb-2">No requests found</p>
        <p className="text-xs text-gray-400">
            {hasFilters
                ? 'Try adjusting your filters'
                : totalRequests === 0
                  ? 'No requests have been submitted to you yet.'
                  : 'All requests filtered out.'}
        </p>
    </div>
)

interface RequestsTableProps {
    requests: RequestData[]
    onStatusUpdate: (
        requestId: string,
        status: 'Accept' | 'Reject',
    ) => Promise<void>
}

const RequestsTable: FC<RequestsTableProps> = ({
    requests,
    onStatusUpdate,
}) => (
    <div className="overflow-x-auto">
        <table className="w-full border-collapse">
            <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-200">
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Employee
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Type
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Date
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Time
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Duration
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Reason
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Status
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody>
                {requests.map((request) => (
                    <RequestRow
                        key={request._id}
                        request={request}
                        onStatusUpdate={onStatusUpdate}
                    />
                ))}
            </tbody>
        </table>
    </div>
)

interface RequestRowProps {
    request: RequestData
    onStatusUpdate: (
        requestId: string,
        status: 'Accept' | 'Reject',
    ) => Promise<void>
}

const RequestRow: FC<RequestRowProps> = ({ request, onStatusUpdate }) => {
    // Check if user_id is populated or is just an ID string
    const getUserName = (): string => {
        if (typeof request.user_id === 'object' && request.user_id !== null) {
            const user = request.user_id as User
            return `${user.first_name_en || ''} ${user.last_name_en || ''}`.trim()
        }
        return 'Unknown User'
    }

    const getUserEmail = (): string => {
        if (typeof request.user_id === 'object' && request.user_id !== null) {
            const user = request.user_id as User
            return user.email || 'No email'
        }
        return 'Unknown'
    }

    return (
        <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200">
            <td className="px-4 py-4 text-sm text-gray-700">
                <div className="font-medium">{getUserName()}</div>
                <div className="text-xs text-gray-500">{getUserEmail()}</div>
            </td>
            <td className="px-4 py-4 text-sm text-gray-700">
                <span
                    className={`px-2.5 py-1 rounded-md text-xs font-medium ${getTitleBadgeClass(request.title)}`}
                >
                    {request.title}
                </span>
            </td>
            <td className="px-4 py-4 text-sm text-gray-700">
                {formatDate(request.date)}
            </td>
            <td className="px-4 py-4 text-sm text-gray-700">
                <div className="font-medium">
                    {formatHour(request.start_hour)} -{' '}
                    {formatHour(request.end_hour)}
                </div>
            </td>
            <td className="px-4 py-4 text-sm text-gray-700">
                <span className="font-medium text-blue-600">
                    {calculateDuration(request.start_hour, request.end_hour)}
                </span>
            </td>
            <td className="px-4 py-4 text-sm text-gray-700">
                <div className="max-w-xs truncate" title={request.reason}>
                    {request.reason || '-'}
                </div>
            </td>
            <td className="px-4 py-4 text-sm text-gray-700">
                <span
                    className={`px-2.5 py-1 rounded-md text-xs font-medium ${getStatusBadgeClass(request.status)}`}
                >
                    {getStatusIcon(request.status)} {request.status}
                </span>
            </td>
            <td className="px-4 py-4 text-sm text-gray-700">
                {request.status === 'Pending' ? (
                    <div className="flex gap-2">
                        <button
                            onClick={() =>
                                onStatusUpdate(request._id, 'Accept')
                            }
                            className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md text-xs font-medium transition-all duration-300 flex items-center gap-1"
                            title="Accept request"
                        >
                            <HiCheck size={14} />
                            Accept
                        </button>
                        <button
                            onClick={() =>
                                onStatusUpdate(request._id, 'Reject')
                            }
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs font-medium transition-all duration-300 flex items-center gap-1"
                            title="Reject request"
                        >
                            <HiX size={14} />
                            Reject
                        </button>
                    </div>
                ) : (
                    <span className="text-xs text-gray-500">No action</span>
                )}
            </td>
        </tr>
    )
}

export default SupervisorRequests
