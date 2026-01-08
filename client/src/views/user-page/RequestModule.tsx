import { useState } from 'react'
import { createRequest } from '@/services/User_Page/request_api'

type RequestType = 'OT' | 'FIELD_WORK'

type Props = {
  open: boolean
  type: RequestType
  onClose: () => void
}

const RequestModule = ({ open, type, onClose }: Props) => {
  if (!open) return null

  /* =====================
     State
  ===================== */
  const [date, setDate] = useState('')
  const [startHour, setStartHour] = useState('08')
  const [startMinute, setStartMinute] = useState('00')
  const [endHour, setEndHour] = useState('17')
  const [endMinute, setEndMinute] = useState('00')
  const [reason, setReason] = useState('')

  // example: get logged user from localStorage
  const auth = JSON.parse(localStorage.getItem('auth') || 'null')
  const loggedUser = auth?.user

  /* =====================
     Helpers
  ===================== */
  const toDecimalHour = (hour: string, minute: string) =>
    Number(hour) + (minute === '30' ? 0.5 : 0)

  /* =====================
     Submit
  ===================== */
  const handleSubmit = async () => {
    if (!loggedUser?._id) {
      alert('User not logged in')
      return
    }

    try {
      await createRequest({
        user_id: loggedUser._id,
        date,
        title: type,
        start_hour: toDecimalHour(startHour, startMinute),
        end_hour: toDecimalHour(endHour, endMinute),
        reason, // can be empty
      })

      onClose()
    } catch (error) {
      console.error(error)
      alert('Failed to submit request')
    }
  }

  /* =====================
     UI
  ===================== */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        {/* Header */}
        <div className="mb-4">
          <span className="text-xl font-semibold text-slate-900">
            {type === 'OT' ? 'Overtime' : 'Field Work'}
          </span>
        </div>

        <div className="space-y-5">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Start Time
            </label>
            <div className="flex gap-2">
              <select value={startHour} onChange={(e) => setStartHour(e.target.value)} className="w-20 border rounded-lg px-2 py-2">
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i.toString().padStart(2, '0')}>
                    {i.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
              :
              <select value={startMinute} onChange={(e) => setStartMinute(e.target.value)} className="w-20 border rounded-lg px-2 py-2">
                <option value="00">00</option>
                <option value="30">30</option>
              </select>
            </div>
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              End Time
            </label>
            <div className="flex gap-2">
              <select value={endHour} onChange={(e) => setEndHour(e.target.value)} className="w-20 border rounded-lg px-2 py-2">
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i.toString().padStart(2, '0')}>
                    {i.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
              :
              <select value={endMinute} onChange={(e) => setEndMinute(e.target.value)} className="w-20 border rounded-lg px-2 py-2">
                <option value="00">00</option>
                <option value="30">30</option>
              </select>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Reason
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}

export default RequestModule
