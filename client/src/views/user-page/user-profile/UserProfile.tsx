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
    Calendar,
    TrendingDown,
    DollarSign,
    Briefcase,
    Shield,
    TrendingUp,
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

                        {activeTab === 'viewpayslip' && (
                            <div className="space-y-6">
                                {/* Header Section */}
                                {loadingSalaries ? (
                                    <div className="flex justify-center items-center min-h-[400px]">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="relative">
                                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <FileText className="w-6 h-6 text-blue-600" />
                                                </div>
                                            </div>
                                            <span className="text-gray-600 font-medium text-lg">Loading salary history...</span>
                                            <span className="text-gray-400 text-sm">Please wait while we fetch your records</span>
                                        </div>
                                    </div>
                                ) : salaryError ? (
                                    <div className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-8 text-center shadow-md">
                                        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                        <p className="text-red-700 font-semibold text-lg mb-2">Error Loading Data</p>
                                        <p className="text-red-600">{salaryError}</p>
                                    </div>
                                ) : filteredSalaries.length === 0 ? (
                                    <div className="bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-dashed border-slate-300 rounded-xl p-12 text-center">
                                        <FileText className="w-20 h-20 text-slate-400 mx-auto mb-4" />
                                        <p className="text-slate-700 font-semibold text-xl mb-2">No salary records found</p>
                                        <p className="text-slate-500">Your payslips will appear here once processed</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Salary Cards Grid */}
                                        {filteredSalaries.map((salary) => {
                                            const isExpanded = expandedRows.includes(salary._id)
                                            const statusInfo = getStatusInfo(salary.status)

                                            const totalIncome =
                                                salary.base_salary +
                                                salary.ot_amount +
                                                salary.bonus +
                                                salary.commission +
                                                salary.fuel_costs +
                                                salary.money_not_spent_on_holidays +
                                                salary.other_income;

                                            const totalDeductions =
                                                salary.office_expenses +
                                                salary.social_security;

                                            return (
                                                <div
                                                    key={salary._id}
                                                    className={`bg-white border-2 rounded-xl shadow-md overflow-hidden transition-all duration-300 ${isExpanded ? 'border-blue-400 shadow-xl' : 'border-slate-200 hover:border-blue-300 hover:shadow-lg'
                                                        }`}
                                                >
                                                    {/* Card Header */}
                                                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <div className="bg-blue-500 text-white rounded-lg p-3 shadow-md">
                                                                    <Calendar className="w-6 h-6" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-lg font-bold text-slate-900">
                                                                        {getMonthName(salary.month)} {salary.year}
                                                                    </div>
                                                                    <div className="text-sm text-slate-600 flex items-center gap-2">
                                                                        <Clock className="w-4 h-4" />
                                                                        {salary.working_days} working days
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-4">
                                                                <div className="text-right">
                                                                    <div className="text-sm text-slate-600 mb-1">Net Salary</div>
                                                                    <div className="text-2xl font-bold text-emerald-600">
                                                                        ฿{salary.net_salary.toLocaleString()}
                                                                    </div>
                                                                    <div className="text-xs text-slate-500">
                                                                        Base: ฿{salary.base_salary.toLocaleString()}
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-col gap-2">
                                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${statusInfo.color} shadow-sm`}>
                                                                        {statusInfo.icon}
                                                                        {statusInfo.label}
                                                                    </span>
                                                                    <div className="text-xs text-slate-500 text-center">
                                                                        {moment(salary.payment_date).format('DD/MM/YYYY')}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Quick Stats Bar */}
                                                    <div className="bg-white px-6 py-3 border-b border-slate-100">
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div className="text-center">
                                                                <div className="text-xs text-slate-500 mb-1">Total Income</div>
                                                                <div className="text-sm font-bold text-emerald-600">฿{totalIncome.toLocaleString()}</div>
                                                            </div>
                                                            <div className="text-center border-x border-slate-200">
                                                                <div className="text-xs text-slate-500 mb-1">Deductions</div>
                                                                <div className="text-sm font-bold text-rose-600">฿{totalDeductions.toLocaleString()}</div>
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="text-xs text-slate-500 mb-1">Vacation Days</div>
                                                                <div className="text-sm font-bold text-blue-600">{salary.remaining_vacation_days} days</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="bg-slate-50 px-6 py-3 flex items-center justify-between">
                                                        <div className="text-xs text-slate-600 flex items-center gap-2">
                                                            <User className="w-4 h-4" />
                                                            Created by {salary.created_by.first_name_en} {salary.created_by.last_name_en}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => toggleRow(salary._id)}
                                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isExpanded
                                                                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                                                                        : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
                                                                    }`}
                                                            >
                                                                {isExpanded ? (
                                                                    <>
                                                                        <ChevronUp className="w-4 h-4" />
                                                                        Hide Details
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <ChevronDown className="w-4 h-4" />
                                                                        Show Details
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Expanded Details */}
                                                    {isExpanded && (
                                                        <div className="bg-gradient-to-br from-slate-50 to-blue-50 px-6 py-6">
                                                            <div className="space-y-6">
                                                                {/* Summary Cards Row */}
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    {/* Total Income Card */}
                                                                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg transform transition-all hover:scale-105">
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <TrendingUp className="w-5 h-5" />
                                                                                <span className="text-sm font-medium opacity-90">Total Income</span>
                                                                            </div>
                                                                            <DollarSign className="w-6 h-6 opacity-70" />
                                                                        </div>
                                                                        <div className="text-3xl font-bold">฿{totalIncome.toLocaleString()}</div>
                                                                        <div className="text-xs opacity-80 mt-1">Before deductions</div>
                                                                    </div>

                                                                    {/* Total Deductions Card */}
                                                                    <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-5 text-white shadow-lg transform transition-all hover:scale-105">
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <TrendingDown className="w-5 h-5" />
                                                                                <span className="text-sm font-medium opacity-90">Deductions</span>
                                                                            </div>
                                                                            <Shield className="w-6 h-6 opacity-70" />
                                                                        </div>
                                                                        <div className="text-3xl font-bold">฿{totalDeductions.toLocaleString()}</div>
                                                                        <div className="text-xs opacity-80 mt-1">Total removed</div>
                                                                    </div>

                                                                    {/* Net Salary Card */}
                                                                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg transform transition-all hover:scale-105">
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <Briefcase className="w-5 h-5" />
                                                                                <span className="text-sm font-medium opacity-90">Net Salary</span>
                                                                            </div>
                                                                            <DollarSign className="w-6 h-6 opacity-70" />
                                                                        </div>
                                                                        <div className="text-3xl font-bold">฿{salary.net_salary.toLocaleString()}</div>
                                                                        <div className="text-xs opacity-80 mt-1">Take home pay</div>
                                                                    </div>
                                                                </div>

                                                                {/* Detailed Breakdown */}
                                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                                    {/* Income Breakdown */}
                                                                    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-emerald-100">
                                                                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-4">
                                                                            <div className="flex items-center gap-2 text-white">
                                                                                <TrendingUp className="w-5 h-5" />
                                                                                <h4 className="font-bold text-lg">Income Breakdown</h4>
                                                                            </div>
                                                                        </div>
                                                                        <div className="p-5 space-y-3">
                                                                            <div className="flex items-center justify-between py-2 border-b border-gray-100 hover:bg-emerald-50 px-2 rounded transition-colors">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                                                    <span className="text-gray-700 font-medium">Base Salary</span>
                                                                                </div>
                                                                                <span className="font-bold text-gray-900">฿{salary.base_salary.toLocaleString()}</span>
                                                                            </div>
                                                                            <div className="flex items-center justify-between py-2 border-b border-gray-100 hover:bg-emerald-50 px-2 rounded transition-colors">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                                                                    <span className="text-gray-700 font-medium">Overtime</span>
                                                                                </div>
                                                                                <span className="font-bold text-gray-900">฿{salary.ot_amount.toLocaleString()}</span>
                                                                            </div>
                                                                            <div className="flex items-center justify-between py-2 border-b border-gray-100 hover:bg-emerald-50 px-2 rounded transition-colors">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-2 h-2 rounded-full bg-emerald-300"></div>
                                                                                    <span className="text-gray-700 font-medium">Bonus</span>
                                                                                </div>
                                                                                <span className="font-bold text-gray-900">฿{salary.bonus.toLocaleString()}</span>
                                                                            </div>
                                                                            <div className="flex items-center justify-between py-2 border-b border-gray-100 hover:bg-emerald-50 px-2 rounded transition-colors">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-2 h-2 rounded-full bg-emerald-200"></div>
                                                                                    <span className="text-gray-700 font-medium">Commission</span>
                                                                                </div>
                                                                                <span className="font-bold text-gray-900">฿{salary.commission.toLocaleString()}</span>
                                                                            </div>
                                                                            <div className="flex items-center justify-between py-2 border-b border-gray-100 hover:bg-emerald-50 px-2 rounded transition-colors">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                                                                                    <span className="text-gray-700 font-medium">Fuel Costs</span>
                                                                                </div>
                                                                                <span className="font-bold text-gray-900">฿{salary.fuel_costs.toLocaleString()}</span>
                                                                            </div>
                                                                            <div className="flex items-center justify-between py-2 border-b border-gray-100 hover:bg-emerald-50 px-2 rounded transition-colors">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-2 h-2 rounded-full bg-teal-300"></div>
                                                                                    <span className="text-gray-700 font-medium">Holiday Money</span>
                                                                                </div>
                                                                                <span className="font-bold text-gray-900">฿{salary.money_not_spent_on_holidays.toLocaleString()}</span>
                                                                            </div>
                                                                            <div className="flex items-center justify-between py-2 border-b border-gray-100 hover:bg-emerald-50 px-2 rounded transition-colors">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-2 h-2 rounded-full bg-teal-200"></div>
                                                                                    <span className="text-gray-700 font-medium">Other Income</span>
                                                                                </div>
                                                                                <span className="font-bold text-gray-900">฿{salary.other_income.toLocaleString()}</span>
                                                                            </div>
                                                                            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg p-3 mt-2">
                                                                                <div className="flex items-center justify-between">
                                                                                    <span className="font-bold text-emerald-900 text-lg">Total Income</span>
                                                                                    <span className="font-bold text-emerald-700 text-xl">฿{totalIncome.toLocaleString()}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Deductions & Info */}
                                                                    <div className="space-y-6">
                                                                        {/* Deductions */}
                                                                        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-rose-100">
                                                                            <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-5 py-4">
                                                                                <div className="flex items-center gap-2 text-white">
                                                                                    <TrendingDown className="w-5 h-5" />
                                                                                    <h4 className="font-bold text-lg">Deductions</h4>
                                                                                </div>
                                                                            </div>
                                                                            <div className="p-5 space-y-3">
                                                                                <div className="flex items-center justify-between py-2 border-b border-gray-100 hover:bg-rose-50 px-2 rounded transition-colors">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                                                                        <span className="text-gray-700 font-medium">Office Expenses</span>
                                                                                    </div>
                                                                                    <span className="font-bold text-gray-900">฿{salary.office_expenses.toLocaleString()}</span>
                                                                                </div>
                                                                                <div className="flex items-center justify-between py-2 border-b border-gray-100 hover:bg-rose-50 px-2 rounded transition-colors">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                                                                                        <span className="text-gray-700 font-medium">Social Security</span>
                                                                                    </div>
                                                                                    <span className="font-bold text-gray-900">฿{salary.social_security.toLocaleString()}</span>
                                                                                </div>
                                                                                <div className="bg-gradient-to-r from-rose-50 to-rose-100 rounded-lg p-3 mt-2">
                                                                                    <div className="flex items-center justify-between">
                                                                                        <span className="font-bold text-rose-900 text-lg">Total Deductions</span>
                                                                                        <span className="font-bold text-rose-700 text-xl">฿{totalDeductions.toLocaleString()}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Additional Information */}
                                                                        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100">
                                                                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-4">
                                                                                <div className="flex items-center gap-2 text-white">
                                                                                    <FileText className="w-5 h-5" />
                                                                                    <h4 className="font-bold text-lg">Additional Information</h4>
                                                                                </div>
                                                                            </div>
                                                                            <div className="p-5 space-y-3">
                                                                                <div className="flex items-center justify-between py-2 hover:bg-blue-50 px-2 rounded transition-colors">
                                                                                    <div className="flex items-center gap-2 text-gray-700">
                                                                                        <Clock className="w-4 h-4 text-blue-500" />
                                                                                        <span className="font-medium">Working Days</span>
                                                                                    </div>
                                                                                    <span className="font-bold text-gray-900">{salary.working_days} days</span>
                                                                                </div>
                                                                                <div className="flex items-center justify-between py-2 hover:bg-blue-50 px-2 rounded transition-colors">
                                                                                    <div className="flex items-center gap-2 text-gray-700">
                                                                                        <Calendar className="w-4 h-4 text-blue-500" />
                                                                                        <span className="font-medium">Day Off Days</span>
                                                                                    </div>
                                                                                    <span className="font-bold text-gray-900">{salary.day_off_days} days</span>
                                                                                </div>
                                                                                <div className="flex items-center justify-between py-2 hover:bg-blue-50 px-2 rounded transition-colors">
                                                                                    <div className="flex items-center gap-2 text-gray-700">
                                                                                        <Calendar className="w-4 h-4 text-blue-500" />
                                                                                        <span className="font-medium">Vacation Days Left</span>
                                                                                    </div>
                                                                                    <span className="font-bold text-emerald-600">{salary.remaining_vacation_days} days</span>
                                                                                </div>
                                                                                <div className="flex items-center justify-between py-2 hover:bg-blue-50 px-2 rounded transition-colors">
                                                                                    <div className="flex items-center gap-2 text-gray-700">
                                                                                        <User className="w-4 h-4 text-blue-500" />
                                                                                        <span className="font-medium">Created By</span>
                                                                                    </div>
                                                                                    <span className="font-bold text-gray-900">
                                                                                        {salary.created_by.first_name_en} {salary.created_by.last_name_en}
                                                                                    </span>
                                                                                </div>
                                                                                {salary.notes && (
                                                                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                                                                        <div className="flex items-start gap-2 bg-amber-50 rounded-lg p-3 border border-amber-200">
                                                                                            <FileText className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                                                                            <div>
                                                                                                <span className="font-semibold text-amber-900 block mb-1">Notes:</span>
                                                                                                <p className="text-sm text-amber-800">{salary.notes}</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}

                                        {/* Footer Summary */}
                                        <div className="bg-gradient-to-r from-slate-100 to-blue-100 rounded-xl p-6 border-2 border-slate-300 shadow-md">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-500 text-white rounded-lg p-2">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-slate-600">Records Summary</div>
                                                        <div className="text-lg font-bold text-slate-900">
                                                            Showing {filteredSalaries.length} of {salaries.length} records
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-white rounded-lg px-6 py-4 shadow-md border border-emerald-200">
                                                    <div className="text-sm text-slate-600 mb-1">Total Net Salary</div>
                                                    <div className="text-2xl font-bold text-emerald-600">
                                                        ฿{calculateTotal('net_salary').toLocaleString()}
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