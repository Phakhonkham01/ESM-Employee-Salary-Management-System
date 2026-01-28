// components/RequestForm.tsx
import { useState, useEffect, useMemo } from 'react'
import { createRequest, updateRequest } from '@/services/User_Page/request_api'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Swal from 'sweetalert2'
import { X, Clock, Calendar, User, FileText, Fuel, AlertTriangle } from 'lucide-react'
import { DepartmentData, getAllDepartments } from '@/services/departments/api'
import { getAllUsers, UserData } from '@/services/Create_user/api'

type RequestType = 'OT' | 'FIELD_WORK'

export interface RequestFormData {
    _id?: string
    user_id: string
    supervisor_id: string
    date: string
    title: RequestType
    start_hour: string
    end_hour: string
    fuel: number
    reason: string
    status?: 'Pending' | 'Approved' | 'Rejected'
}

type Supervisor = {
    _id: string
    first_name_en: string
    last_name_en: string
    role: 'Supervisor'
    department_id?: string | string[] | { _id: string }[]
    status: 'Active' | 'Inactive' | 'On Leave'
}

type Props = {
    open: boolean
    type: RequestType
    onClose: () => void
    requestData?: RequestFormData // For editing
    onSuccess?: () => void // Callback after successful submit
}

const RequestForm = ({ open, type, onClose, requestData, onSuccess }: Props) => {
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
    const [departments, setDepartments] = useState<DepartmentData[]>([])
    const [supervisors, setSupervisors] = useState<Supervisor[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)

    const auth = JSON.parse(localStorage.getItem('auth') || 'null')
    const loggedUser = auth?.user

    /* =====================
      Initialize form for edit mode
    ===================== */
    useEffect(() => {
        if (requestData) {
            setIsEditMode(true)
            // Parse date
            const dateParts = requestData.date.split('-')
            if (dateParts.length === 3) {
                const date = new Date(
                    parseInt(dateParts[0]),
                    parseInt(dateParts[1]) - 1,
                    parseInt(dateParts[2])
                )
                setStartDate(date)
            }

            // Parse start time
            const [startH, startM] = requestData.start_hour.split(':')
            setStartHour(startH)
            setStartMinute(startM)

            // Parse end time
            const [endH, endM] = requestData.end_hour.split(':')
            setEndHour(endH)
            setEndMinute(endM)

            // Set other fields
            setReason(requestData.reason || '')
            setFuel(requestData.fuel?.toString() || '')
        } else {
            setIsEditMode(false)
            resetForm()
        }
    }, [requestData, open])

    /* =====================
      Load supervisors and departments
    ===================== */
    useEffect(() => {
        if (!open) return

        const loadSupervisors = async () => {
            try {
                const response = await getAllUsers()

                // Filter users with role 'Supervisor' and active status
                const supervisorUsers = response.users.filter((user: UserData) =>
                    user.role === 'Supervisor' && user.status === 'Active'
                )

                // Transform to Supervisor type
                const transformedSupervisors: Supervisor[] = supervisorUsers.map((user: UserData) => ({
                    _id: user._id,
                    first_name_en: user.first_name_en,
                    last_name_en: user.last_name_en,
                    role: user.role as 'Supervisor',
                    department_id: user.department_id,
                    status: user.status as 'Active' | 'Inactive' | 'On Leave'
                }))

                console.log('Active Supervisors found:', transformedSupervisors.length)
                setSupervisors(transformedSupervisors)
            } catch (error) {
                console.error('Error loading supervisors:', error)
                setSupervisors([])
            }
        }

        loadSupervisors()
    }, [open])

    useEffect(() => {
        if (!open) return
        getAllDepartments()
            .then((res) => {
                setDepartments(res.departments || [])
            })
            .catch(error => {
                console.error('Error loading departments:', error)
                setDepartments([])
            })
    }, [open])

    /* =====================
       Get user's department(s) and supervisor
    ===================== */
    const normalizeDeptIds = (dept: any): string[] => {
        if (!dept) return []
        if (Array.isArray(dept)) {
            return dept.map(d => {
                if (typeof d === 'string') return d
                if (typeof d === 'object' && d?._id) return d._id
                return null
            }).filter((id): id is string => id !== null)
        }
        if (typeof dept === 'string') return [dept]
        if (typeof dept === 'object' && dept._id) return [dept._id]
        return []
    }

    const userDepartments = useMemo(() => {
        if (!loggedUser?.department_id || departments.length === 0) return []
        const userDeptIds = normalizeDeptIds(loggedUser.department_id)
        return departments.filter(dept => userDeptIds.includes(dept._id))
    }, [departments, loggedUser?.department_id])

    const userSupervisor = useMemo(() => {
        if (!loggedUser?.department_id || supervisors.length === 0) return null

        const userDeptIds = normalizeDeptIds(loggedUser.department_id)

        // Find supervisor in the same department
        const matchingSupervisor = supervisors.find(s => {
            const sDeptIds = normalizeDeptIds(s.department_id)
            return sDeptIds.some(id => userDeptIds.includes(id))
        })

        return matchingSupervisor || null
    }, [loggedUser?.department_id, supervisors])

    const selectedSupervisor = useMemo(() => {
        // First check if we have the original supervisor from requestData
        if (isEditMode && requestData?.supervisor_id) {
            const originalSupervisor = supervisors.find(s => s._id === requestData.supervisor_id)
            if (originalSupervisor) {
                return originalSupervisor
            }
        }

        return userSupervisor
    }, [isEditMode, requestData?.supervisor_id, supervisors, userSupervisor])

    /* =====================
       Current Month Range
    ===================== */
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth()

    const currentMonthStart = new Date(currentYear, currentMonth, 1)
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0)

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
        setIsSubmitting(false)
    }

    /* =====================
       Validation
    ===================== */
    const validateForm = (): { valid: boolean; message?: string } => {
        // Check user login
        if (!loggedUser?._id) {
            return { valid: false, message: 'ຜູ້ໃຊ້ບໍ່ໄດ້ເຂົ້າສູ່ລະບົບ' }
        }

        // Check supervisor exists
        if (!selectedSupervisor) {
            return {
                valid: false,
                message: 'ບໍ່ມີຫົວໜ້າໃນລະບົບ.'
            }
        }

        // Check date
        if (!startDate) {
            return { valid: false, message: 'ກະລຸນາເລືອກວັນທີ' }
        }

        // Validate time values
        const sh = Number(startHour)
        const sm = Number(startMinute)
        const eh = Number(endHour)
        const em = Number(endMinute)

        if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) {
            return { valid: false, message: 'ການປ້ອນຂໍ້ມູນເວລາບໍ່ຖືກຕ້ອງ' }
        }

        if (sh < 0 || sh > 23 || eh < 0 || eh > 23 || sm < 0 || sm > 59 || em < 0 || em > 59) {
            return { valid: false, message: 'ການປ້ອນຂໍ້ມູນເວລາບໍ່ຖືກຕ້ອງ' }
        }

        // Check time range
        const startMinutes = toMinutes(startHour, startMinute)
        const endMinutes = toMinutes(endHour, endMinute)

        if (endMinutes <= startMinutes) {
            return { valid: false, message: 'ເວລາສິ້ນສຸດຕ້ອງຊ້າກວ່າເວລາເລີ່ມຕົ້ນ' }
        }

        // Validate fuel for field work
        if (type === 'FIELD_WORK') {
            const fuelNumber = Number(fuel)
            if (!fuel || isNaN(fuelNumber) || fuelNumber <= 0) {
                return { valid: false, message: 'ກະລຸນາໃສ່ລາຄານໍ້າມັນທີ່ຖືກຕ້ອງ' }
            }
        }

        return { valid: true }
    }

    /* =====================
       Submit Handler
    ===================== */
    const handleSubmit = async () => {
        // Validate form
        const validation = validateForm()
        if (!validation.valid) {
            Swal.fire({
                icon: 'error',
                title: 'ຂໍ້ຜິດພາດ',
                text: validation.message,
            })
            return
        }

        setIsSubmitting(true)
        try {
            const formData = {
                user_id: isEditMode ? requestData!.user_id : loggedUser._id,
                supervisor_id: selectedSupervisor!._id,
                date: formatDateToYYYYMMDD(startDate!),
                title: type,
                start_hour: toTimeString(startHour, startMinute),
                end_hour: toTimeString(endHour, endMinute),
                fuel: type === 'FIELD_WORK' ? Number(fuel) : 0,
                reason,
            }

            if (isEditMode && requestData?._id) {
                // Update existing request
                await updateRequest(requestData._id, formData)
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'ແກ້ໄຂຄຳຂໍສຳເລັດແລ້ວ',
                    timer: 2000,
                    showConfirmButton: false,
                })
            } else {
                // Create new request
                await createRequest(formData)
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'ສົ່ງຄຳຂໍສຳເລັດແລ້ວ',
                    timer: 2000,
                    showConfirmButton: false,
                })
            }

            resetForm()
            onClose()
            if (onSuccess) {
                onSuccess()
            }
        } catch (error) {
            console.error('Request submission error:', error)
            Swal.fire({
                icon: 'error',
                title: isEditMode ? 'ແກ້ໄຂບໍ່ສຳເລັດ' : 'ສົ່ງຄຳຂໍບໍ່ສຳເລັດ',
                text: isEditMode
                    ? 'ການແກ້ໄຂຄຳຂໍບໍ່ສຳເລັດ. ກະລຸນາລອງໃໝ່ອີກຄັ້ງ.'
                    : 'ສົ່ງຄຳຂໍບໍ່ສຳເລັດ. ກະລຸນາລອງໃໝ່ອີກຄັ້ງ.',
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
                        <div>
                            <h2 className="text-xl font-bold">
                                {isEditMode ? 'ແກ້ໄຂຄຳຂໍ' : type === 'OT' ? 'ວຽກລ່ວງເວລາ (OT)' : 'ວຽກນອກສະຖານທີ'}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {isEditMode ? 'ແກ້ໄຂຂໍ້ມູນຄຳຂໍ' : 'ກະລຸນາຕື່ມຂໍ້ມູນຕ່າງໆໃຫ້ຄົບຖ້ວນ'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Mode Indicator */}
                    {isEditMode && (
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                            <p className="text-sm text-blue-700">
                                <span className="font-medium">ສະຖານະ:</span> {requestData?.status || 'Pending'}
                            </p>
                        </div>
                    )}

                    {/* Auto Selected Supervisor Info */}
                    <div className={`border rounded-lg p-4 ${selectedSupervisor ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
                        <div className={`flex items-center gap-2 mb-1 ${selectedSupervisor ? 'text-green-700' : 'text-amber-700'}`}>
                            <User size={16} />
                            <span className="font-medium">ຫົວໜ້າທີ່ຮັບຜິດຊອບ</span>
                        </div>
                        {selectedSupervisor ? (
                            <>
                                <p className="text-sm text-green-800">
                                    {selectedSupervisor.first_name_en} {selectedSupervisor.last_name_en}
                                </p>
                                {userDepartments.length > 0 && (
                                    <p className="text-xs text-green-600 mt-1">
                                        ພະແນກ: {userDepartments.map(dept => dept.department_name).join(', ')}
                                    </p>
                                )}

                            </>
                        ) : (
                            <div>
                                <p className="text-sm text-amber-800 flex items-center gap-1">
                                    <AlertTriangle size={14} />
                                    <span>ບໍ່ພົບຫົວໜ້າໃນລະບົບ</span>
                                </p>
                            </div>
                        )}
                    </div>

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
                            readOnly={isEditMode && requestData?.status !== 'Pending'}
                        />
                        {isEditMode && requestData?.status !== 'Pending' && (
                            <p className="text-xs text-gray-500">
                                ບໍ່ສາມາດແກ້ໄຂວັນທີໄດ້ເນື່ອງຈາກຄຳຂໍໄດ້ຮັບການອະນຸມັດແລ້ວ
                            </p>
                        )}
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
                                    disabled={isEditMode && requestData?.status !== 'Pending'}
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
                                    disabled={isEditMode && requestData?.status !== 'Pending'}
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
                                    disabled={isEditMode && requestData?.status !== 'Pending'}
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
                                    disabled={isEditMode && requestData?.status !== 'Pending'}
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
                                disabled={isEditMode && requestData?.status !== 'Pending'}
                            />
                        </div>
                    )}

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
                            disabled={isEditMode && requestData?.status !== 'Pending'}
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
                        {(!isEditMode || (isEditMode && requestData?.status === 'Pending')) && (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !selectedSupervisor}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        {isEditMode ? 'ກຳລັງແກ້ໄຂ...' : 'ກຳລັງສົ່ງ...'}
                                    </span>
                                ) : (
                                    isEditMode ? 'ບັນທຶກການປ່ຽນແປງ' : 'ຍື່ນຄຳຂໍ'
                                )}
                            </button>
                        )}
                        {isEditMode && requestData?.status !== 'Pending' && (
                            <div className="text-sm text-gray-600 flex items-center">
                                ບໍ່ສາມາດແກ້ໄຂໄດ້ເນື່ອງຈາກຄຳຂໍໄດ້ຮັບການອະນຸມັດແລ້ວ
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RequestForm