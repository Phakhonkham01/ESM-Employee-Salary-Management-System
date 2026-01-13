import React from "react"
import { HiPencil, HiTrash, HiEye } from "react-icons/hi"
import {
  Section,
  EmptyRow,
  formatDateTime,
  statusBadge,
  containerStyle,
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
  onDetail: (item: DayOffItem) => void
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

/* ================= COMPONENT ================= */

const UserDayOffRequests: React.FC<Props> = ({
  dayOffs,
  onEdit,
  onDelete,
  onDetail,
}) => {
  const auth = JSON.parse(localStorage.getItem("auth") || "null")
  const role = auth?.user?.role

  /* ================= FILTER STATE ================= */

  const [selectedStatus, setSelectedStatus] = React.useState<string>("all")
  const [selectedMonth, setSelectedMonth] = React.useState<string>("")
  const [selectedDayOffType, setSelectedDayOffType] =
    React.useState<string>("all")

  /* ================= PAGINATION STATE ================= */

  const ITEMS_PER_PAGE = 10
  const [currentPage, setCurrentPage] = React.useState(1)

  /* ================= CLEAR FILTERS ================= */

  const clearFilters = () => {
    setSelectedStatus("all")
    setSelectedMonth("")
    setSelectedDayOffType("all")
    setCurrentPage(1)
  }

  /* ================= FILTER LOGIC ================= */

  const filteredDayOffs = dayOffs.filter((d) => {
    if (selectedStatus !== "all" && d.status !== selectedStatus) return false
    if (
      selectedDayOffType !== "all" &&
      d.day_off_type !== selectedDayOffType
    )
      return false

    if (selectedMonth) {
      const month = new Date(d.start_date_time)
        .toISOString()
        .slice(0, 7)
      if (month !== selectedMonth) return false
    }

    return true
  })

  /* ================= SORT LOGIC (NEW – ONLY CHANGE) ================= */

  const statusOrder: Record<RequestStatus, number> = {
    Pending: 1,
    Accept: 2,
    Reject: 3,
  }

  const sortedDayOffs = [...filteredDayOffs].sort((a, b) => {
    // 1️⃣ Status
    const statusDiff =
      statusOrder[a.status] - statusOrder[b.status]
    if (statusDiff !== 0) return statusDiff

    // 2️⃣ Start date & time
    const startDiff =
      new Date(a.start_date_time).getTime() -
      new Date(b.start_date_time).getTime()
    if (startDiff !== 0) return startDiff

    // 3️⃣ End date & time
    return (
      new Date(a.end_date_time).getTime() -
      new Date(b.end_date_time).getTime()
    )
  })

  /* 🔁 RESET PAGE WHEN FILTERS CHANGE */
  React.useEffect(() => {
    setCurrentPage(1)
  }, [selectedStatus, selectedMonth, selectedDayOffType])

  /* ================= PAGINATION LOGIC ================= */

  const totalPages = Math.ceil(sortedDayOffs.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedDayOffs = sortedDayOffs.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  )

  /* ================= MONTH OPTIONS ================= */

  const availableMonths = Array.from(
    new Set(
      dayOffs
        .map((d) =>
          new Date(d.start_date_time).toISOString().slice(0, 7)
        )
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
      <Section title="🏖 Day Off Requests">
        {/* ================= FILTERS (UNCHANGED) ================= */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "16px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <select
            value={selectedDayOffType}
            onChange={(e) => setSelectedDayOffType(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              fontSize: "12px",
            }}
          >
            <option value="all">All Types</option>
            <option value="FULL_DAY">Full Day</option>
            <option value="HALF_DAY">Half Day</option>
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
            <option value="Accept">Accepted</option>
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

          <button
            onClick={clearFilters}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              backgroundColor: "#f9fafb",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Clear Filters
          </button>
        </div>

        {/* ================= TABLE ================= */}
        <table
          style={{
            ...tableStyle,
            width: "100%",
            tableLayout: "fixed",
          }}
        >
          <colgroup>
            {role === "Admin" && <col style={{ width: "140px" }} />}
            <col style={{ width: "120px" }} />
            <col style={{ width: "160px" }} />
            <col style={{ width: "160px" }} />
            <col style={{ width: "80px" }} />
            <col style={{ width: "220px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "220px" }} />
          </colgroup>

          <thead>
            <tr>
              {role === "Admin" && <th style={th}>Employee ID</th>}
              <th style={th}>Type</th>
              <th style={th}>Start (Date & Time)</th>
              <th style={th}>End (Date & Time)</th>
              <th style={th}>Days</th>
              <th style={th}>Reason</th>
              <th style={th}>Status</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedDayOffs.map((d) => {
              const isPending = d.status === "Pending"

              return (
                <tr key={d._id} style={tr}>
                  {role === "Admin" && (
                    <td style={td}>{d.employee_id}</td>
                  )}

                  <td style={td}>{d.day_off_type}</td>
                  <td style={td}>{formatDateTime(d.start_date_time)}</td>
                  <td style={td}>{formatDateTime(d.end_date_time)}</td>
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
                        color="#6b7280"
                        hoverColor="#4b5563"
                        onClick={() => onDetail(d)}
                      >
                        <HiEye size={14} />
                        Detail
                      </ActionButton>

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

            {paginatedDayOffs.length === 0 && (
              <EmptyRow colSpan={role === "Admin" ? 8 : 7} />
            )}
          </tbody>
        </table>

        {/* ================= PAGINATION ================= */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              marginTop: 16,
            }}
          >
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                style={{
                  fontWeight:
                    currentPage === i + 1 ? "bold" : "normal",
                }}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </Section>
    </div>
  )
}

export default UserDayOffRequests
