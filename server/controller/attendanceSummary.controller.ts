import { Request, Response } from "express";
import mongoose from "mongoose";
import AttendanceSummary from "../model/AttendanceSummary.js";
import User from "../model/userModel";


// Create summary
export const createSummary = async (req: Request, res: Response) => {
  try {
    const { user_id, year, month, ot_hours, working_hours, attendance_days, leave_days } = req.body;

    if (!user_id || year === undefined || month === undefined) {
      return res.status(400).json({ message: "user_id, year and month are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({ message: "Invalid user_id" });
    }

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const exists = await AttendanceSummary.findOne({ user_id, year, month });
    if (exists) {
      return res.status(409).json({ message: "Summary already exists for this user/month" });
    }

    const summary = new AttendanceSummary({
      user_id,
      year: Number(year),
      month: Number(month),
      ot_hours: Number(ot_hours || 0),
      working_hours: Number(working_hours || 0),
      attendance_days: Number(attendance_days || 0),
      leave_days: Number(leave_days || 0)
    });

    await summary.save();
    res.status(201).json(summary);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Duplicate summary" });
    }
    res.status(500).json({ message: "Error creating summary", error });
  }
};

// Get all summaries
export const getAllSummaries = async (_req: Request, res: Response) => {
  try {
    const summaries = await AttendanceSummary.find().sort({ year: -1, month: -1 });
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching summaries", error });
  }
};


// Get summary by ID
export const getSummaryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const summary = await AttendanceSummary.findById(id);
    if (!summary) return res.status(404).json({ message: "Summary not found" });
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: "Error fetching summary", error });
  }
};


// Get summaries by user ID
export const getSummaryByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const summaries = await AttendanceSummary.find({ user_id: userId }).sort({ year: -1, month: -1 });
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data", error });
  }
};

// Update summary
export const updateSummary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const updated = await AttendanceSummary.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: "Summary not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Update failed", error });
  }
};

// Delete summary
export const deleteSummary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const deleted = await AttendanceSummary.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Summary not found" });
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error });
  }
};
