  import { Request, Response } from "express";
  import Department from "../model/departmentModel.js";
import Position from "../model/posistionModel.js"; // ✅ เพิ่มบรรทัดนี้

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

  // UPDATE Department
export const updateDepartment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { department_name } = req.body;

    if (!department_name) {
      res.status(400).json({ message: "Department name is required" });
      return;
    }

    const department = await Department.findById(id);
    if (!department) {
      res.status(404).json({ message: "Department not found" });
      return;
    }

    // Check if new name already exists (excluding current department)
    const exists = await Department.findOne({
      department_name,
      _id: { $ne: id }
    });
    if (exists) {
      res.status(400).json({ message: "Department name already exists" });
      return;
    }

    department.department_name = department_name;
    await department.save();

    res.status(200).json(department);
  } catch (error) {
    res.status(500).json({ message: "Failed to update department", error });
  }
};

// DELETE Department
export const deleteDepartment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id);
    if (!department) {
      res.status(404).json({ message: "Department not found" });
      return;
    }

    // Check if there are positions associated with this department
    const positions = await Position.find({ department_id: id });
    if (positions.length > 0) {
      res.status(400).json({ 
        message: "Cannot delete department with existing positions. Please delete positions first."
      });
      return;
    }

    await department.deleteOne();
    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete department", error });
  }
};