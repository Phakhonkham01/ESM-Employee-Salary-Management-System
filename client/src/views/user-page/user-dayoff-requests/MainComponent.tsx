import React, { useEffect, useState } from "react"
import axios from "axios"
import EditDayOffModal from "./EditDayOff"

import UserDayOffRequest, {
  DayOffItem,
} from "./UserDayOffRequest"
import { loadingStyle } from "./HelperComponents"

const MainComponent: React.FC = () => {
  const [dayOffs, setDayOffs] = useState<DayOffItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const auth = JSON.parse(localStorage.getItem("auth") || "null")
  const userId = auth?.user?._id
  const [editingItem, setEditingItem] = useState<DayOffItem | null>(null)
const [openEdit, setOpenEdit] = useState(false)


  /* ================= FETCH ================= */

  const fetchDayOffs = async () => {
    if (!userId) return

    try {
      setLoading(true)
      const res = await axios.get(
        `/api/day-off-requests/user/${userId}`
      )
      setDayOffs(res.data.requests ?? [])
    } catch (error) {
      console.error("Failed to load day off requests:", error)
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
      fetchDayOffs() // 🔄 refresh list
    } catch (error) {
      console.error("Failed to delete day off request:", error)
      alert("Failed to delete request")
    }
  }

  /* ================= EDIT ================= */
const handleEdit = (item: DayOffItem) => {
      console.log("Edit day off request:", item)

  setEditingItem(item)
  setOpenEdit(true)
}


  /* ================= UI ================= */

  if (loading) {
    return (
      <div style={loadingStyle}>
        Loading your day off requests...
      </div>
    )
  }

return (
  <>
    <UserDayOffRequest
      dayOffs={dayOffs}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />

    <EditDayOffModal
      open={openEdit}
      item={editingItem}
      onClose={() => setOpenEdit(false)}
      onSaved={fetchDayOffs}
    />
  </>
)
}

export default MainComponent
