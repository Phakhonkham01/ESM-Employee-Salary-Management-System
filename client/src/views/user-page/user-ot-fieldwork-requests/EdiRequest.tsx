import { useEffect, useState } from 'react'
import { updateRequest } from '@/services/User_Page/request_api'
import { RequestItem } from './UserOtFieldWorkRequests'

type Props = {
  open: boolean
  item: RequestItem | null
  onClose: () => void
  onSaved: () => void
}

const EditRequestModule = ({
  open,
  item,
  onClose,
  onSaved,
}: Props) => {
  /* =====================
     State
  ===================== */
  const [date, setDate] = useState('')
  const [startHour, setStartHour] = useState('08')
  const [startMinute, setStartMinute] = useState('00')
  const [endHour, setEndHour] = useState('17')
  const [endMinute, setEndMinute] = useState('00')
  const [reason, setReason] = useState('')
  const [fuel, setFuel] = useState('')

  /* =====================
     Init data
  ===================== */
  useEffect(() => {
    if (!item || !open) return

    setDate(item.date.split('T')[0])

    const [sh, sm] = item.start_hour.split(':')
    const [eh, em] = item.end_hour.split(':')

    setStartHour(sh)
    setStartMinute(sm)
    setEndHour(eh)
    setEndMinute(em)

    setReason(item.reason || '')
    setFuel(item.fuel ? String(item.fuel) : '')
  }, [item, open])

  /* =====================
     Helpers
  ===================== */
  const toTimeString = (hour: string, minute: string) =>
    `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`

  const toMinutes = (h: string, m: string) =>
    Number(h) * 60 + Number(m)

  /* =====================
     Submit
  ===================== */
  const handleSubmit = async () => {
    if (!item) return

    const start = toMinutes(startHour, startMinute)
    const end = toMinutes(endHour, endMinute)

    if (end <= start) {
      alert('End time must be later than start time')
      return
    }

    if (item.title === 'FIELD_WORK') {
      const fuelNumber = Number(fuel)
      if (!fuel || isNaN(fuelNumber) || fuelNumber <= 0) {
        alert('Please enter a valid fuel price')
        return
      }
    }

    try {
      await updateRequest(item._id, {
        date,
        start_hour: toTimeString(startHour, startMinute),
        end_hour: toTimeString(endHour, endMinute),
        fuel: item.title === 'FIELD_WORK' ? Number(fuel) : 0,
        reason,
      })

      onSaved()
      onClose()
    } catch (error) {
      console.error(error)
      alert('Failed to update request')
    }
  }

  /* =====================
     Render
  ===================== */
  if (!open || !item) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        {/* Header */}
        <div className="mb-4">
          <span className="text-xl font-semibold text-slate-900">
            ແກ້ໄຂ {item.title === 'OT' ? 'Overtime' : 'ວຽກນອກສະຖານທີ່'}
          </span>
        </div>

        <div className="space-y-5">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              ລົບ
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
              ເວລາເລີ່ມ
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min={0}
                max={23}
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                className="w-20 border rounded-lg px-2 py-2"
              />
              :
              <input
                type="number"
                min={0}
                max={59}
                value={startMinute}
                onChange={(e) => setStartMinute(e.target.value)}
                className="w-20 border rounded-lg px-2 py-2"
              />
            </div>
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              ຮອດ
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min={0}
                max={23}
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
                className="w-20 border rounded-lg px-2 py-2"
              />
              :
              <input
                type="number"
                min={0}
                max={59}
                value={endMinute}
                onChange={(e) => setEndMinute(e.target.value)}
                className="w-20 border rounded-lg px-2 py-2"
              />
            </div>
          </div>

          {/* Fuel */}
          {item.title === 'FIELD_WORK' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ເງີນຄ່ານ້ຳມັນ
              </label>
              <input
                type="number"
                min={0}
                value={fuel}
                onChange={(e) => setFuel(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              ເລື່ອງ
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
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 rounded-lg"
          >
            ຍົກເລິກ
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg"
          >
            ບັນທຶກ
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditRequestModule
