import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  
  name: string;
  lastname: string;
  email: string;
  password: string;
  role: "Admin" | "Supervisor" | "Employee";
  position: "IT" | "CONTENT" | "SSD";
  department: "CX" | "LCC" | "DDS";
  base_salary: number;
  start_date: Date;
  status: "Active" | "Inactive" | "On Leave";
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Admin", "Supervisor", "Employee"],
      required: true,
    },
    position: {
      type: String,
      enum: ["IT", "CONTENT", "SSD"],
      required: true,
    },
    department: {
      type: String,
      enum: ["CX", "LCC", "DDS"],
      required: true,
    },
    base_salary: {
      type: Number,
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "On Leave"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", userSchema);