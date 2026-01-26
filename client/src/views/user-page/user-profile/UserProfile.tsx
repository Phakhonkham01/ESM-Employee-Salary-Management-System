import { UserData } from '@/services/Create_user/api'
import { useState, useEffect } from 'react'
import RequestModule from './module/RequestModule'
import DayOffModule from './module/DayOffModule'
import { getAllDayOffRequests, type DayOffRequest } from '@/services/Day_off_api/api'
import { InfoRow } from './HelperComponents'
import {
    MdEmail,
    MdCake,
    MdOutlineWork,
    MdOutlineCalendarToday,
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
    // Stats state
    const [stats, setStats] = useState<DashboardStats>({
        totalRequests: 0,
        acceptedRequests: 0,
        pendingRequests: 0,
        remainingDayOffs: 15,
        totalOTHours: 42,
        rejectedRequests: 0
    })

    // Fetch day off requests
    const fetchDayOffRequests = async () => {
        try {
            setLoadingDayOffs(true)
            const response = await getAllDayOffRequests()

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

    console.log(user.department_id)


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
            label: 'ຄຳຂໍເຮັດ OT',
            color: 'bg-blue-500',
            onClick: () => { setRequestType('OT'); setOpenRequest(true); }
        },
        {
            icon: <MdOutlineWork className="text-xl" />,
            label: 'ຄຳຂໍວຽກນອກສະຖານທີ',
            color: 'bg-green-500',
            onClick: () => { setRequestType('FIELD_WORK'); setOpenRequest(true); }
        },
        {
            icon: <PiCalendarBlank className="text-xl" />,
            label: 'ຄຳຂໍລາພັກວຽກ',
            description: 'Request time off',
            color: 'bg-purple-500',
            onClick: () => setOpenDayOff(true)
        },
        {
            icon: <MdOutlineReceipt className="text-xl" />,
            label: 'ລາຍລະອຽດເງິນເດືອນ',
            color: 'bg-amber-500',
            onClick: () => setActiveTab('viewpayslip')
        }
    ]

    const StatsCard = ({ title, value, icon }: {
        title: string
        value: number
        icon: React.ReactNode
    }) => {
        return (
            <div className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-600 text-sm font-medium">{title}</span>
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                        {icon}
                    </div>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">{value}</div>
            </div>
        )
    }

    return (
        <div className="max-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
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
                                {/* Statistics Cards */}
                                {/* {loadingDayOffs ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <p className="mt-2 text-slate-600">Loading dashboard data...</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <StatsCard
                                            title="Total Requests"
                                            value={stats.totalRequests}
                                            icon={<PiChartLineUp />}
                                        />
                                        <StatsCard
                                            title="Approved"
                                            value={stats.acceptedRequests}
                                            icon={<CheckCircle />}
                                        />
                                        <StatsCard
                                            title="Pending"
                                            value={stats.pendingRequests}
                                            icon={<PiClock />}
                                        />
                                        <StatsCard
                                            title="Rejected"
                                            value={stats.rejectedRequests}
                                            icon={<XCircle />}
                                        />
                                    </div>
                                )} */}

                                {/* Quick Actions & Department Summary Side by Side */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <QuickActions actions={quickActions} />
                                    {/* Department Summary */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-slate-900">ຂໍ້ມູນພະແນກ</h3>
                                            <PiUsers className="text-2xl text-blue-600" />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600">ພະແນກ</span>
                                                <span className="font-semibold"> {user.department_id?.[0]?.department_name || 'N/A'}
</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600">ຕຳແໜ່ງ</span>
                                                <span className="font-semibold">{user.position_id?.position_name || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600">ເງິນເດືອນພື້ນຖານ</span>
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
                                        value={user.department_id?.[0]?.department_name || 'N/A'}
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
                                {/* ================= HEADER ================= */}
                                <div className="bg-gradient-to-r from-sky-200 to-indigo-200 rounded-2xl p-6 text-slate-700 shadow-sm border border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-2xl font-bold mb-1">Salary History & Payslips</h3>
                                            <p className="text-sm text-slate-600">
                                                View and manage your compensation records
                                            </p>
                                        </div>

                                        <div className="bg-white rounded-xl px-5 py-3 text-center border border-slate-200">
                                            <div className="text-xs text-slate-500">Total Records</div>
                                            <div className="text-3xl font-bold text-slate-700">
                                                {filteredSalaries.length}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ================= LOADING ================= */}
                                {loadingSalaries ? (
                                    <div className="flex justify-center items-center min-h-[350px]">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="animate-spin rounded-full h-14 w-14 border-4 border-slate-200 border-t-sky-400" />
                                            <p className="text-slate-600 font-medium">
                                                Loading salary history...
                                            </p>
                                        </div>
                                    </div>

                                ) : salaryError ? (

                                    /* ================= ERROR ================= */
                                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center">
                                        <XCircle className="w-14 h-14 text-rose-400 mx-auto mb-3" />
                                        <p className="text-rose-700 font-semibold text-lg">
                                            Error Loading Data
                                        </p>
                                        <p className="text-rose-600 text-sm">{salaryError}</p>
                                    </div>

                                ) : filteredSalaries.length === 0 ? (

                                    /* ================= EMPTY ================= */
                                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
                                        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-600 font-semibold text-lg">
                                            No salary records found
                                        </p>
                                        <p className="text-slate-400 text-sm">
                                            Your payslips will appear here once processed
                                        </p>
                                    </div>

                                ) : (

                                    /* ================= SALARY LIST ================= */
                                    <div className="space-y-4">
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
                                                salary.other_income

                                            const totalDeductions =
                                                salary.office_expenses +
                                                salary.social_security

                                            return (
                                                <div
                                                    key={salary._id}
                                                    className={`bg-white rounded-2xl border transition-all
              ${isExpanded
                                                            ? 'border-sky-300 shadow-md'
                                                            : 'border-slate-200 hover:border-sky-200 hover:shadow-sm'
                                                        }`}
                                                >

                                                    {/* ===== CARD HEADER ===== */}
                                                    <div className="bg-gradient-to-r from-slate-50 to-sky-50 px-6 py-4 border-b border-slate-100">
                                                        <div className="flex justify-between items-center">

                                                            <div className="flex items-center gap-4">
                                                                <div className="bg-sky-300 text-white p-3 rounded-xl">
                                                                    <Calendar className="w-5 h-5" />
                                                                </div>

                                                                <div>
                                                                    <p className="text-lg font-bold text-slate-700">
                                                                        {getMonthName(salary.month)} {salary.year}
                                                                    </p>
                                                                    <p className="text-sm text-slate-500 flex items-center gap-1">
                                                                        <Clock className="w-4 h-4" />
                                                                        {salary.working_days} working days
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-5">
                                                                <div className="text-right">
                                                                    <p className="text-xs text-slate-500">Net Salary</p>
                                                                    <p className="text-2xl font-bold text-emerald-500">
                                                                        ฿{salary.net_salary.toLocaleString()}
                                                                    </p>
                                                                    <p className="text-xs text-slate-400">
                                                                        Base: ฿{salary.base_salary.toLocaleString()}
                                                                    </p>
                                                                </div>

                                                                <div className="flex flex-col items-end gap-1">
                                                                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusInfo.color}`}>
                                                                        {statusInfo.icon} {statusInfo.label}
                                                                    </span>
                                                                    <span className="text-xs text-slate-400">
                                                                        {moment(salary.payment_date).format('DD/MM/YYYY')}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* ===== QUICK STATS ===== */}
                                                    <div className="grid grid-cols-3 px-6 py-3 border-b text-center">
                                                        <div>
                                                            <p className="text-xs text-slate-400">Income</p>
                                                            <p className="font-semibold text-emerald-500">
                                                                ฿{totalIncome.toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className="border-x">
                                                            <p className="text-xs text-slate-400">Deductions</p>
                                                            <p className="font-semibold text-rose-400">
                                                                ฿{totalDeductions.toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-slate-400">Vacation</p>
                                                            <p className="font-semibold text-sky-500">
                                                                {salary.remaining_vacation_days} days
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* ===== ACTIONS ===== */}
                                                    <div className="flex justify-between items-center px-6 py-3 bg-slate-50">
                                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                                            <User className="w-4 h-4" />
                                                            {salary.created_by.first_name_en} {salary.created_by.last_name_en}
                                                        </span>

                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => toggleRow(salary._id)}
                                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition
                    ${isExpanded
                                                                        ? 'bg-sky-400 text-white'
                                                                        : 'bg-white border border-sky-200 text-sky-600 hover:bg-sky-50'
                                                                    }`}
                                                            >
                                                                {isExpanded ? 'Hide Details' : 'Show Details'}
                                                            </button>

                                                            <button className="px-4 py-2 bg-emerald-400 hover:bg-emerald-500 text-white rounded-lg text-sm">
                                                                <Eye className="w-4 h-4 inline mr-1" />
                                                                View
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* ===== EXPANDED ===== */}
                                                    {isExpanded && (
                                                        <div className="bg-slate-50 px-6 py-6 rounded-xl border border-slate-200">
                                                            <div className="space-y-6">

                                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                                                    {/* ================= INCOME ================= */}
                                                                    <div className="bg-white rounded-2xl border border-emerald-200 overflow-hidden">

                                                                        <div className="bg-emerald-100 px-5 py-4 flex items-center gap-2 text-emerald-700">
                                                                            <TrendingUp className="w-5 h-5" />
                                                                            <h4 className="font-semibold text-lg">Income Breakdown</h4>
                                                                        </div>

                                                                        <div className="p-5 space-y-3 text-sm">

                                                                            {[
                                                                                ['Base Salary', salary.base_salary],
                                                                                ['Overtime', salary.ot_amount],
                                                                                ['Bonus', salary.bonus],
                                                                                ['Commission', salary.commission],
                                                                                ['Fuel Costs', salary.fuel_costs],
                                                                                ['Holiday Money', salary.money_not_spent_on_holidays],
                                                                                ['Other Income', salary.other_income],
                                                                            ].map(([label, value], i) => (
                                                                                <div
                                                                                    key={i}
                                                                                    className="flex justify-between items-center py-2 px-2 rounded hover:bg-emerald-50 transition"
                                                                                >
                                                                                    <span className="text-slate-600">{label}</span>
                                                                                    <span className="font-semibold text-slate-800">
                                                                                        ฿{Number(value).toLocaleString()}
                                                                                    </span>
                                                                                </div>
                                                                            ))}

                                                                            <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex justify-between">
                                                                                <span className="font-semibold text-emerald-700">
                                                                                    Total Income
                                                                                </span>
                                                                                <span className="font-bold text-emerald-600 text-lg">
                                                                                    ฿{totalIncome.toLocaleString()}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* ================= RIGHT SIDE ================= */}
                                                                    <div className="space-y-6">

                                                                        {/* -------- DEDUCTIONS -------- */}
                                                                        <div className="bg-white rounded-2xl border border-rose-200 overflow-hidden">
                                                                            <div className="bg-rose-100 px-5 py-4 flex items-center gap-2 text-rose-700">
                                                                                <TrendingDown className="w-5 h-5" />
                                                                                <h4 className="font-semibold text-lg">Deductions</h4>
                                                                            </div>

                                                                            <div className="p-5 space-y-3 text-sm">
                                                                                {[
                                                                                    ['Office Expenses', salary.office_expenses],
                                                                                    ['Social Security', salary.social_security],
                                                                                ].map(([label, value], i) => (
                                                                                    <div
                                                                                        key={i}
                                                                                        className="flex justify-between items-center py-2 px-2 rounded hover:bg-rose-50 transition"
                                                                                    >
                                                                                        <span className="text-slate-600">{label}</span>
                                                                                        <span className="font-semibold text-slate-800">
                                                                                            ฿{Number(value).toLocaleString()}
                                                                                        </span>
                                                                                    </div>
                                                                                ))}

                                                                                <div className="mt-4 bg-rose-50 border border-rose-200 rounded-lg px-4 py-3 flex justify-between">
                                                                                    <span className="font-semibold text-rose-700">
                                                                                        Total Deductions
                                                                                    </span>
                                                                                    <span className="font-bold text-rose-600 text-lg">
                                                                                        ฿{totalDeductions.toLocaleString()}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* -------- ADDITIONAL INFO -------- */}
                                                                        <div className="bg-white rounded-2xl border border-sky-200 overflow-hidden">
                                                                            <div className="bg-sky-100 px-5 py-4 flex items-center gap-2 text-sky-700">
                                                                                <FileText className="w-5 h-5" />
                                                                                <h4 className="font-semibold text-lg">Additional Information</h4>
                                                                            </div>

                                                                            <div className="p-5 space-y-3 text-sm">

                                                                                <InfoRow icon={<Clock />} label="Working Days" value={`${salary.working_days} days`} />
                                                                                <InfoRow icon={<Calendar />} label="Day Off Days" value={`${salary.day_off_days} days`} />
                                                                                <InfoRow
                                                                                    icon={<Calendar />}
                                                                                    label="Vacation Days Left"
                                                                                    value={`${salary.remaining_vacation_days} days`}
                                                                                    highlight
                                                                                />
                                                                                <InfoRow
                                                                                    icon={<User />}
                                                                                    label="Created By"
                                                                                    value={`${salary.created_by.first_name_en} ${salary.created_by.last_name_en}`}
                                                                                />

                                                                                {salary.notes && (
                                                                                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                                                                                        <p className="text-sm font-semibold text-amber-700 mb-1">
                                                                                            Notes
                                                                                        </p>
                                                                                        <p className="text-sm text-amber-600">
                                                                                            {salary.notes}
                                                                                        </p>
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