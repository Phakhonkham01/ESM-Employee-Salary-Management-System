const API_URL = "http://localhost:8000/api/attendance";

export interface UserRef {
    _id: string;
    name?: string;
    email?: string;
    role?: string;
}

export interface AttendanceSummary {
    _id: string;
    user_id: UserRef;
    year: number;
    month: number;
    ot_hours: number;
    attendance_days: number;
    leave_days: number;
    created_at: string;
}

// CREATE
export interface CreateAttendanceSummaryPayload {
    user_id: string;
    year: number;
    month: number;
    ot_hours?: number;
    attendance_days?: number;
    leave_days?: number;
}

// UPDATE
export interface UpdateAttendanceSummaryPayload {
    ot_hours?: number;
    attendance_days?: number;
    leave_days?: number;
}

// CREATE - Create new attendance summary
export const createAttendanceSummary = async (
    payload: CreateAttendanceSummaryPayload
): Promise<{ summary: AttendanceSummary }> => {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { summary: data.summary };
};

// READ - Get all attendance summaries
export const getAllAttendanceSummaries = async (): Promise<{
    summaries: AttendanceSummary[];
}> => {
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { summaries: data.summaries };
};


// READ - Get attendance summary by ID
export const getAttendanceSummaryById = async (
    id: string
): Promise<{ summary: AttendanceSummary }> => {
    const response = await fetch(`${API_URL}/${id}`);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { summary: data.summary };
};


// READ - Get attendance summaries by user ID
export const getAttendanceSummariesByUserId = async (
    userId: string
): Promise<{ summaries: AttendanceSummary[] }> => {
    const response = await fetch(`${API_URL}/user/${userId}`);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { summaries: data.summaries };
};

// UPDATE - Update attendance summary by ID
export const updateAttendanceSummary = async (
    id: string,
    payload: UpdateAttendanceSummaryPayload
): Promise<{ summary: AttendanceSummary }> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { summary: data.summary };
};


// DELETE - Delete attendance summary by ID
export const deleteAttendanceSummary = async (
    id: string
  ): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    return response.json();
  };
    