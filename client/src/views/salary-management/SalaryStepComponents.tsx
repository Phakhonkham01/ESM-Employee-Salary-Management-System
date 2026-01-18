"use client"

import React from "react"

import { useState } from "react"
import { Download, Mail, Loader2, DollarSign, Fuel, UserX, Calculator, Briefcase, Clock, Plus, Trash2 } from "lucide-react"
import type { StepComponentsProps, SalaryEmailRequest, EmailResponse, SalaryTheme } from "./types"
import { defaultTheme } from "./types"
import { getMonthName, formatCurrency, formatDate } from "./constants"
import { OtDetailsTable, WeekdayOTCard, WeekendOTCard } from "./ot-cards"

export const Step1BasicInfo: React.FC<StepComponentsProps> = ({ user, month, year, prefillData, theme = defaultTheme }) => {
  if (!prefillData) return null
  const calculated = prefillData.calculated

  return (
    <div className="min-h-[600px]">
      <div>
        <div className="flex items-center gap-2 mb-4 pb-3 border-b-2" style={{ borderColor: theme.primary }}>
          <Briefcase className="w-5 h-5" style={{ color: theme.primary }} />
          <h3 className="text-lg font-semibold" style={{ color: theme.primary }}>
            Employee Information
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Employee Name</label>
            <input
              type="text"
              value={`${user.first_name_en} ${user.last_name_en}`}
              disabled
              className="w-full px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input type="text" value={user.email} disabled className="w-full px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Period</label>
            <input
              type="text"
              value={`${getMonthName(month)} ${year}`}
              disabled
              className="w-full px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Base Salary</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
              <input
                type="text"
                value={prefillData.user.base_salary.toLocaleString()}
                disabled
                className="w-full pl-8 pr-3 py-2 border border-input rounded-md bg-muted text-muted-foreground"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b-2" style={{ borderColor: theme.primary }}>
            <Calculator className="w-5 h-5" style={{ color: theme.primary }} />
            <h3 className="text-lg font-semibold" style={{ color: theme.primary }}>
              Auto-calculated Components
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-border rounded-lg bg-card p-4">
              <div className="flex items-center mb-2">
                <DollarSign className="w-5 h-5 mr-2" style={{ color: theme.primary }} />
                <span className="text-sm font-medium text-foreground">OT Amount (System)</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: theme.primary }}>
                ${prefillData.calculated.ot_amount.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{prefillData.calculated.ot_hours} hours</p>
              <div className="mt-2 text-xs text-muted-foreground">
                <div>Weekday: {prefillData.calculated.weekday_ot_hours || 0} hrs</div>
                <div>Weekend: {prefillData.calculated.weekend_ot_hours || 0} hrs</div>
              </div>
            </div>
            <div className="border border-border rounded-lg bg-card p-4">
              <div className="flex items-center mb-2">
                <Fuel className="w-5 h-5 mr-2" style={{ color: theme.success }} />
                <span className="text-sm font-medium text-foreground">Fuel Costs</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: theme.success }}>
                ${prefillData.calculated.fuel_costs.toLocaleString()}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm col-span-full">
              <div className="text-muted-foreground">Days off this month</div>
              <div>{calculated.day_off_days_this_month} days</div>

              <div className="text-muted-foreground">Vacation days used</div>
              <div>
                {calculated.used_vacation_days_this_year} / {calculated.total_vacation_days} days
              </div>

              <div className="text-muted-foreground">Vacation days left</div>
              <div className={`font-bold text-${calculated.vacation_color || "green"}-600`}>{calculated.remaining_vacation_days} days</div>

              {(calculated.exceed_days ?? 0) > 0 && <div className="text-destructive font-semibold col-span-2">Exceeded by {calculated.exceed_days} days</div>}
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
  theme = defaultTheme,
}) => {
  if (!prefillData) return null

  const { totalAmount } = calculateManualOTSummary()

  return (
    <div className="min-h-[600px]">
      <div>
        <div className="flex items-center gap-2 mb-4 pb-3 border-b-2" style={{ borderColor: theme.primary }}>
          <Clock className="w-5 h-5" style={{ color: theme.primary }} />
          <h3 className="text-lg font-semibold" style={{ color: theme.primary }}>
            Overtime (OT)
          </h3>
        </div>

        {/* System OT Summary */}
        <div className="mb-6 p-4 bg-blue-50 border rounded-lg" style={{ borderColor: theme.primary }}>
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-5 h-5" style={{ color: theme.primary }} />
            <h4 className="font-medium" style={{ color: theme.primary }}>
              Approved OT from System
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-foreground">Weekday:</span>
              <span className="ml-2 font-bold" style={{ color: theme.primary }}>
                {prefillData.calculated.weekday_ot_hours || 0} hours
              </span>
            </div>
            <div>
              <span className="text-foreground">Weekend:</span>
              <span className="ml-2 font-bold" style={{ color: theme.accent }}>
                {prefillData.calculated.weekend_ot_hours || 0} hours
              </span>
            </div>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">* OT hours from approved requests</div>
        </div>

        {/* Manual OT Entry Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
            <Plus className="w-5 h-5" style={{ color: theme.primary }} />
            <h4 className="text-base font-semibold text-foreground">Add Manual OT Hours</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <WeekdayOTCard
              hours={manualOT.weekday.hours}
              rate_per_hour={manualOT.weekday.rate_per_hour}
              onHoursChange={(value) => onManualOTChange("weekday", "hours", value)}
              onRatePerHourChange={(value) => onManualOTChange("weekday", "rate_per_hour", value)}
              theme={theme}
            />

            <WeekendOTCard
              hours={manualOT.weekend.hours}
              days={manualOT.weekend.days}
              rate_per_hour={manualOT.weekend.rate_per_hour}
              rate_per_day={manualOT.weekend.rate_per_day}
              onHoursChange={(value) => onManualOTChange("weekend", "hours", value)}
              onDaysChange={(value) => onManualOTChange("weekend", "days", value)}
              onRatePerHourChange={(value) => onManualOTChange("weekend", "rate_per_hour", value)}
              onRatePerDayChange={(value) => onManualOTChange("weekend", "rate_per_day", value)}
              theme={theme}
            />
          </div>

          {/* Summary and Action Buttons */}
          <div className="flex justify-between items-center mb-6 p-4 bg-muted border border-border rounded-lg">
            <div>
              <h5 className="font-bold text-foreground">Manual OT Summary</h5>
              <div className="text-sm text-muted-foreground mt-1">
                <div>Weekday: {manualOT.weekday.hours} hrs</div>
                <div>Weekend (hrs): {manualOT.weekend.hours} hrs</div>
                <div>Weekend (days): {manualOT.weekend.days} days</div>
                <div className="font-bold mt-1" style={{ color: theme.primary }}>
                  Total: ${totalAmount.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearManualOT}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive bg-background border border-destructive rounded-md hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
              <button
                onClick={addManualOTDetail}
                disabled={
                  (manualOT.weekday.hours === 0 && manualOT.weekend.hours === 0 && manualOT.weekend.days === 0) ||
                  (manualOT.weekday.hours > 0 && manualOT.weekday.rate_per_hour === 0) ||
                  (manualOT.weekend.hours > 0 && manualOT.weekend.rate_per_hour === 0) ||
                  (manualOT.weekend.days > 0 && manualOT.weekend.rate_per_day === 0)
                }
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
                style={{ backgroundColor: theme.primary }}
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
            <OtDetailsTable otDetails={manualOTDetails} title="Manual OT Entries" showDate={false} theme={theme} />
          </div>
        )}
      </div>
    </div>
  )
}

