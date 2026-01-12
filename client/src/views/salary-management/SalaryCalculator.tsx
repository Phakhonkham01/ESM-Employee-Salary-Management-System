import React, { useState, useEffect } from 'react'
import {
    X,
    Calculator,
    DollarSign,
    Fuel,
    UserX,
    CalendarX,
    ChevronRight,
    ChevronLeft,
    AlertCircle,
    CheckCircle2,
    Clock,
    CalendarDays,
    Briefcase,
} from 'lucide-react'
import axios from 'axios'

// Interface สำหรับข้อมูลฟอร์ม
interface SalaryFormData {
    user_id: string
    salary: number
    month: number
    year: number
    bonus: number
    commission: number
    money_not_spent_on_holidays: number
    other_income: number
    office_expenses: number
    social_security: number
    working_days: number
    notes?: string
}

// Interface สำหรับ OT Rate
interface OTRates {
    weekday_rate: number
    weekend_rate: number
    holiday_rate: number
}

// Interface สำหรับ OT Detail
interface OTDetail {
    date: string
    title: string
    start_hour: string
    end_hour: string
    total_hours: number
    ot_type: 'weekday' | 'weekend' | 'holiday'
    hourly_rate: number
    ot_multiplier: number
    amount: number
    description?: string
    request_id?: string
}

// Interface สำหรับข้อมูลพรีฟิล
interface PrefillData {
    user: {
        _id: string
        name: string
        base_salary: number
        vacation_days: number
    }
    calculated: {
        ot_amount: number
        ot_hours: number
        ot_details: OTDetail[]
        ot_rates: OTRates
        fuel_costs: number
        day_off_days: number
        remaining_vacation_days: number
        vacation_color: 'red' | 'yellow' | 'green'
    }
    month: number
    year: number
}

// Interface สำหรับ Props
interface SalaryCalculatorProps {
    open: boolean
    onClose: () => void
    onSuccess: () => void
    user: any
    month: number
    year: number
}

const steps = [
    'ข้อมูลพื้นฐาน',
    'กำหนดอัตราค่า OT',
    'รายรับเพิ่มเติม',
    'รายจ่าย',
    'สรุป',
]

