import { Request, Response } from "express";
import Position from "../model/posistionModel.js";
import Department from "../model/departmentModel.js";
import User from "../model/userModel.js"; // ✅ เพิ่มบรรทัดนี้
// CREATE Position
export const createPosition = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { department_id, position_name } = req.body;

    if (!department_id || !position_name) {
      res.status(400).json({ message: "department_id and position_name are required" });
      return;
    }

    const department = await Department.findById(department_id);
    if (!department) {
      res.status(404).json({ message: "Department not found" });
      return;
    }

    const position = await Position.create({
      department_id,
      position_name,
    });

    res.status(201).json(position);
  } catch (error) {
    res.status(500).json({ message: "Failed to create position", error });
  }
};

// GET All Positions (with department)
export const getPositions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const positions = await Position.find()
      .populate("department_id", "department_name")
      .sort({ created_at: -1 });

    res.status(200).json(positions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch positions", error });
  }
};

// GET Positions by Department
export const getPositionsByDepartment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { departmentId } = req.params;

    const positions = await Position.find({
      department_id: departmentId,
    });

    res.status(200).json(positions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch positions", error });
  }
};
// UPDATE Position
export const updatePosition = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { department_id, position_name } = req.body;

    if (!position_name) {
      res.status(400).json({ message: "Position name is required" });
      return;
    }

    const position = await Position.findById(id);
    if (!position) {
      res.status(404).json({ message: "Position not found" });
      return;
    }

    // Check if new name already exists in the same department
    const exists = await Position.findOne({
      position_name,
      department_id: department_id || position.department_id,
      _id: { $ne: id }
    });
    if (exists) {
      res.status(400).json({ message: "Position name already exists in this department" });
      return;
    }

    if (department_id) {
      const department = await Department.findById(department_id);
      if (!department) {
        res.status(404).json({ message: "Department not found" });
        return;
      }
      position.department_id = department_id;
    }

    position.position_name = position_name;
    await position.save();

    res.status(200).json(position);
  } catch (error) {
    res.status(500).json({ message: "Failed to update position", error });
  }
};

// DELETE Position
export const deletePosition = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const position = await Position.findById(id);
    if (!position) {
      res.status(404).json({ message: "Position not found" });
      return;
    }

    // Check if there are users associated with this position
    const users = await User.find({ position_id: id });
    if (users.length > 0) {
      res.status(400).json({ 
        message: "Cannot delete position with existing users. Please reassign users first."
      });
      return;
    }

    await position.deleteOne();
    res.status(200).json({ message: "Position deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete position", error });
  }
};