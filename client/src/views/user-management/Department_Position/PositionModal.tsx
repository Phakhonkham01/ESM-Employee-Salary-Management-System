import React, { useState, useEffect } from 'react'
import {
    createPosition,
    updatePosition,
    getAllDepartments,
    type DepartmentData,
    type PositionData,
} from '../../../services/departments/api'
import { HiX, HiPlus, HiPencil } from 'react-icons/hi'

interface PositionModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    editingPosition?: PositionData | null
    selectedDepartmentId?: string
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
    const [message, setMessage] = useState<{
        type: 'success' | 'error'
        text: string
    } | null>(null)

    useEffect(() => {
        if (isOpen) {
            fetchDepartments()

            // 如果是编辑模式，预填充数据
            if (editingPosition) {
                setPositionName(editingPosition.position_name)
                setSelectedDepartment(editingPosition.department_id)
            } else if (selectedDepartmentId) {
                // 如果是创建模式且有传入的部门ID，自动选中
                setSelectedDepartment(selectedDepartmentId)
            } else {
                // 重置表单
                setPositionName('')
                setSelectedDepartment('')
            }
            setMessage(null)
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
        setLoading(true)
        setMessage(null)

        if (!selectedDepartment) {
            setMessage({ type: 'error', text: 'Please select a department' })
            setLoading(false)
            return
        }

        if (!positionName.trim()) {
            setMessage({ type: 'error', text: 'Please enter position name' })
            setLoading(false)
            return
        }

        try {
            if (editingPosition) {
                // 编辑模式：更新职位
                await updatePosition(editingPosition._id, {
                    position_name: positionName,
                    department_id: selectedDepartment,
                })
                setMessage({
                    type: 'success',
                    text: 'Position updated successfully!',
                })
            } else {
                // 创建模式：新建职位
                await createPosition({
                    department_id: selectedDepartment,
                    position_name: positionName,
                })
                setMessage({
                    type: 'success',
                    text: 'Position created successfully!',
                })
            }

            setTimeout(() => {
                setPositionName('')
                setSelectedDepartment('')
                setMessage(null)
                onSuccess()
                onClose()
            }, 1000)
        } catch (error: any) {
            setMessage({
                type: 'error',
                text:
                    error.message ||
                    `Failed to ${editingPosition ? 'update' : 'create'} position`,
            })
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setPositionName('')
        setSelectedDepartment('')
        setMessage(null)
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

    const modalTitle = editingPosition ? 'Edit Position' : 'Add New Position'
    const submitButtonText = editingPosition
        ? loading
            ? 'Updating...'
            : 'Update Position'
        : loading
          ? 'Creating...'
          : 'Create Position'
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
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10010,
                padding: '20px',
            }}
            onClick={handleBackdropClick}
        >
            <div
                style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    width: '100%',
                    padding: '20px',
                    maxWidth: '500px',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                }}
                onClick={handleModalClick}
            >
                {/* Modal Header */}
                <div
                    style={{
                        padding: '20px 30px',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',

                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: editingPosition
                            ? '#ffffff'
                            : '#ffffff',
                    }}
                >
                    <h3
                        style={{
                            margin: 0,
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#1f2937',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        {modalIcon}
                        {modalTitle}
                    </h3>
                    <button
                        onClick={handleClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: '#6b7280',
                            padding: '4px',
                            borderRadius: '4px',
                        }}
                    >
                        <HiX />
                    </button>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '24px' }}>
                    {message && (
                        <div
                            style={{
                                padding: '12px 16px',
                                marginBottom: '20px',
                                borderRadius: '8px',
                                backgroundColor:
                                    message.type === 'success'
                                        ? '#d1fae5'
                                        : '#fee2e2',
                                color:
                                    message.type === 'success'
                                        ? '#065f46'
                                        : '#991b1b',
                                border: `1px solid ${
                                    message.type === 'success'
                                        ? '#6ee7b7'
                                        : '#fca5a5'
                                }`,
                                fontSize: '14px',
                                fontWeight: '500',
                            }}
                        >
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label
                                style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#374151',
                                }}
                            >
                                Department *
                            </label>
                            <select
                                value={selectedDepartment}
                                onChange={(e) =>
                                    setSelectedDepartment(e.target.value)
                                }
                                disabled
                                className="w-full h-[50px] px-3 py-2 rounded-sm bg-gray-200 text-sm cursor-not-allowed opacity-70"
                            >
                                <option value="">Select Department</option>
                                {departments.map((dept) => (
                                    <option key={dept._id} value={dept._id}>
                                        {dept.department_name}
                                    </option>
                                ))}
                            </select>
                            {editingPosition && (
                                <p
                                    style={{
                                        marginTop: '4px',
                                        fontSize: '12px',
                                        color: '#6b7280',
                                        fontStyle: 'italic',
                                    }}
                                >
                                    Note: Department cannot be changed for
                                    existing positions
                                </p>
                            )}
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label
                                style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#374151',
                                }}
                            >
                                Position Name *
                            </label>
                            <input
                                type="text"
                                value={positionName}
                                onChange={(e) =>
                                    setPositionName(e.target.value)
                                }
                                required
                                placeholder="Enter position name"
                                className="w-full h-[50px] px-3 py-2 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                            />
                        </div>

                        {/* 编辑模式下显示职位信息 */}

                        {/* Modal Footer */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px',
                                paddingTop: '20px',
                                borderTop: '1px solid #e5e7eb',
                            }}
                        >
                            <button
                                type="button"
                                onClick={handleClose}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#FFFFFF',
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
                                    backgroundColor: loading
                                        ? '#9ca3af'
                                        : editingPosition
                                          ? '#45cc67'
                                          : '#45cc67',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
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

export default PositionModal
