import { Request, Response } from "express";
import User, { IUser } from "../model/userModel.js";
import bcrypt from "bcryptjs";

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
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ users, count: users.length });
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
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

