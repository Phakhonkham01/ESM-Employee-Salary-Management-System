import mongoose, { Schema, Document } from "mongoose";

export interface IAttendanceSummary extends Document {
  user_id: mongoose.Types.ObjectId;
  year: number;
  month: number;
  ot_hours: number;
  attendance_days: number;
  leave_days: number;
  created_at: Date;
}

const AttendanceSummarySchema = new Schema<IAttendanceSummary>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  ot_hours: {
    type: Number,
    default: 0
  },
  attendance_days: {
    type: Number,
    default: 0
  },
  leave_days: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: () => new Date()
  }
});

AttendanceSummarySchema.index({ user_id: 1, year: 1, month: 1 }, { unique: true });

export const AttendanceSummary = mongoose.model<IAttendanceSummary>(
  "AttendanceSummary",
  AttendanceSummarySchema
);

export default AttendanceSummary;
