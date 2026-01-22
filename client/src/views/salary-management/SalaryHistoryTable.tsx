'use client'

import React, { useState, useRef } from 'react'
import {
    ChevronDown,
    ChevronUp,
    Eye,
    Trash2,
    User,
    Building,
    Briefcase,
    Shield,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    DollarSign,
    Calendar,
    Mail,
    Loader2,
    Download,
} from 'lucide-react'
import moment from 'moment'
import {
    getMonthName as getMonthNameUtil,
    formatCurrency,
    formatDate,
} from './constants'

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

interface SalaryHistoryTableProps {
    salaries: Salary[]
    onSelectSalary?: (salary: Salary) => void
    onDelete: (id: string) => Promise<void>
    getMonthName: (month: number) => string
    deleteConfirm: string | null
    setDeleteConfirm: (id: string | null) => void
}

const SalaryHistoryTable: React.FC<SalaryHistoryTableProps> = ({
    salaries,
    onSelectSalary,
    onDelete,
    getMonthName,
    deleteConfirm,
    setDeleteConfirm,
}) => {
    const [expandedRows, setExpandedRows] = useState<string[]>([])

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

    return (
        <>
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
                        {salaries.length === 0 ? (
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
                            salaries.map((salary) => {
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
                                                    $
                                                    {salary.net_salary.toLocaleString()}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Base: $
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
                                                    <SalaryDetails
                                                        salary={salary}
                                                        getMonthName={
                                                            getMonthName
                                                        }
                                                    />
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
                                onClick={() => onDelete(deleteConfirm)}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-700 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

// Subcomponent for salary details with email functionality
interface SalaryDetailsProps {
    salary: Salary
    getMonthName: (month: number) => string
}

const SalaryDetails: React.FC<SalaryDetailsProps> = ({
    salary,
    getMonthName,
}) => {
    const [isSendingEmail, setIsSendingEmail] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const [emailStatus, setEmailStatus] = useState<{
        success: boolean
        message: string
    } | null>(null)
    const payslipRef = useRef<HTMLDivElement>(null)

    // Calculate totals
    const totalIncome =
        salary.base_salary +
        salary.ot_amount +
        salary.bonus +
        salary.commission +
        salary.fuel_costs +
        salary.money_not_spent_on_holidays +
        salary.other_income
    const totalDeductions = salary.office_expenses + salary.social_security
    const userName = `${salary.user_id.first_name_en} ${salary.user_id.last_name_en}`
    const userEmail = salary.user_id.email

    // Function to export as PNG
    const exportToPNG = async () => {
        if (!payslipRef.current) return

        try {
            setIsExporting(true)
            const html2canvas = (await import('html2canvas')).default

            const canvas = await html2canvas(payslipRef.current, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false,
                // Fix for oklch color function not supported
                onclone: (clonedDoc) => {
                    const element = clonedDoc.querySelector('[data-payslip]')
                    if (element) {
                        // Apply computed styles to avoid oklch parsing issues
                        const allElements = element.querySelectorAll('*')
                        allElements.forEach((el) => {
                            const computed = window.getComputedStyle(
                                el as Element,
                            )
                            const htmlEl = el as HTMLElement
                            htmlEl.style.color = computed.color
                            htmlEl.style.backgroundColor =
                                computed.backgroundColor
                            htmlEl.style.borderColor = computed.borderColor
                        })
                    }
                },
            })

            const link = document.createElement('a')
            const fileName = `salary-slip-${userName.replace(/\s+/g, '-')}-${getMonthName(salary.month)}-${salary.year}.png`

            link.download = fileName
            link.href = canvas.toDataURL('image/png')
            link.click()

            URL.revokeObjectURL(link.href)
        } catch (error) {
            console.error('Failed to export PNG:', error)
            alert('Failed to export PNG. Please try again.')
        } finally {
            setIsExporting(false)
        }
    }

    // Function to send email with PNG attachment (Step 5 style)
    const sendEmailWithPayslip = async () => {
        if (!payslipRef.current) return

        try {
            setIsSendingEmail(true)
            setEmailStatus(null)

            // Convert to image
            const html2canvas = (await import('html2canvas')).default
            const canvas = await html2canvas(payslipRef.current, {
                scale: 0.8,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false,
                // Fix for oklch color function not supported
                onclone: (clonedDoc) => {
                    const element = clonedDoc.querySelector('[data-payslip]')
                    if (element) {
                        // Apply computed styles to avoid oklch parsing issues
                        const allElements = element.querySelectorAll('*')
                        allElements.forEach((el) => {
                            const computed = window.getComputedStyle(
                                el as Element,
                            )
                            const htmlEl = el as HTMLElement
                            htmlEl.style.color = computed.color
                            htmlEl.style.backgroundColor =
                                computed.backgroundColor
                            htmlEl.style.borderColor = computed.borderColor
                        })
                    }
                },
            })

            // Convert to JPEG
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
            const base64String = dataUrl.split(',')[1]

            // Prepare data
            const emailData = {
                to: userEmail,
                subject: `Salary Slip - ${getMonthName(salary.month)} ${salary.year}`,
                employeeName: userName,
                month: getMonthName(salary.month),
                year: salary.year,
                baseSalary: salary.base_salary,
                netSalary: salary.net_salary,
                image: base64String,
                fileName: `salary-slip-${userName.replace(/\s+/g, '-')}.jpg`,
            }

            // API base URL
            const API_BASE_URL = 'http://localhost:8000'

            // Send to backend API
            const response = await fetch(
                `${API_BASE_URL}/api/salary/send-email`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(emailData),
                },
            )

            if (!response.ok) {
                let errorMessage = 'Failed to send email'
                try {
                    const errorData = await response.json()
                    errorMessage = errorData.message || errorMessage
                } catch {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`
                }
                throw new Error(errorMessage)
            }

            const result = await response.json()

            if (result.success) {
                setEmailStatus({
                    success: true,
                    message: `Salary slip sent to ${userEmail}`,
                })
            } else {
                throw new Error(result.message || 'Failed to send email')
            }
        } catch (error: unknown) {
            console.error('Failed to send email:', error)
            setEmailStatus({
                success: false,
                message: `${error instanceof Error ? error.message : 'Failed to send email'}`,
            })
        } finally {
            setIsSendingEmail(false)
        }
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
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        {isExporting ? 'Exporting...' : 'Download PNG'}
                    </button>
                    <button
                        onClick={sendEmailWithPayslip}
                        disabled={isSendingEmail}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSendingEmail ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Mail className="w-4 h-4" />
                                Send to Employee
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

            {/* Payslip Table (Step 5 Style) */}
            <div
                ref={payslipRef}
                data-payslip
                className="bg-white rounded-lg p-6 shadow-sm"
                style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                }}
            >
                {/* Header */}
                <div
                    className="text-center mb-6 pb-4"
                    style={{ borderBottom: '1px solid #e5e7eb' }}
                >
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: '#2563eb' }}
                    >
                        Salary Slip
                    </h1>
                    <p className="mt-1" style={{ color: '#6b7280' }}>
                        {getMonthName(salary.month)} {salary.year}
                    </p>
                </div>

                {/* Employee Information */}
                <div
                    className="mb-6 p-4 rounded-lg"
                    style={{
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb',
                    }}
                >
                    <h3 className="font-bold mb-3" style={{ color: '#2563eb' }}>
                        Employee Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span style={{ color: '#6b7280' }}>Name:</span>
                            <span
                                className="ml-2 font-medium"
                                style={{ color: '#111827' }}
                            >
                                {userName}
                            </span>
                        </div>
                        <div>
                            <span style={{ color: '#6b7280' }}>Email:</span>
                            <span
                                className="ml-2 font-medium"
                                style={{ color: '#111827' }}
                            >
                                {userEmail}
                            </span>
                        </div>
                        <div>
                            <span style={{ color: '#6b7280' }}>
                                Base Salary:
                            </span>
                            <span
                                className="ml-2 font-bold"
                                style={{ color: '#2563eb' }}
                            >
                                ${formatCurrency(salary.base_salary)}
                            </span>
                        </div>
                        <div>
                            <span style={{ color: '#6b7280' }}>
                                Working Days:
                            </span>
                            <span
                                className="ml-2 font-medium"
                                style={{ color: '#111827' }}
                            >
                                {salary.working_days || 0} days
                            </span>
                        </div>
                    </div>
                </div>

                {/* Salary Table */}
                <div className="overflow-x-auto mb-6">
                    <table
                        className="min-w-full text-sm"
                        style={{ border: '1px solid #e5e7eb' }}
                    >
                        <thead>
                            <tr
                                style={{
                                    backgroundColor: '#2563eb',
                                    color: '#ffffff',
                                }}
                            >
                                <th
                                    className="p-3 text-left font-medium"
                                    style={{ border: '1px solid #d1d5db' }}
                                >
                                    Income
                                </th>
                                <th
                                    className="p-3 text-left font-medium"
                                    style={{ border: '1px solid #d1d5db' }}
                                >
                                    Additional Income
                                </th>
                                <th
                                    className="p-3 text-left font-medium"
                                    style={{ border: '1px solid #d1d5db' }}
                                >
                                    Amount
                                </th>
                                <th
                                    className="p-3 text-left font-medium"
                                    style={{ border: '1px solid #d1d5db' }}
                                >
                                    Deductions
                                </th>
                                <th
                                    className="p-3 text-left font-medium"
                                    style={{ border: '1px solid #d1d5db' }}
                                >
                                    Amount
                                </th>
                                <th
                                    className="p-3 text-left font-medium"
                                    style={{ border: '1px solid #d1d5db' }}
                                >
                                    Payment Date
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Base Salary Row */}
                            <tr style={{ backgroundColor: '#ffffff' }}>
                                <td
                                    className="p-3"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        color: '#111827',
                                    }}
                                >
                                    Base Salary
                                </td>
                                <td
                                    className="p-3"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        color: '#111827',
                                    }}
                                >
                                    -
                                </td>
                                <td
                                    className="p-3 font-bold"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        color: '#111827',
                                    }}
                                >
                                    ${formatCurrency(salary.base_salary)}
                                </td>
                                <td
                                    className="p-3"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        color: '#111827',
                                    }}
                                >
                                    Office Expenses
                                </td>
                                <td
                                    className="p-3"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        color: '#111827',
                                    }}
                                >
                                    ${formatCurrency(salary.office_expenses)}
                                </td>
                                <td
                                    className="p-3 font-bold text-center"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        color: '#111827',
                                    }}
                                    rowSpan={7}
                                >
                                    {moment(salary.payment_date).format(
                                        'DD/MM/YYYY',
                                    )}
                                </td>
                            </tr>

                            {/* Additional Income Rows */}
                            <tr style={{ backgroundColor: '#ffffff' }}>
                                <td
                                    className="p-3"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        color: '#111827',
                                    }}
                                    rowSpan={6}
                                >
                                    Additional Income
                                </td>
                                <td
                                    className="p-3"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        color: '#111827',
                                    }}
                                >
                                    Fuel Costs
                                </td>
                                <td
                                    className="p-3"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        color: '#111827',
                                    }}
                                >
                                    ${formatCurrency(salary.fuel_costs)}
                                </td>
                                <td
                                    className="p-3"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        color: '#111827',
                                    }}
                                    rowSpan={2}
                                >
                                    Social Security
                                </td>
                                <td
                                    className="p-3"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        color: '#111827',
                                    }}
                                    rowSpan={2}
                                >
                                    ${formatCurrency(salary.social_security)}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: '#ffffff' }}>
                                <td
                                    className="p-3"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        color: '#111827',
                                    }}
                                >
                                    Commission
                                </td>
                                <td
                                    className="p-3"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        color: '#111827',
                                    }}
                                >
                                    ${formatCurrency(salary.commission)}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: '#ffffff' }}>
                                <td
                                    className="p-3"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        color: '#111827',
                                    }}
                                >
                                    Overtime (OT)
                                </td>
                                <td
                                    className="p-3"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        color: '#111827',
                                    }}
                                >
                                    ${formatCurrency(salary.ot_amount)}
                                </td>
                                <td
                                    className="p-3"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        backgroundColor: '#ffffff',
                                    }}
                                    colSpan={2}
                                ></td>
                            </tr>
                            <tr style={{ backgroundColor: '#ffffff' }}>
                                <td
                                    className="p-3"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        color: '#111827',
                                    }}
                                >
                                    Bonus
                                </td>
                                <td
                                    className="p-3"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        color: '#111827',
                                    }}
                                >
                                    ${formatCurrency(salary.bonus)}
                                </td>
                                <td
                                    className="p-3"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        backgroundColor: '#ffffff',
                                    }}
                                    colSpan={2}
                                ></td>
                            </tr>
                            <tr style={{ backgroundColor: '#ffffff' }}>
                                <td
                                    className="p-3"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        color: '#111827',
                                    }}
                                >
                                    Holiday Allowance
                                </td>
                                <td
                                    className="p-3"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        color: '#111827',
                                    }}
                                >
                                    $
                                    {formatCurrency(
                                        salary.money_not_spent_on_holidays,
                                    )}
                                </td>
                                <td
                                    className="p-3"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        backgroundColor: '#ffffff',
                                    }}
                                    colSpan={2}
                                ></td>
                            </tr>
                            <tr style={{ backgroundColor: '#ffffff' }}>
                                <td
                                    className="p-3"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        color: '#111827',
                                    }}
                                >
                                    Other
                                </td>
                                <td
                                    className="p-3"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        color: '#111827',
                                    }}
                                >
                                    ${formatCurrency(salary.other_income)}
                                </td>
                                <td
                                    className="p-3"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        backgroundColor: '#ffffff',
                                    }}
                                    colSpan={2}
                                ></td>
                            </tr>

                            {/* Totals Row */}
                            <tr
                                className="font-bold"
                                style={{ backgroundColor: '#f3f4f6' }}
                            >
                                <td
                                    className="p-3 text-right"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        color: '#111827',
                                    }}
                                    colSpan={2}
                                >
                                    Total Income:
                                </td>
                                <td
                                    className="p-3"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        color: '#111827',
                                    }}
                                >
                                    ${formatCurrency(totalIncome)}
                                </td>
                                <td
                                    className="p-3 text-right"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        color: '#111827',
                                    }}
                                    colSpan={1}
                                >
                                    Total Deductions:
                                </td>
                                <td
                                    className="p-3"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        color: '#111827',
                                    }}
                                >
                                    ${formatCurrency(totalDeductions)}
                                </td>
                                <td
                                    className="p-3"
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        backgroundColor: '#f3f4f6',
                                    }}
                                ></td>
                            </tr>

                            {/* Net Salary Row */}
                            <tr
                                className="font-bold"
                                style={{
                                    backgroundColor: '#2563eb',
                                    color: '#ffffff',
                                }}
                            >
                                <td
                                    className="p-4 text-center text-lg"
                                    style={{ border: '1px solid #d1d5db' }}
                                    colSpan={4}
                                >
                                    NET SALARY:
                                </td>
                                <td
                                    className="p-4 text-center text-xl"
                                    style={{ border: '1px solid #d1d5db' }}
                                    colSpan={2}
                                >
                                    ${formatCurrency(salary.net_salary)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Additional Information */}
                <div
                    className="p-4 rounded-lg"
                    style={{
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb',
                    }}
                >
                    <h3 className="font-bold mb-3" style={{ color: '#2563eb' }}>
                        Additional Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span style={{ color: '#6b7280' }}>
                                Working Days:
                            </span>
                            <span
                                className="ml-2 font-medium"
                                style={{ color: '#111827' }}
                            >
                                {salary.working_days || 0} days
                            </span>
                        </div>
                        <div>
                            <span style={{ color: '#6b7280' }}>
                                Vacation Days Left:
                            </span>
                            <span
                                className="ml-2 font-medium"
                                style={{ color: '#111827' }}
                            >
                                {salary.remaining_vacation_days || 0} days
                            </span>
                        </div>
                        <div>
                            <span style={{ color: '#6b7280' }}>OT Hours:</span>
                            <span
                                className="ml-2 font-medium"
                                style={{ color: '#111827' }}
                            >
                                {salary.ot_hours || 0} hours
                            </span>
                        </div>
                        <div>
                            <span style={{ color: '#6b7280' }}>
                                Day Off Days:
                            </span>
                            <span
                                className="ml-2 font-medium"
                                style={{ color: '#111827' }}
                            >
                                {salary.day_off_days || 0} days
                            </span>
                        </div>
                    </div>
                    {salary.notes && (
                        <div
                            className="mt-4 p-3 rounded-md"
                            style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                            }}
                        >
                            <span
                                className="font-medium"
                                style={{ color: '#111827' }}
                            >
                                Notes:
                            </span>
                            <p className="mt-1" style={{ color: '#6b7280' }}>
                                {salary.notes}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div
                    className="mt-6 pt-4 text-center text-sm"
                    style={{ borderTop: '1px solid #e5e7eb', color: '#6b7280' }}
                >
                    <p>
                        Generated on {new Date().toLocaleDateString()} - This is
                        an official salary statement
                    </p>
                </div>
            </div>

            {/* Original Detail Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Employee Information */}
                <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                    <h4 className="text-sm font-bold text-green-700 mb-3 uppercase flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Employee Information
                    </h4>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-gray-900">
                                    {userName}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {userEmail}
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
                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${salary.user_id.role ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                                >
                                    {salary.user_id.role || 'Not specified'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-700 font-medium flex items-center gap-2">
                                    <Building className="w-4 h-4" />
                                    Department:
                                </span>
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${salary.user_id.department_id?.name ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}
                                >
                                    {salary.user_id.department_id?.name ||
                                        'Not specified'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-700 font-medium flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" />
                                    Position:
                                </span>
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${salary.user_id.position_id?.name ? 'bg-pink-100 text-pink-800' : 'bg-gray-100 text-gray-800'}`}
                                >
                                    {salary.user_id.position_id?.name ||
                                        'Not specified'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Income Details */}
                <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                    <h4 className="text-sm font-bold text-blue-700 mb-3 uppercase flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Income Details
                    </h4>
                    <div className="space-y-3">
                        {/* Base Salary */}
                        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                            <span className="text-gray-700">Base Salary:</span>
                            <span className="font-semibold text-gray-900">
                                ${salary.base_salary.toLocaleString()}
                            </span>
                        </div>

                        {/* Overtime */}
                        <div className="pb-2 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700">Overtime:</span>
                                <span className="font-semibold text-gray-900">
                                    ${salary.ot_amount.toLocaleString()}
                                </span>
                            </div>
                            {salary.ot_hours && (
                                <div className="text-xs text-gray-500 mt-1 text-right">
                                    {salary.ot_hours} hours
                                </div>
                            )}
                        </div>

                        {/* Bonus & Commission */}
                        <div className="grid grid-cols-2 gap-3 pb-2 border-b border-gray-200">
                            <div>
                                <div className="text-xs text-gray-500">
                                    Bonus
                                </div>
                                <div className="text-sm font-semibold text-gray-900">
                                    ${salary.bonus.toLocaleString()}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">
                                    Commission
                                </div>
                                <div className="text-sm font-semibold text-gray-900">
                                    ${salary.commission.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Other Income */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700">
                                    Fuel Costs:
                                </span>
                                <span className="text-sm font-semibold text-gray-900">
                                    ${salary.fuel_costs.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700">
                                    Holiday Money:
                                </span>
                                <span className="text-sm font-semibold text-gray-900">
                                    $
                                    {salary.money_not_spent_on_holidays.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700">
                                    Other Income:
                                </span>
                                <span className="text-sm font-semibold text-gray-900">
                                    ${salary.other_income.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Total Income */}
                        <div className="border-t border-green-200 pt-3 mt-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-green-900">
                                    Total Income:
                                </span>
                                <span className="text-sm font-bold text-green-900">
                                    ${totalIncome.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Deductions & Work Details */}
                <div className="bg-white rounded-lg p-4 border border-red-200 shadow-sm">
                    <h4 className="text-sm font-bold text-red-700 mb-3 uppercase flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Deductions & Details
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
                                        Office Expenses:
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        $
                                        {salary.office_expenses.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-sm text-gray-600">
                                        Social Security:
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        $
                                        {salary.social_security.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <div className="border-t border-red-200 pt-2 mt-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-red-900">
                                        Total Deductions:
                                    </span>
                                    <span className="text-sm font-bold text-red-900">
                                        ${totalDeductions.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Work Details */}
                        <div className="border-t border-gray-200 pt-3">
                            <h5 className="text-xs font-semibold text-gray-700 mb-2">
                                Work Details
                            </h5>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 p-2 rounded">
                                    <div className="text-xs text-gray-500">
                                        Working Days
                                    </div>
                                    <div className="text-sm font-bold text-gray-800">
                                        {salary.working_days} days
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                    <div className="text-xs text-gray-500">
                                        Day Off Days
                                    </div>
                                    <div className="text-sm font-bold text-gray-800">
                                        {salary.day_off_days} days
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                    <div className="text-xs text-gray-500">
                                        Vacation Days Left
                                    </div>
                                    <div className="text-sm font-bold text-gray-800">
                                        {salary.remaining_vacation_days} days
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                    <div className="text-xs text-gray-500">
                                        Created By
                                    </div>
                                    <div className="text-sm font-bold text-gray-800">
                                        {salary.created_by.first_name_en}{' '}
                                        {salary.created_by.last_name_en}
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
                                        {salary.notes}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* OT Details Section */}
            {salary.ot_details && salary.ot_details.length > 0 && (
                <div className="bg-white rounded-lg p-4 border border-yellow-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-yellow-700 uppercase flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Overtime Details
                        </h4>
                        <div className="text-xs text-gray-500">
                            Total OT: {salary.ot_hours || 0} hours
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-yellow-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-yellow-700 uppercase">
                                        Date
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-yellow-700 uppercase">
                                        Type
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-yellow-700 uppercase">
                                        Hours
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-yellow-700 uppercase">
                                        Rate
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-yellow-700 uppercase">
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {salary.ot_details.map((detail, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-yellow-50"
                                    >
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                            {moment(detail.date).format(
                                                'DD/MM/YYYY',
                                            )}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <span
                                                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${detail.type === 'weekday' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}
                                            >
                                                {detail.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                            {detail.hours} hrs
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                            ${detail.rate_per_hour}/hr
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            ${detail.amount.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SalaryHistoryTable
