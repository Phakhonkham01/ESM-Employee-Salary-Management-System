import type React from "react"

// Theme configuration for customizable styling
export interface SalaryTheme {
  primary: string
  primaryHover: string
  primaryText: string
  accent: string
  accentText: string
  danger: string
  dangerLight: string
  success: string
  successLight: string
}

export const defaultTheme: SalaryTheme = {
  primary: "#1F3A5F",
  primaryHover: "#2d4a6f",
  primaryText: "#1F3A5F",
  accent: "#D97706",
  accentText: "#92400E",
  danger: "#DC2626",
  dangerLight: "#FEE2E2",
  success: "#059669",
  successLight: "#D1FAE5",
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

export interface PrefillData {
  user: {
    base_salary: number
    name?: string
  }
  calculated: {
    remaining_vacation_days: number
    ot_hours: number
    day_off_days: number
    fuel_costs: number
    ot_amount: number
    weekday_ot_hours?: number
    weekend_ot_hours?: number
    day_off_days_this_month?: number
    used_vacation_days_this_year?: number
    total_vacation_days?: number
    exceed_days?: number
    vacation_color?: string
    ot_details?: OTDetail[]
  }
}

export interface SalaryFormData {
  user_id: string
  month: number
  year: number
  working_days: number
  bonus: number
  commission: number
  money_not_spent_on_holidays: number
  other_income: number
  social_security: number
  office_expenses: number
  salary: number
  fuel_costs: number
  notes: string
}

export interface ManualOTState {
  weekday: {
    hours: number
    rate_per_hour: number
  }
  weekend: {
    hours: number
    days: number
    rate_per_hour: number
    rate_per_day: number
  }
}

export interface OTDetail {
  date?: string
  ot_type: "weekday" | "weekend"
  start_hour?: string
  end_hour?: string
  total_hours: number
  days?: number
  hourly_rate?: number
  rate_per_day?: number
  amount: number
}

export interface UserInfo {
  email: string
  first_name_en: string
  last_name_en: string
}

export interface SalaryCalculatorProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  user: UserInfo & { _id: string }
  month: number
  year: number
}

export interface SystemOTDetail {
  date?: string
  title?: string
  start_hour?: string
  end_hour?: string
  total_hours: number
  ot_type: "weekday" | "weekend"
  hourly_rate?: number
  days?: number
  rate_per_day?: number
  amount: number
  description?: string
  is_manual?: boolean
}

export interface StepComponentsProps {
  user: UserInfo
  month: number
  year: number
  prefillData: PrefillData | null
  formData: SalaryFormData
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  calculateTotalIncome: () => number
  calculateTotalDeductions: () => number
  calculateNetSalary: () => number
  manualOT: ManualOTState
  onManualOTChange: (type: "weekday" | "weekend", field: string, value: string) => void
  manualOTDetails: OTDetail[]
  addManualOTDetail: () => void
  clearManualOT: () => void
  calculateManualOTSummary: () => {
    totalHours: number
    totalWeekendDays: number
    totalAmount: number
  }
  theme?: SalaryTheme
}
