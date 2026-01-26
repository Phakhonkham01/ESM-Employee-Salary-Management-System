'use client'

import type { FC, ReactElement } from 'react'
import { useState, useEffect, useMemo } from 'react'
import {
    HiCheck,
    HiX,
    HiClock,
    HiCalendar,
    HiFilter,
    HiRefresh,
    HiOutlineUser,
    HiChevronLeft,
    HiChevronRight,
} from 'react-icons/hi'
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

const formatHour = (hour: string | number): string => {
    try {
        if (typeof hour === 'number') {
            const hours = Math.floor(hour)
            const minutes = Math.round((hour - hours) * 60)
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        }

        // ถ้าเป็น string ให้ตรวจสอบ format
        if (typeof hour === 'string') {
            if (hour.includes(':')) {
                return hour
            }
            // ถ้าเป็นตัวเลขใน string
            const numHour = parseFloat(hour)
            if (!isNaN(numHour)) {
                const hours = Math.floor(numHour)
                const minutes = Math.round((numHour - hours) * 60)
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
            }
        }

        return hour?.toString() || '--:--'
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
                if (time.includes(':')) {
                    const [hours, minutes] = time.split(':').map(Number)
                    return hours * 60 + (minutes || 0)
                } else {
                    // ถ้าเป็นตัวเลขใน string
                    const numTime = parseFloat(time)
                    if (!isNaN(numTime)) {
                        const hours = Math.floor(numTime)
                        const minutes = Math.round((numTime - hours) * 60)
                        return hours * 60 + minutes
                    }
                }
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
    const [requests, setRequests] = useState<RequestData[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [selectedMonth, setSelectedMonth] = useState<string>('')
    const [selectedStatus, setSelectedStatus] = useState<string>('all')
    const [supervisorId, setSupervisorId] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [userRole, setUserRole] = useState<string>('')
    const [supervisorName, setSupervisorName] = useState<string>('')

    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean
        requestId: string
        action: 'Accept' | 'Reject'
        userName: string
        requestType: string
    } | null>(null)
    const [actionLoading, setActionLoading] = useState(false)

    // 1. เพิ่ม State สำหรับ Pagination
    const [currentPage, setCurrentPage] = useState<number>(1)
    const itemsPerPage = 8 // กำหนดให้แสดงหน้าละ 10 รายการ

    useEffect(() => {
        const authData = localStorage.getItem('auth')

        if (authData) {
            try {
                const auth = JSON.parse(authData)
                const user = auth.user

                setUserRole(user.role || '')

                // ตั้งชื่อ Supervisor
                if (user.first_name_en && user.last_name_en) {
                    setSupervisorName(
                        `${user.first_name_en} ${user.last_name_en}`,
                    )
                } else if (user.first_name && user.last_name) {
                    setSupervisorName(`${user.first_name} ${user.last_name}`)
                } else if (user.email) {
                    setSupervisorName(user.email.split('@')[0])
                } else {
                    setSupervisorName(user.employee_id || 'Supervisor')
                }

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
            setError('Please login to access this page')
        }
    }, [])

    useEffect(() => {
        if (supervisorId && supervisorId.length > 0) {
            fetchRequests()
        }
    }, [supervisorId])

    // 2. Reset หน้าเป็น 1 เมื่อ filter เปลี่ยน
    useEffect(() => {
        setCurrentPage(1)
    }, [selectedMonth, selectedStatus])

    const fetchRequests = async (): Promise<void> => {
        try {
            setLoading(true)
            setError('')

            if (!supervisorId || supervisorId.trim().length === 0) {
                setError('Supervisor ID is not available. Please login again.')
                return
            }

            const response: ApiResponse<RequestData[]> =
                await getRequestsBySupervisor(supervisorId)

            if (response && response.requests) {
                setRequests(response.requests)
            } else {
                setRequests([])
            }
        } catch (error: any) {
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
            setActionLoading(true)
            await updateRequestStatus(
                confirmDialog.requestId,
                confirmDialog.action,
            )
            await fetchRequests()
            closeConfirmDialog()
        } catch (error: any) {
            console.error('Error updating status:', error)
            alert(error.message || 'Failed to update status')
        } finally {
            setActionLoading(false)
        }
    }

    const filteredRequests = useMemo(() => {
        return requests.filter((request) => {
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
    }, [requests, selectedStatus, selectedMonth])

    // 3. คำนวณข้อมูลสำหรับ Pagination
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = filteredRequests.slice(
        indexOfFirstItem,
        indexOfLastItem,
    )
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)

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

    return (
        <div className="min-h-screen bg-[#ffffff] [&>*]:font-semibold">
            <div className="p-2">
                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                        <div className="font-semibold mb-1">Error</div>
                        <div>{error}</div>
                        {!supervisorId && (
                            <div className="mt-2 text-xs">
                                Please check that you are logged in as a
                                Supervisor.
                            </div>
                        )}
                    </div>
                )}

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
                        >
                            Go to Login
                        </button>
                    </div>
                )}

                {supervisorId && (
                    <>
                        {/* Supervisor Info */}
                        {supervisorName && (
                            <div className="mb-6 bg-white border border-gray-300 px-4 py-3 rounded">
                                <div className="flex items-center justify-between">
                                    {/* Left: Supervisor Info */}
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            Supervisor: {supervisorName}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-0.5">
                                            ID: {supervisorId.substring(0, 8)}
                                            ...
                                        </p>
                                    </div>

                                    {/* Right: Filters */}
                                    <div className="flex items-center gap-4">
                                        {/* Status Filter */}
                                        <div>
                                            <select
                                                value={selectedStatus}
                                                onChange={(e) =>
                                                    setSelectedStatus(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                                            >
                                                <option value="all">
                                                    All Status
                                                </option>
                                                <option value="Pending">
                                                    Pending
                                                </option>
                                                <option value="Accept">
                                                    Accepted
                                                </option>
                                                <option value="Reject">
                                                    Rejected
                                                </option>
                                            </select>
                                        </div>

                                        {/* Month Filter */}
                                        <div className="flex items-center gap-2">
                                            <HiCalendar
                                                className="text-[#6B7280]"
                                                size={16}
                                            />
                                            <select
                                                value={selectedMonth}
                                                onChange={(e) =>
                                                    setSelectedMonth(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                                            >
                                                <option value="">
                                                    All Months
                                                </option>
                                                {availableMonths.map(
                                                    
                                                    (month) => (
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
                                                    ),
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Stats Cards */}
                        <div className="grid grid-cols-4 gap-4 mb-6">
                            <div className="bg-[#FFFFFF]/10 border border-none rounded p-4 shadow-sm">
                                <div className="text-xs text-[#6B7280] uppercase tracking-wide">
                                    Total Requests
                                </div>
                                <div className="text-2xl font-semibold text-[#1F3A5F] mt-1">
                                    {filteredRequests.length}
                                </div>
                            </div>
                            <div className="bg-[#76FF70]/10 border border-none rounded p-4 shadow-sm">
                                <div className="text-xs text-[#6B7280] uppercase tracking-wide">
                                    Pending
                                </div>
                                <div className="text-2xl font-semibold text-amber-600 mt-1">
                                    {pendingCount}
                                </div>
                            </div>
                            <div className="bg-[#FEF3C7]/50 border border-none rounded p-4 shadow-sm">
                                <div className="text-xs text-[#6B7280] uppercase tracking-wide">
                                    Accepted
                                </div>
                                <div className="text-2xl font-semibold text-green-600 mt-1">
                                    {acceptedCount}
                                </div>
                            </div>
                            <div className="bg-[#FDE8E8] border border-none rounded p-4 shadow-sm">
                                <div className="text-xs text-[#6B7280] uppercase tracking-wide">
                                    Rejected
                                </div>
                                <div className="text-2xl font-semibold text-red-600 mt-1">
                                    {rejectedCount}
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white border border-none rounded mb-6">
                            {/* <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center gap-2">
                                <HiFilter
                                    className="text-[#6B7280]"
                                    size={16}
                                />
                                <span className="text-sm font-medium text-[#374151]">
                                    Filters
                                </span>
                            </div> */}
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
                            <>
                                <RequestsTable
                                    requests={currentItems}
                                    onStatusUpdate={openConfirmDialog}
                                />

                                {/* 4. เพิ่ม Pagination UI */}
                                {filteredRequests.length > itemsPerPage && (
                                    <div className="mt-6 bg-white border border-[#E5E7EB] rounded-lg px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-gray-600">
                                                Showing{' '}
                                                <span className="font-semibold">
                                                    {Math.min(
                                                        indexOfFirstItem + 1,
                                                        filteredRequests.length,
                                                    )}
                                                </span>{' '}
                                                to{' '}
                                                <span className="font-semibold">
                                                    {Math.min(
                                                        indexOfLastItem,
                                                        filteredRequests.length,
                                                    )}
                                                </span>{' '}
                                                of{' '}
                                                <span className="font-semibold">
                                                    {filteredRequests.length}
                                                </span>{' '}
                                                requests
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Previous Button */}
                                                <button
                                                    onClick={() =>
                                                        setCurrentPage((prev) =>
                                                            Math.max(
                                                                prev - 1,
                                                                1,
                                                            ),
                                                        )
                                                    }
                                                    disabled={currentPage === 1}
                                                    className={`flex items-center gap-1 px-3 py-2 rounded text-sm font-medium ${
                                                        currentPage === 1
                                                            ? 'text-gray-400 cursor-not-allowed'
                                                            : 'text-gray-700 hover:bg-gray-50 hover:text-[#1F3A5F]'
                                                    }`}
                                                >
                                                    <HiChevronLeft size={16} />
                                                    Previous
                                                </button>

                                                {/* Page Numbers */}
                                                <div className="flex items-center gap-1">
                                                    {getPageNumbers().map(
                                                        (pageNum, index) => (
                                                            <div key={index}>
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
                                                                        className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium ${
                                                                            currentPage ===
                                                                            pageNum
                                                                                ? 'bg-[#45cc67] text-white'
                                                                                : 'text-gray-700 hover:bg-gray-50'
                                                                        }`}
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
                                                        setCurrentPage((prev) =>
                                                            Math.min(
                                                                prev + 1,
                                                                totalPages,
                                                            ),
                                                        )
                                                    }
                                                    disabled={
                                                        currentPage ===
                                                        totalPages
                                                    }
                                                    className={`flex items-center gap-1 px-3 py-2 rounded text-sm font-medium ${
                                                        currentPage ===
                                                        totalPages
                                                            ? 'text-gray-400 cursor-not-allowed'
                                                            : 'text-gray-700 hover:bg-gray-50 hover:text-[#1F3A5F]'
                                                    }`}
                                                >
                                                    Next
                                                    <HiChevronRight size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Page Size Selector (Optional) */}
                                        {/* <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <span>Rows per page:</span>
                                                <select
                                                    value={itemsPerPage}
                                                    onChange={(e) => {
                                                        // เปลี่ยน itemsPerPage แล้ว reset กลับไปหน้า 1
                                                        // itemsPerPage ควรเป็น state ถ้าต้องการให้เปลี่ยนได้
                                                        // แต่ถ้าต้องการคงที่ที่ 10 ก็ไม่ต้องมี select นี้
                                                    }}
                                                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                                                >
                                                    <option value={5}>5</option>
                                                    <option value={10}>
                                                        10
                                                    </option>
                                                    <option value={20}>
                                                        20
                                                    </option>
                                                    <option value={50}>
                                                        50
                                                    </option>
                                                </select>
                                            </div>
                                        </div> */}
                                    </div>
                                )}
                            </>
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
                            <div className="bg-[#ffffff] border border-[#E5E7EB] rounded p-3 text-sm">
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
                                className="px-4 py-2 border border-[#E5E7EB] rounded text-sm text-[#374151] hover:bg-[#ffffff] transition-colors"
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
                    <tr className="bg-[#ffffff] border-b border-[#E5E7EB]">
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
    // ฟังก์ชันดึงข้อมูลพนักงาน
    const getEmployeeInfo = () => {
        if (!request.user_id) {
            return {
                name: 'Unknown User',
                email: 'No email',
                employeeId: 'N/A',
            }
        }

        // ถ้า user_id เป็น object
        if (typeof request.user_id === 'object') {
            const user = request.user_id as any

            // ใช้ชื่อจากฟิลด์ที่ backend populate จริงๆ
            const firstName = user.first_name_en || user.first_name || ''
            const lastName = user.last_name_en || user.last_name || ''
            const fullName = `${firstName} ${lastName}`.trim()

            return {
                name: fullName || user.email?.split('@')[0] || 'Unknown User',
                email: user.email || 'No email',
                employeeId:
                    user.employee_id || user._id?.substring(0, 8) || 'N/A',
            }
        }

        // ถ้า user_id เป็น string
        return {
            name: `User-${request.user_id.substring(0, 6)}...`,
            email: 'No email',
            employeeId: request.user_id.substring(0, 8),
        }
    }

    const employeeInfo = getEmployeeInfo()
    const displayDate = formatDate(request.date)
    const startTime = formatHour(request.start_hour)
    const endTime = formatHour(request.end_hour)
    const duration = calculateDuration(request.start_hour, request.end_hour)

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
        const isFieldWork = title === 'FIELD_WORK'
        return (
            <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                    isOT
                        ? 'bg-blue-50 text-blue-700'
                        : isFieldWork
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-gray-50 text-gray-700'
                }`}
            >
                {title === 'OT'
                    ? 'Overtime'
                    : title === 'FIELD_WORK'
                      ? 'Field Work'
                      : title}
            </span>
        )
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

    return (
        <tr className="border-b border-[#E5E7EB] hover:bg-[#ffffff] transition-colors">
            <td className="px-4 py-3 text-sm">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                        <HiOutlineUser className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                        <div className="font-medium text-[#374151]">
                            {employeeInfo.name}
                        </div>
                        <div className="text-xs text-[#6B7280]">
                            {employeeInfo.email}
                        </div>
                        {employeeInfo.employeeId !== 'N/A' && (
                            <div className="text-xs text-[#6B7280] mt-0.5">
                                {/* ID: {employeeInfo.employeeId} */}
                            </div>
                        )}
                    </div>
                </div>
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
            <td className="px-1 py-1 text-sm text-center">
                {request.status === 'Pending' ? (
                    <div className="flex justify-center gap-2">
                        <button
                            onClick={() =>
                                onStatusUpdate(
                                    request._id,
                                    'Accept',
                                    employeeInfo.name,
                                    request.title,
                                )
                            }
                            className="inline-flex items-center justify-center px-3 py-2 bg-[#1BC570] hover:bg-[#0BB8B0] text-white text-sm font-semibold rounded transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                        >
                            <HiCheck className="mr-2" size={14} />
                            Accept
                        </button>
                        <button
                            onClick={() =>
                                onStatusUpdate(
                                    request._id,
                                    'Reject',
                                    employeeInfo.name,
                                    request.title,
                                )
                            }
                            className="inline-flex items-center justify-center px-3 py-2 bg-[#F64E60] hover:bg-[#EE2D41] text-white text-sm font-semibold rounded transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                        >
                            <HiX className="mr-2" size={14} />
                            Reject
                        </button>
                    </div>
                ) : (
                    <span className="text-xs text-gray-400">-</span>
                )}
            </td>
        </tr>
    )
}

export default SupervisorRequests
