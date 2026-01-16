import mongoose, { Document, Schema } from "mongoose";

// 1. สร้าง Schema สำหรับบันทึกประวัติการอัพเดทวันลา
const vacationDayUpdateSchema: Schema = new Schema({
  old_vacation_days: { 
    type: Number, 
    required: true 
  },
  new_vacation_days: { 
    type: Number, 
    required: true 
  },
  updated_by: { 
    type: Schema.Types.ObjectId, 
    ref: "User" 
  },
  update_reason: { 
    type: String 
  },
  updated_at: { 
    type: Date, 
    default: Date.now 
  }
});

export interface IUser extends Document {
  email: string;
  password: string;
  role: "Supervisor" | "Admin" | "Employee";
  first_name_en: string;
  last_name_en: string;
  nickname_en: string;
  first_name_la: string;
  last_name_la: string;
  nickname_la: string;
  date_of_birth: Date;
  start_work: Date;
  vacation_days: number; // สามารถติดลบได้
  gender: "Male" | "Female" | "Other";
  position_id: mongoose.Types.ObjectId;
  department_id: mongoose.Types.ObjectId;
  status: "Active" | "Inactive" | "On Leave";
  base_salary: number;
  created_at: Date;
  employee_id: string;
  vacation_day_updates: Array<{
    old_vacation_days: number;
    new_vacation_days: number;
    updated_by: mongoose.Types.ObjectId;
    update_reason: string;
    updated_at: Date;
  }>;
  // เพิ่มฟิลด์สำหรับติดตามสถิติ
  vacation_stats?: {
    total_absent_days: number;  // รวมวันขาดทั้งหมด
    last_calculation_date: Date; // วันที่คำนวณล่าสุด
  };
}

const userSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["Supervisor", "Admin", "Employee"],
    default: "Employee",
  },
  first_name_en: { type: String, required: true },
  last_name_en: { type: String, required: true },
  nickname_en: { type: String, required: true },
  first_name_la: { type: String, required: true },
  last_name_la: { type: String, required: true },
  nickname_la: { type: String, required: true },
  date_of_birth: { type: Date, required: true },
  start_work: { type: Date, required: true },
  vacation_days: { 
    type: Number, 
    default: 0,
    // เอา min: 0 ออกเพื่อให้สามารถติดลบได้
  },
  base_salary: {
    type: Number,
    default: 0,
    min: 0,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  position_id: {
    type: Schema.Types.ObjectId,
    ref: "Position",
    required: true,
  },
  department_id: {
    type: Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  status: {
    type: String,
    enum: ["Active", "Inactive", "On Leave"],
    default: "Active",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  employee_id: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  vacation_day_updates: [vacationDayUpdateSchema],
  // เพิ่มฟิลด์สำหรับสถิติ
  vacation_stats: {
    total_absent_days: { type: Number, default: 0 },
    last_calculation_date: { type: Date }
  }
}, { 
  timestamps: true
});

const User = mongoose.model<IUser>("User", userSchema);
export default User;