

import axios from "axios";

const API_URL = "http://localhost:7000/api";

export interface LoginCredentials {
  email: string;
  password: string;
}

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
  gender: "Male" | "Female" | "Other";
  position_id: string;
  department_id: string;
  status: "Active" | "Inactive" | "On Leave";
  created_at: string;
}

export interface LoginResponse {
  message: string;
  user: UserData;
}

export const loginUser = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Invalid email or password"
    );
  }
};
