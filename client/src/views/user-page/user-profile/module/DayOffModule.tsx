import { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import { getSupervisors, Supervisor } from '@/services/User_Page/user_api'
import { createDayOffRequest } from '@/services/User_Page/day_off_request_api'

type Props = {
    open: boolean
    onClose: () => void
}

const DayOffModule = ({ open, onClose }: Props) => {
    /* =====================
       State
    ===================== */
    const [dayOffType, setDayOffType] = useState<'FULL_DAY' | 'HALF_DAY'>(
        'FULL_DAY',
    )

    // 📅 Date + ⏰ Time (combined)
    const [startDateTime, setStartDateTime] = useState<Date | null>(null)
    const [endDateTime, setEndDateTime] = useState<Date | null>(null)

    const [title, setTitle] = useState('')

    const [supervisors, setSupervisors] = useState<Supervisor[]>([])
    const [supervisorId, setSupervisorId] = useState('')

    // Admin only
    const [employeeId, setEmployeeId] = useState('')

    const auth = JSON.parse(localStorage.getItem('auth') || 'null')
    const loggedUser = auth?.user
    const role = loggedUser?.role // "Admin" | "Employee"

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

        if (!startDateTime || !endDateTime) {
            alert('Please select start and end date & time')
            return
        }

        if (endDateTime <= startDateTime) {
            alert('End date must be later than start date')
            return
        }

        if (!title.trim()) {
            alert('Please enter a reason')
            return
        }

        const targetEmployeeId = role === 'Admin' ? employeeId : loggedUser._id

        if (!targetEmployeeId) {
            alert('Please select an employee')
            return
        }

        try {
            await createDayOffRequest({
                user_id: loggedUser._id,
                employee_id: targetEmployeeId,
                supervisor_id: supervisorId,
                day_off_type: dayOffType,
                start_date_time: startDateTime.toISOString(),
                end_date_time: endDateTime.toISOString(),
                title,
            })

            onClose()
        } catch (error) {
            console.error(error)
            alert('Failed to submit day off request')
        }
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-visible">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                    Day Off Request
                </h2>

                <div className="space-y-4">
                    {/* Day Off Type */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Day Off Type
                        </label>
                        <select
                            value={dayOffType}
                            onChange={(e) =>
                                setDayOffType(
                                    e.target.value as 'FULL_DAY' | 'HALF_DAY',
                                )
                            }
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="FULL_DAY">Full Day</option>
                            <option value="HALF_DAY">Half Day</option>
                        </select>
                    </div>

                    {/* Start Date & Time */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Start Date & Time
                        </label>
                        <DatePicker
                            selected={startDateTime}
                            onChange={(date: Date | null) =>
                                setStartDateTime(date)
                            }
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={30}
                            dateFormat="dd/MM/yyyy HH:mm"
                            placeholderText="Select start date & time"
                            popperPlacement="bottom-start"
                            calendarClassName="rounded-xl shadow-lg border p-2"
                            wrapperClassName="w-full" // ✅ KEY FIX
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                        />
                    </div>

                    {/* End Date & Time */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            End Date & Time
                        </label>
                        <DatePicker
                            selected={endDateTime}
                            onChange={(date: Date | null) =>
                                setEndDateTime(date)
                            }
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={30}
                            dateFormat="dd/MM/yyyy HH:mm"
                            placeholderText="Select end date & time"
                            minDate={startDateTime ?? undefined}
                            popperPlacement="bottom-start"
                            calendarClassName="rounded-xl shadow-lg border p-2"
                            wrapperClassName="w-full" // ✅ KEY FIX
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                        />
                    </div>

                    {/* Employee (Admin only) */}
                    {role === 'Admin' && (
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Employee
                            </label>
                            <input
                                type="text"
                                placeholder="Employee ID"
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                            />
                        </div>
                    )}

                    {/* Supervisor */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
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
                        <label className="block text-sm font-medium mb-1">
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
                        Submit
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DayOffModule
