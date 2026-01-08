import express from "express";
import {
  createRequest,
  getRequestsByUser,
  updateRequestStatus,
} from "../controller/requestController.js";

const router = express.Router();

// POST /api/requests
router.post("/", createRequest);

// GET /api/requests/user/:userId
router.get("/user/:userId", getRequestsByUser);

// PATCH /api/requests/:id/status
router.patch("/:id/status", updateRequestStatus);

export default router;
