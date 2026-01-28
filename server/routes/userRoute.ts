// userRoutes.ts
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
  updateVacationDays,  // อย่าลืม import ฟังก์ชันนี้
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

// 3. เพิ่มเส้นทางอัพเดทวันลาพักร้อน
router.put("/users/:id/update-vacation-days", updateVacationDays);

export default router;