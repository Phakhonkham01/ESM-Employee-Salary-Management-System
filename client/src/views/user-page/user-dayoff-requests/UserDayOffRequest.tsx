import React, { useState, useEffect } from "react"
import { HiPencil, HiTrash, HiChevronLeft, HiChevronRight } from "react-icons/hi"
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
import Swal from 'sweetalert2'

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
  onDelete: (id: string) => Promise<void>
  refreshRequests: () => void
}

/* ================= CONSTANTS ================= */

const ITEMS_PER_PAGE = 9

/* ================= REUSABLE BUTTONS ================= */

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
            e.currentTarget.style.borderColor = "#45cc67"
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
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: currentPage === page ? "600" : "400",
              minWidth: "40px",
              transition: "all 0.2s ease"
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

/* ================= FILTER STYLES ================= */

const filterContainerStyle: React.CSSProperties = {
  display: "flex",
  gap: "16px",
  marginBottom: "20px",
  padding: "16px 0px",
  borderRadius: "8px",
  flexWrap: "wrap",
  alignItems: "center",
}

const filterGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
}

/* ================= COMPONENT ================= */

const UserDayOffRequest: React.FC<Props> = ({
  dayOffs,
  onEdit,
  onDelete,
  refreshRequests,
}) => {
  const auth = JSON.parse(localStorage.getItem("auth") || "null")
  const role = auth?.user?.role

  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)

  /* ================= FILTER LOGIC ================= */

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

  /* ================= MONTH OPTIONS ================= */

  const availableMonths = Array.from(
    new Set(
      dayOffs.map((d) =>
        new Date(d.start_date_time).toISOString().slice(0, 7)
      )
    )
  ).sort().reverse()

  /* ================= PAGINATION LOGIC ================= */

  const totalPages = Math.ceil(filteredDayOffs.length / ITEMS_PER_PAGE)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedStatus, selectedType, selectedMonth])

  // Calculate paginated data
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedDayOffs = filteredDayOffs.slice(startIndex, endIndex)

  /* ================= DELETE HANDLER ================= */

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'ຕ້ອງການຍົກເລິກຄຳຂໍລາພັກ?',
      text: "ການຍົກເລິກນີ້ບໍ່ສາມາດກັບຄືນໄດ້",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ດຳເນີນການຕໍ່',
      cancelButtonText: 'ບໍ່, ຍົກເລີກ',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      customClass: {
        confirmButton: 'mr-2',
        cancelButton: 'ml-2'
      }
    });

    if (result.isConfirmed) {
      setIsDeleting(id);

      try {
        Swal.fire({
          title: 'ກຳລັງຍົກເລິກ...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        await onDelete(id);

        Swal.close();

        await Swal.fire({
          icon: 'success',
          title: 'ຍົກເລິກສຳເລັດ!',
          confirmButtonText: 'ຕົກລົງ',
          timer: 2000,
          showConfirmButton: false,
        });

        refreshRequests();

      } catch (error: any) {
        console.error('Delete error:', error);
        Swal.close();

        await Swal.fire({
          icon: 'error',
          title: 'ເກີດຂໍ້ຜິດພາດ',
          text: 'ບໍ່ສາມາດຍົກເລິກຄຳຂໍໄດ້',
          confirmButtonColor: '#ef4444',
        });
      } finally {
        setIsDeleting(null);
      }
    }
  };

  /* ================= RENDER ================= */

  return (
    <div style={containerStyle}>
      <Section title="ຂໍ້ມູນ ຄຳຂໍລາພັກ">
        {/* Filter Section */}
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <div style={filterContainerStyle}>
            <div style={filterGroupStyle}>
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

            <div style={filterGroupStyle}>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase">ປະເພດ</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1F3A5F]"
              >
                <option value="all">ປະເພດທັງໝົດ</option>
                <option value="FULL_DAY">ໝົດມື້</option>
                <option value="HALF_DAY">ເຄີ່ງມື້</option>
              </select>
            </div>

            <div style={filterGroupStyle}>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1 uppercase">ເດືອນ</label>
              <select
                className="w-full border border-[#E5E7EB] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1F3A5F]"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="">ເດືອນທັງໝົດ</option>
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
          <div style={{ marginTop: "70px", fontSize: "14px", color: "#6b7280" }}>
            ສະແດງ {startIndex + 1}-{Math.min(endIndex, filteredDayOffs.length)} ຈາກ {filteredDayOffs.length} ຄຳຂໍ
          </div>
        </div>

        {/* Table */}
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
                <th style={th}>ພະນັກງານ ID</th>
              ) : null}
              <th style={th}>ປະເພດ</th>
              <th style={th}>ເລີ່ມ</th>
              <th style={th}>ຮອດ</th>
              <th style={th}>ມື້</th>
              <th style={th}>ເລື່ອງ</th>
              <th style={th}>ສະຖານະ</th>
              <th style={th}>ການກະທຳ</th>
            </tr>
          </thead>

          <tbody>
            {paginatedDayOffs.map((d) => {
              const isPending = d.status === "Pending"
              const isDeletingThis = isDeleting === d._id

              return (
                <tr key={d._id} style={tr}>
                  {role === "Admin" ? (
                    <td style={td}>{d.employee_id}</td>
                  ) : null}

                  <td style={td}>
                    {d.day_off_type === "FULL_DAY" ? "ໝົດມື້" : "ເຄີ່ງມື້"}
                  </td>
                  <td style={td}>
                    {formatDate(d.start_date_time)}
                  </td>
                  <td style={td}>
                    {formatDate(d.end_date_time)}
                  </td>
                  <td style={td}>{d.date_off_number} ມື້</td>
                  <td
                    style={{
                      ...td,
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      lineHeight: "1.4",
                    }}
                  >
                    {d.title}
                  </td>
                  <td style={td}>{statusBadge(d.status)}</td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <ActionButton
                        color="#45CC67"
                        hoverColor="#1fd371"
                        disabled={!isPending || isDeletingThis}
                        onClick={() => onEdit(d)}
                      >
                        <HiPencil size={14} />
                        ແກ້ໄຂ
                      </ActionButton>

                      <ActionButton
                        color="#ef4444"
                        hoverColor="#dc2626"
                        disabled={!isPending || isDeletingThis}
                        onClick={() => handleDelete(d._id)}
                      >
                        {isDeletingThis ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1" />
                            ກຳລັງຍົກເລິກ...
                          </>
                        ) : (
                          <>
                            <HiTrash size={14} />
                            ຍົກເລິກ
                          </>
                        )}
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

        {/* Pagination */}
        {filteredDayOffs.length > ITEMS_PER_PAGE && (
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

export default UserDayOffRequest