import { useEffect, useState } from 'react'
import { getSupervisors, Supervisor } from '@/services/User_Page/user_api'
import { updateDayOffRequest } from '@/services/User_Page/day_off_request_api'
import { DayOffItem } from './UserDayOffRequest'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import Swal from 'sweetalert2'

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
    const [startDate, setStartDate] = useState<Date | null>(null)
    const [endDate, setEndDate] = useState<Date | null>(null)
    const [title, setTitle] = useState('')

    const [supervisors, setSupervisors] = useState<Supervisor[]>([])
    const [supervisorId, setSupervisorId] = useState('')

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
       Check if date is in current month
    ===================== */
    const isDateInCurrentMonth = (date: Date) => {
        const now = new Date()
        return date.getMonth() === now.getMonth() && 
               date.getFullYear() === now.getFullYear()
    }

    /* =====================
       Custom filter for DatePicker
    ===================== */
    const filterDate = (date: Date) => {
        return isDateInCurrentMonth(date)
    }

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
        setStartDate(new Date(item.start_date_time))
        setEndDate(new Date(item.end_date_time))
        setTitle(item.title)
        setSupervisorId(item.supervisor_id)
    }, [item])

    /* =====================
       Format date for API
    ===================== */
    const formatDateForAPI = (date: Date): string => {
        // Format as YYYY-MM-DD (without time)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    /* =====================
       Submit with SweetAlert2
    ===================== */
    const handleSubmit = async () => {
        if (!item) return

        // Validation with SweetAlert2
        if (!supervisorId) {
            await Swal.fire({
                icon: 'warning',
                title: 'ກະລຸນາເລືອກຫົວໜ້າ',
                confirmButtonText: 'ຕົກລົງ',
                confirmButtonColor: '#3085d6',
            })
            return
        }

        if (!startDate || !endDate) {
            await Swal.fire({
                icon: 'warning',
                title: 'ກະລຸນາເລືອກວັນທີເລີ່ມ ແລະ ວັນທີສິ້ນສຸດ',
                confirmButtonText: 'ຕົກລົງ',
                confirmButtonColor: '#3085d6',
            })
            return
        }

        // Check if dates are in current month
        if (!isDateInCurrentMonth(startDate) || !isDateInCurrentMonth(endDate)) {
            await Swal.fire({
                icon: 'warning',
                title: 'ກະລຸນາເລືອກວັນທີໃນເດືອນປະຈຸບັນ',
                text: 'ບໍ່ສາມາດເລືອກວັນທີໃນເດືອນກ່ອນ ຫຼື ເດືອນຕໍ່ໄປ',
                confirmButtonText: 'ຕົກລົງ',
                confirmButtonColor: '#3085d6',
            })
            return
        }

        if (endDate < startDate) {
            await Swal.fire({
                icon: 'warning',
                title: 'ວັນທີສິ້ນສຸດຕ້ອງຫຼັງວັນທີເລີ່ມ',
                confirmButtonText: 'ຕົກລົງ',
                confirmButtonColor: '#3085d6',
            })
            return
        }

        if (!title.trim()) {
            await Swal.fire({
                icon: 'warning',
                title: 'ກະລຸນາໃສ່ເຫດຜົນ',
                confirmButtonText: 'ຕົກລົງ',
                confirmButtonColor: '#3085d6',
            })
            return
        }

        try {
            // Show loading alert
            Swal.fire({
                title: 'ກຳລັງອັບເດດ...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading()
                }
            })

            await updateDayOffRequest(item._id, {
                supervisor_id: supervisorId,
                day_off_type: dayOffType,
                start_date_time: formatDateForAPI(startDate),
                end_date_time: formatDateForAPI(endDate),
                title,
            })

            // Success alert
            await Swal.fire({
                icon: 'success',
                title: 'ອັບເດດສຳເລັດ!',
                confirmButtonText: 'ຕົກລົງ',
                confirmButtonColor: '#3085d6',
            })

            onSaved()
            onClose()
        } catch (error) {
            console.error(error)
            
            // Error alert
            await Swal.fire({
                icon: 'error',
                title: 'ອັບເດດລົ້ມເຫຼວ',
                text: 'ກະລຸນາລອງໃໝ່ອີກຄັ້ງ',
                confirmButtonText: 'ຕົກລົງ',
                confirmButtonColor: '#d33',
            })
        }
    }

    // Confirm cancel with SweetAlert2
    const handleCancel = async () => {
        const result = await Swal.fire({
            icon: 'question',
            title: 'ຕ້ອງການທີ່ຈະຍົກເລີກ?',
            text: 'ຂໍ້ມູນທີ່ປ່ຽນແປງຈະບໍ່ຖືກບັນທຶກ',
            showCancelButton: true,
            confirmButtonText: 'ຕົກລົງ',
            cancelButtonText: 'ຍົກເລີກ',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
        })

        if (result.isConfirmed) {
            onClose()
        }
    }

    if (!open || !item) return null

    // Custom date picker styles
    const customDatePickerStyles = {
        width: '100%',
        padding: '8px 12px',
        fontSize: '14px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        outline: 'none',
        backgroundColor: 'white',
    }

    const { startOfMonth, endOfMonth } = getCurrentMonthRange()

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40"
                onClick={handleCancel}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                {/* Header */}
                <div className="mb-4">
                    <h2 className="text-xl font-semibold text-slate-900">
                        ແກ້ໄຂການຂໍພັກ
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        ໝາຍເຫດ: ສາມາດເລືອກວັນທີໄດ້ໃນເດືອນປະຈຸບັນເທົ່ານັ້ນ
                    </p>
                </div>

                <div className="space-y-4">
                    {/* Day Off Type */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            ປະເພດການພັກ
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
                            <option value="FULL_DAY">ໝົດມື້</option>
                            <option value="HALF_DAY">ເຄີ່ງມື້</option>
                        </select>
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            ເລີ່ມວັນທີ
                        </label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date: Date | null) => setStartDate(date)}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="ເລືອກວັນທີເລີ່ມ"
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            wrapperClassName="w-full"
                            customInput={<input style={customDatePickerStyles} />}
                            filterDate={filterDate}
                            minDate={startOfMonth}
                            maxDate={endOfMonth}
                            locale="lo"
                            isClearable
                            showMonthYearDropdown
                            dropdownMode="select"
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            ຮອດວັນທີ
                        </label>
                        <DatePicker
                            selected={endDate}
                            onChange={(date: Date | null) => setEndDate(date)}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="ເລືອກວັນທີສິ້ນສຸດ"
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            wrapperClassName="w-full"
                            customInput={<input style={customDatePickerStyles} />}
                            filterDate={filterDate}
                            minDate={startDate || startOfMonth}
                            maxDate={endOfMonth}
                            locale="lo"
                            isClearable
                            showMonthYearDropdown
                            dropdownMode="select"
                        />
                    </div>

                    {/* Supervisor */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            ຫົວໜ້າ
                        </label>
                        <select
                            value={supervisorId}
                            onChange={(e) =>
                                setSupervisorId(e.target.value)
                            }
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="">ເລືອກຫົວໜ້າ</option>
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
                            ເລື່ອງ
                        </label>
                        <textarea
                            rows={3}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            placeholder="ໃສ່ເຫດຜົນການຂໍພັກ..."
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        ຍົກເລິກ
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        ບັນທຶກ
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EditDayOffModal