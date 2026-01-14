import express from "express";
import {
  createDayOffRequest,
  getDayOffRequestsAllUser,
  getDayOffRequestsByUser,
  updateDayOffRequestStatus,
  updateDayOffRequest,
  deleteDayOffRequest,
  getDayOffRequestsForSupervisorDashboard, // เพิ่ม function ใหม่
} from "../controller/dayOffRequestController.js";

const router = express.Router();

// POST /api/day-off-requests
router.post("/", createDayOffRequest);

// GET /api/day-off-requests/allusers
router.get("/allusers", getDayOffRequestsAllUser);

// GET /api/day-off-requests/user/:userId
router.get("/user/:userId", getDayOffRequestsByUser);

// GET /api/day-off-requests/supervisor-dashboard/:supervisorId
router.get("/supervisor-dashboard/:supervisorId", getDayOffRequestsForSupervisorDashboard);

// PATCH /api/day-off-requests/:id/status
router.patch("/:id/status", updateDayOffRequestStatus);
router.put("/:id", updateDayOffRequest)
router.delete("/:id", deleteDayOffRequest)

export default router;