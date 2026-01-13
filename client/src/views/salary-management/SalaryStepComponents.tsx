// SalaryStepComponents.tsx
import React from 'react'
import {
    DollarSign,
    Fuel,
    UserX,
    CalendarX,
    Calculator,
    Briefcase,
    CalendarDays,
    Clock,
    Plus,
    Trash2,
} from 'lucide-react'
import { PrefillData, SalaryFormData, ManualOTState } from './interfaces'
import {
    getMonthName,
    getVacationColorClass,
    getVacationTextColor,
    getOtTypeThai,
    getOtTypeColor,
} from './constants'

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
        type: keyof ManualOTState,
        field: string,
        value: string,
    ) => void
    manualOTDetails: any[]
    addManualOTDetail: () => void
    clearManualOT: () => void
    calculateManualOTSummary: () => {
        totalHours: number
        totalDays: number
        totalAmount: number
    }
}

// Helper components
const OtDetailsTable: React.FC<{
    otDetails: any[]
    title?: string
    showDate?: boolean
}> = ({
    otDetails,
    title = 'รายละเอียดการทำงานล่วงเวลา (OT)',
    showDate = true,
}) => (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h4 className="font-semibold text-gray-800">{title}</h4>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    {showDate && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            วันที่
                        </th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        ประเภท
                    </th>
                    {showDate && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            เวลา/จำนวน
                        </th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        จำนวน
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        ค่าจ้าง
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        จำนวนเงิน
                    </th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {otDetails.map((detail, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                        {showDate && (
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {detail.date
                                    ? new Date(detail.date).toLocaleDateString(
                                          'th-TH',
                                          {
                                              day: 'numeric',
                                              month: 'short',
                                              year: 'numeric',
                                          },
                                      )
                                    : '-'}
                            </td>
                        )}
                        <td className="px-4 py-3 whitespace-nowrap">
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOtTypeColor(detail.ot_type)}`}
                            >
                                {getOtTypeThai(detail.ot_type)}
                            </span>
                        </td>
                        {showDate && (
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {detail.start_hour || '09:00'} -{' '}
                                {detail.end_hour || '17:00'}
                            </td>
                        )}
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                            {detail.ot_type === 'weekday'
                                ? `${detail.total_hours} ชม.`
                                : `${detail.days} วัน`}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                            {detail.ot_type === 'weekday'
                                ? `฿${detail.hourly_rate?.toFixed(2) || '0.00'}/ชม.`
                                : `฿${detail.rate_per_day?.toFixed(2) || '0.00'}/วัน`}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            ฿{detail.amount.toLocaleString()}
                        </td>
                    </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                    <td
                        colSpan={showDate ? 3 : 2}
                        className="px-4 py-3 text-right text-gray-700"
                    >
                        รวมทั้งสิ้น:
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">
                        {otDetails.reduce(
                            (sum, detail) =>
                                sum +
                                (detail.ot_type === 'weekday'
                                    ? detail.total_hours
                                    : detail.days),
                            0,
                        )}{' '}
                        {otDetails.some((d) => d.ot_type === 'weekday')
                            ? 'ชม.'
                            : 'วัน'}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">-</td>
                    <td className="px-4 py-3 font-bold text-blue-700">
                        ฿
                        {otDetails
                            .reduce((sum, detail) => sum + detail.amount, 0)
                            .toLocaleString()}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
)

// Manual OT Input Card
const ManualOTCard: React.FC<{
    type: 'weekday' | 'weekend'
    label: string
    description: string
    color: string
    hours: number
    days: number
    rate_per_hour: number
    rate_per_day: number
    onHoursChange: (value: string) => void
    onDaysChange: (value: string) => void
    onRatePerHourChange: (value: string) => void
    onRatePerDayChange: (value: string) => void
    bgColor: string
    textColor: string
    borderColor: string
}> = ({
    type,
    label,
    description,
    color,
    hours,
    days,
    rate_per_hour,
    rate_per_day,
    onHoursChange,
    onDaysChange,
    onRatePerHourChange,
    onRatePerDayChange,
    bgColor,
    textColor,
    borderColor,
}) => {
    const amount =
        type === 'weekday' ? hours * rate_per_hour : days * rate_per_day

    return (
        <div className={`border ${borderColor} rounded-lg p-4 ${bgColor}`}>
            <h5 className={`font-bold ${textColor} mb-2`}>{label}</h5>
            <p className="text-sm text-gray-600 mb-3">{description}</p>

            {type === 'weekday' ? (
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            จำนวนชั่วโมง OT
                        </label>
                        <input
                            type="number"
                            step="0.5"
                            min="0"
                            value={hours}
                            onChange={(e) => onHoursChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ค่าจ้างต่อชั่วโมง
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                ฿
                            </span>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={rate_per_hour}
                                onChange={(e) =>
                                    onRatePerHourChange(e.target.value)
                                }
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            จำนวนวัน OT (0.5 = ครึ่งวัน, 1 = 1 วัน)
                        </label>
                        <input
                            type="number"
                            step="0.5"
                            min="0"
                            value={days}
                            onChange={(e) => onDaysChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ค่าจ้างต่อวัน
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                ฿
                            </span>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={rate_per_day}
                                onChange={(e) =>
                                    onRatePerDayChange(e.target.value)
                                }
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div
                className={`mt-3 p-3 rounded ${color === 'blue' ? 'bg-blue-100' : 'bg-yellow-100'}`}
            >
                <div
                    className={`text-sm ${color === 'blue' ? 'text-blue-800' : 'text-yellow-800'}`}
                >
                    <div className="font-bold mb-1">
                        รวมเงิน: ฿{amount.toFixed(2)}
                    </div>
                    <div className="text-xs">
                        {type === 'weekday'
                            ? `${hours} ชม. × ฿${rate_per_hour.toFixed(2)}`
                            : `${days} วัน × ฿${rate_per_day.toFixed(2)}`}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Main Step Components
export const Step1BasicInfo: React.FC<StepComponentsProps> = ({
    user,
    month,
    year,
    prefillData,
}) => {
    if (!prefillData) return null

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">Employee Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee Name
                    </label>
                    <input
                        type="text"
                        value={`${user.first_name_en} ${user.last_name_en}`}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Base Salary
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            ฿
                        </span>
                        <input
                            type="text"
                            value={prefillData.user.base_salary.toLocaleString()}
                            disabled
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">
                    Auto-calculated Components
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                            <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">
                                OT Amount (ระบบ)
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">
                            ฿{prefillData.calculated.ot_amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                            {prefillData.calculated.ot_hours} ชั่วโมง
                        </p>
                        <div className="mt-2 text-xs text-blue-600">
                            <div>
                                วันทำงานปกติ:{' '}
                                {prefillData.calculated.weekday_ot_hours || 0}{' '}
                                ชม.
                            </div>
                            <div>
                                เสาร์-อาทิตย์:{' '}
                                {prefillData.calculated.weekend_ot_hours || 0}{' '}
                                ชม.
                            </div>
                        </div>
                    </div>
                    <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                            <Fuel className="w-5 h-5 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">
                                Fuel Costs
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                            ฿
                            {prefillData.calculated.fuel_costs.toLocaleString()}
                        </p>
                    </div>
                    <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                            <CalendarX className="w-5 h-5 text-yellow-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">
                                Day Off Days
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-yellow-600">
                            {prefillData.calculated.day_off_days} days
                        </p>
                    </div>
                    <div
                        className={`border rounded-lg p-4 ${getVacationColorClass(prefillData.calculated.vacation_color)}`}
                    >
                        <div className="flex items-center mb-2">
                            <UserX
                                className={`w-5 h-5 mr-2 ${getVacationTextColor(prefillData.calculated.vacation_color)}`}
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Vacation Days Left
                            </span>
                        </div>
                        <p
                            className={`text-2xl font-bold ${getVacationTextColor(prefillData.calculated.vacation_color)}`}
                        >
                            {prefillData.calculated.remaining_vacation_days}{' '}
                            days
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

    const { totalHours, totalDays, totalAmount } = calculateManualOTSummary()

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">
                การทำงานล่วงเวลา (OT)
            </h3>

            {/* Show System OT Summary */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                    <Calculator className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium text-blue-800">
                        OT ที่อนุมัติแล้วจากระบบ
                    </h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-gray-700">วันทำงานปกติ:</span>
                        <span className="ml-2 font-bold text-blue-700">
                            {prefillData.calculated.weekday_ot_hours || 0}{' '}
                            ชั่วโมง
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-700">เสาร์-อาทิตย์:</span>
                        <span className="ml-2 font-bold text-yellow-700">
                            {prefillData.calculated.weekend_ot_hours || 0}{' '}
                            ชั่วโมง
                        </span>
                    </div>
                </div>
                <div className="mt-2 text-sm text-blue-600">
                    * ชั่วโมง OT จากคำขอที่อนุมัติแล้ว
                </div>
            </div>

            {/* Manual OT Entry Section */}
            <div className="mb-8">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    เพิ่มชั่วโมง OT ด้วยตนเอง
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Weekday OT Input */}
                    <ManualOTCard
                        type="weekday"
                        label="วันทำงานปกติ"
                        description="จันทร์ - ศุกร์"
                        color="blue"
                        hours={manualOT.weekday.hours}
                        days={0}
                        rate_per_hour={manualOT.weekday.rate_per_hour}
                        rate_per_day={0}
                        onHoursChange={(value) =>
                            onManualOTChange('weekday', 'hours', value)
                        }
                        onDaysChange={() => {}}
                        onRatePerHourChange={(value) =>
                            onManualOTChange('weekday', 'rate_per_hour', value)
                        }
                        onRatePerDayChange={() => {}}
                        bgColor="bg-blue-50"
                        textColor="text-blue-700"
                        borderColor="border-blue-300"
                    />

                    {/* Weekend OT Input */}
                    <ManualOTCard
                        type="weekend"
                        label="วันหยุดเสาร์-อาทิตย์"
                        description="เสาร์ - อาทิตย์ (0.5 = ครึ่งวัน, 1 = 1 วัน)"
                        color="yellow"
                        hours={0}
                        days={manualOT.weekend.days}
                        rate_per_hour={0}
                        rate_per_day={manualOT.weekend.rate_per_day}
                        onHoursChange={() => {}}
                        onDaysChange={(value) =>
                            onManualOTChange('weekend', 'days', value)
                        }
                        onRatePerHourChange={() => {}}
                        onRatePerDayChange={(value) =>
                            onManualOTChange('weekend', 'rate_per_day', value)
                        }
                        bgColor="bg-yellow-50"
                        textColor="text-yellow-700"
                        borderColor="border-yellow-300"
                    />
                </div>

                {/* Summary and Action Buttons */}
                <div className="flex justify-between items-center mb-6 p-4 bg-gray-100 rounded-lg">
                    <div>
                        <h5 className="font-bold text-gray-700">
                            สรุป Manual OT
                        </h5>
                        <div className="text-sm text-gray-600">
                            <div>วันทำงาน: {manualOT.weekday.hours} ชม.</div>
                            <div>
                                เสาร์-อาทิตย์: {manualOT.weekend.days} วัน
                            </div>
                            <div className="font-bold mt-1">
                                รวม: ฿{totalAmount.toFixed(2)}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={clearManualOT}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            ล้างข้อมูล
                        </button>
                        <button
                            onClick={addManualOTDetail}
                            disabled={
                                (manualOT.weekday.hours === 0 ||
                                    manualOT.weekday.rate_per_hour === 0) &&
                                (manualOT.weekend.days === 0 ||
                                    manualOT.weekend.rate_per_day === 0)
                            }
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-4 h-4" />
                            เพิ่ม OT
                        </button>
                    </div>
                </div>
            </div>

            {/* Display Manual OT Details */}
            {manualOTDetails.length > 0 && (
                <div className="mt-8">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        รายการ OT ที่เพิ่มด้วยตนเอง
                    </h4>
                    <OtDetailsTable
                        otDetails={manualOTDetails}
                        title="รายการ OT ด้วยตนเอง"
                        showDate={false}
                    />
                </div>
            )}

            {/* Display Auto-calculated OT Details */}
            {prefillData?.calculated.ot_details &&
                prefillData.calculated.ot_details.length > 0 && (
                    <div className="mt-8">
                        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            รายการ OT จากระบบ
                        </h4>
                        <OtDetailsTable
                            otDetails={prefillData.calculated.ot_details}
                            title="รายการ OT จากระบบ"
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
            <h3 className="text-lg font-semibold mb-4">Additional Income</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bonus
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            ฿
                        </span>
                        <input
                            type="number"
                            name="bonus"
                            value={formData.bonus}
                            onChange={onInputChange}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Commission
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            ฿
                        </span>
                        <input
                            type="number"
                            name="commission"
                            value={formData.commission}
                            onChange={onInputChange}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Money not spent on holidays
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            ฿
                        </span>
                        <input
                            type="number"
                            name="money_not_spent_on_holidays"
                            value={formData.money_not_spent_on_holidays}
                            onChange={onInputChange}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Other Income
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            ฿
                        </span>
                        <input
                            type="number"
                            name="other_income"
                            value={formData.other_income}
                            onChange={onInputChange}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800 font-medium">
                    Total Additional Income: ฿
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
            <h3 className="text-lg font-semibold mb-4">Deductions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Office Expenses
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            ฿
                        </span>
                        <input
                            type="number"
                            name="office_expenses"
                            value={formData.office_expenses}
                            onChange={onInputChange}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Social Security
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            ฿
                        </span>
                        <input
                            type="number"
                            name="social_security"
                            value={formData.social_security}
                            onChange={onInputChange}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                </div>
            </div>
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800 font-medium">
                    Total Deductions: ฿
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

    // รวม OT ทั้งหมด
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

    // แยก Manual และ Auto OT
    const manualOT = allOTDetails.filter((detail) => detail.is_manual === true)
    const autoOT = allOTDetails.filter((detail) => !detail.is_manual)

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">Salary Summary</h3>
            <div className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50">
                <div className="space-y-6">
                    {/* OT Details - Manual */}
                    {manualOT.length > 0 && (
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <h4 className="text-base font-bold text-blue-700 mb-3 uppercase">
                                รายละเอียด OT ด้วยตนเอง
                            </h4>
                            <div className="space-y-2 mb-3">
                                {manualOT.map((detail, index) => (
                                    <div
                                        key={`manual-${index}`}
                                        className="flex justify-between py-1 px-2 hover:bg-blue-50 rounded"
                                    >
                                        <div>
                                            <span className="text-gray-700">
                                                {getOtTypeThai(detail.ot_type)}
                                            </span>
                                            <div className="text-sm text-gray-500">
                                                {detail.ot_type === 'weekday'
                                                    ? `${detail.total_hours} ชั่วโมง`
                                                    : `${detail.days} วัน`}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium text-gray-900">
                                                ฿
                                                {detail.amount.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {detail.ot_type === 'weekday'
                                                    ? `฿${detail.hourly_rate?.toFixed(2) || '0.00'}/ชม.`
                                                    : `฿${detail.rate_per_day?.toFixed(2) || '0.00'}/วัน`}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between pt-2 border-t border-blue-200">
                                <span className="font-bold text-blue-900">
                                    รวม OT ด้วยตนเอง:
                                </span>
                                <span className="font-bold text-blue-900">
                                    ฿
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

                    {/* OT Details - Auto */}
                    {autoOT.length > 0 && (
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                            <h4 className="text-base font-bold text-green-700 mb-3 uppercase">
                                รายละเอียด OT จากระบบ
                            </h4>
                            <div className="space-y-2 mb-3">
                                {autoOT.map((detail, index) => (
                                    <div
                                        key={`auto-${index}`}
                                        className="flex justify-between py-1 px-2 hover:bg-green-50 rounded"
                                    >
                                        <div>
                                            <span className="text-gray-700">
                                                {detail.date
                                                    ? new Date(
                                                          detail.date,
                                                      ).toLocaleDateString(
                                                          'th-TH',
                                                      )
                                                    : '-'}
                                                <span
                                                    className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getOtTypeColor(detail.ot_type)}`}
                                                >
                                                    {getOtTypeThai(
                                                        detail.ot_type,
                                                    )}
                                                </span>
                                            </span>
                                            <div className="text-sm text-gray-500">
                                                {detail.start_hour} -{' '}
                                                {detail.end_hour} (
                                                {detail.total_hours} ชม.)
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium text-gray-900">
                                                ฿
                                                {detail.amount.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                ระบบคำนวณอัตโนมัติ
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between pt-2 border-t border-green-200">
                                <span className="font-bold text-green-900">
                                    รวม OT จากระบบ:
                                </span>
                                <span className="font-bold text-green-900">
                                    {autoOT.reduce(
                                        (sum, detail) =>
                                            sum + detail.total_hours,
                                        0,
                                    )}{' '}
                                    ชม. = ฿
                                    {autoOT
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
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <h4 className="text-base font-bold text-blue-700 mb-3 uppercase">
                            Income
                        </h4>
                        <div className="space-y-2">
                            <div className="flex justify-between py-1">
                                <span className="text-gray-700">
                                    Base Salary:
                                </span>
                                <span className="font-semibold text-gray-900">
                                    ฿
                                    {prefillData.user.base_salary.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-gray-700">
                                    OT Amount (รวม):
                                </span>
                                <span className="font-semibold text-gray-900">
                                    ฿{totalOTAmount.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-gray-700">
                                    Fuel Costs:
                                </span>
                                <span className="font-semibold text-gray-900">
                                    ฿
                                    {prefillData.calculated.fuel_costs.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-gray-700">Bonus:</span>
                                <span className="font-semibold text-gray-900">
                                    ฿{formData.bonus.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-gray-700">
                                    Commission:
                                </span>
                                <span className="font-semibold text-gray-900">
                                    ฿{formData.commission.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-gray-700">
                                    Holiday Money:
                                </span>
                                <span className="font-semibold text-gray-900">
                                    ฿
                                    {formData.money_not_spent_on_holidays.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-gray-700">
                                    Other Income:
                                </span>
                                <span className="font-semibold text-gray-900">
                                    ฿{formData.other_income.toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <div className="border-t-2 border-blue-300 my-3"></div>
                        <div className="flex justify-between py-2 bg-blue-50 px-3 rounded">
                            <span className="font-bold text-blue-900">
                                Total Income:
                            </span>
                            <span className="font-bold text-blue-900 text-lg">
                                ฿{calculateTotalIncome().toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Deductions */}
                    <div className="bg-white rounded-lg p-4 border border-red-200">
                        <h4 className="text-base font-bold text-red-700 mb-3 uppercase">
                            Deductions
                        </h4>
                        <div className="space-y-2">
                            <div className="flex justify-between py-1">
                                <span className="text-gray-700">
                                    Office Expenses:
                                </span>
                                <span className="font-semibold text-gray-900">
                                    ฿{formData.office_expenses.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-gray-700">
                                    Social Security:
                                </span>
                                <span className="font-semibold text-gray-900">
                                    ฿{formData.social_security.toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <div className="border-t-2 border-red-300 my-3"></div>
                        <div className="flex justify-between py-2 bg-red-50 px-3 rounded">
                            <span className="font-bold text-red-900">
                                Total Deductions:
                            </span>
                            <span className="font-bold text-red-900 text-lg">
                                ฿{calculateTotalDeductions().toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Net Salary */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-5 shadow-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-xl font-bold text-white">
                                NET SALARY:
                            </span>
                            <span className="text-3xl font-bold text-white">
                                ฿{calculateNetSalary().toLocaleString()}
                            </span>
                        </div>
                        <div className="mt-2 text-sm text-blue-200">
                            รวม OT: {totalOTHours} ชม. + {totalOTDays} วัน
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
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
                                        {totalOTHours} ชั่วโมง
                                    </span>
                                </span>
                            </div>
                            <div className="flex items-start">
                                <span className="font-medium mr-2">•</span>
                                <span>
                                    OT Days (เสาร์-อาทิตย์):{' '}
                                    <span className="font-semibold">
                                        {totalOTDays} วัน
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
