// SalaryCalculator.tsx
import React, { useState, useEffect } from 'react'
import {
    X,
    Calculator,
    ChevronRight,
    ChevronLeft,
    AlertCircle,
    CheckCircle2,
    Plus,
    Trash2,
} from 'lucide-react'
import axios from 'axios'
import {
    SalaryCalculatorProps,
    SalaryFormData,
    PrefillData,
    ManualOTState,
    SystemOTDetail,
} from './interfaces'
import { steps, getMonthName } from './constants'
import {
    Step1BasicInfo,
    Step2OtRates,
    Step3AdditionalIncome,
    Step4Deductions,
    Step5Summary,
} from './SalaryStepComponents'

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

    // State สำหรับ Manual OT (แบบใหม่)
    const [manualOT, setManualOT] = useState<ManualOTState>({
        weekday: {
            hours: 0,
            rate_per_hour: 0,
        },
        weekend: {
            hours: 0, // Add this
            days: 0,
            rate_per_hour: 0, // Add this
            rate_per_day: 0,
        },
    })
    // State สำหรับ Manual OT Details
    const [manualOTDetails, setManualOTDetails] = useState<any[]>([])

    // ดึงข้อมูล prefill เมื่อเปิด dialog
    useEffect(() => {
        if (open) {
            fetchPrefillData()
        }
    }, [open, user._id, month, year])

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
                    },
                },
            )

            if (response.data && response.data.data) {
                setPrefillData(response.data.data)
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

    const handleManualOTChange = (
        type: keyof ManualOTState,
        field: string,
        value: string,
    ) => {
        const numValue = parseFloat(value) || 0

        setManualOT((prev) => {
            if (type === 'weekday') {
                return {
                    ...prev,
                    weekday: {
                        ...prev.weekday,
                        [field]:
                            field === 'hours'
                                ? Math.max(0, numValue)
                                : numValue,
                    },
                }
            } else {
                // สำหรับ weekend
                return {
                    ...prev,
                    weekend: {
                        ...prev.weekend,
                        [field]:
                            field === 'days' || field === 'hours'
                                ? Math.max(0, numValue)
                                : numValue,
                    },
                }
            }
        })
    }
    const addManualOTDetail = () => {
        const details = []

        // เพิ่ม Weekday OT ถ้ามี
        if (manualOT.weekday.hours > 0 && manualOT.weekday.rate_per_hour > 0) {
            const amount =
                manualOT.weekday.hours * manualOT.weekday.rate_per_hour
            details.push({
                date: new Date(year, month - 1, 1).toISOString(),
                title: 'Manual OT - วันทำงานปกติ',
                start_hour: '09:00',
                end_hour: `${17 + manualOT.weekday.hours}:00`,
                total_hours: manualOT.weekday.hours,
                ot_type: 'weekday',
                hourly_rate: manualOT.weekday.rate_per_hour,
                days: 0,
                rate_per_day: 0,
                amount: amount,
                description: `OT วันทำงานปกติ ${manualOT.weekday.hours} ชม. @ ฿${manualOT.weekday.rate_per_hour}/ชม.`,
                is_manual: true,
            })
        }

        // เพิ่ม Weekend OT Hours ถ้ามี
        if (manualOT.weekend.hours > 0 && manualOT.weekend.rate_per_hour > 0) {
            const amount =
                manualOT.weekend.hours * manualOT.weekend.rate_per_hour
            details.push({
                date: new Date(year, month - 1, 1).toISOString(),
                title: 'Manual OT - เสาร์-อาทิตย์ (ชั่วโมง)',
                start_hour: '09:00',
                end_hour: `${17 + manualOT.weekend.hours}:00`,
                total_hours: manualOT.weekend.hours,
                ot_type: 'weekend',
                hourly_rate: manualOT.weekend.rate_per_hour,
                days: 0,
                rate_per_day: 0,
                amount: amount,
                description: `OT เสาร์-อาทิตย์ ${manualOT.weekend.hours} ชม. @ ฿${manualOT.weekend.rate_per_hour}/ชม.`,
                is_manual: true,
            })
        }

        // เพิ่ม Weekend OT Days ถ้ามี
        if (manualOT.weekend.days > 0 && manualOT.weekend.rate_per_day > 0) {
            const amount = manualOT.weekend.days * manualOT.weekend.rate_per_day
            details.push({
                date: new Date(year, month - 1, 1).toISOString(),
                title: 'Manual OT - เสาร์-อาทิตย์ (วัน)',
                start_hour: '09:00',
                end_hour: '17:00',
                total_hours: manualOT.weekend.days * 8, // 1 วัน = 8 ชม.
                ot_type: 'weekend',
                hourly_rate: 0,
                days: manualOT.weekend.days,
                rate_per_day: manualOT.weekend.rate_per_day,
                amount: amount,
                description: `OT เสาร์-อาทิตย์ ${manualOT.weekend.days} วัน @ ฿${manualOT.weekend.rate_per_day}/วัน`,
                is_manual: true,
            })
        }

        if (details.length > 0) {
            setManualOTDetails(details)
        }
    }

    const clearManualOT = () => {
        setManualOT({
            weekday: { hours: 0, rate_per_hour: 0 },
            weekend: {
                hours: 0, // Add this
                days: 0,
                rate_per_hour: 0, // Add this
                rate_per_day: 0,
            },
        })
        setManualOTDetails([])
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

            // รวม OT ทั้งหมด
            const allOTDetails = [
                ...(prefillData?.calculated.ot_details || []),
                ...manualOTDetails,
            ]

            // คำนวณ OT รวม
            const totalOTAmount = allOTDetails.reduce(
                (sum, detail) => sum + detail.amount,
                0,
            )
            const totalOTHours = allOTDetails.reduce(
                (sum, detail) => sum + (detail.total_hours || 0),
                0,
            )

            const netSalary = calculateNetSalary()

            const payload = {
                ...formData,
                user_id: user._id,
                month: month,
                year: year,
                net_salary: netSalary,
                base_salary: prefillData?.user.base_salary || 0,
                ot_amount: totalOTAmount,
                ot_hours: totalOTHours,
                ot_details: allOTDetails,
                fuel_costs: prefillData?.calculated.fuel_costs || 0,
                day_off_days: prefillData?.calculated.day_off_days || 0,
                remaining_vacation_days:
                    prefillData?.calculated.remaining_vacation_days || 0,
                created_by: created_by,
                manual_ot: manualOT,
                notes:
                    formData.notes ||
                    `Manual OT: ${manualOTDetails.length > 0 ? 'Yes' : 'No'}`,
            }

            console.log('🚀 Submitting payload:', payload)

            const response = await axios.post('/api/salaries', payload)

            if (response.status === 201 || response.status === 200) {
                setSuccess(true)
                onSuccess()
                setTimeout(() => {
                    handleClose()
                }, 2000)
            }
        } catch (err: any) {
            console.error('❌ Error details:', {
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

        setManualOT({
            weekday: { hours: 0, rate_per_hour: 0 },
            weekend: {
                hours: 0,
                days: 0,
                rate_per_hour: 0,
                rate_per_day: 0,
            },
        })

        setManualOTDetails([])
        setError(null)
        setSuccess(false)
        setPrefillData(null)
        onClose()
    }

    // คำนวณผลรวมต่างๆ
    const calculateTotalIncome = () => {
        if (!prefillData) return 0

        const { base_salary } = prefillData.user
        const { fuel_costs } = prefillData.calculated
        const { bonus, commission, money_not_spent_on_holidays, other_income } =
            formData

        // คำนวณ OT จาก manual
        const manualOTAmount = manualOTDetails.reduce(
            (sum, detail) => sum + detail.amount,
            0,
        )

        // รวมกับ OT จากระบบ
        const otAmount =
            (prefillData.calculated.ot_amount || 0) + manualOTAmount

        return (
            base_salary +
            otAmount +
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

    // คำนวณจำนวนชั่วโมง OT และเงิน OT รวม
    const calculateManualOTSummary = () => {
        let totalHours = 0
        let totalWeekendDays = 0
        let totalAmount = 0

        // Weekday
        if (manualOT.weekday.hours > 0 && manualOT.weekday.rate_per_hour > 0) {
            totalHours += manualOT.weekday.hours
            totalAmount +=
                manualOT.weekday.hours * manualOT.weekday.rate_per_hour
        }

        // Weekend Hours
        if (manualOT.weekend.hours > 0 && manualOT.weekend.rate_per_hour > 0) {
            totalHours += manualOT.weekend.hours
            totalAmount +=
                manualOT.weekend.hours * manualOT.weekend.rate_per_hour
        }

        // Weekend Days
        if (manualOT.weekend.days > 0 && manualOT.weekend.rate_per_day > 0) {
            totalWeekendDays += manualOT.weekend.days
            totalAmount += manualOT.weekend.days * manualOT.weekend.rate_per_day
        }

        return { totalHours, totalWeekendDays, totalAmount }
    }

    const renderStepContent = (step: number) => {
        const commonProps = {
            user,
            month,
            year,
            prefillData,
            formData,
            onInputChange: handleInputChange,
            calculateTotalIncome,
            calculateTotalDeductions,
            calculateNetSalary,
            manualOT,
            onManualOTChange: handleManualOTChange,
            manualOTDetails,
            addManualOTDetail,
            clearManualOT,
            calculateManualOTSummary,
        }

        switch (step) {
            case 0:
                return <Step1BasicInfo {...commonProps} />
            case 1:
                return <Step2OtRates {...commonProps} />
            case 2:
                return <Step3AdditionalIncome {...commonProps} />
            case 3:
                return <Step4Deductions {...commonProps} />
            case 4:
                return <Step5Summary {...commonProps} />
            default:
                return null
        }
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
