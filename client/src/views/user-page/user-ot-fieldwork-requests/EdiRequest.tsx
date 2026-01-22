import { useEffect, useState } from 'react'
import { updateRequest } from '@/services/User_Page/request_api'
import { RequestItem } from './UserOtFieldWorkRequests'
import DatePicker from 'react-datepicker'
import Swal from 'sweetalert2'
import 'react-datepicker/dist/react-datepicker.css'

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
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

    // Parse date string to Date object
    const dateStr = item.date.split('T')[0]
    setSelectedDate(new Date(dateStr))

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
     Date restrictions
  ===================== */
  const getCurrentMonthRange = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    
    const minDate = new Date(year, month, 1)
    const maxDate = new Date(year, month + 1, 0)
    
    return { minDate, maxDate }
  }

  const { minDate, maxDate } = getCurrentMonthRange()

  /* =====================
     Helpers
  ===================== */
  const toTimeString = (hour: string, minute: string) =>
    `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`

  const toMinutes = (h: string, m: string) =>
    Number(h) * 60 + Number(m)

  const formatDateToString = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  /* =====================
    Submit
  ===================== */
  const handleSubmit = async () => {
    if (!item || !selectedDate) return

    const start = toMinutes(startHour, startMinute)
    const end = toMinutes(endHour, endMinute)

    if (end <= start) {
      Swal.fire({
        icon: 'error',
        title: 'ຜິດພາດ',
        text: 'ເວລາສິ້ນສຸດຕ້ອງຫຼັງຈາກເວລາເລີ່ມ',
        confirmButtonColor: '#2563eb',
      })
      return
    }

    if (item.title === 'FIELD_WORK') {
      const fuelNumber = Number(fuel)
      if (!fuel || isNaN(fuelNumber) || fuelNumber <= 0) {
        Swal.fire({
          icon: 'error',
          title: 'ຜິດພາດ',
          text: 'ກະລຸນາໃສ່ຄ່ານ້ຳມັນທີ່ຖືກຕ້ອງ',
          confirmButtonColor: '#2563eb',
        })
        return
      }
    }

    try {
      await updateRequest(item._id, {
        date: formatDateToString(selectedDate),
        start_hour: toTimeString(startHour, startMinute),
        end_hour: toTimeString(endHour, endMinute),
        fuel: item.title === 'FIELD_WORK' ? Number(fuel) : 0,
        reason,
      })

      Swal.fire({
        icon: 'success',
        title: 'ແກ້ໄຂສຳເລັດ',
        text: 'ບັນທຶກຂໍ້ມູນສຳເລັດແລ້ວ',
        confirmButtonColor: '#2563eb',
        timer: 2000,
      })

      onSaved()
      onClose()
    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        title: 'ຜິດພາດ',
        text: 'ບໍ່ສາມາດອັບເດດຂໍ້ມູນໄດ້',
        confirmButtonColor: '#2563eb',
      })
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
              ວັນທີ
            </label>
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => setSelectedDate(date)}
              minDate={minDate}
              maxDate={maxDate}
              dateFormat="dd/MM/yyyy"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholderText="ເລືອກວັນທີ"
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
              ເວລາສິ້ນສຸດ
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
              ເຫດຜົນ
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
            className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            ຍົກເລິກ
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ບັນທຶກ
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditRequestModule