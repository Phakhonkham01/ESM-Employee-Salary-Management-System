import { useEffect, useState } from 'react'
import { getSupervisors, Supervisor } from '@/services/User_Page/user_api'
import { updateDayOffRequest } from '@/services/User_Page/day_off_request_api'
import { DayOffItem } from './UserDayOffRequest'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import Swal from 'sweetalert2'
import { X, Calendar, User, FileText, Clock, Sun, Moon, Coffee, Edit, RefreshCw } from 'lucide-react'

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
    const [dayOffType, setDayOffType] = useState<'FULL_DAY' | 'HALF_DAY'>('FULL_DAY')
    const [startDate, setStartDate] = useState<Date | null>(null)
    const [endDate, setEndDate] = useState<Date | null>(null)
    const [title, setTitle] = useState('')
    const [halfDayPeriod, setHalfDayPeriod] = useState<'MORNING' | 'AFTERNOON'>('MORNING')
    const [supervisors, setSupervisors] = useState<Supervisor[]>([])
    const [supervisorId, setSupervisorId] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    /* =====================
       Get current month range
    ===================== */
    const getCurrentMonthRange = () => {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        return { startOfMonth, endOfMonth }
    }

    /* =====================
       Calculate total days
    ===================== */
    const calculateTotalDays = () => {
        if (dayOffType === 'FULL_DAY') {
            if (!startDate || !endDate) return 0
            const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            return diffDays + 1 // Include both start and end day
        } else {
            return 0.5
        }
    }

    const totalDays = calculateTotalDays()

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
        const start = new Date(item.start_date_time)
        const end = new Date(item.end_date_time)
        
        setStartDate(start)
        setEndDate(end)
        setTitle(item.title)
        setSupervisorId(item.supervisor_id)

        // Determine if it's morning or afternoon for half day
        if (item.day_off_type === 'HALF_DAY') {
            const hour = start.getHours()
            setHalfDayPeriod(hour < 12 ? 'MORNING' : 'AFTERNOON')
        }
    }, [item])

    /* =====================
       Format date/time for API
    ===================== */
    const getDateTimeForFullDay = (date: Date, isStart: boolean) => {
        const d = new Date(date)
        if (isStart) {
            d.setHours(0, 0, 0, 0) // Start of day
        } else {
            d.setHours(23, 59, 59, 999) // End of day
        }
        return d.toISOString()
    }

    const getDateTimeForHalfDay = (date: Date, period: 'MORNING' | 'AFTERNOON') => {
        const d = new Date(date)
        if (period === 'MORNING') {
            d.setHours(8, 30, 0, 0) // Morning: 8:30 AM
            return {
                start: d.toISOString(),
                end: new Date(d.setHours(12, 0, 0, 0)).toISOString()
            }
        } else {
            d.setHours(13, 30, 0, 0) // Afternoon: 1:30 PM
            return {
                start: d.toISOString(),
                end: new Date(d.setHours(17, 0, 0, 0)).toISOString()
            }
        }
    }

    /* =====================
       Submit with SweetAlert2
    ===================== */
    const handleSubmit = async () => {
        if (!item) return

        // Validation
        if (!supervisorId) {
            Swal.fire({
                icon: 'warning',
                title: 'ຂໍ້ມູນບໍ່ຄົບຖ້ວນ',
                text: 'ກະລຸນາເລືອກຫົວໜ້າ',
                confirmButtonColor: '#2563eb',
            })
            return
        }

        if (!startDate) {
            Swal.fire({
                icon: 'warning',
                title: 'ຂໍ້ມູນບໍ່ຄົບຖ້ວນ',
                text: 'ກະລຸນາເລືອກວັນທີເລີ່ມ',
                confirmButtonColor: '#2563eb',
            })
            return
        }

        if (dayOffType === 'FULL_DAY' && !endDate) {
            Swal.fire({
                icon: 'warning',
                title: 'ຂໍ້ມູນບໍ່ຄົບຖ້ວນ',
                text: 'ກະລຸນາເລືອກວັນທີສິ້ນສຸດ',
                confirmButtonColor: '#2563eb',
            })
            return
        }

        if (dayOffType === 'FULL_DAY' && endDate && endDate < startDate) {
            Swal.fire({
                icon: 'warning',
                title: 'ວັນທີບໍ່ຖືກຕ້ອງ',
                text: 'ວັນທີສິ້ນສຸດຕ້ອງຫຼັງວັນທີເລີ່ມ',
                confirmButtonColor: '#2563eb',
            })
            return
        }

        if (!title.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'ຂໍ້ມູນບໍ່ຄົບຖ້ວນ',
                text: 'ກະລຸນາໃສ່ເຫດຜົນ',
                confirmButtonColor: '#2563eb',
            })
            return
        }

        setIsSubmitting(true)
        let startDateTime: string
        let endDateTime: string

        try {
            if (dayOffType === 'FULL_DAY') {
                if (!endDate) throw new Error('End date required')
                startDateTime = getDateTimeForFullDay(startDate, true)
                endDateTime = getDateTimeForFullDay(endDate, false)
            } else {
                const halfDayTimes = getDateTimeForHalfDay(startDate, halfDayPeriod)
                startDateTime = halfDayTimes.start
                endDateTime = halfDayTimes.end
            }

            await updateDayOffRequest(item._id, {
                supervisor_id: supervisorId,
                day_off_type: dayOffType,
                start_date_time: startDateTime,
                end_date_time: endDateTime,
                title,
            })

            Swal.fire({
                icon: 'success',
                title: 'ອັບເດດສຳເລັດ!',
                text: 'ການແກ້ໄຂຂໍ້ມູນມື້ພັກສຳເລັດ',
                confirmButtonColor: '#2563eb',
                timer: 2000,
            })

            onSaved()
            onClose()
        } catch (error) {
            console.error(error)
            Swal.fire({
                icon: 'error',
                title: 'ອັບເດດລົ້ມເຫຼວ',
                text: 'ກະລຸນາລອງໃໝ່ອີກຄັ້ງ',
                confirmButtonColor: '#d33',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!open || !item) return null

    const { startOfMonth, endOfMonth } = getCurrentMonthRange()

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
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h2 className="text-2xl font-bold">
                                <Edit className="inline mr-2" size={24} />
                                ແກ້ໄຂຄຳຂໍມື້ພັກ
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
                        ກະລຸນາແກ້ໄຂຂໍ້ມູນການຂໍມື້ພັກຕາມທີ່ຕ້ອງການ
                    </p>
                </div>

                {/* Form */}
                <div className="p-8 space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto no-scrollbar">
                    {/* Day Off Type Selection */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Clock size={18} className="text-blue-600" />
                            ປະເພດການພັກ
                        </label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setDayOffType('FULL_DAY')
                                    if (dayOffType === 'HALF_DAY') {
                                        setEndDate(startDate)
                                    }
                                }}
                                className={`flex-1 px-6 py-4 rounded-xl border-2 transition-all ${dayOffType === 'FULL_DAY'
                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-25'
                                }`}
                            >
                                <div className="flex flex-col items-center">
                                    <div className="text-lg font-semibold">ໝົດມື້</div>
                                    <div className="text-sm text-gray-500 mt-1">ພັກທັງໝົດມື້</div>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setDayOffType('HALF_DAY')
                                    setEndDate(null)
                                }}
                                className={`flex-1 px-6 py-4 rounded-xl border-2 transition-all ${dayOffType === 'HALF_DAY'
                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-25'
                                }`}
                            >
                                <div className="flex flex-col items-center">
                                    <div className="text-lg font-semibold">ເຄິ່ງມື້</div>
                                    <div className="text-sm text-gray-500 mt-1">ພັກສະເພາະຊ່ວງ</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Date Selection Section */}
                    {dayOffType === 'FULL_DAY' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Start Date */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Calendar size={18} className="text-blue-600" />
                                    ວັນທີເລີ່ມຕົ້ນ
                                </label>
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date: Date | null) => setStartDate(date)}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="ເລືອກວັນທີເລີ່ມ"
                                    minDate={startOfMonth}
                                    maxDate={endOfMonth}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                                <p className="text-xs text-gray-500">
                                    ສາມາດເລືອກວັນທີພາຍໃນເດືອນນີ້ເທົ່ານັ້ນ
                                </p>
                            </div>

                            {/* End Date */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Calendar size={18} className="text-blue-600" />
                                    ວັນທີສິ້ນສຸດ
                                </label>
                                <DatePicker
                                    selected={endDate}
                                    onChange={(date: Date | null) => setEndDate(date)}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="ເລືອກວັນທີສິ້ນສຸດ"
                                    minDate={startDate || startOfMonth}
                                    maxDate={endOfMonth}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                                <p className="text-xs text-gray-500">
                                    ວັນທີສິ້ນສຸດຕ້ອງບໍ່ຕ່ຳກວ່າວັນທີເລີ່ມ
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Date for Half Day */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Calendar size={18} className="text-blue-600" />
                                    ວັນທີພັກ
                                </label>
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date: Date | null) => setStartDate(date)}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="ເລືອກວັນທີ"
                                    minDate={startOfMonth}
                                    maxDate={endOfMonth}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Half Day Period Selection */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Clock size={18} className="text-blue-600" />
                                    ຊ່ວງເວລາທີ່ພັກ
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setHalfDayPeriod('MORNING')}
                                        className={`px-6 py-4 rounded-xl border-2 transition-all ${halfDayPeriod === 'MORNING'
                                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-25'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Sun size={20} className={halfDayPeriod === 'MORNING' ? 'text-blue-500' : 'text-gray-400'} />
                                            <div className="text-left">
                                                <div className="font-semibold">ຊ່ວງເຊົ້າ</div>
                                                <div className="text-sm text-gray-500">8:30 AM - 12:00 PM</div>
                                            </div>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setHalfDayPeriod('AFTERNOON')}
                                        className={`px-6 py-4 rounded-xl border-2 transition-all ${halfDayPeriod === 'AFTERNOON'
                                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-25'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Moon size={20} className={halfDayPeriod === 'AFTERNOON' ? 'text-blue-500' : 'text-gray-400'} />
                                            <div className="text-left">
                                                <div className="font-semibold">ຊ່ວງບ່າຍ</div>
                                                <div className="text-sm text-gray-500">1:30 PM - 5:00 PM</div>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Supervisor Selection */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <User size={18} className="text-blue-600" />
                            ຫົວໜ້າຜູ້ອະນຸມັດ
                        </label>
                        <select
                            value={supervisorId}
                            onChange={(e) => setSupervisorId(e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
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
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <FileText size={18} className="text-blue-600" />
                            ເຫດຜົນ ແລະ ລາຍລະອຽດ
                        </label>
                        <textarea
                            rows={4}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="ອະທິບາຍເຫດຜົນການແກ້ໄຂມື້ພັກ..."
                        />
                    </div>

                    {/* Total Days Display */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-lg font-semibold text-gray-800">
                                    ຈຳນວນມື້ພັກທັງໝົດ
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                    {dayOffType === 'FULL_DAY' && startDate && endDate 
                                        ? `${startDate.toLocaleDateString('en-GB')} ຫາ ${endDate.toLocaleDateString('en-GB')}`
                                        : dayOffType === 'HALF_DAY' && startDate
                                        ? `ວັນທີ ${startDate.toLocaleDateString('en-GB')} (${halfDayPeriod === 'MORNING' ? 'ເຊົ້າ' : 'ບາຍ'})`
                                        : 'ກະລຸນາເລືອກວັນທີ'
                                    }
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-blue-600">
                                    {totalDays > 0 ? totalDays.toFixed(1) : '0.0'}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                    {dayOffType === 'FULL_DAY' ? 'ມື້' : 'ມື້ (ເຄິ່ງມື້)'}
                                </div>
                            </div>
                        </div>
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
                            disabled={isSubmitting || totalDays <= 0}
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base shadow-md"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ກຳລັງອັບເດດ...
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

export default EditDayOffModal