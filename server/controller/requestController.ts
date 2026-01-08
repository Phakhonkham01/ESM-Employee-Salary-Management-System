import { Request, Response } from "express";
import RequestModel from "../model/requestModel.js";

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
      date,
      title,
      start_hour,
      end_hour,
      reason,
    } = req.body;

    if (!user_id || !date || !title || start_hour == null || end_hour == null) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const newRequest = await RequestModel.create({
      user_id,
      date,
      title,
      start_hour,
      end_hour,
      reason: reason || "",
      status: "ລໍຖ້າ",
    });

    res.status(201).json({
      message: "Request submitted successfully",
      request: newRequest,
    });
  } catch (error) {
    console.error(error);
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

    if (!["ລໍຖ້າ", "ອະນຸມັດ", "ປະຕິເສດ"].includes(status)) {
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
