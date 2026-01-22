import React, { useState, useEffect } from 'react'
import {
    createDepartment,
    updateDepartment,
    type DepartmentData,
} from '../../../services/departments/api'
import { HiX, HiPlus, HiPencil } from 'react-icons/hi'

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
    const [message, setMessage] = useState<{
        type: 'success' | 'error'
        text: string
    } | null>(null)

    useEffect(() => {
        if (editingDepartment) {
            setDepartmentName(editingDepartment.department_name)
        } else {
            setDepartmentName('')
        }
        setMessage(null)
    }, [editingDepartment, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        e.stopPropagation() // 阻止事件冒泡

        if (!departmentName.trim()) {
            setMessage({
                type: 'error',
                text: 'Please enter department name',
            })
            return
        }

        setLoading(true)
        setMessage(null)

        try {
            if (editingDepartment) {
                await updateDepartment(editingDepartment._id, {
                    department_name: departmentName,
                })
                setMessage({
                    type: 'success',
                    text: 'Department updated successfully!',
                })
            } else {
                await createDepartment({ department_name: departmentName })
                setMessage({
                    type: 'success',
                    text: 'Department created successfully!',
                })
            }

            setTimeout(() => {
                setDepartmentName('')
                setMessage(null)
                onSuccess()
                onClose()
            }, 1000)
        } catch (error: any) {
            console.error('Department operation error:', error)
            setMessage({
                type: 'error',
                text:
                    error.message ||
                    'Failed to process department. Please try again.',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setDepartmentName('')
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

    const modalTitle = editingDepartment
        ? 'Edit Department'
        : 'Add New Department'
    const submitButtonText = editingDepartment
        ? loading
            ? 'Updating...'
            : 'Update Department'
        : loading
          ? 'Creating...'
          : 'Create Department'
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
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000, // 确保比 UserFormModal 更高

                animation: 'fadeIn 0.1s ease-out',
            }}
            onClick={handleBackdropClick}
        >
            <div
                style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    width: '100%',
                    padding: '30px',
                    maxWidth: '500px',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    animation: 'slideIn 0.1s ease-out',
                }}
                onClick={handleModalClick}
            >
                {/* Modal Header */}
                <div
                    style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: editingDepartment
                            ? '#ffffff'
                            : '#ffffff',
                        borderTopLeftRadius: '12px',
                        borderTopRightRadius: '12px',
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
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#f3f4f6'
                            e.currentTarget.style.color = '#374151'
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor =
                                'transparent'
                            e.currentTarget.style.color = '#6b7280'
                        }}
                        aria-label="Close modal"
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
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <span>{message.text}</span>
                            {message.type === 'success' && (
                                <span
                                    style={{ animation: 'pulse 1s infinite' }}
                                >
                                    ✓
                                </span>
                            )}
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
                                htmlFor="department-name"
                            >
                                Department Name *
                            </label>
                            <input
                                id="department-name"
                                type="text"
                                value={departmentName}
                                onChange={(e) =>
                                    setDepartmentName(e.target.value)
                                }
                                className="w-full h-[50px] px-3 py-2 border border-none rounded-sm bg-[#F2F2F2] text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
                                required
                                placeholder="Enter department name"
                                disabled={loading}
                                autoFocus
                            />
                        </div>

                        {/* 编辑模式下显示部门ID信息 */}

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
                                disabled={loading}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#f3f4f6',
                                    color: '#374151',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s',
                                    opacity: loading ? 0.6 : 1,
                                }}
                                onMouseOver={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.backgroundColor =
                                            '#e5e7eb'
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.backgroundColor =
                                            '#f3f4f6'
                                    }
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !departmentName.trim()}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: loading
                                        ? '#9ca3af'
                                        : editingDepartment
                                          ? '#45CC67'
                                          : '#45cc67',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor:
                                        loading || !departmentName.trim()
                                            ? 'not-allowed'
                                            : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s',
                                    opacity: !departmentName.trim() ? 0.5 : 1,
                                }}
                                onMouseOver={(e) => {
                                    if (!loading && departmentName.trim()) {
                                        e.currentTarget.style.backgroundColor =
                                            editingDepartment
                                                ? '#45cc67'
                                                : '#45cc67'
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!loading && departmentName.trim()) {
                                        e.currentTarget.style.backgroundColor =
                                            editingDepartment
                                                ? '#45cc10'
                                                : '#45cc67'
                                    }
                                }}
                            >
                                {submitButtonText}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    )
}

export default DepartmentModal
