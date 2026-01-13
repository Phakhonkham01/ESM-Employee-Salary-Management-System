import { useState, useEffect } from 'react'
import { createRequest } from '@/services/User_Page/request_api'
import { getSupervisors, Supervisor } from '@/services/User_Page/user_api'

type RequestType = 'OT' | 'FIELD_WORK'

type Props = {
    open: boolean
    type: RequestType
    onClose: () => void
}

const RequestModule = ({ open, type, onClose }: Props) => {
    /* =====================
       State
    ===================== */
    const [date, setDate] = useState('')
    const [startHour, setStartHour] = useState('08')
    const [startMinute, setStartMinute] = useState('30')
    const [endHour, setEndHour] = useState('17')
    const [endMinute, setEndMinute] = useState('00')
    const [reason, setReason] = useState('')
    const [fuel, setFuel] = useState('') // ✅ fuel price

    const [supervisors, setSupervisors] = useState<Supervisor[]>([])
    const [supervisorId, setSupervisorId] = useState('')

    const auth = JSON.parse(localStorage.getItem('auth') || 'null')
    const loggedUser = auth?.user

    /* =====================
       Load supervisors
    ===================== */
    useEffect(() => {
        if (!open) return

        getSupervisors()
            .then((res) => setSupervisors(res.supervisors))
            .catch(console.error)
    }, [open])

    /* =====================
       Helpers
    ===================== */
    const toTimeString = (hour: string, minute: string) => {
        const hh = hour.padStart(2, '0')
        const mm = minute.padStart(2, '0')
        return `${hh}:${mm}`
    }

    const toMinutes = (hour: string, minute: string) =>
        Number(hour) * 60 + Number(minute)

    /* =====================
       Submit
    ===================== */
    const handleSubmit = async () => {
        if (!loggedUser?._id) {
            alert('User not logged in')
            return
        }

        if (!supervisorId) {
            alert('Please select a supervisor')
            return
        }

        if (!date) {
            alert('Please select a date')
            return
        }

        const sh = Number(startHour)
        const sm = Number(startMinute)
        const eh = Number(endHour)
        const em = Number(endMinute)

        if (
            sh < 0 || sh > 23 ||
            eh < 0 || eh > 23 ||
            sm < 0 || sm > 59 ||
            em < 0 || em > 59
        ) {
            alert('Invalid time input')
            return
        }

        const startMinutes = toMinutes(startHour, startMinute)
        const endMinutes = toMinutes(endHour, endMinute)

        if (endMinutes <= startMinutes) {
            alert('End time must be later than start time')
            return
        }

        // Fuel validation (FIELD_WORK only)
        if (type === 'FIELD_WORK') {
            const fuelNumber = Number(fuel)
            if (!fuel || isNaN(fuelNumber) || fuelNumber <= 0) {
                alert('Please enter a valid fuel price')
                return
            }
        }

        try {
            await createRequest({
                user_id: loggedUser._id,
                supervisor_id: supervisorId,
                date,
                title: type,
                start_hour: toTimeString(startHour, startMinute),
                end_hour: toTimeString(endHour, endMinute),
                fuel: type === 'FIELD_WORK' ? Number(fuel) : 0,
                reason,
            })

            onClose()
        } catch (error) {
            console.error(error)
            alert('Failed to submit request')
        }
    }

    /* =====================
       Render
    ===================== */
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

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
                        <div className="flex gap-2 items-center">
                            <input
                                type="number"
                                min={0}
                                max={23}
                                value={startHour}
                                onChange={(e) => setStartHour(e.target.value)}
                                className="w-20 border rounded-lg px-2 py-2"
                                placeholder="HH"
                            />
                            :
                            <input
                                type="number"
                                min={0}
                                max={59}
                                value={startMinute}
                                onChange={(e) => setStartMinute(e.target.value)}
                                className="w-20 border rounded-lg px-2 py-2"
                                placeholder="MM"
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
                                placeholder="HH"
                            />
                            :
                            <input
                                type="number"
                                min={0}
                                max={59}
                                value={endMinute}
                                onChange={(e) => setEndMinute(e.target.value)}
                                className="w-20 border rounded-lg px-2 py-2"
                                placeholder="MM"
                            />
                        </div>
                    </div>

                    {/* Fuel price (FIELD_WORK only) */}
                    {type === 'FIELD_WORK' && (
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
                                placeholder="Enter fuel price"
                            />
                        </div>
                    )}

                    {/* Supervisor */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Supervisor
                        </label>
                        <select
                            value={supervisorId}
                            onChange={(e) => setSupervisorId(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="">Select Supervisor</option>
                            {supervisors.map((s) => (
                                <option key={s._id} value={s._id}>
                                    {s.first_name_en} {s.last_name_en}
                                </option>
                            ))}
                        </select>
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
                        Submit
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RequestModule
