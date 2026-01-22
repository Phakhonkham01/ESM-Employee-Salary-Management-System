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
        <div className="bg-[#45cc67] px-4 py-3">
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
                    <tr
                        key={index}
                        className="hover:bg-blue-50/50 transition-colors"
                    >
                        {showDate && (
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 border-b border-gray-100">
                                {detail.date
                                    ? new Date(detail.date).toLocaleDateString(
                                          'lo-LA',
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
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm ${getOtTypeColor(detail.ot_type)}`}
                            >
                                {/* Assuming you have a function to get Lao names, or replace with logic below */}
                                {detail.ot_type === 'weekday'
                                    ? 'ມື້ທຳມະດາ'
                                    : 'ມື້ພັກ'}
                            </span>
                        </td>

                        {showDate && (
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 border-b border-gray-100 italic">
                                {detail.start_hour || '09:00'} -{' '}
                                {detail.end_hour || '17:00'}
                            </td>
                        )}

                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-center border-b border-gray-100">
                            {detail.ot_type === 'weekday'
                                ? `${detail.total_hours} ຊົ່ວໂມງ`
                                : detail.days
                                  ? `${detail.days} ມື້`
                                  : `${detail.total_hours} ຊົ່ວໂມງ`}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 text-center border-b border-gray-100">
                            {detail.ot_type === 'weekday'
                                ? `${detail.hourly_rate?.toLocaleString()} /ຊມ`
                                : detail.days
                                  ? `${detail.rate_per_day?.toLocaleString()} /ມື້`
                                  : `${detail.hourly_rate?.toLocaleString()} /ຊມ`}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-[#1F3A5F] text-right border-b border-gray-100 bg-slate-50/30">
                            {detail.amount.toLocaleString()} ກີບ
                        </td>
                    </tr>
                ))}

                {/* Grand Total Row */}
                <tr className="bg-slate-100 font-bold border-t-2 border-[#1F3A5F]">
                    <td
                        colSpan={showDate ? 3 : 2}
                        className="px-4 py-4 text-right text-[#1F3A5F] uppercase tracking-wider text-xs"
                    >
                        ລວມຍອດທັງໝົດ (Total):
                    </td>
                    <td className="px-4 py-4 text-center text-gray-800">
                        {otDetails.reduce(
                            (sum, detail) =>
                                sum +
                                (detail.ot_type === 'weekday'
                                    ? detail.total_hours
                                    : detail.days || detail.total_hours),
                            0,
                        )}
                        <span className="ml-1 text-xs font-normal text-gray-500">
                            {otDetails.some((d) => d.days)
                                ? 'ມື້/ຊມ'
                                : 'ຊົ່ວໂມງ'}
                        </span>
                    </td>
                    <td className="px-4 py-4 text-center text-gray-400">-</td>
                    <td className="px-4 py-4 text-right text-lg text-[#1F3A5F] bg-blue-50/50">
                        {otDetails
                            .reduce((sum, detail) => sum + detail.amount, 0)
                            .toLocaleString()}{' '}
                        ກີບ
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
        <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-[#45cc67] px-4 py-3">
                <h5 className="font-bold text-white flex items-center gap-2">
                    <span>ມື້ທຳມະດາ (ຈັນ - ສຸກ)</span>
                </h5>
            </div>

            <div className="p-4">
                <div className="space-y-4">
                    {/* OT Hours Input with Plus/Minus Buttons */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            ຈຳນວນຊົ່ວໂມງ OT
                        </label>
                        <div className="flex items-center gap-2">
                            {/* Minus Button */}
                            <button
                                onClick={() => {
                                    const newValue = Math.max(
                                        0,
                                        Number(hours) - 0.5,
                                    )
                                    onHoursChange(String(newValue)) // Convert number to string
                                }}
                                className="w-12 h-10 flex items-center justify-center bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 border border-gray-300 rounded-md transition-colors text-xl font-bold"
                                type="button"
                            >
                                −
                            </button>
                            <div className="relative flex-1">
                                <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    value={hours}
                                    onChange={(e) =>
                                        onHoursChange(e.target.value)
                                    } // This is already a string
                                    className="w-full px-3 py-2 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F3A5F] font-bold text-lg"
                                    placeholder="0"
                                />
                            </div>

                            {/* Plus Button */}
                            <button
                                onClick={() => {
                                    const newValue = Number(hours) + 0.5
                                    onHoursChange(String(newValue)) // Convert number to string
                                }}
                                className="w-12 h-10 flex items-center justify-center bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-600 border border-gray-300 rounded-md transition-colors text-xl font-bold"
                                type="button"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Rate Input */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            ອັດຕາຄ່າຈ້າງ (ຕໍ່ຊົ່ວໂມງ)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                min={0}
                                value={rate_per_hour === 0 ? '' : rate_per_hour}
                                onChange={(e) =>
                                    onRatePerHourChange(e.target.value)
                                }
                                /* Added 'no-spinner' class here */
                                className="no-spinner w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F3A5F] transition-all"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>

                {/* Calculation Result Area */}
                <div className="mt-5 p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex flex-col">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                            ລວມເງິນທັງໝົດ
                        </div>
                        <div className="text-2xl font-black text-[#1F3A5F]">
                            {amount.toLocaleString()}{' '}
                            <span className="text-sm font-bold">ກີບ</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-200 text-sm text-gray-500 font-medium">
                            {hours || 0} ຊົ່ວໂມງ ×{' '}
                            {rate_per_hour.toLocaleString()} ກີບ
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
            <div className="bg-[#FFFFFF] px-4 py-3 rounded-t">
                <h5 className="font-bold text-white">
                    ມື້ພັກ (ວັນເສົາ-ວັນອາທິດ)
                </h5>
            </div>
            <div className="p-4">
                <div className="space-y-4">
                    {/* Weekend OT Hours */}
                    <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
                        {/* Header */}

                        <div className="p-4 space-y-4">
                            {/* Quantity Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    ຈຳນວນຊົ່ວໂມງ
                                </label>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            onHoursChange(
                                                String(
                                                    Math.max(
                                                        0,
                                                        Number(hours) - 0.5,
                                                    ),
                                                ),
                                            )
                                        }
                                        className="w-12 h-10 flex items-center justify-center bg-gray-50 hover:bg-red-50 text-gray-500 border border-gray-300 rounded-md font-bold text-xl transition-colors"
                                        type="button"
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        value={hours}
                                        onChange={(e) =>
                                            onHoursChange(e.target.value)
                                        }
                                        className="no-spinner flex-1 px-3 py-2 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-[#D97706] focus:border-transparent outline-none font-bold text-lg"
                                        placeholder="0"
                                    />
                                    <button
                                        onClick={() =>
                                            onHoursChange(
                                                String(Number(hours) + 0.5),
                                            )
                                        }
                                        className="w-12 h-10 flex items-center justify-center bg-gray-50 hover:bg-green-50 text-gray-500 border border-gray-300 rounded-md font-bold text-xl transition-colors"
                                        type="button"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Hourly Rate Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    ອັດຕາຄ່າຈ້າງ (Hourly Rate)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={
                                            rate_per_hour === 0
                                                ? ''
                                                : rate_per_hour
                                        }
                                        onChange={(e) =>
                                            onRatePerHourChange(e.target.value)
                                        }
                                        className="no-spinner w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            {/* Summary Calculation Box */}
                            {hours > 0 && rate_per_hour > 0 && (
                                <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                                    <div className="flex justify-between items-center text-amber-900">
                                        <span className="text-xs font-medium uppercase">
                                            ລວມຍອດ OT:
                                        </span>
                                        <div className="text-right">
                                            <div className="text-[10px] text-amber-700">
                                                {hours} ຊມ x{' '}
                                                {Number(
                                                    rate_per_hour,
                                                ).toLocaleString()}
                                            </div>
                                            <div className="text-lg font-black">
                                                {hoursAmount.toLocaleString()}{' '}
                                                <span className="text-xs">
                                                    ກີບ
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Weekend Work Days */}
                    <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
                        {/* Header - Use a slightly different color if you want to distinguish from Hours */}
                        <div className="bg-[#FFFFFF] px-4 py-3">
                            <h5 className="font-bold text-[#000005] flex items-center gap-2">
                                ມື້ເຮັດວຽກ ເສົາ - ອາທິດ (Full/Half Day)
                            </h5>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Day Quantity Selector */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    ຈຳນວນມື້ (0.5 = ເຄິ່ງມື້)
                                </label>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            onDaysChange(
                                                String(
                                                    Math.max(
                                                        0,
                                                        Number(days) - 0.5,
                                                    ),
                                                ),
                                            )
                                        }
                                        className="w-12 h-10 flex items-center justify-center bg-gray-50 hover:bg-red-50 text-gray-500 border border-gray-300 rounded-md font-bold text-xl transition-colors"
                                        type="button"
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        value={days}
                                        onChange={(e) =>
                                            onDaysChange(e.target.value)
                                        }
                                        className="no-spinner flex-1 px-3 py-2 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E67E22] focus:border-transparent outline-none font-bold text-lg"
                                        placeholder="0"
                                    />
                                    <button
                                        onClick={() =>
                                            onDaysChange(
                                                String(Number(days) + 0.5),
                                            )
                                        }
                                        className="w-12 h-10 flex items-center justify-center bg-gray-50 hover:bg-green-50 text-gray-500 border border-gray-300 rounded-md font-bold text-xl transition-colors"
                                        type="button"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Daily Rate Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    ອັດຕາລາຍວັນ (Daily Rate)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={
                                            rate_per_day === 0
                                                ? ''
                                                : rate_per_day
                                        }
                                        onChange={(e) =>
                                            onRatePerDayChange(e.target.value)
                                        }
                                        className="no-spinner w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E67E22] focus:border-transparent outline-none"
                                        placeholder="0.00"
                                    />
                                    <span className="absolute right-3 top-2 text-gray-400 text-sm italic pointer-events-none">
                                        ກີບ/ມື້
                                    </span>
                                </div>
                            </div>

                            {/* Calculation Result Summary */}
                            {days > 0 && rate_per_day > 0 && (
                                <div className="mt-4 p-3 rounded-lg bg-orange-50 border border-orange-200">
                                    <div className="flex justify-between items-center text-orange-900">
                                        <span className="text-xs font-medium uppercase text-orange-700">
                                            ລວມຍອດລາຍວັນ:
                                        </span>
                                        <div className="text-right">
                                            <div className="text-[10px] text-orange-600">
                                                {days} ມື້ x{' '}
                                                {Number(
                                                    rate_per_day,
                                                ).toLocaleString()}
                                            </div>
                                            <div className="text-lg font-black">
                                                {daysAmount.toLocaleString()}{' '}
                                                <span className="text-xs font-normal">
                                                    ກີບ
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {(hours > 0 || days > 0) && (
                    <div className="mt-6 p-4 rounded-xl bg-[#FFF8E1] border-2 border-amber-200 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h4 className="text-amber-900 font-bold text-lg mb-1">
                                    ລວມເງິນເສົາ-ອາທິດ (Weekend Total)
                                </h4>
                                <div className="text-amber-700 text-sm flex flex-wrap gap-x-3 items-center">
                                    {hours > 0 && (
                                        <span>
                                            <span className="font-semibold">
                                                {hours} ຊມ
                                            </span>{' '}
                                            ({hoursAmount.toLocaleString()} ກີບ)
                                        </span>
                                    )}

                                    {hours > 0 && days > 0 && (
                                        <span className="text-amber-400 font-bold text-lg">
                                            +
                                        </span>
                                    )}

                                    {days > 0 && (
                                        <span>
                                            <span className="font-semibold">
                                                {days} ມື້
                                            </span>{' '}
                                            ({daysAmount.toLocaleString()} ກີບ)
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="text-right border-t md:border-t-0 border-amber-200 pt-3 md:pt-0">
                                <span className="block text-xs uppercase tracking-wider text-amber-600 font-bold">
                                    ຍອດລວມທັງໝົດ
                                </span>
                                <span className="text-3xl font-black text-[#1F3A5F]">
                                    {totalAmount.toLocaleString()}
                                    <span className="text-sm ml-1 font-semibold text-gray-500 uppercase">
                                        ກີບ
                                    </span>
                                </span>
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
                        ຂໍ້ມູນພະນັກງານ
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ຊື່ພະນັກງານ
                        </label>
                        <input
                            type="text"
                            value={`${user.first_name_en} ${user.last_name_en}`}
                            disabled
                            className="w-full h-[50px] px-3 py-2 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
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
                            className="w-full h-[50px] px-3 py-2 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            (ເດືອນ - ປີ)ທີ່ຈ່າຍເງິນ
                        </label>
                        <input
                            type="text"
                            value={`${getMonthName(month)} ${year}`}
                            disabled
                            className="w-full h-[50px] px-3 py-2 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ເງິນເດືອນພື້ນຖານ
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></span>
                            <input
                                type="text"
                                value={prefillData.user.base_salary.toLocaleString()}
                                disabled
                                className="w-full h-[50px] px-3 py-2 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
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
                        <div className="border-none bg-[#f2f2f2] rounded-xl bg-white p-5 shadow-sm">
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
                <div className="mb-6 p-5 bg-slate-50 rounded-r-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Calculator className="w-5 h-5 text-[#1F3A5F]" />
                        <h4 className="font-bold text-[#1F3A5F] uppercase tracking-wide text-sm">
                            OT ທີ່ອະນຸມັດແລ້ວ (System Approved OT)
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Weekday Card */}
                        <div className="flex justify-between items-center p-3 bg-[#45cc67] border border-gray-100 rounded-md shadow-sm">
                            <span className="text-[#FFFFFF] text-sm font-medium">
                                ມື້ທຳມະດາ (Mon-Fri)
                            </span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-[#FFFFFF]">
                                    {prefillData.calculated.weekday_ot_hours ||
                                        0}
                                </span>
                                <span className="text-xs text-[#FFFFFF] font-normal">
                                    hrs
                                </span>
                            </div>
                        </div>

                        {/* Weekend Card */}
                        <div className="flex justify-between items-center p-3 bg-[#ff5a3d] border border-gray-100 rounded-md shadow-sm">
                            <span className="text-[#FFFFFF] text-sm font-medium">
                                ມື້ພັກ (Sat-Sun)
                            </span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-[#FFFFFF]">
                                    {prefillData.calculated.weekend_ot_hours ||
                                        0}
                                </span>
                                <span className="text-xs text-[#ffffff] font-normal">
                                    hrs
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Summary Footer */}
                </div>
                {/* Manual OT Entry Section */}
                <div className="mb-8">
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
                            <h5 className="font-bold text-[#1F3A5F]">
                                ສະຫຼຸບ OT ທີ່ເພີ່ມມາ
                            </h5>
                            <div className="text-sm text-gray-600 mt-2 space-y-2 border-t border-gray-100 pt-3">
                                {/* Weekday Row */}
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">
                                        ມື້ທຳມະດາ:
                                    </span>
                                    <span className="font-semibold text-gray-800">
                                        {manualOT.weekday.hours} ຊົ່ວໂມງ
                                    </span>
                                </div>

                                {/* Weekend Hours Row */}
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">
                                        ມື້ພັກ (ຊົ່ວໂມງ):
                                    </span>
                                    <span className="font-semibold text-gray-800">
                                        {manualOT.weekend.hours} ຊົ່ວໂມງ
                                    </span>
                                </div>

                                {/* Weekend Days Row */}
                                <div className="flex justify-between items-center text-amber-700">
                                    <span>ມື້ພັກ (ຈຳນວນມື້):</span>
                                    <span className="font-semibold">
                                        {manualOT.weekend.days} ມື້
                                    </span>
                                </div>

                                {/* Total Amount Row */}
                                <div className="flex justify-between items-center font-bold mt-3 pt-2 border-t border-dashed border-gray-300 text-[#1F3A5F] text-base">
                                    <span>ລວມເງິນທັງໝົດ:</span>
                                    <span className="text-lg">
                                        {totalAmount.toLocaleString()} ກີບ
                                    </span>
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
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#45cc67] rounded hover:bg-[#3aa85a] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
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
                        ລາຍໄດ້ເພີ່ມເຕີມ
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
                                className="w-full h-[50px] px-3 py-2 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
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
                                className="w-full h-[50px] px-3 py-2 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ເງິນອຸດໜູນວັນພັກປະຈຳປີ
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                name="money_not_spent_on_holidays"
                                value={formData.money_not_spent_on_holidays}
                                onChange={onInputChange}
                                className="w-full h-[50px] px-3 py-2 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ລາຍຮັບອື່ນໆ
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                name="other_income"
                                value={formData.other_income}
                                onChange={onInputChange}
                                className="w-full h-[50px] px-3 py-2 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-[#f2f2f2f2] rounded">
                    <p className="w-full h-[50px] px-3 py-2 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]">
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
    prefillData,
}) => {
    // ✅ เปลี่ยนจากคำนวณอัตโนมัติเป็นรับค่า rate ที่ป้อนเข้ามา
    const calculateCutOffTotal = () => {
        // ใช้ cut_off_pay_amount เป็น rate ต่อวัน
        return formData.cut_off_pay_days * formData.cut_off_pay_amount
    }

    // ✅ แก้ไขฟังก์ชันนี้ - ไม่ต้องคำนวณอัตโนมัติแล้ว
    const handleCutOffDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const days = parseFloat(e.target.value) || 0
        onInputChange(e) // อัพเดทจำนวนวัน
        // ไม่ต้องคำนวณและอัพเดทจำนวนเงินอัตโนมัติอีกต่อไป
    }

    return (
        <div className="min-h-[600px]">
            <div>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-red-600">
                    <UserX className="w-5 h-5 text-red-600" />
                    <h3 className="text-lg font-semibold text-red-600">
                        Deductions (ລາຍການຫັກ)
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Cut off pay for days off work */}
                    <div className="col-span-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                            <CalendarX className="w-5 h-5 text-red-600" />
                            <h4 className="font-semibold text-red-700">
                                ຫັກເງິນເດືອນຈາກການຂາດງານ
                            </h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* ✅ Input 1: จำนวนวันที่ขาด */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ຈຳນວນວັນທີ່ຂາດງານ (Days Off Work)
                                </label>
                                <input
                                    type="number"
                                    name="cut_off_pay_days"
                                    value={formData.cut_off_pay_days}
                                    onChange={handleCutOffDaysChange}
                                    min="0"
                                    step="0.5"
                                    className="w-full h-[50px] px-3 py-2 border border-none rounded-sm bg-[#FFFFFF] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                                    placeholder="0"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    ສາມາດໃສ່ 0.5 ສຳລັບເຄິ່ງວັນ
                                </p>
                            </div>

                            {/* ✅ Input 2: อัตราการหักต่อวัน (ป้อนเอง) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ອັດຕາການຫັກຕໍ່ວັນ (Cut Off Rate per Day)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="cut_off_pay_amount"
                                        value={formData.cut_off_pay_amount}
                                        onChange={onInputChange}
                                        min="0"
                                        className="w-full h-[50px] px-3 py-2 border border-none rounded-sm bg-[#FFFFFF] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                                        placeholder="0"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    ປ້ອນຈຳນວນເງິນທີ່ຕ້ອງການຫັກຕໍ່ 1 ວັນ
                                    {prefillData && (
                                        <span className="block font-medium text-gray-600 mt-1">
                                            ແນະນຳ:
                                            {(
                                                prefillData.user.base_salary /
                                                30
                                            ).toLocaleString()}
                                            /ວັນ
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* ✅ Summary Box - แสดงยอดรวมที่หัก */}
                        {formData.cut_off_pay_days > 0 &&
                            formData.cut_off_pay_amount > 0 && (
                                <div className="mt-3 p-3 bg-white border border-red-300 rounded">
                                    <div className="text-sm text-red-700">
                                        <span className="font-medium">
                                            ສະຫຼຸບ:
                                        </span>{' '}
                                        ຫັກເງິນ {formData.cut_off_pay_days} ວັນ
                                        × ₭
                                        {formData.cut_off_pay_amount.toLocaleString()}
                                        /ວັນ =
                                        <span className="font-bold ml-1 text-lg">
                                            {calculateCutOffTotal().toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            )}
                    </div>

                    {/* Office Expenses */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Office Expenses (ຄ່າໃຊ້ຈ່າຍສຳນັກງານ)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                name="office_expenses"
                                value={formData.office_expenses}
                                onChange={onInputChange}
                                className="w-full h-[50px] px-3 py-2 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                            />
                        </div>
                    </div>

                    {/* Social Security */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Social Security (ປະກັນສັງຄົມ)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                name="social_security"
                                value={formData.social_security}
                                onChange={onInputChange}
                                className="w-full h-[50px] px-3 py-2 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                            />
                        </div>
                    </div>

                    {/* Working Days */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Working Days (ຈຳນວນວັນເຮັດວຽກ)
                        </label>
                        <input
                            type="number"
                            name="working_days"
                            value={formData.working_days}
                            onChange={onInputChange}
                            min="0"
                            max="31"
                            className="w-full h-[50px] px-3 py-2 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            ຈຳນວນວັນທີ່ເຮັດວຽກໃນເດືອນນີ້
                        </p>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes (ໝາຍເຫດ)
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={onInputChange}
                            rows={3}
                            placeholder="ໝາຍເຫດເພີ່ມເຕີມ..."
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1F3A5F] focus:border-transparent resize-none"
                        />
                    </div>
                </div>

                {/* Total Deductions Summary */}
                <div className="mt-4 p-4 bg-red-50 border border-red-300 rounded">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-700">
                                ຄ່າໃຊ້ຈ່າຍສຳນັກງານ:
                            </span>
                            <span className="font-medium">
                                {formData.office_expenses.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-700">ປະກັນສັງຄົມ:</span>
                            <span className="font-medium">
                                {formData.social_security.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-700">
                                ຫັກເງິນຈາກການຂາດງານ:
                            </span>
                            <span className="font-medium text-red-600">
                                {calculateCutOffTotal().toLocaleString()}
                            </span>
                        </div>
                        <div className="border-t border-red-300 pt-2 mt-2">
                            <div className="flex justify-between">
                                <span className="font-bold text-red-700">
                                    Total Deductions:
                                </span>
                                <span className="font-bold text-red-700 text-lg">
                                    {calculateTotalDeductions().toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
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
    const [isCapturing, setIsCapturing] = useState(false) // ✅ เพิ่ม
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
        officeExpenses: formData.office_expenses,
        other: formData.other_income,
        commission: formData.commission,
    }

    // Calculate deductions - ✅ แก้ไข: คำนวณยอดรวมที่ถูกต้อง
    const cutOffTotal = formData.cut_off_pay_days * formData.cut_off_pay_amount

    const deductions = {
        absence: cutOffTotal, // ✅ ใช้ยอดรวมที่คำนวณแล้ว
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
            setIsCapturing(true) // ✅ เพิ่ม

            // รอให้ DOM update
            await new Promise((resolve) => setTimeout(resolve, 100))

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
            setIsCapturing(false) // ✅ เพิ่ม
            setIsExporting(false)
        }
    }

    // ✅ แก้ไข Function to send email
    const sendEmailWithPNG = async () => {
        if (!svgRef) return

        try {
            setIsSendingEmail(true)
            setEmailStatus(null)
            setIsCapturing(true) // ✅ เปิด capturing mode

            // รอให้ DOM update
            await new Promise((resolve) => setTimeout(resolve, 100))

            // Convert to image
            const html2canvas = (await import('html2canvas')).default
            const canvas = await html2canvas(svgRef, {
                scale: 0.8,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false,
                ignoreElements: (element) => {
                    // Ignore elements that might cause issues
                    return element.classList?.contains('no-export')
                },
            })

            setIsCapturing(false) // ✅ ปิด capturing mode

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
            setIsCapturing(false) // ✅ ตรวจสอบให้แน่ใจว่าปิด
            setIsSendingEmail(false)
        }
    }

    return (
        <div className="min-h-[600px]">
            {/* ✅ เพิ่ม style tag สำหรับ override oklch colors */}
            <style jsx>{`
                .export-mode,
                .export-mode * {
                    color: rgb(17, 24, 39) !important;
                }

                .export-mode .text-white {
                    color: rgb(255, 255, 255) !important;
                }

                .export-mode .text-red-600 {
                    color: rgb(220, 38, 38) !important;
                }

                .export-mode .text-red-700 {
                    color: rgb(185, 28, 28) !important;
                }

                .export-mode .text-green-600 {
                    color: rgb(22, 163, 74) !important;
                }

                .export-mode .text-gray-600 {
                    color: rgb(75, 85, 99) !important;
                }

                .export-mode .text-gray-700 {
                    color: rgb(55, 65, 81) !important;
                }

                .export-mode .text-gray-800 {
                    color: rgb(31, 41, 55) !important;
                }

                .export-mode .bg-white {
                    background-color: rgb(255, 255, 255) !important;
                }

                .export-mode .bg-gray-50 {
                    background-color: rgb(249, 250, 251) !important;
                }

                .export-mode .bg-gray-100 {
                    background-color: rgb(243, 244, 246) !important;
                }

                .export-mode .bg-blue-50 {
                    background-color: rgb(239, 246, 255) !important;
                }

                .export-mode .bg-green-50 {
                    background-color: rgb(240, 253, 244) !important;
                }

                .export-mode [class*='bg-[#45cc67]'] {
                    background-color: rgb(69, 204, 103) !important;
                }

                .export-mode [class*='bg-[#1F3A5F]'] {
                    background-color: rgb(31, 58, 95) !important;
                }

                .export-mode [class*='text-[#1F3A5F]'] {
                    color: rgb(31, 58, 95) !important;
                }

                .export-mode .border-gray-200 {
                    border-color: rgb(229, 231, 235) !important;
                }

                .export-mode .border-gray-300 {
                    border-color: rgb(209, 213, 219) !important;
                }
            `}</style>

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

                {/* ✅ Salary Summary Content - เพิ่ม export-mode class */}
                <div
                    ref={setSvgRef}
                    className={`border border-gray-300 rounded-lg p-6 bg-white ${isCapturing ? 'export-mode' : ''}`}
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
                            ຂໍ້ມູນພື້ນພະນັກງານ
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
                                    ເງິນເດືອນພື້ນຖານ:
                                </span>
                                <span className="ml-2 font-bold text-[#1F3A5F]">
                                    {formatCurrency(
                                        prefillData.user.base_salary,
                                    )}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">
                                    ມື້ເຮັດວຽກ:
                                </span>
                                <span className="ml-2 font-medium">
                                    {formData.working_days || 0} ມື້
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Salary Table */}
                    <div className="overflow-x-auto mb-8">
                        <table className="min-w-full border text-sm text-gray-900">
                            <thead>
                                <tr className="bg-[#45cc67] text-white">
                                    <th className="p-3 border text-left font-bold">
                                        ລາຍຮັບ
                                    </th>
                                    <th className="p-3 border text-left font-bold">
                                        ລາຍຮັບເພີ່ມເຕີມ
                                    </th>
                                    <th className="p-3 border text-left font-bold">
                                        ຈຳນວນເງິນ
                                    </th>
                                    <th className="p-3 border text-left font-bold">
                                        ລາຍການຫັກ
                                    </th>
                                    <th className="p-3 border text-left font-bold">
                                        ຈຳນວນເງິນ
                                    </th>
                                    <th className="p-3 border text-left font-bold">
                                        ວັນທີຈ່າຍ
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Base Salary Row */}
                                <tr className="bg-white text-gray-800">
                                    <td className="p-3 border font-medium">
                                        ເງິນເດືອນພື້ນຖານ
                                    </td>
                                    <td className="p-3 border text-center text-gray-400">
                                        -
                                    </td>
                                    <td className="p-3 border font-bold">
                                        {formatCurrency(
                                            prefillData.user.base_salary,
                                        )}
                                    </td>
                                    <td className="p-3 border">
                                        ມື້ຂາດວຽກ{' '}
                                        {formData.cut_off_pay_days > 0 && (
                                            <>
                                                ({formData.cut_off_pay_days} ມື້
                                                {' × '}
                                                {formData.cut_off_pay_amount.toLocaleString()}
                                                /ມື້)
                                            </>
                                        )}
                                    </td>
                                    <td className="p-3 border text-red-600">
                                        {formatCurrency(cutOffTotal)}
                                    </td>
                                    <td
                                        className="p-3 border font-bold text-center"
                                        rowSpan={7}
                                    >
                                        {formatDate(currentDate)}
                                    </td>
                                </tr>

                                {/* Additional Income Rows */}
                                <tr>
                                    <td
                                        className="p-3 border bg-gray-50 font-medium"
                                        rowSpan={7}
                                    >
                                        ລາຍໄດ້ອື່ນໆ
                                    </td>
                                    <td className="p-3 border">ຄ່ານ້ຳມັນ</td>
                                    <td className="p-3 border">
                                        {formatCurrency(additionalIncome.fuel)}
                                    </td>
                                    <td className="p-3 border" rowSpan={2}>
                                        ປະກັນສັງຄົມ
                                    </td>
                                    <td
                                        className="p-3 border text-red-600"
                                        rowSpan={2}
                                    >
                                        {formatCurrency(
                                            deductions.socialSecurity,
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="p-3 border">ຄ່າຄອມມິດຊັນ</td>
                                    <td className="p-3 border">
                                        {formatCurrency(
                                            additionalIncome.commission,
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="p-3 border">
                                        ຄ່າລ່ວງເວລາ (OT)
                                    </td>
                                    <td className="p-3 border">
                                        {formatCurrency(additionalIncome.ot)}
                                    </td>
                                    <td className="p-3 border" colSpan={2}></td>
                                </tr>
                                <tr>
                                    <td className="p-3 border">ເງິນໂບນັດ</td>
                                    <td className="p-3 border">
                                        {formatCurrency(additionalIncome.bonus)}
                                    </td>
                                    <td className="p-3 border" colSpan={2}></td>
                                </tr>
                                <tr>
                                    <td className="p-3 border">
                                        ຄ່າເຮັດວຽກມື້ພັກ
                                    </td>
                                    <td className="p-3 border">
                                        {formatCurrency(
                                            additionalIncome.holidayAllowance,
                                        )}
                                    </td>
                                    <td className="p-3 border" colSpan={2}></td>
                                </tr>
                                <tr>
                                    <td className="p-3 border">
                                        ຄ່າໃຊ້ຈ່າຍຫ້ອງການ
                                    </td>
                                    <td className="p-3 border">
                                        {formatCurrency(
                                            additionalIncome.officeExpenses,
                                        )}
                                    </td>
                                    <td className="p-3 border" colSpan={2}></td>
                                </tr>
                                <tr>
                                    <td className="p-3 border">ອື່ນໆ</td>
                                    <td className="p-3 border">
                                        {formatCurrency(additionalIncome.other)}
                                    </td>
                                    <td className="p-3 border" colSpan={2}></td>
                                </tr>

                                {/* Totals Row */}
                                <tr className="bg-gray-100 font-bold text-[#1F3A5F]">
                                    <td
                                        className="p-3 border text-right"
                                        colSpan={2}
                                    >
                                        ລວມລາຍຮັບທັງໝົດ:
                                    </td>
                                    <td className="p-3 border">
                                        {formatCurrency(totalIncome)}
                                    </td>
                                    <td className="p-3 border text-right">
                                        ລວມລາຍການຫັກ:
                                    </td>
                                    <td className="p-3 border text-red-600">
                                        {formatCurrency(totalDeductions)}
                                    </td>
                                    <td className="p-3 border"></td>
                                </tr>

                                {/* Net Salary Row */}
                                <tr className="bg-[#45cc67] text-white font-bold">
                                    <td
                                        className="p-4 border text-center text-lg"
                                        colSpan={4}
                                    >
                                        ເງິນເດືອນສຸດທິ (NET SALARY)
                                    </td>
                                    <td
                                        className="p-4 border text-center text-xl"
                                        colSpan={2}
                                    >
                                        {formatCurrency(netSalary)} ກີບ
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Additional Information */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="font-bold text-[#1F3A5F] mb-3">
                            ຂໍ້ມູນເພີ່ມເຕີມ
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-gray-600">
                                    ມື້ເຮັດວຽກ:
                                </span>
                                <span className="ml-2 font-medium">
                                    {formData.working_days || 0} ມື້
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">
                                    ວັນພັກທີ່ເຫຼືອ:
                                </span>
                                <span className="ml-2 font-medium">
                                    {prefillData.calculated
                                        .remaining_vacation_days || 0}{' '}
                                    ມື້
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">OT Hours:</span>
                                <span className="ml-2 font-medium">
                                    {prefillData.calculated.ot_hours || 0}{' '}
                                    ຊົ່ວໂມງ
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">ມື້ພັກ:</span>
                                <span className="ml-2 font-medium">
                                    {prefillData.calculated
                                        .day_off_days_this_month || 0}{' '}
                                    ມື້
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
