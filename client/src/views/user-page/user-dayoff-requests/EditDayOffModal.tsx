import { useEffect, useState } from 'react'
import { getSupervisors, Supervisor } from '@/services/User_Page/user_api'
import { updateDayOffRequest } from '@/services/User_Page/day_off_request_api'
import { DayOffItem } from './UserDayOffRequest'  

type Props = {
    open: boolean
    item: DayOffItem | null
    onClose: () => void
    onSaved: () => void
}


const EditDayOffModal = ({ open, item, onClose, onSaved }: Props) => {
    /* =====================
       State
    ===================== */
    const [dayOffType, setDayOffType] = useState<'FULL_DAY' | 'HALF_DAY'>(
        'FULL_DAY'
    )
    const [startDateTime, setStartDateTime] = useState('')
    const [endDateTime, setEndDateTime] = useState('')
    const [title, setTitle] = useState('') // ✅ renamed

    const [supervisors, setSupervisors] = useState<Supervisor[]>([])
    const [supervisorId, setSupervisorId] = useState('')

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
       Fill form when item changes
    ===================== */
    useEffect(() => {
        if (!item) return

        setDayOffType(item.day_off_type)
        setStartDateTime(item.start_date_time.slice(0, 16))
        setEndDateTime(item.end_date_time.slice(0, 16))
        setTitle(item.title)            // ✅ changed
        setSupervisorId(item.supervisor_id)
    }, [item])

    /* =====================
       Submit
    ===================== */
    const handleSubmit = async () => {
        if (!item) return

        if (!supervisorId) {
            alert('Please select a supervisor')
            return
        }

        if (!startDateTime || !endDateTime) {
            alert('Please select start and end date/time')
            return
        }

        if (new Date(endDateTime) <= new Date(startDateTime)) {
            alert('End date must be later than start date')
            return
        }

        if (!title.trim()) {
            alert('Please enter a reason')
            return
        }

        try {
            await updateDayOffRequest(item._id, {
                supervisor_id: supervisorId,
                day_off_type: dayOffType,
                start_date_time: startDateTime,
                end_date_time: endDateTime,
                title, // ✅ changed
            })

            onSaved()
            onClose()
        } catch (error) {
            console.error(error)
            alert('Failed to update day off request')
        }
    }

    if (!open || !item) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                {/* Header */}
                <div className="mb-4">
                    <h2 className="text-xl font-semibold text-slate-900">
                        Edit Day Off Request
                    </h2>
                </div>

                <div className="space-y-4">
                    {/* Day Off Type */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Day Off Type
                        </label>
                        <select
                            value={dayOffType}
                            onChange={(e) =>
                                setDayOffType(
                                    e.target.value as 'FULL_DAY' | 'HALF_DAY'
                                )
                            }
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="FULL_DAY">Full Day</option>
                            <option value="HALF_DAY">Half Day</option>
                        </select>
                    </div>

                    {/* Start Date Time */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Start Date & Time
                        </label>
                        <input
                            type="datetime-local"
                            value={startDateTime}
                            onChange={(e) =>
                                setStartDateTime(e.target.value)
                            }
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                        />
                    </div>

                    {/* End Date Time */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            End Date & Time
                        </label>
                        <input
                            type="datetime-local"
                            value={endDateTime}
                            onChange={(e) =>
                                setEndDateTime(e.target.value)
                            }
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                        />
                    </div>

                    {/* Supervisor */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Supervisor
                        </label>
                        <select
                            value={supervisorId}
                            onChange={(e) =>
                                setSupervisorId(e.target.value)
                            }
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

                    {/* Title (Reason) */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Reason
                        </label>
                        <textarea
                            rows={3}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6">
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
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EditDayOffModal
