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
      if (!disabled)
        e.currentTarget.style.backgroundColor = hoverColor
    }}
    onMouseLeave={(e) => {
      if (!disabled)
        e.currentTarget.style.backgroundColor = color
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
  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>📄 My Requests</h2>

      <Section title="⏱ OT / Field Work Requests">
        <table style={{ ...tableStyle, width: "100%" }}>
          <colgroup>
            <col />
            <col />
            <col />
            <col />
            <col />
            <col />
          </colgroup>

          <thead>
            <tr>
              <th style={th}>Type</th>
              <th style={th}>Date</th>
              <th style={th}>Time</th>
              <th style={th}>Reason</th>
              <th style={th}>Status</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((r) => {
              const isPending = r.status === "Pending"

              return (
                <tr key={r._id} style={tr}>
                  <td style={td}>{r.title}</td>
                  <td style={td}>{formatDate(r.date)}</td>
                  <td style={td}>
                    {r.start_hour} – {r.end_hour}
                  </td>
                  <td style={td}>{r.reason}</td>
                  <td style={td}>{statusBadge(r.status)}</td>

                  {/* ACTIONS */}
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

            {requests.length === 0 && <EmptyRow colSpan={6} />}
          </tbody>
        </table>
      </Section>
    </div>
  )
}

export default UserOtFieldWorkRequests
