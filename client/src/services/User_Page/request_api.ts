// services/User_Page/request_api.ts
import axios from "axios";

const API_URL = "http://localhost:8000/api";

export interface CreateRequestData {
  user_id: string;
  supervisor_id: string;
  date: string;
  title: 'OT' | 'FIELD_WORK';
  start_hour: string;
  end_hour: string;
  fuel: number;
  reason: string;
}

export interface RequestResponse {
  message: string;
  request: {
    _id: string;
    user_id: string;
    supervisor_id: string;
    date: string;
    title: 'OT' | 'FIELD_WORK';
    start_hour: string;
    end_hour: string;
    fuel: number;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    created_at: string;
    updated_at: string;
  };
}

// Create new request
export const createRequest = async (
  requestData: CreateRequestData
): Promise<RequestResponse> => {
  try {
    const response = await axios.post(`${API_URL}/requests`, requestData);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to create request."
    );
  }
};

// Update request
export const updateRequest = async (
  id: string,
  requestData: Partial<CreateRequestData>
): Promise<RequestResponse> => {
  try {
    const response = await axios.put(`${API_URL}/requests/${id}`, requestData);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update request."
    );
  }
};

// Get request by ID
export const getRequestById = async (id: string): Promise<{ request: any }> => {
  try {
    const response = await axios.get(`${API_URL}/requests/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch request."
    );
  }
};

// Delete request
export const deleteRequest = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await axios.delete(`${API_URL}/requests/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to delete request."
    );
  }
};