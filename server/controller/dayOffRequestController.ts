import { Request, Response } from "express";
import DayOffRequestModel from "../model/dayOffRequestModel.js";

/**
 * ======================================================
 * CREATE DAY OFF REQUEST
 * ======================================================
 */
export const createDayOffRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      user_id,
      supervisor_id,
      employee_id,
      day_off_type,
      start_date_time,
      end_date_time,
      title,
    } = req.body;

    // ================= VALIDATION =================
    if (
      !user_id ||
      !supervisor_id ||
      !employee_id ||
      !day_off_type ||
      !start_date_time ||
      !end_date_time ||
      !title?.trim()
    ) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const startDate = new Date(start_date_time);
    const endDate = new Date(end_date_time);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      res.status(400).json({ message: "Invalid date format" });
      return;
    }

    if (endDate < startDate) {
      res.status(400).json({
        message: "End date must be later than start date",
      });
      return;
    }

    if (
      day_off_type === "HALF_DAY" &&
      startDate.toDateString() !== endDate.toDateString()
    ) {
      res.status(400).json({
        message: "Half day leave must be within the same day",
      });
      return;
    }

    // ================= CALCULATE DATE OFF NUMBER =================
    let date_off_number = 0;

    if (day_off_type === "HALF_DAY") {
      date_off_number = 0.5;
    } else if (day_off_type === "FULL_DAY") {
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      date_off_number = diffDays + 1; // inclusive
    }

    // ================= CREATE REQUEST =================
    const request = await DayOffRequestModel.create({
      user_id,
      supervisor_id,
      employee_id,
      day_off_type,
      start_date_time,
      end_date_time,
      date_off_number,
      title,
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Day off request submitted successfully",
      request,
    });
  } catch (error: any) {
    console.error("DAY OFF CREATE ERROR:", error);

    if (error.name === "ValidationError") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * ======================================================
 * GET DAY OFF REQUESTS ALL USER
 * ======================================================
 */
export const getDayOffRequestsAllUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const requests = await DayOffRequestModel.find({})
      .populate("user_id", "username email")
      .populate("supervisor_id", "employee_id username")
      .populate("employee_id", "employee_id username")
      .sort({ created_at: -1 });

    // Format the response
    const formattedRequests = requests.map((request) => {
      const reqObj = request.toObject();

      // Get employee_id from populated data
      const employeeId =
        (reqObj.employee_id as any)?.employee_id ||
        reqObj.employee_id?.toString();

      // Get supervisor_id from populated data
      const supervisorId =
        (reqObj.supervisor_id as any)?.employee_id ||
        reqObj.supervisor_id?.toString();

      return {
        ...reqObj,
        employee_id: employeeId,
        supervisor_id: supervisorId,
        user_id: reqObj.user_id?._id?.toString(),
      };
    });

    res.status(200).json({
      success: true,
      count: formattedRequests.length,
      requests: formattedRequests,
    });
  } catch (error) {
    console.error("GET DAY OFF REQUESTS ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
/**
 * ======================================================
 * GET ALL DAY OFF REQUESTS
 * ======================================================
 */

export const getAllDayOffRequests = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const requests = await DayOffRequestModel.find()
      .populate("employee_id", "first_name_en last_name_en email")
      .populate("supervisor_id", "first_name_en last_name_en email")
      .populate("user_id", "first_name_en last_name_en email")
      .sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests, // ✅ return populated objects DIRECTLY
    });
  } catch (error) {
    console.error("GET DAY OFF REQUESTS ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * ======================================================
 * GET DAY OFF REQUESTS BY USER (FIXED)
 * ======================================================
 */
export const getDayOffRequestsByUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ success: false, message: "User ID is required" });
      return;
    }

    const requests = await DayOffRequestModel.find({
      $or: [{ employee_id: userId }, { user_id: userId }],
    })
      .populate("user_id", "first_name_en last_name_en email")
      .populate("employee_id", "first_name_en last_name_en employee_id")
      .populate("supervisor_id", "first_name_en last_name_en employee_id")
      .sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests, // ✅ DO NOT MODIFY populated fields
    });
  } catch (error) {
    console.error("GET DAY OFF REQUESTS ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * ======================================================
 * UPDATE DAY OFF REQUEST STATUS (Supervisor / Admin)
 * ======================================================
 */
export const updateDayOffRequestStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ success: false, message: "Status is required" });
      return;
    }

    // ✅ ใช้สถานะที่ตรงกับ frontend
    if (!["Pending", "Accepted", "Rejected"].includes(status)) {
      res.status(400).json({ success: false, message: "Invalid status" });
      return;
    }

    const updated = await DayOffRequestModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate("user_id", "username email")
      .populate("supervisor_id", "employee_id username")
      .populate("employee_id", "employee_id username");

    if (!updated) {
      res.status(404).json({ success: false, message: "Request not found" });
      return;
    }

    // Format response
    const reqObj = updated.toObject();
    const employeeId =
      (reqObj.employee_id as any)?.employee_id ||
      reqObj.employee_id?.toString();

    const supervisorId =
      (reqObj.supervisor_id as any)?.employee_id ||
      reqObj.supervisor_id?.toString();

    const formattedRequest = {
      ...reqObj,
      employee_id: employeeId,
      supervisor_id: supervisorId,
      user_id: reqObj.user_id?._id?.toString(),
    };

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      request: formattedRequest,
    });
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * ======================================================
 * EDIT DAY OFF REQUEST (ONLY WHEN PENDING)
 * ======================================================
 */
