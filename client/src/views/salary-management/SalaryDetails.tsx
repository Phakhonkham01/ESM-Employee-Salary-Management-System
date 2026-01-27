'use client'

import React, { useState, useRef } from 'react'
import {
    User,
    Building,
    Briefcase,
    Shield,
    Clock,
    Mail,
    Loader2,
    Download,
    DollarSign,
    FileText,
    Calculator,
} from 'lucide-react'
import moment from 'moment'
import { formatCurrency, getMonthName } from './constants'

// Interface for salary data (redefined for independence)
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
    cut_off_pay_days?: number
    cut_off_pay_amount?: number
}

interface SalaryDetailsProps {
    salary: Salary
    getMonthName: (month: number) => string
}

const SalaryDetails: React.FC<SalaryDetailsProps> = ({
    salary,
    getMonthName,
}) => {
    const [isSendingEmail, setIsSendingEmail] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const [isCapturing, setIsCapturing] = useState(false)
    const [emailStatus, setEmailStatus] = useState<{
        success: boolean
        message: string
    } | null>(null)
    const payslipRef = useRef<HTMLDivElement>(null)

    // Calculate totals
    const totalIncome =
        salary.base_salary +
        salary.ot_amount +
        salary.bonus +
        salary.commission +
        salary.fuel_costs +
        salary.money_not_spent_on_holidays +
        salary.other_income
    
    const cutOffTotal = (salary.cut_off_pay_days || 0) * (salary.cut_off_pay_amount || 0)
    const totalDeductions = salary.office_expenses + salary.social_security + cutOffTotal
    const userName = `${salary.user_id.first_name_en} ${salary.user_id.last_name_en}`
    const userEmail = salary.user_id.email

    // Function to export as PNG
    const exportToPNG = async () => {
        if (!payslipRef.current) return

        try {
            setIsExporting(true)
            setIsCapturing(true)

            // รอให้ DOM update
            await new Promise((resolve) => setTimeout(resolve, 100))

            const html2canvas = (await import('html2canvas')).default

            const canvas = await html2canvas(payslipRef.current, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false,
            })

            const link = document.createElement('a')
            const fileName = `salary-slip-${userName.replace(/\s+/g, '-')}-${getMonthName(salary.month)}-${salary.year}.png`

            link.download = fileName
            link.href = canvas.toDataURL('image/png')
            link.click()

            URL.revokeObjectURL(link.href)
        } catch (error) {
            console.error('Failed to export PNG:', error)
            alert('Failed to export PNG. Please try again.')
        } finally {
            setIsCapturing(false)
            setIsExporting(false)
        }
    }

    // Function to send email with PNG attachment (Step 5 style)
    const sendEmailWithPayslip = async () => {
        if (!payslipRef.current) return

        try {
            setIsSendingEmail(true)
            setEmailStatus(null)
            setIsCapturing(true)

            // รอให้ DOM update
            await new Promise((resolve) => setTimeout(resolve, 100))

            // Convert to image
            const html2canvas = (await import('html2canvas')).default
            const canvas = await html2canvas(payslipRef.current, {
                scale: 0.8,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false,
                ignoreElements: (element) => {
                    // Ignore elements that might cause issues
                    return element.classList?.contains('no-export')
                },
            })

            setIsCapturing(false)

            // Convert to JPEG
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
            const base64String = dataUrl.split(',')[1]

            // Prepare data
            const emailData = {
                to: userEmail,
                subject: `Salary Slip - ${getMonthName(salary.month)} ${salary.year}`,
                employeeName: userName,
                month: getMonthName(salary.month),
                year: salary.year,
                baseSalary: salary.base_salary,
                netSalary: salary.net_salary,
                image: base64String,
                fileName: `salary-slip-${userName.replace(/\s+/g, '-')}.jpg`,
            }

            // API base URL
            const API_BASE_URL = 'http://localhost:8000'

            // Send to backend API
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
                    const errorData = await response.json()
                    errorMessage = errorData.message || errorMessage
                } catch {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`
                }
                throw new Error(errorMessage)
            }

            const result = await response.json()

            if (result.success) {
                setEmailStatus({
                    success: true,
                    message: `✅ Salary slip sent to ${userEmail}`,
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
            setIsCapturing(false)
            setIsSendingEmail(false)
        }
    }

    // Format date for display
    const formatDate = (dateString: string) => {
        return moment(dateString).format('DD/MM/YYYY')
    }

    return (
        <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div>
                    <h4 className="text-sm font-bold text-gray-800">
                        Send Payslip
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                        Send salary slip to {userEmail}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={exportToPNG}
                        disabled={isExporting}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-md hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExporting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        {isExporting ? 'Exporting...' : 'Download PNG'}
                    </button>
                    <button
                        onClick={sendEmailWithPayslip}
                        disabled={isSendingEmail}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className={`p-3 rounded-md border ${
                        emailStatus.success
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                >
                    <div className="font-medium">
                        {emailStatus.success ? 'Success!' : 'Error'}
                    </div>
                    <div className="text-sm">{emailStatus.message}</div>
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

            {/* Payslip Table (Step 5 Style) - อัปเดตเป็นแบบใหม่ */}
            <div
                ref={payslipRef}
                data-payslip
                className={`bg-white rounded-lg p-6 shadow-sm border border-gray-300 ${isCapturing ? 'export-mode' : ''}`}
            >
                {/* Header */}
                <div className="text-center mb-8 border-b pb-4">
                    <h1 className="text-2xl font-bold text-[#1F3A5F]">
                        Salary Slip
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {getMonthName(salary.month)} {salary.year}
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
                                {formatCurrency(salary.base_salary)}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">
                                ມື້ເຮັດວຽກ:
                            </span>
                            <span className="ml-2 font-medium">
                                {salary.working_days || 0} ມື້
                            </span>
                        </div>
                    </div>
                </div>

                {/* Salary Table - อัปเดตตาม Step5 */}
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
                                    {formatCurrency(salary.base_salary)}
                                </td>
                                <td className="p-3 border">
                                    ມື້ຂາດວຽກ{' '}
                                    {(salary.cut_off_pay_days || 0) > 0 && (
                                        <>
                                            ({salary.cut_off_pay_days} ມື້
                                            {' × '}
                                            {(salary.cut_off_pay_amount || 0).toLocaleString()}
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
                                    {formatDate(salary.payment_date)}
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
                                    {formatCurrency(salary.fuel_costs)}
                                </td>
                                <td className="p-3 border" rowSpan={2}>
                                    ປະກັນສັງຄົມ
                                </td>
                                <td
                                    className="p-3 border text-red-600"
                                    rowSpan={2}
                                >
                                    {formatCurrency(salary.social_security)}
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 border">ຄ່າຄອມມິດຊັນ</td>
                                <td className="p-3 border">
                                    {formatCurrency(salary.commission)}
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 border">
                                    ຄ່າລ່ວງເວລາ (OT)
                                </td>
                                <td className="p-3 border">
                                    {formatCurrency(salary.ot_amount)}
                                </td>
                                <td className="p-3 border" colSpan={2}></td>
                            </tr>
                            <tr>
                                <td className="p-3 border">ເງິນໂບນັດ</td>
                                <td className="p-3 border">
                                    {formatCurrency(salary.bonus)}
                                </td>
                                <td className="p-3 border" colSpan={2}></td>
                            </tr>
                            <tr>
                                <td className="p-3 border">
                                    ຄ່າເຮັດວຽກມື້ພັກ
                                </td>
                                <td className="p-3 border">
                                    {formatCurrency(
                                        salary.money_not_spent_on_holidays,
                                    )}
                                </td>
                                <td className="p-3 border" colSpan={2}></td>
                            </tr>
                            <tr>
                                <td className="p-3 border">
                                    ຄ່າໃຊ້ຈ່າຍຫ້ອງການ
                                </td>
                                <td className="p-3 border">
                                    {formatCurrency(salary.office_expenses)}
                                </td>
                                <td className="p-3 border" colSpan={2}></td>
                            </tr>
                            <tr>
                                <td className="p-3 border">ອື່ນໆ</td>
                                <td className="p-3 border">
                                    {formatCurrency(salary.other_income)}
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
                                    {formatCurrency(salary.net_salary)} ກີບ
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
                                {salary.working_days || 0} ມື້
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">
                                ວັນພັກທີ່ເຫຼືອ:
                            </span>
                            <span className="ml-2 font-medium">
                                {salary.remaining_vacation_days || 0} ມື້
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">OT Hours:</span>
                            <span className="ml-2 font-medium">
                                {salary.ot_hours || 0} ຊົ່ວໂມງ
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">ມື້ພັກ:</span>
                            <span className="ml-2 font-medium">
                                {salary.day_off_days || 0} ມື້
                            </span>
                        </div>
                    </div>
                    {salary.notes && (
                        <div className="mt-4 p-3 bg-white rounded border border-gray-300">
                            <span className="font-medium text-gray-700">
                                Notes:
                            </span>
                            <p className="mt-1 text-gray-600">
                                {salary.notes}
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

            {/* Original Detail Cards */}
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
                                    {userName}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {userEmail}
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
                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${salary.user_id.role ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                                >
                                    {salary.user_id.role || 'Not specified'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-700 font-medium flex items-center gap-2">
                                    <Building className="w-4 h-4" />
                                    Department:
                                </span>
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${salary.user_id.department_id?.name ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}
                                >
                                    {salary.user_id.department_id?.name ||
                                        'Not specified'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-700 font-medium flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" />
                                    Position:
                                </span>
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${salary.user_id.position_id?.name ? 'bg-pink-100 text-pink-800' : 'bg-gray-100 text-gray-800'}`}
                                >
                                    {salary.user_id.position_id?.name ||
                                        'Not specified'}
                                </span>
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
                                {salary.base_salary.toLocaleString()}
                            </span>
                        </div>

                        {/* Overtime */}
                        <div className="pb-2 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700">Overtime:</span>
                                <span className="font-semibold text-gray-900">
                                    {salary.ot_amount.toLocaleString()}
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
                                <div className="text-xs text-gray-500">
                                    Bonus
                                </div>
                                <div className="text-sm font-semibold text-gray-900">
                                    {salary.bonus.toLocaleString()}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">
                                    Commission
                                </div>
                                <div className="text-sm font-semibold text-gray-900">
                                    {salary.commission.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Other Income */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700">
                                    Fuel Costs:
                                </span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {salary.fuel_costs.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700">
                                    Holiday Money:
                                </span>
                                <span className="text-sm font-semibold text-gray-900">
                                    
                                    {salary.money_not_spent_on_holidays.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700">
                                    Other Income:
                                </span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {salary.other_income.toLocaleString()}
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
                                    {totalIncome.toLocaleString()}
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
                                        
                                        {salary.office_expenses.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-sm text-gray-600">
                                        Social Security:
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        
                                        {salary.social_security.toLocaleString()}
                                    </span>
                                </div>
                                {(salary.cut_off_pay_days || 0) > 0 && (
                                    <div className="flex justify-between items-center py-1 border-t border-gray-100 pt-2">
                                        <span className="text-sm text-gray-600">
                                            Absence Deduction:
                                        </span>
                                        <span className="text-sm font-semibold text-red-600">
                                            {cutOffTotal.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="border-t border-red-200 pt-2 mt-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-red-900">
                                        Total Deductions:
                                    </span>
                                    <span className="text-sm font-bold text-red-900">
                                        {totalDeductions.toLocaleString()}
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
            </div>

            {/* OT Details Section */}
            {/* {salary.ot_details && salary.ot_details.length > 0 && (
                <div className="bg-white rounded-lg p-4 border border-yellow-200 shadow-sm">
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
                            <thead className="bg-yellow-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-yellow-700 uppercase">
                                        Date
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-yellow-700 uppercase">
                                        Type
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-yellow-700 uppercase">
                                        Hours
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-yellow-700 uppercase">
                                        Rate
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-yellow-700 uppercase">
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {salary.ot_details.map((detail, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-yellow-50"
                                    >
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                            {moment(detail.date).format(
                                                'DD/MM/YYYY',
                                            )}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <span
                                                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${detail.type === 'weekday' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}
                                            >
                                                {detail.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                            {detail.hours} hrs
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                            {detail.rate_per_hour}/hr
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            {detail.amount.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )} */}
        </div>
    )
}

export default SalaryDetails