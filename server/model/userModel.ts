import mongoose, { Document, Schema } from "mongoose";


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
  vacation_days: number;
  gender: "Male" | "Female" | "Other";
  position_id?: mongoose.Types.ObjectId;  
  // เปลี่ยนจาก ObjectId เดียว เป็น Array ของ ObjectId
  department_id: mongoose.Types.ObjectId[];
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
  vacation_stats?: {
    total_absent_days: number;
    last_calculation_date: Date;
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
    required: false,
  },
department_id: [{  // ✅ เปลี่ยนเป็น Array ของ Object อย่างชัดเจน
    type: Schema.Types.ObjectId,
    ref: "Department",
    required: false,
  }],
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
  vacation_stats: {
    total_absent_days: { type: Number, default: 0 },
    last_calculation_date: { type: Date }
  }
}, { 
  timestamps: true
});


// 添加中间件来处理 Supervisor 的特殊情况
userSchema.pre('validate', function(next) {
  // ถ้าข้อมูลส่งมาเป็นค่าเดียว (ไม่ใช่ Array) ให้ครอบด้วย []
  if (this.department_id && !Array.isArray(this.department_id)) {
    this.department_id = [this.department_id as any];
  }
  
  if (this.role === 'Supervisor') {
    if (!this.position_id) {
      this.position_id = undefined;
    }
  }
  // สำหรับ Employee/Admin เราก็เก็บเป็น Array ที่มีสมาชิก 1 ตัว [ID] 
  // เพื่อให้ Logic การดึงข้อมูล (Populate) ทำงานเหมือนกันทัังระบบ
  next();
});
const User = mongoose.model<IUser>("User", userSchema);
export default User;