import express from "express";
import {
  createDepartment,
  getDepartments,
} from "../controller/departmentController.js";
const router = express.Router();

// POST /api/departments
router.post("/", createDepartment);

// GET /api/departments
router.get("/", getDepartments);

export default router;
