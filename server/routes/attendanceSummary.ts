import { Router } from "express";
import {
  createSummary,
  getAllSummaries,
  getSummaryById,
  getSummaryByUser,
  updateSummary,
  deleteSummary
} from "../controller/attendanceSummary.controller.js";

const router = Router();

// Create
router.post("/attendanceSummary", createSummary);
// Read all
router.get("/attendanceSummary", getAllSummaries);
// Read by user (keep before /:id to avoid route conflicts)
router.get("/user/:userId", getSummaryByUser);
// Read by id
router.get("/attendanceSummary/:id", getSummaryById);
// Update
router.put("/attendanceSummary/:id", updateSummary);
// Delete
router.delete("/attendanceSummary/:id", deleteSummary);
export default router;
