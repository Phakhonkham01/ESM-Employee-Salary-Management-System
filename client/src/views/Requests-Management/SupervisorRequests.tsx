'use client'

import type { FC, ReactElement } from 'react'
import { useState, useEffect } from 'react'
<<<<<<< HEAD
import {
    HiCheck,
    HiX,
    HiClock,
    HiCalendar,
    HiFilter,
    HiRefresh,
} from 'react-icons/hi'
=======
import { HiCheck, HiX, HiClock, HiCalendar, HiFilter } from 'react-icons/hi'
import { useFullUser } from '@/components/template/useFullUser' // ✅ Use the hook
>>>>>>> a81f90919b11e0e229d79ca6216df748c771d6a2
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
        const date = new Date(dateString)
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()
        return `${day}/${month}/${year}`
    } catch {
        return 'Invalid Date'
    }
}

const formatHour = (hour: string): string => {
    try {
        if (typeof hour === 'number') {
            const hours = Math.floor(hour)
            const minutes = Math.round((hour - hours) * 60)
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        }
        return hour || '--:--'
    } catch {
        return '--:--'
    }
}

const calculateDuration = (
    startHour: string | number,
    endHour: string | number,
): string => {
    try {
        const toMinutes = (time: string | number): number => {
            if (typeof time === 'string') {
                const [hours, minutes] = time.split(':').map(Number)
                return hours * 60 + (minutes || 0)
            } else if (typeof time === 'number') {
                const hours = Math.floor(time)
                const minutes = Math.round((time - hours) * 60)
                return hours * 60 + minutes
            }
            return 0
        }

        const startMinutes = toMinutes(startHour)
        const endMinutes = toMinutes(endHour)

        if (endMinutes <= startMinutes) {
            return '0.0 hrs'
        }

        const durationMinutes = endMinutes - startMinutes
        const durationHours = durationMinutes / 60

        return `${durationHours.toFixed(1)} hrs`
    } catch (error) {
        console.error('Error calculating duration:', error)
        return '0.0 hrs'
    }
}

