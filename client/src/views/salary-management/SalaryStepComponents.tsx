'use client'
import { useState } from 'react'
import { Download, Mail, Loader2 } from 'lucide-react'
import { useSendSalaryEmail } from './email/send-salary-email/useSendSalaryEmail'
// SalaryStepComponents.tsx
import type React from 'react'
import {
    DollarSign,
    Fuel,
    UserX,
    CalendarX,
    Calculator,
    Briefcase,
    Clock,
    Plus,
    Trash2,
} from 'lucide-react'
import type { PrefillData, SalaryFormData, ManualOTState } from './interfaces'
import { getMonthName, getVacationTextColor, getOtTypeColor } from './constants'

interface Step5SummaryProps {
    user: {
        email: string
        first_name_en: string
        last_name_en: string
    }
    prefillData: {
        user: {
            base_salary: number
            name?: string
        }
        calculated: {
            remaining_vacation_days: number
            ot_hours: number
            day_off_days: number
            fuel_costs: number
        }
    } | null
    formData: {
        month: number
        year: number
        working_days: number
        bonus: number
        commission: number
        money_not_spent_on_holidays: number
        other_income: number
        social_security: number
        notes: string
    }
    manualOTDetails: any[]
    calculateNetSalary: () => number
}
export interface SalaryEmailRequest {
    to: string
    subject?: string
    employeeName?: string
    month?: string
    year?: number
    baseSalary?: number
    totalIncome?: number
    totalDeductions?: number
    netSalary?: number
    image?: string
    fileName?: string
    fileSizeMB?: string
}

export interface EmailResponse {
    success: boolean
    message: string
    error?: string
    data?: {
        to: string
        subject: string
        messageId?: string
        timestamp?: string
    }
}
interface StepComponentsProps {
    // Step 0
    user: any
    month: number
    year: number
    prefillData: PrefillData | null

    // Step 2 & 3
    formData: SalaryFormData
    onInputChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => void

    // Step 4
    calculateTotalIncome: () => number
    calculateTotalDeductions: () => number
    calculateNetSalary: () => number

    // Manual OT Props
    manualOT: ManualOTState
    onManualOTChange: (
        type: 'weekday' | 'weekend',
        field: string,
        value: string,
    ) => void
    manualOTDetails: any[]
    addManualOTDetail: () => void
    clearManualOT: () => void
    calculateManualOTSummary: () => {
        totalHours: number
        totalWeekendDays: number
        totalAmount: number
    }
}

const getOtTypeEnglish = (type: string): string => {
    switch (type) {
        case 'weekday':
            return 'Weekday'
        case 'weekend':
            return 'Weekend'
        default:
            return type
    }
}

