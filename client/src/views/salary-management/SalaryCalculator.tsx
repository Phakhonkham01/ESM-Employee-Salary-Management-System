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

    const [formData, setFormData] = useState<SalaryFormData>({
        user_id: user._id,
        month,
        year,
        bonus: 0,
        fuel_costs: 0,
        commission: 0,
        money_not_spent_on_holidays: 0,
        other_income: 0,
        office_expenses: 0,
        salary: 0,
        social_security: 0,
        working_days: 22,
        notes: '',
    })

    const [manualOT, setManualOT] = useState<ManualOTState>({
        weekday: {
            hours: 0,
            rate_per_hour: 0,
        },
        weekend: {
            hours: 0,
            days: 0,
            rate_per_hour: 0,
            rate_per_day: 0,
        },
    })

    const [manualOTDetails, setManualOTDetails] = useState<any[]>([])

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

        if (manualOT.weekday.hours > 0 && manualOT.weekday.rate_per_hour > 0) {
            const amount =
                manualOT.weekday.hours * manualOT.weekday.rate_per_hour
            details.push({
                date: new Date(year, month - 1, 1).toISOString(),
                title: 'Manual OT - Weekday',
                start_hour: '09:00',
                end_hour: `${17 + manualOT.weekday.hours}:00`,
                total_hours: manualOT.weekday.hours,
                ot_type: 'weekday',
                hourly_rate: manualOT.weekday.rate_per_hour,
                days: 0,
                rate_per_day: 0,
                amount: amount,
                description: `Weekday OT: ${manualOT.weekday.hours} hours @ ฿${manualOT.weekday.rate_per_hour}/hour`,
                is_manual: true,
            })
        }

        if (manualOT.weekend.hours > 0 && manualOT.weekend.rate_per_hour > 0) {
            const amount =
                manualOT.weekend.hours * manualOT.weekend.rate_per_hour
            details.push({
                date: new Date(year, month - 1, 1).toISOString(),
                title: 'Manual OT - Weekend (Hours)',
                start_hour: '09:00',
                end_hour: `${17 + manualOT.weekend.hours}:00`,
                total_hours: manualOT.weekend.hours,
                ot_type: 'weekend',
                hourly_rate: manualOT.weekend.rate_per_hour,
                days: 0,
                rate_per_day: 0,
                amount: amount,
                description: `Weekend OT: ${manualOT.weekend.hours} hours @ ฿${manualOT.weekend.rate_per_hour}/hour`,
                is_manual: true,
            })
        }

        if (manualOT.weekend.days > 0 && manualOT.weekend.rate_per_day > 0) {
            const amount = manualOT.weekend.days * manualOT.weekend.rate_per_day
            details.push({
                date: new Date(year, month - 1, 1).toISOString(),
                title: 'Manual OT - Weekend (Days)',
                start_hour: '09:00',
                end_hour: '17:00',
                total_hours: manualOT.weekend.days * 8,
                ot_type: 'weekend',
                hourly_rate: 0,
                days: manualOT.weekend.days,
                rate_per_day: manualOT.weekend.rate_per_day,
                amount: amount,
                description: `Weekend OT: ${manualOT.weekend.days} days @ ฿${manualOT.weekend.rate_per_day}/day`,
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
                hours: 0,
                days: 0,
                rate_per_hour: 0,
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

    // SalaryCalculator.tsx - ส่วน handleSubmit ที่แก้ไขแล้ว
    const handleSubmit = async () => {
        try {
            setLoading(true)
            setError(null)

            const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
            const created_by = currentUser._id || currentUser.id || user._id

            const allOTDetails = [
                ...(prefillData?.calculated.ot_details || []),
                ...manualOTDetails,
            ]

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

            // Step 1: 提交薪资记录
            const response = await axios.post('/api/salaries', payload)

            if (response.status === 201 || response.status === 200) {
                // Step 2: 成功提交薪资后，更新用户的 vacation_days
                try {
                    const remainingVacationDays =
                        prefillData?.calculated.remaining_vacation_days || 0

                    // ตรวจสอบสถานะวันลา
                    let updateReason = ''
                    let vacationMessage = ''

                    if (remainingVacationDays < 0) {
                        updateReason = `คำนวณเงินเดือน ${getMonthName(month)} ${year} - ขาดงานเกินวันลา ${Math.abs(remainingVacationDays)} วัน`
                        vacationMessage = `พนักงานขาดงานเกินวันลา ${Math.abs(remainingVacationDays)} วัน`
                    } else if (remainingVacationDays === 0) {
                        updateReason = `คำนวณเงินเดือน ${getMonthName(month)} ${year} - วันลาหมดแล้ว`
                        vacationMessage = 'วันลาหมดแล้ว'
                    } else {
                        updateReason = `คำนวณเงินเดือน ${getMonthName(month)} ${year} - เหลือวันลา ${remainingVacationDays} วัน`
                        vacationMessage = `เหลือวันลา ${remainingVacationDays} วัน`
                    }

                    // เรียก API อัพเดทวันลา (สามารถติดลบได้)
                    await axios.put(
                        `/api/users/${user._id}/update-vacation-days`,
                        {
                            vacation_days: remainingVacationDays,
                            updated_by: created_by,
                            update_reason: updateReason,
                        },
                    )

                    // Step 3: แสดงสถานะสำเร็จ
                    setSuccess(true)

                    // แสดงข้อความตามสถานะวันลา (เป็นข้อความสำเร็จ ไม่ใช่ error)
                    console.log(`คำนวณเงินเดือนสำเร็จ! ${updateReason}`)

                    // แสดงข้อความใน UI (ถ้าต้องการ)
                    if (remainingVacationDays < 0) {
                        // แสดงเป็น warning message
                        console.warn(
                            `คำนวณเงินเดือนสำเร็จ แต่ ${vacationMessage}`,
                        )
                    }

                    onSuccess()
                    setTimeout(() => {
                        handleClose()
                    }, 3000)
                } catch (updateError: any) {
                    console.warn(
                        'คำนวณเงินเดือนสำเร็จ แต่ไม่สามารถอัพเดทวันลาได้:',
                        updateError,
                    )
                    setSuccess(true)
                    // แสดงเฉพาะข้อความแจ้งเตือน
                    console.log(
                        'คำนวณเงินเดือนสำเร็จ แต่ไม่สามารถอัพเดทวันลาได้' +
                            (updateError.response?.data?.message
                                ? ` (${updateError.response.data.message})`
                                : ''),
                    )
                    onSuccess()
                    setTimeout(() => {
                        handleClose()
                    }, 3000)
                }
            }
        } catch (err: any) {
            console.error('คำนวณเงินเดือนล้มเหลว:', err.response?.data)
            setError(err.response?.data?.message || 'คำนวณเงินเดือนล้มเหลว')
        } finally {
            setLoading(false)
        }
    }
    const handleClose = () => {
        setActiveStep(0)
        setFormData({
            user_id: user._id,
            salary: 0,
            fuel_costs: 0,
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

    const calculateTotalIncome = () => {
        if (!prefillData) return 0

        const { base_salary } = prefillData.user
        const { fuel_costs } = prefillData.calculated
        const { bonus, commission, money_not_spent_on_holidays, other_income } =
            formData

        const manualOTAmount = manualOTDetails.reduce(
            (sum, detail) => sum + detail.amount,
            0,
        )

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

    const calculateManualOTSummary = () => {
        let totalHours = 0
        let totalWeekendDays = 0
        let totalAmount = 0

        if (manualOT.weekday.hours > 0 && manualOT.weekday.rate_per_hour > 0) {
            totalHours += manualOT.weekday.hours
            totalAmount +=
                manualOT.weekday.hours * manualOT.weekday.rate_per_hour
        }

        if (manualOT.weekend.hours > 0 && manualOT.weekend.rate_per_hour > 0) {
            totalHours += manualOT.weekend.hours
            totalAmount +=
                manualOT.weekend.hours * manualOT.weekend.rate_per_hour
        }

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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-gray-300 w-full max-w-5xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-[#1F3A5F] px-6 py-4 flex items-center justify-between border-b border-[#152642]">
                    <div className="flex items-center gap-3 text-white">
                        <div className="p-1">
                            <Calculator className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-medium">
                                Payroll Calculation System
                            </h2>
                            <p className="text-gray-300 text-xs mt-0.5">
                                {user.first_name_en} {user.last_name_en} |{' '}
                                {getMonthName(month)} {year}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-white hover:bg-white/10 p-2 rounded transition-colors"
                        title="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] bg-gray-50">
                    {loading && activeStep === 0 ? (
                        <div className="flex justify-center items-center min-h-[300px]">
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A5F] mb-4"></div>
                                <span className="text-gray-600 text-sm">
                                    Loading calculation data...
                                </span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Error Display */}
                            {error && (
                                <div className="mb-6 p-3 bg-[#FDE8E8] border border-[#9B1C1C] text-[#9B1C1C] text-sm rounded-sm">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{error}</span>
                                    </div>
                                </div>
                            )}

                            {/* Success Display */}
                            {success && (
                                <div className="mb-6 p-3 bg-[#E6F4EA] border border-[#2E7D32] text-[#2E7D32] text-sm rounded-sm">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>
                                            Payroll calculation completed
                                            successfully.
                                        </span>
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
                                                    className={`w-10 h-10 rounded-sm flex items-center justify-center text-sm font-medium border ${
                                                        index <= activeStep
                                                            ? 'bg-[#1F3A5F] text-white border-[#1F3A5F]'
                                                            : 'bg-white text-gray-500 border-gray-300'
                                                    }`}
                                                >
                                                    {index < activeStep ? (
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    ) : (
                                                        index + 1
                                                    )}
                                                </div>
                                                <span
                                                    className={`text-xs mt-2 text-center ${
                                                        index <= activeStep
                                                            ? 'text-gray-900 font-medium'
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
                                                        marginBottom: '24px',
                                                    }}
                                                >
                                                    <div
                                                        className={`h-[1px] w-full ${
                                                            index < activeStep
                                                                ? 'bg-[#1F3A5F]'
                                                                : 'bg-gray-300'
                                                        }`}
                                                    ></div>
                                                </div>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>

                            {/* Step Content */}
                            {renderStepContent(activeStep)}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-300 flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        disabled={activeStep === 0 || loading || success}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors rounded-sm flex items-center gap-1.5"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </button>

                    {activeStep === steps.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={loading || success || !prefillData}
                            className="px-4 py-2 text-sm font-medium text-white bg-[#1F3A5F] hover:bg-[#152642] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors rounded-sm flex items-center gap-1.5"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Confirm Calculation
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            disabled={!prefillData && activeStep === 0}
                            className="px-4 py-2 text-sm font-medium text-white bg-[#1F3A5F] hover:bg-[#152642] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors rounded-sm flex items-center gap-1.5"
                        >
                            Next Step
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SalaryCalculator
