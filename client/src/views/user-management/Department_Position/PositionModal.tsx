import React, { useState, useEffect } from 'react'
import {
    createPosition,
    updatePosition,
    getAllDepartments,
    type DepartmentData,
    type PositionData,
} from '../../../services/departments/api'
import { HiX, HiPlus, HiPencil } from 'react-icons/hi'
import Swal from 'sweetalert2'

interface PositionModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    editingPosition: PositionData | null
    selectedDepartmentId?: string | string[]
}

const PositionModal: React.FC<PositionModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    editingPosition = null,
    selectedDepartmentId = '',
}) => {
    const [positionName, setPositionName] = useState('')
    const [selectedDepartment, setSelectedDepartment] = useState('')
    const [departments, setDepartments] = useState<DepartmentData[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen) {
            fetchDepartments()

            if (editingPosition) {
                setPositionName(editingPosition.position_name)
                setSelectedDepartment(editingPosition.department_id)
            } else if (selectedDepartmentId) {
                const deptId = Array.isArray(selectedDepartmentId)
                    ? selectedDepartmentId[0] || ''
                    : selectedDepartmentId
                setSelectedDepartment(deptId)
            } else {
                setPositionName('')
                setSelectedDepartment('')
            }
        }
    }, [isOpen, editingPosition, selectedDepartmentId])

    const fetchDepartments = async () => {
        try {
            const response = await getAllDepartments()
            setDepartments(response.departments || [])
        } catch (error) {
            console.error('Error fetching departments:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        e.stopPropagation()

        // Validation
        if (!selectedDepartment) {
            Swal.fire({
                icon: 'warning',
                title: 'ແຈ້ງເຕືອນ',
                text: 'ກະລຸນາເລືອກພະແນກກ່ອນ!',
                confirmButtonColor: '#3b82f6',
                target: 'body'
            })
            return
        }

        if (!positionName.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'ແຈ້ງເຕືອນ',
                text: 'ກະລຸນາປ້ອນຊື່ຕຳແໜ່ງ!',
                confirmButtonColor: '#3b82f6',
                target: 'body'
            })
            return
        }

        setLoading(true)

        try {
            if (editingPosition) {
                await updatePosition(editingPosition._id, {
                    position_name: positionName,
                    department_id: selectedDepartment,
                })
                await Swal.fire({
                    icon: 'success',
                    title: 'ສຳເລັດ!',
                    text: 'ແກ້ໄຂຂໍ້ມູນຕຳແໜ່ງສຳເລັດແລ້ວ',
                    showConfirmButton: false,
                    timer: 1500,
                    target: 'body'
                })
            } else {
                await createPosition({
                    department_id: selectedDepartment,
                    position_name: positionName,
                })
                await Swal.fire({
                    icon: 'success',
                    title: 'ສຳເລັດ!',
                    text: 'ເພີ່ມຕຳແໜ່ງໃໝ່ສຳເລັດແລ້ວ',
                    showConfirmButton: false,
                    timer: 1500,
                    target: 'body'
                })
            }
            
            onSuccess()
            handleClose()
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'ເກີດຂໍ້ຜິດພາດ!',
                text: error.message || 'ບໍ່ສາມາດດຳເນີນການໄດ້',
                confirmButtonColor: '#ef4444',
                target: 'body'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setPositionName('')
        setSelectedDepartment('')
        onClose()
    }

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            handleClose()
        }
    }

    if (!isOpen) return null

    const modalTitle = editingPosition ? 'Edit Position' : 'Add New Position'
    const submitButtonText = loading ? 'Processing...' : (editingPosition ? 'Update Position' : 'Create Position')
    const modalIcon = editingPosition ? (
        <HiPencil size={20} color="#f59e0b" />
    ) : (
        <HiPlus size={20} color="#3b82f6" />
    )

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.4)', // ປັບໃຫ້ເຂັ້ມຂຶ້ນເລັກນ້ອຍເພື່ອຄວາມງາມ
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000, // ປັບລົງມາເພື່ອໃຫ້ Swal (1060+) ທັບໄດ້
                padding: '20px',
            }}
            onClick={handleBackdropClick}
        >
            <div
                style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: '500px',
                    maxHeight: '90vh',
                    overflow: 'hidden', // ປ່ຽນເປັນ hidden ແລ້ວໃຫ້ scroll ສະເພາະ body
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                    display: 'flex',
                    flexDirection: 'column'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div
                    style={{
                        padding: '20px 30px',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {modalIcon}
                        {modalTitle}
                    </h3>
                    <button onClick={handleClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' }}>
                        <HiX />
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit}>
                    <div style={{ padding: '24px', overflowY: 'auto' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                                Department *
                            </label>
                            <select
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                disabled={!!editingPosition || loading}
                                className="w-full h-[50px] px-3 py-2 rounded-sm bg-[#F2F2F2] text-sm focus:outline-none"
                                style={{
                                    cursor: editingPosition ? 'not-allowed' : 'pointer',
                                    opacity: editingPosition ? 0.7 : 1,
                                    border: '1px solid #e5e7eb'
                                }}
                            >
                                <option value="">Select Department</option>
                                {departments.map((dept) => (
                                    <option key={dept._id} value={dept._id}>
                                        {dept.department_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                                Position Name *
                            </label>
                            <input
                                type="text"
                                value={positionName}
                                onChange={(e) => setPositionName(e.target.value)}
                                disabled={loading}
                                placeholder="Enter position name"
                                className="w-full h-[50px] px-3 py-2 border rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                style={{ border: '1px solid #e5e7eb' }}
                            />
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px',
                            padding: '20px 30px',
                            borderTop: '1px solid #e5e7eb',
                            backgroundColor: '#f9fafb'
                        }}
                    >
                        <button
                            type="button"
                            onClick={handleClose}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: 'white',
                                color: '#6b7280',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: loading ? '#9ca3af' : '#45cc67',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                minWidth: '140px'
                            }}
                        >
                            {submitButtonText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default PositionModal