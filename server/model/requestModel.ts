import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRequest extends Document {
  user_id: Types.ObjectId;
  date: Date;
  title: "OT" | "FIELD_WORK";
  start_hour: number; // decimal e.g. 8.5
  end_hour: number;   // decimal e.g. 17.0
  reason?: string;
  status: "ລໍຖ້າ" | "ອະນຸມັດ" | "ປະຕິເສດ";
  created_at: Date;
}

const requestSchema = new Schema<IRequest>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  title: {
    type: String,
    enum: ["OT", "FIELD_WORK"],
    required: true,
  },
  start_hour: {
    type: Number,
    required: true,
  },
  end_hour: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    default: "", // ✅ reason can be empty
  },
  status: {
    type: String,
    enum: ["ລໍຖ້າ", "ອະນຸມັດ", "ປະຕິເສດ"],
    default: "ລໍຖ້າ", // ✅ default value
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IRequest>("Request", requestSchema);
