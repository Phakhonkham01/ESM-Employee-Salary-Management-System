import axios from '@/services/axios/AxiosBase'

/* =====================
   Types
===================== */

export type RequestType = 'OT' | 'FIELD_WORK'

export type RequestStatus = 'ລໍຖ້າ' | 'ອະນຸມັດ' | 'ປະຕິເສດ'

export interface CreateRequestPayload {
  user_id: string
  date: string // yyyy-mm-dd
  title: RequestType
  start_hour: number
  end_hour: number
  reason?: string
}

export interface RequestItem {
  _id: string
  user_id: string
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
export const createRequest = (payload: CreateRequestPayload) => {
  return axios.post('/api/requests', payload)
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
 * Update request status (Admin / Supervisor)
 */
export const updateRequestStatus = (
  requestId: string,
  status: RequestStatus
) => {
  return axios.patch(`/api/requests/${requestId}/status`, { status })
}
