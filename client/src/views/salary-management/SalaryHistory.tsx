import React, { useState, useEffect } from 'react'
import {
    Calendar,
    DollarSign,
    Download,
    Eye,
    Filter,
    Printer,
    Search,
    Trash2,
    User,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle,
    FileText,
    Building,
    Briefcase,
    Shield,
} from 'lucide-react'
import axios from 'axios'
import moment from 'moment'

// Interface สำหรับข้อมูลเงินเดือน
// Interface สำหรับข้อมูลเงินเดือน
interface Salary {
    _id: string
    user_id: {
        _id: string
        first_name_en: string
        last_name_en: string
        email: string
        role?: string
        department_id?: {
            _id: string
            name: string
        }
        position_id?: {
            _id: string
            name: string
        }
    }
    month: number
    year: number
    base_salary: number
    ot_amount: number
    ot_hours?: number // เพิ่ม field นี้
    ot_details?: any[] // เพิ่ม field นี้
    weekday_ot_hours?: number // เพิ่ม field นี้
    weekend_ot_hours?: number // เพิ่ม field นี้
    weekday_ot_amount?: number // เพิ่ม field นี้
    weekend_ot_amount?: number // เพิ่ม field นี้
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

// Interface สำหรับ Props
interface SalaryHistoryProps {
    user?: any // ถ้าต้องการดูเฉพาะ user นั้นๆ
    onSelectSalary?: (salary: Salary) => void
}

const SalaryHistory: React.FC<SalaryHistoryProps> = ({
    user,
    onSelectSalary,
}) => {
    const [salaries, setSalaries] = useState<Salary[]>([])
    const [filteredSalaries, setFilteredSalaries] = useState<Salary[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedYear, setSelectedYear] = useState<number>(
        new Date().getFullYear(),
    )
    const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all')
    const [selectedStatus, setSelectedStatus] = useState<string>('all')
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
    const [selectedPosition, setSelectedPosition] = useState<string>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [expandedRows, setExpandedRows] = useState<string[]>([])
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    // ดึงข้อมูลเงินเดือน
    const fetchSalaries = async () => {
        try {
            setLoading(true)
            setError(null)

            let url = '/api/salaries'
            const params: any = {}

            if (user) {
                params.userId = user._id
            }

            const response = await axios.get(url, { params })

            // เพิ่ม logging เพื่อ debug
            console.log('API Response:', response.data)

            if (
                response.data &&
                response.data.salaries &&
                response.data.salaries.length > 0
            ) {
                console.log('First salary structure:', {
                    user_id: response.data.salaries[0].user_id,
                    department:
                        response.data.salaries[0].user_id?.department_id,
                    position: response.data.salaries[0].user_id?.position_id,
                })
            }

            if (response.data && response.data.salaries) {
                setSalaries(response.data.salaries)
                setFilteredSalaries(response.data.salaries)
            }
        } catch (err: any) {
            setError(
                err.response?.data?.message || 'Failed to load salary history',
            )
            console.error('Error fetching salaries:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSalaries()
    }, [user])

    // Filter salaries
    useEffect(() => {
        let filtered = salaries

        // Filter by year
        if (selectedYear) {
            filtered = filtered.filter((salary) => salary.year === selectedYear)
        }

        // Filter by month
        if (selectedMonth !== 'all') {
            filtered = filtered.filter(
                (salary) => salary.month === selectedMonth,
            )
        }

        // Filter by status
        if (selectedStatus !== 'all') {
            filtered = filtered.filter(
                (salary) => salary.status === selectedStatus,
            )
        }

        // Filter by department
        if (selectedDepartment !== 'all') {
            filtered = filtered.filter(
                (salary) =>
                    salary.user_id.department_id?.name === selectedDepartment,
            )
        }

        // Filter by position
        if (selectedPosition !== 'all') {
            filtered = filtered.filter(
                (salary) =>
                    salary.user_id.position_id?.name === selectedPosition,
            )
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(
                (salary) =>
                    salary.user_id.first_name_en.toLowerCase().includes(term) ||
                    salary.user_id.last_name_en.toLowerCase().includes(term) ||
                    salary.user_id.email.toLowerCase().includes(term) ||
                    salary.user_id.role?.toLowerCase().includes(term) ||
                    salary.user_id.department_id?.name
                        ?.toLowerCase()
                        .includes(term) ||
                    salary.user_id.position_id?.name
                        ?.toLowerCase()
                        .includes(term) ||
                    salary.notes?.toLowerCase().includes(term),
            )
        }

        setFilteredSalaries(filtered)
    }, [
        salaries,
        selectedYear,
        selectedMonth,
        selectedStatus,
        selectedDepartment,
        selectedPosition,
        searchTerm,
    ])
    // สร้างฟังก์ชันแปลงข้อมูล department/position
    const transformSalaryData = (
        salary: any,
        departments: any[],
        positions: any[],
    ) => {
        const userData = salary.user_id || {}

        // หา department
        let department = null
        if (userData.department_id) {
            const deptId = userData.department_id._id || userData.department_id
            const deptInfo = departments.find((d) => d._id === deptId)
            if (deptInfo) {
                department = {
                    _id: deptId,
                    name: deptInfo.department_name,
                }
            }
        }

        // หา position
        let position = null
        if (userData.position_id) {
            const posId = userData.position_id._id || userData.position_id
            const posInfo = positions.find((p) => p._id === posId)
            if (posInfo) {
                position = {
                    _id: posId,
                    name: posInfo.position_name,
                }
            }
        }

        return {
            ...salary,
            user_id: {
                ...userData,
                department_id: department || userData.department_id,
                position_id: position || userData.position_id,
            },
        }
    }
    // Get unique departments and positions for filters
    const getUniqueDepartments = () => {
        const departments = salaries
            .map((salary) => salary.user_id.department_id?.name)
            .filter((name): name is string => !!name)
        return ['all', ...new Set(departments)]
    }

    const getUniquePositions = () => {
        const positions = salaries
            .map((salary) => salary.user_id.position_id?.name)
            .filter((name): name is string => !!name)
        return ['all', ...new Set(positions)]
    }

    // Get month name
    const getMonthName = (monthNum: number) => {
        const months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
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
            0,
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

    // Delete salary
    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`/api/salaries/${id}`)
            fetchSalaries() // Refresh data
            setDeleteConfirm(null)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete salary')
        }
    }

