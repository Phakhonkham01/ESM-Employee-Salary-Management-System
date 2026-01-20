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
  user_id: string
  employee_id: string
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

/* ================= BUTTON ================= */

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
      if (!disabled) e.currentTarget.style.backgroundColor = hoverColor
    }}
    onMouseLeave={(e) => {
      if (!disabled) e.currentTarget.style.backgroundColor = color
    }}
  >
    {children}
  </button>
)

/* ================= FILTER STYLES ================= */

const filterContainerStyle: React.CSSProperties = {
  display: "flex",
  gap: "16px",
  marginBottom: "20px",
  padding: "16px",
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  flexWrap: "wrap",
  alignItems: "center",
}

const filterGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
}

const filterLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#374151",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
}

const selectStyle: React.CSSProperties = {
  padding: "8px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "14px",
  backgroundColor: "white",
  cursor: "pointer",
  minWidth: "150px",
  outline: "none",
}

/* ================= COMPONENT ================= */

const UserDayOffRequests: React.FC<Props> = ({
  dayOffs,
  onEdit,
  onDelete,
}) => {
  const auth = JSON.parse(localStorage.getItem("auth") || "null")
  const role = auth?.user?.role

  const [selectedStatus, setSelectedStatus] = React.useState<string>("all")
  const [selectedMonth, setSelectedMonth] = React.useState<string>("")
  const [selectedType, setSelectedType] = React.useState<string>("all")

  const filteredDayOffs = dayOffs.filter((d) => {
    if (selectedStatus !== "all" && d.status !== selectedStatus)
      return false

    if (selectedType !== "all" && d.day_off_type !== selectedType)
      return false

    if (selectedMonth) {
      const month = new Date(d.start_date_time)
        .toISOString()
        .slice(0, 7)
      if (month !== selectedMonth) return false
    }

    return true
  })

  const availableMonths = Array.from(
    new Set(
      dayOffs.map((d) =>
        new Date(d.start_date_time).toISOString().slice(0, 7)
      )
    )
  ).sort().reverse()

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>
        {role === "Admin" ? "📄 Day Off Requests" : "📄 My Requests"}
      </h2>

      <Section title="🏖 Day Off Requests">
        {/* Filter Section */}
        <div style={filterContainerStyle}>
          <div style={filterGroupStyle}>
            <label style={filterLabelStyle}>Status</label>
            <select
              style={selectStyle}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div style={filterGroupStyle}>
            <label style={filterLabelStyle}>Type</label>
            <select
              style={selectStyle}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="FULL_DAY">Full Day</option>
              <option value="HALF_DAY">Half Day</option>
            </select>
          </div>

          <div style={filterGroupStyle}>
            <label style={filterLabelStyle}>Month</label>
            <select
              style={selectStyle}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">All Months</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {new Date(month + "-01").toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}
                </option>
              ))}
            </select>
          </div>


        </div>

        {/* Results Count */}
        <div style={{ marginBottom: "12px", fontSize: "14px", color: "#6b7280" }}>
          Showing {filteredDayOffs.length} of {dayOffs.length} requests
        </div>

        <table
          style={{
            ...tableStyle,
            width: "100%",
            tableLayout: "fixed",
          }}
        >
          <colgroup>
            {role === "Admin" ? (
              <col style={{ width: "140px" }} />
            ) : null}
            <col style={{ width: "120px" }} />
            <col style={{ width: "140px" }} />
            <col style={{ width: "140px" }} />
            <col style={{ width: "80px" }} />
            <col style={{ width: "220px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "180px" }} />
          </colgroup>

          <thead>
            <tr>
              {role === "Admin" ? (
                <th style={th}>Employee ID</th>
              ) : null}
              <th style={th}>Type</th>
              <th style={th}>Start</th>
              <th style={th}>End</th>
              <th style={th}>Days</th>
              <th style={th}>Reason</th>
              <th style={th}>Status</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredDayOffs.map((d) => {
              const isPending = d.status === "Pending"

              return (
                <tr key={d._id} style={tr}>
                  {role === "Admin" ? (
                    <td style={td}>{d.employee_id}</td>
                  ) : null}

                  <td style={td}>{d.day_off_type}</td>
                  <td style={td}>
                    {formatDate(d.start_date_time)}
                  </td>
                  <td style={td}>
                    {formatDate(d.end_date_time)}
                  </td>
                  <td style={td}>{d.date_off_number}</td>
                  <td
                    style={{
                      ...td,
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                    }}
                  >
                    {d.title}
                  </td>
                  <td style={td}>{statusBadge(d.status)}</td>
                  <td style={td}>
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
                        onClick={() => onDelete(d._id)}
                      >
                        <HiTrash size={14} />
                        Cancel
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              )
            })}

            {filteredDayOffs.length === 0 && (
              <EmptyRow colSpan={role === "Admin" ? 8 : 7} />
            )}
          </tbody>
        </table>
      </Section>
    </div>
  )
}

export default UserDayOffRequests