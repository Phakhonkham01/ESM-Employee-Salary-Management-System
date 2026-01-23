import React, { useState } from "react"
import { HiPencil, HiTrash } from "react-icons/hi"
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
import {
  HiRefresh,
} from 'react-icons/hi'
import Swal from 'sweetalert2';

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
  onDelete: (id: string) => Promise<void> // Changed to async function
  refreshRequests: () => void // Added this prop to refresh list
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
  refreshRequests, // Use this instead of calling loadDayOffRequests directly
}) => {
  const auth = JSON.parse(localStorage.getItem("auth") || "null")
  const role = auth?.user?.role

  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [isDeleting, setIsDeleting] = useState<string | null>(null) // Track deleting state

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

  // Delete handler with proper error handling
  const handleDelete = async (id: string) => {
    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'ຕ້ອງການທີ່ຈະຍົກເລິກ?',
      text: "ການຍົກເລິກນີ້ບໍ່ສາມາດກັບຄືນໄດ້",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ດຳເນີນການ',
      cancelButtonText: 'ຍົກເລີກ',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      customClass: {
        confirmButton: 'mr-2',
        cancelButton: 'ml-2'
      }
    });

    // If user confirms deletion
    if (result.isConfirmed) {
      setIsDeleting(id); // Set deleting state

      try {
        // Show loading state
        Swal.fire({
          title: 'ກຳລັງຍົກເລິກ...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // Call the delete function from props
        await onDelete(id);

        // Close loading state
        Swal.close();

        // Show success message
        await Swal.fire({
          icon: 'success',
          title: 'ຍົກເລິກສຳເລັດ!',
          confirmButtonText: 'ຕົກລົງ',
          confirmButtonColor: '#10b981',
          timer: 2000,
          timerProgressBar: true
        });

        // Refresh the list
        refreshRequests();

      } catch (error: any) {
        console.error('Delete error:', error);

        // Close loading state
        Swal.close();
      } finally {
        setIsDeleting(null); // Reset deleting state
      }
    }
  };

  return (
    <div style={containerStyle}>
      <Section title="🏖 ຂໍ້ມູນ ຄຳຂໍລາພັກ">
        {/* Filter Section */}
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%"}}>
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
                <option value="">ເດືອນ</option>
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
            Showing {filteredDayOffs.length} of {dayOffs.length} requests
          </div>
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
                <th style={th}>ພະນັກງານ ID</th>
              ) : null}
              <th style={th}>ປະເພດ</th>
              <th style={th}>ເລີ່ມ</th>
              <th style={th}>ຮອດ</th>
              <th style={th}>ມື້</th>
              <th style={th}>ເລື່ອງ</th>
              <th style={th}>ສະຖານະ</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredDayOffs.map((d) => {
              const isPending = d.status === "Pending"
              const isDeletingThis = isDeleting === d._id

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

            {filteredDayOffs.length === 0 && (
              <EmptyRow colSpan={role === "Admin" ? 8 : 7} />
            )}
          </tbody>
        </table>
      </Section>
    </div>
  )
}

export default UserDayOffRequest