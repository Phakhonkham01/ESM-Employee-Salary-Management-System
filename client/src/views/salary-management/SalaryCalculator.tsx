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
import Swal from 'sweetalert2' // ✅ เพิ่ม import
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
        cut_off_pay_days: 0,
        cut_off_pay_amount: 0,
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
                description: `Weekday OT: ${manualOT.weekday.hours} hours @ ${manualOT.weekday.rate_per_hour}/hour`,
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
                description: `Weekend OT: ${manualOT.weekend.hours} hours @ ${manualOT.weekend.rate_per_hour}/hour`,
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
                description: `Weekend OT: ${manualOT.weekend.days} days @ ${manualOT.weekend.rate_per_day}/day`,
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

    // ✅ แก้ไข handleSubmit เพื่อเพิ่ม SweetAlert
    const handleSubmit = async () => {
        // ✅ แสดง SweetAlert ยืนยัน
        const result = await Swal.fire({
            title: 'ຢືນຢັນການຄຳນວນເງິນເດືອນ?',
            html: `
                <div style="text-align: left; padding: 10px;">
                    <p><strong>ພະນັກງານ:</strong> ${user.first_name_en} ${user.last_name_en}</p>
                    <p><strong>ເດືອນ:</strong> ${getMonthName(month)} ${year}</p>
                    <p><strong>ເງິນເດືອນສຸດທິ:</strong> ₭${calculateNetSalary().toLocaleString()}</p>
                    <hr style="margin: 10px 0;">
                    <p style="color: #666; font-size: 14px;">ກະລຸນາກວດສອບຂໍ້ມູນກ່ອນຢືນຢັນ</p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#45cc67',
            cancelButtonColor: '#d33',
            confirmButtonText: '✓ ຢືນຢັນ',
            cancelButtonText: '✗ ຍົກເລີກ',
            reverseButtons: true,
        })

        // ✅ ถ้ายกเลิก ให้ return
        if (!result.isConfirmed) {
            return
        }

        // ✅ แสดง loading
        Swal.fire({
            title: 'ກຳລັງດຳເນີນການ...',
            html: 'ກະລຸນາລໍຖ້າ ກຳລັງຄຳນວນເງິນເດືອນ',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading()
            },
        })

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

            const response = await axios.post('/api/salaries', payload)

            if (response.status === 201 || response.status === 200) {
                try {
                    const remainingVacationDays =
                        prefillData?.calculated.remaining_vacation_days || 0

                    let updateReason = ''
                    let vacationMessage = ''

                    if (remainingVacationDays < 0) {
                        updateReason = `คำนวณเงินเดือน ${getMonthName(month)} ${year} - ขาดงานเกินวันลา ${Math.abs(remainingVacationDays)} วัน`
                        vacationMessage = `ພະນັກງານຂາດວຽກເກີນວັນລາ ${Math.abs(remainingVacationDays)} ວັນ`
                    } else if (remainingVacationDays === 0) {
                        updateReason = `คำนวณเงินเดือน ${getMonthName(month)} ${year} - วันลาหมดแล้ว`
                        vacationMessage = 'ວັນລາໝົດແລ້ວ'
                    } else {
                        updateReason = `คำนวณเงินเดือน ${getMonthName(month)} ${year} - เหลือวันลา ${remainingVacationDays} วัน`
                        vacationMessage = `ເຫຼືອວັນລາ ${remainingVacationDays} ວັນ`
                    }

                    await axios.put(
                        `/api/users/${user._id}/update-vacation-days`,
                        {
                            vacation_days: remainingVacationDays,
                            updated_by: created_by,
                            update_reason: updateReason,
                        },
                    )

                    setSuccess(true)

                    // ✅ แสดง Success Alert
                    await Swal.fire({
                        title: 'ສຳເລັດ!',
                        html: `
                            <div style="text-align: left; padding: 10px;">
                                <p>✓ ຄຳນວນເງິນເດືອນສຳເລັດແລ້ວ</p>
                                <p><strong>ພະນັກງານ:</strong> ${user.first_name_en} ${user.last_name_en}</p>
                                <p><strong>ເງິນເດືອນສຸດທິ:</strong> ₭${netSalary.toLocaleString()}</p>
                                ${vacationMessage ? `<p style="color: ${remainingVacationDays < 0 ? '#d33' : '#666'};">📅 ${vacationMessage}</p>` : ''}
                            </div>
                        `,
                        icon: 'success',
                        confirmButtonColor: '#45cc67',
                        confirmButtonText: 'ປິດ',
                    })

                    onSuccess()
                    setTimeout(() => {
                        handleClose()
                    }, 500)
                } catch (updateError: any) {
                    console.warn(
                        'คำนวณเงินเดือนสำเร็จ แต่ไม่สามารถอัพเดทวันลาได้:',
                        updateError,
                    )
                    setSuccess(true)

                    // ✅ แสดง Warning Alert
                    await Swal.fire({
                        title: 'ສຳເລັດ (ມີຂໍ້ຄວນສັງເກດ)',
                        html: `
                            <div style="text-align: left; padding: 10px;">
                                <p>✓ ຄຳນວນເງິນເດືອນສຳເລັດແລ້ວ</p>
                                <p style="color: #ff9800;">⚠ ແຕ່ບໍ່ສາມາດອັບເດດວັນລາໄດ້</p>   
                                <p style="font-size: 14px; color: #666;">${updateError.response?.data?.message || 'ກະລຸນາກວດສອບລະບົບ'}</p>
                            </div>
                        `,
                        icon: 'warning',
                        confirmButtonColor: '#ff9800',
                        confirmButtonText: 'ເຂົ້າໃຈແລ້ວ',
                    })

                    onSuccess()
                    setTimeout(() => {
                        handleClose()
                    }, 500)
                }
            }
        } catch (err: any) {
            console.error('คำนวณเงินเดือนล้มเหลว:', err.response?.data)
            setError(err.response?.data?.message || 'คำนวณเงินเดือนล้มเหลว')

            // ✅ แสดง Error Alert
            await Swal.fire({
                title: 'ເກີດຂໍ້ຜິດພາດ!',
                html: `
                    <div style="text-align: left; padding: 10px;">
                        <p style="color: #d33;">✗ ບໍ່ສາມາດຄຳນວນເງິນເດືອນໄດ້</p>
                        <p style="font-size: 14px; color: #666;">${err.response?.data?.message || 'ກະລຸນາລອງໃໝ່ອີກຄັ້ງ'}</p>
                    </div>
                `,
                icon: 'error',
                confirmButtonColor: '#d33',
                confirmButtonText: 'ປິດ',
            })
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
            cut_off_pay_days: 0,
            cut_off_pay_amount: 0,
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
        const cutOffTotal =
            formData.cut_off_pay_days * formData.cut_off_pay_amount

        return formData.office_expenses + formData.social_security + cutOffTotal
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
            <div className="bg-white rounded-md p-15 border-gray-300 w-full max-w-6xl max-h-[95vh] ">
                {/* Header */}
                <div className="bg-[#ffffff] flex items-center justify-between border-b border-[#ffffff] ">
                    <div className="flex items-center gap-3 text-white">
                        <div className="p-1">
                            <Calculator className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-medium">
                                Payroll Calculation System
                            </h2>
                            <p className="text-gray-500 text-xs mt-0.5">
                                {user.first_name_en} {user.last_name_en} |{' '}
                                {getMonthName(month)} {year}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-dark hover:bg-white/10 p-2 rounded transition-colors"
                        title="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] bg-gray-50 no-scrollbar">
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
                                                            ? 'bg-[#45cc67] text-white border-[#FFFFFF]'
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
                        <ChevronLeft className="w-7 h-7" />
                        Previous
                    </button>

                    {activeStep === steps.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={loading || success || !prefillData}
                            className="px-4 py-2 text-sm font-medium text-white bg-[#45cc67] hover:bg-[#3aa85a] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors rounded-sm flex items-center gap-1.5"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-[35px] w-[40px]" />
                                    Confirm Calculation
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            disabled={!prefillData && activeStep === 0}
                            className="h-[45px] w-[120px] pl-5 text-sm font-medium text-white bg-[#45cc67] hover:bg-[#3aa85a] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors rounded-sm flex items-center gap-1.5"
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
