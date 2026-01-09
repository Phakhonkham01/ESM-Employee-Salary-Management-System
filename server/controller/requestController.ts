import { Request, Response } from "express";
import RequestModel from "../model/requestModel.js";

/**
 * Helpers
 */

// Allow 00:00 → 23:59 and special case 24:00
const isValidTime = (time: string): boolean => {
  if (time === "24:00") return true;
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(time);
};

const toMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

/**
 * Create OT / Field Work Request
 */
export const createRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      user_id,
      supervisor_id,
      date,
      title,
      start_hour,
      end_hour,
      reason,
    } = req.body;

    // Required fields
    if (
      !user_id ||
      !supervisor_id ||
      !date ||
      !title ||
      !start_hour ||
      !end_hour
    ) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    // Time format validation
    if (!isValidTime(start_hour) || !isValidTime(end_hour)) {
      res.status(400).json({ message: "Invalid time format (HH:mm)" });
      return;
    }

    // Time order validation
    if (toMinutes(end_hour) <= toMinutes(start_hour)) {
      res.status(400).json({
        message: "End time must be later than start time",
      });
      return;
    }

    const newRequest = await RequestModel.create({
      user_id,
      supervisor_id,
      date,
      title,
      start_hour, // "08:00"
      end_hour,   // "17:00"
      reason,
      status: "Pending",
    });

    res.status(201).json({
      message: "Request submitted successfully",
      request: newRequest,
    });
  } catch (error: any) {
    console.error("CREATE REQUEST ERROR:", error);

    // Return validation errors properly
    if (error.name === "ValidationError") {
      res.status(400).json({ message: error.message });
      return;
    }

    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get requests by user
 */
export const getRequestsByUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    const requests = await RequestModel.find({ user_id: userId })
      .sort({ created_at: -1 });

    res.status(200).json({ requests });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update request status (Admin / Supervisor)
 */
export const updateRequestStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "Accept", "Reject"].includes(status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }

    const updated = await RequestModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ message: "Request not found" });
      return;
    }

    res.status(200).json({
      message: "Status updated",
      request: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
