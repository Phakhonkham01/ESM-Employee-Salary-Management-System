'use client'
import { useState } from 'react'
import { Download, Mail, Loader2 } from 'lucide-react'

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
                <h5 className="font-bold text-white">Weekday (Mon-Fri)</h5>
            </div>
            <div className="p-4">
                <p className="text-sm text-gray-600 mb-4">
                    Enter overtime hours for regular working days
                </p>

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
                            Hourly Rate
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                $
                            </span>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={rate_per_hour}
                                onChange={(e) =>
                                    onRatePerHourChange(e.target.value)
                                }
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1F3A5F] focus:border-transparent"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-4 p-3 rounded bg-blue-50 border border-blue-200">
                    <div className="text-sm text-[#1F3A5F]">
                        <div className="font-bold mb-1">
                            Total: ${amount.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-600">
                            {hours} hrs x ${rate_per_hour.toFixed(2)}/hr
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
                <h5 className="font-bold text-white">Weekend (Sat-Sun)</h5>
            </div>
            <div className="p-4">
                <p className="text-sm text-gray-600 mb-4">
                    Enter weekend overtime data
                </p>

                <div className="space-y-4">
                    {/* Weekend OT Hours */}
                    <div className="border-b border-gray-200 pb-4">
                        <h6 className="font-medium text-gray-700 mb-3">
                            OT Hours
                        </h6>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Number of Hours
                                </label>
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
                                    Hourly Rate
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                        $
                                    </span>
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
                                            OT Hours: {hours} hrs x $
                                            {rate_per_hour.toFixed(2)}
                                        </div>
                                        <div className="font-bold mt-1">
                                            Subtotal: ${hoursAmount.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Weekend Work Days */}
                    <div>
                        <h6 className="font-medium text-gray-700 mb-3">
                            Work Days (Full/Half Day)
                        </h6>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Number of Days (0.5 = half day)
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
                                    Daily Rate
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                        $
                                    </span>
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
                                            Work Days: {days} days x $
                                            {rate_per_day.toFixed(2)}
                                        </div>
                                        <div className="font-bold mt-1">
                                            Subtotal: ${daysAmount.toFixed(2)}
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
                                    `${hours} hrs ($${hoursAmount.toFixed(2)})`}
                                {hours > 0 && days > 0 && ' + '}
                                {days > 0 &&
                                    `${days} days ($${daysAmount.toFixed(2)})`}
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

    const dayOffThisMonth = prefillData.calculated.day_off_days ?? 0

    const remainingVacation =
        prefillData.calculated.remaining_vacation_days ?? 0

    const daysToDeduct = Math.max(0, dayOffThisMonth - remainingVacation)

    return (
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
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            $
                        </span>
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
                        Auto-calculated Components
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-300 rounded bg-white p-4">
                        <div className="flex items-center mb-2">
                            <DollarSign className="w-5 h-5 text-[#1F3A5F] mr-2" />
                            <span className="text-sm font-medium text-gray-700">
                                OT Amount (System)
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-[#1F3A5F]">
                            ${prefillData.calculated.ot_amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            {prefillData.calculated.ot_hours} hours
                        </p>
                        <div className="mt-2 text-xs text-gray-500">
                            <div>
                                Weekday:{' '}
                                {prefillData.calculated.weekday_ot_hours || 0}{' '}
                                hrs
                            </div>
                            <div>
                                Weekend:{' '}
                                {prefillData.calculated.weekend_ot_hours || 0}{' '}
                                hrs
                            </div>
                        </div>
                    </div>
                    <div className="border border-gray-300 rounded bg-white p-4">
                        <div className="flex items-center mb-2">
                            <Fuel className="w-5 h-5 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">
                                Fuel Costs
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                            $
                            {prefillData.calculated.fuel_costs.toLocaleString()}
                        </p>
                    </div>
                    <div className="border border-gray-300 rounded bg-white p-4">
                        <div className="flex items-center mb-2">
                            <CalendarX className="w-5 h-5 text-amber-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">
                                Day Off Days
                            </span>
                        </div>
                        <p>วันขาดของเดือนนี้: {dayOffThisMonth} วัน</p>
                    </div>
                    <div
                        className={`border border-gray-300 rounded bg-white p-4`}
                    >
                        <div className="flex items-center mb-2">
                            <UserX
                                className={`w-5 h-5 mr-2 ${getVacationTextColor(prefillData.calculated.vacation_color)}`}
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Vacation Days Left
                            </span>
                        </div>
                        <p>วันขาดรวมทั้งหมด: {dayOffThisMonth} วัน</p>
                        <p className="text-red-600 font-bold">
                            วันขาดที่ต้องตัดเงิน: {daysToDeduct} วัน
                        </p>
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
                        Approved OT from System
                    </h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-gray-700">Weekday:</span>
                        <span className="ml-2 font-bold text-[#1F3A5F]">
                            {prefillData.calculated.weekday_ot_hours || 0} hours
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-700">Weekend:</span>
                        <span className="ml-2 font-bold text-amber-700">
                            {prefillData.calculated.weekend_ot_hours || 0} hours
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
                        Add Manual OT Hours
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
                            onManualOTChange('weekday', 'rate_per_hour', value)
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
                            onManualOTChange('weekend', 'rate_per_hour', value)
                        }
                        onRatePerDayChange={(value) =>
                            onManualOTChange('weekend', 'rate_per_day', value)
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
                                Total: ${totalAmount.toFixed(2)}
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
    )
}

export const Step3AdditionalIncome: React.FC<StepComponentsProps> = ({
    formData,
    onInputChange,
}) => {
    return (
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
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            $
                        </span>
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
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            $
                        </span>
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
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            $
                        </span>
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
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            $
                        </span>
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
                    Total Additional Income: $
                    {(
                        formData.bonus +
                        formData.commission +
                        formData.money_not_spent_on_holidays +
                        formData.other_income
                    ).toLocaleString()}
                </p>
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
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            $
                        </span>
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
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            $
                        </span>
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
                    Total Deductions: $
                    {calculateTotalDeductions().toLocaleString()}
                </p>
            </div>
        </div>
    )
}

export const Step5Summary: React.FC<StepComponentsProps> = ({
    prefillData,
    formData,
    calculateTotalIncome,
    calculateTotalDeductions,
    calculateNetSalary,
    manualOTDetails,
}) => {
    if (!prefillData) return null

    const allOTDetails = [
        ...(prefillData.calculated.ot_details || []),
        ...(manualOTDetails || []),
    ]

    const totalOTAmount = allOTDetails.reduce(
        (sum, detail) => sum + detail.amount,
        0,
    )
    const totalOTHours = allOTDetails
        .filter((d) => d.ot_type === 'weekday')
        .reduce((sum, detail) => sum + (detail.total_hours || 0), 0)
    const totalOTDays = allOTDetails
        .filter((d) => d.ot_type === 'weekend')
        .reduce((sum, detail) => sum + (detail.days || 0), 0)

    const manualOT = allOTDetails.filter((detail) => detail.is_manual === true)
    const autoOT = allOTDetails.filter((detail) => !detail.is_manual)

    return (
        <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-[#1F3A5F]">
                <Calculator className="w-5 h-5 text-[#1F3A5F]" />
                <h3 className="text-lg font-semibold text-[#1F3A5F]">
                    Salary Summary
                </h3>
            </div>
            <div className="border border-gray-300 rounded p-6 bg-gray-50">
                <div className="space-y-6">
                    {/* Manual OT Details */}
                    {manualOT.length > 0 && (
                        <div className="bg-white rounded p-4 border border-[#1F3A5F]">
                            <h4 className="text-base font-bold text-[#1F3A5F] mb-3 uppercase">
                                Manual OT Details
                            </h4>
                            <div className="space-y-2 mb-3">
                                {manualOT.map((detail, index) => (
                                    <div
                                        key={`manual-${index}`}
                                        className="flex justify-between py-2 px-2 hover:bg-blue-50 rounded border-b border-gray-100"
                                    >
                                        <div>
                                            <span className="text-gray-700">
                                                {getOtTypeEnglish(
                                                    detail.ot_type,
                                                )}
                                            </span>
                                            <div className="text-sm text-gray-500">
                                                {detail.ot_type === 'weekday'
                                                    ? `${detail.total_hours} hours`
                                                    : detail.days &&
                                                        detail.days > 0
                                                      ? `${detail.days} days`
                                                      : `${detail.total_hours} hours`}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium text-gray-900">
                                                $
                                                {detail.amount.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {detail.ot_type === 'weekday'
                                                    ? `$${detail.hourly_rate?.toFixed(2) || '0.00'}/hr`
                                                    : detail.days &&
                                                        detail.days > 0
                                                      ? `$${detail.rate_per_day?.toFixed(2) || '0.00'}/day`
                                                      : `$${detail.hourly_rate?.toFixed(2) || '0.00'}/hr`}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between pt-2 border-t border-[#1F3A5F]">
                                <span className="font-bold text-[#1F3A5F]">
                                    Manual OT Total:
                                </span>
                                <span className="font-bold text-[#1F3A5F]">
                                    $
                                    {manualOT
                                        .reduce(
                                            (sum, detail) =>
                                                sum + detail.amount,
                                            0,
                                        )
                                        .toLocaleString()}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Income */}
                    <div className="bg-white rounded p-4 border border-[#1F3A5F]">
                        <h4 className="text-base font-bold text-[#1F3A5F] mb-3 uppercase">
                            Income
                        </h4>
                        <div className="space-y-2">
                            <div className="flex justify-between py-1 border-b border-gray-100">
                                <span className="text-gray-700">
                                    Base Salary:
                                </span>
                                <span className="font-semibold text-gray-900">
                                    $
                                    {prefillData.user.base_salary.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-100">
                                <span className="text-gray-700">
                                    OT Amount (Total):
                                </span>
                                <span className="font-semibold text-gray-900">
                                    ${totalOTAmount.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-100">
                                <span className="text-gray-700">
                                    Fuel Costs:
                                </span>
                                <span className="font-semibold text-gray-900">
                                    $
                                    {prefillData.calculated.fuel_costs.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-100">
                                <span className="text-gray-700">Bonus:</span>
                                <span className="font-semibold text-gray-900">
                                    ${formData.bonus.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-100">
                                <span className="text-gray-700">
                                    Commission:
                                </span>
                                <span className="font-semibold text-gray-900">
                                    ${formData.commission.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-100">
                                <span className="text-gray-700">
                                    Holiday Allowance:
                                </span>
                                <span className="font-semibold text-gray-900">
                                    $
                                    {formData.money_not_spent_on_holidays.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-gray-700">
                                    Other Income:
                                </span>
                                <span className="font-semibold text-gray-900">
                                    ${formData.other_income.toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <div className="border-t-2 border-[#1F3A5F] my-3"></div>
                        <div className="flex justify-between py-2 bg-blue-50 px-3 rounded">
                            <span className="font-bold text-[#1F3A5F]">
                                Total Income:
                            </span>
                            <span className="font-bold text-[#1F3A5F] text-lg">
                                ${calculateTotalIncome().toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Deductions */}
                    <div className="bg-white rounded p-4 border border-red-300">
                        <h4 className="text-base font-bold text-red-700 mb-3 uppercase">
                            Deductions
                        </h4>
                        <div className="space-y-2">
                            <div className="flex justify-between py-1 border-b border-gray-100">
                                <span className="text-gray-700">
                                    Office Expenses:
                                </span>
                                <span className="font-semibold text-gray-900">
                                    ${formData.office_expenses.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-gray-700">
                                    Social Security:
                                </span>
                                <span className="font-semibold text-gray-900">
                                    ${formData.social_security.toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <div className="border-t-2 border-red-300 my-3"></div>
                        <div className="flex justify-between py-2 bg-red-50 px-3 rounded">
                            <span className="font-bold text-red-700">
                                Total Deductions:
                            </span>
                            <span className="font-bold text-red-700 text-lg">
                                ${calculateTotalDeductions().toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Net Salary */}
                    <div className="bg-[#1F3A5F] rounded p-5">
                        <div className="flex justify-between items-center">
                            <span className="text-xl font-bold text-white">
                                NET SALARY:
                            </span>
                            <span className="text-3xl font-bold text-white">
                                ${calculateNetSalary().toLocaleString()}
                            </span>
                        </div>
                        <div className="mt-2 text-sm text-blue-200">
                            Total OT: {totalOTHours} hrs + {totalOTDays} days
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="bg-white rounded p-4 border border-gray-300">
                        <p className="text-sm font-bold text-gray-800 mb-3 uppercase">
                            Additional Information
                        </p>
                        <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex items-start">
                                <span className="font-medium mr-2">•</span>
                                <span>
                                    Working Days:{' '}
                                    <span className="font-semibold">
                                        {formData.working_days} days
                                    </span>
                                </span>
                            </div>
                            <div className="flex items-start">
                                <span className="font-medium mr-2">•</span>
                                <span>
                                    Day Off Days:{' '}
                                    <span className="font-semibold">
                                        {prefillData.calculated.day_off_days}{' '}
                                        days
                                    </span>
                                </span>
                            </div>
                            <div className="flex items-start">
                                <span className="font-medium mr-2">•</span>
                                <span
                                    className={getVacationTextColor(
                                        prefillData.calculated.vacation_color,
                                    )}
                                >
                                    Vacation Days Left:{' '}
                                    <span className="font-semibold">
                                        {
                                            prefillData.calculated
                                                .remaining_vacation_days
                                        }{' '}
                                        days
                                    </span>
                                </span>
                            </div>
                            <div className="flex items-start">
                                <span className="font-medium mr-2">•</span>
                                <span>
                                    OT Hours:{' '}
                                    <span className="font-semibold">
                                        {totalOTHours} hours
                                    </span>
                                </span>
                            </div>
                            <div className="flex items-start">
                                <span className="font-medium mr-2">•</span>
                                <span>
                                    OT Days (Weekend):{' '}
                                    <span className="font-semibold">
                                        {totalOTDays} days
                                    </span>
                                </span>
                            </div>
                            {formData.notes && (
                                <div className="flex items-start">
                                    <span className="font-medium mr-2">•</span>
                                    <span>
                                        Notes:{' '}
                                        <span className="font-semibold">
                                            {formData.notes}
                                        </span>
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
