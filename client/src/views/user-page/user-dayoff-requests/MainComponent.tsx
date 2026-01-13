import React, { useEffect, useState } from 'react'
import axios from 'axios'

import UserDayOffRequest, { DayOffItem } from './UserDayOffRequest'
import EditDayOffModal from './EditModal'
import DayOffDetailModal from './DetailModal'
import { loadingStyle } from './HelperComponents'

const MainComponent: React.FC = () => {
  const [dayOffs, setDayOffs] = useState<DayOffItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const auth = JSON.parse(localStorage.getItem('auth') || 'null')
  const userId = auth?.user?._id

  // ✏️ Edit
  const [editingItem, setEditingItem] = useState<DayOffItem | null>(null)
  const [openEdit, setOpenEdit] = useState(false)

  // 👁 Detail
  const [detailItem, setDetailItem] = useState<DayOffItem | null>(null)
  const [openDetail, setOpenDetail] = useState(false)

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

  /* ================= DELETE ================= */

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/day-off-requests/${id}`)
      fetchDayOffs()
    } catch (error) {
      console.error('Failed to delete day off request:', error)
      alert('Failed to delete request')
    }
  }

  /* ================= EDIT ================= */

  const handleEdit = (item: DayOffItem) => {
    setEditingItem(item)
    setOpenEdit(true)
  }

  /* ================= DETAIL ================= */

  const handleDetail = (item: DayOffItem) => {
    setDetailItem(item)
    setOpenDetail(true)
  }

  /* ================= UI ================= */

  if (loading) {
    return <div style={loadingStyle}>Loading your day off requests...</div>
  }

  return (
    <>
      <UserDayOffRequest
        dayOffs={dayOffs}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDetail={handleDetail}
      />

      {/* EDIT MODAL */}
      <EditDayOffModal
        open={openEdit}
        item={editingItem}
        onClose={() => setOpenEdit(false)}
        onSaved={fetchDayOffs}
      />

      {/* DETAIL MODAL */}
      {openDetail && detailItem && (
        <DayOffDetailModal
          item={detailItem}
          onClose={() => setOpenDetail(false)}
        />
      )}
    </>
  )
}

export default MainComponent
