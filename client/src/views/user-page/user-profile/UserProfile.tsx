import { UserData } from '@/services/User_Page/user_api'
import { useState, useEffect } from 'react'
import RequestModule from './module/RequestModule'
import DayOffModule from './module/DayOffModule'
import ViewPaySlip from './module/ViewPaySlip'
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
    approvedRequests: number
    pendingRequests: number
    remainingDayOffs: number
    totalOTHours: number
    upcomingEvents: number
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

// Dashboard statistics interface
interface DashboardStats {
    totalRequests: number
    approvedRequests: number
    pendingRequests: number
    remainingDayOffs: number
    totalOTHours: number
    upcomingEvents: number
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

const StatsCard = ({ title, value, icon, change, trend, color }: {
    title: string
    value: number
    icon: React.ReactNode
    change: string
    trend: 'up' | 'down'
    color: 'blue' | 'green' | 'amber' | 'purple'
}) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        amber: 'bg-amber-50 text-amber-600',
        purple: 'bg-purple-50 text-purple-600'
    }

    return (
        <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
                <span className="text-slate-600 text-sm font-medium">{title}</span>
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">{value}</div>
            <div className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {change} from last month
            </div>
        </div>
    )
}

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

    const [stats, setStats] = useState<DashboardStats>({
        totalRequests: 0,
        approvedRequests: 0,
        pendingRequests: 0,
        remainingDayOffs: 15,
        totalOTHours: 42,
        upcomingEvents: 3
    })

    // Simulate fetching dashboard data
    useEffect(() => {
        // In a real app, fetch this data from your API
        const fetchDashboardData = async () => {
            // Mock data - replace with actual API call
            const mockStats: DashboardStats = {
                totalRequests: 24,
                approvedRequests: 18,
                pendingRequests: 3,
                remainingDayOffs: 15,
                totalOTHours: 42,
                upcomingEvents: 3
            }
            setStats(mockStats)
        }
        fetchDashboardData()
    }, [user])
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

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            const mockStats: DashboardStats = {
                totalRequests: 24,
                approvedRequests: 18,
                pendingRequests: 3,
                remainingDayOffs: 15,
                totalOTHours: 42,
                upcomingEvents: 3
            }
            setStats(mockStats)
        }
        fetchDashboardData()
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

    // Recent activities data
    const recentActivities = [
        { id: 1, type: 'OT', action: 'Approved', time: '2 hours ago', amount: '4 hours' },
        { id: 2, type: 'Field Work', action: 'Submitted', time: '1 day ago', location: 'Client Site' },
        { id: 3, type: 'Day Off', action: 'Pending', time: '2 days ago', date: '2024-01-20' },
        { id: 4, type: 'Salary', action: 'Paid', time: '1 week ago', amount: '5,200,000₭' }
    ]

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
            onClick: () => console.log('View payslip')
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

                        {/* Quick Stats */}
                        <div className="flex gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{stats.remainingDayOffs}</div>
                                <div className="text-sm text-slate-600">Days Off Left</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{stats.totalOTHours}h</div>
                                <div className="text-sm text-slate-600">OT This Month</div>
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
                                {/* Statistics Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <StatsCard
                                        title="Total Requests"
                                        value={stats.totalRequests}
                                        icon={<PiChartLineUp />}
                                        change="+12%"
                                        trend="up"
                                        color="blue"
                                    />
                                    <StatsCard
                                        title="Approved"
                                        value={stats.approvedRequests}
                                        icon={<MdOutlineRequestQuote />}
                                        change="+8%"
                                        trend="up"
                                        color="green"
                                    />
                                    <StatsCard
                                        title="Pending"
                                        value={stats.pendingRequests}
                                        icon={<PiClock />}
                                        change="-2%"
                                        trend="down"
                                        color="amber"
                                    />
                                    <StatsCard
                                        title="Upcoming Events"
                                        value={stats.upcomingEvents}
                                        icon={<MdOutlineCalendarToday />}
                                        change="+3"
                                        trend="up"
                                        color="purple"
                                    />
                                </div>

                                {/* Quick Actions & Recent Activity Side by Side */}
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
                                {/* Profile Header */}
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
                                    <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium transition-colors">
                                        Edit Profile
                                    </button>
                                </div>

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

                                {/* Additional Information */}
                                <div className="bg-slate-50 rounded-xl p-6">
                                    <h4 className="font-semibold text-slate-900 mb-4">Additional Details</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center p-4 bg-white rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">{stats.remainingDayOffs}</div>
                                            <div className="text-sm text-slate-600">Annual Leave Days</div>
                                        </div>
                                        <div className="text-center p-4 bg-white rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">{stats.totalOTHours}</div>
                                            <div className="text-sm text-slate-600">Total OT Hours</div>
                                        </div>
                                        <div className="text-center p-4 bg-white rounded-lg">
                                            <div className="text-2xl font-bold text-purple-600">{stats.approvedRequests}</div>
                                            <div className="text-sm text-slate-600">Approved Requests</div>
                                        </div>
                                        <div className="text-center p-4 bg-white rounded-lg">
                                            <div className="text-2xl font-bold text-amber-600">{user.status}</div>
                                            <div className="text-sm text-slate-600">Employment Status</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'requests' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-slate-900">Request History</h3>
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

                                {/* Request Stats */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold text-blue-700">{stats.totalRequests}</div>
                                        <div className="text-sm text-blue-600">Total Requests</div>
                                    </div>
                                    <div className="bg-green-50 rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold text-green-700">{stats.approvedRequests}</div>
                                        <div className="text-sm text-green-600">Approved</div>
                                    </div>
                                    <div className="bg-amber-50 rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold text-amber-700">{stats.pendingRequests}</div>
                                        <div className="text-sm text-amber-600">Pending</div>
                                    </div>
                                </div>

                                {/* Request History Table (Placeholder) */}
                                <div className="bg-slate-50 rounded-xl p-6">
                                    <p className="text-center text-slate-500">
                                        Request history will be displayed here
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'viewpayslip' && (
                            <div className="space-y-6">
                                <ViewPaySlip />
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