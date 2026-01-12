import { Request, Response } from "express"
import DayOffRequestModel from "../model/dayOffRequestModel.js"

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
      day_off_type,
      start_date_time,
      end_date_time,
      reason,
    } = req.body

    // ================= VALIDATION =================
    if (
      !user_id ||
      !supervisor_id ||
      !day_off_type ||
      !start_date_time ||
      !end_date_time ||
      !reason?.trim()
    ) {
      res.status(400).json({ message: "Missing required fields" })
      return
    }

    const startDate = new Date(start_date_time)
    const endDate = new Date(end_date_time)

    if (endDate < startDate) {
      res.status(400).json({
        message: "End date must be later than start date",
      })
      return
    }

    if (
      day_off_type === "HALF_DAY" &&
      startDate.toDateString() !== endDate.toDateString()
    ) {
      res.status(400).json({
        message: "Half day leave must be within the same day",
      })
      return
    }

    // ================= CALCULATE DATE OFF NUMBER =================
    let date_off_number = 0

    if (day_off_type === "HALF_DAY") {
      date_off_number = 0.5
    }

    if (day_off_type === "FULL_DAY") {
      const diffTime = endDate.getTime() - startDate.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      date_off_number = diffDays + 1 // inclusive
    }

    // ================= CREATE REQUEST =================
    const request = await DayOffRequestModel.create({
      user_id,
      supervisor_id,
      day_off_type,
      start_date_time,
      end_date_time,
      date_off_number,
      reason,
      title: "DAY_OFF",
      status: "Pending",
    })

    res.status(201).json({
      message: "Day off request submitted successfully",
      request,
    })
  } catch (error: any) {
    console.error("DAY OFF CREATE ERROR:", error)

    if (error.name === "ValidationError") {
      res.status(400).json({ message: error.message })
      return
    }

    res.status(500).json({ message: "Server error" })
  }
}

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
    const { userId } = req.params

    const requests = await DayOffRequestModel.find({
      user_id: userId,
    }).sort({ created_at: -1 })

    res.status(200).json({ requests })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}

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
    const { id } = req.params
    const { status } = req.body

    if (!["Pending", "Accept", "Reject"].includes(status)) {
      res.status(400).json({ message: "Invalid status" })
      return
    }

    const updated = await DayOffRequestModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )

    if (!updated) {
      res.status(404).json({ message: "Request not found" })
      return
    }

    res.status(200).json({
      message: "Status updated successfully",
      request: updated,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}

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
    const { id } = req.params
    const {
      day_off_type,
      start_date_time,
      end_date_time,
      reason,
      supervisor_id,
    } = req.body

    const request = await DayOffRequestModel.findById(id)

    if (!request) {
      res.status(404).json({ message: "Request not found" })
      return
    }

    if (request.status !== "Pending") {
      res.status(400).json({
        message: "Only pending requests can be edited",
      })
      return
    }

    const startDate = new Date(start_date_time)
    const endDate = new Date(end_date_time)

    if (endDate < startDate) {
      res.status(400).json({
        message: "End date must be later than start date",
      })
      return
    }

    if (
      day_off_type === "HALF_DAY" &&
      startDate.toDateString() !== endDate.toDateString()
    ) {
      res.status(400).json({
        message: "Half day leave must be within the same day",
      })
      return
    }

    // Recalculate date_off_number
    let date_off_number = 0

    if (day_off_type === "HALF_DAY") {
      date_off_number = 0.5
    }

    if (day_off_type === "FULL_DAY") {
      const diffTime = endDate.getTime() - startDate.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      date_off_number = diffDays + 1
    }

    request.day_off_type = day_off_type
    request.start_date_time = start_date_time
    request.end_date_time = end_date_time
    request.date_off_number = date_off_number
    request.reason = reason
    request.supervisor_id = supervisor_id

    await request.save()

    res.status(200).json({
      message: "Day off request updated successfully",
      request,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}

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
    const { id } = req.params

    const request = await DayOffRequestModel.findById(id)

    if (!request) {
      res.status(404).json({ message: "Request not found" })
      return
    }

    if (request.status !== "Pending") {
      res.status(400).json({
        message: "Only pending requests can be deleted",
      })
      return
    }

    await request.deleteOne()

    res.status(200).json({
      message: "Day off request deleted successfully",
    })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}
