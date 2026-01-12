import mongoose, { Schema, Document } from 'mongoose';

export interface ISalary extends Document {
  user_id: mongoose.Types.ObjectId;
  month: number; // 1-12
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
  payment_date: Date;
  net_salary: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  created_by: mongoose.Types.ObjectId;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

const salarySchema = new Schema<ISalary>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true
    },
    base_salary: {
      type: Number,
      required: true,
      default: 0
    },
    ot_amount: {
      type: Number,
      default: 0
    },
    bonus: {
      type: Number,
      default: 0
    },
    commission: {
      type: Number,
      default: 0
    },
    fuel_costs: {
      type: Number,
      default: 0
    },
    money_not_spent_on_holidays: {
      type: Number,
      default: 0
    },
    other_income: {
      type: Number,
      default: 0
    },
    office_expenses: {
      type: Number,
      default: 0
    },
    social_security: {
      type: Number,
      default: 0
    },
    working_days: {
      type: Number,
      default: 0
    },
    day_off_days: {
      type: Number,
      default: 0
    },
    remaining_vacation_days: {
      type: Number,
      default: 0
    },
    payment_date: {
      type: Date,
      default: Date.now
    },
    net_salary: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'paid', 'cancelled'],
      default: 'pending'
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    notes: {
      type: String
    },
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

// Compound index เพื่อป้องกันการบันทึกซ้ำสำหรับ user เดียวกันในเดือน/ปีเดียวกัน
salarySchema.index({ user_id: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model<ISalary>('Salary', salarySchema);