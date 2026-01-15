import { Request, Response } from "express";
import User, { IUser } from "../model/userModel.js";
import bcrypt from "bcryptjs";
interface AuthRequest extends Request {
  user?: {
    _id: string;
    role: string;
    email: string;
  };
}
// Create User
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      email,
      password,
      role,
      first_name_en,
      last_name_en,
      nickname_en,
      first_name_la,
      last_name_la,
      nickname_la,
      date_of_birth,
      start_work,
      vacation_days,
      base_salary,  // เพิ่ม field นี้
      gender,
      position_id,
      department_id,
      status,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: IUser = new User({
      email,
      password: hashedPassword,
      role,
      first_name_en,
      last_name_en,
      nickname_en,
      first_name_la,
      last_name_la,
      nickname_la,
      date_of_birth,
      start_work,
      vacation_days: vacation_days || 0,
      base_salary: base_salary || 0,  // เพิ่ม field นี้
      gender,
      position_id,
      department_id,
      status: status || "Active",
      created_at: new Date(),
    });

    await newUser.save();
    
    const userResponse: any = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "User created successfully",
      user: userResponse,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
};

// Get all users
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find()
      .populate("position_id", "position_name")
      .populate("department_id", "department_name");

    res.status(200).json({ users });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID
export const getUserById = async (
  req: Request & { user?: { id: string; role: string } },
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

const user = await User.findById(id)
  .populate("department_id", "department_name")
  .populate("position_id", "position_name")
  .select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
// ในไฟล์ userController.js
// ต้อง import Model User

export const updateVacationDays = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { vacation_days, updated_by, update_reason } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (vacation_days === undefined || vacation_days === null) {
      return res.status(400).json({ 
        success: false, 
        message: "ต้องระบุจำนวนวันลา (vacation_days)" 
      });
    }

    // ตรวจสอบว่าผู้ใช้มีอยู่หรือไม่
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "ไม่พบผู้ใช้" 
      });
    }

    // คำนวณวันขาด (ถ้าวันลาใหม่ติดลบ)
    const absentDays = vacation_days < 0 ? Math.abs(vacation_days) : 0;
    const daysReduced = user.vacation_days - vacation_days;
    
    // ใช้ค่า updated_by จาก body หรือจาก req.user (ถ้ามี)
    const updatedBy = updated_by || (req.user ? req.user._id : null);

    // อัพเดทวันลาพักร้อน (สามารถติดลบได้)
    const updateData: any = { 
      vacation_days: vacation_days,
      $push: {
        vacation_day_updates: {
          old_vacation_days: user.vacation_days,
          new_vacation_days: vacation_days,
          updated_by: updatedBy,
          update_reason: update_reason || 
            (vacation_days < 0 
              ? `ขาดงานเกินวันลา (ขาดเพิ่ม ${Math.abs(vacation_days)} วัน)` 
              : "อัพเดทจากระบบคำนวณเงินเดือน"),
          updated_at: new Date()
        }
      }
    };

    // เพิ่ม vacation_stats ถ้ามี
    if (user.vacation_stats) {
      updateData.$inc = { 
        "vacation_stats.total_absent_days": absentDays 
      };
      updateData.$set = {
        "vacation_stats.last_calculation_date": new Date()
      };
    }

    // อัพเดทข้อมูล
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).select("-password");

    // ตรวจสอบว่า updatedUser ไม่ใช่ null
    if (!updatedUser) {
      return res.status(500).json({ 
        success: false, 
        message: "ไม่สามารถอัพเดทข้อมูลผู้ใช้ได้" 
      });
    }

    // สร้างข้อความตอบกลับ
    let message = "อัพเดทวันลาพักร้อนสำเร็จ";
    let details = "";
    
    if (vacation_days < 0) {
      details = `พนักงานขาดงานเกินวันลาไป ${Math.abs(vacation_days)} วัน`;
    } else if (vacation_days === 0) {
      details = "วันลาหมดแล้ว";
    } else {
      details = `เหลือวันลาอีก ${vacation_days} วัน`;
    }

    res.json({ 
      success: true, 
      message: message,
      details: details,
      data: {
        ...updatedUser.toObject(),
        summary: {
          previous_days: user.vacation_days,
          current_days: vacation_days,
          days_changed: daysReduced,
          is_in_deficit: vacation_days < 0,
          deficit_days: vacation_days < 0 ? Math.abs(vacation_days) : 0
        }
      }
    });
  } catch (error: any) {
    console.error("ข้อผิดพลาดในการอัพเดทวันลา:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "เกิดข้อผิดพลาดในการอัพเดทวันลา" 
    });
  }
};


// Update user
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};

// Login
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const userResponse: any = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: "Login successful",
      user: userResponse,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error during login", error: error.message });
  }
};

// Get users by role
export const getUsersByRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.params;
    const users = await User.find({ role }).select("-password");
    res.status(200).json({ users, count: users.length });
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching users by role", error: error.message });
  }
};

// Get only Supervisors
export const getSupervisors = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const supervisors = await User.find({
      role: "Supervisor",
      status: "Active",
    })
      .select("_id first_name_en last_name_en first_name_la last_name_la");

    res.status(200).json({
      supervisors,
      count: supervisors.length,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error fetching supervisors",
      error: error.message,
    });
  }
};
