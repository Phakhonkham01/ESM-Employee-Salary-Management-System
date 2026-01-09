import { Router } from "express";
import {
  createSummary,
  getAllSummaries,
  getSummaryById,
  getSummaryByUser,
  updateSummary,
  deleteSummary
} from "../controller/attendance.js";

const router = Router();

// Create
router.post("/attendance", createSummary);
// Read all
router.get("/attendance", getAllSummaries);
// Read by user (keep before /:id to avoid route conflicts)
router.get("/user/:userId", getSummaryByUser);
// Read by id
router.get("/attendance/:id", getSummaryById);
// Update
router.put("/attendance/:id", updateSummary);
// Delete
router.delete("/attendance/:id", deleteSummary);
export default router;