    // Export to CSV
    const exportToCSV = () => {
        const headers = [
            'Employee',
            'Email',
            'Role',
            'Department',
            'Position',
            'Period',
            'Base Salary',
            'OT Amount',
            'Bonus',
            'Commission',
            'Fuel Costs',
            'Holiday Money',
            'Other Income',
            'Office Expenses',
            'Social Security',
            'Working Days',
            'Day Off Days',
            'Net Salary',
            'Status',
            'Created By',
            'Payment Date',
            'Notes',
        ]

        const csvData = filteredSalaries.map((salary) => [
            `${salary.user_id.first_name_en} ${salary.user_id.last_name_en}`,
            salary.user_id.email,
            salary.user_id.role || '',
            salary.user_id.department_id?.name || '',
            salary.user_id.position_id?.name || '',
            `${getMonthName(salary.month)} ${salary.year}`,
            salary.base_salary,
            salary.ot_amount,
            salary.bonus,
            salary.commission,
            salary.fuel_costs,
            salary.money_not_spent_on_holidays,
            salary.other_income,
            salary.office_expenses,
            salary.social_security,
            salary.working_days,
            salary.day_off_days,
            salary.net_salary,
            salary.status,
            `${salary.created_by.first_name_en} ${salary.created_by.last_name_en}`,
            moment(salary.payment_date).format('DD/MM/YYYY'),
            salary.notes || '',
        ])

        const csv = [headers, ...csvData]
            .map((row) => row.map((cell) => `"${cell}"`).join(','))
            .join('\n')

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute(
            'download',
            `salaries_${moment().format('YYYYMMDD_HHmmss')}.csv`,
        )
        link.click()
    }

