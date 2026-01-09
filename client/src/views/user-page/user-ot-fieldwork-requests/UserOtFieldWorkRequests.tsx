import React from "react"
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
}

/* ================= UI COMPONENT ================= */

const UserOtFieldWorkRequests: React.FC<Props> = ({ requests }) => {
  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>📄 My Requests</h2>

      <Section title="⏱ OT / Field Work Requests">
        <table style={{ ...tableStyle, width: "100%" }}>
          {/* ✅ EVEN COLUMNS */}
          <colgroup>
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
              <th style={th}>Status</th>
              <th style={th}>Reason</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((r) => (
              <tr key={r._id} style={tr}>
                <td style={td}>{r.title}</td>
                <td style={td}>{formatDate(r.date)}</td>
                <td style={td}>
                  {r.start_hour} – {r.end_hour}
                </td>
                <td style={td}>{statusBadge(r.status)}</td>
                <td style={td}>{r.reason}</td>
              </tr>
            ))}

            {requests.length === 0 && <EmptyRow colSpan={5} />}
          </tbody>
        </table>
      </Section>
    </div>
  )
}

export default UserOtFieldWorkRequests
