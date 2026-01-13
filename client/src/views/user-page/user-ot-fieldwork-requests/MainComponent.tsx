import React, { useEffect, useState } from "react"
import axios from "axios"

import UserOtFieldWorkRequests, {
  RequestItem,
} from "./UserOtFieldWorkRequests"
import EditRequestModule from "./EditModal"
import RequestDetailModal from "./DetailModal" // ✅ NEW
import { loadingStyle } from "./HelperComponents"

const MainComponent: React.FC = () => {
  const [requests, setRequests] = useState<RequestItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [editing, setEditing] = useState<RequestItem | null>(null)
  const [detailItem, setDetailItem] = useState<RequestItem | null>(null) // ✅ NEW

  /* ================= FETCH DATA ================= */

  const fetchRequests = async () => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth") || "null")
      const userId = auth?.user?._id

      if (!userId) return

      const res = await axios.get(`/api/requests/user/${userId}`)
      setRequests(res.data.requests ?? [])
    } catch (err) {
      console.error("Failed to load OT / Field Work requests:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  /* ================= ACTION HANDLERS ================= */

  const handleEdit = (item: RequestItem) => {
    setEditing(item)
  }

  const handleDetail = (item: RequestItem) => {
    setDetailItem(item)
  }

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/requests/${id}`)
      setRequests((prev) => prev.filter((r) => r._id !== id))
    } catch (err) {
      console.error("Failed to delete request:", err)
      alert("Failed to cancel request. Please try again.")
    }
  }

  /* ================= LOADING ================= */

  if (loading) {
    return <div style={loadingStyle}>Loading your requests...</div>
  }

  /* ================= UI ================= */

  return (
    <>
      <UserOtFieldWorkRequests
        requests={requests}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDetail={handleDetail}   // ✅ CONNECTED
      />

      {/* DETAIL MODAL */}
      {detailItem && (
        <RequestDetailModal
          item={detailItem}
          onClose={() => setDetailItem(null)}
        />
      )}

      {/* EDIT MODAL */}
      <EditRequestModule
        open={!!editing}
        item={editing}
        onClose={() => setEditing(null)}
        onSaved={fetchRequests}
      />
    </>
  )
}

export default MainComponent
