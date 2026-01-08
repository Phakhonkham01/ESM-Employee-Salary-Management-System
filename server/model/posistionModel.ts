import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPosition extends Document {
  department_id: Types.ObjectId;
  position_name: string;
  created_at: Date;
}

const PositionSchema: Schema = new Schema(
  {
    department_id: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    position_name: {
      type: String,
      required: true,
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

export default mongoose.model<IPosition>(
  "Position",
  PositionSchema
);
