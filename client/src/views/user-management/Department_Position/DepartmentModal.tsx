import React, { useState } from 'react'
import { createDepartment } from '../../../services/departments/api'
import { HiX, HiPlus } from 'react-icons/hi'

interface DepartmentModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [departmentName, setDepartmentName] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{
        type: 'success' | 'error'
        text: string
    } | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            await createDepartment({ department_name: departmentName })
            setMessage({
                type: 'success',
                text: 'Department created successfully!',
            })

            setTimeout(() => {
                setDepartmentName('')
                onSuccess()
                onClose()
            }, 1000)
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.message || 'Failed to create department',
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
                        <HiPlus size={20} color="#3b82f6" />
                        Add New Department
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
                                border: `1px solid ${message.type === 'success' ? '#6ee7b7' : '#fca5a5'}`,
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
                                }}
                            />
                        </div>

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
                                    backgroundColor: '#6b7280',
                                    color: 'white',
                                    border: 'none',
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
                                        : '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                }}
                            >
                                {loading ? 'Creating...' : 'Create Department'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default DepartmentModal
