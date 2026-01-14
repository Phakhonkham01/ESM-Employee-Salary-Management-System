import express, { Application } from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import userRoute from "./routes/userRoute.js";
import loginRoutes from "./routes/loginRoutes.js";
import departmentRoutes from  "./routes/departmentRoute.js";
import positionRoutes from  "./routes/positionRoute.js";
import requestRoutes from "./routes/requestRoutes.js";
import dayOffRequestRoutes from "./routes/dayOffRequestRoutes.js";
import salaryRoutes from "./routes/salaryRoutes.js";
import AttendanceSummaryRoutes from "./routes/attendanceSummary.js";

dotenv.config();

const app: Application = express();

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const PORT: number = parseInt(process.env.PORT || "8000", 10);
const MONGOURL: string = process.env.MONGO_URL || process.env.MONGODB_URI || "mongodb://localhost:27017/esm_database";

// Database connection
mongoose
  .connect(MONGOURL)
  .then(() => {
    console.log("✅ DB connected successfully.");
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error: Error) => {
    console.error("❌ MongoDB connection error:", error);
  });

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

// Routes
app.use("/api", loginRoutes);  // Login route: POST /api/login
app.use("/api", userRoute);     // User routes: GET/POST/PUT/DELETE /api/users
app.use("/api/departments", departmentRoutes);
app.use("/api/positions", positionRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/day-off-requests", dayOffRequestRoutes);
app.use("/api/salaries", salaryRoutes);
app.use("/api/attendance", AttendanceSummaryRoutes);

