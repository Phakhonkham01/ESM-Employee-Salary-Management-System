import React, { useState, useEffect } from "react"
import { HiPencil, HiTrash, HiChevronLeft, HiChevronRight } from "react-icons/hi"
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

/* ================= CONSTANTS ================= */

const ITEMS_PER_PAGE = 8

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

/* ================= PAGINATION COMPONENT ================= */

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) => {
  if (totalPages <= 1) return null

  return (
    <div style={{
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: "8px",
      marginTop: "20px",
      paddingTop: "20px",
      borderTop: "1px solid #e5e7eb"
    }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          padding: "6px 12px",
          backgroundColor: currentPage === 1 ? "#f3f4f6" : "#ffffff",
          color: currentPage === 1 ? "#9ca3af" : "#4b5563",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          if (currentPage > 1) {
            e.currentTarget.style.backgroundColor = "#f9fafb"
            e.currentTarget.style.borderColor = "#9ca3af"
          }
        }}
        onMouseLeave={(e) => {
          if (currentPage > 1) {
            e.currentTarget.style.backgroundColor = "#ffffff"
            e.currentTarget.style.borderColor = "#d1d5db"
          }
        }}
      >
        <HiChevronLeft size={16} />
        ກັບຄືນ
      </button>

      <div style={{ display: "flex", gap: "4px" }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={{
              padding: "6px 12px",
              backgroundColor: currentPage === page ? "#45cc67" : "#ffffff",
              color: currentPage === page ? "#ffffff" : "#4b5563",
              border: currentPage === page ? "1px solid #45cc67" : "1px solid #d1d5db",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: currentPage === page ? "600" : "400",
              minWidth: "40px",
              transition: "all 0.2s ease",
              // Added Green Light Effect below
              boxShadow: currentPage === page ? "0 0 10px rgba(69, 204, 103, 0.4)" : "none"
            }}
            onMouseEnter={(e) => {
              if (currentPage !== page) {
                e.currentTarget.style.backgroundColor = "#f9fafb"
                e.currentTarget.style.borderColor = "#9ca3af"
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== page) {
                e.currentTarget.style.backgroundColor = "#ffffff"
                e.currentTarget.style.borderColor = "#d1d5db"
              }
            }}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          padding: "6px 12px",
          backgroundColor: currentPage === totalPages ? "#f3f4f6" : "#ffffff",
          color: currentPage === totalPages ? "#9ca3af" : "#4b5563",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          if (currentPage < totalPages) {
            e.currentTarget.style.backgroundColor = "#f9fafb"
            e.currentTarget.style.borderColor = "#9ca3af"
          }
        }}
        onMouseLeave={(e) => {
          if (currentPage < totalPages) {
            e.currentTarget.style.backgroundColor = "#ffffff"
            e.currentTarget.style.borderColor = "#d1d5db"
          }
        }}
      >
        ຕໍ່ໄປ
        <HiChevronRight size={16} />
      </button>
    </div>
  )
}

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
  const [currentPage, setCurrentPage] = useState<number>(1)

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
        new Date(b + "-01").getTime() -
        new Date(a + "-01").getTime() // Reverse order (newest first)
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

  /* ================= PAGINATION LOGIC ================= */

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedStatus, selectedType, selectedMonth])

  // Calculate paginated data
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex)

  /* ================= DELETE CONFIRMATION ================= */

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'ຕ້ອງການຍົກເລິກຄຳຂໍ?',
      html: 'ການຍົກເລິກນີ້ບໍ່ສາມາດກັບຄືນໄດ້',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ດຳເນີນການຕໍ່',
      cancelButtonText: 'ບໍ່, ຍົກເລິກ',
      reverseButtons: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      customClass: {
        confirmButton: 'swal2-confirm',
        cancelButton: 'swal2-cancel'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete(id)
        Swal.fire({
          title: 'ສຳເລັດ!',
          text: 'ຄຳຂໍຖືກຍົກເລິກແລ້ວ',
          icon: 'success',
          confirmButtonColor: '#45CC67'
        })
      }
    })
  }

  /* ================= RENDER ================= */

  return (
    <div style={containerStyle}>
      <Section title="⏱ ຄຳຂໍ OT ແລະ ວຽກນອກສະຖານທີ່">
        {/* FILTERS */}
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
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
                <option value="">ເດືອນທັງໝົດ</option>
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
            ສະແດງ {startIndex + 1}-{Math.min(endIndex, filteredRequests.length)} ຈາກ {filteredRequests.length} ຄຳຂໍ
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
              <th style={th}>ການກະທຳ</th>
            </tr>
          </thead>

          <tbody>
            {paginatedRequests.map((r) => {
              const isPending = r.status === "Pending"

              return (
                <tr key={r._id} style={tr}>
                  <td style={td}>{r.title === "OT" ? "OT" : "ວຽກນອກສະຖານທີ່"}</td>
                  <td style={td}>{formatDate(r.date)}</td>
                  <td style={td}>
                    {r.start_hour} – {r.end_hour}
                  </td>
                  <td style={td}>
                    {r.title === "FIELD_WORK"
                      ? r.fuel.toLocaleString() + " ກີບ"
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
                        onClick={() => handleDelete(r._id)}
                      >
                        <HiTrash size={14} />
                        ຍົກເລິກ
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

        {/* PAGINATION */}
        {filteredRequests.length > ITEMS_PER_PAGE && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </Section>
    </div>
  )
}

export default UserOtFieldWorkRequests