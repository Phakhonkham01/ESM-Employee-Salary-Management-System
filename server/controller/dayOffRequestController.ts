import { Request, Response } from "express";
import DayOffRequestModel from "../model/dayOffRequestModel.js";
import User from "../model/userModel.js";
import mongoose from "mongoose";

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
 * GET ALL DAY OFF REQUESTS FOR ALL USERS
 * ======================================================
 */
export const getDayOffRequestsAllUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const requests = await DayOffRequestModel.find({})
      .populate({
        path: "user_id",
        select: "first_name_en last_name_en email employee_id",
        model: User
      })
      .populate({
        path: "supervisor_id",
        select: "first_name_en last_name_en email employee_id",
        model: User
      })
      .populate({
        path: "employee_id",
        select: "first_name_en last_name_en email employee_id",
        model: User
      })
      .sort({ created_at: -1 });

    console.log("🔍 Raw populated requests:", JSON.stringify(requests[0], null, 2));

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
      
      // Helper function to extract user info
      const extractUserInfo = (userData: any) => {
        if (!userData) {
          return { id: '', name: 'Unknown', employeeId: '' };
        }
        
        // If it's already a string (ObjectId)
        if (typeof userData === 'string') {
          return { id: userData, name: 'Unknown', employeeId: '' };
        }
        
        // If it's populated object
        return {
          id: userData._id?.toString() || '',
          name: `${userData.first_name_en || ''} ${userData.last_name_en || ''}`.trim(),
          employeeId: userData.employee_id || ''
        };
      };

      const employeeInfo = extractUserInfo(reqObj.employee_id);
      const supervisorInfo = extractUserInfo(reqObj.supervisor_id);

      return {
        _id: reqObj._id,
        user_id: reqObj.user_id?._id?.toString() || reqObj.user_id,
        employee_id: employeeInfo.employeeId || employeeInfo.id,
        employee_name: employeeInfo.name,
        supervisor_id: supervisorInfo.employeeId || supervisorInfo.id,
        supervisor_name: supervisorInfo.name,
        day_off_type: reqObj.day_off_type,
        start_date_time: reqObj.start_date_time,
        end_date_time: reqObj.end_date_time,
        date_off_number: reqObj.date_off_number,
        title: reqObj.title,
        status: reqObj.status,
        created_at: reqObj.created_at,
        // Keep original for debugging
        _original_employee: reqObj.employee_id,
        _original_supervisor: reqObj.supervisor_id
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
 * GET DAY OFF REQUESTS FOR SUPERVISOR DASHBOARD
 * ======================================================
 */
export const getDayOffRequestsForSupervisorDashboard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { supervisorId } = req.params;

    if (!supervisorId) {
      res.status(400).json({ success: false, message: "Supervisor ID is required" });
      return;
    }

    // Find supervisor by ID or employee_id
    const supervisor = await User.findById(supervisorId);
    
    if (!supervisor) {
      res.status(404).json({ success: false, message: "Supervisor not found" });
      return;
    }

    // Query day off requests for this supervisor
    const requests = await DayOffRequestModel.find({
      $or: [
        { supervisor_id: supervisor._id },
        { 'supervisor_id': supervisorId }
      ]
    })
      .populate({
        path: 'user_id',
        select: 'first_name_en last_name_en email',
        model: User
      })
      .populate({
        path: 'supervisor_id',
        select: 'first_name_en last_name_en email employee_id',
        model: User
      })
      .populate({
        path: 'employee_id',
        select: 'first_name_en last_name_en email employee_id',
        model: User
      })
      .sort({ created_at: -1 });

    // Format response
    const formattedRequests = requests.map(request => {
      const reqObj = request.toObject();
      
      // Helper function
      const getUserDisplayInfo = (userField: any) => {
        if (!userField) return { id: '', display: 'Unknown', employeeId: '' };
        
        if (typeof userField === 'string') {
          return { id: userField, display: userField.substring(0, 8), employeeId: '' };
        }
        
        if (userField._id) {
          const name = `${userField.first_name_en || ''} ${userField.last_name_en || ''}`.trim();
          const display = name || userField.email || userField._id.toString().substring(0, 8);
          return {
            id: userField._id.toString(),
            display: display,
            employeeId: userField.employee_id || ''
          };
        }
        
        return { id: '', display: 'Unknown', employeeId: '' };
      };

      const employee = getUserDisplayInfo(reqObj.employee_id);
      const supervisorInfo = getUserDisplayInfo(reqObj.supervisor_id);

      return {
        _id: reqObj._id,
        user_id: reqObj.user_id?._id?.toString(),
        employee_id: employee.employeeId || employee.id,
        employee_name: employee.display,
        supervisor_id: supervisorInfo.employeeId || supervisorInfo.id,
        supervisor_name: supervisorInfo.display,
        day_off_type: reqObj.day_off_type,
        start_date_time: reqObj.start_date_time,
        end_date_time: reqObj.end_date_time,
        date_off_number: reqObj.date_off_number,
        title: reqObj.title,
        status: reqObj.status,
        created_at: reqObj.created_at,
        // Keep original for reference
        original_employee: reqObj.employee_id,
        original_supervisor: reqObj.supervisor_id
      };
    });

    res.status(200).json({
      success: true,
      supervisor: {
        id: supervisor._id,
        name: `${supervisor.first_name_en} ${supervisor.last_name_en}`,
        employee_id: supervisor.employee_id
      },
      count: formattedRequests.length,
      requests: formattedRequests,
    });
  } catch (error) {
    console.error("GET SUPERVISOR DASHBOARD REQUESTS ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * ======================================================
 * GET DAY OFF REQUESTS BY USER
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

    if (!["Pending", "Accepted", "Rejected"].includes(status)) {
      res.status(400).json({ success: false, message: "Invalid status" });
      return;
    }

    const updated = await DayOffRequestModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate({
        path: 'user_id',
        select: 'first_name_en last_name_en email',
        model: User
      })
      .populate({
        path: 'supervisor_id',
        select: 'first_name_en last_name_en email employee_id',
        model: User
      })
      .populate({
        path: 'employee_id',
        select: 'first_name_en last_name_en email employee_id',
        model: User
      });

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
    
    const formatUser = (user: any) => {
      if (!user) return { id: '', name: 'Unknown', employeeId: '' };
      if (typeof user === 'string') return { id: user, name: user.substring(0, 8), employeeId: '' };
      return {
        id: user._id?.toString() || '',
        name: `${user.first_name_en || ''} ${user.last_name_en || ''}`.trim(),
        employeeId: user.employee_id || ''
      };
    };

    const employee = formatUser(reqObj.employee_id);
    const supervisor = formatUser(reqObj.supervisor_id);

    const formattedRequest = {
      _id: reqObj._id,
      user_id: reqObj.user_id?._id?.toString(),
      employee_id: employee.employeeId || employee.id,
      employee_name: employee.name,
      supervisor_id: supervisor.employeeId || supervisor.id,
      supervisor_name: supervisor.name,
      day_off_type: reqObj.day_off_type,
      start_date_time: reqObj.start_date_time,
      end_date_time: reqObj.end_date_time,
      date_off_number: reqObj.date_off_number,
      title: reqObj.title,
      status: reqObj.status,
      created_at: reqObj.created_at,
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