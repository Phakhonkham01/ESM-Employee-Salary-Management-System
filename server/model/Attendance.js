const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },

  date: {
    type: Date,
    required: true
  },

  checkIn: Date,
  checkOut: Date,

  workingHours: {
    type: Number,
    default: 0
  },

  otHours: {
    type: Number,
    default: 0
  },

  otType: {
    type: String,
    enum: ["NONE", "WEEKDAY", "WEEKEND", "HOLIDAY"],
    default: "NONE"
  },

  status: {
    type: String,
    enum: ["PRESENT", "ABSENT", "LEAVE"],
    default: "PRESENT"
  },

  note: String,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", AttendanceSchema);
