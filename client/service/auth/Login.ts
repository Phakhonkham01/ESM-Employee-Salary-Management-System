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

export interface CreateUserData {
  
  name: string;
  lastname: string;
  email: string;
  password: string;
  role: "Supervisor" | "Admin" | "Employee";
  position: "IT" | "CONTENT" | "SSD";
  department: "CX" | "LCC" | "DDS";
  base_salary: number;
  start_date: string;
  status?: "Active" | "Inactive" | "On Leave";
}

export interface LoginResponse {
  message: string;
  user: UserData;
}

export interface CreateUserResponse {
  message: string;
  user: UserData;
}

export interface GetUsersResponse {
  users: UserData[];
  count: number;
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

// Create new user
export const createUser = async (
  userData: CreateUserData
): Promise<CreateUserResponse> => {
  try {
    const response = await axios.post(`${API_URL}/users`, userData);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to create user."
    );
  }
};

// Get all users
export const getAllUsers = async (): Promise<GetUsersResponse> => {
  try {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch users."
    );
  }
};

// Get user by ID
export const getUserById = async (id: string): Promise<{ user: UserData }> => {
  try {
    const response = await axios.get(`${API_URL}/users/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch user."
    );
  }
};

// Update user
export const updateUser = async (
  id: string,
  userData: Partial<CreateUserData>
): Promise<CreateUserResponse> => {
  try {
    const response = await axios.put(`${API_URL}/users/${id}`, userData);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update user."
    );
  }
};

// Delete user
export const deleteUser = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await axios.delete(`${API_URL}/users/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to delete user."
    );
  }
};

// Get users by role
export const getUsersByRole = async (
  role: "Supervisor" | "Admin" | "Employee"
): Promise<GetUsersResponse> => {
  try {
    const response = await axios.get(`${API_URL}/users/role/${role}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch users by role."
    );
  }
};