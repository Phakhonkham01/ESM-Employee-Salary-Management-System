'use client'

import type React from 'react'
import { useState } from 'react'
import { HiPlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import {
    updateDepartment,
    deleteDepartment,
    updatePosition,
    deletePosition,
} from '../../services/departments/api'
import type {
    DepartmentData,
    PositionData,
} from '../../services/departments/api'
import DepartmentModal from './Department_Position/DepartmentModal'
import PositionModal from './Department_Position/PositionModal'
import Swal from 'sweetalert2'

interface DepartmentPositionManagerProps {
    type: 'department' | 'position'
    selectedId: string
    onSelect: (id: string) => void
    onDepartmentSuccess: () => void
    onPositionSuccess: () => void
    departments: DepartmentData[]
    filteredPositions?: PositionData[]
    loadingDepartments?: boolean
    loadingPositions?: boolean
    selectedDepartmentId?: string
}

const DepartmentPositionManager: React.FC<DepartmentPositionManagerProps> = ({
    type,
    selectedId,
    onSelect,
    onDepartmentSuccess,
    onPositionSuccess,
    departments,
    filteredPositions = [],
    loadingDepartments = false,
    loadingPositions = false,
    selectedDepartmentId = '',
}) => {
    const [departmentModalOpen, setDepartmentModalOpen] = useState(false)
    const [positionModalOpen, setPositionModalOpen] = useState(false)
    const [editingDepartmentId, setEditingDepartmentId] = useState<
        string | null
    >(null)
    const [editingPositionId, setEditingPositionId] = useState<string | null>(
        null,
    )
    const [editDepartmentName, setEditDepartmentName] = useState('')
    const [editPositionName, setEditPositionName] = useState('')

    // Department Functions
    const handleEditDepartment = (
        departmentId: string,
        currentName: string,
    ) => {
        setEditingDepartmentId(departmentId)
        setEditDepartmentName(currentName)
    }

    const handleSaveDepartmentEdit = async () => {
        if (!editingDepartmentId || !editDepartmentName.trim()) return

        try {
            await updateDepartment(editingDepartmentId, {
                department_name: editDepartmentName,
            })
            onDepartmentSuccess()
            setEditingDepartmentId(null)
            setEditDepartmentName('')
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to update department',
            })
        }
    }

    const handleDeleteDepartment = async (
        departmentId: string,
        departmentName: string,
    ) => {
        const result = await Swal.fire({
            title: 'Delete Department?',
            html: `Department <b>${departmentName}</b> will be permanently removed.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#9B1C1C',
            cancelButtonColor: '#E5E7EB',
            reverseButtons: true,
        })

        if (!result.isConfirmed) return

        try {
            await deleteDepartment(departmentId)
            onDepartmentSuccess()

            Swal.fire({
                icon: 'success',
                title: 'Deleted',
                text: 'Department deleted successfully',
                timer: 1500,
                showConfirmButton: false,
            })
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to delete department',
            })
        }
    }

    // Position Functions
    const handleEditPosition = (positionId: string, currentName: string) => {
        setEditingPositionId(positionId)
        setEditPositionName(currentName)
    }

    const handleSavePositionEdit = async () => {
        if (!editingPositionId || !editPositionName.trim()) return

        try {
            await updatePosition(editingPositionId, {
                position_name: editPositionName,
            })
            onPositionSuccess()
            setEditingPositionId(null)
            setEditPositionName('')
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to update position',
            })
        }
    }

    const handleDeletePosition = async (
        positionId: string,
        positionName: string,
    ) => {
        const result = await Swal.fire({
            title: 'Delete Position?',
            html: `Position <b>${positionName}</b> will be permanently removed.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#9B1C1C',
            cancelButtonColor: '#E5E7EB',
            reverseButtons: true,
        })

        if (!result.isConfirmed) return

        try {
            await deletePosition(positionId)
            onPositionSuccess()

            Swal.fire({
                icon: 'success',
                title: 'Deleted',
                text: 'Position deleted successfully',
                timer: 1500,
                showConfirmButton: false,
            })
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to delete position',
            })
        }
    }

    if (type === 'department') {
        if (editingDepartmentId) {
            return (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={editDepartmentName}
                        onChange={(e) => setEditDepartmentName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
                        placeholder="Enter department name"
                    />
                    <button
                        type="button"
                        onClick={handleSaveDepartmentEdit}
                        className="px-3 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-sm"
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setEditingDepartmentId(null)
                            setEditDepartmentName('')
                        }}
                        className="px-3 py-2 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-sm"
                    >
                        Cancel
                    </button>
                </div>
            )
        }

        return (
            <div className="relative">
                <div className="flex gap-2">
                    <select
                        value={selectedId}
                        onChange={(e) => onSelect(e.target.value)}
                        disabled={loadingDepartments}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F] bg-white disabled:bg-gray-100"
                    >
                        <option value="">
                            {loadingDepartments
                                ? 'Loading departments...'
                                : 'Select department'}
                        </option>
                        {departments.map((dept) => (
                            <option key={dept._id} value={dept._id}>
                                {dept.department_name}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        onClick={() => setDepartmentModalOpen(true)}
                        className="text-xs text-[#1F3A5F] hover:text-[#152642] flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-sm hover:bg-gray-50"
                    >
                        <HiPlus className="w-3 h-3" />
                        Add
                    </button>
                </div>

                {selectedId && (
                    <div className="absolute right-25 top-1/2 -translate-y-1/2 flex gap-1.5">
                        <button
                            type="button"
                            onClick={() => {
                                const dept = departments.find(
                                    (d) => d._id === selectedId,
                                )
                                if (dept)
                                    handleEditDepartment(
                                        dept._id,
                                        dept.department_name,
                                    )
                            }}
                            className="p-1.5 text-gray-600 hover:text-[#1F3A5F] hover:bg-gray-100 rounded-sm"
                            title="Edit department"
                        >
                            <HiOutlinePencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const dept = departments.find(
                                    (d) => d._id === selectedId,
                                )
                                if (dept)
                                    handleDeleteDepartment(
                                        dept._id,
                                        dept.department_name,
                                    )
                            }}
                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-sm"
                            title="Delete department"
                        >
                            <HiOutlineTrash className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                <DepartmentModal
                    isOpen={departmentModalOpen}
                    onClose={() => setDepartmentModalOpen(false)}
                    onSuccess={onDepartmentSuccess}
                />
            </div>
        )
    }

    // Position Component
    if (editingPositionId) {
        return (
            <div className="flex gap-2">
                <input
                    type="text"
                    value={editPositionName}
                    onChange={(e) => setEditPositionName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F]"
                    placeholder="Enter position name"
                />
                <button
                    type="button"
                    onClick={handleSavePositionEdit}
                    className="px-3 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-sm"
                >
                    Save
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setEditingPositionId(null)
                        setEditPositionName('')
                    }}
                    className="px-3 py-2 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-sm"
                >
                    Cancel
                </button>
            </div>
        )
    }

    return (
        <div className="relative">
            <div className="flex gap-2">
                <select
                    value={selectedId}
                    onChange={(e) => onSelect(e.target.value)}
                    disabled={!selectedDepartmentId || loadingPositions}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F] bg-white disabled:bg-gray-100"
                >
                    <option value="">
                        {loadingPositions
                            ? 'Loading...'
                            : !selectedDepartmentId
                              ? 'Select department first'
                              : filteredPositions.length === 0
                                ? 'No positions available'
                                : 'Select position'}
                    </option>
                    {filteredPositions.map((pos) => (
                        <option key={pos._id} value={pos._id}>
                            {pos.position_name}
                        </option>
                    ))}
                </select>

                <button
                    type="button"
                    onClick={() => setPositionModalOpen(true)}
                    disabled={!selectedDepartmentId || loadingPositions}
                    className="text-xs text-[#1F3A5F] hover:text-[#152642] flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                    <HiPlus className="w-3 h-3" />
                    Add
                </button>
            </div>

            {selectedId && (
                <div className="absolute right-25 top-1/2 -translate-y-1/2 flex gap-1.5">
                    <button
                        type="button"
                        onClick={() => {
                            const pos = filteredPositions.find(
                                (p) => p._id === selectedId,
                            )
                            if (pos)
                                handleEditPosition(pos._id, pos.position_name)
                        }}
                        className="p-1.5 text-gray-600 hover:text-[#1F3A5F] hover:bg-gray-100 rounded-sm"
                        title="Edit position"
                    >
                        <HiOutlinePencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            const pos = filteredPositions.find(
                                (p) => p._id === selectedId,
                            )
                            if (pos)
                                handleDeletePosition(pos._id, pos.position_name)
                        }}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-sm"
                        title="Delete position"
                    >
                        <HiOutlineTrash className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            <PositionModal
                isOpen={positionModalOpen}
                onClose={() => setPositionModalOpen(false)}
                onSuccess={onPositionSuccess}
                selectedDepartmentId={selectedDepartmentId}
            />
        </div>
    )
}

export default DepartmentPositionManager
