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
import { FaPlaneDeparture, FaUmbrellaBeach } from 'react-icons/fa'

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
    X,
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
    cut_off_pay_days?: number
    cut_off_pay_amount?: number
    ot_hours?: number
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

// SalaryDetails Component
const SalaryDetails = ({ salary, getMonthName }: { salary: Salary, getMonthName: (month: number) => string }) => {
    const [isSendingEmail, setIsSendingEmail] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const [isCapturing, setIsCapturing] = useState(false)
    const [emailStatus, setEmailStatus] = useState<{
        success: boolean
        message: string
    } | null>(null)

    // Calculate totals
    const totalIncome =
        salary.base_salary +
        salary.ot_amount +
        salary.bonus +
        salary.commission +
        salary.fuel_costs +
        salary.money_not_spent_on_holidays +
        salary.other_income
    
    const cutOffTotal = (salary.cut_off_pay_days || 0) * (salary.cut_off_pay_amount || 0)
    const totalDeductions = salary.office_expenses + salary.social_security + cutOffTotal
    const userName = `${salary.user_id.first_name_en} ${salary.user_id.last_name_en}`
    const userEmail = salary.user_id.email

    // Function to export as PNG
    const exportToPNG = async () => {
        try {
            setIsExporting(true)
            setIsCapturing(true)
            // Simulate export
            await new Promise(resolve => setTimeout(resolve, 1000))
            alert(`Salary slip exported for ${getMonthName(salary.month)} ${salary.year}`)
        } catch (error) {
            console.error('Failed to export PNG:', error)
            alert('Failed to export PNG. Please try again.')
        } finally {
            setIsCapturing(false)
            setIsExporting(false)
        }
    }

    // Function to send email
    const sendEmailWithPayslip = async () => {
        try {
            setIsSendingEmail(true)
            setEmailStatus(null)
            
            // Send to backend API
            const response = await axios.post('/api/salary/send-email', {
                salaryId: salary._id,
                email: userEmail,
                month: salary.month,
                year: salary.year
            })
            
            if (response.data.success) {
                setEmailStatus({
                    success: true,
                    message: `✅ Salary slip sent to ${userEmail}`,
                })
            } else {
                throw new Error(response.data.message || 'Failed to send email')
            }
        } catch (error: any) {
            console.error('Failed to send email:', error)
            setEmailStatus({
                success: false,
                message: `❌ ${error.response?.data?.message || 'Failed to send email'}`,
            })
        } finally {
            setIsSendingEmail(false)
        }
    }

    // Format currency
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString() + '₭'
    }

    return (
        <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div>
                    <h4 className="text-sm font-bold text-gray-800">
                        Send Payslip
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                        Send salary slip to {userEmail}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={exportToPNG}
                        disabled={isExporting}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-md hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExporting ? (
                            <Clock className="w-4 h-4 animate-spin" />
                        ) : (
                            <FileText className="w-4 h-4" />
                        )}
                        {isExporting ? 'Exporting...' : 'Download PDF'}
                    </button>
                    <button
                        onClick={sendEmailWithPayslip}
                        disabled={isSendingEmail}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSendingEmail ? (
                            <>
                                <Clock className="w-4 h-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <MdEmail className="w-4 h-4" />
                                Send to Email
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Email Status Message */}
            {emailStatus && (
                <div
                    className={`p-3 rounded-md border ${
                        emailStatus.success
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                >
                    <div className="font-medium">
                        {emailStatus.success ? 'Success!' : 'Error'}
                    </div>
                    <div className="text-sm">{emailStatus.message}</div>
                </div>
            )}

            {/* Payslip Table */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-300">
                {/* Header */}
                <div className="text-center mb-8 border-b pb-4">
                    <h1 className="text-2xl font-bold text-[#1F3A5F]">
                        Salary Slip
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {getMonthName(salary.month)} {salary.year}
                    </p>
                </div>

                {/* Employee Information */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-bold text-[#1F3A5F] mb-3">
                        ຂໍ້ມູນພື້ນພະນັກງານ
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-gray-600">Name:</span>
                            <span className="ml-2 font-medium">
                                {userName}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">Email:</span>
                            <span className="ml-2 font-medium">
                                {userEmail}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">
                                ເງິນເດືອນພື້ນຖານ:
                            </span>
                            <span className="ml-2 font-bold text-[#1F3A5F]">
                                {formatCurrency(salary.base_salary)}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">
                                ມື້ເຮັດວຽກ:
                            </span>
                            <span className="ml-2 font-medium">
                                {salary.working_days || 0} ມື້
                            </span>
                        </div>
                    </div>
                </div>

                {/* Salary Table */}
                <div className="overflow-x-auto mb-8">
                    <table className="min-w-full border text-sm text-gray-900">
                        <thead>
                            <tr className="bg-green-500 text-white">
                                <th className="p-3 border text-left font-bold">
                                    ລາຍຮັບ
                                </th>
                                <th className="p-3 border text-left font-bold">
                                    ລາຍຮັບເພີ່ມເຕີມ
                                </th>
                                <th className="p-3 border text-left font-bold">
                                    ຈຳນວນເງິນ
                                </th>
                                <th className="p-3 border text-left font-bold">
                                    ລາຍການຫັກ
                                </th>
                                <th className="p-3 border text-left font-bold">
                                    ຈຳນວນເງິນ
                                </th>
                                <th className="p-3 border text-left font-bold">
                                    ວັນທີຈ່າຍ
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Base Salary Row */}
                            <tr className="bg-white text-gray-800">
                                <td className="p-3 border font-medium">
                                    ເງິນເດືອນພື້ນຖານ
                                </td>
                                <td className="p-3 border text-center text-gray-400">
                                    -
                                </td>
                                <td className="p-3 border font-bold">
                                    {formatCurrency(salary.base_salary)}
                                </td>
                                <td className="p-3 border">
                                    ມື້ຂາດວຽກ{' '}
                                    {(salary.cut_off_pay_days || 0) > 0 && (
                                        <>
                                            ({salary.cut_off_pay_days} ມື້
                                            {' × '}
                                            {(salary.cut_off_pay_amount || 0).toLocaleString()}
                                            /ມື້)
                                        </>
                                    )}
                                </td>
                                <td className="p-3 border text-red-600">
                                    {formatCurrency(cutOffTotal)}
                                </td>
                                <td
                                    className="p-3 border font-bold text-center"
                                    rowSpan={7}
                                >
                                    {moment(salary.payment_date).format('DD/MM/YYYY')}
                                </td>
                            </tr>

                            {/* Additional Income Rows */}
                            <tr>
                                <td
                                    className="p-3 border bg-gray-50 font-medium"
                                    rowSpan={7}
                                >
                                    ລາຍໄດ້ອື່ນໆ
                                </td>
                                <td className="p-3 border">ຄ່ານ້ຳມັນ</td>
                                <td className="p-3 border">
                                    {formatCurrency(salary.fuel_costs)}
                                </td>
                                <td className="p-3 border" rowSpan={2}>
                                    ປະກັນສັງຄົມ
                                </td>
                                <td
                                    className="p-3 border text-red-600"
                                    rowSpan={2}
                                >
                                    {formatCurrency(salary.social_security)}
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 border">ຄ່າຄອມມິດຊັນ</td>
                                <td className="p-3 border">
                                    {formatCurrency(salary.commission)}
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 border">
                                    ຄ່າລ່ວງເວລາ (OT)
                                </td>
                                <td className="p-3 border">
                                    {formatCurrency(salary.ot_amount)}
                                </td>
                                <td className="p-3 border" colSpan={2}></td>
                            </tr>
                            <tr>
                                <td className="p-3 border">ເງິນໂບນັດ</td>
                                <td className="p-3 border">
                                    {formatCurrency(salary.bonus)}
                                </td>
                                <td className="p-3 border" colSpan={2}></td>
                            </tr>
                            <tr>
                                <td className="p-3 border">
                                    ຄ່າເຮັດວຽກມື້ພັກ
                                </td>
                                <td className="p-3 border">
                                    {formatCurrency(
                                        salary.money_not_spent_on_holidays,
                                    )}
                                </td>
                                <td className="p-3 border" colSpan={2}></td>
                            </tr>
                            <tr>
                                <td className="p-3 border">
                                    ຄ່າໃຊ້ຈ່າຍຫ້ອງການ
                                </td>
                                <td className="p-3 border">
                                    {formatCurrency(salary.office_expenses)}
                                </td>
                                <td className="p-3 border" colSpan={2}></td>
                            </tr>
                            <tr>
                                <td className="p-3 border">ອື່ນໆ</td>
                                <td className="p-3 border">
                                    {formatCurrency(salary.other_income)}
                                </td>
                                <td className="p-3 border" colSpan={2}></td>
                            </tr>

                            {/* Totals Row */}
                            <tr className="bg-gray-100 font-bold text-[#1F3A5F]">
                                <td
                                    className="p-3 border text-right"
                                    colSpan={2}
                                >
                                    ລວມລາຍຮັບທັງໝົດ:
                                </td>
                                <td className="p-3 border">
                                    {formatCurrency(totalIncome)}
                                </td>
                                <td className="p-3 border text-right">
                                    ລວມລາຍການຫັກ:
                                </td>
                                <td className="p-3 border text-red-600">
                                    {formatCurrency(totalDeductions)}
                                </td>
                                <td className="p-3 border"></td>
                            </tr>

                            {/* Net Salary Row */}
                            <tr className="bg-green-500 text-white font-bold">
                                <td
                                    className="p-4 border text-center text-lg"
                                    colSpan={4}
                                >
                                    ເງິນເດືອນສຸດທິ (NET SALARY)
                                </td>
                                <td
                                    className="p-4 border text-center text-xl"
                                    colSpan={2}
                                >
                                    {formatCurrency(salary.net_salary)} ກີບ
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Additional Information */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-bold text-[#1F3A5F] mb-3">
                        ຂໍ້ມູນເພີ່ມເຕີມ
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-gray-600">
                                ມື້ເຮັດວຽກ:
                            </span>
                            <span className="ml-2 font-medium">
                                {salary.working_days || 0} ມື້
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">
                                ວັນພັກທີ່ເຫຼືອ:
                            </span>
                            <span className="ml-2 font-medium">
                                {salary.remaining_vacation_days || 0} ມື້
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">OT Hours:</span>
                            <span className="ml-2 font-medium">
                                {salary.ot_hours || 0} ຊົ່ວໂມງ
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">ມື້ພັກ:</span>
                            <span className="ml-2 font-medium">
                                {salary.day_off_days || 0} ມື້
                            </span>
                        </div>
                    </div>
                    {salary.notes && (
                        <div className="mt-4 p-3 bg-white rounded border border-gray-300">
                            <span className="font-medium text-gray-700">
                                Notes:
                            </span>
                            <p className="mt-1 text-gray-600">
                                {salary.notes}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const UserDashboard = ({ user }: Props) => {
    const [openDayOff, setOpenDayOff] = useState(false)
    const [openRequest, setOpenRequest] = useState(false)
    const [requestType, setRequestType] = useState<'OT' | 'FIELD_WORK'>('OT')
    const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'viewpayslip'>('overview')

    // Salary states
    const [salaries, setSalaries] = useState<Salary[]>([])
    const [filteredSalaries, setFilteredSalaries] = useState<Salary[]>([])
    const [loadingSalaries, setLoadingSalaries] = useState(false)
    const [salaryError, setSalaryError] = useState<string | null>(null)
    const [expandedRows, setExpandedRows] = useState<string[]>([])
    const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null)

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
            // Handle response here
        } catch (error) {
            console.error('Error fetching day off requests:', error)
        } finally {
            setLoadingDayOffs(false)
        }
    }

    // Fetch salary data - ใช้ API จริง
    const fetchSalaries = async () => {
        try {
            setLoadingSalaries(true)
            setSalaryError(null)

            // เรียก API จริงเพื่อดึงข้อมูลเงินเดือนของพนักงานคนนี้
            const response = await axios.get('/api/salaries', {
                params: { 
                    userId: user._id,
                    // หรือใช้ employeeId ถ้าชื่อต่างกัน
                    // employeeId: user._id
                },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (response.data && response.data.salaries) {
                // กรองเฉพาะเงินเดือนของพนักงานคนนี้
                const userSalaries = response.data.salaries.filter(
                    (salary: Salary) => salary.user_id._id === user._id
                )
                
                setSalaries(userSalaries)
                setFilteredSalaries(userSalaries)
            } else if (response.data) {
                // กรณี API ส่งมาเป็น array โดยตรง
                const userSalaries = response.data.filter(
                    (salary: Salary) => salary.user_id._id === user._id
                )
                
                setSalaries(userSalaries)
                setFilteredSalaries(userSalaries)
            }
            
        } catch (err: any) {
            console.error('Error fetching salaries:', err)
            
            // กรณีไม่มี API จริงให้ดึงข้อมูลจาก localStorage หรือแสดงข้อความ
            setSalaryError(
                err.response?.data?.message || 
                'Failed to load salary history. Please check your connection.'
            )
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

    // Toggle row expansion
    const toggleRow = (id: string) => {
        if (expandedRows.includes(id)) {
            setExpandedRows(expandedRows.filter((rowId) => rowId !== id))
        } else {
            setExpandedRows([...expandedRows, id])
        }
    }

    // Filter by status
    const filterByStatus = (status: string) => {
        if (status === 'all') {
            setFilteredSalaries(salaries)
        } else {
            const filtered = salaries.filter(salary => salary.status === status)
            setFilteredSalaries(filtered)
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
        <div className="max-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-2">
            {/* Main Dashboard Container */}
            <div className="max-w-full mx-auto space-y-6">

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
                                                    {(user.base_salary || 0)?.toLocaleString()}₭
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
                                        value={`${(user.base_salary || 0)?.toLocaleString()}₭`}
                                        icon={<PiMoneyFill />}
                                    />
                                    <ProfileField
                                        label="Day off"
                                        value={String(user.vacation_days)}
                                        icon={<FaUmbrellaBeach />}
                                    />
                                    <ProfileField
                                        label="Day off"
                                        value={formatDate(user.start_work)}
                                        icon={<FaPlaneDeparture />}
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

                                {/* Filter options */}
                                <div className="bg-white rounded-xl p-4 border border-slate-200">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-600 text-sm">Filter by:</span>
                                            <select 
                                                className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
                                                onChange={(e) => filterByStatus(e.target.value)}
                                            >
                                                <option value="all">All Status</option>
                                                <option value="paid">Paid</option>
                                                <option value="pending">Pending</option>
                                                <option value="approved">Approved</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                        <div className="text-sm text-slate-500">
                                            Showing {filteredSalaries.length} of {salaries.length} records
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
                                        <button 
                                            onClick={fetchSalaries}
                                            className="mt-4 px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors"
                                        >
                                            Try Again
                                        </button>
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
                                    <div className="space-y-6">
                                        {/* Salary Table */}
                                        <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-slate-200">
                                                    <thead className="bg-slate-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                                                                Period
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                                                                Base Salary
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                                                                Overtime
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                                                                Deductions
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                                                                Net Salary
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                                                                Status
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                                                                Payment Date
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                                                                Actions
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-slate-200">
                                                        {filteredSalaries.map((salary) => {
                                                            const statusInfo = getStatusInfo(salary.status)
                                                            const isExpanded = expandedRows.includes(salary._id)
                                                            
                                                            // Calculate deductions
                                                            const cutOffTotal = (salary.cut_off_pay_days || 0) * (salary.cut_off_pay_amount || 0)
                                                            const totalDeductions = salary.office_expenses + salary.social_security + cutOffTotal

                                                            return (
                                                                <>
                                                                    <tr key={salary._id} className="hover:bg-slate-50">
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <div className="text-sm font-semibold text-slate-900">
                                                                                {getMonthName(salary.month)} {salary.year}
                                                                            </div>
                                                                            <div className="text-xs text-slate-500">
                                                                                {salary.working_days} working days
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <div className="text-sm font-medium text-slate-900">
                                                                                {salary.base_salary.toLocaleString()}₭
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <div className="text-sm text-slate-900">
                                                                                +{salary.ot_amount.toLocaleString()}₭
                                                                            </div>
                                                                            <div className="text-xs text-slate-500">
                                                                                {salary.ot_hours || 0} hours
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <div className="text-sm text-red-600">
                                                                                -{totalDeductions.toLocaleString()}₭
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <div className="text-lg font-bold text-green-600">
                                                                                {salary.net_salary.toLocaleString()}₭
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                                                {statusInfo.icon}
                                                                                {statusInfo.label}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                                            {moment(salary.payment_date).format('DD/MM/YYYY')}
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                            <div className="flex items-center gap-2">
                                                                                <button
                                                                                    onClick={() => toggleRow(salary._id)}
                                                                                    className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                                                                                    title={isExpanded ? "Hide details" : "Show details"}
                                                                                >
                                                                                    {isExpanded ? (
                                                                                        <ChevronUp className="w-5 h-5" />
                                                                                    ) : (
                                                                                        <ChevronDown className="w-5 h-5" />
                                                                                    )}
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => setSelectedSalary(salary)}
                                                                                    className="text-green-600 hover:text-green-800 p-1.5 hover:bg-green-50 rounded-lg transition-colors"
                                                                                    title="View payslip"
                                                                                >
                                                                                    <Eye className="w-5 h-5" />
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>

                                                                    {/* Expanded row with more details */}
                                                                    {isExpanded && (
                                                                        <tr className="bg-blue-50">
                                                                            <td colSpan={8} className="px-6 py-4">
                                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                                                                    <div>
                                                                                        <div className="text-slate-500 mb-1">Bonus</div>
                                                                                        <div className="font-medium">{salary.bonus.toLocaleString()}₭</div>
                                                                                    </div>
                                                                                    <div>
                                                                                        <div className="text-slate-500 mb-1">Commission</div>
                                                                                        <div className="font-medium">{salary.commission.toLocaleString()}₭</div>
                                                                                    </div>
                                                                                    <div>
                                                                                        <div className="text-slate-500 mb-1">Fuel Costs</div>
                                                                                        <div className="font-medium">{salary.fuel_costs.toLocaleString()}₭</div>
                                                                                    </div>
                                                                                    <div>
                                                                                        <div className="text-slate-500 mb-1">Holiday Money</div>
                                                                                        <div className="font-medium">{salary.money_not_spent_on_holidays.toLocaleString()}₭</div>
                                                                                    </div>
                                                                                    <div>
                                                                                        <div className="text-slate-500 mb-1">Other Income</div>
                                                                                        <div className="font-medium">{salary.other_income.toLocaleString()}₭</div>
                                                                                    </div>
                                                                                    <div>
                                                                                        <div className="text-slate-500 mb-1">Office Expenses</div>
                                                                                        <div className="font-medium">{salary.office_expenses.toLocaleString()}₭</div>
                                                                                    </div>
                                                                                    <div>
                                                                                        <div className="text-slate-500 mb-1">Social Security</div>
                                                                                        <div className="font-medium">{salary.social_security.toLocaleString()}₭</div>
                                                                                    </div>
                                                                                    <div>
                                                                                        <div className="text-slate-500 mb-1">Day Off Days</div>
                                                                                        <div className="font-medium">{salary.day_off_days} days</div>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </>
                                                            )
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Summary footer */}
                                            {filteredSalaries.length > 0 && (
                                                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                                        <div className="text-sm text-slate-600">
                                                            Total records: {filteredSalaries.length}
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-sm">
                                                                <span className="text-slate-600">Avg. Salary: </span>
                                                                <span className="font-semibold text-green-600">
                                                                    {(
                                                                        filteredSalaries.reduce((sum, salary) => sum + salary.net_salary, 0) /
                                                                        filteredSalaries.length
                                                                    ).toLocaleString('en-US', {
                                                                        minimumFractionDigits: 2,
                                                                        maximumFractionDigits: 2,
                                                                    })}₭
                                                                </span>
                                                            </div>
                                                            <div className="text-sm">
                                                                <span className="text-slate-600">Total Earned: </span>
                                                                <span className="font-bold text-green-700">
                                                                    {filteredSalaries.reduce((sum, salary) => sum + salary.net_salary, 0).toLocaleString()}₭
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Salary Details Popup Modal */}
            {selectedSalary && (
                <div className="fixed inset-0 bg-gray-700/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    Salary Details - {getMonthName(selectedSalary.month)} {selectedSalary.year}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Your salary slip for {getMonthName(selectedSalary.month)} {selectedSalary.year}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedSalary(null)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                                title="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <SalaryDetails
                                salary={selectedSalary}
                                getMonthName={getMonthName}
                            />
                        </div>
                        
                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setSelectedSalary(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

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