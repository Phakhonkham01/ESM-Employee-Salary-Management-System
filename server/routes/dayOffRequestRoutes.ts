import express from "express";
import {
  createDayOffRequest,
  getDayOffRequestsByUser,
  updateDayOffRequestStatus,
  updateDayOffRequest,
  deleteDayOffRequest,
} from "../controller/dayOffRequestController.js";

const router = express.Router();

// POST /api/day-off-requests
router.post("/", createDayOffRequest);

// GET /api/day-off-requests/user/:userId
router.get("/user/:userId", getDayOffRequestsByUser);

// PATCH /api/day-off-requests/:id/status
router.patch("/:id/status", updateDayOffRequestStatus);
router.put("/:id", updateDayOffRequest)
router.delete("/:id", deleteDayOffRequest)

export default router;
