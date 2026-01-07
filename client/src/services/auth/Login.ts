import axios from "axios";

const API_URL = "http://localhost:8000/api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserData {
  _id: string;
  name: string;
  lastname: string;
  email: string;
  role: "Supervisor" | "Admin" | "Employee";
  position: "IT" | "CONTENT" | "SSD";
  department: "CX" | "LCC" | "DDS";
  base_salary: number;
  start_date: string;
  status: "Active" | "Inactive" | "On Leave";
}

export interface LoginResponse {
  message: string;
  user: UserData;
}

// Login user
export const loginUser = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Login failed. Please try again."
    );
  }
};