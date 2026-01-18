import express from "express";
import {
  createPosition,
  getPositions,
  getPositionsByDepartment,
  updatePosition,
  deletePosition
} from "../controller/positionController.js";

const router = express.Router();

// POST /api/positions
router.post("/", createPosition);

// GET /api/positions
router.get("/", getPositions);

// GET /api/positions/department/:departmentId
router.get("/department/:departmentId", getPositionsByDepartment);

// PUT /api/positions/:id
router.put("/:id", updatePosition);

// DELETE /api/positions/:id
router.delete("/:id", deletePosition);

export default router;