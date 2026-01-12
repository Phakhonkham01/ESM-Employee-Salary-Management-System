import axios from '@/services/axios/AxiosBase'

export type RequestType = 'OT' | 'FIELD_WORK'
export type RequestStatus = 'Pending' | 'Accept' | 'Reject'

export interface CreateRequestPayload {
  user_id: string
  supervisor_id: string
  date: string
  title: RequestType
  start_hour: string
  end_hour: string
  fuel?: number
  reason?: string
}

export interface RequestItem {
  _id: string
  user_id: string
  supervisor_id: string
  date: string
  title: RequestType
  start_hour: string
  end_hour: string
  fuel: number
  reason?: string
  status: RequestStatus
  created_at: string
}

/* =====================
   API
===================== */

export const createRequest = (payload: CreateRequestPayload) => {
  return axios.post('/requests', payload)
}

export const getRequestsByUser = (userId: string) => {
  return axios.get<{ requests: RequestItem[] }>(
    `/requests/user/${userId}`
  )
}

export const updateRequestStatus = (
  requestId: string,
  status: RequestStatus
) => {
  return axios.put(
    `/requests/${requestId}/status`,
    { status }
  )
}
