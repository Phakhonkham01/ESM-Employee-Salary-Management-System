import React, { useEffect, useState } from 'react'
import axios from 'axios'
import DayOffForm, { DayOffFormData } from '../user-profile/module/DayOffModule'
import UserDayOffRequest, { DayOffItem } from './UserDayOffRequest'
import { loadingStyle } from './HelperComponents'

const MainComponent: React.FC = () => {
    const [dayOffs, setDayOffs] = useState<DayOffItem[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingRequest, setEditingRequest] = useState<DayOffItem | null>(null)

    const auth = JSON.parse(localStorage.getItem('auth') || 'null')
    const userId = auth?.user?._id

    /* ================= FETCH ================= */

    const fetchDayOffs = async () => {
        if (!userId) return

        try {
            setLoading(true)
            const res = await axios.get(`/api/day-off-requests/user/${userId}`)
            setDayOffs(res.data.requests ?? [])
        } catch (error) {
            console.error('Failed to load day off requests:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDayOffs()
    }, [])

    /* ================= ACTION HANDLERS ================= */

    const handleAddRequest = () => {
        setEditingRequest(null)
        setIsFormOpen(true)
    }

    const handleEdit = (item: DayOffItem) => {
        setEditingRequest(item)
        setIsFormOpen(true)
    }

    const handleDelete = async (id: string) => {

        try {
            await axios.delete(`/api/day-off-requests/${id}`)
            // Optimistic update
            setDayOffs(prev => prev.filter(item => item._id !== id))
        } catch (error) {
            console.error('Failed to delete day off request:', error)
            alert('Failed to delete request. Please try again.')
        }
    }

    const handleFormSuccess = () => {
        fetchDayOffs() // Refresh the list
        setEditingRequest(null)
    }

    const handleFormClose = () => {
        setIsFormOpen(false)
        setEditingRequest(null)
    }

    /* ================= Transform DayOffItem to DayOffFormData ================= */

    const transformToFormData = (item: DayOffItem): DayOffFormData => {
        return {
            _id: item._id,
            user_id: item.user_id,
            employee_id: item.employee_id,
            supervisor_id: item.supervisor_id,
            day_off_type: item.day_off_type,
            start_date_time: item.start_date_time,
            end_date_time: item.end_date_time,
            title: item.title,
            status: item.status as 'Pending' | 'Approved' | 'Rejected'
        }
    }

    /* ================= LOADING ================= */

    if (loading) {
        return <div style={loadingStyle}>Loading your day off requests...</div>
    }

    /* ================= UI ================= */

    return (
        <div className="space-y-6">
            {/* Day Off Requests List */}
            <UserDayOffRequest
                dayOffs={dayOffs}
                onEdit={handleEdit}
                onDelete={handleDelete}
                refreshRequests={fetchDayOffs}
            />

            {/* Day Off Form Modal */}
            <DayOffForm
                open={isFormOpen}
                onClose={handleFormClose}
                requestData={editingRequest ? transformToFormData(editingRequest) : undefined}
                onSuccess={handleFormSuccess}
            />
        </div>
    )
}

export default MainComponent