// services/User_Page/day_off_request_api.ts
import axios from "axios";

const API_URL = "http://localhost:8000/api";

export interface DayOffRequestData {
  user_id: string;
  employee_id: string;
  supervisor_id: string;
  day_off_type: 'FULL_DAY' | 'HALF_DAY';
  start_date_time: string;
  end_date_time: string;
  title: string;
}

export interface DayOffRequestResponse {
  message: string;
  request: {
    _id: string;
    user_id: string;
    employee_id: string;
    supervisor_id: string;
    day_off_type: 'FULL_DAY' | 'HALF_DAY';
    start_date_time: string;
    end_date_time: string;
    title: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    created_at: string;
    updated_at: string;
  };
}

// Create new day off request
export const createDayOffRequest = async (
  requestData: DayOffRequestData
): Promise<DayOffRequestResponse> => {
  try {
    const response = await axios.post(`${API_URL}/day-off-requests`, requestData);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to create day off request."
    );
  }
};

// Update day off request
export const updateDayOffRequest = async (
  id: string,
  requestData: Partial<DayOffRequestData>
): Promise<DayOffRequestResponse> => {
  try {
    const response = await axios.put(`${API_URL}/day-off-requests/${id}`, requestData);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update day off request."
    );
  }
};

// Get day off request by ID
export const getDayOffRequestById = async (id: string): Promise<{ request: any }> => {
  try {
    const response = await axios.get(`${API_URL}/day-off-requests/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch day off request."
    );
  }
};

// Delete day off request
export const deleteDayOffRequest = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await axios.delete(`${API_URL}/day-off-requests/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to delete day off request."
    );
  }
};