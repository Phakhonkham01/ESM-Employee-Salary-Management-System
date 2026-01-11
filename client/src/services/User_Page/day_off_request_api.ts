import ApiService from '@/services/ApiService'

/**
 * =========================
 * Types
 * =========================
 */
export type DayOffType = 'FULL_DAY' | 'HALF_DAY'
export type RequestStatus = 'Pending' | 'Accept' | 'Reject'

export interface DayOffRequestPayload {
  user_id: string
  supervisor_id: string
  day_off_type: DayOffType
  start_date_time: string
  end_date_time: string
  reason: string
}

/**
 * Used for UPDATE (no user_id change)
 */
export interface UpdateDayOffRequestPayload {
  supervisor_id: string
  day_off_type: DayOffType
  start_date_time: string
  end_date_time: string
  reason: string
}

/**
 * Response type (from backend)
 */
export interface DayOffRequest {
  _id: string
  user_id: string
  supervisor_id: string
  day_off_type: DayOffType
  start_date_time: string
  end_date_time: string
  date_off_number: number
  title: 'DAY_OFF'
  reason: string
  status: RequestStatus
  created_at: string
}

/**
 * =========================
 * CREATE
 * POST /api/day-off-requests
 * =========================
 */
export const createDayOffRequest = (
  payload: DayOffRequestPayload
) => {
  return ApiService.fetchDataWithAxios<
    { message: string; request: DayOffRequest },
    DayOffRequestPayload
  >({
    url: '/day-off-requests',
    method: 'post',
    data: payload,
  })
}

/**
 * =========================
 * GET BY USER
 * GET /api/day-off-requests/user/:userId
 * =========================
 */
export const getDayOffRequestsByUser = (userId: string) => {
  return ApiService.fetchDataWithAxios<
    { requests: DayOffRequest[] },
    void
  >({
    url: `/day-off-requests/user/${userId}`,
    method: 'get',
  })
}

/**
 * =========================
 * UPDATE STATUS (Supervisor/Admin)
 * PATCH /api/day-off-requests/:id/status
 * =========================
 */
export const updateDayOffRequestStatus = (
  requestId: string,
  status: RequestStatus
) => {
  return ApiService.fetchDataWithAxios<
    { message: string; request: DayOffRequest },
    { status: RequestStatus }
  >({
    url: `/day-off-requests/${requestId}/status`,
    method: 'patch',
    data: { status },
  })
}

/**
 * =========================
 * UPDATE REQUEST (Edit – only Pending)
 * PUT /api/day-off-requests/:id
 * =========================
 */
export const updateDayOffRequest = (
  requestId: string,
  payload: UpdateDayOffRequestPayload
) => {
  return ApiService.fetchDataWithAxios<
    { message: string; request: DayOffRequest },
    UpdateDayOffRequestPayload
  >({
    url: `/day-off-requests/${requestId}`,
    method: 'put',
    data: payload,
  })
}

/**
 * =========================
 * DELETE REQUEST (only Pending)
 * DELETE /api/day-off-requests/:id
 * =========================
 */
export const deleteDayOffRequest = (requestId: string) => {
  return ApiService.fetchDataWithAxios<
    { message: string },
    void
  >({
    url: `/day-off-requests/${requestId}`,
    method: 'delete',
  })
}
