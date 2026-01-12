import express from "express";
import {
  createSalary,
  getPrefillData,
  getAllSalaries,
  getSalaryById,
  updateSalaryStatus,
  updateSalary,
  deleteSalary,
  getSalarySummary
} from "../controller/salaryController";

const router = express.Router();

// Salary routes
router.post("/", createSalary);
router.get("/prefill/:userId", getPrefillData);
router.get("/", getAllSalaries);
router.get("/summary", getSalarySummary);
router.get("/:id", getSalaryById);
router.put("/:id/status", updateSalaryStatus);
router.put("/:id", updateSalary);
router.delete("/:id", deleteSalary);

export default router;