import React, { useEffect, useState } from 'react'
import axios from 'axios'
import UserOtFieldWorkRequests, { RequestItem } from './UserOtFieldWorkRequests'
import RequestForm, { RequestFormData } from '@/views/user-page/user-profile/module/RequestModule'
import { loadingStyle } from './HelperComponents'

const MainComponent: React.FC = () => {
    const [requests, setRequests] = useState<RequestItem[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [editingRequest, setEditingRequest] = useState<RequestItem | null>(null)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [requestType, setRequestType] = useState<'OT' | 'FIELD_WORK'>('OT')

    /* ================= FETCH DATA ================= */

    const fetchRequests = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth') || 'null')
            const userId = auth?.user?._id

            if (!userId) return

            const res = await axios.get(`/api/requests/user/${userId}`)
            setRequests(res.data.requests ?? [])
        } catch (err) {
            console.error('Failed to load OT / Field Work requests:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRequests()
    }, [])

    /* ================= ACTION HANDLERS ================= */

    const handleEdit = (item: RequestItem) => {
        setEditingRequest(item)
        setRequestType(item.title as 'OT' | 'FIELD_WORK')
        setIsFormOpen(true)
    }

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`/api/requests/${id}`)

            // Optimistic UI update
            setRequests((prev) => prev.filter((r) => r._id !== id))
        } catch (err) {
            console.error('Failed to delete request:', err)
            alert('Failed to cancel request. Please try again.')
        }
    }

    const handleFormSuccess = () => {
        fetchRequests() // Refresh the list after successful submit
        setEditingRequest(null)
    }

    const handleFormClose = () => {
        setIsFormOpen(false)
        setEditingRequest(null)
    }

    /* ================= Transform RequestItem to RequestFormData ================= */

    const transformToFormData = (item: RequestItem): RequestFormData => {
        return {
            _id: item._id,
            user_id: item._id,
            supervisor_id: item._id,
            date: item.date,
            title: item.title as 'OT' | 'FIELD_WORK',
            start_hour: item.start_hour,
            end_hour: item.end_hour,
            fuel: item.fuel || 0,
            reason: item.reason || '',
            status: item.status as 'Pending' | 'Approved' | 'Rejected'
        }
    }

    /* ================= LOADING ================= */

    if (loading) {
        return <div style={loadingStyle}>Loading your requests...</div>
    }

    /* ================= UI ================= */

    return (
        <div className="space-y-6">
            {/* Requests List */}
            <UserOtFieldWorkRequests
                requests={requests}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Request Form Modal */}
            <RequestForm
                open={isFormOpen}
                type={requestType}
                onClose={handleFormClose}
                requestData={editingRequest ? transformToFormData(editingRequest) : undefined}
                onSuccess={handleFormSuccess}
            />
        </div>
    )
}

export default MainComponent