export const Step3AdditionalIncome: React.FC<StepComponentsProps> = ({ formData, onInputChange, theme = defaultTheme }) => {
  return (
    <div className="min-h-[600px]">
      <div>
        <div className="flex items-center gap-2 mb-4 pb-3 border-b-2" style={{ borderColor: theme.primary }}>
          <DollarSign className="w-5 h-5" style={{ color: theme.primary }} />
          <h3 className="text-lg font-semibold" style={{ color: theme.primary }}>
            Additional Income
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Bonus</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
              <input
                type="number"
                name="bonus"
                value={formData.bonus}
                onChange={onInputChange}
                className="w-full pl-8 pr-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Commission</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
              <input
                type="number"
                name="commission"
                value={formData.commission}
                onChange={onInputChange}
                className="w-full pl-8 pr-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Holiday Allowance</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
              <input
                type="number"
                name="money_not_spent_on_holidays"
                value={formData.money_not_spent_on_holidays}
                onChange={onInputChange}
                className="w-full pl-8 pr-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Other Income</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
              <input
                type="number"
                name="other_income"
                value={formData.other_income}
                onChange={onInputChange}
                className="w-full pl-8 pr-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 border rounded-md" style={{ borderColor: theme.primary }}>
          <p className="text-sm font-medium" style={{ color: theme.primary }}>
            Total Additional Income: ${(formData.bonus + formData.commission + formData.money_not_spent_on_holidays + formData.other_income).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}

export const Step4Deductions: React.FC<StepComponentsProps> = ({ formData, onInputChange, calculateTotalDeductions, theme = defaultTheme }) => {
  return (
    <div className="min-h-[600px]">
      <div>
        <div className="flex items-center gap-2 mb-4 pb-3 border-b-2" style={{ borderColor: theme.danger }}>
          <UserX className="w-5 h-5" style={{ color: theme.danger }} />
          <h3 className="text-lg font-semibold" style={{ color: theme.danger }}>
            Deductions
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Office Expenses</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
              <input
                type="number"
                name="office_expenses"
                value={formData.office_expenses}
                onChange={onInputChange}
                className="w-full pl-8 pr-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-destructive"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Social Security</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
              <input
                type="number"
                name="social_security"
                value={formData.social_security}
                onChange={onInputChange}
                className="w-full pl-8 pr-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-destructive"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Working Days</label>
            <input
              type="number"
              name="working_days"
              value={formData.working_days}
              onChange={onInputChange}
              min="0"
              max="31"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="mt-1 text-xs text-muted-foreground">Number of days worked this month</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={onInputChange}
              rows={3}
              placeholder="Additional notes or comments..."
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
        </div>
        <div className="mt-4 p-3 rounded-md" style={{ backgroundColor: theme.dangerLight, borderColor: theme.danger }}>
          <p className="text-sm font-medium" style={{ color: theme.danger }}>
            Total Deductions: ${calculateTotalDeductions().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}

export const Step5Summary: React.FC<StepComponentsProps> = ({ user, prefillData, formData, manualOTDetails, theme = defaultTheme }) => {
  const [svgRef, setSvgRef] = useState<HTMLDivElement | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailStatus, setEmailStatus] = useState<{
    success: boolean
    message: string
  } | null>(null)

  if (!prefillData) return null

  const allOTDetails = [...(prefillData.calculated.ot_details || []), ...(manualOTDetails || [])]

  const totalOTAmount = allOTDetails.reduce((sum, detail) => sum + detail.amount, 0)

  const currentDate = new Date()

  // Calculate additional income
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
  const totalAdditionalIncome = Object.values(additionalIncome).reduce((a, b) => a + b, 0)
  const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0)
  const totalIncome = prefillData.user.base_salary + totalAdditionalIncome
  const netSalary = totalIncome - totalDeductions

  // Extract name from user object
  const userName = `${user?.first_name_en || ""} ${user?.last_name_en || ""}`.trim()

  // Use actual email from user object
  const userEmail = user?.email || "employee@company.com"

  // Function to export as PNG
  const exportToPNG = async () => {
    if (!svgRef) return

    try {
      setIsExporting(true)
      const html2canvas = (await import("html2canvas")).default

      const canvas = await html2canvas(svgRef, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      })

      const link = document.createElement("a")
      const fileName = `salary-summary-${userName.replace(/\s+/g, "-")}-${getMonthName(formData.month)}-${formData.year}.png`

      link.download = fileName
      link.href = canvas.toDataURL("image/png")
      link.click()

      URL.revokeObjectURL(link.href)
    } catch (error) {
      console.error("Failed to export PNG:", error)
      alert("Failed to export PNG. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  // Function to send email with PNG attachment
  const sendEmailWithPNG = async () => {
    if (!svgRef) return

    try {
      setIsSendingEmail(true)
      setEmailStatus(null)

      // Convert to image
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(svgRef, {
        scale: 0.8,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      })

      // Convert to JPEG
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7)
      const base64String = dataUrl.split(",")[1]

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
        fileName: `salary-summary-${userName.replace(/\s+/g, "-")}.jpg`,
      }

      // API base URL
      const API_BASE_URL = "http://localhost:8000"

      // Send to backend API
      const response = await fetch(`${API_BASE_URL}/api/salary/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      })

      if (!response.ok) {
        let errorMessage = "Failed to send email"
        try {
          const errorData: EmailResponse = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const result: EmailResponse = await response.json()

      if (result.success) {
        setEmailStatus({
          success: true,
          message: `Salary summary sent to ${userEmail}`,
        })
      } else {
        throw new Error(result.message || "Failed to send email")
      }
    } catch (error: unknown) {
      console.error("Failed to send email:", error)
      setEmailStatus({
        success: false,
        message: `${error instanceof Error ? error.message : "Failed to send email"}`,
      })
    } finally {
      setIsSendingEmail(false)
    }
  }

  return (
    <div className="min-h-[600px]">
      <div>
        {/* Header with buttons */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2" style={{ borderColor: theme.primary }}>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5" style={{ color: theme.primary }} />
            <h3 className="text-lg font-semibold" style={{ color: theme.primary }}>
              Salary Summary
            </h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportToPNG}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-background border rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
              style={{ borderColor: theme.primary, color: theme.primary }}
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isExporting ? "Exporting..." : "Export PNG"}
            </button>
            <button
              onClick={sendEmailWithPNG}
              disabled={isSendingEmail}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: theme.success }}
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
            className="mb-4 p-3 rounded-md border"
            style={{
              backgroundColor: emailStatus.success ? theme.successLight : theme.dangerLight,
              borderColor: emailStatus.success ? theme.success : theme.danger,
            }}
          >
            <div className="font-medium" style={{ color: emailStatus.success ? theme.success : theme.danger }}>
              {emailStatus.success ? "✓ Success!" : "✗ Error"}
            </div>
            <div className="text-sm" style={{ color: emailStatus.success ? theme.success : theme.danger }}>
              {emailStatus.message}
            </div>
          </div>
        )}

        {/* Email Info */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="text-sm" style={{ color: theme.primary }}>
            <div className="font-medium mb-1">Email will be sent to:</div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{userEmail}</span>
            </div>
          </div>
        </div>

        {/* Salary Summary Content */}
        <div ref={setSvgRef} className="border border-border rounded-lg p-6 bg-background">
          {/* Header */}
          <div className="text-center mb-8 border-b border-border pb-4">
            <h1 className="text-2xl font-bold" style={{ color: theme.primary }}>
              Salary Summary
            </h1>
            <p className="text-muted-foreground mt-1">
              {getMonthName(formData.month)} {formData.year}
            </p>
          </div>

          {/* Employee Information */}
          <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
            <h3 className="font-bold mb-3" style={{ color: theme.primary }}>
              Employee Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <span className="ml-2 font-medium text-foreground">{userName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <span className="ml-2 font-medium text-foreground">{userEmail}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Base Salary:</span>
                <span className="ml-2 font-bold" style={{ color: theme.primary }}>
                  ${formatCurrency(prefillData.user.base_salary)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Working Days:</span>
                <span className="ml-2 font-medium text-foreground">{formData.working_days || 0} days</span>
              </div>
            </div>
          </div>

          {/* Salary Table */}
          <div className="overflow-x-auto mb-8">
            <table className="min-w-full border border-border text-sm">
              <thead>
                <tr style={{ backgroundColor: theme.primary }} className="text-white">
                  <th className="p-3 border border-border text-left font-medium">Income</th>
                  <th className="p-3 border border-border text-left font-medium">Additional Income</th>
                  <th className="p-3 border border-border text-left font-medium">Amount</th>
                  <th className="p-3 border border-border text-left font-medium">Deductions</th>
                  <th className="p-3 border border-border text-left font-medium">Amount</th>
                  <th className="p-3 border border-border text-left font-medium">Payment Date</th>
                </tr>
              </thead>
              <tbody>
                {/* Base Salary Row */}
                <tr className="bg-background">
                  <td className="p-3 border border-border text-foreground">Base Salary</td>
                  <td className="p-3 border border-border text-foreground">-</td>
                  <td className="p-3 border border-border font-bold text-foreground">${formatCurrency(prefillData.user.base_salary)}</td>
                  <td className="p-3 border border-border text-foreground">Absence</td>
                  <td className="p-3 border border-border text-foreground">-</td>
                  <td className="p-3 border border-border font-bold text-center text-foreground" rowSpan={7}>
                    {formatDate(currentDate)}
                  </td>
                </tr>

                {/* Additional Income Rows */}
                <tr className="bg-background">
                  <td className="p-3 border border-border text-foreground" rowSpan={6}>
                    Additional Income
                  </td>
                  <td className="p-3 border border-border text-foreground">Fuel Costs</td>
                  <td className="p-3 border border-border text-foreground">${formatCurrency(additionalIncome.fuel)}</td>
                  <td className="p-3 border border-border text-foreground" rowSpan={2}>
                    Social Security
                  </td>
                  <td className="p-3 border border-border text-foreground" rowSpan={2}>
                    ${formatCurrency(deductions.socialSecurity)}
                  </td>
                </tr>
                <tr className="bg-background">
                  <td className="p-3 border border-border text-foreground">Commission</td>
                  <td className="p-3 border border-border text-foreground">${formatCurrency(additionalIncome.commission)}</td>
                </tr>
                <tr className="bg-background">
                  <td className="p-3 border border-border text-foreground">Overtime (OT)</td>
                  <td className="p-3 border border-border text-foreground">${formatCurrency(additionalIncome.ot)}</td>
                  <td className="p-3 border border-border" colSpan={2}></td>
                </tr>
                <tr className="bg-background">
                  <td className="p-3 border border-border text-foreground">Bonus</td>
                  <td className="p-3 border border-border text-foreground">${formatCurrency(additionalIncome.bonus)}</td>
                  <td className="p-3 border border-border" colSpan={2}></td>
                </tr>
                <tr className="bg-background">
                  <td className="p-3 border border-border text-foreground">Holiday Allowance</td>
                  <td className="p-3 border border-border text-foreground">${formatCurrency(additionalIncome.holidayAllowance)}</td>
                  <td className="p-3 border border-border" colSpan={2}></td>
                </tr>
                <tr className="bg-background">
                  <td className="p-3 border border-border text-foreground">Other</td>
                  <td className="p-3 border border-border text-foreground">${formatCurrency(additionalIncome.other)}</td>
                  <td className="p-3 border border-border" colSpan={2}></td>
                </tr>

                {/* Totals Row */}
                <tr className="bg-muted font-bold">
                  <td className="p-3 border border-border text-right text-foreground" colSpan={2}>
                    Total Income:
                  </td>
                  <td className="p-3 border border-border text-foreground">${formatCurrency(totalIncome)}</td>
                  <td className="p-3 border border-border text-right text-foreground" colSpan={1}>
                    Total Deductions:
                  </td>
                  <td className="p-3 border border-border text-foreground">${formatCurrency(totalDeductions)}</td>
                  <td className="p-3 border border-border"></td>
                </tr>

                {/* Net Salary Row */}
                <tr style={{ backgroundColor: theme.primary }} className="text-white font-bold">
                  <td className="p-4 border border-border text-center text-lg" colSpan={4}>
                    NET SALARY:
                  </td>
                  <td className="p-4 border border-border text-center text-xl" colSpan={2}>
                    ${formatCurrency(netSalary)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Additional Information */}
          <div className="p-4 bg-muted rounded-lg border border-border">
            <h3 className="font-bold mb-3" style={{ color: theme.primary }}>
              Additional Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground">Working Days:</span>
                <span className="ml-2 font-medium text-foreground">{formData.working_days || 0} days</span>
              </div>
              <div>
                <span className="text-muted-foreground">Vacation Days Left:</span>
                <span className="ml-2 font-medium text-foreground">{prefillData.calculated.remaining_vacation_days || 0} days</span>
              </div>
              <div>
                <span className="text-muted-foreground">OT Hours:</span>
                <span className="ml-2 font-medium text-foreground">{prefillData.calculated.ot_hours || 0} hours</span>
              </div>
              <div>
                <span className="text-muted-foreground">Day Off Days:</span>
                <span className="ml-2 font-medium text-foreground">{prefillData.calculated.day_off_days_this_month || 0} days</span>
              </div>
            </div>
            {formData.notes && (
              <div className="mt-4 p-3 bg-background rounded-md border border-border">
                <span className="font-medium text-foreground">Notes:</span>
                <p className="mt-1 text-muted-foreground">{formData.notes}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-border text-center text-muted-foreground text-sm">
            <p>Generated on {new Date().toLocaleDateString()} • This is an official salary statement</p>
          </div>
        </div>
      </div>
    </div>
  )
}
