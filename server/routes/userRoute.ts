import express, { Router } from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
  getUsersByRole,
  getSupervisors,
} from "../controller/userController.js";

const router: Router = express.Router();

// User CRUD routes
router.post("/users", createUser);
router.get("/users", getAllUsers);
router.get("/users/supervisors", getSupervisors);

router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Additional routes
router.post("/login", loginUser);
router.get("/users/role/:role", getUsersByRole);

export default router;