// ==================== Main Component ====================
const SupervisorRequests: FC = () => {
<<<<<<< HEAD
=======
    // ✅ Use the hook to get user data
    const { fullUser, userId, role } = useFullUser()

    // State Management
>>>>>>> a81f90919b11e0e229d79ca6216df748c771d6a2
    const [requests, setRequests] = useState<RequestData[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [selectedMonth, setSelectedMonth] = useState<string>('')
    const [selectedStatus, setSelectedStatus] = useState<string>('all')
    const [error, setError] = useState<string>('')

<<<<<<< HEAD
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean
        requestId: string
        action: 'Accept' | 'Reject'
        userName: string
        requestType: string
    } | null>(null)
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        const authData = localStorage.getItem('auth')

        if (authData) {
            try {
                const auth = JSON.parse(authData)
                const user = auth.user

                setUserRole(user.role || '')

                if (user.role !== 'Supervisor') {
                    setError(
                        'Access denied. Only supervisors can view this page.',
                    )
                    setSupervisorId('')
                } else if (user._id) {
                    setSupervisorId(user._id)
                } else {
                    setError('User data is invalid: Missing _id')
                }
            } catch (error) {
                console.error('Error parsing auth data:', error)
                setError('Failed to load user data')
            }
        } else {
=======
    // Check if user is supervisor
    const isSupervisor = role === 'Supervisor'
    const supervisorId = isSupervisor ? userId : null

    // ✅ Check authorization on mount
    useEffect(() => {
        console.log('🔄 Checking user authorization...')
        console.log('👤 User ID:', userId)
        console.log('👔 User Role:', role)
        console.log('✅ Is Supervisor:', isSupervisor)

        if (!userId) {
>>>>>>> a81f90919b11e0e229d79ca6216df748c771d6a2
            setError('Please login to access this page')
            return
        }

<<<<<<< HEAD
    useEffect(() => {
        if (supervisorId && supervisorId.length > 0) {
=======
        if (!isSupervisor) {
            setError('Access denied. Only supervisors can view this page.')
            return
        }

        // Clear any previous errors if user is authorized
        setError('')
    }, [userId, role, isSupervisor])

    // ✅ Fetch requests when supervisor ID is available
    useEffect(() => {
        if (supervisorId) {
            console.log('✅ Supervisor ID available:', supervisorId)
>>>>>>> a81f90919b11e0e229d79ca6216df748c771d6a2
            fetchRequests()
        }
    }, [supervisorId])

    const fetchRequests = async (): Promise<void> => {
        if (!supervisorId) {
            console.warn('⚠️ Cannot fetch: No supervisor ID')
            return
        }

        try {
            setLoading(true)
            setError('')

<<<<<<< HEAD
            if (!supervisorId || supervisorId.trim().length === 0) {
                setError('Supervisor ID is not available. Please login again.')
                return
            }

=======
>>>>>>> a81f90919b11e0e229d79ca6216df748c771d6a2
            const response: ApiResponse<RequestData[]> =
                await getRequestsBySupervisor(supervisorId)

            if (response && response.requests) {
                setRequests(response.requests)
            } else {
                setRequests([])
            }
        } catch (error: any) {
<<<<<<< HEAD
=======
            console.error('❌ Error fetching requests:', error)

>>>>>>> a81f90919b11e0e229d79ca6216df748c771d6a2
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

    const openConfirmDialog = (
        requestId: string,
        action: 'Accept' | 'Reject',
        userName: string,
        requestType: string,
    ) => {
        setConfirmDialog({
            isOpen: true,
            requestId,
            action,
            userName,
            requestType,
        })
    }

    const closeConfirmDialog = () => {
        setConfirmDialog(null)
    }

    const handleConfirmAction = async () => {
        if (!confirmDialog) return

        try {
<<<<<<< HEAD
            setActionLoading(true)
            await updateRequestStatus(
                confirmDialog.requestId,
                confirmDialog.action,
            )
=======
            await updateRequestStatus(requestId, newStatus)
>>>>>>> a81f90919b11e0e229d79ca6216df748c771d6a2
            await fetchRequests()
            closeConfirmDialog()
        } catch (error: any) {
            console.error('Error updating status:', error)
            alert(error.message || 'Failed to update status')
        } finally {
            setActionLoading(false)
        }
    }

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

    // Stats
    const pendingCount = requests.filter((r) => r.status === 'Pending').length
    const acceptedCount = requests.filter((r) => r.status === 'Accept').length
    const rejectedCount = requests.filter((r) => r.status === 'Reject').length

<<<<<<< HEAD
    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            {/* Header */}
            {/* <div className="bg-[#1F3A5F] text-white">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-semibold m-0">
                                Supervisor Request Management
                            </h1>
                            <p className="text-[#A0AEC0] text-xs mt-1 m-0">
                                Review and manage employee requests
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {userRole && (
                                <span className="px-3 py-1 bg-[#2D4A6F] rounded text-xs">
                                    {userRole}
                                </span>
                            )}
                            <button
                                onClick={fetchRequests}
                                disabled={loading || !supervisorId}
                                className={`px-4 py-2 rounded text-sm font-medium flex items-center gap-2 transition-colors ${
                                    loading || !supervisorId
                                        ? 'bg-[#2D4A6F] text-[#A0AEC0] cursor-not-allowed'
                                        : 'bg-white text-[#1F3A5F] hover:bg-gray-100'
                                }`}
                            >
                                <HiRefresh
                                    className={loading ? 'animate-spin' : ''}
                                    size={16}
                                />
                                {loading ? 'Loading...' : 'Refresh'}
                            </button>
                        </div>
=======
                    <div className="flex items-center gap-4">
                        {/* Show user info */}
                        {fullUser && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                    {fullUser.first_name_en} {fullUser.last_name_en}
                                </span>
                                <span
                                    className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                        role === 'Supervisor'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {role}
                                </span>
                            </div>
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
>>>>>>> a81f90919b11e0e229d79ca6216df748c771d6a2
                    </div>
                </div>
            </div> */}

            <div className="p-6">
                {/* Error Message */}
                {error && (
<<<<<<< HEAD
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                        <div className="font-semibold mb-1">Error</div>
=======
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        <div className="font-semibold mb-2">⚠️ Error</div>
>>>>>>> a81f90919b11e0e229d79ca6216df748c771d6a2
                        <div>{error}</div>
                    </div>
                )}

<<<<<<< HEAD
                {/* Not Logged In Warning */}
                {!supervisorId && !loading && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
                        <div className="font-semibold mb-2">
                            Not Logged In as Supervisor
                        </div>
                        <p className="m-0">
                            Please login with a Supervisor account to view
                            requests.
                        </p>
                        <button
                            onClick={() => {
                                window.location.href = '/login'
                            }}
                            className="mt-3 px-4 py-2 bg-[#1F3A5F] hover:bg-[#2D4A6F] text-white rounded text-sm transition-colors"
=======
                {/* Not Authorized */}
                {!userId ? (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                        <div className="font-semibold mb-2">
                            ⚠️ Not Logged In
                        </div>
                        <p>Please login to view this page.</p>
                        <button
                            onClick={() => window.location.href = '/sign-in'}
                            className="mt-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm"
>>>>>>> a81f90919b11e0e229d79ca6216df748c771d6a2
                        >
                            Go to Login
                        </button>
                    </div>
<<<<<<< HEAD
                )}

                {supervisorId && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-4 gap-4 mb-6">
                            <div className="bg-white border border-[#E5E7EB] rounded p-4">
                                <div className="text-xs text-[#6B7280] uppercase tracking-wide">
                                    Total Requests
                                </div>
                                <div className="text-2xl font-semibold text-[#1F3A5F] mt-1">
                                    {requests.length}
                                </div>
=======
                ) : !isSupervisor ? (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                        <div className="font-semibold mb-2">
                            🚫 Access Denied
                        </div>
                        <p>Only supervisors can access this page.</p>
                        <p className="text-xs mt-2">Your role: <strong>{role}</strong></p>
                    </div>
                ) : (
                    <>
                        {/* Filters Section */}
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
>>>>>>> a81f90919b11e0e229d79ca6216df748c771d6a2
                            </div>
                            <div className="bg-white border border-[#E5E7EB] rounded p-4">
                                <div className="text-xs text-[#6B7280] uppercase tracking-wide">
                                    Pending
                                </div>
                                <div className="text-2xl font-semibold text-amber-600 mt-1">
                                    {pendingCount}
                                </div>
                            </div>
                            <div className="bg-white border border-[#E5E7EB] rounded p-4">
                                <div className="text-xs text-[#6B7280] uppercase tracking-wide">
                                    Accepted
                                </div>
                                <div className="text-2xl font-semibold text-green-600 mt-1">
                                    {acceptedCount}
                                </div>
                            </div>
                            <div className="bg-white border border-[#E5E7EB] rounded p-4">
                                <div className="text-xs text-[#6B7280] uppercase tracking-wide">
                                    Rejected
                                </div>
                                <div className="text-2xl font-semibold text-red-600 mt-1">
                                    {rejectedCount}
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white border border-[#E5E7EB] rounded mb-6">
                            <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center gap-2">
                                <HiFilter
                                    className="text-[#6B7280]"
                                    size={16}
                                />
                                <span className="text-sm font-medium text-[#374151]">
                                    Filters
                                </span>
                            </div>
                            <div className="p-4 flex gap-4">
                                <div>
                                    <label className="block text-xs text-[#6B7280] mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) =>
                                            setSelectedStatus(e.target.value)
                                        }
                                        className="px-3 py-2 border border-[#E5E7EB] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#1F3A5F] focus:border-[#1F3A5F] min-w-[140px]"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Accept">Accepted</option>
                                        <option value="Reject">Rejected</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-[#6B7280] mb-1">
                                        Month
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <HiCalendar
                                            className="text-[#6B7280]"
                                            size={16}
                                        />
                                        <select
                                            value={selectedMonth}
                                            onChange={(e) =>
                                                setSelectedMonth(e.target.value)
                                            }
                                            className="px-3 py-2 border border-[#E5E7EB] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#1F3A5F] focus:border-[#1F3A5F] min-w-[160px]"
                                        >
                                            <option value="">All Months</option>
                                            {availableMonths.map((month) => (
                                                <option
                                                    key={month}
                                                    value={month}
                                                >
                                                    {new Date(
                                                        month + '-01',
                                                    ).toLocaleDateString(
                                                        'en-US',
                                                        {
                                                            year: 'numeric',
                                                            month: 'long',
                                                        },
                                                    )}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
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
                                onStatusUpdate={openConfirmDialog}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Confirmation Dialog */}
            {confirmDialog?.isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-[400px] shadow-xl">
                        <div
                            className={`px-4 py-3 rounded-t-lg ${
                                confirmDialog.action === 'Accept'
                                    ? 'bg-green-600'
                                    : 'bg-red-600'
                            } text-white`}
                        >
                            <h3 className="text-sm font-semibold m-0">
                                Confirm {confirmDialog.action}
                            </h3>
                        </div>
                        <div className="p-4">
                            <p className="text-sm text-[#374151] m-0 mb-4">
                                Are you sure you want to{' '}
                                <strong>
                                    {confirmDialog.action.toLowerCase()}
                                </strong>{' '}
                                this request?
                            </p>
                            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded p-3 text-sm">
                                <div className="flex justify-between mb-2">
                                    <span className="text-[#6B7280]">
                                        Employee:
                                    </span>
                                    <span className="font-medium text-[#374151]">
                                        {confirmDialog.userName}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#6B7280]">
                                        Request Type:
                                    </span>
                                    <span className="font-medium text-[#374151]">
                                        {confirmDialog.requestType}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 py-3 border-t border-[#E5E7EB] flex justify-end gap-2">
                            <button
                                onClick={closeConfirmDialog}
                                disabled={actionLoading}
                                className="px-4 py-2 border border-[#E5E7EB] rounded text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmAction}
                                disabled={actionLoading}
                                className={`px-4 py-2 rounded text-sm text-white transition-colors flex items-center gap-2 ${
                                    confirmDialog.action === 'Accept'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                {actionLoading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        {confirmDialog.action === 'Accept' ? (
                                            <HiCheck size={16} />
                                        ) : (
                                            <HiX size={16} />
                                        )}
                                        {confirmDialog.action}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// ==================== Sub Components ====================

const LoadingState: FC = () => (
    <div className="bg-white border border-[#E5E7EB] rounded p-10 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#E5E7EB] border-t-[#1F3A5F] mx-auto mb-4"></div>
        <p className="text-sm text-[#6B7280] m-0">Loading requests...</p>
    </div>
)

interface EmptyStateProps {
    hasFilters: boolean
    totalRequests: number
}

const EmptyState: FC<EmptyStateProps> = ({ hasFilters, totalRequests }) => (
    <div className="bg-white border border-[#E5E7EB] rounded p-10 text-center">
        <div className="text-4xl mb-4 opacity-30">
            <HiClock className="mx-auto" size={48} />
        </div>
        <p className="text-sm text-[#374151] m-0 mb-1">No requests found</p>
        <p className="text-xs text-[#6B7280] m-0">
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
        userName: string,
        requestType: string,
    ) => void
}

const RequestsTable: FC<RequestsTableProps> = ({
    requests,
    onStatusUpdate,
}) => (
    <div className="bg-white border border-[#E5E7EB] rounded overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">
                            Employee
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">
                            Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">
                            Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">
                            Time
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">
                            Duration
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">
                            Reason
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">
                            Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">
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
    </div>
)

interface RequestRowProps {
    request: RequestData
    onStatusUpdate: (
        requestId: string,
        status: 'Accept' | 'Reject',
        userName: string,
        requestType: string,
    ) => void
}

const RequestRow: FC<RequestRowProps> = ({ request, onStatusUpdate }) => {
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

    const showFuelInfo = () => {
        if (
            request.title === 'FIELD_WORK' &&
            request.fuel &&
            request.fuel > 0
        ) {
            return (
                <div className="text-xs text-green-600 mt-1">
                    Fuel: {request.fuel.toLocaleString()} ₭
                </div>
            )
        }
        return null
    }

    const displayDate = formatDate(request.date)
    const startTime = formatHour(request.start_hour)
    const endTime = formatHour(request.end_hour)
    const duration = calculateDuration(request.start_hour, request.end_hour)
    const userName = getUserName()

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            Pending: 'bg-amber-50 text-amber-700 border-amber-200',
            Accept: 'bg-green-50 text-green-700 border-green-200',
            Reject: 'bg-red-50 text-red-700 border-red-200',
        }
        const icons: Record<string, ReactElement> = {
            Pending: <HiClock size={12} />,
            Accept: <HiCheck size={12} />,
            Reject: <HiX size={12} />,
        }
        return (
            <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium ${styles[status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}
            >
                {icons[status]} {status}
            </span>
        )
    }

    const getTypeBadge = (title: string) => {
        const isOT = title === 'OT'
        return (
            <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                    isOT
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-purple-50 text-purple-700'
                }`}
            >
                {title}
            </span>
        )
    }

    return (
        <tr className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors">
            <td className="px-4 py-3 text-sm">
                <div className="font-medium text-[#374151]">{userName}</div>
                <div className="text-xs text-[#6B7280]">{getUserEmail()}</div>
            </td>
            <td className="px-4 py-3 text-sm">
                {getTypeBadge(request.title)}
                {showFuelInfo()}
            </td>
            <td className="px-4 py-3 text-sm text-[#374151]">{displayDate}</td>
            <td className="px-4 py-3 text-sm text-[#374151]">
                <span className="font-medium">{startTime}</span>
                <span className="text-[#6B7280] mx-1">-</span>
                <span className="font-medium">{endTime}</span>
            </td>
            <td className="px-4 py-3 text-sm">
                <span className="font-medium text-[#1F3A5F]">{duration}</span>
            </td>
            <td className="px-4 py-3 text-sm text-[#374151]">
                <div className="max-w-[200px] truncate" title={request.reason}>
                    {request.reason || '-'}
                </div>
            </td>
            <td className="px-4 py-3 text-sm">
                {getStatusBadge(request.status)}
            </td>
            <td className="px-4 py-3 text-sm">
                {request.status === 'Pending' ? (
                    <div className="flex gap-2">
                        <button
                            onClick={() =>
                                onStatusUpdate(
                                    request._id,
                                    'Accept',
                                    userName,
                                    request.title,
                                )
                            }
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                        >
                            <HiCheck size={14} />
                            Accept
                        </button>
                        <button
                            onClick={() =>
                                onStatusUpdate(
                                    request._id,
                                    'Reject',
                                    userName,
                                    request.title,
                                )
                            }
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                        >
                            <HiX size={14} />
                            Reject
                        </button>
                    </div>
                ) : (
                    <span className="text-xs text-[#6B7280]">-</span>
                )}
            </td>
        </tr>
    )
}

export default SupervisorRequests