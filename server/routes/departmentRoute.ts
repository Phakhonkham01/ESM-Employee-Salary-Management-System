import express from "express";
import {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment
} from "../controller/departmentController.js";
const router = express.Router();

// POST /api/departments
router.post("/", createDepartment);

// GET /api/departments
router.get("/", getDepartments);

// PUT /api/departments/:id
router.put("/:id", updateDepartment);

// DELETE /api/departments/:id
router.delete("/:id", deleteDepartment);

export default router;