    // Print function
    const handlePrint = () => {
        window.print()
    }

    // Get years for filter
    const getYears = () => {
        const currentYear = new Date().getFullYear()
        const years = []
        for (let i = currentYear; i >= currentYear - 5; i--) {
            years.push(i)
        }
        return years
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                    <span className="text-gray-600 font-medium">
                        Loading salary history...
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            Salary History
                        </h2>
                        <p className="text-sm text-gray-600">
                            {user
                                ? `${user.first_name_en} ${user.last_name_en}'s salary records`
                                : 'All salary records'}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={exportToCSV}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Printer className="w-4 h-4" />
                            Print
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Year
                        </label>
                        <select
                            value={selectedYear}
                            onChange={(e) =>
                                setSelectedYear(parseInt(e.target.value))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {getYears().map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Month
                        </label>
                        <select
                            value={selectedMonth}
                            onChange={(e) =>
                                setSelectedMonth(
                                    e.target.value === 'all'
                                        ? 'all'
                                        : parseInt(e.target.value),
                                )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Months</option>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(
                                (month) => (
                                    <option key={month} value={month}>
                                        {getMonthName(month)}
                                    </option>
                                ),
                            )}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="paid">Paid</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Department
                        </label>
                        <select
                            value={selectedDepartment}
                            onChange={(e) =>
                                setSelectedDepartment(e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Departments</option>
                            {getUniqueDepartments().map(
                                (dept, index) =>
                                    dept !== 'all' && (
                                        <option key={index} value={dept}>
                                            {dept}
                                        </option>
                                    ),
                            )}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Position
                        </label>
                        <select
                            value={selectedPosition}
                            onChange={(e) =>
                                setSelectedPosition(e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Positions</option>
                            {getUniquePositions().map(
                                (pos, index) =>
                                    pos !== 'all' && (
                                        <option key={index} value={pos}>
                                            {pos}
                                        </option>
                                    ),
                            )}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Search
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search employee, department..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mx-6 mt-4 bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-r-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="font-medium">Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                    <button
                        onClick={() => setError(null)}
                        className="text-red-500 hover:text-red-700"
                    >
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Summary Stats */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                            <FileText className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">
                                Total Records
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">
                            {filteredSalaries.length}
                        </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                            <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">
                                Total Net Salary
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                            ฿{calculateTotal('net_salary').toLocaleString()}
                        </p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                            <User className="w-5 h-5 text-yellow-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">
                                Employees
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-yellow-600">
                            {
                                [
                                    ...new Set(
                                        filteredSalaries.map(
                                            (s) => s.user_id._id,
                                        ),
                                    ),
                                ].length
                            }
                        </p>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                            <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">
                                Periods
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">
                            {
                                [
                                    ...new Set(
                                        filteredSalaries.map(
                                            (s) => `${s.month}/${s.year}`,
                                        ),
                                    ),
                                ].length
                            }
                        </p>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                            <Building className="w-5 h-5 text-indigo-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">
                                Departments
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-indigo-600">
                            {
                                [
                                    ...new Set(
                                        filteredSalaries
                                            .filter(
                                                (s) =>
                                                    s.user_id.department_id
                                                        ?.name,
                                            )
                                            .map(
                                                (s) =>
                                                    s.user_id.department_id
                                                        ?.name,
                                            ),
                                    ),
                                ].length
                            }
                        </p>
                    </div>

                    <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                            <Briefcase className="w-5 h-5 text-pink-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">
                                Positions
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-pink-600">
                            {
                                [
                                    ...new Set(
                                        filteredSalaries
                                            .filter(
                                                (s) =>
                                                    s.user_id.position_id?.name,
                                            )
                                            .map(
                                                (s) =>
                                                    s.user_id.position_id?.name,
                                            ),
                                    ),
                                ].length
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Employee
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Department
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Position
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
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
                                <td
                                    colSpan={9}
                                    className="px-6 py-12 text-center"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <FileText className="w-12 h-12 text-gray-400" />
                                        <p className="text-gray-500 font-medium">
                                            No salary records found
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            Try adjusting your filters or create
                                            a new salary record
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredSalaries.map((salary) => {
                                const isExpanded = expandedRows.includes(
                                    salary._id,
                                )
                                const statusInfo = getStatusInfo(salary.status)

                                return (
                                    <React.Fragment key={salary._id}>
                                        <tr
                                            className={`hover:bg-gray-50 ${isExpanded ? 'bg-blue-50' : ''}`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <User className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {
                                                                salary.user_id
                                                                    .first_name_en
                                                            }{' '}
                                                            {
                                                                salary.user_id
                                                                    .last_name_en
                                                            }
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {
                                                                salary.user_id
                                                                    .email
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Department Column */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                                                        <Building className="w-4 h-4 text-indigo-600" />
                                                    </div>
                                                    <div className="text-sm text-gray-900">
                                                        {salary.user_id
                                                            .department_id
                                                            ?.name || (
                                                            <span className="text-gray-400 italic">
                                                                Not set
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Position Column */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8 bg-pink-100 rounded-full flex items-center justify-center mr-2">
                                                        <Briefcase className="w-4 h-4 text-pink-600" />
                                                    </div>
                                                    <div className="text-sm text-gray-900">
                                                        {salary.user_id
                                                            .position_id
                                                            ?.name || (
                                                            <span className="text-gray-400 italic">
                                                                Not set
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Role Column */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                                                        <Shield className="w-4 h-4 text-green-600" />
                                                    </div>
                                                    <div className="text-sm text-gray-900">
                                                        {salary.user_id
                                                            .role || (
                                                            <span className="text-gray-400 italic">
                                                                Not set
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 font-medium">
                                                    {getMonthName(salary.month)}{' '}
                                                    {salary.year}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {salary.working_days}{' '}
                                                    working days
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-lg font-bold text-gray-900">
                                                    ฿
                                                    {salary.net_salary.toLocaleString()}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Base: ฿
                                                    {salary.base_salary.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                                                >
                                                    {statusInfo.icon}
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {moment(
                                                    salary.payment_date,
                                                ).format('DD/MM/YYYY')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            toggleRow(
                                                                salary._id,
                                                            )
                                                        }
                                                        className="text-blue-600 hover:text-blue-900 p-1"
                                                        title={
                                                            isExpanded
                                                                ? 'Hide details'
                                                                : 'Show details'
                                                        }
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronUp className="w-5 h-5" />
                                                        ) : (
                                                            <ChevronDown className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            onSelectSalary &&
                                                            onSelectSalary(
                                                                salary,
                                                            )
                                                        }
                                                        className="text-green-600 hover:text-green-900 p-1"
                                                        title="View details"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    {salary.status ===
                                                        'pending' && (
                                                        <button
                                                            onClick={() =>
                                                                setDeleteConfirm(
                                                                    salary._id,
                                                                )
                                                            }
                                                            className="text-red-600 hover:text-red-900 p-1"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <tr className="bg-blue-50">
                                                <td
                                                    colSpan={9}
                                                    className="px-6 py-4"
                                                >
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        {/* Employee Information */}
                                                        {/* Employee Information */}
                                                        {/* Employee Information */}
                                                        <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                                                            <h4 className="text-sm font-bold text-green-700 mb-3 uppercase flex items-center gap-2">
                                                                <User className="w-4 h-4" />
                                                                Employee
                                                                Information
                                                            </h4>
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                                        <User className="w-6 h-6 text-blue-600" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-lg font-bold text-gray-900">
                                                                            {
                                                                                salary
                                                                                    .user_id
                                                                                    .first_name_en
                                                                            }{' '}
                                                                            {
                                                                                salary
                                                                                    .user_id
                                                                                    .last_name_en
                                                                            }
                                                                        </div>
                                                                        <div className="text-sm text-gray-500">
                                                                            {
                                                                                salary
                                                                                    .user_id
                                                                                    .email
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="border-t border-gray-200 pt-3 space-y-2">
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-gray-700 font-medium flex items-center gap-2">
                                                                            <Shield className="w-4 h-4" />
                                                                            Role:
                                                                        </span>
                                                                        <span
                                                                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                                                salary
                                                                                    .user_id
                                                                                    .role
                                                                                    ? 'bg-green-100 text-green-800'
                                                                                    : 'bg-gray-100 text-gray-800'
                                                                            }`}
                                                                        >
                                                                            {salary
                                                                                .user_id
                                                                                .role ||
                                                                                'Not specified'}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-gray-700 font-medium flex items-center gap-2">
                                                                            <Building className="w-4 h-4" />
                                                                            Department:
                                                                        </span>
                                                                        <div className="flex flex-col items-end">
                                                                            <span
                                                                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                                                    salary
                                                                                        .user_id
                                                                                        .department_id
                                                                                        ?.name
                                                                                        ? 'bg-indigo-100 text-indigo-800'
                                                                                        : 'bg-gray-100 text-gray-800'
                                                                                }`}
                                                                            >
                                                                                {(() => {
                                                                                    const dept =
                                                                                        salary
                                                                                            .user_id
                                                                                            .department_id
                                                                                    if (
                                                                                        !dept
                                                                                    )
                                                                                        return 'Not specified'

                                                                                    // ถ้ามีชื่อ department
                                                                                    if (
                                                                                        dept.name &&
                                                                                        !dept.name.startsWith(
                                                                                            'Department ID:',
                                                                                        )
                                                                                    ) {
                                                                                        return dept.name
                                                                                    }

                                                                                    // ถ้าไม่มีชื่อ แต่มี _id
                                                                                    if (
                                                                                        dept._id
                                                                                    ) {
                                                                                        return `Dept ID: ${dept._id}`
                                                                                    }

                                                                                    return 'Not specified'
                                                                                })()}
                                                                            </span>
                                                                            {salary
                                                                                .user_id
                                                                                .department_id
                                                                                ?._id && (
                                                                                <span className="text-xs text-gray-500 mt-1">
                                                                                    ID:{' '}
                                                                                    {
                                                                                        salary
                                                                                            .user_id
                                                                                            .department_id
                                                                                            ._id
                                                                                    }
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-gray-700 font-medium flex items-center gap-2">
                                                                            <Briefcase className="w-4 h-4" />
                                                                            Position:
                                                                        </span>
                                                                        <div className="flex flex-col items-end">
                                                                            <span
                                                                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                                                    salary
                                                                                        .user_id
                                                                                        .position_id
                                                                                        ?.name
                                                                                        ? 'bg-pink-100 text-pink-800'
                                                                                        : 'bg-gray-100 text-gray-800'
                                                                                }`}
                                                                            >
                                                                                {(() => {
                                                                                    const pos =
                                                                                        salary
                                                                                            .user_id
                                                                                            .position_id
                                                                                    if (
                                                                                        !pos
                                                                                    )
                                                                                        return 'Not specified'

                                                                                    // ถ้ามีชื่อ position
                                                                                    if (
                                                                                        pos.name &&
                                                                                        !pos.name.startsWith(
                                                                                            'Position ID:',
                                                                                        )
                                                                                    ) {
                                                                                        return pos.name
                                                                                    }

                                                                                    // ถ้าไม่มีชื่อ แต่มี _id
                                                                                    if (
                                                                                        pos._id
                                                                                    ) {
                                                                                        return `Pos ID: ${pos._id}`
                                                                                    }

                                                                                    return 'Not specified'
                                                                                })()}
                                                                            </span>
                                                                            {salary
                                                                                .user_id
                                                                                .position_id
                                                                                ?._id && (
                                                                                <span className="text-xs text-gray-500 mt-1">
                                                                                    ID:{' '}
                                                                                    {
                                                                                        salary
                                                                                            .user_id
                                                                                            .position_id
                                                                                            ._id
                                                                                    }
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Income Details */}

                                                        {/* Deductions & Work Details */}
                                                        <div className="bg-white rounded-lg p-4 border border-red-200 shadow-sm">
                                                            <h4 className="text-sm font-bold text-red-700 mb-3 uppercase flex items-center gap-2">
                                                                <FileText className="w-4 h-4" />
                                                                Deductions &
                                                                Details
                                                            </h4>
                                                            <div className="space-y-4">
                                                                {/* Deductions */}
                                                                <div>
                                                                    <h5 className="text-xs font-semibold text-gray-700 mb-2">
                                                                        Deductions
                                                                    </h5>
                                                                    <div className="space-y-2">
                                                                        <div className="flex justify-between items-center py-1 border-b border-gray-100">
                                                                            <span className="text-sm text-gray-600">
                                                                                Office
                                                                                Expenses:
                                                                            </span>
                                                                            <span className="text-sm font-semibold text-gray-900">
                                                                                ฿
                                                                                {salary.office_expenses.toLocaleString()}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex justify-between items-center py-1">
                                                                            <span className="text-sm text-gray-600">
                                                                                Social
                                                                                Security:
                                                                            </span>
                                                                            <span className="text-sm font-semibold text-gray-900">
                                                                                ฿
                                                                                {salary.social_security.toLocaleString()}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="border-t border-red-200 pt-2 mt-2">
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-sm font-bold text-red-900">
                                                                                Total
                                                                                Deductions:
                                                                            </span>
                                                                            <span className="text-sm font-bold text-red-900">
                                                                                ฿
                                                                                {(
                                                                                    salary.office_expenses +
                                                                                    salary.social_security
                                                                                ).toLocaleString()}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Work Details */}
                                                                <div className="border-t border-gray-200 pt-3">
                                                                    <h5 className="text-xs font-semibold text-gray-700 mb-2">
                                                                        Work
                                                                        Details
                                                                    </h5>
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <div className="bg-gray-50 p-2 rounded">
                                                                            <div className="text-xs text-gray-500">
                                                                                Working
                                                                                Days
                                                                            </div>
                                                                            <div className="text-sm font-bold text-gray-800">
                                                                                {
                                                                                    salary.working_days
                                                                                }{' '}
                                                                                days
                                                                            </div>
                                                                        </div>
                                                                        <div className="bg-gray-50 p-2 rounded">
                                                                            <div className="text-xs text-gray-500">
                                                                                Day
                                                                                Off
                                                                                Days
                                                                            </div>
                                                                            <div className="text-sm font-bold text-gray-800">
                                                                                {
                                                                                    salary.day_off_days
                                                                                }{' '}
                                                                                days
                                                                            </div>
                                                                        </div>
                                                                        <div className="bg-gray-50 p-2 rounded">
                                                                            <div className="text-xs text-gray-500">
                                                                                Vacation
                                                                                Days
                                                                                Left
                                                                            </div>
                                                                            <div className="text-sm font-bold text-gray-800">
                                                                                {
                                                                                    salary.remaining_vacation_days
                                                                                }{' '}
                                                                                days
                                                                            </div>
                                                                        </div>
                                                                        <div className="bg-gray-50 p-2 rounded">
                                                                            <div className="text-xs text-gray-500">
                                                                                Created
                                                                                By
                                                                            </div>
                                                                            <div className="text-sm font-bold text-gray-800">
                                                                                {
                                                                                    salary
                                                                                        .created_by
                                                                                        .first_name_en
                                                                                }{' '}
                                                                                {
                                                                                    salary
                                                                                        .created_by
                                                                                        .last_name_en
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Notes */}
                                                                {salary.notes && (
                                                                    <div className="border-t border-gray-200 pt-3">
                                                                        <h5 className="text-xs font-semibold text-gray-700 mb-2">
                                                                            Notes
                                                                        </h5>
                                                                        <div className="bg-gray-50 p-3 rounded-lg">
                                                                            <p className="text-sm text-gray-600">
                                                                                {
                                                                                    salary.notes
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* OT Details Section - เพิ่มส่วนนี้ถ้ามี OT details */}
                                                        {salary.ot_details &&
                                                            salary.ot_details
                                                                .length > 0 && (
                                                                <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-lg p-4 border border-yellow-200 shadow-sm">
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <h4 className="text-sm font-bold text-yellow-700 uppercase flex items-center gap-2">
                                                                            <Clock className="w-4 h-4" />
                                                                            Overtime
                                                                            Details
                                                                        </h4>
                                                                        <div className="text-xs text-gray-500">
                                                                            Total
                                                                            OT:{' '}
                                                                            {salary.ot_hours ||
                                                                                0}{' '}
                                                                            hours
                                                                        </div>
                                                                    </div>

                                                                    <div className="overflow-x-auto">
                                                                        <table className="min-w-full divide-y divide-gray-200">
                                                                            <thead className="bg-gray-50">
                                                                                <tr>
                                                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                                                        Date
                                                                                    </th>
                                                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                                                        Type
                                                                                    </th>
                                                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                                                        Hours
                                                                                    </th>
                                                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                                                        Rate
                                                                                    </th>
                                                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                                                        Amount
                                                                                    </th>
                                                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                                                        Description
                                                                                    </th>
                                                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                                                        Source
                                                                                    </th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="divide-y divide-gray-200">
                                                                                {salary.ot_details.map(
                                                                                    (
                                                                                        detail: any,
                                                                                        index: number,
                                                                                    ) => (
                                                                                        <tr
                                                                                            key={
                                                                                                index
                                                                                            }
                                                                                            className="hover:bg-gray-50"
                                                                                        >
                                                                                            <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">
                                                                                                {detail.date
                                                                                                    ? moment(
                                                                                                          detail.date,
                                                                                                      ).format(
                                                                                                          'DD/MM/YYYY',
                                                                                                      )
                                                                                                    : 'N/A'}
                                                                                            </td>
                                                                                            <td className="px-3 py-2 whitespace-nowrap">
                                                                                                <span
                                                                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                                                                        detail.ot_type ===
                                                                                                        'weekday'
                                                                                                            ? 'bg-blue-100 text-blue-800'
                                                                                                            : 'bg-purple-100 text-purple-800'
                                                                                                    }`}
                                                                                                >
                                                                                                    {detail.ot_type ===
                                                                                                    'weekday'
                                                                                                        ? 'Weekday'
                                                                                                        : 'Weekend'}
                                                                                                </span>
                                                                                            </td>
                                                                                            <td className="px-3 py-2 text-sm text-gray-900">
                                                                                                {detail.total_hours ||
                                                                                                    0}{' '}
                                                                                                hrs
                                                                                            </td>
                                                                                            <td className="px-3 py-2 text-sm text-gray-900">
                                                                                                {detail.hourly_rate
                                                                                                    ? `฿${detail.hourly_rate}/hr`
                                                                                                    : detail.rate_per_day
                                                                                                      ? `฿${detail.rate_per_day}/day`
                                                                                                      : 'N/A'}
                                                                                            </td>
                                                                                            <td className="px-3 py-2 text-sm font-semibold text-gray-900">
                                                                                                ฿
                                                                                                {(
                                                                                                    detail.amount ||
                                                                                                    0
                                                                                                ).toLocaleString()}
                                                                                            </td>
                                                                                            <td className="px-3 py-2 text-sm text-gray-700 max-w-xs">
                                                                                                <div className="truncate">
                                                                                                    {detail.description ||
                                                                                                        '-'}
                                                                                                </div>
                                                                                            </td>
                                                                                            <td className="px-3 py-2 whitespace-nowrap">
                                                                                                <span
                                                                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                                                                        detail.is_manual
                                                                                                            ? 'bg-yellow-100 text-yellow-800'
                                                                                                            : 'bg-green-100 text-green-800'
                                                                                                    }`}
                                                                                                >
                                                                                                    {detail.is_manual
                                                                                                        ? 'Manual'
                                                                                                        : 'Auto'}
                                                                                                </span>
                                                                                            </td>
                                                                                        </tr>
                                                                                    ),
                                                                                )}
                                                                            </tbody>
                                                                            <tfoot className="bg-gray-50">
                                                                                <tr>
                                                                                    <td
                                                                                        colSpan={
                                                                                            2
                                                                                        }
                                                                                        className="px-3 py-2 text-sm font-bold text-gray-900"
                                                                                    >
                                                                                        Total
                                                                                    </td>
                                                                                    <td className="px-3 py-2 text-sm font-bold text-gray-900">
                                                                                        {salary.ot_details.reduce(
                                                                                            (
                                                                                                sum: number,
                                                                                                detail: any,
                                                                                            ) =>
                                                                                                sum +
                                                                                                (detail.total_hours ||
                                                                                                    0),
                                                                                            0,
                                                                                        )}{' '}
                                                                                        hours
                                                                                    </td>
                                                                                    <td className="px-3 py-2"></td>
                                                                                    <td className="px-3 py-2 text-sm font-bold text-gray-900">
                                                                                        ฿
                                                                                        {salary.ot_details
                                                                                            .reduce(
                                                                                                (
                                                                                                    sum: number,
                                                                                                    detail: any,
                                                                                                ) =>
                                                                                                    sum +
                                                                                                    (detail.amount ||
                                                                                                        0),
                                                                                                0,
                                                                                            )
                                                                                            .toLocaleString()}
                                                                                    </td>
                                                                                    <td
                                                                                        colSpan={
                                                                                            2
                                                                                        }
                                                                                        className="px-3 py-2"
                                                                                    ></td>
                                                                                </tr>
                                                                            </tfoot>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            )}

                                                        {/* ถ้าไม่มี OT details ให้แสดงข้อความ */}
                                                        {(!salary.ot_details ||
                                                            salary.ot_details
                                                                .length ===
                                                                0) && (
                                                            <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                                                <div className="flex items-center gap-3">
                                                                    <Clock className="w-5 h-5 text-yellow-500" />
                                                                    <div>
                                                                        <p className="text-sm font-medium text-yellow-800">
                                                                            No
                                                                            overtime
                                                                            details
                                                                            available
                                                                        </p>
                                                                        <p className="text-xs text-yellow-600">
                                                                            Total
                                                                            OT
                                                                            amount
                                                                            for
                                                                            this
                                                                            period:
                                                                            ฿
                                                                            {salary.ot_amount.toLocaleString()}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
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
                        Showing{' '}
                        <span className="font-medium">
                            {filteredSalaries.length}
                        </span>{' '}
                        of{' '}
                        <span className="font-medium">{salaries.length}</span>{' '}
                        records
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

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">
                                Confirm Delete
                            </h3>
                        </div>
                        <div className="px-6 py-4">
                            <p className="text-gray-700">
                                Are you sure you want to delete this salary
                                record? This action cannot be undone.
                            </p>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-700 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SalaryHistory
