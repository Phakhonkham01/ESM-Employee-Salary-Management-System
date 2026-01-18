import axios from 'axios'

// Base URL
const API_BASE_URL = 'http://localhost:8000/api'

// ==================== Interfaces ====================

export interface User {
    _id: string
    email: string
    first_name_en?: string
    last_name_en?: string
    first_name_la?: string
    last_name_la?: string
    first_name?: string
    last_name?: string
    nickname_en?: string
    nickname_la?: string
    username?: string
    nickname?: string
    employee_id?: string
    employeeId?: string
}

// ในไฟล์ services/requests/api.ts
export interface RequestData {
  _id: string;
  user_id: {
    _id: string;
    email: string;
    first_name_en?: string;
    last_name_en?: string;
    first_name_la?: string;
    last_name_la?: string;
    nickname_en?: string;
    nickname_la?: string;
    employee_id?: string;
    role?: string;
    status?: string;
    // เพิ่มฟิลด์เหล่านี้จากที่ backend populate มา
  } | string; // ยังเป็น string หรือ object ได้
  supervisor_id: User | string;
  date: string;
  title: 'OT' | 'FIELD_WORK';
  start_hour: string | number;
  end_hour: string | number;
  fuel?: number;
  reason: string;
  status: 'Pending' | 'Accept' | 'Reject';
  created_at: string;
}

export interface CreateRequestPayload {
    user_id: string
    supervisor_id: string
    date: string
    title: 'OT' | 'FIELD_WORK'
    start_hour: number
    end_hour: number
    reason?: string
}

export interface UpdateRequestPayload {
    date?: string
    title?: 'OT' | 'FIELD_WORK'
    start_hour?: number
    end_hour?: number
    reason?: string
}

export interface RequestStats {
    totalRequests: number
    pendingCount: number
    acceptedCount: number
    rejectedCount: number
    otCount: number
    fieldWorkCount: number
    totalHours: number
}

export interface ApiResponse<T = any> {
    message: string
    data?: T
    request?: RequestData
    requests?: RequestData[]
    stats?: RequestStats
    count?: number
}

// ==================== API Functions ====================

/**
 * CREATE - Submit new request
 */
export const createRequest = async (payload: CreateRequestPayload): Promise<ApiResponse<RequestData>> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/requests`, payload)
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to create request')
    }
}

/**
 * READ - Get all requests (Admin)
 */
export const getAllRequests = async (filters?: {
    status?: 'Pending' | 'Accept' | 'Reject'
    title?: 'OT' | 'FIELD_WORK'
    startDate?: string
    endDate?: string
}): Promise<ApiResponse<RequestData[]>> => {
    try {
        const params = new URLSearchParams()
        if (filters?.status) params.append('status', filters.status)
        if (filters?.title) params.append('title', filters.title)
        if (filters?.startDate) params.append('startDate', filters.startDate)
        if (filters?.endDate) params.append('endDate', filters.endDate)

        const response = await axios.get(`${API_BASE_URL}/requests?${params.toString()}`)
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch requests')
    }
}

/**
 * READ - Get requests by user ID
 */
export const getRequestsByUser = async (userId: string): Promise<ApiResponse<RequestData[]>> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/requests/user/${userId}`)
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch user requests')
    }
}

/**
 * READ - Get requests by supervisor ID
 */
export const getRequestsBySupervisor = async (supervisorId: string): Promise<ApiResponse<RequestData[]>> => {
    try {
        console.log('📡 Calling API: GET', `${API_BASE_URL}/requests/supervisor/${supervisorId}`)
        
        const response = await axios.get(`${API_BASE_URL}/requests/supervisor/${supervisorId}`, {
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            }
        })
        
        console.log('✅ API Response received:', {
            success: !!response.data,
            message: response.data?.message,
            requestsCount: response.data?.requests?.length,
            sampleRequest: response.data?.requests?.[0]
        })
        
        // Handle response structure
        if (response.data) {
            return {
                message: response.data.message || 'Success',
                requests: response.data.requests || [],
                count: response.data.count
            }
        }
        
        return {
            message: 'Success',
            requests: []
        }
        
    } catch (error: any) {
        console.error('❌ API Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: error.config?.url
        })
        
        if (error.response) {
            throw new Error(error.response.data?.message || `Server error: ${error.response.status}`)
        } else if (error.request) {
            throw new Error('No response from server. Check if backend is running.')
        } else {
            throw new Error(error.message || 'Failed to fetch supervisor requests')
        }
    }
}

