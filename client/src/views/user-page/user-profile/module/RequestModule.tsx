import { useState, useEffect } from 'react'
import { createRequest } from '@/services/User_Page/request_api'
import { getSupervisors, Supervisor } from '@/services/User_Page/user_api'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Swal from 'sweetalert2'
import { X, Clock, Calendar, User, FileText, Fuel } from 'lucide-react'

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
    const [startDate, setStartDate] = useState<Date | null>(null)
    const [startHour, setStartHour] = useState('08')
    const [startMinute, setStartMinute] = useState('00')
    const [endHour, setEndHour] = useState('17')
    const [endMinute, setEndMinute] = useState('00')
    const [reason, setReason] = useState('')
    const [fuel, setFuel] = useState('')

    const [supervisors, setSupervisors] = useState<Supervisor[]>([])
    const [supervisorId, setSupervisorId] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const auth = JSON.parse(localStorage.getItem('auth') || 'null')
    const loggedUser = auth?.user

    /* =====================
       Current Month Range
    ===================== */
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth()

    const currentMonthStart = new Date(currentYear, currentMonth, 1)
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0)

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

    const formatDateToYYYYMMDD = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const resetForm = () => {
        setStartDate(null)
        setStartHour('08')
        setStartMinute('00')
        setEndHour('17')
        setEndMinute('00')
        setReason('')
        setFuel('')
        setSupervisorId('')
        setIsSubmitting(false)
    }

    /* =====================
       Submit
    ===================== */
    const handleSubmit = async () => {
        if (!loggedUser?._id) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'ຜູ້ໃຊ້ບໍ່ໄດ້ເຂົ້າສູ່ລະບົບ',
            })
            return
        }

        if (!supervisorId) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'ກະລຸນາເລືອກຫົວໜ້າ',
            })
            return
        }

        if (!startDate) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'ກະລຸນາເລືອກວັນທີ',
            })
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
            Swal.fire({
                icon: 'error',
                title: 'Invalid Input',
                text: 'ການປ້ອນຂໍ້ມູນເວລາບໍ່ຖືກຕ້ອງ',
            })
            return
        }

        const startMinutes = toMinutes(startHour, startMinute)
        const endMinutes = toMinutes(endHour, endMinute)

        if (endMinutes <= startMinutes) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Time Range',
                text: 'ເວລາສິ້ນສຸດຕ້ອງຊ້າກວ່າເວລາເລີ່ມຕົ້ນ',
            })
            return
        }

        // Fuel validation (FIELD_WORK only)
        if (type === 'FIELD_WORK') {
            const fuelNumber = Number(fuel)
            if (!fuel || isNaN(fuelNumber) || fuelNumber <= 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Missing Information',
                    text: 'ກະລຸນາໃສ່ລາຄານໍ້າມັນທີ່ຖືກຕ້ອງ',
                })
                return
            }
        }

        setIsSubmitting(true)
        try {
            await createRequest({
                user_id: loggedUser._id,
                supervisor_id: supervisorId,
                date: formatDateToYYYYMMDD(startDate),
                title: type,
                start_hour: toTimeString(startHour, startMinute),
                end_hour: toTimeString(endHour, endMinute),
                fuel: type === 'FIELD_WORK' ? Number(fuel) : 0,
                reason,
            })

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'ສົ່ງຄຳຂໍສຳເລັດແລ້ວ',
                timer: 2000,
                showConfirmButton: false,
            })
            resetForm()
            onClose()
        } catch (error) {
            console.error(error)
            Swal.fire({
                icon: 'error',
                title: 'Submission Failed',
                text: 'ສົ່ງຄຳຂໍບໍ່ສຳເລັດ. ກະລຸນາລອງໃໝ່ອີກຄັ້ງ.',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    /* =====================
       Render
    ===================== */
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 bg-opacity-50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="bg-white p-6 text-black border-b border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold">
                            {type === 'OT' ? 'ວຽກລ່ວງເວລາ (OT)' : 'ວຽກນອກສະຖານທີ'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    <p className="text-black text-sm">
                        ກະລຸນາຕື່ມຂໍ້ມູນຕ່າງໆໃຫ້ຄົບຖ້ວນ
                    </p>
                </div>

                {/* Form */}
                <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Date */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Calendar size={16} className="text-blue-600" />
                            ວັນທີ່
                        </label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date: Date | null) => setStartDate(date)}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="ເລືອກວັນທີ"
                            minDate={currentMonthStart}
                            maxDate={currentMonthEnd}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Time Section */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Start Time */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Clock size={16} className="text-blue-600" />
                                ເວລາເລີ່ມ
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min={0}
                                    max={23}
                                    value={startHour}
                                    onChange={(e) => setStartHour(e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="HH"
                                />
                                <span className="flex items-center text-gray-500">:</span>
                                <input
                                    type="number"
                                    min={0}
                                    max={59}
                                    value={startMinute}
                                    onChange={(e) => setStartMinute(e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="MM"
                                />
                            </div>
                        </div>

                        {/* End Time */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Clock size={16} className="text-blue-600" />
                                ຮອດ
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min={0}
                                    max={23}
                                    value={endHour}
                                    onChange={(e) => setEndHour(e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="HH"
                                />
                                <span className="flex items-center text-gray-500">:</span>
                                <input
                                    type="number"
                                    min={0}
                                    max={59}
                                    value={endMinute}
                                    onChange={(e) => setEndMinute(e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="MM"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Fuel price (FIELD_WORK only) */}
                    {type === 'FIELD_WORK' && (
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Fuel size={16} className="text-blue-600" />
                                ເງີນຄ່ານ້ຳມັນ (LAK)
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={fuel}
                                onChange={(e) => setFuel(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="ປ້ອນຈຳນວນເງິນ"
                            />
                        </div>
                    )}

                    {/* Supervisor */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <User size={16} className="text-blue-600" />
                            ຫົວໜ້າ
                        </label>
                        <select
                            value={supervisorId}
                            onChange={(e) => setSupervisorId(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                        >
                            <option value="">ເລືອກຫົວໜ້າ</option>
                            {supervisors.map((s) => (
                                <option key={s._id} value={s._id}>
                                    {s.first_name_en} {s.last_name_en}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <FileText size={16} className="text-blue-600" />
                            ເຫດຜົນ / ເນື້ອໃນ
                        </label>
                        <textarea
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="ອະທິບາຍລາຍລະອຽດການຂໍ"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            ຍົກເລິກ
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ກຳລັງສົ່ງ...
                                </span>
                            ) : (
                                'ຍື່ນຄຳຂໍ'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RequestModule