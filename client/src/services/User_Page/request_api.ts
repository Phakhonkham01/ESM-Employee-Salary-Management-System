import axios from '@/services/axios/AxiosBase'

/* =====================
   Types
===================== */

export type RequestType = 'OT' | 'FIELD_WORK'

export type RequestStatus = 'Pending' | 'Accept' | 'Reject'

export interface CreateRequestPayload {
  user_id: string
  supervisor_id: string
  date: string
  title: RequestType
  start_hour: number
  end_hour: number
  reason?: string
}

export interface RequestItem {
  _id: string
  user_id: string
  supervisor_id: string
  date: string
  title: RequestType
  start_hour: number
  end_hour: number
  reason?: string
  status: RequestStatus
  created_at: string
}

/* =====================
   API functions
===================== */

/**
 * Create OT / Field Work request
 */
export const createRequest = async (payload: CreateRequestPayload) => {
  return axios.post('/requests', payload)
}


/**
 * Get requests by user
 */
export const getRequestsByUser = (userId: string) => {
  return axios.get<{ requests: RequestItem[] }>(
    `/api/requests/user/${userId}`
  )
}

/**
 * Update request status (Supervisor / Admin)
 */
export const updateRequestStatus = (
  requestId: string,
  status: RequestStatus
) => {
  return axios.patch(
    `/api/requests/${requestId}/status`,
    { status }
  )
}