/**
 * READ - Get single request by ID
 */
export const getRequestById = async (id: string): Promise<ApiResponse<RequestData>> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/requests/${id}`)
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch request')
    }
}

/**
 * UPDATE - Update request status (Supervisor/Admin)
 */
export const updateRequestStatus = async (
    id: string,
    status: 'Accept' | 'Reject'
): Promise<ApiResponse<RequestData>> => {
    try {
        console.log('📡 Updating request status:', { id, status })
        
        const response = await axios.put(`${API_BASE_URL}/requests/${id}/status`, { status })
        return response.data
    } catch (error: any) {
        console.error('❌ Error updating status:', error)
        throw new Error(error.response?.data?.message || 'Failed to update request status')
    }
}

/**
 * UPDATE - Update entire request (User)
 */
export const updateRequest = async (
    id: string,
    payload: UpdateRequestPayload
): Promise<ApiResponse<RequestData>> => {
    try {
        const response = await axios.put(`${API_BASE_URL}/requests/${id}`, payload)
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to update request')
    }
}

/**
 * DELETE - Delete request
 */
export const deleteRequest = async (id: string): Promise<ApiResponse<RequestData>> => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/requests/${id}`)
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to delete request')
    }
}

/**
 * ANALYTICS - Get request statistics
 */
export const getRequestStats = async (filters?: {
    userId?: string
    supervisorId?: string
    startDate?: string
    endDate?: string
}): Promise<ApiResponse<RequestStats>> => {
    try {
        const params = new URLSearchParams()
        if (filters?.userId) params.append('userId', filters.userId)
        if (filters?.supervisorId) params.append('supervisorId', filters.supervisorId)
        if (filters?.startDate) params.append('startDate', filters.startDate)
        if (filters?.endDate) params.append('endDate', filters.endDate)

        const response = await axios.get(`${API_BASE_URL}/requests/analytics/stats?${params.toString()}`)
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch request statistics')
    }
}

// ==================== Helper Functions ====================

/**
 * Format date for API
 */
export const formatDateForAPI = (date: Date): string => {
    return date.toISOString().split('T')[0]
}

/**
 * Parse hour from time string (HH:mm)
 */
export const parseHourFromTime = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number)
    return hours + minutes / 60
}

/**
 * Format hour to time string (HH:mm)
 */
export const formatHourToTime = (hour: number): string => {
    const hours = Math.floor(hour)
    const minutes = Math.round((hour - hours) * 60)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

/**
 * Calculate duration between two hours
 */
export const calculateDuration = (startHour: number, endHour: number): number => {
    return endHour - startHour
}

/**
 * Get status color class
 */
export const getStatusColor = (status: 'Pending' | 'Accept' | 'Reject'): string => {
    const colors = {
        Pending: 'amber',
        Accept: 'green',
        Reject: 'red',
    }
    return colors[status]
}

/**
 * Get title color class
 */
export const getTitleColor = (title: 'OT' | 'FIELD_WORK'): string => {
    const colors = {
        OT: 'blue',
        FIELD_WORK: 'purple',
    }
    return colors[title]
}

// ==================== Export all ====================
export default {
    createRequest,
    getAllRequests,
    getRequestsByUser,
    getRequestsBySupervisor,
    getRequestById,
    updateRequestStatus,
    updateRequest,
    deleteRequest,
    getRequestStats,
    formatDateForAPI,
    parseHourFromTime,
    formatHourToTime,
    calculateDuration,
    getStatusColor,
    getTitleColor,
}