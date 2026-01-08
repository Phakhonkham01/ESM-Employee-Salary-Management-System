import mongoose, { Schema, Document } from "mongoose";

export interface IDepartment extends Document {
  department_name: string;
  created_at: Date;
}

const DepartmentSchema: Schema = new Schema(
  {
    department_name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model<IDepartment>(
  "Department",
  DepartmentSchema
);
