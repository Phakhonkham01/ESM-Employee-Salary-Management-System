'use client'

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
    X,
} from 'lucide-react'
import moment from 'moment'
import SalaryDetails from './SalaryDetails'

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
    const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null) // เปลี่ยนมาใช้ state สำหรับเก็บ salary ที่เลือก

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

    // Function to open salary details in popup
    const openSalaryPopup = (salary: Salary) => {
        setSelectedSalary(salary)
        // Call the original onSelectSalary if provided
        if (onSelectSalary) {
            onSelectSalary(salary)
        }
    }

    // Function to close the popup
    const closeSalaryPopup = () => {
        setSelectedSalary(null)
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
                                                    
                                                    {salary.net_salary.toLocaleString()}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Base: 
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
                                                            openSalaryPopup(
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

                                        
                                
                                    </React.Fragment>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Salary Details Popup Modal */}
{selectedSalary && (
    <div className="fixed inset-0 bg-gray-700/40 flex items-center justify-center z-50 p-4 overflow-y-auto scrollbar-hide">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-2 py-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">
                        Salary Details - {getMonthName(selectedSalary.month)} {selectedSalary.year}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        {selectedSalary.user_id.first_name_en} {selectedSalary.user_id.last_name_en} • {selectedSalary.user_id.email}
                    </p>
                </div>
                <button
                    onClick={closeSalaryPopup}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Close"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            
            {/* Modal Content - Scrollable with Hidden Scrollbar */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                <SalaryDetails
                    salary={selectedSalary}
                    getMonthName={getMonthName}
                />
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                <button
                    onClick={closeSalaryPopup}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
)}

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

export default SalaryHistoryTable