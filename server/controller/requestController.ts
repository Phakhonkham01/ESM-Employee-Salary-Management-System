// ==================== requestController.ts ====================
import { Request, Response } from "express";
import RequestModel from "../model/requestModel.js";
import mongoose from "mongoose";

/**
 * CREATE - Submit new OT/Field Work request
 * POST /api/requests
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

    // Validation
    if (!user_id || !supervisor_id || !date || !title || start_hour == null || end_hour == null) {
      res.status(400).json({ 
        message: "Missing required fields",
        requests: []
      });
      return;
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(user_id) || !mongoose.Types.ObjectId.isValid(supervisor_id)) {
      res.status(400).json({ 
        message: "Invalid user_id or supervisor_id",
        requests: []
      });
      return;
    }

    // Validate title enum
    if (!["OT", "FIELD_WORK"].includes(title)) {
      res.status(400).json({ 
        message: "Invalid title. Must be 'OT' or 'FIELD_WORK'",
        requests: []
      });
      return;
    }

    // Validate hours
    if (start_hour < 0 || end_hour < 0 || start_hour >= end_hour) {
      res.status(400).json({ 
        message: "Invalid start_hour or end_hour",
        requests: []
      });
      return;
    }

    const newRequest = await RequestModel.create({
      user_id,
      supervisor_id,
      date,
      title,
      start_hour,
      end_hour,
      reason: reason || "",
      status: "Pending",
    });

    const populatedRequest = await RequestModel.findById(newRequest._id)
      .populate("user_id", "first_name_en last_name_en email")
      .populate("supervisor_id", "first_name_en last_name_en email");

    res.status(201).json({
      message: "Request submitted successfully",
      request: populatedRequest,
    });
  } catch (error: any) {
    console.error("Error creating request:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      requests: []
    });
  }
};

/**
 * READ - Get all requests (Admin only)
 * GET /api/requests
 */
export const getAllRequests = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status, title, startDate, endDate } = req.query;

    // Build filter object
    const filter: any = {};

    if (status && ["Pending", "Accept", "Reject"].includes(status as string)) {
      filter.status = status;
    }

    if (title && ["OT", "FIELD_WORK"].includes(title as string)) {
      filter.title = title;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    const requests = await RequestModel.find(filter)
      .populate("user_id", "first_name_en last_name_en first_name_la last_name_la email nickname_en nickname_la")
      .populate("supervisor_id", "first_name_en last_name_en email")
      .sort({ created_at: -1 });

    res.status(200).json({
      message: "Requests retrieved successfully",
      count: requests.length,
      requests,
    });
  } catch (error: any) {
    console.error("Error fetching all requests:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      requests: []
    });
  }
};

/**
 * READ - Get requests by user ID
 * GET /api/requests/user/:userId
 */
export const getRequestsByUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ 
        message: "Invalid userId",
        requests: []
      });
      return;
    }

    const requests = await RequestModel.find({ user_id: userId })
      .populate("supervisor_id", "first_name_en last_name_en email")
      .sort({ created_at: -1 });

    res.status(200).json({
      message: "User requests retrieved successfully",
      count: requests.length,
      requests,
    });
  } catch (error: any) {
    console.error("Error fetching user requests:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      requests: []
    });
  }
};

/**
 * READ - Get requests by supervisor ID
 * GET /api/requests/supervisor/:supervisorId
 */
export const getRequestsBySupervisor = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { supervisorId } = req.params;

    console.log('🔄 Fetching requests for supervisor:', supervisorId);

    if (!mongoose.Types.ObjectId.isValid(supervisorId)) {
      res.status(400).json({ 
        message: "Invalid supervisorId",
        requests: []
      });
      return;
    }

    const requests = await RequestModel.find({ supervisor_id: supervisorId })
      .populate({
        path: 'user_id',
        select: 'first_name_en last_name_en first_name_la last_name_la email nickname_en nickname_la'
      })
      .sort({ created_at: -1 });

    console.log('✅ Found requests:', requests.length);

    res.status(200).json({
      message: "Supervisor requests retrieved successfully",
      count: requests.length,
      requests,
    });
    
  } catch (error: any) {
    console.error("❌ Error fetching supervisor requests:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      requests: []
    });
  }
};

/**
 * READ - Get single request by ID
 * GET /api/requests/:id
 */
export const getRequestById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ 
        message: "Invalid request ID",
        requests: []
      });
      return;
    }

    const request = await RequestModel.findById(id)
      .populate("user_id", "first_name_en last_name_en first_name_la last_name_la email nickname_en nickname_la")
      .populate("supervisor_id", "first_name_en last_name_en email");

    if (!request) {
      res.status(404).json({ 
        message: "Request not found",
        requests: []
      });
      return;
    }

    res.status(200).json({
      message: "Request retrieved successfully",
      request,
    });
  } catch (error: any) {
    console.error("Error fetching request:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      requests: []
    });
  }
};

