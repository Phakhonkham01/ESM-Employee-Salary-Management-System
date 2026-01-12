import { Request, Response } from "express";
import mongoose from "mongoose";
import Salary, { ISalary } from "../model/salaryModel.js";
import User from "../model/userModel.js";
import RequestModel from "../model/requestModel.js";
import DayOffRequestModel from "../model/dayOffRequestModel.js";

/**
 * Helper function to get current month/year
 */
const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear()
  };
};

/**
 * Helper function to calculate OT from requests
 */
// ใน salaryModel.ts หรือเพิ่มใน controller
interface OTDetail {
  date: Date;
  title: string;
  start_hour: string;
  end_hour: string;
  total_hours: number;
  ot_type: 'weekday' | 'weekend' | 'holiday';
  hourly_rate: number;
  ot_multiplier: number;
  amount: number;
  description?: string;
}
/**
 * Helper function to calculate OT from requests with details
 */
/**
 * Helper function to calculate OT from requests with details
 */
/**
 * Helper function to calculate OT from requests with details
 */
const calculateOT = async (
  userId: string, 
  month: number, 
  year: number,
  customRates?: {
    weekday_rate: number;
    weekend_rate: number;
    holiday_rate: number;
  }
): Promise<{
  total_amount: number;
  total_hours: number;
  details: any[];
}> => {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // ดึงข้อมูลคำขอ OT
    const otRequests = await RequestModel.find({
      user_id: userId,
      title: "OT",
      status: "Accept",
      created_at: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ created_at: 1 });

    const details: any[] = [];
    let total_amount = 0;
    let total_hours = 0;

    // ดึงข้อมูลผู้ใช้เพื่อคำนวณอัตราค่าจ้างรายชั่วโมง
    const user = await User.findById(userId);
    if (!user || !user.base_salary) {
      return { total_amount: 0, total_hours: 0, details: [] };
    }

    // คำนวณอัตราค่าจ้างรายชั่วโมง (ฐานเดือนละ 22 วัน ทำงานวันละ 8 ชั่วโมง)
    const hourlyRate = user.base_salary / (22 * 8);
    
    // อัตราคูณค่า OT (ค่า default)
    const defaultRates = {
      weekday_rate: customRates?.weekday_rate || 1.5,
      weekend_rate: customRates?.weekend_rate || 2.0,
      holiday_rate: customRates?.holiday_rate || 3.0
    };

    // วนลูปคำนวณแต่ละรายการ OT
    for (const request of otRequests) {
      if (request.start_hour && request.end_hour) {
        const start = parseInt(request.start_hour.split(':')[0]);
        const end = parseInt(request.end_hour.split(':')[0]);
        const hours = end - start;
        
        // ตรวจสอบประเภทวัน
        let requestDate = request.date_off || request.created_at;
        const dateObj = new Date(requestDate);
        const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, ...
        
        let ot_type = 'weekday';
        let multiplier = defaultRates.weekday_rate;
        
        // ตรวจสอบว่าเป็นวันหยุดหรือไม่
        if (request.title && (
          request.title.includes('HOLIDAY') || 
          request.title.includes('วันหยุด') ||
          request.title.includes('Holiday')
        )) {
          ot_type = 'holiday';
          multiplier = defaultRates.holiday_rate;
        } else if (dayOfWeek === 0 || dayOfWeek === 6) {
          ot_type = 'weekend';
          multiplier = defaultRates.weekend_rate;
        }
        
        const amount = hours * hourlyRate * multiplier;
        
        details.push({
          date: dateObj,
          title: request.title || 'OT',
          start_hour: request.start_hour,
          end_hour: request.end_hour,
          total_hours: hours,
          ot_type,
          hourly_rate: hourlyRate,
          ot_multiplier: multiplier,
          amount,
          description: request.description || request.reason,
          request_id: request._id
        });
        
        total_hours += hours;
        total_amount += amount;
      }
    }

    return { total_amount, total_hours, details };
  } catch (error) {
    console.error("Error calculating OT:", error);
    return { total_amount: 0, total_hours: 0, details: [] };
  }
};
/**
 * Helper function to calculate fuel costs from FIELD_WORK requests
 */
const calculateFuelCosts = async (userId: string, month: number, year: number): Promise<number> => {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const fieldWorkRequests = await RequestModel.find({
      user_id: userId,
      title: "FIELD_WORK",
      status: "Accept",
      created_at: {
        $gte: startDate,
        $lte: endDate
      }
    });

    // Assuming 500 THB per FIELD_WORK day (adjust as needed)
    return fieldWorkRequests.length * 500;
  } catch (error) {
    console.error("Error calculating fuel costs:", error);
    return 0;
  }
};

