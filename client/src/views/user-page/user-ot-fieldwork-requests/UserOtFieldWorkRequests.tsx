import React, { useState, useEffect } from "react"
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
import Swal from "sweetalert2"

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

  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedType, setSelectedType] = useState<"all" | "OT" | "FIELD_WORK">("all")

  /* ================= MONTH OPTIONS ================= */

  const [availableMonths, setAvailableMonths] = useState<string[]>([])

  useEffect(() => {
    // Extract unique months from requests
    const months = Array.from(
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
    setAvailableMonths(months)
  }, [requests])

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

  /* ================= RENDER ================= */

  return (
    <div style={containerStyle}>
      <Section title="⏱ ຄຳຂໍ OT ແລະ ວຽກນອກສະຖານທີ່">
        {/* FILTERS */}
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%"}}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "30px", marginTop: "20px" }}>
            <div>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase">ປະເພດ</label>
              <select
                value={selectedType}
                onChange={(e) =>
                  setSelectedType(
                    e.target.value as "all" | "OT" | "FIELD_WORK"
                  )
                }
                className="w-full border border-[#E5E7EB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1F3A5F]"
              >
                <option value="all">ປະເພດທັງໝົດ</option>
                <option value="OT">OT</option>
                <option value="FIELD_WORK">ວຽກນອກສະຖານທີ່</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase">ສະຖານະ</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1F3A5F]"
              >
                <option value="all">ສະຖານະທັງໝົດ</option>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase">ເດືອນ</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1F3A5F]"
              >
                <option value="">ເດືອນ</option>
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
          </div>

          {/* Results Count */}
          <div style={{ marginTop: "70px", fontSize: "14px", color: "#6b7280" }}>
            Showing {filteredRequests.length} of {requests.length} requests
          </div>
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
              <th style={th}>ປະເພດ</th>
              <th style={th}>ວັນທີ່</th>
              <th style={th}>ເວລາ</th>
              <th style={th}>ຄ່ານ້ຳມັນ</th>
              <th style={th}>ເລື່ອງ</th>
              <th style={th}>ສະຖານະ</th>
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
                        color="#45CC67"
                        hoverColor="#1fd371"
                        disabled={!isPending}
                        onClick={() => onEdit(r)}
                      >
                        <HiPencil size={14} />
                        ແກ້ໄຂ
                      </ActionButton>

                      <ActionButton
                        color="#ef4444"
                        hoverColor="#dc2626"
                        disabled={!isPending}
                        onClick={() => {
                          Swal.fire({
                            title: 'ຕ້ອງການທີ່ຈະຍົກເລິກຟຟຟ?',
                            html: `ການຍົກເລິກນີ້ບໍ່ສາມາດກັບຄືນໄດ້`,
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonText: 'Yes, Cancel',
                            cancelButtonText: 'No',
                            reverseButtons: true,
                          }).then((result) => {
                            if (result.isConfirmed) {
                              onDelete(r._id)
                            }
                          })
                        }}
                      >
                        <HiTrash size={14} />
                        ຍົກເລິກ
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