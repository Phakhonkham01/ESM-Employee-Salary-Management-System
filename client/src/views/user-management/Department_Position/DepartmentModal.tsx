import React, { useState, useEffect } from 'react'
import { 
    createDepartment, 
    updateDepartment,
    type DepartmentData 
} from '../../../services/departments/api'
import { HiX, HiPlus, HiPencil } from 'react-icons/hi'

interface DepartmentModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    editingDepartment?: DepartmentData | null // 新增：编辑模式支持
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    editingDepartment = null
}) => {
    const [departmentName, setDepartmentName] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{
        type: 'success' | 'error'
        text: string
    } | null>(null)

    // 当编辑部门时，预填充表单
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
        
        if (!departmentName.trim()) {
            setMessage({
                type: 'error',
                text: 'Please enter department name'
            })
            return
        }

        setLoading(true)
        setMessage(null)

        try {
            if (editingDepartment) {
                // 编辑模式：更新部门
                await updateDepartment(editingDepartment._id, { 
                    department_name: departmentName 
                })
                setMessage({
                    type: 'success',
                    text: 'Department updated successfully!',
                })
            } else {
                // 创建模式：新建部门
                await createDepartment({ department_name: departmentName })
                setMessage({
                    type: 'success',
                    text: 'Department created successfully!',
                })
            }

            setTimeout(() => {
                setDepartmentName('')
                onSuccess()
                onClose()
            }, 1000)
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.message || 'Failed to process department',
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

    if (!isOpen) return null

    const modalTitle = editingDepartment ? 'Edit Department' : 'Add New Department'
    const submitButtonText = editingDepartment 
        ? (loading ? 'Updating...' : 'Update Department')
        : (loading ? 'Creating...' : 'Create Department')
    const modalIcon = editingDepartment ? <HiPencil size={20} color="#3b82f6" /> : <HiPlus size={20} color="#3b82f6" />

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1001,
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
                    overflow: 'auto',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                }}
            >
                {/* Modal Header */}
                <div
                    style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: editingDepartment ? '#fefce8' : '#ffffff'
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
                                    message.type === 'success' ? '#6ee7b7' : '#fca5a5'
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
                                Department Name *
                            </label>
                            <input
                                type="text"
                                value={departmentName}
                                onChange={(e) =>
                                    setDepartmentName(e.target.value)
                                }
                                required
                                placeholder="Enter department name"
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #e0e0e0',
                                    fontSize: '14px',
                                    outline: 'none',
                                    backgroundColor: editingDepartment ? '#f9fafb' : '#ffffff'
                                }}
                                autoFocus
                            />
                        </div>

                        {/* 编辑模式下显示部门ID信息 */}
                        {editingDepartment && (
                            <div style={{ 
                                marginBottom: '20px',
                                padding: '12px',
                                backgroundColor: '#f3f4f6',
                                borderRadius: '8px',
                                fontSize: '13px',
                                color: '#6b7280'
                            }}>
                                <div style={{ marginBottom: '4px' }}>
                                    <strong>Department ID:</strong> {editingDepartment._id}
                                </div>
                                <div>
                                    <strong>Last Updated:</strong> {editingDepartment.updated_at 
                                        ? new Date(editingDepartment.updated_at).toLocaleDateString()
                                        : 'N/A'}
                                </div>
                            </div>
                        )}

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
                                    backgroundColor: '#f3f4f6',
                                    color: '#374151',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s',
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = '#e5e7eb'
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f3f4f6'
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
                                        : editingDepartment
                                        ? '#f59e0b'
                                        : '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s',
                                }}
                                onMouseOver={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.backgroundColor = editingDepartment
                                            ? '#d97706'
                                            : '#2563eb'
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.backgroundColor = editingDepartment
                                            ? '#f59e0b'
                                            : '#3b82f6'
                                    }
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