const SalaryCalculator: React.FC<SalaryCalculatorProps> = ({
    open,
    onClose,
    onSuccess,
    user,
    month,
    year,
}) => {
    const [activeStep, setActiveStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [prefillData, setPrefillData] = useState<PrefillData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    // State สำหรับฟอร์ม
    const [formData, setFormData] = useState<SalaryFormData>({
        user_id: user._id,
        month,
        year,
        bonus: 0,
        commission: 0,
        money_not_spent_on_holidays: 0,
        other_income: 0,
        office_expenses: 0,
        salary: 0,
        social_security: 0,
        working_days: 22,
        notes: '',
    })

    // State สำหรับ OT Rates
    const [otRates, setOtRates] = useState<OTRates>({
        weekday_rate: 1.5,
        weekend_rate: 2.0,
        holiday_rate: 3.0,
    })

    // ดึงข้อมูล prefill เมื่อเปิด dialog
    useEffect(() => {
        if (open) {
            fetchPrefillData()
        }
    }, [open, user._id, month, year])

    // Refetch เมื่อเปลี่ยน OT rates ใน step ที่ 2
    useEffect(() => {
        if (open && activeStep === 1) {
            const timeoutId = setTimeout(() => {
                fetchPrefillData()
            }, 500)

            return () => clearTimeout(timeoutId)
        }
    }, [otRates, open, activeStep])

    const fetchPrefillData = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await axios.get(
                `/api/salaries/prefill/${user._id}`,
                {
                    params: {
                        month,
                        year,
                        ot_rates: JSON.stringify(otRates),
                    },
                },
            )

            if (response.data && response.data.data) {
                setPrefillData(response.data.data)
                // ตั้งค่า OT rates จาก response ถ้ามี
                if (response.data.data.calculated?.ot_rates) {
                    setOtRates(response.data.data.calculated.ot_rates)
                }
            }
        } catch (err: any) {
            setError(
                err.response?.data?.message || 'Failed to load prefill data',
            )
            console.error('Error fetching prefill data:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'notes' ? value : parseFloat(value) || 0,
        }))
    }

    const handleOtRateChange = (type: keyof OTRates, value: string) => {
        const numValue = parseFloat(value) || 0
        setOtRates((prev) => ({
            ...prev,
            [type]: numValue,
        }))
    }

    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1)
    }

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1)
    }

    const handleSubmit = async () => {
        try {
            setLoading(true)
            setError(null)

            // ดึง user_id ของคนที่ login จาก localStorage หรือ context
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
            const created_by = currentUser._id || currentUser.id || user._id

            const netSalary = calculateNetSalary()

            const payload = {
                ...formData,
                net_salary: netSalary,
                base_salary: prefillData?.user.base_salary || 0,
                ot_amount: prefillData?.calculated.ot_amount || 0,
                ot_hours: prefillData?.calculated.ot_hours || 0,
                ot_rates: otRates,
                fuel_costs: prefillData?.calculated.fuel_costs || 0,
                day_off_days: prefillData?.calculated.day_off_days || 0,
                remaining_vacation_days:
                    prefillData?.calculated.remaining_vacation_days || 0,
                created_by: created_by,
            }

            console.log('Submitting payload:', payload)

            const response = await axios.post('/api/salaries', payload)

            if (response.status === 201) {
                setSuccess(true)
                onSuccess()
                setTimeout(() => {
                    handleClose()
                }, 2000)
            }
        } catch (err: any) {
            console.error('Error details:', {
                message: err.response?.data?.message,
                error: err.response?.data?.error,
                status: err.response?.status,
            })
            setError(
                err.response?.data?.message || 'Failed to calculate salary',
            )
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setActiveStep(0)
        setFormData({
            user_id: user._id,
            salary: 0,
            month,
            year,
            bonus: 0,
            commission: 0,
            money_not_spent_on_holidays: 0,
            other_income: 0,
            office_expenses: 0,
            social_security: 0,
            working_days: 22,
            notes: '',
        })
        setOtRates({
            weekday_rate: 1.5,
            weekend_rate: 2.0,
            holiday_rate: 3.0,
        })
        setError(null)
        setSuccess(false)
        setPrefillData(null)
        onClose()
    }

    // คำนวณผลรวมต่างๆ
    const calculateTotalIncome = () => {
        if (!prefillData) return 0

        const { base_salary } = prefillData.user
        const { ot_amount, fuel_costs } = prefillData.calculated
        const { bonus, commission, money_not_spent_on_holidays, other_income } =
            formData

        return (
            base_salary +
            ot_amount +
            bonus +
            commission +
            fuel_costs +
            money_not_spent_on_holidays +
            other_income
        )
    }

    const calculateTotalDeductions = () => {
        return formData.office_expenses + formData.social_security
    }

    const calculateNetSalary = () => {
        return calculateTotalIncome() - calculateTotalDeductions()
    }

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

    const getVacationColorClass = (color: string) => {
        switch (color) {
            case 'red':
                return 'text-red-600 bg-red-50 border-red-200'
            case 'yellow':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200'
            case 'green':
                return 'text-green-600 bg-green-50 border-green-200'
            default:
                return 'text-blue-600 bg-blue-50 border-blue-200'
        }
    }

    const getVacationTextColor = (color: string) => {
        switch (color) {
            case 'red':
                return 'text-red-600'
            case 'yellow':
                return 'text-yellow-600'
            case 'green':
                return 'text-green-600'
            default:
                return 'text-blue-600'
        }
    }

    const getOtTypeThai = (type: string) => {
        switch (type) {
            case 'weekday':
                return 'วันทำงานปกติ'
            case 'weekend':
                return 'วันหยุดสุดสัปดาห์'
            case 'holiday':
                return 'วันหยุดนักขัตฤกษ์'
            default:
                return type
        }
    }

    const getOtTypeColor = (type: string) => {
        switch (type) {
            case 'weekday':
                return 'bg-blue-100 text-blue-800'
            case 'weekend':
                return 'bg-yellow-100 text-yellow-800'
            case 'holiday':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0: // Step 1: ข้อมูลพื้นฐาน
                return (
                    <div>
                        <h3 className="text-lg font-semibold mb-4">
                            Employee Information
                        </h3>

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
                                        value={
                                            prefillData?.user.base_salary.toLocaleString() ||
                                            '0'
                                        }
                                        disabled
                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {prefillData && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-4">
                                    Auto-calculated Components
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                                        <div className="flex items-center mb-2">
                                            <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
                                            <span className="text-sm font-medium text-gray-700">
                                                OT Amount
                                            </span>
                                        </div>
                                        <p className="text-2xl font-bold text-blue-600">
                                            ฿
                                            {prefillData.calculated.ot_amount.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-blue-700 mt-1">
                                            {prefillData.calculated.ot_hours}{' '}
                                            ชั่วโมง
                                        </p>
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
                                            {
                                                prefillData.calculated
                                                    .day_off_days
                                            }{' '}
                                            days
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
                                            {
                                                prefillData.calculated
                                                    .remaining_vacation_days
                                            }{' '}
                                            days
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )

            case 1: // Step 2: กำหนดอัตราค่า OT
                return (
                    <div>
                        <h3 className="text-lg font-semibold mb-4">
                            กำหนดอัตราค่าล่วงเวลา (OT)
                        </h3>

                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Calculator className="w-5 h-5 text-blue-600" />
                                <h4 className="font-medium text-blue-800">
                                    อัตราค่าจ้างรายชั่วโมงพื้นฐาน
                                </h4>
                            </div>
                            {prefillData && (
                                <>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">
                                            เงินเดือนพื้นฐาน:
                                        </span>
                                        <span className="text-lg font-bold text-blue-700">
                                            ฿
                                            {prefillData.user.base_salary.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-gray-700">
                                            อัตราต่อชั่วโมง:
                                        </span>
                                        <span className="text-lg font-bold text-blue-700">
                                            ฿
                                            {(
                                                prefillData.user.base_salary /
                                                (22 * 8)
                                            ).toFixed(2)}
                                            /ชั่วโมง
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Weekday OT Rate */}
                            <div className="border border-gray-300 rounded-lg p-5 hover:border-blue-400 transition-colors">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                                        <Briefcase className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h4 className="font-bold text-gray-800 mb-2">
                                        วันทำงานปกติ
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-4">
                                        จันทร์ - ศุกร์
                                        <br />
                                        (ไม่ใช่วันหยุด)
                                    </p>
                                    <div className="relative w-full">
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="1.0"
                                            value={otRates.weekday_rate}
                                            onChange={(e) =>
                                                handleOtRateChange(
                                                    'weekday_rate',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                            เท่า
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        เช่น: {otRates.weekday_rate} เท่า =
                                        ชั่วโมงละ{' '}
                                        {prefillData
                                            ? `฿${((prefillData.user.base_salary / (22 * 8)) * otRates.weekday_rate).toFixed(2)}`
                                            : '...'}
                                    </p>
                                </div>
                            </div>

                            {/* Weekend OT Rate */}
                            <div className="border border-gray-300 rounded-lg p-5 hover:border-yellow-400 transition-colors">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                                        <CalendarDays className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <h4 className="font-bold text-gray-800 mb-2">
                                        วันหยุดสุดสัปดาห์
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-4">
                                        เสาร์ - อาทิตย์
                                        <br />
                                        (ไม่ใช่วันหยุดนักขัตฤกษ์)
                                    </p>
                                    <div className="relative w-full">
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="1.0"
                                            value={otRates.weekend_rate}
                                            onChange={(e) =>
                                                handleOtRateChange(
                                                    'weekend_rate',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        />
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                            เท่า
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        เช่น: {otRates.weekend_rate} เท่า =
                                        ชั่วโมงละ{' '}
                                        {prefillData
                                            ? `฿${((prefillData.user.base_salary / (22 * 8)) * otRates.weekend_rate).toFixed(2)}`
                                            : '...'}
                                    </p>
                                </div>
                            </div>

                            {/* Holiday OT Rate */}
                            <div className="border border-gray-300 rounded-lg p-5 hover:border-red-400 transition-colors">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                                        <CalendarX className="w-6 h-6 text-red-600" />
                                    </div>
                                    <h4 className="font-bold text-gray-800 mb-2">
                                        วันหยุดนักขัตฤกษ์
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-4">
                                        วันหยุดราชการ
                                        <br />
                                        (วันหยุดตามกฎหมาย)
                                    </p>
                                    <div className="relative w-full">
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="1.0"
                                            value={otRates.holiday_rate}
                                            onChange={(e) =>
                                                handleOtRateChange(
                                                    'holiday_rate',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                            เท่า
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        เช่น: {otRates.holiday_rate} เท่า =
                                        ชั่วโมงละ{' '}
                                        {prefillData
                                            ? `฿${((prefillData.user.base_salary / (22 * 8)) * otRates.holiday_rate).toFixed(2)}`
                                            : '...'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* แสดงรายละเอียด OT */}
                        {prefillData?.calculated.ot_details &&
                            prefillData.calculated.ot_details.length > 0 && (
                                <div className="mt-8">
                                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        รายละเอียดการทำงานล่วงเวลา (OT)
                                    </h4>
                                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        วันที่
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        ประเภท
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        เวลา
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        ชั่วโมง
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        อัตราคูณ
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        จำนวนเงิน
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {prefillData.calculated.ot_details.map(
                                                    (detail, index) => (
                                                        <tr
                                                            key={index}
                                                            className="hover:bg-gray-50"
                                                        >
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                                {new Date(
                                                                    detail.date,
                                                                ).toLocaleDateString(
                                                                    'th-TH',
                                                                    {
                                                                        day: 'numeric',
                                                                        month: 'short',
                                                                        year: 'numeric',
                                                                    },
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <span
                                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOtTypeColor(detail.ot_type)}`}
                                                                >
                                                                    {getOtTypeThai(
                                                                        detail.ot_type,
                                                                    )}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                                {
                                                                    detail.start_hour
                                                                }{' '}
                                                                -{' '}
                                                                {
                                                                    detail.end_hour
                                                                }
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                                                                {
                                                                    detail.total_hours
                                                                }{' '}
                                                                ชม.
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                                                                {
                                                                    detail.ot_multiplier
                                                                }{' '}
                                                                เท่า
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                ฿
                                                                {detail.amount.toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                                <tr className="bg-gray-50 font-semibold">
                                                    <td
                                                        colSpan={3}
                                                        className="px-4 py-3 text-right text-gray-700"
                                                    >
                                                        รวมทั้งสิ้น:
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-gray-700">
                                                        {
                                                            prefillData
                                                                .calculated
                                                                .ot_hours
                                                        }{' '}
                                                        ชม.
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-gray-700">
                                                        -
                                                    </td>
                                                    <td className="px-4 py-3 font-bold text-blue-700">
                                                        ฿
                                                        {prefillData.calculated.ot_amount.toLocaleString()}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                    </div>
                )

            case 2: // Step 3: รายรับเพิ่มเติม
                return (
                    <div>
                        <h3 className="text-lg font-semibold mb-4">
                            Additional Income
                        </h3>

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
                                        onChange={handleInputChange}
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
                                        onChange={handleInputChange}
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
                                        value={
                                            formData.money_not_spent_on_holidays
                                        }
                                        onChange={handleInputChange}
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
                                        onChange={handleInputChange}
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

            case 3: // Step 4: รายจ่าย
                return (
                    <div>
                        <h3 className="text-lg font-semibold mb-4">
                            Deductions
                        </h3>

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
                                        onChange={handleInputChange}
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
                                        onChange={handleInputChange}
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
                                    onChange={handleInputChange}
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
                                    onChange={handleInputChange}
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

            case 4: // Step 5: สรุป
                return (
                    <div>
                        <h3 className="text-lg font-semibold mb-4">
                            Salary Summary
                        </h3>

                        {prefillData && (
                            <div className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50">
                                <div className="space-y-6">
                                    {/* รายละเอียด OT */}
                                    {prefillData.calculated.ot_details &&
                                        prefillData.calculated.ot_details
                                            .length > 0 && (
                                            <div className="bg-white rounded-lg p-4 border border-blue-200">
                                                <h4 className="text-base font-bold text-blue-700 mb-3 uppercase">
                                                    รายละเอียดการทำงานล่วงเวลา
                                                    (OT)
                                                </h4>
                                                <div className="space-y-2 mb-3">
                                                    {prefillData.calculated.ot_details.map(
                                                        (detail, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex justify-between py-1 px-2 hover:bg-blue-50 rounded"
                                                            >
                                                                <div>
                                                                    <span className="text-gray-700">
                                                                        {new Date(
                                                                            detail.date,
                                                                        ).toLocaleDateString(
                                                                            'th-TH',
                                                                        )}
                                                                        <span
                                                                            className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getOtTypeColor(detail.ot_type)}`}
                                                                        >
                                                                            {getOtTypeThai(
                                                                                detail.ot_type,
                                                                            )}
                                                                        </span>
                                                                    </span>
                                                                    <div className="text-sm text-gray-500">
                                                                        {
                                                                            detail.start_hour
                                                                        }{' '}
                                                                        -{' '}
                                                                        {
                                                                            detail.end_hour
                                                                        }{' '}
                                                                        (
                                                                        {
                                                                            detail.total_hours
                                                                        }{' '}
                                                                        ชม.)
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="font-medium text-gray-900">
                                                                        ฿
                                                                        {detail.amount.toLocaleString()}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {
                                                                            detail.ot_multiplier
                                                                        }{' '}
                                                                        เท่า × ฿
                                                                        {detail.hourly_rate.toFixed(
                                                                            2,
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                                <div className="flex justify-between pt-2 border-t border-blue-200">
                                                    <span className="font-bold text-blue-900">
                                                        รวม OT:
                                                    </span>
                                                    <span className="font-bold text-blue-900">
                                                        {
                                                            prefillData
                                                                .calculated
                                                                .ot_hours
                                                        }{' '}
                                                        ชม. = ฿
                                                        {prefillData.calculated.ot_amount.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                    {/* รายรับ */}
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
                                                    OT Amount:
                                                </span>
                                                <span className="font-semibold text-gray-900">
                                                    ฿
                                                    {prefillData.calculated.ot_amount.toLocaleString()}
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
                                                <span className="text-gray-700">
                                                    Bonus:
                                                </span>
                                                <span className="font-semibold text-gray-900">
                                                    ฿
                                                    {formData.bonus.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-1">
                                                <span className="text-gray-700">
                                                    Commission:
                                                </span>
                                                <span className="font-semibold text-gray-900">
                                                    ฿
                                                    {formData.commission.toLocaleString()}
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
                                                    ฿
                                                    {formData.other_income.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="border-t-2 border-blue-300 my-3"></div>

                                        <div className="flex justify-between py-2 bg-blue-50 px-3 rounded">
                                            <span className="font-bold text-blue-900">
                                                Total Income:
                                            </span>
                                            <span className="font-bold text-blue-900 text-lg">
                                                ฿
                                                {calculateTotalIncome().toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* รายจ่าย */}
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
                                                    ฿
                                                    {formData.office_expenses.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-1">
                                                <span className="text-gray-700">
                                                    Social Security:
                                                </span>
                                                <span className="font-semibold text-gray-900">
                                                    ฿
                                                    {formData.social_security.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="border-t-2 border-red-300 my-3"></div>

                                        <div className="flex justify-between py-2 bg-red-50 px-3 rounded">
                                            <span className="font-bold text-red-900">
                                                Total Deductions:
                                            </span>
                                            <span className="font-bold text-red-900 text-lg">
                                                ฿
                                                {calculateTotalDeductions().toLocaleString()}
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
                                                ฿
                                                {calculateNetSalary().toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* ข้อมูลเพิ่มเติม */}
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <p className="text-sm font-bold text-gray-800 mb-3 uppercase">
                                            Additional Information
                                        </p>
                                        <div className="space-y-2 text-sm text-gray-700">
                                            <div className="flex items-start">
                                                <span className="font-medium mr-2">
                                                    •
                                                </span>
                                                <span>
                                                    Working Days:{' '}
                                                    <span className="font-semibold">
                                                        {formData.working_days}{' '}
                                                        days
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="flex items-start">
                                                <span className="font-medium mr-2">
                                                    •
                                                </span>
                                                <span>
                                                    Day Off Days:{' '}
                                                    <span className="font-semibold">
                                                        {
                                                            prefillData
                                                                .calculated
                                                                .day_off_days
                                                        }{' '}
                                                        days
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="flex items-start">
                                                <span className="font-medium mr-2">
                                                    •
                                                </span>
                                                <span
                                                    className={getVacationTextColor(
                                                        prefillData.calculated
                                                            .vacation_color,
                                                    )}
                                                >
                                                    Vacation Days Left:{' '}
                                                    <span className="font-semibold">
                                                        {
                                                            prefillData
                                                                .calculated
                                                                .remaining_vacation_days
                                                        }{' '}
                                                        days
                                                    </span>
                                                </span>
                                            </div>
                                            {formData.notes && (
                                                <div className="flex items-start">
                                                    <span className="font-medium mr-2">
                                                        •
                                                    </span>
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
                        )}
                    </div>
                )

            default:
                return null
        }
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2">
                                <Calculator className="w-6 h-6 text-white" />
                                <h2 className="text-xl font-bold text-white">
                                    Salary Calculator
                                </h2>
                            </div>
                            <p className="text-sm text-blue-100 mt-1">
                                {user.first_name_en} {user.last_name_en} •{' '}
                                {getMonthName(month)} {year}
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-white hover:text-blue-100 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                    {loading && activeStep === 0 ? (
                        <div className="flex justify-center items-center min-h-[300px]">
                            <div className="flex flex-col items-center gap-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                                <span className="text-gray-600 font-medium">
                                    Loading prefill data...
                                </span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-r-lg flex items-start gap-3 mb-4 shadow-sm">
                                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="font-medium">Error</p>
                                        <p className="text-sm">{error}</p>
                                    </div>
                                    <button
                                        onClick={() => setError(null)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            )}

                            {success && (
                                <div className="bg-green-50 border-l-4 border-green-500 text-green-800 px-4 py-3 rounded-r-lg flex items-center gap-3 mb-4 shadow-sm">
                                    <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="font-semibold">
                                            Success!
                                        </p>
                                        <p className="text-sm">
                                            Salary calculated successfully!
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Stepper */}
                            <div className="mb-8">
                                <div className="flex items-center">
                                    {steps.map((label, index) => (
                                        <React.Fragment key={label}>
                                            <div className="flex flex-col items-center flex-1">
                                                <div
                                                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                                                        index <= activeStep
                                                            ? 'bg-blue-600 text-white shadow-lg'
                                                            : 'bg-gray-200 text-gray-500'
                                                    }`}
                                                >
                                                    {index < activeStep ? (
                                                        <CheckCircle2 className="w-6 h-6" />
                                                    ) : (
                                                        index + 1
                                                    )}
                                                </div>
                                                <span
                                                    className={`text-xs mt-2 text-center font-medium ${
                                                        index <= activeStep
                                                            ? 'text-blue-600'
                                                            : 'text-gray-500'
                                                    }`}
                                                >
                                                    {label}
                                                </span>
                                            </div>
                                            {index < steps.length - 1 && (
                                                <div
                                                    className="flex-1 flex items-center"
                                                    style={{
                                                        marginBottom: '28px',
                                                    }}
                                                >
                                                    <div
                                                        className={`h-2 w-full rounded transition-all ${
                                                            index < activeStep
                                                                ? 'bg-blue-600'
                                                                : 'bg-gray-200'
                                                        }`}
                                                    ></div>
                                                </div>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>

                            {renderStepContent(activeStep)}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        disabled={activeStep === 0 || loading || success}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed shadow-sm"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                    </button>

                    {activeStep === steps.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={loading || success || !prefillData}
                            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed shadow-md"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Calculating...
                                </>
                            ) : (
                                <>
                                    <Calculator className="w-4 h-4" />
                                    Confirm and Save
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            disabled={!prefillData && activeStep === 0}
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed shadow-md"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SalaryCalculator
