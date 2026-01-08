import express from "express";
import {
  createPosition,
  getPositions,
  getPositionsByDepartment,
} from "../controller/positionController.js";

const router = express.Router();

// POST /api/positions
router.post("/", createPosition);

// GET /api/positions
router.get("/", getPositions);

// GET /api/positions/department/:departmentId
router.get("/department/:departmentId", getPositionsByDepartment);

export default router;
