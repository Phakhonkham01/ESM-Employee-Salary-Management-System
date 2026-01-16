import React, { useState } from 'react'
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
} from 'lucide-react'
import moment from 'moment'

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

// Subcomponent สำหรับแสดงรายละเอียดเงินเดือน
interface SalaryDetailsProps {
    salary: Salary
    getMonthName: (month: number) => string
}

const SalaryDetails: React.FC<SalaryDetailsProps> = ({
    salary,
    getMonthName,
}) => {
    return (
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
                                {salary.user_id.first_name_en}{' '}
                                {salary.user_id.last_name_en}
                            </div>
                            <div className="text-sm text-gray-500">
                                {salary.user_id.email}
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
                                    salary.user_id.role
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                {salary.user_id.role || 'Not specified'}
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
                                        salary.user_id.department_id?.name
                                            ? 'bg-indigo-100 text-indigo-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {(() => {
                                        const dept =
                                            salary.user_id.department_id
                                        if (!dept) return 'Not specified'

                                        if (
                                            dept.name &&
                                            !dept.name.startsWith(
                                                'Department ID:',
                                            )
                                        ) {
                                            return dept.name
                                        }

                                        if (dept._id) {
                                            return `Dept ID: ${dept._id}`
                                        }

                                        return 'Not specified'
                                    })()}
                                </span>
                                {salary.user_id.department_id?._id && (
                                    <span className="text-xs text-gray-500 mt-1">
                                        ID: {salary.user_id.department_id._id}
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
                                        salary.user_id.position_id?.name
                                            ? 'bg-pink-100 text-pink-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {(() => {
                                        const pos = salary.user_id.position_id
                                        if (!pos) return 'Not specified'

                                        if (
                                            pos.name &&
                                            !pos.name.startsWith('Position ID:')
                                        ) {
                                            return pos.name
                                        }

                                        if (pos._id) {
                                            return `Pos ID: ${pos._id}`
                                        }

                                        return 'Not specified'
                                    })()}
                                </span>
                                {salary.user_id.position_id?._id && (
                                    <span className="text-xs text-gray-500 mt-1">
                                        ID: {salary.user_id.position_id._id}
                                    </span>
                                )}
                            </div>
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
                            ฿{salary.base_salary.toLocaleString()}
                        </span>
                    </div>

                    {/* Overtime */}
                    <div className="pb-2 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700">Overtime:</span>
                            <span className="font-semibold text-gray-900">
                                ฿{salary.ot_amount.toLocaleString()}
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
                            <div className="text-xs text-gray-500">Bonus</div>
                            <div className="text-sm font-semibold text-gray-900">
                                ฿{salary.bonus.toLocaleString()}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">
                                Commission
                            </div>
                            <div className="text-sm font-semibold text-gray-900">
                                ฿{salary.commission.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Other Income */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700">Fuel Costs:</span>
                            <span className="text-sm font-semibold text-gray-900">
                                ฿{salary.fuel_costs.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700">
                                Holiday Money:
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                                ฿
                                {salary.money_not_spent_on_holidays.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700">Other Income:</span>
                            <span className="text-sm font-semibold text-gray-900">
                                ฿{salary.other_income.toLocaleString()}
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
                                    ฿{salary.office_expenses.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-600">
                                    Social Security:
                                </span>
                                <span className="text-sm font-semibold text-gray-900">
                                    ฿{salary.social_security.toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <div className="border-t border-red-200 pt-2 mt-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-red-900">
                                    Total Deductions:
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

            {/* OT Details Section */}
            {salary.ot_details && salary.ot_details.length > 0 && (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-lg p-4 border border-yellow-200 shadow-sm">
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
                                    (detail: any, index: number) => (
                                        <tr
                                            key={index}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">
                                                {detail.date
                                                    ? moment(
                                                          detail.date,
                                                      ).format('DD/MM/YYYY')
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
                                                {detail.total_hours || 0} hrs
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
                                                    detail.amount || 0
                                                ).toLocaleString()}
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-700 max-w-xs">
                                                <div className="truncate">
                                                    {detail.description || '-'}
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
                                        colSpan={2}
                                        className="px-3 py-2 text-sm font-bold text-gray-900"
                                    >
                                        Total
                                    </td>
                                    <td className="px-3 py-2 text-sm font-bold text-gray-900">
                                        {salary.ot_details.reduce(
                                            (sum: number, detail: any) =>
                                                sum + (detail.total_hours || 0),
                                            0,
                                        )}{' '}
                                        hours
                                    </td>
                                    <td className="px-3 py-2"></td>
                                    <td className="px-3 py-2 text-sm font-bold text-gray-900">
                                        ฿
                                        {salary.ot_details
                                            .reduce(
                                                (sum: number, detail: any) =>
                                                    sum + (detail.amount || 0),
                                                0,
                                            )
                                            .toLocaleString()}
                                    </td>
                                    <td colSpan={2} className="px-3 py-2"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {/* ถ้าไม่มี OT details ให้แสดงข้อความ */}
            {(!salary.ot_details || salary.ot_details.length === 0) && (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-yellow-500" />
                        <div>
                            <p className="text-sm font-medium text-yellow-800">
                                No overtime details available
                            </p>
                            <p className="text-xs text-yellow-600">
                                Total OT amount for this period: ฿
                                {salary.ot_amount.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SalaryHistoryTable
