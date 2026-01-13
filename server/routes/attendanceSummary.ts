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
router.post("/", createSummary);
// Get all
router.get("/", getAllSummaries);
// Get by user (keep before /:id to avoid route conflicts)
router.get("/user/:userId", getSummaryByUser);
// Get by id
router.get("/:id", getSummaryById);
// Update
router.put("/:id", updateSummary);
// Delete
router.delete("/:id", deleteSummary);
export default router;
