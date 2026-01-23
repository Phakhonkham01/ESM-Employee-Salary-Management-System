import { useEffect, useState } from 'react'
import { updateRequest } from '@/services/User_Page/request_api'
import { RequestItem } from './UserOtFieldWorkRequests'
import DatePicker from 'react-datepicker'
import Swal from 'sweetalert2'
import 'react-datepicker/dist/react-datepicker.css'
import { X, Clock, Calendar, FileText, Fuel, Edit } from 'lucide-react'

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
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const calculateDuration = () => {
    const start = toMinutes(startHour, startMinute)
    const end = toMinutes(endHour, endMinute)
    const duration = end - start
    return duration > 0 ? duration : 0
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
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

    setIsSubmitting(true)
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
    } finally {
      setIsSubmitting(false)
    }
  }

  /* =====================
     Render
  ===================== */
  if (!open || !item) return null

  const duration = calculateDuration()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/40 bg-opacity-50"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-white p-6 text-black border-b border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-2xl font-bold">
                <Edit className="inline mr-2" size={24} />
                ແກ້ໄຂຄຳຂໍ
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={26} />
            </button>
          </div>
          <p className="text-black text-sm">
            ກະລຸນາແກ້ໄຂຂໍ້ມູນການຂໍຕາມທີ່ຕ້ອງການ
          </p>
        </div>

        {/* Form */}
        <div className="p-8 space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Date */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Calendar size={18} className="text-blue-600" />
                ວັນທີ
              </label>
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => setSelectedDate(date)}
                minDate={minDate}
                maxDate={maxDate}
                dateFormat="dd/MM/yyyy"
                className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholderText="ເລືອກວັນທີ"
              />
              <p className="text-xs text-gray-500">
                ສາມາດເລືອກວັນທີພາຍໃນເດືອນນີ້ເທົ່ານັ້ນ
              </p>
            </div>

            {/* Fuel Price (FIELD_WORK only) */}
            {item.title === 'FIELD_WORK' && (
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Fuel size={18} className="text-blue-600" />
                  ເງີນຄ່ານ້ຳມັນ (LAK)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={fuel}
                    onChange={(e) => setFuel(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    placeholder="ປ້ອນຈຳນວນເງິນ"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                    LAK
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  ກະລຸນາປ້ອນຈຳນວນເງິນຄ່ານ້ຳມັນ
                </p>
              </div>
            )}
          </div>

          {/* Time Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Start Time */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Clock size={18} className="text-blue-600" />
                ເວລາເລີ່ມຕົ້ນ
              </label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-center text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ຊົ່ວໂມງ"
                  />
                  <p className="text-xs text-gray-500 text-center mt-1">ໂມງ (0-23)</p>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-2xl text-gray-400">:</span>
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={startMinute}
                    onChange={(e) => setStartMinute(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-center text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ນາທີ"
                  />
                  <p className="text-xs text-gray-500 text-center mt-1">ນາທີ (0-59)</p>
                </div>
              </div>
            </div>

            {/* End Time */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Clock size={18} className="text-blue-600" />
                ເວລາສິ້ນສຸດ
              </label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-center text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ຊົ່ວໂມງ"
                  />
                  <p className="text-xs text-gray-500 text-center mt-1">ໂມງ (0-23)</p>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-2xl text-gray-400">:</span>
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={endMinute}
                    onChange={(e) => setEndMinute(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-center text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ນາທີ"
                  />
                  <p className="text-xs text-gray-500 text-center mt-1">ນາທີ (0-59)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Duration Display */}
          <div className={`rounded-xl p-4 border ${duration <= 0
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-green-50 border-green-200 text-green-800'
            }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={18} />
                <span className="font-semibold">
                  {duration <= 0 ? 'ໄລຍະເວລາບໍ່ຖືກຕ້ອງ' : 'ໄລຍະເວລາທັງໝົດ'}
                </span>
              </div>
              <div className="text-lg font-bold">
                {formatDuration(duration)}
              </div>
            </div>
            {duration <= 0 && (
              <p className="text-sm mt-2">
                ກະລຸນາໃຫ້ແນ່ໃຈວ່າເວລາສິ້ນສຸດຕ້ອງຫຼັງຈາກເວລາເລີ່ມ
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FileText size={18} className="text-blue-600" />
              ເຫດຜົນ ແລະ ລາຍລະອຽດ
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="ອະທິບາຍເຫດຜົນການແກ້ໄຂ..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-8 bg-gray-50">
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base"
            >
              ຍົກເລິກ
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || duration <= 0}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base shadow-md"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ກຳລັງບັນທຶກ...
                </span>
              ) : (
                'ບັນທຶກການແກ້ໄຂ'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditRequestModule