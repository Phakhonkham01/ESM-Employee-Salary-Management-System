import { Request, Response } from "express";
import Department from "../model/departmentModel.js";


// CREATE Department
export const createDepartment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { department_name } = req.body;

    if (!department_name) {
      res.status(400).json({ message: "Department name is required" });
      return;
    }

    const exists = await Department.findOne({ department_name });
    if (exists) {
      res.status(400).json({ message: "Department already exists" });
      return;
    }

    const department = await Department.create({ department_name });

    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: "Failed to create department", error });
  }
};

// GET All Departments
export const getDepartments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const departments = await Department.find().sort({ created_at: -1 });
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch departments", error });
  }
};
