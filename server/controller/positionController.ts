import { Request, Response } from "express";
import Position from "../model/posistionModel.js";
import Department from "../model/departmentModel.js";

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
