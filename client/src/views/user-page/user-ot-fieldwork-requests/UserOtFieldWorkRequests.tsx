import React from "react"
import { HiPencil, HiTrash } from "react-icons/hi"
import {
  Section,
  EmptyRow,
  formatDate,
  statusBadge,
  containerStyle,
  titleStyle,
  tableStyle,
  th,
  td,
  tr,
  RequestStatus,
} from "./HelperComponents"

/* ================= TYPES ================= */

export interface RequestItem {
  _id: string
  date: string
  title: "OT" | "FIELD_WORK"
  start_hour: string
  end_hour: string
  fuel: number
  reason: string
  status: RequestStatus
}

/* ================= PROPS ================= */

interface Props {
  requests: RequestItem[]
  onEdit: (item: RequestItem) => void
  onDelete: (id: string) => void
}

/* ================= REUSABLE BUTTON ================= */

const ActionButton = ({
  color,
  hoverColor,
  onClick,
  disabled,
  children,
}: {
  color: string
  hoverColor: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) => (
  <button
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    style={{
      padding: "6px 10px",
      backgroundColor: disabled ? "#d1d5db" : color,
      color: disabled ? "#6b7280" : "white",
      border: "none",
      borderRadius: "6px",
      cursor: disabled ? "not-allowed" : "pointer",
      fontSize: "12px",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      gap: "4px",
      opacity: disabled ? 0.6 : 1,
      transition: "background-color 0.2s ease",
    }}
    onMouseEnter={(e) => {
      if (!disabled) e.currentTarget.style.backgroundColor = hoverColor
    }}
    onMouseLeave={(e) => {
      if (!disabled) e.currentTarget.style.backgroundColor = color
    }}
  >
    {children}
  </button>
)

/* ================= UI COMPONENT ================= */

const UserOtFieldWorkRequests: React.FC<Props> = ({
  requests,
  onEdit,
  onDelete,
}) => {
  /* ================= FILTER STATE ================= */

  const [selectedStatus, setSelectedStatus] =
    React.useState<string>("all")
  const [selectedMonth, setSelectedMonth] =
    React.useState<string>("")
  const [selectedType, setSelectedType] =
    React.useState<"all" | "OT" | "FIELD_WORK">("all")

  /* ================= FILTER LOGIC ================= */

  const filteredRequests = requests.filter((r) => {
    if (selectedStatus !== "all" && r.status !== selectedStatus) {
      return false
    }

    if (selectedType !== "all" && r.title !== selectedType) {
      return false
    }

    if (selectedMonth) {
      const month = new Date(r.date).toISOString().slice(0, 7)
      if (month !== selectedMonth) return false
    }

    return true
  })

  /* ================= MONTH OPTIONS ================= */

  const availableMonths = Array.from(
    new Set(
      requests
        .map((r) => new Date(r.date).toISOString().slice(0, 7))
        .filter(Boolean)
    )
  ).sort(
    (a, b) =>
      new Date(a + "-01").getTime() -
      new Date(b + "-01").getTime()
  )

  /* ================= RENDER ================= */

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>📄 My Requests</h2>

      <Section title="⏱ OT / Field Work Requests">
        {/* FILTERS */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}
        >
          <select
            value={selectedType}
            onChange={(e) =>
              setSelectedType(
                e.target.value as "all" | "OT" | "FIELD_WORK"
              )
            }
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              fontSize: "12px",
            }}
          >
            <option value="all">All Types</option>
            <option value="OT">OT</option>
            <option value="FIELD_WORK">Field Work</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              fontSize: "12px",
            }}
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Reject">Rejected</option>
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              fontSize: "12px",
            }}
          >
            <option value="">All Months</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {new Date(m + "-01").toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })}
              </option>
            ))}
          </select>
        </div>

        {/* TABLE */}
        <table
          style={{
            ...tableStyle,
            width: "100%",
            tableLayout: "fixed",
          }}
        >
          <colgroup>
            <col style={{ width: "120px" }} />
            <col style={{ width: "130px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "160px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "180px" }} />
          </colgroup>

          <thead>
            <tr>
              <th style={th}>Type</th>
              <th style={th}>Date</th>
              <th style={th}>Time</th>
              <th style={th}>Fuel</th>
              <th style={th}>Reason</th>
              <th style={th}>Status</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredRequests.map((r) => {
              const isPending = r.status === "Pending"

              return (
                <tr key={r._id} style={tr}>
                  <td style={td}>{r.title}</td>
                  <td style={td}>{formatDate(r.date)}</td>
                  <td style={td}>
                    {r.start_hour} – {r.end_hour}
                  </td>
                  <td style={td}>
                    {r.title === "FIELD_WORK"
                      ? r.fuel.toLocaleString()
                      : "-"}
                  </td>
                  <td
                    style={{
                      ...td,
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      lineHeight: "1.4",
                    }}
                  >
                    {r.reason}
                  </td>
                  <td style={td}>{statusBadge(r.status)}</td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <ActionButton
                        color="#3b82f6"
                        hoverColor="#2563eb"
                        disabled={!isPending}
                        onClick={() => onEdit(r)}
                      >
                        <HiPencil size={14} />
                        Edit
                      </ActionButton>

                      <ActionButton
                        color="#ef4444"
                        hoverColor="#dc2626"
                        disabled={!isPending}
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to cancel this request?"
                            )
                          ) {
                            onDelete(r._id)
                          }
                        }}
                      >
                        <HiTrash size={14} />
                        Cancel
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              )
            })}

            {filteredRequests.length === 0 && (
              <EmptyRow colSpan={7} />
            )}
          </tbody>
        </table>
      </Section>
    </div>
  )
}

export default UserOtFieldWorkRequests
