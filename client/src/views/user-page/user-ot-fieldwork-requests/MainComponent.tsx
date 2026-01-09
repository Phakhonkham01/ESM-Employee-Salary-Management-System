import React, { useEffect, useState } from "react"
import axios from "axios"

import UserOtFieldWorkRequests, {
  RequestItem,
} from "./UserOtFieldWorkRequests"
import { loadingStyle } from "./HelperComponents"

const MainComponent: React.FC = () => {
  const [requests, setRequests] = useState<RequestItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth") || "null")
    const userId = auth?.user?._id

    if (!userId) {
      setLoading(false)
      return
    }

    axios
      .get(`/api/requests/user/${userId}`)
      .then((res) => {
        setRequests(res.data.requests ?? [])
      })
      .catch((err) => {
        console.error("Failed to load OT / Field Work requests:", err)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div style={loadingStyle}>Loading your requests...</div>
  }

  return <UserOtFieldWorkRequests requests={requests} />
}

export default MainComponent