/**
 * Helper function to calculate day off days
 */
const calculateDayOffDays = async (userId: string, month: number, year: number): Promise<number> => {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const dayOffRequests = await DayOffRequestModel.find({
      user_id: userId,
      status: "Accept",
      created_at: {
        $gte: startDate,
        $lte: endDate
      }
    });

    let totalDays = 0;
    
    dayOffRequests.forEach(request => {
      if (request.date_off_number) {
        totalDays += request.date_off_number;
      }
    });

    return totalDays;
  } catch (error) {
    console.error("Error calculating day off days:", error);
    return 0;
  }
};

/**
 * CREATE - Create salary calculation
 * POST /api/salaries
 */
/**
 * CREATE - Create salary calculation
 * POST /api/salaries
 */
/**
 * CREATE - Create salary calculation
 * POST /api/salaries
 */
export const createSalary = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      user_id,
      month,
      year,
      bonus,
      commission,
      money_not_spent_on_holidays,
      other_income,
      office_expenses,
      social_security,
      working_days,
      notes,
      salary, // 👈 รับจาก frontend (net_salary)
      net_salary, // 👈 รับจาก frontend (ถ้ามี)
      created_by,
      ot_rates = {
        weekday_rate: 1.5,
        weekend_rate: 2.0,
        holiday_rate: 3.0
      }
    } = req.body;

    // 👇 แก้ไขการรับค่า created_by
    const creatorId = created_by || (req.user ? req.user.id : null);

    // Validation
    if (!user_id) {
      res.status(400).json({ 
        message: "Missing user_id",
        salary: null
      });
      return;
    }

    // ถ้าไม่มี created_by ใน request ให้ใช้ user_id แทน (หรือค่า default)
    const finalCreatedBy = creatorId || user_id;

    // Check if salary already exists for this month/year
    const existingSalary = await Salary.findOne({
      user_id,
      month: month || getCurrentMonthYear().month,
      year: year || getCurrentMonthYear().year
    });

    if (existingSalary) {
      res.status(400).json({ 
        message: "Salary for this month already exists",
        salary: null
      });
      return;
    }

    // Get user data
    const user = await User.findById(user_id);
    if (!user) {
      res.status(404).json({ 
        message: "User not found",
        salary: null
      });
      return;
    }

    // Calculate various components
    const currentMonth = month || getCurrentMonthYear().month;
    const currentYear = year || getCurrentMonthYear().year;

    // คำนวณ OT พร้อมรายละเอียด
    const otCalculation = await calculateOT(user_id, currentMonth, currentYear, ot_rates);
    const ot_amount = otCalculation.total_amount;
    const ot_hours = otCalculation.total_hours;
    const ot_details = otCalculation.details;
    
    const base_salary = user.base_salary || 0;
    const fuel_costs = await calculateFuelCosts(user_id, currentMonth, currentYear);
    const day_off_days = await calculateDayOffDays(user_id, currentMonth, currentYear);
    
    // Calculate remaining vacation days
    const remaining_vacation_days = Math.max(
      0,
      (user.vacation_days || 0) - day_off_days
    );

    // Calculate net salary - ใช้ค่าจาก frontend หรือคำนวณใหม่
    let net_salary_calculated;
    
    if (salary || net_salary) {
      // ใช้ค่าจาก frontend ถ้ามี
      net_salary_calculated = salary || net_salary;
    } else {
      // คำนวณใหม่ถ้าไม่มี
      const totalIncome = base_salary + ot_amount + (bonus || 0) + (commission || 0) + 
                         fuel_costs + (money_not_spent_on_holidays || 0) + 
                         (other_income || 0);
      
      const totalDeductions = (office_expenses || 0) + (social_security || 0);
      net_salary_calculated = totalIncome - totalDeductions;
    }

    // Create salary record
    const newSalary = await Salary.create({
      user_id,
      month: currentMonth,
      year: currentYear,
      base_salary,
      ot_amount,
      ot_hours,
      ot_details, // ✅ บันทึกรายละเอียด OT
      ot_rates: {
        weekday_rate: ot_rates.weekday_rate,
        weekend_rate: ot_rates.weekend_rate,
        holiday_rate: ot_rates.holiday_rate
      },
      bonus: bonus || 0,
      commission: commission || 0,
      fuel_costs,
      money_not_spent_on_holidays: money_not_spent_on_holidays || 0,
      other_income: other_income || 0,
      office_expenses: office_expenses || 0,
      social_security: social_security || 0,
      working_days: working_days || 0,
      day_off_days,
      remaining_vacation_days,
      payment_date: new Date(),
      net_salary: net_salary_calculated,
      status: 'pending',
      created_by: finalCreatedBy,
      notes,
      created_at: new Date(),
      updated_at: new Date()
    });

    // Populate user details
    const populatedSalary = await Salary.findById(newSalary._id)
      .populate("user_id", "first_name_en last_name_en email base_salary vacation_days")
      .populate("created_by", "first_name_en last_name_en");

    res.status(201).json({
      message: "Salary calculation created successfully",
      salary: populatedSalary,
      ot_summary: {
        total_hours: ot_hours,
        total_amount: ot_amount,
        details_count: ot_details.length
      }
    });
  } catch (error: any) {
    console.error("Error creating salary:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      salary: null
    });
  }
};