const OtDetailsTable: React.FC<{
    otDetails: any[]
    title?: string
    showDate?: boolean
}> = ({ otDetails, title = 'Overtime (OT) Details', showDate = true }) => (
    <div className="overflow-x-auto border border-gray-300 rounded">
        <div className="bg-[#1F3A5F] px-4 py-3">
            <h4 className="font-semibold text-white">{title}</h4>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    {showDate && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                            Date
                        </th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        Type
                    </th>
                    {showDate && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                            Time
                        </th>
                    )}
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        Quantity
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        Rate
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        Amount
                    </th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {otDetails.map((detail, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                        {showDate && (
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-b border-gray-100">
                                {detail.date
                                    ? new Date(detail.date).toLocaleDateString(
                                          'en-US',
                                          {
                                              day: 'numeric',
                                              month: 'short',
                                              year: 'numeric',
                                          },
                                      )
                                    : '-'}
                            </td>
                        )}
                        <td className="px-4 py-3 whitespace-nowrap border-b border-gray-100">
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${getOtTypeColor(detail.ot_type)}`}
                            >
                                {getOtTypeEnglish(detail.ot_type)}
                            </span>
                        </td>
                        {showDate && (
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-b border-gray-100">
                                {detail.start_hour || '09:00'} -{' '}
                                {detail.end_hour || '17:00'}
                            </td>
                        )}
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center border-b border-gray-100">
                            {detail.ot_type === 'weekday'
                                ? `${detail.total_hours} hrs`
                                : detail.days
                                  ? `${detail.days} days`
                                  : `${detail.total_hours} hrs`}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center border-b border-gray-100">
                            {detail.ot_type === 'weekday'
                                ? `$${detail.hourly_rate?.toFixed(2) || '0.00'}/hr`
                                : detail.days
                                  ? `$${detail.rate_per_day?.toFixed(2) || '0.00'}/day`
                                  : `$${detail.hourly_rate?.toFixed(2) || '0.00'}/hr`}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right border-b border-gray-100">
                            ${detail.amount.toLocaleString()}
                        </td>
                    </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                    <td
                        colSpan={showDate ? 3 : 2}
                        className="px-4 py-3 text-right text-gray-700"
                    >
                        Grand Total:
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">
                        {otDetails.reduce(
                            (sum, detail) =>
                                sum +
                                (detail.ot_type === 'weekday'
                                    ? detail.total_hours
                                    : detail.days || detail.total_hours),
                            0,
                        )}{' '}
                        {otDetails.some((d) => d.days) ? 'days/hrs' : 'hrs'}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">-</td>
                    <td className="px-4 py-3 text-right font-bold text-[#1F3A5F]">
                        $
                        {otDetails
                            .reduce((sum, detail) => sum + detail.amount, 0)
                            .toLocaleString()}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
)

const WeekdayOTCard: React.FC<{
    hours: number
    rate_per_hour: number
    onHoursChange: (value: string) => void
    onRatePerHourChange: (value: string) => void
}> = ({ hours, rate_per_hour, onHoursChange, onRatePerHourChange }) => {
    const amount = hours * rate_per_hour

    return (
        <div className="border border-gray-300 rounded bg-white">
            <div className="bg-[#1F3A5F] px-4 py-3 rounded-t">
                <h5 className="font-bold text-white">ມື້ທຳມະດາ (ຈັນ - ສຸກ)</h5>
            </div>
            <div className="p-4">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            OT Hours
                        </label>
                        <input
                            type="number"
                            step="0.5"
                            min="0"
                            value={hours}
                            onChange={(e) => onHoursChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1F3A5F] focus:border-transparent"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ອັດຕາຄ່າຈ້າງ (Rate per)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                min={0}
                                value={rate_per_hour === 0 ? '' : rate_per_hour}
                                onChange={(e) =>
                                    onRatePerHourChange(e.target.value)
                                }
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded
               focus:outline-none focus:ring-2 focus:ring-[#1F3A5F]"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-4 p-3 rounded bg-blue-50 border border-blue-200">
                    <div className="text-xl text-[#1F3A5F]">
                        <div className="font-bold mb-1">
                            Total: {amount.toFixed(2)} ກີບ
                        </div>
                        <div className="text-xl text-gray-600">
                            {hours} hrs x {rate_per_hour.toFixed(2)}/hr
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const WeekendOTCard: React.FC<{
    hours: number
    days: number
    rate_per_hour: number
    rate_per_day: number
    onHoursChange: (value: string) => void
    onDaysChange: (value: string) => void
    onRatePerHourChange: (value: string) => void
    onRatePerDayChange: (value: string) => void
}> = ({
    hours,
    days,
    rate_per_hour,
    rate_per_day,
    onHoursChange,
    onDaysChange,
    onRatePerHourChange,
    onRatePerDayChange,
}) => {
    const hoursAmount = hours * rate_per_hour
    const daysAmount = days * rate_per_day
    const totalAmount = hoursAmount + daysAmount

    return (
        <div className="border border-gray-300 rounded bg-white">
            <div className="bg-[#D97706] px-4 py-3 rounded-t">
                <h5 className="font-bold text-white">
                    ມື້ພັກ (ວັນເສົາ-ວັນອາທິດ)
                </h5>
            </div>
            <div className="p-4">
                <div className="space-y-4">
                    {/* Weekend OT Hours */}
                    <div className="border-b border-gray-200 pb-4">
                        <h6 className="font-medium text-gray-700 mb-3">
                            OT Hours
                        </h6>
                        <div className="space-y-3">
                            <div>
                                <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    value={hours}
                                    onChange={(e) =>
                                        onHoursChange(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-transparent"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ອັດຕາຄ່າຈ້າງ Hourly Rate
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={rate_per_hour}
                                        onChange={(e) =>
                                            onRatePerHourChange(e.target.value)
                                        }
                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-transparent"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            {hours > 0 && rate_per_hour > 0 && (
                                <div className="p-2 rounded bg-amber-50 border border-amber-200">
                                    <div className="text-xs text-amber-800">
                                        <div>
                                            OT Hours: {hours} hrs x
                                            {rate_per_hour.toFixed(2)}
                                        </div>
                                        <div className="font-bold mt-1">
                                            ຍອດລວມ : {hoursAmount.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Weekend Work Days */}
                    <div>
                        <h6 className="font-medium text-gray-700 mb-3">
                            ມື້ເຮັດວຽກ ເສົາ - ອາທິດ (ເຕັມມື້/ເຄິ່ງມື້)
                        </h6>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ຈຳນວນມື້ (0.5 = ເຄິ່ງມື້)
                                </label>
                                <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    value={days}
                                    onChange={(e) =>
                                        onDaysChange(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-transparent"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ອັດຕາລາຍວັນ
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={rate_per_day}
                                        onChange={(e) =>
                                            onRatePerDayChange(e.target.value)
                                        }
                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-transparent"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            {days > 0 && rate_per_day > 0 && (
                                <div className="p-2 rounded bg-amber-50 border border-amber-200">
                                    <div className="text-xs text-amber-800">
                                        <div>
                                            Work Days: {days} days x
                                            {rate_per_day.toFixed(2)}
                                        </div>
                                        <div className="font-bold mt-1">
                                            ຍອດລວມ : {daysAmount.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {(hours > 0 || days > 0) && (
                    <div className="mt-4 p-3 rounded bg-amber-50 border border-amber-300">
                        <div className="text-sm text-amber-900">
                            <div className="font-bold mb-1">
                                Weekend Total: ${totalAmount.toFixed(2)}
                            </div>
                            <div className="text-xs">
                                {hours > 0 &&
                                    `${hours} hrs (${hoursAmount.toFixed(2)})`}
                                {hours > 0 && days > 0 && ' + '}
                                {days > 0 &&
                                    `${days} days (${daysAmount.toFixed(2)})`}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export const Step1BasicInfo: React.FC<StepComponentsProps> = ({
    user,
    month,
    year,
    prefillData,
}) => {
    if (!prefillData) return null
    const calculated = prefillData.calculated

    calculated.day_off_days_this_month
    calculated.used_vacation_days_this_year
    calculated.total_vacation_days
    calculated.remaining_vacation_days
    calculated.exceed_days

    const remainingVacation =
        prefillData.calculated.remaining_vacation_days ?? 0

    const daysToDeduct = Math.max(0, remainingVacation)

    return (
        <div className="min-h-[600px]">
            <div>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-[#1F3A5F]">
                    <Briefcase className="w-5 h-5 text-[#1F3A5F]" />
                    <h3 className="text-lg font-semibold text-[#1F3A5F]">
                        Employee Information
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Employee Name
                        </label>
                        <input
                            type="text"
                            value={`${user.first_name_en} ${user.last_name_en}`}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="text"
                            value={user.email}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Period
                        </label>
                        <input
                            type="text"
                            value={`${getMonthName(month)} ${year}`}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Base Salary
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></span>
                            <input
                                type="text"
                                value={prefillData.user.base_salary.toLocaleString()}
                                disabled
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-[#1F3A5F]">
                        <Calculator className="w-5 h-5 text-[#1F3A5F]" />
                        <h3 className="text-lg font-semibold text-[#1F3A5F]">
                            OT ແລະ ຄ່ານ້ຳມັນ
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-gray-200 rounded-xl bg-white p-5 shadow-sm">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-[#1F3A5F]" />
                                    <h3 className="text-sm font-semibold text-gray-700">
                                        OT Summary (System)
                                    </h3>
                                </div>
                            </div>

                            {/* Main OT Hours */}
                            <div className="mb-4">
                                <p className="text-3xl font-bold text-[#1F3A5F]">
                                    {prefillData.calculated.ot_hours}
                                    <span className="text-base font-medium text-gray-500 ml-1">
                                        hours
                                    </span>
                                </p>
                            </div>

                            {/* OT Breakdown */}
                            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-gray-500 mb-1">
                                        ວັນຈັນ - ວັນສຸກ
                                    </p>
                                    <p className="font-semibold text-gray-800">
                                        {prefillData.calculated
                                            .weekday_ot_hours || 0}{' '}
                                        hrs
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-gray-500 mb-1">
                                        ວັນພັກ / ສຸກ - ອາທິດ
                                    </p>
                                    <p className="font-semibold text-gray-800">
                                        {prefillData.calculated
                                            .weekend_ot_hours || 0}{' '}
                                        hrs
                                    </p>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200 my-4" />

                            {/* Vacation Info */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        ມື້ທີ່ພັກໄປຂອງເດືອນນີ້
                                    </span>
                                    <span className="font-medium">
                                        {calculated.day_off_days_this_month} ມື້
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        ມື້ພັກທີ່ມີທັງໝົດ
                                    </span>
                                    <span className="font-medium">
                                        {calculated.total_vacation_days} ມື້
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">
                                        ມື້ພັກທີ່ເຫຼືອ
                                    </span>
                                    <span
                                        className={`font-bold text-${calculated.vacation_color}-600`}
                                    >
                                        {calculated.remaining_vacation_days} ມື້
                                    </span>
                                </div>

                                {(calculated.exceed_days ?? 0) > 0 && (
                                    <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 font-semibold">
                                        ⚠ ພັກເກີນ {calculated.exceed_days} ມື້
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border border-gray-300 rounded bg-white p-4">
                            <div className="flex items-center mb-2">
                                <Fuel className="w-5 h-5 text-green-600 mr-2" />
                                <span className="text-sm font-medium text-gray-700">
                                    ຄ່ານ້ຳມັນ Fuel Costs
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-green-600">
                                {prefillData.calculated.fuel_costs.toLocaleString()}{' '}
                                ກີບ
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const Step2OtRates: React.FC<StepComponentsProps> = ({
    prefillData,
    manualOT,
    onManualOTChange,
    manualOTDetails,
    addManualOTDetail,
    clearManualOT,
    calculateManualOTSummary,
}) => {
    if (!prefillData) return null

    const { totalHours, totalWeekendDays, totalAmount } =
        calculateManualOTSummary()

    return (
        <div className="min-h-[600px]">
            <div>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-[#1F3A5F]">
                    <Clock className="w-5 h-5 text-[#1F3A5F]" />
                    <h3 className="text-lg font-semibold text-[#1F3A5F]">
                        Overtime (OT)
                    </h3>
                </div>

                {/* System OT Summary */}
                <div className="mb-6 p-4 bg-blue-50 border border-[#1F3A5F] rounded">
                    <div className="flex items-center gap-2 mb-2">
                        <Calculator className="w-5 h-5 text-[#1F3A5F]" />
                        <h4 className="font-medium text-[#1F3A5F]">
                            OT ທີ່ອະນຸມັດແລ້ວ (System Approved OT)
                        </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-gray-700">
                                ມື້ທຳມະດາ ຈັນ - ສຸກ:
                            </span>
                            <span className="ml-2 font-bold text-[#1F3A5F]">
                                {prefillData.calculated.weekday_ot_hours || 0}{' '}
                                hours
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-700">
                                ມື້ພັກ ເສົາ - ອາທິດ:
                            </span>
                            <span className="ml-2 font-bold text-amber-700">
                                {prefillData.calculated.weekend_ot_hours || 0}{' '}
                                hours
                            </span>
                        </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                        * OT hours from approved requests
                    </div>
                </div>

                {/* Manual OT Entry Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                        <Plus className="w-5 h-5 text-[#1F3A5F]" />
                        <h4 className="text-base font-semibold text-gray-800">
                            ເພີ່ມຊົ່ວໂມງເຮັດວຽກ OT
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <WeekdayOTCard
                            hours={manualOT.weekday.hours}
                            rate_per_hour={manualOT.weekday.rate_per_hour}
                            onHoursChange={(value) =>
                                onManualOTChange('weekday', 'hours', value)
                            }
                            onRatePerHourChange={(value) =>
                                onManualOTChange(
                                    'weekday',
                                    'rate_per_hour',
                                    value,
                                )
                            }
                        />

                        <WeekendOTCard
                            hours={manualOT.weekend.hours}
                            days={manualOT.weekend.days}
                            rate_per_hour={manualOT.weekend.rate_per_hour}
                            rate_per_day={manualOT.weekend.rate_per_day}
                            onHoursChange={(value) =>
                                onManualOTChange('weekend', 'hours', value)
                            }
                            onDaysChange={(value) =>
                                onManualOTChange('weekend', 'days', value)
                            }
                            onRatePerHourChange={(value) =>
                                onManualOTChange(
                                    'weekend',
                                    'rate_per_hour',
                                    value,
                                )
                            }
                            onRatePerDayChange={(value) =>
                                onManualOTChange(
                                    'weekend',
                                    'rate_per_day',
                                    value,
                                )
                            }
                        />
                    </div>

                    {/* Summary and Action Buttons */}
                    <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 border border-gray-200 rounded">
                        <div>
                            <h5 className="font-bold text-gray-700">
                                Manual OT Summary
                            </h5>
                            <div className="text-sm text-gray-600 mt-1">
                                <div>Weekday: {manualOT.weekday.hours} hrs</div>
                                <div>
                                    Weekend (hrs): {manualOT.weekend.hours} hrs
                                </div>
                                <div>
                                    Weekend (days): {manualOT.weekend.days} days
                                </div>
                                <div className="font-bold mt-1 text-[#1F3A5F]">
                                    Total: {totalAmount.toFixed(2)}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={clearManualOT}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded hover:bg-red-50 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear
                            </button>
                            <button
                                onClick={addManualOTDetail}
                                disabled={
                                    (manualOT.weekday.hours === 0 &&
                                        manualOT.weekend.hours === 0 &&
                                        manualOT.weekend.days === 0) ||
                                    (manualOT.weekday.hours > 0 &&
                                        manualOT.weekday.rate_per_hour === 0) ||
                                    (manualOT.weekend.hours > 0 &&
                                        manualOT.weekend.rate_per_hour === 0) ||
                                    (manualOT.weekend.days > 0 &&
                                        manualOT.weekend.rate_per_day === 0)
                                }
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1F3A5F] rounded hover:bg-[#2d4a6f] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-4 h-4" />
                                Add OT
                            </button>
                        </div>
                    </div>
                </div>

                {/* Display Manual OT Details */}
                {manualOTDetails.length > 0 && (
                    <div className="mt-8">
                        <OtDetailsTable
                            otDetails={manualOTDetails}
                            title="Manual OT Entries"
                            showDate={false}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export const Step3AdditionalIncome: React.FC<StepComponentsProps> = ({
    formData,
    onInputChange,
}) => {
    return (
        <div className="min-h-[600px]">
            <div>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-[#1F3A5F]">
                    <DollarSign className="w-5 h-5 text-[#1F3A5F]" />
                    <h3 className="text-lg font-semibold text-[#1F3A5F]">
                        Additional Income
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bonus
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                name="bonus"
                                value={formData.bonus}
                                onChange={onInputChange}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1F3A5F] focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Commission
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                name="commission"
                                value={formData.commission}
                                onChange={onInputChange}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1F3A5F] focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Holiday Allowance
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                name="money_not_spent_on_holidays"
                                value={formData.money_not_spent_on_holidays}
                                onChange={onInputChange}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1F3A5F] focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Other Income
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                name="other_income"
                                value={formData.other_income}
                                onChange={onInputChange}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1F3A5F] focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-[#1F3A5F] rounded">
                    <p className="text-sm text-[#1F3A5F] font-medium">
                        Total Additional Income:
                        {(
                            formData.bonus +
                            formData.commission +
                            formData.money_not_spent_on_holidays +
                            formData.other_income
                        ).toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    )
}

export const Step4Deductions: React.FC<StepComponentsProps> = ({
    formData,
    onInputChange,
    calculateTotalDeductions,
}) => {
    return (
        <div className="min-h-[600px]">
            <div>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-red-600">
                    <UserX className="w-5 h-5 text-red-600" />
                    <h3 className="text-lg font-semibold text-red-600">
                        Deductions
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Office Expenses
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                name="office_expenses"
                                value={formData.office_expenses}
                                onChange={onInputChange}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Social Security
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                name="social_security"
                                value={formData.social_security}
                                onChange={onInputChange}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Working Days
                        </label>
                        <input
                            type="number"
                            name="working_days"
                            value={formData.working_days}
                            onChange={onInputChange}
                            min="0"
                            max="31"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1F3A5F] focus:border-transparent"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Number of days worked this month
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={onInputChange}
                            rows={3}
                            placeholder="Additional notes or comments..."
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1F3A5F] focus:border-transparent resize-none"
                        />
                    </div>
                </div>
                <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded">
                    <p className="text-sm text-red-700 font-medium">
                        Total Deductions:
                        {calculateTotalDeductions().toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    )
}
export const Step5Summary: React.FC<StepComponentsProps> = ({
    user,
    prefillData,
    formData,
    calculateTotalIncome,
    calculateTotalDeductions,
    calculateNetSalary,
    manualOTDetails,
}) => {
    const [svgRef, setSvgRef] = useState<HTMLDivElement | null>(null)
    const [isExporting, setIsExporting] = useState(false)
    const [isSendingEmail, setIsSendingEmail] = useState(false)
    const [emailStatus, setEmailStatus] = useState<{
        success: boolean
        message: string
    } | null>(null)

    if (!prefillData) return null

    const allOTDetails = [
        ...(prefillData.calculated.ot_details || []),
        ...(manualOTDetails || []),
    ]

    const totalOTAmount = allOTDetails.reduce(
        (sum, detail) => sum + detail.amount,
        0,
    )

    // Format date for payment
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    const currentDate = new Date()

    // Calculate additional income - using formData
    const additionalIncome = {
        fuel: prefillData.calculated.fuel_costs || 0,
        computer: 0,
        ot: totalOTAmount,
        bonus: formData.bonus,
        holidayAllowance: formData.money_not_spent_on_holidays,
        officeExpenses: 0,
        other: formData.other_income,
        commission: formData.commission,
    }

    // Calculate deductions
    const deductions = {
        absence: 0,
        socialSecurity: formData.social_security,
    }

    // Calculate totals
    const totalAdditionalIncome = Object.values(additionalIncome).reduce(
        (a, b) => a + b,
        0,
    )
    const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0)
    const totalIncome = prefillData.user.base_salary + totalAdditionalIncome
    const netSalary = totalIncome - totalDeductions

    // Function to format currency
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    }

    // Extract name from user object
    const userName =
        `${user?.first_name_en || ''} ${user?.last_name_en || ''}`.trim()

    // Use actual email from user object
    const userEmail = user?.email || 'employee@company.com'

    // Function to export as PNG
    const exportToPNG = async () => {
        if (!svgRef) return

        try {
            setIsExporting(true)
            const html2canvas = (await import('html2canvas')).default

            const canvas = await html2canvas(svgRef, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false,
            })

            const link = document.createElement('a')
            const fileName = `salary-summary-${userName.replace(/\s+/g, '-')}-${getMonthName(formData.month)}-${formData.year}.png`

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

    // Function to send email with PNG attachment
    // Function to send email with PNG attachment - แก้ไขเวอร์ชันนี้
    // ในฟังก์ชัน sendEmailWithPNG ของ Step5Summary
    // ใน Step5Summary component
    const sendEmailWithPNG = async () => {
        if (!svgRef) return

        try {
            setIsSendingEmail(true)
            setEmailStatus(null)

            // Convert to image
            const html2canvas = (await import('html2canvas')).default
            const canvas = await html2canvas(svgRef, {
                scale: 0.8,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false,
            })

            // Convert to JPEG
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
            const base64String = dataUrl.split(',')[1]

            // Prepare data
            const emailData: SalaryEmailRequest = {
                to: userEmail,
                subject: `Salary Summary - ${getMonthName(formData.month)} ${formData.year}`,
                employeeName: userName,
                month: getMonthName(formData.month),
                year: formData.year,
                baseSalary: prefillData.user.base_salary,
                netSalary,
                image: base64String,
                fileName: `salary-summary-${userName.replace(/\s+/g, '-')}.jpg`,
            }

            // API base URL
            const API_BASE_URL = 'http://localhost:8000'

            // ส่งไปยัง backend API
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
                    const errorData: EmailResponse = await response.json()
                    errorMessage = errorData.message || errorMessage
                } catch (e) {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`
                }
                throw new Error(errorMessage)
            }

            const result: EmailResponse = await response.json()

            if (result.success) {
                setEmailStatus({
                    success: true,
                    message: `✅ Salary summary sent to ${userEmail}`,
                })
            } else {
                throw new Error(result.message || 'Failed to send email')
            }
        } catch (error: any) {
            console.error('Failed to send email:', error)
            setEmailStatus({
                success: false,
                message: `❌ ${error.message || 'Failed to send email'}`,
            })
        } finally {
            setIsSendingEmail(false)
        }
    }

    // ฟังก์ชันสำหรับส่ง email แบบแบ่ง chunks (ถ้าจำเป็น)
    const sendEmailInChunks = async (chunks: string[], totalSize: number) => {
        try {
            // ส่ง chunk แรกกับ metadata
            const firstChunkData = {
                to: userEmail,
                subject: `Salary Summary - ${getMonthName(formData.month)} ${formData.year} (Part 1/2)`,
                employeeName: userName,
                month: getMonthName(formData.month),
                year: formData.year,
                baseSalary: prefillData.user.base_salary,
                netSalary,
                image: chunks[0],
                fileName: `salary-summary-part1.jpg`,
                isChunked: true,
                totalChunks: 2,
                currentChunk: 1,
            }

            const response1 = await fetch('/api/salary/send-email-chunk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(firstChunkData),
            })

            if (!response1.ok) throw new Error('Failed to send first chunk')

            // ส่ง chunk ที่สอง
            const secondChunkData = {
                to: userEmail,
                subject: `Salary Summary - ${getMonthName(formData.month)} ${formData.year} (Part 2/2)`,
                image: chunks[1],
                fileName: `salary-summary-part2.jpg`,
                isChunked: true,
                totalChunks: 2,
                currentChunk: 2,
            }

            const response2 = await fetch('/api/salary/send-email-chunk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(secondChunkData),
            })

            if (!response2.ok) throw new Error('Failed to send second chunk')

            setEmailStatus({
                success: true,
                message: `✅ Salary summary has been sent in 2 parts (${totalSize.toFixed(2)}MB total)`,
            })
        } catch (error: any) {
            throw new Error(`Chunked sending failed: ${error.message}`)
        }
    }
    return (
        <div className="min-h-[600px]">
            <div>
                {/* Header with buttons */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#1F3A5F]">
                    <div className="flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-[#1F3A5F]" />
                        <h3 className="text-lg font-semibold text-[#1F3A5F]">
                            Salary Summary
                        </h3>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={exportToPNG}
                            disabled={isExporting}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1F3A5F] bg-white border border-[#1F3A5F] rounded hover:bg-[#1F3A5F] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isExporting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            {isExporting ? 'Exporting...' : 'Export PNG'}
                        </button>
                        <button
                            onClick={sendEmailWithPNG}
                            disabled={isSendingEmail}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className={`mb-4 p-3 rounded ${emailStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
                    >
                        <div
                            className={`font-medium ${emailStatus.success ? 'text-green-800' : 'text-red-800'}`}
                        >
                            {emailStatus.success ? '✓ Success!' : '✗ Error'}
                        </div>
                        <div
                            className={`text-sm ${emailStatus.success ? 'text-green-600' : 'text-red-600'}`}
                        >
                            {emailStatus.message}
                        </div>
                    </div>
                )}

                {/* Email Info */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="text-sm text-blue-800">
                        <div className="font-medium mb-1">
                            Email will be sent to:
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{userEmail}</span>
                        </div>
                    </div>
                </div>

                {/* Salary Summary Content */}
                <div
                    ref={setSvgRef}
                    className="border border-gray-300 rounded-lg p-6 bg-white"
                >
                    {/* Header */}
                    <div className="text-center mb-8 border-b pb-4">
                        <h1 className="text-2xl font-bold text-[#1F3A5F]">
                            Salary Summary
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {getMonthName(formData.month)} {formData.year}
                        </p>
                    </div>

                    {/* Employee Information */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="font-bold text-[#1F3A5F] mb-3">
                            Employee Information
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
                                    Base Salary:
                                </span>
                                <span className="ml-2 font-bold text-[#1F3A5F]">
                                    {formatCurrency(
                                        prefillData.user.base_salary,
                                    )}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">
                                    Working Days:
                                </span>
                                <span className="ml-2 font-medium">
                                    {formData.working_days || 0} days
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Salary Table */}
                    <div className="overflow-x-auto mb-8">
                        <table className="min-w-full border border-gray-300 text-sm">
                            <thead>
                                <tr className="bg-[#1F3A5F] text-white">
                                    <th className="p-3 border text-left font-medium">
                                        Income
                                    </th>
                                    <th className="p-3 border text-left font-medium">
                                        Additional Income
                                    </th>
                                    <th className="p-3 border text-left font-medium">
                                        Amount
                                    </th>
                                    <th className="p-3 border text-left font-medium">
                                        Deductions
                                    </th>
                                    <th className="p-3 border text-left font-medium">
                                        Amount
                                    </th>
                                    <th className="p-3 border text-left font-medium">
                                        Payment Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Base Salary Row */}
                                <tr>
                                    <td className="p-3 border">Base Salary</td>
                                    <td className="p-3 border">-</td>
                                    <td className="p-3 border font-bold">
                                        {formatCurrency(
                                            prefillData.user.base_salary,
                                        )}
                                    </td>
                                    <td className="p-3 border">Absence</td>
                                    <td className="p-3 border">-</td>
                                    <td
                                        className="p-3 border font-bold text-center"
                                        rowSpan={7}
                                    >
                                        {formatDate(currentDate)}
                                    </td>
                                </tr>

                                {/* Additional Income Rows */}
                                <tr>
                                    <td className="p-3 border" rowSpan={6}>
                                        Additional Income
                                    </td>
                                    <td className="p-3 border">Fuel Costs</td>
                                    <td className="p-3 border">
                                        {formatCurrency(additionalIncome.fuel)}
                                    </td>
                                    <td className="p-3 border" rowSpan={2}>
                                        Social Security
                                    </td>
                                    <td className="p-3 border" rowSpan={2}>
                                        {formatCurrency(
                                            deductions.socialSecurity,
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="p-3 border">Commission</td>
                                    <td className="p-3 border">
                                        {formatCurrency(
                                            additionalIncome.commission,
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="p-3 border">
                                        Overtime (OT)
                                    </td>
                                    <td className="p-3 border">
                                        {formatCurrency(additionalIncome.ot)}
                                    </td>
                                    <td className="p-3 border" colSpan={2}></td>
                                </tr>
                                <tr>
                                    <td className="p-3 border">Bonus</td>
                                    <td className="p-3 border">
                                        {formatCurrency(additionalIncome.bonus)}
                                    </td>
                                    <td className="p-3 border" colSpan={2}></td>
                                </tr>
                                <tr>
                                    <td className="p-3 border">
                                        Holiday Allowance
                                    </td>
                                    <td className="p-3 border">
                                        {formatCurrency(
                                            additionalIncome.holidayAllowance,
                                        )}
                                    </td>
                                    <td className="p-3 border" colSpan={2}></td>
                                </tr>
                                <tr>
                                    <td className="p-3 border">Other</td>
                                    <td className="p-3 border">
                                        {formatCurrency(additionalIncome.other)}
                                    </td>
                                    <td className="p-3 border" colSpan={2}></td>
                                </tr>

                                {/* Totals Row */}
                                <tr className="bg-gray-50 font-bold">
                                    <td
                                        className="p-3 border text-right"
                                        colSpan={2}
                                    >
                                        Total Income:
                                    </td>
                                    <td className="p-3 border">
                                        {formatCurrency(totalIncome)}
                                    </td>
                                    <td
                                        className="p-3 border text-right"
                                        colSpan={1}
                                    >
                                        Total Deductions:
                                    </td>
                                    <td className="p-3 border">
                                        {formatCurrency(totalDeductions)}
                                    </td>
                                    <td className="p-3 border"></td>
                                </tr>

                                {/* Net Salary Row */}
                                <tr className="bg-[#1F3A5F] text-white font-bold">
                                    <td
                                        className="p-4 border text-center text-lg"
                                        colSpan={4}
                                    >
                                        NET SALARY:
                                    </td>
                                    <td
                                        className="p-4 border text-center text-xl"
                                        colSpan={2}
                                    >
                                        {formatCurrency(netSalary)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Additional Information */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="font-bold text-[#1F3A5F] mb-3">
                            Additional Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-gray-600">
                                    Working Days:
                                </span>
                                <span className="ml-2 font-medium">
                                    {formData.working_days || 0} days
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">
                                    Vacation Days Left:
                                </span>
                                <span className="ml-2 font-medium">
                                    {prefillData.calculated
                                        .remaining_vacation_days || 0}{' '}
                                    days
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">OT Hours:</span>
                                <span className="ml-2 font-medium">
                                    {prefillData.calculated.ot_hours || 0} hours
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">
                                    Day Off Days:
                                </span>
                                <span className="ml-2 font-medium">
                                    {prefillData.calculated
                                        .day_off_days_this_month || 0}{' '}
                                    d
                                </span>
                            </div>
                        </div>
                        {formData.notes && (
                            <div className="mt-4 p-3 bg-white rounded border border-gray-300">
                                <span className="font-medium text-gray-700">
                                    Notes:
                                </span>
                                <p className="mt-1 text-gray-600">
                                    {formData.notes}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-4 border-t text-center text-gray-500 text-sm">
                        <p>
                            Generated on {new Date().toLocaleDateString()} •
                            This is an official salary statement
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
