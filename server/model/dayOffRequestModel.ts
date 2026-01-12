import mongoose, { Schema, Document, Types } from "mongoose";

export interface IDayOffRequest extends Document {
  user_id: Types.ObjectId;
  supervisor_id: Types.ObjectId;
  day_off_type: "FULL_DAY" | "HALF_DAY";
  start_date_time: Date;
  end_date_time: Date;
  date_off_number: number; // ✅ FIXED
  title: "OT" | "FIELD_WORK" | "DAY_OFF";
  reason: string;
  status: "Pending" | "Accept" | "Reject";
  created_at: Date;
}

const dayOffRequestSchema = new Schema<IDayOffRequest>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  supervisor_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  day_off_type: {
    type: String,
    enum: ["FULL_DAY", "HALF_DAY"],
    required: true,
  },

  start_date_time: {
    type: Date,
    required: true,
  },

  end_date_time: {
    type: Date,
    required: true,
  },

  date_off_number: {
    type: Number,
    required: true,
    min: 0.5,
    immutable: true, // ✅ STRONGLY RECOMMENDED
  },

  title: {
    type: String,
    enum: ["OT", "FIELD_WORK", "DAY_OFF"],
    default: "DAY_OFF",
  },

  reason: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
  },

  status: {
    type: String,
    enum: ["Pending", "Accept", "Reject"],
    default: "Pending",
  },

  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IDayOffRequest>(
  "DayOffRequest",
  dayOffRequestSchema
);
