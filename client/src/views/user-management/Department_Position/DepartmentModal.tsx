import React, { useState, useEffect } from 'react'
import {
    createDepartment,
    updateDepartment,
    type DepartmentData,
} from '../../../services/departments/api'
import { HiX, HiPlus, HiPencil } from 'react-icons/hi'
import Swal from 'sweetalert2' // 1. Import SweetAlert2

interface DepartmentModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    editingDepartment?: DepartmentData | null
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    editingDepartment = null,
}) => {
    const [departmentName, setDepartmentName] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (editingDepartment) {
            setDepartmentName(editingDepartment.department_name)
        } else {
            setDepartmentName('')
        }
    }, [editingDepartment, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!departmentName.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'ກະລຸນາປ້ອນຂໍ້ມູນ',
                text: 'ກະລຸນາປ້ອນຊື່ພະແນກ!',
                confirmButtonText: 'ຕົກລົງ',
                confirmButtonColor: '#3b82f6'
            })
            return
        }

        setLoading(true)

        try {
            if (editingDepartment) {
                await updateDepartment(editingDepartment._id, {
                    department_name: departmentName,
                })
                // Success Update
                await Swal.fire({
                    icon: 'success',
                    title: 'ສຳເລັດ!',
                    text: 'ແກ້ໄຂຂໍ້ມູນພະແນກສຳເລັດແລ້ວ',
                    showConfirmButton: false,
                    timer: 1500
                })
            } else {
                await createDepartment({ department_name: departmentName })
                // Success Create
                await Swal.fire({
                    icon: 'success',
                    title: 'ສຳເລັດ!',
                    text: 'ເພີ່ມພະແນກໃໝ່ສຳເລັດແລ້ວ',
                    showConfirmButton: false,
                    timer: 1500
                })
            }

            setDepartmentName('')
            onSuccess()
            onClose()
        } catch (error: any) {
            console.error('Department operation error:', error)
            // Error Message
            Swal.fire({
                icon: 'error',
                title: 'ເກີດຂໍ້ຜິດພາດ!',
                text: error.message || 'ບໍ່ສາມາດດຳເນີນການໄດ້. ກະລຸນາລອງໃໝ່ອີກຄັ້ງ.',
                confirmButtonText: 'ຕົກລົງ',
                confirmButtonColor: '#ef4444'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setDepartmentName('')
        onClose()
    }

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            handleClose()
        }
    }

    const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
    }

    if (!isOpen) return null

    const modalTitle = editingDepartment ? 'ແກ້ໄຂພະແນກ' : 'ເພີ່ມພະແນກໃໝ່'
    const submitButtonText = editingDepartment
        ? loading ? 'ກຳລັງອັບເດດ...' : 'ອັບເດດພະແນກ'
        : loading ? 'ກຳລັງສ້າງ...' : 'ສ້າງພະແນກ'

    const modalIcon = editingDepartment ? (
        <HiPencil size={20} style={{ color: '#3b82f6' }} />
    ) : (
        <HiPlus size={20} style={{ color: '#3b82f6' }} />
    )

    return (
        <div
        style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            padding: '50px',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000, // <--- ປ່ຽນຈາກ 10000 ເປັນ 1000
        }}
        onClick={handleBackdropClick}
    >
            <div
                style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: '500px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                    overflow: 'hidden'
                }}
                onClick={handleModalClick}
            >
                {/* Modal Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#1f2937',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                        {modalIcon} {modalTitle}
                    </h3>
                    <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                        <HiX size={24} />
                    </button>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '24px' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                                ຊື່ພະແນກ *
                            </label>
                            <input
                                type="text"
                                value={departmentName}
                                onChange={(e) => setDepartmentName(e.target.value)}
                                className="w-full h-[50px] px-4 py-2 border rounded-md bg-[#F9FAFB] text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                                placeholder="ປ້ອນຊື່ພະແນກ..."
                                disabled={loading}
                                autoFocus
                            />
                        </div>

                        {/* Modal Footer */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={loading}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#f3f4f6',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    cursor: 'pointer'
                                }}
                            >
                                ຍົກເລີກ
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !departmentName.trim()}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#45CC67',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    opacity: (!departmentName.trim() || loading) ? 0.6 : 1
                                }}
                            >
                                {submitButtonText}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default DepartmentModal