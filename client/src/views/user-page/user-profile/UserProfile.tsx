import { UserData } from '@/services/User_Page/user_api'
import { useState, useEffect } from 'react'
import RequestModule from './module/RequestModule'
import DayOffModule from './module/DayOffModule'
import { getAllDayOffRequests, type DayOffRequest } from '@/services/Day_off_api/api'

import {
    MdEmail,
    MdCake,
    MdOutlineWork,
    MdOutlineCalendarToday,
    MdOutlineAccessTime,
    MdOutlineDashboard,
    MdOutlineReceipt,
} from 'react-icons/md'
import {
    PiGenderIntersex,
    PiBuildingOfficeLight,
    PiFinnTheHumanLight,
    PiMoneyFill,
    PiTextAa,
    PiChartLineUp,
    PiUsers,
    PiClock,
    PiCalendarBlank
} from 'react-icons/pi'
import {
    MdOutlineDriveFileRenameOutline,
    MdOutlineRequestQuote
} from 'react-icons/md'

// Dashboard statistics interface
interface DashboardStats {
    totalRequests: number
    acceptedRequests: number
    pendingRequests: number
    remainingDayOffs: number
    totalOTHours: number
    rejectedRequests: number
}

import {
    User,
    ChevronDown,
    ChevronUp,
    Eye,
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    Trash2,
} from 'lucide-react'
import axios from 'axios'
import moment from 'moment'

type Props = {
    user: UserData
}

// Interface สำหรับข้อมูลเงินเดือน
interface Salary {
    _id: string
    user_id: {
        _id: string
        first_name_en: string
        last_name_en: string
        email: string
        department_id?: {
            name: string
        }
        position_id?: {
            name: string
        }
    }
    month: number
    year: number
    base_salary: number
    ot_amount: number
    bonus: number
    commission: number
    fuel_costs: number
    money_not_spent_on_holidays: number
    other_income: number
    office_expenses: number
    social_security: number
    working_days: number
    day_off_days: number
    remaining_vacation_days: number
    net_salary: number
    status: 'pending' | 'approved' | 'paid' | 'cancelled'
    created_by: {
        first_name_en: string
        last_name_en: string
    }
    notes?: string
    payment_date: string
    created_at: string
    updated_at: string
}

// Helper Components
const ProfileField = ({ label, value, icon }: { label: string; value?: string; icon: React.ReactNode }) => (
    <div className="bg-slate-50 rounded-lg p-4">
        <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
            {icon}
            <span>{label}</span>
        </div>
        <div className="text-slate-900 font-semibold">{value || 'N/A'}</div>
    </div>
)

const QuickActions = ({ actions }: { actions: Array<{ icon: React.ReactNode; label: string; color: string; onClick: () => void }> }) => (
    <div className="bg-white rounded-xl p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
            {actions.map((action, idx) => (
                <button
                    key={idx}
                    onClick={action.onClick}
                    className={`${action.color} hover:opacity-90 text-white rounded-lg p-4 transition-all transform hover:scale-105`}
                >
                    <div className="flex flex-col items-center gap-2">
                        {action.icon}
                        <span className="text-sm font-medium">{action.label}</span>
                    </div>
                </button>
            ))}
        </div>
    </div>
)

const ActionButton = ({ label, onClick, icon }: { label: string; onClick: () => void; icon: React.ReactNode }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
    >
        {icon}
        {label}
    </button>
)

const formatDate = (date?: string) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