/**
 * UPDATE - Update request status (Supervisor/Admin)
 * PUT /api/requests/:id/status
 */
export const updateRequestStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ 
        message: "Invalid request ID",
        requests: []
      });
      return;
    }

    if (!["Pending", "Accept", "Reject"].includes(status)) {
      res.status(400).json({ 
        message: "Invalid status. Must be 'Pending', 'Accept', or 'Reject'",
        requests: []
      });
      return;
    }

    const updated = await RequestModel.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
      .populate("user_id", "first_name_en last_name_en email")
      .populate("supervisor_id", "first_name_en last_name_en email");

    if (!updated) {
      res.status(404).json({ 
        message: "Request not found",
        requests: []
      });
      return;
    }

    res.status(200).json({
      message: `Request status updated to ${status}`,
      request: updated,
    });
  } catch (error: any) {
    console.error("Error updating request status:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      requests: []
    });
  }
};

/**
 * UPDATE - Update entire request (User can edit before approval)
 * PUT /api/requests/:id
 */
export const updateRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { date, title, start_hour, end_hour, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ 
        message: "Invalid request ID",
        requests: []
      });
      return;
    }

    // Find the request first
    const existingRequest = await RequestModel.findById(id);

    if (!existingRequest) {
      res.status(404).json({ 
        message: "Request not found",
        requests: []
      });
      return;
    }

    // Only allow editing if status is Pending
    if (existingRequest.status !== "Pending") {
      res.status(400).json({ 
        message: "Cannot edit request after it has been reviewed",
        requests: []
      });
      return;
    }

    // Build update object
    const updateData: any = {};
    if (date) updateData.date = date;
    if (title && ["OT", "FIELD_WORK"].includes(title)) updateData.title = title;
    if (start_hour != null) updateData.start_hour = start_hour;
    if (end_hour != null) updateData.end_hour = end_hour;
    if (reason !== undefined) updateData.reason = reason;

    // Validate hours if provided
    const newStartHour = start_hour ?? existingRequest.start_hour;
    const newEndHour = end_hour ?? existingRequest.end_hour;

    if (newStartHour < 0 || newEndHour < 0 || newStartHour >= newEndHour) {
      res.status(400).json({ 
        message: "Invalid start_hour or end_hour",
        requests: []
      });
      return;
    }

    const updated = await RequestModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("user_id", "first_name_en last_name_en email")
      .populate("supervisor_id", "first_name_en last_name_en email");

    res.status(200).json({
      message: "Request updated successfully",
      request: updated,
    });
  } catch (error: any) {
    console.error("Error updating request:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      requests: []
    });
  }
};

/**
 * DELETE - Delete request
 * DELETE /api/requests/:id
 */
export const deleteRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ 
        message: "Invalid request ID",
        requests: []
      });
      return;
    }

    const deletedRequest = await RequestModel.findByIdAndDelete(id);

    if (!deletedRequest) {
      res.status(404).json({ 
        message: "Request not found",
        requests: []
      });
      return;
    }

    res.status(200).json({
      message: "Request deleted successfully",
      request: deletedRequest,
    });
  } catch (error: any) {
    console.error("Error deleting request:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      requests: []
    });
  }
};

/**
 * ANALYTICS - Get request statistics
 * GET /api/requests/analytics/stats
 */
export const getRequestStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, supervisorId, startDate, endDate } = req.query;

    const matchStage: any = {};

    if (userId && mongoose.Types.ObjectId.isValid(userId as string)) {
      matchStage.user_id = new mongoose.Types.ObjectId(userId as string);
    }

    if (supervisorId && mongoose.Types.ObjectId.isValid(supervisorId as string)) {
      matchStage.supervisor_id = new mongoose.Types.ObjectId(supervisorId as string);
    }

    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate as string);
      if (endDate) matchStage.date.$lte = new Date(endDate as string);
    }

    const stats = await RequestModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          pendingCount: {
            $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
          },
          acceptedCount: {
            $sum: { $cond: [{ $eq: ["$status", "Accept"] }, 1, 0] },
          },
          rejectedCount: {
            $sum: { $cond: [{ $eq: ["$status", "Reject"] }, 1, 0] },
          },
          otCount: {
            $sum: { $cond: [{ $eq: ["$title", "OT"] }, 1, 0] },
          },
          fieldWorkCount: {
            $sum: { $cond: [{ $eq: ["$title", "FIELD_WORK"] }, 1, 0] },
          },
          totalHours: {
            $sum: { $subtract: ["$end_hour", "$start_hour"] },
          },
        },
      },
    ]);

    const result = stats.length > 0 ? stats[0] : {
      totalRequests: 0,
      pendingCount: 0,
      acceptedCount: 0,
      rejectedCount: 0,
      otCount: 0,
      fieldWorkCount: 0,
      totalHours: 0,
    };

    res.status(200).json({
      message: "Request statistics retrieved successfully",
      stats: result,
    });
  } catch (error: any) {
    console.error("Error fetching request stats:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      requests: []
    });
  }
};