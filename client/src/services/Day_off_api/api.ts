
const API_URL = "http://localhost:8000/api";

export interface UserRef {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface DayOffRequest {
  _id: string;
  user_id: UserRef;
  supervisor_id: UserRef;
  employee_id?: UserRef;
  day_off_type: "FULL_DAY" | "HALF_DAY";
  start_date_time: string; // ISO string
  end_date_time: string;   // ISO string
  date_off_number: number;
  title: string;
  status: "Pending" | "Accepted" | "Rejected";
  created_at: string;
}


// CREATE
export interface CreateDayOffRequestPayload {
  user_id: string;
  supervisor_id: string;
  employee_id?: string;

  day_off_type: "FULL_DAY" | "HALF_DAY";
  start_date_time: string;
  end_date_time: string;

  date_off_number: number;
  title: string;
}

// GET ALL DAY OFF REQUESTS
export const getAllDayOffRequests = async (): Promise<{ requests: DayOffRequest[] }> => {
  try {
    const response = await fetch(`${API_URL}/day-off-requests/allrequests`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    return { requests: data.requests };

  } catch (error) {
    console.error("Error fetching day off requests:", error);
    throw error;
  }
};


// CREATE DAY OFF REQUEST
export const createDayOffRequest = async (
  payload: CreateDayOffRequestPayload
) => {
  try {
    const response = await fetch(`${API_URL}/day-off-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create day-off request");
    }

    return await response.json();

  } catch (error) {
    console.error("Error creating day off request:", error);
    throw error;
  }
};

// UPDATE STATUS
export const updateDayOffStatus = async (
  requestId: string,
  status: "Accepted" | "Rejected"
) => {
  try {
    const response = await fetch(`${API_URL}/day-off-requests/${requestId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update status");
    }

    return await response.json();

  } catch (error) {
    console.error("Error updating day off status:", error);
    throw error;
  }
};