/**
 * GET - Get salary data for form (pre-fill data)
 * GET /api/salaries/prefill/:userId
 */
export const getPrefillData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { month, year } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ 
        message: "Invalid user ID",
        data: null
      });
      return;
    }

    const currentMonth = month ? parseInt(month as string) : getCurrentMonthYear().month;
    const currentYear = year ? parseInt(year as string) : getCurrentMonthYear().year;

    // Get user data
    const user = await User.findById(userId)
      .select("first_name_en last_name_en base_salary vacation_days");

    if (!user) {
      res.status(404).json({ 
        message: "User not found",
        data: null
      });
      return;
    }

    // Calculate dynamic data
    const ot_amount = await calculateOT(userId, currentMonth, currentYear);
    const fuel_costs = await calculateFuelCosts(userId, currentMonth, currentYear);
    const day_off_days = await calculateDayOffDays(userId, currentMonth, currentYear);
    const remaining_vacation_days = Math.max(
      0,
      (user.vacation_days || 0) - day_off_days
    );

    // Determine color for vacation days
    let vacationColor = 'green'; // Default green
    if (remaining_vacation_days < 0) {
      vacationColor = 'red';
    } else if (remaining_vacation_days <= 5) {
      vacationColor = 'yellow';
    }

    res.status(200).json({
      message: "Prefill data retrieved successfully",
      data: {
        user: {
          _id: user._id,
          name: `${user.first_name_en} ${user.last_name_en}`,
          base_salary: user.base_salary || 0,
          vacation_days: user.vacation_days || 0
        },
        calculated: {
          ot_amount,
          fuel_costs,
          day_off_days,
          remaining_vacation_days,
          vacation_color: vacationColor
        },
        month: currentMonth,
        year: currentYear
      }
    });
  } catch (error: any) {
    console.error("Error getting prefill data:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      data: null
    });
  }
};

/**
 * GET - Get all salaries
 * GET /api/salaries
 */
export const getAllSalaries = async (req: Request, res: Response): Promise<void> => {
  try {
    const { month, year, status, userId } = req.query;

    const filter: any = {};

    if (month) filter.month = parseInt(month as string);
    if (year) filter.year = parseInt(year as string);
    if (status) filter.status = status;
    if (userId) filter.user_id = userId;

    const salaries = await Salary.find(filter)
      .populate("user_id", "first_name_en last_name_en email")
      .populate("created_by", "first_name_en last_name_en")
      .sort({ year: -1, month: -1, created_at: -1 });

    res.status(200).json({
      message: "Salaries retrieved successfully",
      count: salaries.length,
      salaries
    });
  } catch (error: any) {
    console.error("Error fetching salaries:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      salaries: []
    });
  }
};

/**
 * GET - Get salary by ID
 * GET /api/salaries/:id
 */
export const getSalaryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ 
        message: "Invalid salary ID",
        salary: null
      });
      return;
    }

    const salary = await Salary.findById(id)
      .populate("user_id", "first_name_en last_name_en email base_salary vacation_days")
      .populate("created_by", "first_name_en last_name_en");

    if (!salary) {
      res.status(404).json({ 
        message: "Salary not found",
        salary: null
      });
      return;
    }

    res.status(200).json({
      message: "Salary retrieved successfully",
      salary
    });
  } catch (error: any) {
    console.error("Error fetching salary:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      salary: null
    });
  }
};

/**
 * UPDATE - Update salary status
 * PUT /api/salaries/:id/status
 */
