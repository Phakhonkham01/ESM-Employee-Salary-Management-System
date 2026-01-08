import axios from "axios";

const API_URL = "http://localhost:8000/api";


  //  Related Models


export interface Department {
  _id: string;
  department_name: string;
}

export interface Position {
  _id: string;
  position_name: string;
}


  //  User Model (POPULATED)


export interface UserData {
  _id: string;
  email: string;
  role: "Supervisor" | "Admin" | "Employee";

  first_name_en: string;
  last_name_en: string;
  nickname_en: string;

  first_name_la: string;
  last_name_la: string;
  nickname_la: string;

  date_of_birth: string;
  start_work: string;
  vacation_days: number;
  base_salary: string | number;
  gender: "Male" | "Female" | "Other";

  // 🔗 populated objects
  department_id: Department;
  position_id: Position;

  status: "Active" | "Inactive" | "On Leave";
  created_at: string;
}


  //  API FUNCTIONS


// ✅ Get user by ID
export const getUserById = async (
  id: string
): Promise<{ user: UserData }> => {
  try {
    const response = await axios.get(`${API_URL}/users/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch user."
    );
  }
};

