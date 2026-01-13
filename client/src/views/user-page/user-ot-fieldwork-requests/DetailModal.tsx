import React from "react"
import { RequestItem } from "./UserOtFieldWorkRequests"
import { formatDate, statusBadge } from "./HelperComponents"

interface Props {
  item: RequestItem
  onClose: () => void
}

const RequestDetailModal: React.FC<Props> = ({ item, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* ================= BACKDROP ================= */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* ================= MODAL ================= */}
      <div
        className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= HEADER ================= */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Request Detail
          </h2>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="p-6 space-y-6">
          {/* Type + Fuel */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-500">
                Request Type
              </label>
              <p className="text-gray-900 mt-1 font-medium">
                {item.title}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-500">
                Fuel
              </label>
              <p className="text-gray-900 mt-1 font-medium">
                {item.title === "FIELD_WORK"
                  ? item.fuel.toLocaleString()
                  : "-"}
              </p>
            </div>
          </div>

          {/* Date + Time (same row) */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-500">
                Date
              </label>
              <p className="text-gray-900 mt-1 font-medium">
                {formatDate(item.date)}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-500">
                Time
              </label>
              <p className="text-gray-900 mt-1 font-medium">
                {item.start_hour} – {item.end_hour}
              </p>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-semibold text-gray-500">
              Status
            </label>
            <div className="mt-2">
              {statusBadge(item.status)}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="text-sm font-semibold text-gray-500">
              Reason
            </label>
            <div className="mt-2 p-4 rounded-xl bg-gray-50 text-gray-900 text-sm whitespace-pre-wrap">
              {item.reason || "-"}
            </div>
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gray-700 text-white hover:bg-gray-800 transition text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default RequestDetailModal
