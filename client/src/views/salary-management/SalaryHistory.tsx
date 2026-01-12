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
} from 'lucide-react'
import axios from 'axios'
import moment from 'moment'

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

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(
                (salary) =>
                    salary.user_id.first_name_en.toLowerCase().includes(term) ||
                    salary.user_id.last_name_en.toLowerCase().includes(term) ||
                    salary.user_id.email.toLowerCase().includes(term) ||
                    salary.notes?.toLowerCase().includes(term),
            )
        }

        setFilteredSalaries(filtered)
    }, [salaries, selectedYear, selectedMonth, selectedStatus, searchTerm])

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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                            Search
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search employee..."
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                                    colSpan={6}
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
                                                    colSpan={6}
                                                    className="px-6 py-4"
                                                >
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {/* Income Details */}
                                                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                                                            <h4 className="text-sm font-bold text-blue-700 mb-3 uppercase">
                                                                Income Breakdown
                                                            </h4>
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between py-1">
                                                                    <span className="text-gray-700">
                                                                        Base
                                                                        Salary:
                                                                    </span>
                                                                    <span className="font-semibold text-gray-900">
                                                                        ฿
                                                                        {salary.base_salary.toLocaleString()}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between py-1">
                                                                    <span className="text-gray-700">
                                                                        OT
                                                                        Amount:
                                                                    </span>
                                                                    <span className="font-semibold text-gray-900">
                                                                        ฿
                                                                        {salary.ot_amount.toLocaleString()}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between py-1">
                                                                    <span className="text-gray-700">
                                                                        Bonus:
                                                                    </span>
                                                                    <span className="font-semibold text-gray-900">
                                                                        ฿
                                                                        {salary.bonus.toLocaleString()}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between py-1">
                                                                    <span className="text-gray-700">
                                                                        Commission:
                                                                    </span>
                                                                    <span className="font-semibold text-gray-900">
                                                                        ฿
                                                                        {salary.commission.toLocaleString()}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between py-1">
                                                                    <span className="text-gray-700">
                                                                        Fuel
                                                                        Costs:
                                                                    </span>
                                                                    <span className="font-semibold text-gray-900">
                                                                        ฿
                                                                        {salary.fuel_costs.toLocaleString()}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between py-1">
                                                                    <span className="text-gray-700">
                                                                        Holiday
                                                                        Money:
                                                                    </span>
                                                                    <span className="font-semibold text-gray-900">
                                                                        ฿
                                                                        {salary.money_not_spent_on_holidays.toLocaleString()}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between py-1">
                                                                    <span className="text-gray-700">
                                                                        Other
                                                                        Income:
                                                                    </span>
                                                                    <span className="font-semibold text-gray-900">
                                                                        ฿
                                                                        {salary.other_income.toLocaleString()}
                                                                    </span>
                                                                </div>
                                                                <div className="border-t border-blue-200 my-2 pt-2">
                                                                    <div className="flex justify-between font-bold text-blue-900">
                                                                        <span>
                                                                            Total
                                                                            Income:
                                                                        </span>
                                                                        <span>
                                                                            ฿
                                                                            {(
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
                                                                    <span className="text-gray-700">
                                                                        Office
                                                                        Expenses:
                                                                    </span>
                                                                    <span className="font-semibold text-gray-900">
                                                                        ฿
                                                                        {salary.office_expenses.toLocaleString()}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between py-1">
                                                                    <span className="text-gray-700">
                                                                        Social
                                                                        Security:
                                                                    </span>
                                                                    <span className="font-semibold text-gray-900">
                                                                        ฿
                                                                        {salary.social_security.toLocaleString()}
                                                                    </span>
                                                                </div>
                                                                <div className="border-t border-red-200 my-2 pt-2">
                                                                    <div className="flex justify-between font-bold text-red-900">
                                                                        <span>
                                                                            Total
                                                                            Deductions:
                                                                        </span>
                                                                        <span>
                                                                            ฿
                                                                            {(
                                                                                salary.office_expenses +
                                                                                salary.social_security
                                                                            ).toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                                <h4 className="text-sm font-bold text-gray-800 mb-2">
                                                                    Additional
                                                                    Information
                                                                </h4>
                                                                <div className="space-y-1 text-sm text-gray-700">
                                                                    <div className="flex justify-between">
                                                                        <span>
                                                                            Working
                                                                            Days:
                                                                        </span>
                                                                        <span className="font-semibold">
                                                                            {
                                                                                salary.working_days
                                                                            }{' '}
                                                                            days
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span>
                                                                            Day
                                                                            Off
                                                                            Days:
                                                                        </span>
                                                                        <span className="font-semibold">
                                                                            {
                                                                                salary.day_off_days
                                                                            }{' '}
                                                                            days
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span>
                                                                            Vacation
                                                                            Days
                                                                            Left:
                                                                        </span>
                                                                        <span className="font-semibold">
                                                                            {
                                                                                salary.remaining_vacation_days
                                                                            }{' '}
                                                                            days
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span>
                                                                            Created
                                                                            By:
                                                                        </span>
                                                                        <span className="font-semibold">
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
                                                                        </span>
                                                                    </div>
                                                                    {salary.notes && (
                                                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                                                            <span className="text-gray-700">
                                                                                Notes:
                                                                            </span>
                                                                            <p className="text-sm text-gray-600 mt-1">
                                                                                {
                                                                                    salary.notes
                                                                                }
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
