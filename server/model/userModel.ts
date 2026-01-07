import mongoose, { Document, Schema } from "mongoose";

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
  position_id: string;
  department_id: string;
  status: "Active" | "Inactive" | "On Leave";
  created_at: Date;
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
  first_name_en: {
    type: String,
    required: true,
  },
  last_name_en: {
    type: String,
    required: true,
  },
  nickname_en: {
    type: String,
    required: true,
  },
  first_name_la: {
    type: String,
    required: true,
  },
  last_name_la: {
    type: String,
    required: true,
  },
  nickname_la: {
    type: String,
    required: true,
  },
  date_of_birth: {
    type: Date,
    required: true,
  },
  start_work: {
    type: Date,
    required: true,
  },
  vacation_days: {
    type: Number,
    default: 0,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  position_id: {
    type: String,
    required: true,
  },
  department_id: {
    type: String,
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
});

const User = mongoose.model<IUser>("User", userSchema);
export default User;