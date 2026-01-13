import React from "react"
import { HiPencil, HiTrash, HiEye } from "react-icons/hi"
import {
  Section,
  EmptyRow,
  formatDate,
  statusBadge,
  containerStyle,
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
  onDetail: (item: RequestItem) => void
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

const UserOtFieldWorkRequests: React.FC<Props> = ({
  requests,
  onEdit,
  onDelete,
  onDetail,
}) => {
  /* ================= FILTER STATE ================= */

  const [selectedStatus, setSelectedStatus] =
    React.useState<string>("all")
  const [selectedMonth, setSelectedMonth] =
    React.useState<string>("")
  const [selectedType, setSelectedType] =
    React.useState<"all" | "OT" | "FIELD_WORK">("all")

  /* ================= PAGINATION STATE ================= */

  const ITEMS_PER_PAGE = 10
  const [currentPage, setCurrentPage] = React.useState(1)

  /* ================= CLEAR FILTERS (NEW) ================= */

  const clearFilters = () => {
    setSelectedStatus("all")
    setSelectedMonth("")
    setSelectedType("all")
    setCurrentPage(1)
  }

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

  /* 🔁 RESET PAGE WHEN FILTER CHANGES */
  React.useEffect(() => {
    setCurrentPage(1)
  }, [selectedStatus, selectedMonth, selectedType])

  /* ================= PAGINATION LOGIC ================= */

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedRequests = filteredRequests.slice(
    startIndex,
    endIndex
  )

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
      <Section title="⏱ OT / Field Work Requests">
        {/* ================= FILTERS ================= */}
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

          {/* ✅ CLEAR FILTERS BUTTON */}
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
            <col style={{ width: "100px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "140px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "220px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "220px" }} />
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
            {paginatedRequests.map((r) => {
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
                    }}
                  >
                    {r.reason}
                  </td>
                  <td style={td}>{statusBadge(r.status)}</td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <ActionButton
                        color="#6b7280"
                        hoverColor="#4b5563"
                        onClick={() => onDetail(r)}
                      >
                        <HiEye size={14} />
                        Detail
                      </ActionButton>

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
                        onClick={() => onDelete(r._id)}
                      >
                        <HiTrash size={14} />
                        Cancel
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              )
            })}

            {paginatedRequests.length === 0 && (
              <EmptyRow colSpan={7} />
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

export default UserOtFieldWorkRequests
