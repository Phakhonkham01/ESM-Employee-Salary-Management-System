import ApiService from '@/services/ApiService'

/**
 * =========================
 * Types
 * =========================
 */
export type DayOffType = 'FULL_DAY' | 'HALF_DAY'
export type RequestStatus = 'Pending' | 'Accept' | 'Reject'

/**
 * =========================
 * CREATE PAYLOAD
 * =========================
 * user_id     → who performs the action (admin / employee)
 * employee_id → who the leave is for
 */
export interface DayOffRequestPayload {
  user_id: string
  employee_id: string
  supervisor_id: string
  day_off_type: DayOffType
  start_date_time: string
  end_date_time: string
  title: string           // ✅ CHANGED (was reason)
}

/**
 * =========================
 * UPDATE PAYLOAD
 * =========================
 * employee_id is NOT editable after creation
 */
export interface UpdateDayOffRequestPayload {
  supervisor_id: string
  day_off_type: DayOffType
  start_date_time: string
  end_date_time: string
  title: string           // ✅ CHANGED (was reason)
}

/**
 * =========================
 * RESPONSE TYPE
 * =========================
 */
export interface DayOffRequest {
  _id: string

  user_id: string           // actor
  employee_id: string       // target employee
  supervisor_id: string

  day_off_type: DayOffType
  start_date_time: string
  end_date_time: string
  date_off_number: number

  title: string             // ✅ already correct
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
 * GET BY USER (ACTOR)
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
 * UPDATE STATUS (Supervisor / Admin)
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
 * UPDATE REQUEST (ONLY WHEN PENDING)
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
 * DELETE REQUEST (ONLY WHEN PENDING)
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
