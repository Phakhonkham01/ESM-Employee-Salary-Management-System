import { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import { updateRequest } from '@/services/User_Page/request_api'
import { RequestItem } from './UserOtFieldWorkRequests'

type Props = {
    open: boolean
    item: RequestItem | null
    onClose: () => void
    onSaved: () => void
}

const EditRequestModule = ({ open, item, onClose, onSaved }: Props) => {
    /* =====================
     State
  ===================== */
    const [date, setDate] = useState<Date | null>(null)

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

        // ✅ Convert string -> Date
        setDate(item.date ? new Date(item.date) : null)

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

    const toMinutes = (h: string, m: string) => Number(h) * 60 + Number(m)

    /* =====================
     Submit
  ===================== */
    const handleSubmit = async () => {
        if (!item || !date) {
            alert('Date is required')
            return
        }

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
                date: date.toISOString().split('T')[0], // ✅ YYYY-MM-DD
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
                        Edit {item.title === 'OT' ? 'Overtime' : 'Field Work'}
                    </span>
                </div>

                <div className="space-y-5">
                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Date
                        </label>
                        <DatePicker
                            selected={date}
                            onChange={(d: Date | null) => setDate(d)}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Select date"
                            className="w-full rounded-lg border px-3 py-2 text-sm"
                            popperPlacement="bottom-start"
                            wrapperClassName="w-full"
                            showPopperArrow={false}
                        />
                    </div>

                    {/* Start Time */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Start Time
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
                            End Time
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
                                Fuel Price
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
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-100 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EditRequestModule
