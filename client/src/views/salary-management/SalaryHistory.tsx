'use client'

import React, { useState, useEffect } from 'react'
import {
    Calendar,
    DollarSign,
    Download,
    Printer,
    Search,
    Trash2,
    User,
    AlertCircle,
    XCircle,
    FileText,
    Building,
    Briefcase,
    Shield,
    Filter,
    ChevronDown,
    ChevronUp,
} from 'lucide-react'
import axios from 'axios'
import moment from 'moment'
import SalaryHistoryTable from './SalaryHistoryTable'

// Interface for salary data
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
    ot_hours?: number
    ot_details?: any[]
    weekday_ot_hours?: number
    weekend_ot_hours?: number
    weekday_ot_amount?: number
    weekend_ot_amount?: number
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

// Interface for Props
interface SalaryHistoryProps {
    user?: any
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
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [showFilters, setShowFilters] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    // Detect screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)

        return () => {
            window.removeEventListener('resize', checkMobile)
        }
    }, [])

    // Fetch salary data
    const fetchSalaries = async () => {
        try {
            setLoading(true)
            setError(null)

            const url = '/api/salaries'
            const params: any = {}

            if (user) {
                params.userId = user._id
            }

            const response = await axios.get(url, { params })

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
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ]
        return months[monthNum - 1] || ''
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

    // Calculate total
    const calculateTotal = (field: keyof Salary) => {
        return filteredSalaries.reduce(
            (sum, salary) => sum + ((salary[field] as number) || 0),
            0,
        )
    }

    // Format currency for mobile
    const formatMobileCurrency = (amount: number) => {
        if (isMobile) {
            if (amount >= 1000000) {
                return `$${(amount / 1000000).toFixed(1)}M`
            }
            if (amount >= 1000) {
                return `$${(amount / 1000).toFixed(1)}K`
            }
        }
        return `$${amount.toLocaleString()}`
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
        <div className="bg-white rounded-lg shadow-lg overflow-hidden p-2">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="min-w-0">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                            Salary History
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                            {user
                                ? `${user.first_name_en} ${user.last_name_en}'s salary records`
                                : 'All salary records'}
                        </p>
                    </div>
                    {/* <div className="flex flex-wrap gap-2">
                        <button
                            onClick={exportToCSV}
                            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0"
                        >
                            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Export CSV</span>
                            <span className="inline sm:hidden">CSV</span>
                        </button>
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0"
                        >
                            <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Print</span>
                            <span className="inline sm:hidden">Print</span>
                        </button>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0 md:hidden"
                        >
                            <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>Filters</span>
                            {showFilters ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                            )}
                        </button>
                    </div> */}
                </div>
            </div>

            {/* Mobile Search Bar */}
            <div className="px-4 py-3 border-b border-gray-200 md:hidden">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search employee, department..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Filters - Responsive */}
            <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                        {/* Year Filter */}
                        <div className="space-y-1">
                            <label className="block text-xs sm:text-sm font-medium text-gray-700">
                                Year
                            </label>
                            <select
                                value={selectedYear}
                                onChange={(e) =>
                                    setSelectedYear(parseInt(e.target.value))
                                }
                                className="w-full pl-10 h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                            >
                                {getYears().map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Month Filter */}
                        <div className="space-y-1">
                            <label className="block text-xs sm:text-sm font-medium text-gray-700">
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
                                className="w-full pl-10 h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                            >
                                <option value="all">All Months</option>
                                {Array.from(
                                    { length: 12 },
                                    (_, i) => i + 1,
                                ).map((month) => (
                                    <option key={month} value={month}>
                                        {getMonthName(month)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-1">
                            <label className="block text-xs sm:text-sm font-medium text-gray-700">
                                Status
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={(e) =>
                                    setSelectedStatus(e.target.value)
                                }
                                className="w-full pl-10 h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="paid">Paid</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Department Filter */}
                        <div className="space-y-1">
                            <label className="block text-xs sm:text-sm font-medium text-gray-700">
                                Department
                            </label>
                            <select
                                value={selectedDepartment}
                                onChange={(e) =>
                                    setSelectedDepartment(e.target.value)
                                }
                                className="w-full pl-10 h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                            >
                                <option value="all">All Depts</option>
                                {getUniqueDepartments().map(
                                    (dept, index) =>
                                        dept !== 'all' && (
                                            <option key={index} value={dept}>
                                                {isMobile && dept.length > 12
                                                    ? `${dept.substring(0, 12)}...`
                                                    : dept}
                                            </option>
                                        ),
                                )}
                            </select>
                        </div>

                        {/* Position Filter */}
                        <div className="space-y-1">
                            <label className="block text-xs sm:text-sm font-medium text-gray-700">
                                Position
                            </label>
                            <select
                                value={selectedPosition}
                                onChange={(e) =>
                                    setSelectedPosition(e.target.value)
                                }
                                className="w-full pl-10 h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                            >
                                <option value="all">All Positions</option>
                                {getUniquePositions().map(
                                    (pos, index) =>
                                        pos !== 'all' && (
                                            <option key={index} value={pos}>
                                                {isMobile && pos.length > 12
                                                    ? `${pos.substring(0, 12)}...`
                                                    : pos}
                                            </option>
                                        ),
                                )}
                            </select>
                        </div>

                        {/* Desktop Search */}
                        <div className="space-y-1 md:block hidden">
                            <label className="block text-xs sm:text-sm font-medium text-gray-700">
                                Search
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full pl-10 h-[50px] px-3 py-2 border border-none rounded-lg bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mx-4 sm:mx-6 mt-4 bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-r-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="font-medium text-sm">Error</p>
                        <p className="text-xs">{error}</p>
                    </div>
                    <button
                        onClick={() => setError(null)}
                        className="text-red-500 hover:text-red-700"
                    >
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Summary Stats - Responsive */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {/* Records */}
                    <div className="bg-blue-50 border-none rounded-lg p-3 sm:p-4">
                        <div className="flex items-center mb-1 sm:mb-2">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-1.5 sm:mr-2" />
                            <span className="text-xs sm:text-sm font-medium text-blue-800">
                                Records
                            </span>
                        </div>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-900">
                            {filteredSalaries.length}
                        </p>
                    </div>

                    {/* Total Net Salary */}
                    <div className="bg-green-50 border-none rounded-lg p-3 sm:p-4">
                        <div className="flex items-center mb-1 sm:mb-2">
                            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-1.5 sm:mr-2" />
                            <span className="text-xs sm:text-sm font-medium text-green-800">
                                Net Salary
                            </span>
                        </div>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-900">
                            {formatMobileCurrency(calculateTotal('net_salary'))}
                        </p>
                    </div>

                    {/* Total Base Salary */}
                    <div className="bg-purple-50 border-none rounded-lg p-3 sm:p-4">
                        <div className="flex items-center mb-1 sm:mb-2">
                            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mr-1.5 sm:mr-2" />
                            <span className="text-xs sm:text-sm font-medium text-purple-800">
                                Base Salary
                            </span>
                        </div>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-purple-900">
                            {formatMobileCurrency(
                                calculateTotal('base_salary'),
                            )}
                        </p>
                    </div>

                    {/* Total OT */}
                    <div className="bg-orange-50 border-none rounded-lg p-3 sm:p-4">
                        <div className="flex items-center mb-1 sm:mb-2">
                            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mr-1.5 sm:mr-2" />
                            <span className="text-xs sm:text-sm font-medium text-orange-800">
                                Overtime
                            </span>
                        </div>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-orange-900">
                            {formatMobileCurrency(calculateTotal('ot_amount'))}
                        </p>
                    </div>

                    {/* Total Bonus */}
                    <div className="bg-teal-50 border-none rounded-lg p-3 sm:p-4">
                        <div className="flex items-center mb-1 sm:mb-2">
                            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 mr-1.5 sm:mr-2" />
                            <span className="text-xs sm:text-sm font-medium text-teal-800">
                                Bonus
                            </span>
                        </div>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-teal-900">
                            {formatMobileCurrency(calculateTotal('bonus'))}
                        </p>
                    </div>

                    {/* Total Deductions */}
                    <div className="bg-red-50 border-none rounded-lg p-3 sm:p-4">
                        <div className="flex items-center mb-1 sm:mb-2">
                            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mr-1.5 sm:mr-2" />
                            <span className="text-xs sm:text-sm font-medium text-red-800">
                                Deductions
                            </span>
                        </div>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-900">
                            {formatMobileCurrency(
                                calculateTotal('office_expenses') +
                                    calculateTotal('social_security'),
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Mobile Info Banner */}
            {isMobile && filteredSalaries.length > 0 && (
                <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
                    <p className="text-xs text-blue-700 text-center">
                        Scroll horizontally to view more columns →
                    </p>
                </div>
            )}

            {/* Table */}
            <SalaryHistoryTable
                salaries={filteredSalaries}
                onSelectSalary={onSelectSalary}
                onDelete={handleDelete}
                getMonthName={getMonthName}
                deleteConfirm={deleteConfirm}
                setDeleteConfirm={setDeleteConfirm}
            />

            {/* Empty State */}
            {filteredSalaries.length === 0 && !loading && (
                <div className="px-4 sm:px-6 py-12 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No salary records found
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                        {searchTerm ||
                        selectedStatus !== 'all' ||
                        selectedDepartment !== 'all' ||
                        selectedPosition !== 'all'
                            ? 'Try adjusting your filters or search term'
                            : 'No salary records available for the selected criteria'}
                    </p>
                    {(searchTerm ||
                        selectedStatus !== 'all' ||
                        selectedDepartment !== 'all' ||
                        selectedPosition !== 'all') && (
                        <button
                            onClick={() => {
                                setSearchTerm('')
                                setSelectedStatus('all')
                                setSelectedDepartment('all')
                                setSelectedPosition('all')
                                setSelectedMonth('all')
                                setSelectedYear(new Date().getFullYear())
                            }}
                            className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            )}

            {/* Mobile Footer */}
            {isMobile && filteredSalaries.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            <span className="font-medium">
                                {filteredSalaries.length}
                            </span>{' '}
                            records
                        </div>
                        <div className="text-sm font-medium text-blue-600">
                            Total:{' '}
                            {formatMobileCurrency(calculateTotal('net_salary'))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SalaryHistory
