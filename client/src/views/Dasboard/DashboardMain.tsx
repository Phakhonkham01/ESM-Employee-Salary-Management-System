'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
    Users,
    DollarSign,
    Calendar,
    Briefcase,
    Clock,
    CheckCircle,
    XCircle,
    TrendingUp,
    PieChart,
    BarChart,
    Activity,
    AlertCircle,
    Download,
    Filter,
    ChevronRight,
    UserCheck,
    UserX,
    Building,
    Shield,
    FileText,
    Printer,
    Search,
    Trash2,
    Eye,
    Plus,
} from 'lucide-react'
import axios from 'axios'
import moment from 'moment'

// ນິຍາມຂໍ້ມູນ
interface User {
    _id: string
    first_name_en: string
    last_name_en: string
    email: string
    role: string
    status: string
    base_salary?: number
    department_id?: {
        _id: string
        department_name: string
    }
    position_id?: {
        _id: string
        position_name: string
    }
    vacation_days?: number
}

interface Salary {
    _id: string
    user_id: {
        _id: string
        first_name_en: string
        last_name_en: string
        email: string
    }
    month: number
    year: number
    net_salary: number
    status: string
    base_salary: number
    ot_amount: number
    bonus: number
    commission: number
    office_expenses: number
    social_security: number
    working_days: number
    day_off_days: number
    created_at: string
    payment_date: string
}

interface RequestData {
    _id: string
    user_id: any
    title: string
    status: string
    date: string
    reason: string
    start_hour: string | number
    end_hour: string | number
    fuel?: number
    created_at: string
}

interface DayOffItem {
    _id: string
    user_id: any
    day_off_type: string
    status: string
    start_date_time: string
    end_date_time: string
    date_off_number: number
    title: string
    created_at: string
}

// ຄອມໂປເນັນຕ່າງໆ
const StatCard: React.FC<{
    title: string
    value: string | number
    icon: React.ElementType
    trend?: {
        value: number
        isPositive: boolean
        label: string
    }
    color: string
    subtitle?: string
}> = ({ title, value, icon: Icon, trend, color, subtitle }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                    
                    {subtitle && (
                        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                    )}
                    
                    {trend && (
                        <div className="flex items-center mt-2">
                            {trend.isPositive ? (
                                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            ) : (
                                <TrendingUp className="w-4 h-4 text-red-500 mr-1 rotate-180" />
                            )}
                            <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {trend.isPositive ? '+' : ''}{trend.value}%
                            </span>
                            <span className="text-sm text-gray-500 ml-2">{trend.label}</span>
                        </div>
                    )}
                </div>
                <div className={`w-12 h-12 ${color} bg-opacity-10 rounded-full flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
            </div>
        </div>
    )
}

const ActivityItemComponent: React.FC<{
    type: 'salary' | 'request' | 'dayoff' | 'user'
    title: string
    description: string
    status: string
    timestamp: string
    icon: React.ElementType
}> = ({ type, title, description, status, timestamp, icon: Icon }) => {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
            case 'ລໍຖ້າການອະນຸມັດ':
                return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
            case 'accepted':
            case 'approved':
            case 'paid':
            case 'ອະນຸມັດແລ້ວ':
            case 'ຈ່າຍແລ້ວ':
                return 'bg-green-100 text-green-800 border border-green-200'
            case 'rejected':
            case 'cancelled':
            case 'ປະຕິເສດ':
                return 'bg-red-100 text-red-800 border border-red-200'
            default:
                return 'bg-gray-100 text-gray-800 border border-gray-200'
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'salary':
                return 'text-blue-600 bg-blue-50'
            case 'request':
                return 'text-orange-600 bg-orange-50'
            case 'dayoff':
                return 'text-purple-600 bg-purple-50'
            case 'user':
                return 'text-green-600 bg-green-50'
            default:
                return 'text-gray-600 bg-gray-50'
        }
    }

    return (
        <div className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200 group cursor-pointer">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(type)}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="ml-4 flex-1 min-w-0">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(status)}`}>
                                {status}
                            </span>
                            <span className="text-xs text-gray-600 truncate">{description}</span>
                        </div>
                    </div>
                    <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                        {moment(timestamp).fromNow()}
                    </span>
                </div>
            </div>
        </div>
    )
}