export const updateDayOffRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      day_off_type,
      start_date_time,
      end_date_time,
      title,
      supervisor_id,
    } = req.body;

    // ================= VALIDATION =================
    if (
      !day_off_type ||
      !start_date_time ||
      !end_date_time ||
      !title?.trim() ||
      !supervisor_id
    ) {
      res.status(400).json({ success: false, message: "Missing required fields" });
      return;
    }

    const request = await DayOffRequestModel.findById(id);

    if (!request) {
      res.status(404).json({ success: false, message: "Request not found" });
      return;
    }

    if (request.status !== "Pending") {
      res.status(400).json({
        success: false,
        message: "Only pending requests can be edited",
      });
      return;
    }

    const startDate = new Date(start_date_time);
    const endDate = new Date(end_date_time);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      res.status(400).json({ success: false, message: "Invalid date format" });
      return;
    }

    if (endDate < startDate) {
      res.status(400).json({
        success: false,
        message: "End date must be later than start date",
      });
      return;
    }

    if (
      day_off_type === "HALF_DAY" &&
      startDate.toDateString() !== endDate.toDateString()
    ) {
      res.status(400).json({
        success: false,
        message: "Half day leave must be within the same day",
      });
      return;
    }

    // ================= RECALCULATE DATE OFF NUMBER =================
    let date_off_number = 0;

    if (day_off_type === "HALF_DAY") {
      date_off_number = 0.5;
    } else if (day_off_type === "FULL_DAY") {
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      date_off_number = diffDays + 1;
    }

    // ================= UPDATE REQUEST =================
    request.day_off_type = day_off_type;
    request.start_date_time = start_date_time;
    request.end_date_time = end_date_time;
    request.date_off_number = date_off_number;
    request.title = title;
    request.supervisor_id = supervisor_id;

    await request.save();

    // Populate and format response
    const updatedRequest = await DayOffRequestModel.findById(id)
      .populate("user_id", "username email")
      .populate("supervisor_id", "employee_id username")
      .populate("employee_id", "employee_id username");

    const reqObj = updatedRequest?.toObject() || request.toObject();
    const employeeId =
      (reqObj.employee_id as any)?.employee_id ||
      reqObj.employee_id?.toString();

    const supervisorId =
      (reqObj.supervisor_id as any)?.employee_id ||
      reqObj.supervisor_id?.toString();

    const formattedRequest = {
      ...reqObj,
      employee_id: employeeId,
      supervisor_id: supervisorId,
      user_id: reqObj.user_id?._id?.toString(),
    };

    res.status(200).json({
      success: true,
      message: "Day off request updated successfully",
      request: formattedRequest,
    });
  } catch (error) {
    console.error("UPDATE DAY OFF REQUEST ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * ======================================================
 * DELETE DAY OFF REQUEST (ONLY WHEN PENDING)
 * ======================================================
 */
export const deleteDayOffRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ success: false, message: "Request ID is required" });
      return;
    }

    const request = await DayOffRequestModel.findById(id);

    if (!request) {
      res.status(404).json({ success: false, message: "Request not found" });
      return;
    }

    if (request.status !== "Pending") {
      res.status(400).json({
        success: false,
        message: "Only pending requests can be deleted",
      });
      return;
    }

    await request.deleteOne();

    res.status(200).json({
      success: true,
      message: "Day off request deleted successfully",
    });
  } catch (error) {
    console.error("DELETE DAY OFF REQUEST ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};