const UserDashboard = ({ user }: Props) => {

    const [openDayOff, setOpenDayOff] = useState(false)
    const [openRequest, setOpenRequest] = useState(false)
    const [requestType, setRequestType] = useState<'OT' | 'FIELD_WORK'>('OT')
    const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'requests' | 'viewpayslip'>('overview')

    // Salary states
    const [salaries, setSalaries] = useState<Salary[]>([])
    const [filteredSalaries, setFilteredSalaries] = useState<Salary[]>([])
    const [loadingSalaries, setLoadingSalaries] = useState(false)
    const [salaryError, setSalaryError] = useState<string | null>(null)
    const [expandedRows, setExpandedRows] = useState<string[]>([])

    // Day off requests state
    const [dayOffRequests, setDayOffRequests] = useState<DayOffRequest[]>([])
    const [loadingDayOffs, setLoadingDayOffs] = useState(false)

    // Fetch day off requests
    const fetchDayOffRequests = async () => {
        try {
            setLoadingDayOffs(true)
            const response = await getAllDayOffRequests()

            if (response && response.requests) {
                // Filter requests for current user - Fixed: compare user_id with user._id
                const userRequests = response.requests.filter(
                    (request: DayOffRequest) => request._id === user._id
                )
                setDayOffRequests(userRequests)

                // Calculate statistics from the requests
                const totalRequests = userRequests.length
                const acceptedRequests = userRequests.filter(
                    (req: DayOffRequest) => req.status === 'Accepted'
                ).length
                const pendingRequests = userRequests.filter(
                    (req: DayOffRequest) => req.status === 'Pending'
                ).length
                const rejectedRequests = userRequests.filter(
                    (req: DayOffRequest) => req.status === 'Rejected'
                ).length
            }
        } catch (error) {
            console.error('Error fetching day off requests:', error)
        } finally {
            setLoadingDayOffs(false)
        }
    }

    // Fetch salary data
    const fetchSalaries = async () => {
        try {
            setLoadingSalaries(true)
            setSalaryError(null)

            const response = await axios.get('/api/salaries', {
                params: { userId: user._id }
            })

            if (response.data && response.data.salaries) {
                setSalaries(response.data.salaries)
                setFilteredSalaries(response.data.salaries)
            }
        } catch (err: any) {
            setSalaryError(
                err.response?.data?.message || 'Failed to load salary history'
            )
            console.error('Error fetching salaries:', err)
        } finally {
            setLoadingSalaries(false)
        }
    }

    // Fetch dashboard data on mount
    useEffect(() => {
        fetchDayOffRequests()
    }, [user])

    // Fetch salaries when viewpayslip tab is active
    useEffect(() => {
        if (activeTab === 'viewpayslip') {
            fetchSalaries()
        }
    }, [activeTab, user])

    // Get month name
    const getMonthName = (monthNum: number) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ]
        return months[monthNum - 1] || ''
    }

    // Get status color and icon
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending':
                return {
                    color: 'bg-yellow-100 text-yellow-800',
                    icon: <Clock className="w-4 h-4" />,
                    label: 'Pending',
                }
            case 'approved':
                return {
                    color: 'bg-blue-100 text-blue-800',
                    icon: <CheckCircle className="w-4 h-4" />,
                    label: 'Approved',
                }
            case 'paid':
                return {
                    color: 'bg-green-100 text-green-800',
                    icon: <CheckCircle className="w-4 h-4" />,
                    label: 'Paid',
                }
            case 'cancelled':
                return {
                    color: 'bg-red-100 text-red-800',
                    icon: <XCircle className="w-4 h-4" />,
                    label: 'Cancelled',
                }
            default:
                return {
                    color: 'bg-gray-100 text-gray-800',
                    icon: <Clock className="w-4 h-4" />,
                    label: 'Unknown',
                }
        }
    }

    // Calculate total
    const calculateTotal = (field: keyof Salary) => {
        return filteredSalaries.reduce(
            (sum, salary) => sum + ((salary[field] as number) || 0),
            0
        )
    }

    // Toggle row expansion
    const toggleRow = (id: string) => {
        if (expandedRows.includes(id)) {
            setExpandedRows(expandedRows.filter((rowId) => rowId !== id))
        } else {
            setExpandedRows([...expandedRows, id])
        }
    }

    // Quick actions data
    const quickActions = [
        {
            icon: <MdOutlineRequestQuote className="text-xl" />,
            label: 'New OT Request',
            description: 'Submit overtime request',
            color: 'bg-blue-500',
            onClick: () => { setRequestType('OT'); setOpenRequest(true); }
        },
        {
            icon: <MdOutlineWork className="text-xl" />,
            label: 'Field Work',
            description: 'Request field work',
            color: 'bg-green-500',
            onClick: () => { setRequestType('FIELD_WORK'); setOpenRequest(true); }
        },
        {
            icon: <PiCalendarBlank className="text-xl" />,
            label: 'Day Off',
            description: 'Request time off',
            color: 'bg-purple-500',
            onClick: () => setOpenDayOff(true)
        },
        {
            icon: <MdOutlineReceipt className="text-xl" />,
            label: 'View Payslip',
            description: 'Latest salary details',
            color: 'bg-amber-500',
            onClick: () => setActiveTab('viewpayslip')
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
            {/* Main Dashboard Container */}
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header with User Info */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full border-4 border-white shadow-lg overflow-hidden">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user.first_name_en}+${user.last_name_en}&background=2563EB&color=fff&size=128`}
                                    alt="User Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">
                                    {user.first_name_en} {user.last_name_en}
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <span className="w-2 h-2 rounded-full mr-2 bg-green-500" />
                                        {user.status}
                                    </span>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Navigation Tabs */}
                <div className="bg-white rounded-2xl shadow-lg">
                    <div className="border-b border-slate-200">
                        <nav className="flex overflow-x-auto">
                            {[
                                { id: 'overview', label: 'Overview', icon: <MdOutlineDashboard /> },
                                { id: 'profile', label: 'Profile', icon: <PiFinnTheHumanLight /> },
                                { id: 'requests', label: 'Requests', icon: <MdOutlineRequestQuote /> },
                                { id: 'viewpayslip', label: 'ViewPayslip', icon: <MdOutlineCalendarToday /> }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600 bg-blue-50'
                                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                        }`}
                                >
                                    <span>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Dashboard Content */}
                    <div className="p-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Quick Actions & Department Summary Side by Side */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <QuickActions actions={quickActions} />
                                    {/* Department Summary */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-slate-900">Department Overview</h3>
                                            <PiUsers className="text-2xl text-blue-600" />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600">Department</span>
                                                <span className="font-semibold">{user.department_id?.department_name || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600">Position</span>
                                                <span className="font-semibold">{user.position_id?.position_name || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600">Base Salary</span>
                                                <span className="font-semibold text-green-600">
                                                    {user.base_salary?.toLocaleString()}₭
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                {/* Profile Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ProfileField
                                        label="Full Name"
                                        value={`${user.first_name_en} ${user.last_name_en}`}
                                        icon={<PiTextAa />}
                                    />
                                    <ProfileField
                                        label="Nickname"
                                        value={user.nickname_en}
                                        icon={<MdOutlineDriveFileRenameOutline />}
                                    />
                                    <ProfileField
                                        label="Email"
                                        value={user.email}
                                        icon={<MdEmail />}
                                    />
                                    <ProfileField
                                        label="Date of Birth"
                                        value={formatDate(user.date_of_birth)}
                                        icon={<MdCake />}
                                    />
                                    <ProfileField
                                        label="Gender"
                                        value={user.gender}
                                        icon={<PiGenderIntersex />}
                                    />
                                    <ProfileField
                                        label="Department"
                                        value={user.department_id?.department_name}
                                        icon={<PiBuildingOfficeLight />}
                                    />
                                    <ProfileField
                                        label="Position"
                                        value={user.position_id?.position_name}
                                        icon={<PiFinnTheHumanLight />}
                                    />
                                    <ProfileField
                                        label="Base Salary"
                                        value={`${user.base_salary?.toLocaleString()}₭`}
                                        icon={<PiMoneyFill />}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'requests' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-slate-900">Requests</h3>
                                    <div className="flex gap-2">
                                        <ActionButton
                                            label="New OT Request"
                                            onClick={() => { setRequestType('OT'); setOpenRequest(true); }}
                                            icon={<MdOutlineAccessTime />}
                                        />
                                        <ActionButton
                                            label="Field Work Request"
                                            onClick={() => { setRequestType('FIELD_WORK'); setOpenRequest(true); }}
                                            icon={<MdOutlineWork />}
                                        />
                                        <ActionButton
                                            label="Request Day Off"
                                            onClick={() => setOpenDayOff(true)}
                                            icon={<MdOutlineCalendarToday />}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'viewpayslip' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-slate-900">Salary History & Payslips</h3>
                                    <div className="text-sm text-slate-600">
                                        Total Records: <span className="font-semibold">{filteredSalaries.length}</span>
                                    </div>
                                </div>

                                {loadingSalaries ? (
                                    <div className="flex justify-center items-center min-h-[400px]">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                                            <span className="text-gray-600 font-medium">Loading salary history...</span>
                                        </div>
                                    </div>
                                ) : salaryError ? (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                                        <p className="text-red-600">{salaryError}</p>
                                    </div>
                                ) : (
                                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Period
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Net Salary
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Payment Date
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {filteredSalaries.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={5} className="px-6 py-12 text-center">
                                                                <div className="flex flex-col items-center gap-2">
                                                                    <FileText className="w-12 h-12 text-gray-400" />
                                                                    <p className="text-gray-500 font-medium">
                                                                        No salary records found
                                                                    </p>
                                                                    <p className="text-sm text-gray-400">
                                                                        Your payslips will appear here once processed
                                                                    </p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        filteredSalaries.map((salary) => {
                                                            const isExpanded = expandedRows.includes(salary._id)
                                                            const statusInfo = getStatusInfo(salary.status)

                                                            return (
                                                                <div key={salary._id}>
                                                                    <tr className={`hover:bg-gray-50 ${isExpanded ? 'bg-blue-50' : ''}`}>
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <div className="text-sm text-gray-900 font-medium">
                                                                                {getMonthName(salary.month)} {salary.year}
                                                                            </div>
                                                                            <div className="text-sm text-gray-500">
                                                                                {salary.working_days} working days
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <div className="text-lg font-bold text-gray-900">
                                                                                ฿{salary.net_salary.toLocaleString()}
                                                                            </div>
                                                                            <div className="text-sm text-gray-500">
                                                                                Base: ฿{salary.base_salary.toLocaleString()}
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                                                {statusInfo.icon}
                                                                                {statusInfo.label}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                            {moment(salary.payment_date).format('DD/MM/YYYY')}
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                            <div className="flex items-center gap-2">
                                                                                <button
                                                                                    onClick={() => toggleRow(salary._id)}
                                                                                    className="text-blue-600 hover:text-blue-900 p-1"
                                                                                    title={isExpanded ? 'Hide details' : 'Show details'}
                                                                                >
                                                                                    {isExpanded ? (
                                                                                        <ChevronUp className="w-5 h-5" />
                                                                                    ) : (
                                                                                        <ChevronDown className="w-5 h-5" />
                                                                                    )}
                                                                                </button>
                                                                                <button
                                                                                    className="text-green-600 hover:text-green-900 p-1"
                                                                                    title="View details"
                                                                                >
                                                                                    <Eye className="w-5 h-5" />
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>

                                                                    {isExpanded && (
                                                                        <tr className="bg-blue-50">
                                                                            <td colSpan={5} className="px-6 py-4">
                                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                                    {/* Income Details */}
                                                                                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                                                                                        <h4 className="text-sm font-bold text-blue-700 mb-3 uppercase">
                                                                                            Income Breakdown
                                                                                        </h4>
                                                                                        <div className="space-y-2">
                                                                                            <div className="flex justify-between py-1">
                                                                                                <span className="text-gray-700">Base Salary:</span>
                                                                                                <span className="font-semibold text-gray-900">
                                                                                                    ฿{salary.base_salary.toLocaleString()}
                                                                                                </span>
                                                                                            </div>
                                                                                            <div className="flex justify-between py-1">
                                                                                                <span className="text-gray-700">OT Amount:</span>
                                                                                                <span className="font-semibold text-gray-900">
                                                                                                    ฿{salary.ot_amount.toLocaleString()}
                                                                                                </span>
                                                                                            </div>
                                                                                            <div className="flex justify-between py-1">
                                                                                                <span className="text-gray-700">Bonus:</span>
                                                                                                <span className="font-semibold text-gray-900">
                                                                                                    ฿{salary.bonus.toLocaleString()}
                                                                                                </span>
                                                                                            </div>
                                                                                            <div className="flex justify-between py-1">
                                                                                                <span className="text-gray-700">Commission:</span>
                                                                                                <span className="font-semibold text-gray-900">
                                                                                                    ฿{salary.commission.toLocaleString()}
                                                                                                </span>
                                                                                            </div>
                                                                                            <div className="flex justify-between py-1">
                                                                                                <span className="text-gray-700">Fuel Costs:</span>
                                                                                                <span className="font-semibold text-gray-900">
                                                                                                    ฿{salary.fuel_costs.toLocaleString()}
                                                                                                </span>
                                                                                            </div>
                                                                                            <div className="flex justify-between py-1">
                                                                                                <span className="text-gray-700">Holiday Money:</span>
                                                                                                <span className="font-semibold text-gray-900">
                                                                                                    ฿{salary.money_not_spent_on_holidays.toLocaleString()}
                                                                                                </span>
                                                                                            </div>
                                                                                            <div className="flex justify-between py-1">
                                                                                                <span className="text-gray-700">Other Income:</span>
                                                                                                <span className="font-semibold text-gray-900">
                                                                                                    ฿{salary.other_income.toLocaleString()}
                                                                                                </span>
                                                                                            </div>
                                                                                            <div className="border-t border-blue-200 my-2 pt-2">
                                                                                                <div className="flex justify-between font-bold text-blue-900">
                                                                                                    <span>Total Income:</span>
                                                                                                    <span>
                                                                                                        ฿{(
                                                                                                            salary.base_salary +
                                                                                                            salary.ot_amount +
                                                                                                            salary.bonus +
                                                                                                            salary.commission +
                                                                                                            salary.fuel_costs +
                                                                                                            salary.money_not_spent_on_holidays +
                                                                                                            salary.other_income
                                                                                                        ).toLocaleString()}
                                                                                                    </span>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>

                                                                                    {/* Deductions Details */}
                                                                                    <div className="bg-white rounded-lg p-4 border border-red-200">
                                                                                        <h4 className="text-sm font-bold text-red-700 mb-3 uppercase">
                                                                                            Deductions
                                                                                        </h4>
                                                                                        <div className="space-y-2">
                                                                                            <div className="flex justify-between py-1">
                                                                                                <span className="text-gray-700">Office Expenses:</span>
                                                                                                <span className="font-semibold text-gray-900">
                                                                                                    ฿{salary.office_expenses.toLocaleString()}
                                                                                                </span>
                                                                                            </div>
                                                                                            <div className="flex justify-between py-1">
                                                                                                <span className="text-gray-700">Social Security:</span>
                                                                                                <span className="font-semibold text-gray-900">
                                                                                                    ฿{salary.social_security.toLocaleString()}
                                                                                                </span>
                                                                                            </div>
                                                                                            <div className="border-t border-red-200 my-2 pt-2">
                                                                                                <div className="flex justify-between font-bold text-red-900">
                                                                                                    <span>Total Deductions:</span>
                                                                                                    <span>
                                                                                                        ฿{(
                                                                                                            salary.office_expenses +
                                                                                                            salary.social_security
                                                                                                        ).toLocaleString()}
                                                                                                    </span>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                                                                            <h4 className="text-sm font-bold text-gray-800 mb-2">
                                                                                                Additional Information
                                                                                            </h4>
                                                                                            <div className="space-y-1 text-sm text-gray-700">
                                                                                                <div className="flex justify-between">
                                                                                                    <span>Working Days:</span>
                                                                                                    <span className="font-semibold">
                                                                                                        {salary.working_days} days
                                                                                                    </span>
                                                                                                </div>
                                                                                                <div className="flex justify-between">
                                                                                                    <span>Day Off Days:</span>
                                                                                                    <span className="font-semibold">
                                                                                                        {salary.day_off_days} days
                                                                                                    </span>
                                                                                                </div>
                                                                                                <div className="flex justify-between">
                                                                                                    <span>Vacation Days Left:</span>
                                                                                                    <span className="font-semibold">
                                                                                                        {salary.remaining_vacation_days} days
                                                                                                    </span>
                                                                                                </div>
                                                                                                <div className="flex justify-between">
                                                                                                    <span>Created By:</span>
                                                                                                    <span className="font-semibold">
                                                                                                        {salary.created_by.first_name_en} {salary.created_by.last_name_en}
                                                                                                    </span>
                                                                                                </div>
                                                                                                {salary.notes && (
                                                                                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                                                                                        <span className="text-gray-700">Notes:</span>
                                                                                                        <p className="text-sm text-gray-600 mt-1">
                                                                                                            {salary.notes}
                                                                                                        </p>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </div>
                                                            )
                                                        })
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Footer */}
                                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between">
                                                <div className="text-sm text-gray-500">
                                                    Showing <span className="font-medium">{filteredSalaries.length}</span> of{' '}
                                                    <span className="font-medium">{salaries.length}</span> records
                                                </div>
                                                <div className="flex items-center gap-4 mt-2 md:mt-0">
                                                    <div className="text-sm text-gray-700">
                                                        Total Net Salary:{' '}
                                                        <span className="font-bold text-green-600">
                                                            ฿{calculateTotal('net_salary').toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modules */}
            <RequestModule
                open={openRequest}
                type={requestType}
                onClose={() => setOpenRequest(false)}
            />
            <DayOffModule
                open={openDayOff}
                onClose={() => setOpenDayOff(false)}
            />
        </div>
    )
}

export default UserDashboard