const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month')
    const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'salaries' | 'requests'>('overview')

    // ຂໍ້ມູນ
    const [users, setUsers] = useState<User[]>([])
    const [salaries, setSalaries] = useState<Salary[]>([])
    const [requests, setRequests] = useState<RequestData[]>([])
    const [dayOffs, setDayOffs] = useState<DayOffItem[]>([])
    const [filteredData, setFilteredData] = useState<any[]>([])

    // ສະຖິຕິ
    const [stats, setStats] = useState({
        totalEmployees: 0,
        activeEmployees: 0,
        pendingRequests: 0,
        pendingDayOffs: 0,
        totalSalaryThisMonth: 0,
        avgSalary: 0,
        salaryGrowth: 0,
        leaveRate: 0,
        totalDepartments: 0,
        totalPositions: 0,
    })

    // ດຶງຂໍ້ມູນທັງໝົດ
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true)
                
                // ດຶງຂໍ້ມູນພະນັກງານ
                const usersRes = await axios.get('/api/users')
                const allUsers = usersRes.data?.users || []
                const employees = allUsers.filter((user: User) => 
                    user.role.toLowerCase() === 'employee' || 
                    user.role.toLowerCase() === 'ພະນັກງານ'
                )
                setUsers(employees)

                // ດຶງຂໍ້ມູນເງິນເດືອນ
                try {
                    const salariesRes = await axios.get('/api/salaries')
                    setSalaries(salariesRes.data?.salaries || [])
                } catch (salaryError) {
                    console.log('ບໍ່ສາມາດດຶງຂໍ້ມູນເງິນເດືອນ:', salaryError)
                }

                // ດຶງຂໍ້ມູນຄຳຮ້ອງຂໍ
                try {
                    const requestsRes = await axios.get('/api/requests')
                    setRequests(requestsRes.data?.requests || [])
                } catch (requestError) {
                    console.log('ບໍ່ສາມາດດຶງຂໍ້ມູນຄຳຮ້ອງຂໍ:', requestError)
                }

                // ດຶງຂໍ້ມູນການລາພັກ
                try {
                    const dayOffsRes = await axios.get('/api/day-off-requests')
                    setDayOffs(dayOffsRes.data?.requests || [])
                } catch (dayOffError) {
                    console.log('ບໍ່ສາມາດດຶງຂໍ້ມູນການລາພັກ:', dayOffError)
                }

            } catch (error) {
                console.error('ຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchAllData()
    }, [])

    // ຄຳນວນສະຖິຕິ
    useEffect(() => {
        if (users.length > 0 || salaries.length > 0 || requests.length > 0 || dayOffs.length > 0) {
            const currentMonth = new Date().getMonth() + 1
            const currentYear = new Date().getFullYear()
            
            // ເງິນເດືອນໃນເດືອນນີ້
            const currentMonthSalaries = salaries.filter(s => 
                s.month === currentMonth && s.year === currentYear
            )
            
            const totalSalary = currentMonthSalaries.reduce((sum, s) => sum + (s.net_salary || 0), 0)
            const avgSalary = salaries.length > 0 
                ? salaries.reduce((sum, s) => sum + (s.net_salary || 0), 0) / salaries.length 
                : 0

            // ຄິດໄລ່ການເຕີບໂຕ (ງ່າຍໆ)
            const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1
            const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear
            const lastMonthSalaries = salaries.filter(s => 
                s.month === lastMonth && s.year === lastMonthYear
            )
            
            const lastMonthTotal = lastMonthSalaries.reduce((sum, s) => sum + (s.net_salary || 0), 0)
            const salaryGrowth = lastMonthTotal > 0 
                ? ((totalSalary - lastMonthTotal) / lastMonthTotal) * 100 
                : totalSalary > 0 ? 100 : 0

            // ຄິດໄລ່ອັດຕາການລາພັກ
            const activeUsers = users.filter(u => u.status === 'Active' || u.status === 'ກຳລັງເຮັດວຽກ').length
            const leaveRate = activeUsers > 0 
                ? (dayOffs.filter(d => d.status === 'Accepted' || d.status === 'ອະນຸມັດແລ້ວ').length / activeUsers) * 100 
                : 0

            // ນັບຈຳນວນແຜນການ ແລະ ຕຳແໜ່ງ
            const departments = new Set(users.map(u => u.department_id?.department_name).filter(Boolean))
            const positions = new Set(users.map(u => u.position_id?.position_name).filter(Boolean))

            setStats({
                totalEmployees: users.length,
                activeEmployees: activeUsers,
                pendingRequests: requests.filter(r => r.status === 'Pending' || r.status === 'ລໍຖ້າການອະນຸມັດ').length,
                pendingDayOffs: dayOffs.filter(d => d.status === 'Pending' || d.status === 'ລໍຖ້າການອະນຸມັດ').length,
                totalSalaryThisMonth: totalSalary,
                avgSalary: avgSalary,
                salaryGrowth: salaryGrowth,
                leaveRate: leaveRate,
                totalDepartments: departments.size,
                totalPositions: positions.size,
            })
        }
    }, [users, salaries, requests, dayOffs])

    // ກິດຈະກຳລ່າສຸດ
    const recentActivities = useMemo(() => {
        const allActivities: any[] = []
        
        // ເພີ່ມການຄິດໄລ່ເງິນເດືອນ
        salaries.slice(0, 5).forEach(salary => {
            allActivities.push({
                id: salary._id,
                type: 'salary',
                title: `ຄິດໄລ່ເງິນເດືອນສຳລັບ ${salary.user_id?.first_name_en} ${salary.user_id?.last_name_en}`,
                description: `ຍອດສຸດທິ: ฿${salary.net_salary.toLocaleString()} - ເດືອນ ${salary.month}/${salary.year}`,
                status: salary.status,
                timestamp: salary.created_at,
                icon: DollarSign,
                color: salary.status === 'paid' ? 'text-green-600' : 
                       salary.status === 'pending' ? 'text-yellow-600' : 'text-gray-600'
            })
        })
        
        // ເພີ່ມຄຳຮ້ອງຂໍ
        requests.slice(0, 5).forEach(req => {
            const userName = req.user_id?.first_name_en ? 
                `${req.user_id.first_name_en} ${req.user_id.last_name_en}` : 'ຜູ້ໃຊ້'
            
            const requestType = req.title === 'OT' ? 'ການລົງເວລາ' : 
                               req.title === 'FIELD_WORK' ? 'ງານນອກສຳນັກງານ' : req.title
            
            allActivities.push({
                id: req._id,
                type: 'request',
                title: `ຄຳຮ້ອງຂໍ${requestType} ຈາກ ${userName}`,
                description: `ສະຖານະ: ${req.status}`,
                status: req.status,
                timestamp: req.created_at,
                icon: req.title === 'OT' ? Clock : Briefcase,
                color: req.status === 'Accept' ? 'text-green-600' : 
                       req.status === 'Reject' ? 'text-red-600' : 'text-yellow-600'
            })
        })
        
        // ເພີ່ມຄຳຮ້ອງຂໍລາພັກ
        dayOffs.slice(0, 5).forEach(dayOff => {
            const userName = dayOff.user_id?.first_name_en ? 
                `${dayOff.user_id.first_name_en} ${dayOff.user_id.last_name_en}` : 'ຜູ້ໃຊ້'
            
            const leaveType = dayOff.day_off_type === 'HALF_DAY' ? 'ຄັ້ງເຄິ່ງວັນ' : 'ທັງໝົດວັນ'
            
            allActivities.push({
                id: dayOff._id,
                type: 'dayoff',
                title: `ຄຳຮ້ອງຂໍລາພັກ${leaveType} ຈາກ ${userName}`,
                description: `${dayOff.date_off_number} ວັນ - ${dayOff.title}`,
                status: dayOff.status,
                timestamp: dayOff.created_at,
                icon: Calendar,
                color: dayOff.status === 'Accepted' ? 'text-green-600' : 
                       dayOff.status === 'Rejected' ? 'text-red-600' : 'text-yellow-600'
            })
        })
        
        // ຈັດລຽງຕາມເວລາ ແລະ ສົ່ງຄືນ 10 ລາຍການລ່າສຸດ
        return allActivities
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10)
    }, [salaries, requests, dayOffs])

    // ການແຈກຢາຍຕາມແຜນການ
    const departmentDistribution = useMemo(() => {
        const deptMap = new Map<string, number>()
        
        users.forEach(user => {
            if (user.department_id?.department_name) {
                const dept = user.department_id.department_name
                deptMap.set(dept, (deptMap.get(dept) || 0) + 1)
            }
        })
        
        return Array.from(deptMap.entries()).map(([name, count]) => ({
            name,
            count,
            percentage: users.length > 0 ? (count / users.length) * 100 : 0
        })).sort((a, b) => b.count - a.count)
    }, [users])

    // ແນວໂນ້ມເງິນເດືອນລາຍເດືອນ
    const monthlySalaryTrend = useMemo(() => {
        const currentYear = new Date().getFullYear()
        const monthlyData = Array(12).fill(0).map((_, i) => ({
            month: i + 1,
            total: 0,
            count: 0
        }))
        
        salaries.forEach(salary => {
            if (salary.year === currentYear) {
                monthlyData[salary.month - 1].total += salary.net_salary || 0
                monthlyData[salary.month - 1].count += 1
            }
        })
        
        return monthlyData.map(data => ({
            month: data.month,
            average: data.count > 0 ? data.total / data.count : 0,
            total: data.total,
            count: data.count
        }))
    }, [salaries])

    // ສະຖິຕິຄຳຮ້ອງຂໍ
    const requestStats = useMemo(() => {
        const pending = requests.filter(r => r.status === 'Pending' || r.status === 'ລໍຖ້າການອະນຸມັດ').length
        const accepted = requests.filter(r => r.status === 'Accept' || r.status === 'ອະນຸມັດແລ້ວ').length
        const rejected = requests.filter(r => r.status === 'Reject' || r.status === 'ປະຕິເສດ').length
        
        const otRequests = requests.filter(r => r.title === 'OT').length
        const fieldWorkRequests = requests.filter(r => r.title === 'FIELD_WORK').length
        
        return {
            pending,
            accepted,
            rejected,
            otRequests,
            fieldWorkRequests,
            total: requests.length
        }
    }, [requests])

    // ສະຖິຕິການລາພັກ
    const leaveStats = useMemo(() => {
        const pending = dayOffs.filter(d => d.status === 'Pending' || d.status === 'ລໍຖ້າການອະນຸມັດ').length
        const accepted = dayOffs.filter(d => d.status === 'Accepted' || d.status === 'ອະນຸມັດແລ້ວ').length
        const rejected = dayOffs.filter(d => d.status === 'Rejected' || d.status === 'ປະຕິເສດ').length
        
        const halfDay = dayOffs.filter(d => d.day_off_type === 'HALF_DAY').length
        const fullDay = dayOffs.filter(d => d.day_off_type === 'FULL_DAY').length
        
        return {
            pending,
            accepted,
            rejected,
            halfDay,
            fullDay,
            total: dayOffs.length
        }
    }, [dayOffs])

    // ຟັງຊັນສຳລັບເລືອກເບິ່ງຂໍ້ມູນ
    const handleViewDetails = (type: string, id: string) => {
        console.log(`View ${type} details:`, id)
        // ທີ່ນີ້ສາມາດເພີ່ມການນຳໄປສະແດງລາຍລະອຽດໄດ້
    }

    const handleExportData = () => {
        const data = {
            users,
            salaries,
            requests,
            dayOffs,
            stats,
            exportedAt: new Date().toISOString()
        }
        
        const dataStr = JSON.stringify(data, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `dashboard-export-${moment().format('YYYY-MM-DD')}.json`
        link.click()
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-6 text-gray-700 font-medium">ກຳລັງໂຫຼດຂໍ້ມູນ Dashboard...</p>
                    <p className="text-sm text-gray-500 mt-2">ກະລຸນາລໍຖ້າບໍ່ດົນ</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* ສ່ວນຫົວໜ້າ */}
            <div className="bg-white shadow-lg border-b border-gray-200">
                <div className="px-6 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">ໜ້າຈໍຄວບຄຸມ HR</h1>
                            <p className="text-gray-600 mt-2">
                                ຂໍ້ມູນສະຫຼຸບການຈັດການພະນັກງານ, ເງິນເດືອນ, ແລະ ການອະນຸມັດ
                            </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <div className="flex border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                                <button
                                    onClick={() => setTimeRange('week')}
                                    className={`px-4 py-2.5 text-sm font-medium transition-colors ${timeRange === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                                >
                                    ອາທິດນີ້
                                </button>
                                <button
                                    onClick={() => setTimeRange('month')}
                                    className={`px-4 py-2.5 text-sm font-medium transition-colors ${timeRange === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                                >
                                    ເດືອນນີ້
                                </button>
                                <button
                                    onClick={() => setTimeRange('quarter')}
                                    className={`px-4 py-2.5 text-sm font-medium transition-colors ${timeRange === 'quarter' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                                >
                                    3 ເດືອນ
                                </button>
                            </div>
                            
                            <button 
                                onClick={handleExportData}
                                className="inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                ດາວໂຫຼດຂໍ້ມູນ
                            </button>
                        </div>
                    </div>
                    
                    {/* ແຖບເລືອກເບິ່ງ */}
                    <div className="mt-6 flex flex-wrap gap-2">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            ໂດຍລວມ
                        </button>
                        <button
                            onClick={() => setActiveTab('employees')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'employees' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            ພະນັກງານ ({users.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('salaries')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'salaries' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            ເງິນເດືອນ ({salaries.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'requests' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            ຄຳຮ້ອງຂໍ ({requests.length + dayOffs.length})
                        </button>
                    </div>
                </div>
            </div>

            {/* ເນື້ອໃນຫຼັກ */}
            <div className="p-4 md:p-6">
                {/* ສະຖິຕິສະຫຼຸບ */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                    <StatCard
                        title="ຈຳນວນພະນັກງານທັງໝົດ"
                        value={stats.totalEmployees}
                        icon={Users}
                        trend={{
                            value: 0,
                            isPositive: true,
                            label: 'ເພີ່ມຂຶ້ນ'
                        }}
                        color="text-blue-600"
                        subtitle={`${stats.activeEmployees} ກຳລັງເຮັດວຽກ`}
                    />
                    
                    <StatCard
                        title="ລວມເງິນເດືອນເດືອນນີ້"
                        value={`฿${stats.totalSalaryThisMonth.toLocaleString()}`}
                        icon={DollarSign}
                        trend={{
                            value: Math.abs(stats.salaryGrowth),
                            isPositive: stats.salaryGrowth >= 0,
                            label: 'ຈາກເດືອນກ່ອນ'
                        }}
                        color="text-green-600"
                        subtitle={`ສະເລ່ຍ: ฿${Math.round(stats.avgSalary).toLocaleString()}`}
                    />
                    
                    <StatCard
                        title="ຄຳຮ້ອງລໍຖ້າອະນຸມັດ"
                        value={stats.pendingRequests + stats.pendingDayOffs}
                        icon={AlertCircle}
                        trend={{
                            value: 0,
                            isPositive: false,
                            label: 'ຕ້ອງການເອົາໃຈໃສ່'
                        }}
                        color="text-yellow-600"
                        subtitle={`${stats.pendingRequests} ຄຳຮ້ອງ, ${stats.pendingDayOffs} ການລາພັກ`}
                    />
                    
                    <StatCard
                        title="ອັດຕາການລາພັກ"
                        value={`${stats.leaveRate.toFixed(1)}%`}
                        icon={Calendar}
                        trend={{
                            value: 0,
                            isPositive: stats.leaveRate < 10,
                            label: stats.leaveRate < 10 ? 'ປົກກະຕິ' : 'ສູງ'
                        }}
                        color="text-purple-600"
                        subtitle={`${stats.totalDepartments} ແຜນການ, ${stats.totalPositions} ຕຳແໜ່ງ`}
                    />
                </div>

                {/* ສ່ວນໂດຍລວມ */}
                {activeTab === 'overview' && (
                    <>
                        {/* ກາຟ ແລະ ສະຖິຕິ */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* ການແຈກຢາຍຕາມແຜນການ */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">ການແຈກຢາຍພະນັກງານຕາມແຜນການ</h3>
                                        <p className="text-sm text-gray-500 mt-1">ຈຳນວນພະນັກງານໃນແຕ່ລະແຜນການ</p>
                                    </div>
                                    <PieChart className="w-5 h-5 text-gray-400" />
                                </div>
                                
                                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                                    {departmentDistribution.length > 0 ? (
                                        departmentDistribution.map((dept, index) => (
                                            <div key={dept.name} className="flex items-center justify-between">
                                                <div className="flex items-center flex-1">
                                                    <div 
                                                        className="w-3 h-3 rounded-full mr-3"
                                                        style={{
                                                            backgroundColor: [
                                                                '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                                                                '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#8b5cf6'
                                                            ][index % 10]
                                                        }}
                                                    ></div>
                                                    <span className="text-sm font-medium text-gray-700 truncate" title={dept.name}>
                                                        {dept.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 ml-4">
                                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className="h-2 rounded-full transition-all duration-500"
                                                            style={{
                                                                width: `${dept.percentage}%`,
                                                                backgroundColor: [
                                                                    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                                                                    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#8b5cf6'
                                                                ][index % 10]
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <div className="text-right min-w-[80px]">
                                                        <span className="text-sm font-semibold text-gray-900">{dept.count}</span>
                                                        <span className="text-xs text-gray-500 ml-1">
                                                            ({dept.percentage.toFixed(1)}%)
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500">ຍັງບໍ່ມີຂໍ້ມູນການແຈກຢາຍ</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ແນວໂນ້ມເງິນເດືອນ */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">ແນວໂນ້ມເງິນເດືອນລາຍເດືອນ</h3>
                                        <p className="text-sm text-gray-500 mt-1">ສະເລ່ຍເງິນເດືອນຕະຫຼອດປີ {new Date().getFullYear()}</p>
                                    </div>
                                    <BarChart className="w-5 h-5 text-gray-400" />
                                </div>
                                
                                <div className="h-64">
                                    {monthlySalaryTrend.some(m => m.average > 0) ? (
                                        <div className="h-full flex items-end gap-1 md:gap-2 pb-2">
                                            {monthlySalaryTrend.map((data) => {
                                                const maxSalary = Math.max(...monthlySalaryTrend.map(d => d.average))
                                                const height = maxSalary > 0 ? (data.average / maxSalary) * 100 : 0
                                                
                                                return (
                                                    <div key={data.month} className="flex flex-col items-center flex-1 group relative">
                                                        <div 
                                                            className="w-full bg-gradient-to-t from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 rounded-t-lg cursor-pointer"
                                                            style={{ height: `${height}%` }}
                                                            title={`ເດືອນ ${data.month}: ฿${Math.round(data.average).toLocaleString()}`}
                                                        >
                                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                                ฿{Math.round(data.average).toLocaleString()}
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-gray-500 mt-2">
                                                            {moment().month(data.month - 1).format('MMM')}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center">
                                            <p className="text-gray-500">ຍັງບໍ່ມີຂໍ້ມູນເງິນເດືອນ</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ກິດຈະກຳລ່າສຸດ */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">ກິດຈະກຳລ່າສຸດ</h3>
                                    <p className="text-sm text-gray-500 mt-1">ການເຄື່ອນໄຫວລ່າສຸດໃນລະບົບ</p>
                                </div>
                                <Activity className="w-5 h-5 text-gray-400" />
                            </div>
                            
                            <div className="space-y-1">
                                {recentActivities.length > 0 ? (
                                    recentActivities.map((activity) => (
                                        <ActivityItemComponent
                                            key={activity.id}
                                            type={activity.type}
                                            title={activity.title}
                                            description={activity.description}
                                            status={activity.status}
                                            timestamp={activity.timestamp}
                                            icon={activity.icon}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">ຍັງບໍ່ມີກິດຈະກຳ</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ສະຖິຕິລາຍລະອຽດ */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* ສະຖິຕິຄຳຮ້ອງຂໍ */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">ສະຖິຕິຄຳຮ້ອງຂໍ</h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">ລວມທັງໝົດ</span>
                                        <span className="text-lg font-bold text-gray-900">{requestStats.total}</span>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                                                <span className="text-sm text-gray-700">ລໍຖ້າອະນຸມັດ</span>
                                            </div>
                                            <span className="font-medium">{requestStats.pending}</span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                                <span className="text-sm text-gray-700">ອະນຸມັດແລ້ວ</span>
                                            </div>
                                            <span className="font-medium">{requestStats.accepted}</span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                                                <span className="text-sm text-gray-700">ປະຕິເສດ</span>
                                            </div>
                                            <span className="font-medium">{requestStats.rejected}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-blue-50 p-3 rounded-lg">
                                                <p className="text-sm text-blue-700 font-medium">ການລົງເວລາ</p>
                                                <p className="text-xl font-bold text-blue-900">{requestStats.otRequests}</p>
                                            </div>
                                            <div className="bg-purple-50 p-3 rounded-lg">
                                                <p className="text-sm text-purple-700 font-medium">ງານນອກສຳນັກງານ</p>
                                                <p className="text-xl font-bold text-purple-900">{requestStats.fieldWorkRequests}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ສະຖິຕິການລາພັກ */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">ສະຖິຕິການລາພັກ</h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">ລວມທັງໝົດ</span>
                                        <span className="text-lg font-bold text-gray-900">{leaveStats.total}</span>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                                                <span className="text-sm text-gray-700">ລໍຖ້າອະນຸມັດ</span>
                                            </div>
                                            <span className="font-medium">{leaveStats.pending}</span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                                <span className="text-sm text-gray-700">ອະນຸມັດແລ້ວ</span>
                                            </div>
                                            <span className="font-medium">{leaveStats.accepted}</span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                                                <span className="text-sm text-gray-700">ປະຕິເສດ</span>
                                            </div>
                                            <span className="font-medium">{leaveStats.rejected}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-orange-50 p-3 rounded-lg">
                                                <p className="text-sm text-orange-700 font-medium">ຄັ້ງເຄິ່ງວັນ</p>
                                                <p className="text-xl font-bold text-orange-900">{leaveStats.halfDay}</p>
                                            </div>
                                            <div className="bg-indigo-50 p-3 rounded-lg">
                                                <p className="text-sm text-indigo-700 font-medium">ທັງໝົດວັນ</p>
                                                <p className="text-xl font-bold text-indigo-900">{leaveStats.fullDay}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ສ່ວນພະນັກງານ */}
                {activeTab === 'employees' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">ຂໍ້ມູນພະນັກງານ</h3>
                                    <p className="text-sm text-gray-500 mt-1">ລວມ {users.length} ຄົນ</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1 md:flex-none">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="ຄົ້ນຫາພະນັກງານ..."
                                            className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                        <Plus className="w-4 h-4 mr-2" />
                                        ເພີ່ມພະນັກງານ
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            ລຳດັບ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            ຊື່-ນາມສະກຸນ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            ແຜນການ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            ຕຳແໜ່ງ
                                        </th>
                                        <th className="px6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            ເງິນເດືອນພື້ນຖານ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            ສະຖານະ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            ການກະທຳ
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {users.slice(0, 10).map((user, index) => (
                                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {user.first_name_en} {user.last_name_en}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.department_id?.department_name || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.position_id?.position_name || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {user.base_salary ? `฿${user.base_salary.toLocaleString()}` : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'Active' || user.status === 'ກຳລັງເຮັດວຽກ' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {user.status === 'Active' ? 'ກຳລັງເຮັດວຽກ' : user.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <button className="text-blue-600 hover:text-blue-900 p-1">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button className="text-green-600 hover:text-green-900 p-1">
                                                        <Briefcase className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            {users.length === 0 && (
                                <div className="text-center py-12">
                                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">ຍັງບໍ່ມີຂໍ້ມູນພະນັກງານ</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ສ່ວນເງິນເດືອນ */}
                {activeTab === 'salaries' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">ປະຫວັດເງິນເດືອນ</h3>
                                    <p className="text-sm text-gray-500 mt-1">ລວມ {salaries.length} ການຄິດໄລ່</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option>ທັງໝົດ</option>
                                        <option>ເດືອນນີ້</option>
                                        <option>3 ເດືອນຜ່ານມາ</option>
                                    </select>
                                    <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                        <Plus className="w-4 h-4 mr-2" />
                                        ຄິດໄລ່ເງິນເດືອນໃໝ່
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            ພະນັກງານ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            ໄລຍະເວລາ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            ເງິນພື້ນຖານ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            ລົງເວລາ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            ເງິນອຸດໜູນ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            ຫັກເງິນ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            ຍອດສຸດທິ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            ສະຖານະ
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {salaries.slice(0, 10).map((salary) => (
                                        <tr key={salary._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {salary.user_id?.first_name_en} {salary.user_id?.last_name_en}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{salary.user_id?.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {salary.month}/{salary.year}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                ฿{salary.base_salary.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                                +฿{salary.ot_amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                                                +฿{(salary.bonus + salary.commission).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                                -฿{(salary.office_expenses + salary.social_security).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-lg font-bold text-gray-900">
                                                    ฿{salary.net_salary.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${salary.status === 'paid' ? 'bg-green-100 text-green-800' : salary.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {salary.status === 'paid' ? 'ຈ່າຍແລ້ວ' : 
                                                     salary.status === 'pending' ? 'ລໍຖ້າການຈ່າຍ' : salary.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            {salaries.length === 0 && (
                                <div className="text-center py-12">
                                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">ຍັງບໍ່ມີຂໍ້ມູນເງິນເດືອນ</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ສ່ວນຄຳຮ້ອງຂໍ */}
                {activeTab === 'requests' && (
                    <div className="space-y-6">
                        {/* ຄຳຮ້ອງຂໍ OT ແລະ Field Work */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">ຄຳຮ້ອງຂໍການລົງເວລາ ແລະ ງານນອກສຳນັກງານ</h3>
                                <p className="text-sm text-gray-500 mt-1">ລວມ {requests.length} ຄຳຮ້ອງ</p>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                ພະນັກງານ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                ປະເພດ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                ວັນທີ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                ເວລາ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                ເຫດຜົນ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                ສະຖານະ
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {requests.slice(0, 10).map((request) => (
                                            <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">
                                                        {request.user_id?.first_name_en} {request.user_id?.last_name_en}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${request.title === 'OT' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                                        {request.title === 'OT' ? 'ການລົງເວລາ' : 'ງານນອກສຳນັກງານ'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {moment(request.date).format('DD/MM/YYYY')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {typeof request.start_hour === 'number' 
                                                        ? `${Math.floor(request.start_hour)}:${(request.start_hour % 1 * 60).toString().padStart(2, '0')}`
                                                        : request.start_hour} - {typeof request.end_hour === 'number'
                                                        ? `${Math.floor(request.end_hour)}:${(request.end_hour % 1 * 60).toString().padStart(2, '0')}`
                                                        : request.end_hour}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                                    {request.reason}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${request.status === 'Accept' ? 'bg-green-100 text-green-800' : request.status === 'Reject' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {request.status === 'Accept' ? 'ອະນຸມັດແລ້ວ' : 
                                                         request.status === 'Reject' ? 'ປະຕິເສດ' : 'ລໍຖ້າອະນຸມັດ'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                                {requests.length === 0 && (
                                    <div className="text-center py-12">
                                        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">ຍັງບໍ່ມີຂໍ້ມູນຄຳຮ້ອງຂໍ</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ຄຳຮ້ອງຂໍລາພັກ */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">ຄຳຮ້ອງຂໍລາພັກ</h3>
                                <p className="text-sm text-gray-500 mt-1">ລວມ {dayOffs.length} ຄຳຮ້ອງ</p>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                ພະນັກງານ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                ປະເພດ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                ເລີ່ມຕົ້ນ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                ສິ້ນສຸດ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                ຈຳນວນວັນ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                ເຫດຜົນ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                ສະຖານະ
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {dayOffs.slice(0, 10).map((dayOff) => (
                                            <tr key={dayOff._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">
                                                        {dayOff.user_id?.first_name_en} {dayOff.user_id?.last_name_en}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dayOff.day_off_type === 'HALF_DAY' ? 'bg-orange-100 text-orange-800' : 'bg-indigo-100 text-indigo-800'}`}>
                                                        {dayOff.day_off_type === 'HALF_DAY' ? 'ຄັ້ງເຄິ່ງວັນ' : 'ທັງໝົດວັນ'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {moment(dayOff.start_date_time).format('DD/MM/YYYY')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {moment(dayOff.end_date_time).format('DD/MM/YYYY')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {dayOff.date_off_number} ວັນ
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                                    {dayOff.title}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dayOff.status === 'Accepted' ? 'bg-green-100 text-green-800' : dayOff.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {dayOff.status === 'Accepted' ? 'ອະນຸມັດແລ້ວ' : 
                                                         dayOff.status === 'Rejected' ? 'ປະຕິເສດ' : 'ລໍຖ້າອະນຸມັດ'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                                {dayOffs.length === 0 && (
                                    <div className="text-center py-12">
                                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">ຍັງບໍ່ມີຂໍ້ມູນການລາພັກ</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ຂໍ້ມູນສະຫຼຸບທີ່ຢູ່ລຸ່ມ */}
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6 border border-blue-100">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">ສະຫຼຸບຂໍ້ມູນ</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                ລວມທັງໝົດ: {users.length + salaries.length + requests.length + dayOffs.length} ລາຍການ
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                                <span className="text-gray-700">ພະນັກງານ: {users.length}</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                <span className="text-gray-700">ເງິນເດືອນ: {salaries.length}</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                                <span className="text-gray-700">ຄຳຮ້ອງຂໍ: {requests.length + dayOffs.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard