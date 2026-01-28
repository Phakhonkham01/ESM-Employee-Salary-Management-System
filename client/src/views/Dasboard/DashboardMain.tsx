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
        role?: string
        department_id?: any
        position_id?: any
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

// API Configuration ຕາມຕົວຈິງ
const API_CONFIG = {
    BASE_URL: 'http://localhost:8000/api',
    getHeaders() {
        const token = localStorage.getItem('token')
        return {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        }
    }
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

const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month')
    const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'salaries' | 'requests'>('overview')

    // ຂໍ້ມູນ
    const [users, setUsers] = useState<User[]>([])
    const [salaries, setSalaries] = useState<Salary[]>([])
    const [requests, setRequests] = useState<RequestData[]>([])
    const [dayOffs, setDayOffs] = useState<DayOffItem[]>([])

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

    // ຟັງຊັນດຶງຂໍ້ມູນທັງໝົດ (ປັບຕົວແລ້ວ)
    const fetchAllData = async () => {
        try {
            setLoading(true)
            
            // 1. ດຶງຂໍ້ມູນພະນັກງານ (ຕາມ API ຈິງ)
            try {
                const usersRes = await axios.get(`${API_CONFIG.BASE_URL}/users`, {
                    headers: API_CONFIG.getHeaders()
                })
                
                if (usersRes.data && usersRes.data.users) {
                    // ຕັ້ງຄ່າຂໍ້ມູນ department ແລະ position ໃຫ້ຖືກຕ້ອງ
                    const formattedUsers = usersRes.data.users.map((user: any) => {
                        // ປັບຮູບແບບ department (ອາດຈະເປັນ array ຫຼື object)
                        let departmentData = null
                        if (Array.isArray(user.department_id) && user.department_id.length > 0) {
                            // ຖ້າເປັນ array ໃຊ້ໂຕແລກ
                            departmentData = {
                                _id: user.department_id[0]?._id || '',
                                department_name: user.department_id[0]?.department_name || ''
                            }
                        } else if (user.department_id && typeof user.department_id === 'object') {
                            // ຖ້າເປັນ object ປົກກະຕິ
                            departmentData = {
                                _id: user.department_id._id || '',
                                department_name: user.department_id.department_name || ''
                            }
                        }

                        // ປັບຮູບແບບ position
                        let positionData = null
                        if (user.position_id && typeof user.position_id === 'object') {
                            positionData = {
                                _id: user.position_id._id || '',
                                position_name: user.position_id.position_name || ''
                            }
                        }

                        return {
                            ...user,
                            department_id: departmentData,
                            position_id: positionData
                        }
                    })
                    
                    setUsers(formattedUsers)
                }
            } catch (error) {
                console.error('ຜິດພາດໃນການດຶງຂໍ້ມູນຜູ້ໃຊ້:', error)
            }

            // 2. ດຶງຂໍ້ມູນເງິນເດືອນ
            try {
                const salariesRes = await axios.get(`${API_CONFIG.BASE_URL}/salaries`, {
                    headers: API_CONFIG.getHeaders()
                })
                
                if (salariesRes.data && salariesRes.data.salaries) {
                    // ປັບຮູບແບບ user_id ຖ້າຕ້ອງການ
                    const formattedSalaries = salariesRes.data.salaries.map((salary: any) => {
                        // ປັບຮູບແບບ department ແລະ position ໃນ user_id
                        let departmentData = null
                        let positionData = null
                        
                        if (salary.user_id?.department_id) {
                            if (Array.isArray(salary.user_id.department_id)) {
                                departmentData = {
                                    _id: salary.user_id.department_id[0]?._id || '',
                                    name: salary.user_id.department_id[0]?.name || 
                                          salary.user_id.department_id[0]?.department_name || ''
                                }
                            } else if (typeof salary.user_id.department_id === 'object') {
                                departmentData = {
                                    _id: salary.user_id.department_id._id || '',
                                    name: salary.user_id.department_id.name || 
                                          salary.user_id.department_id.department_name || ''
                                }
                            }
                        }

                        if (salary.user_id?.position_id && typeof salary.user_id.position_id === 'object') {
                            positionData = {
                                _id: salary.user_id.position_id._id || '',
                                name: salary.user_id.position_id.name || 
                                      salary.user_id.position_id.position_name || ''
                            }
                        }

                        return {
                            ...salary,
                            user_id: {
                                ...salary.user_id,
                                department_id: departmentData,
                                position_id: positionData
                            }
                        }
                    })
                    
                    setSalaries(formattedSalaries)
                }
            } catch (error) {
                console.error('ຜິດພາດໃນການດຶງຂໍ້ມູນເງິນເດືອນ:', error)
            }

            // 3. ດຶງຂໍ້ມູນຄຳຮ້ອງຂໍ OT ແລະ Field Work
            try {
                const requestsRes = await axios.get(`${API_CONFIG.BASE_URL}/requests`, {
                    headers: API_CONFIG.getHeaders()
                })
                
                if (requestsRes.data && requestsRes.data.requests) {
                    setRequests(requestsRes.data.requests)
                }
            } catch (error) {
                console.error('ຜິດພາດໃນການດຶງຂໍ້ມູນຄຳຮ້ອງຂໍ:', error)
            }

            // 4. ດຶງຂໍ້ມູນການລາພັກ
            try {
                const dayOffsRes = await axios.get(`${API_CONFIG.BASE_URL}/day-off-requests/allrequests`, {
                    headers: API_CONFIG.getHeaders()
                })
                
                if (dayOffsRes.data && dayOffsRes.data.requests) {
                    setDayOffs(dayOffsRes.data.requests)
                } else if (dayOffsRes.data && Array.isArray(dayOffsRes.data)) {
                    setDayOffs(dayOffsRes.data)
                }
            } catch (error) {
                console.error('ຜິດພາດໃນການດຶງຂໍ້ມູນການລາພັກ:', error)
            }

        } catch (error) {
            console.error('ຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ:', error)
        } finally {
            setLoading(false)
        }
    }

    // ດຶງຂໍ້ມູນເມື່ອ component ເລີ່ມຕົ້ນ
    useEffect(() => {
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

            // ຄິດໄລ່ການເຕີບໂຕ
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
            const activeUsers = users.filter(u => u.status === 'Active' || u.status === 'Active').length
            const leaveRate = activeUsers > 0 
                ? (dayOffs.filter(d => d.status === 'Accepted' || d.status === 'ອະນຸມັດແລ້ວ').length / activeUsers) * 100 
                : 0

            // ນັບຈຳນວນຜະແຫນກ ແລະ ຕຳແໜ່ງ
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
                description: `ຍອດສຸດທິ: ${salary.net_salary.toLocaleString()} - ເດືອນ ${salary.month}/${salary.year}`,
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
            
            const requestType = req.title === 'OT' ? 'OT' : 
                               req.title === 'FIELD_WORK' ? 'ງານນອກ' : req.title
            
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

    // ການແຈກຢາຍຕາມຜະແຫນກ
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

    // ຟັງຊັນສຳລັບດຶງຂໍ້ມູນລະອຽດ
    const fetchUserDetails = async (userId: string) => {
        try {
            const response = await axios.get(`${API_CONFIG.BASE_URL}/users/${userId}`, {
                headers: API_CONFIG.getHeaders()
            })
            return response.data
        } catch (error) {
            console.error('Error fetching user details:', error)
            return null
        }
    }

    // ຟັງຊັນສຳລັບອັບເດດສະຖານະ
    const handleUpdateStatus = async (type: string, id: string, newStatus: string) => {
        try {
            let endpoint = ''
            
            switch (type) {
                case 'request':
                    endpoint = `${API_CONFIG.BASE_URL}/requests/${id}/status`
                    break
                case 'dayoff':
                    endpoint = `${API_CONFIG.BASE_URL}/day-off-requests/${id}/status`
                    break
                case 'salary':
                    endpoint = `${API_CONFIG.BASE_URL}/salaries/${id}/status`
                    break
                default:
                    return
            }
            
            await axios.put(endpoint, { status: newStatus }, {
                headers: API_CONFIG.getHeaders()
            })
            
            // Refresh data
            fetchAllData()
            
        } catch (error) {
            console.error('Error updating status:', error)
        }
    }
    /////////////
    const [requestTypeFilter, setRequestTypeFilter] = useState('ALL')
const [requestStatusFilter, setRequestStatusFilter] = useState('ALL')
const [leaveTypeFilter, setLeaveTypeFilter] = useState('ALL')
///////
const [searchTerm, setSearchTerm] = useState('')
const [monthFilter, setMonthFilter] = useState('')
const filteredSalaries = useMemo(() => {
    return salaries.filter(salary => {
        // 1. Filter ຕາມຊື່ ຫຼື ອີເມວ
        const fullName = `${salary.user_id?.first_name_en} ${salary.user_id?.last_name_en}`.toLowerCase();
        const email = (salary.user_id?.email || '').toLowerCase();
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                             email.includes(searchTerm.toLowerCase());

        // 2. Filter ຕາມເດືອນ
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        let matchesMonth = true;
        if (monthFilter === 'current') {
            matchesMonth = salary.month === currentMonth && salary.year === currentYear;
        } else if (monthFilter === 'last3') {
            // Logic ສໍາລັບ 3 ເດືອນຜ່ານມາ (ແບບງ່າຍ)
            matchesMonth = salary.year === currentYear && salary.month > (currentMonth - 3);
        }

        return matchesSearch && matchesMonth;
    });
}, [salaries, searchTerm, monthFilter]);
    // ຟັງຊັນສຳລັບຄົ້ນຫາ
    const handleSearch = async (searchTerm: string) => {
        if (!searchTerm.trim()) {
            fetchAllData()
            return
        }
        
        // ຄົ້ນຫາໃນຂໍ້ມູນທີ່ມີຢູ່ກ່ອນ (ຫຼືສາມາດດຶງ API ໃໝ່ໄດ້)
        const filteredUsers = users.filter(user => 
            user.first_name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.last_name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        
        // ສາມາດຕັ້ງຄ່າ filtered data ຢູ່ນີ້
        console.log('Filtered users:', filteredUsers)
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
           <div className="px-1 py-4 mb-2">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left Side: Navigation Tabs (Metronic Style) */}
        <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl w-fit">
            <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all duration-200 ${activeTab === 'overview' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                ໂດຍລວມ
            </button>
            <button
                onClick={() => setActiveTab('employees')}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all duration-200 ${activeTab === 'employees' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                ພະນັກງານ <span className="ml-1 opacity-60">({users.length})</span>
            </button>
            <button
                onClick={() => setActiveTab('salaries')}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all duration-200 ${activeTab === 'salaries' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                ເງິນເດືອນ <span className="ml-1 opacity-60">({salaries.length})</span>
            </button>
            <button
                onClick={() => setActiveTab('requests')}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all duration-200 ${activeTab === 'requests' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                ຄຳຮ້ອງຂໍ <span className="ml-1 opacity-60">({requests.length + dayOffs.length})</span>
            </button>
        </div>
        
        {/* Right Side: Filters & Actions */}
        <div className="flex items-center gap-3">
            {/* Time Range Selector (Slim Group) */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
                <button
                    onClick={() => setTimeRange('week')}
                    className={`px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-tight rounded-md transition-all ${timeRange === 'week' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                    ອາທິດ
                </button>
                <button
                    onClick={() => setTimeRange('month')}
                    className={`px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-tight rounded-md transition-all ${timeRange === 'month' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                    ເດືອນ
                </button>
                <button
                    onClick={() => setTimeRange('quarter')}
                    className={`px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-tight rounded-md transition-all ${timeRange === 'quarter' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                    3 ເດືອນ
                </button>
            </div>
            
            {/* Export Button (Minimal) */}
            <button 
                onClick={handleExportData}
                className="inline-flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-[12px] font-bold text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-all shadow-sm"
            >
                <Download className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                Export
            </button>
        </div>
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
                        subtitle={`${stats.activeEmployees} Active`}
                    />
                    
                    <StatCard
                        title="ລວມເງິນເດືອນເດືອນນີ້"
                        value={`${stats.totalSalaryThisMonth.toLocaleString()}`}
                        icon={DollarSign}
                        trend={{
                            value: Math.abs(stats.salaryGrowth),
                            isPositive: stats.salaryGrowth >= 0,
                            label: 'ຈາກເດືອນກ່ອນ'
                        }}
                        color="text-green-600"
                        subtitle={`ສະເລ່ຍ: ${Math.round(stats.avgSalary).toLocaleString()}`}
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
                        subtitle={`${stats.totalDepartments} ຜະແຫນກ, ${stats.totalPositions} ຕຳແໜ່ງ`}
                    />
                </div>

                {/* ສ່ວນໂດຍລວມ */}
                {activeTab === 'overview' && (
                    <>
                        {/* ກາຟ ແລະ ສະຖິຕິ */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* ການແຈກຢາຍຕາມຜະແຫນກ */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">ການແຈກຢາຍພະນັກງານຕາມຜະແຫນກ</h3>
                                        <p className="text-sm text-gray-500 mt-1">ຈຳນວນພະນັກງານໃນແຕ່ລະຜະແຫນກ</p>
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
            {/* ແນວໂນ້ມເງິນເດືອນ - แบบ Fix สูงตายตัว */}
<div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
    <div className="flex items-center justify-between mb-6">
        <div>
            <h3 className="text-lg font-semibold text-gray-900">ແນວໂນ້ມເງິນເດືອນລາຍເດືອນ</h3>
            <p className="text-sm text-gray-500 mt-1">
                ສະເລ່ຍເງິນເດືອນຕະຫຼອດປີ {new Date().getFullYear()}
            </p>
        </div>
        <BarChart className="w-5 h-5 text-gray-400" />
    </div>
    
    <div className="h-64">
        {monthlySalaryTrend.some(m => m.average > 0) ? (
            <div className="h-full flex items-end gap-1 md:gap-2 pb-2 border-b border-l border-gray-200">
                {monthlySalaryTrend.map((data) => {
                    const maxSalary = Math.max(...monthlySalaryTrend.map(d => d.average))
                    // ตั้งความสูงขั้นต่ำ 2% และสูงสุด 100%
                    const height = maxSalary > 0 
                        ? Math.max((data.average / maxSalary) * 100, 2) 
                        : 2
                    
                    return (
                        <div key={data.month} className="flex flex-col items-center flex-1 group relative h-full">
                            <div className="flex-1 w-full flex items-end">
                                <div 
                                    className="w-full bg-gradient-to-t from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 rounded-t-lg cursor-pointer"
                                    style={{ height: `${height}%` }}
                                    title={`ເດືອນ ${data.month}: ${Math.round(data.average).toLocaleString()}`}
                                >
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {Math.round(data.average).toLocaleString()}
                                    </div>
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
             <div className="mb-6">
    {/* Header: ກະທັດຮັດຂຶ້ນ */}
    <div className="flex items-center justify-between mb-4 px-1">
        <div>
            <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">ກິດຈະກຳລ່າສຸດ</h3>
        </div>
        <button className="text-[11px] font-bold text-blue-500 hover:text-blue-700 transition-colors">
            ເບິ່ງທັງໝົດ
        </button>
    </div>

    {recentActivities.length > 0 ? (
        /* 3-Column Mini Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recentActivities.map((activity) => {
                const Icon = activity.icon;
                
                // Mini Status Colors
                const statusTheme = {
                    pending: "text-orange-500",
                    accepted: "text-emerald-500",
                    paid: "text-blue-500",
                    failed: "text-rose-500"
                };
                const currentStatus = activity.status.toLowerCase();

                return (
                    <div 
                        key={activity.id} 
                        className="group bg-white border border-gray-100 rounded-xl p-3 hover:bg-gray-50 transition-all duration-200"
                    >
                        <div className="flex items-center gap-3">
                            {/* Icon: ຂະໜາດນ້ອຍລົງ (Small Icon) */}
                            <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${activity.color.replace('text-', 'bg-').replace('500', '100')} bg-opacity-30`}>
                                <Icon className={`w-5 h-5 ${activity.color}`} />
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className="text-[13px] font-bold text-gray-800 truncate leading-tight group-hover:text-blue-600">
                                        {activity.title}
                                    </h4>
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                        {moment(activity.timestamp).format('HH:mm')}
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between mt-0.5">
                                    <p className="text-[11px] text-gray-500 truncate pr-2">
                                        {activity.description}
                                    </p>
                                    {/* Mini Dot Status */}
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <span className={`w-1.5 h-1.5 rounded-full bg-current ${statusTheme[currentStatus] || 'text-gray-400'}`}></span>
                                        <span className={`text-[10px] font-bold uppercase tracking-tighter ${statusTheme[currentStatus] || 'text-gray-400'}`}>
                                            {activity.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    ) : (
        <div className="bg-gray-50 rounded-xl py-6 text-center border border-dashed border-gray-200">
            <p className="text-[12px] text-gray-400 font-medium">ບໍ່ມີຂໍ້ມູນ</p>
        </div>
    )}
</div>

                        {/* ສະຖິຕິລາຍລະອຽດ */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
    {/* Card 1: ສະຖິຕິຄຳຮ້ອງຂໍ */}
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center">
            <h3 className="text-[13px] font-bold text-gray-800 uppercase tracking-tight">ສະຖິຕິຄຳຮ້ອງຂໍ</h3>
            <span className="text-[11px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">ລວມ: {requestStats.total}</span>
        </div>
        
        <div className="p-5 space-y-4">
            {/* ລໍຖ້າອະນຸມັດ */}
            <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[12px]">
                    <span className="font-medium text-gray-600">ລໍຖ້າອະນຸມັດ</span>
                    <span className="font-bold text-gray-800">{requestStats.pending}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${(requestStats.pending / requestStats.total) * 100}%` }}></div>
                </div>
            </div>

            {/* ອະນຸມັດແລ້ວ */}
            <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[12px]">
                    <span className="font-medium text-gray-600">ອະນຸມັດແລ້ວ</span>
                    <span className="font-bold text-gray-800">{requestStats.accepted}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(requestStats.accepted / requestStats.total) * 100}%` }}></div>
                </div>
            </div>

            {/* ປະຕິເສດ */}
            <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[12px]">
                    <span className="font-medium text-gray-600">ປະຕິເສດ</span>
                    <span className="font-bold text-gray-800">{requestStats.rejected}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${(requestStats.rejected / requestStats.total) * 100}%` }}></div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 group hover:bg-blue-50 transition-colors">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">OT</p>
                    <p className="text-lg font-black text-gray-800 group-hover:text-blue-600">{requestStats.otRequests}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 group hover:bg-purple-50 transition-colors">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">ງານນອກ</p>
                    <p className="text-lg font-black text-gray-800 group-hover:text-purple-600">{requestStats.fieldWorkRequests}</p>
                </div>
            </div>
        </div>
    </div>

    {/* Card 2: ສະຖິຕິການລາພັກ */}
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center">
            <h3 className="text-[13px] font-bold text-gray-800 uppercase tracking-tight">ສະຖິຕິການລາພັກ</h3>
            <span className="text-[11px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">ລວມ: {leaveStats.total}</span>
        </div>
        
        <div className="p-5 space-y-4">
            {/* ລໍຖ້າອະນຸມັດ */}
            <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[12px]">
                    <span className="font-medium text-gray-600">ລໍຖ້າອະນຸມັດ</span>
                    <span className="font-bold text-gray-800">{leaveStats.pending}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${(leaveStats.pending / leaveStats.total) * 100}%` }}></div>
                </div>
            </div>

            {/* ອະນຸມັດແລ້ວ */}
            <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[12px]">
                    <span className="font-medium text-gray-600">ອະນຸມັດແລ້ວ</span>
                    <span className="font-bold text-gray-800">{leaveStats.accepted}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(leaveStats.accepted / leaveStats.total) * 100}%` }}></div>
                </div>
            </div>

            {/* ປະຕິເສດ */}
            <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[12px]">
                    <span className="font-medium text-gray-600">ປະຕິເສດ</span>
                    <span className="font-bold text-gray-800">{leaveStats.rejected}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${(leaveStats.rejected / leaveStats.total) * 100}%` }}></div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 group hover:bg-orange-50 transition-colors">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">ຄັ້ງເຄິ່ງວັນ</p>
                    <p className="text-lg font-black text-gray-800 group-hover:text-orange-600">{leaveStats.halfDay}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 group hover:bg-indigo-50 transition-colors">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">ທັງໝົດວັນ</p>
                    <p className="text-lg font-black text-gray-800 group-hover:text-indigo-600">{leaveStats.fullDay}</p>
                </div>
            </div>
        </div>
    </div>
</div>
                    </>
                )}

                {/* ສ່ວນພະນັກງານ */}
                {activeTab === 'employees' && (
               <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden font-sans">
    {/* Header: Super Slim */}
    <div className="px-3 py-2 border-b border-gray-50 flex items-center justify-between bg-white">
        <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-tighter">ພະນັກງານ ({users.length})</h3>
        <div className="flex items-center gap-2">
            <div className="relative">
                <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="ຄົ້ນຫາ..."
                    className="pl-7 pr-2 py-0.5 bg-gray-50 border-none rounded text-[10px] w-[110px] focus:ring-1 focus:ring-blue-500/20"
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>
            <button className="h-6 w-6 flex items-center justify-center bg-blue-600 text-white rounded hover:bg-blue-700 transition-all shadow-sm">
                <Plus className="w-3.5 h-3.5" />
            </button>
        </div>
    </div>
    
    {/* 4-Column Ultra Compact Grid */}
    <div className="p-2 bg-[#F9FAFB]">
        {users.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5">
                {users.slice(0, 12).map((user) => (
                    <div 
                        key={user._id} 
                        className="group bg-white border border-gray-100 rounded-lg p-2.5 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer relative"
                        onClick={() => handleViewDetails('user', user._id)}
                    >
                        {/* Status Dot */}
                        <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]' : 'bg-gray-300'}`}></div>

                        {/* Top: Name & Email */}
                        <div className="mb-2">
                            <h4 className="text-[12px] font-bold text-gray-800 truncate leading-none group-hover:text-blue-600 transition-colors">
                                {user.first_name_en} {user.last_name_en}
                            </h4>
                            <p className="text-[9px] text-gray-400 truncate mt-1">{user.email}</p>
                        </div>

                        {/* Middle: Dept & Position (Compact Row) */}
                        <div className="flex flex-col gap-0.5 mb-2 py-1.5 border-y border-gray-50">
                            <div className="flex items-center text-[10px] text-gray-500 font-medium">
                                <span className="truncate">{user.department_id?.department_name || 'No Dept'}</span>
                            </div>
                            <div className="flex items-center text-[9px] text-gray-400">
                                <span className="truncate">{user.position_id?.position_name || 'Staff'}</span>
                            </div>
                        </div>

                        {/* Bottom: Full Salary Amount */}
                        <div className="flex justify-between items-baseline">
                            <span className="text-[8px] font-black text-gray-300 uppercase tracking-tighter">Net Pay</span>
                            <span className="text-[13px] font-black text-gray-900 tracking-tight">
                                {user.base_salary ? user.base_salary.toLocaleString() : '0'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="py-8 text-center bg-white rounded-lg border border-dashed border-gray-200">
                <p className="text-[10px] text-gray-400 font-bold uppercase">ບໍ່ມີຂໍ້ມູນພະນັກງານ</p>
            </div>
        )}
    </div>
</div>
                )}

                {/* ສ່ວນເງິນເດືອນ */}
                {activeTab === 'salaries' && (
                   <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    {/* Table Header & Controls */}
    <div className="p-4 border-b border-gray-50 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h3 className="text-[15px] font-black text-gray-800 tracking-tight">ປະຫວັດເງິນເດືອນ</h3>
                <p className="text-[11px] text-gray-400 font-medium">ລວມ {salaries.length} ລາຍການ</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {/* Search Input */}
                <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
    type="text"
    placeholder="ຄົ້ນຫາຊື່ ຫຼື ອີເມວ..."
    value={searchTerm} // ເພີ່ມໂຕນີ້
    className="pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[12px] w-full md:w-[220px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
    onChange={(e) => setSearchTerm(e.target.value)} // ອັບເດດ State
/>
                </div>

                {/* Month Filter */}
           <select 
    value={monthFilter} // ເພີ່ມໂຕນີ້
    className="pl-3 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[12px] font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
    onChange={(e) => setMonthFilter(e.target.value)} // ອັບເດດ State
>
    <option value="">ທຸກເດືອນ</option>
    <option value="current">ເດືອນນີ້</option>
    <option value="last3">3 ເດືອນຜ່ານມາ</option>
</select>

                {/* Add Button - Compact */}
                <button 
                    className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[12px] font-bold hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all"
                    onClick={() => window.location.href = '/salary-calculator'}
                >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    ຄິດໄລ່ໃໝ່
                </button>
            </div>
        </div>
    </div>
    
    {/* Table Area */}
    <div className="overflow-x-auto">
        <table className="w-full">
            <thead>
                <tr className="bg-gray-50/50">
                    <th className="px-5 py-3 text-left text-[11px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100">ພະນັກງານ</th>
                    <th className="px-5 py-3 text-left text-[11px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100">ໄລຍະເວລາ</th>
                    <th className="px-5 py-3 text-left text-[11px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">ເງິນພື້ນຖານ</th>
                    <th className="px-5 py-3 text-left text-[11px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">OT / ອຸດໜູນ</th>
                    <th className="px-5 py-3 text-left text-[11px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">ຫັກເງິນ</th>
                    <th className="px-5 py-3 text-left text-[11px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">ຍອດສຸດທິ</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {filteredSalaries.slice(0, 10).map((salary) => (
                    <tr key={salary._id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-5 py-3">
                            <div className="flex flex-col">
                                <span className="text-[13px] font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                                    {salary.user_id?.first_name_en} {salary.user_id?.last_name_en}
                                </span>
                                <span className="text-[11px] text-gray-400">{salary.user_id?.email}</span>
                            </div>
                        </td>
                        <td className="px-5 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[11px] font-bold">
                                {salary.month}/{salary.year}
                            </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                            <span className="text-[12px] font-semibold text-gray-700">
                                {salary.base_salary.toLocaleString()}
                            </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                            <div className="flex flex-col">
                                <span className="text-[12px] font-bold text-emerald-600">+{salary.ot_amount.toLocaleString()}</span>
                                <span className="text-[10px] text-blue-500 font-medium">+{(salary.bonus + salary.commission).toLocaleString()}</span>
                            </div>
                        </td>
                        <td className="px-5 py-3 text-right">
                            <span className="text-[12px] font-bold text-rose-500">
                                -{(salary.office_expenses + salary.social_security).toLocaleString()}
                            </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                            <span className="text-[14px] font-black text-gray-900 tracking-tight">
                                {salary.net_salary.toLocaleString()}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        
        {salaries.length === 0 && (
            <div className="text-center py-16 bg-gray-50/30">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-[13px] text-gray-400 font-bold">ຍັງບໍ່ມີຂໍ້ມູນເງິນເດືອນ</p>
            </div>
        )}
    </div>
</div>
                )}

                {/* ສ່ວນຄຳຮ້ອງຂໍ */}
                {activeTab === 'requests' && (
   <div className="space-y-6">
    {/* --- Section: OT & Field Work (4 Columns) --- */}
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
                <h3 className="text-[12px] font-black text-gray-800 uppercase tracking-widest">OT & ງານນອກ ({requests.length})</h3>
            </div>
            
            <div className="flex items-center gap-2">
                <select 
                    className="pl-2 pr-7 py-1 bg-gray-50 border-none rounded text-[10px] font-bold text-gray-500 focus:ring-1 focus:ring-blue-500/20"
                    onChange={(e) => setRequestTypeFilter(e.target.value)}
                >
                    <option value="ALL">ທຸກປະເພດ</option>
                    <option value="OT">OT</option>
                    <option value="FIELD_WORK">ງານນອກ</option>
                </select>
                <select 
                    className="pl-2 pr-7 py-1 bg-gray-50 border-none rounded text-[10px] font-bold text-gray-500 focus:ring-1 focus:ring-blue-500/20"
                    onChange={(e) => setRequestStatusFilter(e.target.value)}
                >
                    <option value="ALL">ທຸກສະຖານະ</option>
                    <option value="Pending">ລໍຖ້າ...</option>
                    <option value="Accept">ອະນຸມັດ</option>
                    <option value="Reject">ປະຕິເສດ</option>
                </select>
            </div>
        </div>

        <div className="p-3 bg-[#FBFBFC]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {requests
                    .filter(r => (requestTypeFilter === 'ALL' || r.title === requestTypeFilter) && (requestStatusFilter === 'ALL' || r.status === requestStatusFilter))
                    .slice(0, 12).map((req) => (
                    <div key={req._id} className="group bg-white border border-gray-50 rounded-lg p-3 hover:border-blue-200 transition-all shadow-sm relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-full h-[1.5px] ${req.status === 'Accept' ? 'bg-emerald-400' : req.status === 'Reject' ? 'bg-rose-400' : 'bg-yellow-400'}`}></div>
                        
                        <div className="flex justify-between items-start mb-2">
                            <div className="min-w-0">
                                <h4 className="text-[12px] font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                                    {req.user_id?.first_name_en}
                                </h4>
                                <p className="text-[9px] text-gray-400 font-medium">{moment(req.date).format('DD/MM/YYYY')}</p>
                            </div>
                            <span className={`px-1 py-0.5 rounded-[4px] text-[8px] font-black uppercase ${req.title === 'OT' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                {req.title === 'OT' ? 'OT' : 'Field'}
                            </span>
                        </div>

                        <div className="bg-gray-50/50 rounded p-1.5 mb-2">
                            <p className="text-[10px] text-gray-500 line-clamp-1 italic">"{req.reason || 'No reason'}"</p>
                        </div>

                        <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center text-gray-400">
                                <Clock className="w-2.5 h-2.5 mr-1" />
                                <span className="text-[9px] font-bold text-gray-500">{req.start_hour}-{req.end_hour}</span>
                            </div>
                            <span className={`text-[9px] font-black uppercase ${req.status === 'Accept' ? 'text-emerald-500' : req.status === 'Reject' ? 'text-rose-500' : 'text-yellow-600'}`}>
                                {req.status === 'Accept' ? 'Approved' : req.status === 'Reject' ? 'Rejected' : 'Pending'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>

    {/* --- Section: Day Off Requests (4 Columns) --- */}
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-white">
            <h3 className="text-[12px] font-black text-gray-800 uppercase tracking-widest">ຄຳຮ້ອງຂໍລາພັກ ({dayOffs.length})</h3>
            <select 
                className="pl-2 pr-7 py-1 bg-gray-50 border-none rounded text-[10px] font-bold text-gray-500 focus:ring-1 focus:ring-blue-500/20"
                onChange={(e) => setLeaveTypeFilter(e.target.value)}
            >
                <option value="ALL">ທຸກປະເພດ</option>
                <option value="HALF_DAY">ເຄິ່ງວັນ</option>
                <option value="FULL_DAY">ເຕັມວັນ</option>
            </select>
        </div>

        <div className="p-3 bg-[#FBFBFC]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {dayOffs
                    .filter(d => (leaveTypeFilter === 'ALL' || d.day_off_type === leaveTypeFilter))
                    .slice(0, 12).map((dayOff) => (
                    <div key={dayOff._id} className="group bg-white border border-gray-50 rounded-lg p-3 hover:border-indigo-200 transition-all shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-[12px] font-bold text-gray-800 truncate">{dayOff.user_id?.first_name_en}</h4>
                            <span className="text-[9px] font-black px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded">
                                {dayOff.date_off_number} ວັນ
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-[9px] text-gray-400 mb-2">
                            <Calendar className="w-2.5 h-2.5" />
                            <span className="font-bold">{moment(dayOff.start_date_time).format('DD/MM')}-{moment(dayOff.end_date_time).format('DD/MM')}</span>
                        </div>

                        <p className="text-[10px] text-gray-400 truncate mb-2 pb-2 border-b border-gray-50">{dayOff.title}</p>
                        
                        <div className="flex justify-between items-center">
                            <span className={`text-[8px] font-black uppercase flex items-center gap-1 ${dayOff.status === 'Accepted' ? 'text-emerald-500' : 'text-yellow-500'}`}>
                                <span className={`w-1 h-1 rounded-full ${dayOff.status === 'Accepted' ? 'bg-emerald-500' : 'bg-yellow-500 animate-pulse'}`}></span>
                                {dayOff.status === 'Accepted' ? 'Approved' : 'Pending'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
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