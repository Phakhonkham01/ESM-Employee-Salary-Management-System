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

export interface DayOffItem {
  _id: string

  user_id: string           // actor (admin / employee)
  employee_id: string       // target employee ✅ ADD
  supervisor_id: string

  day_off_type: "FULL_DAY" | "HALF_DAY"
  start_date_time: string
  end_date_time: string
  date_off_number: number
  title: string
  status: RequestStatus
}

/* ================= PROPS ================= */

interface Props {
  dayOffs: DayOffItem[]
  onEdit: (item: DayOffItem) => void
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
      padding: "8px 12px",
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

const UserDayOffRequests: React.FC<Props> = ({
  dayOffs,
  onEdit,
  onDelete,
}) => {
  const auth = JSON.parse(localStorage.getItem("auth") || "null")
  const role = auth?.user?.role // "Admin" | "Employee"

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>
        {role === "Admin" ? "📄 Day Off Requests" : "📄 My Requests"}
      </h2>

      <Section title="🏖 Day Off Requests">
        <table style={{ ...tableStyle, width: "100%" }}>
          <thead>
            <tr>
              {role === "Admin" && (
                <th style={{ ...th, textAlign: "left" }}>
                  Employee ID
                </th>
              )}
              <th style={{ ...th, textAlign: "left" }}>Type</th>
              <th style={{ ...th, textAlign: "left" }}>Start date</th>
              <th style={{ ...th, textAlign: "left" }}>End date</th>
              <th style={{ ...th, textAlign: "left" }}>Days</th>
              <th style={{ ...th, textAlign: "left" }}>Reason</th>
              <th style={{ ...th, textAlign: "left" }}>Status</th>
              <th style={{ ...th, textAlign: "left" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {dayOffs.map((d) => {
              const isPending = d.status === "Pending"

              return (
                <tr key={d._id} style={tr}>
                  {role === "Admin" && (
                    <td style={{ ...td }}>{d.employee_id}</td>
                  )}

                  <td style={{ ...td }}>{d.day_off_type}</td>
                  <td style={{ ...td }}>
                    {formatDate(d.start_date_time)}
                  </td>
                  <td style={{ ...td }}>
                    {formatDate(d.end_date_time)}
                  </td>
                  <td style={{ ...td }}>{d.date_off_number}</td>
                  <td style={{ ...td }}>{d.title}</td>
                  <td style={{ ...td }}>{statusBadge(d.status)}</td>

                  <td style={{ ...td }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <ActionButton
                        color="#3b82f6"
                        hoverColor="#2563eb"
                        disabled={!isPending}
                        onClick={() => onEdit(d)}
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
                            onDelete(d._id)
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

            {dayOffs.length === 0 && <EmptyRow colSpan={role === "Admin" ? 8 : 7} />}
          </tbody>
        </table>
      </Section>
    </div>
  )
}

export default UserDayOffRequests