export const updateSalaryStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ 
        message: "Invalid salary ID",
        salary: null
      });
      return;
    }

    if (!['pending', 'approved', 'paid', 'cancelled'].includes(status)) {
      res.status(400).json({ 
        message: "Invalid status",
        salary: null
      });
      return;
    }

    const updatedSalary = await Salary.findByIdAndUpdate(
      id,
      { 
        status,
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    )
      .populate("user_id", "first_name_en last_name_en email")
      .populate("created_by", "first_name_en last_name_en");

    if (!updatedSalary) {
      res.status(404).json({ 
        message: "Salary not found",
        salary: null
      });
      return;
    }

    res.status(200).json({
      message: `Salary status updated to ${status}`,
      salary: updatedSalary
    });
  } catch (error: any) {
    console.error("Error updating salary status:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      salary: null
    });
  }
};

/**
 * UPDATE - Update salary data
 * PUT /api/salaries/:id
 */
export const updateSalary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      bonus,
      commission,
      money_not_spent_on_holidays,
      other_income,
      office_expenses,
      social_security,
      working_days,
      notes
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ 
        message: "Invalid salary ID",
        salary: null
      });
      return;
    }

    const salary = await Salary.findById(id);
    if (!salary) {
      res.status(404).json({ 
        message: "Salary not found",
        salary: null
      });
      return;
    }

    // Only allow editing if status is pending
    if (salary.status !== 'pending') {
      res.status(400).json({ 
        message: "Cannot edit salary after it has been approved",
        salary: null
      });
      return;
    }

    // Update fields
    if (bonus !== undefined) salary.bonus = bonus;
    if (commission !== undefined) salary.commission = commission;
    if (money_not_spent_on_holidays !== undefined) salary.money_not_spent_on_holidays = money_not_spent_on_holidays;
    if (other_income !== undefined) salary.other_income = other_income;
    if (office_expenses !== undefined) salary.office_expenses = office_expenses;
    if (social_security !== undefined) salary.social_security = social_security;
    if (working_days !== undefined) salary.working_days = working_days;
    if (notes !== undefined) salary.notes = notes;

    // Recalculate net salary
    const totalIncome = salary.base_salary + salary.ot_amount + salary.bonus + salary.commission + 
                       salary.fuel_costs + salary.money_not_spent_on_holidays + salary.other_income;
    
    const totalDeductions = salary.office_expenses + salary.social_security;
    salary.net_salary = totalIncome - totalDeductions;
    salary.updated_at = new Date();

    await salary.save();

    const populatedSalary = await Salary.findById(id)
      .populate("user_id", "first_name_en last_name_en email")
      .populate("created_by", "first_name_en last_name_en");

    res.status(200).json({
      message: "Salary updated successfully",
      salary: populatedSalary
    });
  } catch (error: any) {
    console.error("Error updating salary:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      salary: null
    });
  }
};

/**
 * DELETE - Delete salary
 * DELETE /api/salaries/:id
 */
export const deleteSalary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ 
        message: "Invalid salary ID"
      });
      return;
    }

    const salary = await Salary.findById(id);
    if (!salary) {
      res.status(404).json({ 
        message: "Salary not found"
      });
      return;
    }

    // Only allow deletion if status is pending
    if (salary.status !== 'pending') {
      res.status(400).json({ 
        message: "Cannot delete salary after it has been approved"
      });
      return;
    }

    await salary.deleteOne();

    res.status(200).json({
      message: "Salary deleted successfully"
    });
  } catch (error: any) {
    console.error("Error deleting salary:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message
    });
  }
};

/**
 * GET - Get salary summary
 * GET /api/salaries/summary
 */
export const getSalarySummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { month, year } = req.query;

    const matchStage: any = {};
    if (month) matchStage.month = parseInt(month as string);
    if (year) matchStage.year = parseInt(year as string);

    const summary = await Salary.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSalaries: { $sum: 1 },
          totalNetSalary: { $sum: "$net_salary" },
          totalBaseSalary: { $sum: "$base_salary" },
          totalOT: { $sum: "$ot_amount" },
          totalBonus: { $sum: "$bonus" },
          averageSalary: { $avg: "$net_salary" },
          pendingCount: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
          },
          approvedCount: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] }
          },
          paidCount: {
            $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] }
          }
        }
      }
    ]);

    const result = summary.length > 0 ? summary[0] : {
      totalSalaries: 0,
      totalNetSalary: 0,
      totalBaseSalary: 0,
      totalOT: 0,
      totalBonus: 0,
      averageSalary: 0,
      pendingCount: 0,
      approvedCount: 0,
      paidCount: 0
    };

    res.status(200).json({
      message: "Salary summary retrieved successfully",
      summary: result
    });
  } catch (error: any) {
    console.error("Error fetching salary summary:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      summary: null
    });
  }
};