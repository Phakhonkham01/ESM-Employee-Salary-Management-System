// interfaces.ts

// Interface สำหรับข้อมูลฟอร์ม
export interface SalaryFormData {
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

// Interface สำหรับ Manual OT Entry แบบใหม่
export interface ManualOTEntry {
    type: 'weekday' | 'weekend'
    hours: number // สำหรับวันทำงานปกติ (ชั่วโมง)
    days: number // สำหรับเสาร์-อาทิตย์ (วัน) 0.5, 1, 2, ...
    rate_per_hour: number // ค่าจ้างต่อชั่วโมง (วันทำงานปกติ)
    rate_per_day: number // ค่าจ้างต่อวัน (เสาร์-อาทิตย์)
    amount: number
    description?: string
}

// Interface สำหรับ OT จากระบบ
export interface SystemOTDetail {
    date: string
    title: string
    start_hour: string
    end_hour: string
    total_hours: number
    ot_type: 'weekday' | 'weekend'
    request_id?: string
    is_manual?: boolean
}

// Interface สำหรับข้อมูลพรีฟิล
export interface PrefillData {
    user: {
        _id: string
        name: string
        base_salary: number
        vacation_days: number
    }
    calculated: {
        ot_amount: number
        ot_hours: number
        ot_details: SystemOTDetail[]
        fuel_costs: number
        day_off_days: number
        remaining_vacation_days: number
        vacation_color: 'red' | 'yellow' | 'green'
        // แยกชั่วโมงตามประเภท
        weekday_ot_hours: number
        weekend_ot_hours: number
    }
    month: number
    year: number
}

// Interface สำหรับ Manual OT State แบบใหม่
export interface ManualOTState {
    weekday: {
        hours: number // จำนวนชั่วโมง OT วันทำงานปกติ
        rate_per_hour: number // ค่าจ้างต่อชั่วโมง
    }
    weekend: {
        days: number // จำนวนวัน OT เสาร์-อาทิตย์ (0.5, 1, 2, ...)
        rate_per_day: number // ค่าจ้างต่อวัน
    }
}

// Interface สำหรับ Props
export interface SalaryCalculatorProps {
    open: boolean
    onClose: () => void
    onSuccess: () => void
    user: any
    month: number
    year: number
}