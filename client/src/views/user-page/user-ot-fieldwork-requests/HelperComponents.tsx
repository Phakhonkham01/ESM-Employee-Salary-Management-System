import React from "react"

/* ================= TYPES ================= */

export type RequestStatus = "Pending" | "Accept" | "Reject"

/* ================= COMPONENTS ================= */

export const Section = ({ title, children }: any) => (
  <div style={{ marginBottom: "40px" }}>
    <h3 style={{ marginBottom: "12px", color: "#1f2937" }}>{title}</h3>
    {children}
  </div>
)

export const EmptyRow = ({ colSpan }: { colSpan: number }) => (
  <tr>
    <td
      colSpan={colSpan}
      style={{ textAlign: "center", padding: "20px", color: "#9ca3af" }}
    >
      No data found
    </td>
  </tr>
)

/* ================= HELPERS ================= */

export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB")

export const statusBadge = (status: RequestStatus) => {
  const map: Record<RequestStatus, [string, string]> = {
    Pending: ["#fef3c7", "#92400e"],
    Accept: ["#d1fae5", "#065f46"],
    Reject: ["#fee2e2", "#991b1b"],
  }

  return (
    <span
      style={{
        backgroundColor: map[status][0],
        color: map[status][1],
        padding: "4px 10px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: 500,
      }}
    >
      {status}
    </span>
  )
}

/* ================= STYLES ================= */

export const containerStyle = {
  backgroundColor: "white",
  padding: "10px",
  borderRadius: "12px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
}

export const titleStyle = {
  marginBottom: "30px",
  fontSize: "20px",
  fontWeight: 600,
  color: "#1f2937",
}

export const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
}

export const th = {
  padding: "12px",
  textAlign: "left" as const,
  backgroundColor: "#f3f4f6",
  fontSize: "13px",
  fontWeight: 600,
  color: "#374151",
}

export const td = {
  padding: "12px",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "14px",
  color: "#374151",
}

export const tr = {
  transition: "background-color 0.2s ease",
}

export const loadingStyle = {
  padding: "40px",
  textAlign: "center" as const,
  color: "#6b7280",
}
