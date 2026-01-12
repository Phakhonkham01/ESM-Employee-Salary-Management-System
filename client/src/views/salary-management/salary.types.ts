export interface SalaryFormData {
  user_id: string;
  month?: number;
  year?: number;
  bonus: number;
  commission: number;
  money_not_spent_on_holidays: number;
  other_income: number;
  office_expenses: number;
  social_security: number;
  working_days: number;
  notes?: string;
}

export interface PrefillData {
  user: {
    _id: string;
    name: string;
    base_salary: number;
    vacation_days: number;
  };
  calculated: {
    ot_amount: number;
    fuel_costs: number;
    day_off_days: number;
    remaining_vacation_days: number;
    vacation_color: 'red' | 'yellow' | 'green';
  };
  month: number;
  year: number;
}

export interface Salary {
  _id: string;
  user_id: {
    _id: string;
    first_name_en: string;
    last_name_en: string;
    email: string;
    base_salary?: number;
    vacation_days?: number;
  };
  month: number;
  year: number;
  base_salary: number;
  ot_amount: number;
  bonus: number;
  commission: number;
  fuel_costs: number;
  money_not_spent_on_holidays: number;
  other_income: number;
  office_expenses: number;
  social_security: number;
  working_days: number;
  day_off_days: number;
  remaining_vacation_days: number;
  payment_date: string;
  net_salary: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  created_by: {
    _id: string;
    first_name_en: string;
    last_name_en: string;
  };
  notes?: string;
  created_at: string;
  updated_at: string;
}