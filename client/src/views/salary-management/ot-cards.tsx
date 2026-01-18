"use client"

import type React from "react"
import { getOtTypeColor, getOtTypeEnglish } from "./constants"
import type { OTDetail, SalaryTheme } from "./types"
import { defaultTheme } from "./types"

interface OtDetailsTableProps {
  otDetails: OTDetail[]
  title?: string
  showDate?: boolean
  theme?: SalaryTheme
}

export const OtDetailsTable: React.FC<OtDetailsTableProps> = ({
  otDetails,
  title = "Overtime (OT) Details",
  showDate = true,
  theme = defaultTheme,
}) => (
  <div className="overflow-x-auto border border-border rounded-lg">
    <div className="px-4 py-3" style={{ backgroundColor: theme.primary }}>
      <h4 className="font-semibold text-white">{title}</h4>
    </div>
    <table className="min-w-full divide-y divide-border">
      <thead className="bg-muted">
        <tr>
          {showDate && (
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
              Date
            </th>
          )}
          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
            Type
          </th>
          {showDate && (
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
              Time
            </th>
          )}
          <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
            Quantity
          </th>
          <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
            Rate
          </th>
          <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
            Amount
          </th>
        </tr>
      </thead>
      <tbody className="bg-background divide-y divide-border">
        {otDetails.map((detail, index) => (
          <tr key={index} className="hover:bg-muted/50 transition-colors">
            {showDate && (
              <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground border-b border-border/50">
                {detail.date
                  ? new Date(detail.date).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "-"}
              </td>
            )}
            <td className="px-4 py-3 whitespace-nowrap border-b border-border/50">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${getOtTypeColor(detail.ot_type)}`}>
                {getOtTypeEnglish(detail.ot_type)}
              </span>
            </td>
            {showDate && (
              <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground border-b border-border/50">
                {detail.start_hour || "09:00"} - {detail.end_hour || "17:00"}
              </td>
            )}
            <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground text-center border-b border-border/50">
              {detail.ot_type === "weekday"
                ? `${detail.total_hours} hrs`
                : detail.days
                  ? `${detail.days} days`
                  : `${detail.total_hours} hrs`}
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground text-center border-b border-border/50">
              {detail.ot_type === "weekday"
                ? `$${detail.hourly_rate?.toFixed(2) || "0.00"}/hr`
                : detail.days
                  ? `$${detail.rate_per_day?.toFixed(2) || "0.00"}/day`
                  : `$${detail.hourly_rate?.toFixed(2) || "0.00"}/hr`}
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-foreground text-right border-b border-border/50">
              ${detail.amount.toLocaleString()}
            </td>
          </tr>
        ))}
        <tr className="bg-muted font-semibold">
          <td colSpan={showDate ? 3 : 2} className="px-4 py-3 text-right text-muted-foreground">
            Grand Total:
          </td>
          <td className="px-4 py-3 text-center text-muted-foreground">
            {otDetails.reduce(
              (sum, detail) => sum + (detail.ot_type === "weekday" ? detail.total_hours : detail.days || detail.total_hours),
              0
            )}{" "}
            {otDetails.some((d) => d.days) ? "days/hrs" : "hrs"}
          </td>
          <td className="px-4 py-3 text-center text-muted-foreground">-</td>
          <td className="px-4 py-3 text-right font-bold" style={{ color: theme.primaryText }}>
            ${otDetails.reduce((sum, detail) => sum + detail.amount, 0).toLocaleString()}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
)

interface WeekdayOTCardProps {
  hours: number
  rate_per_hour: number
  onHoursChange: (value: string) => void
  onRatePerHourChange: (value: string) => void
  theme?: SalaryTheme
}

export const WeekdayOTCard: React.FC<WeekdayOTCardProps> = ({
  hours,
  rate_per_hour,
  onHoursChange,
  onRatePerHourChange,
  theme = defaultTheme,
}) => {
  const amount = hours * rate_per_hour

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <div className="px-4 py-3" style={{ backgroundColor: theme.primary }}>
        <h5 className="font-bold text-white">Weekday (Mon-Fri)</h5>
      </div>
      <div className="p-4">
        <p className="text-sm text-muted-foreground mb-4">Enter overtime hours for regular working days</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">OT Hours</label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={hours}
              onChange={(e) => onHoursChange(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Hourly Rate</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={rate_per_hour}
                onChange={(e) => onRatePerHourChange(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-md bg-blue-50 border border-blue-200">
          <div className="text-sm" style={{ color: theme.primaryText }}>
            <div className="font-bold mb-1">Total: ${amount.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">
              {hours} hrs x ${rate_per_hour.toFixed(2)}/hr
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface WeekendOTCardProps {
  hours: number
  days: number
  rate_per_hour: number
  rate_per_day: number
  onHoursChange: (value: string) => void
  onDaysChange: (value: string) => void
  onRatePerHourChange: (value: string) => void
  onRatePerDayChange: (value: string) => void
  theme?: SalaryTheme
}

export const WeekendOTCard: React.FC<WeekendOTCardProps> = ({
  hours,
  days,
  rate_per_hour,
  rate_per_day,
  onHoursChange,
  onDaysChange,
  onRatePerHourChange,
  onRatePerDayChange,
  theme = defaultTheme,
}) => {
  const hoursAmount = hours * rate_per_hour
  const daysAmount = days * rate_per_day
  const totalAmount = hoursAmount + daysAmount

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <div className="px-4 py-3" style={{ backgroundColor: theme.accent }}>
        <h5 className="font-bold text-white">Weekend (Sat-Sun)</h5>
      </div>
      <div className="p-4">
        <p className="text-sm text-muted-foreground mb-4">Enter weekend overtime data</p>

        <div className="space-y-4">
          {/* Weekend OT Hours */}
          <div className="border-b border-border pb-4">
            <h6 className="font-medium text-foreground mb-3">OT Hours</h6>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Number of Hours</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={hours}
                  onChange={(e) => onHoursChange(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Hourly Rate</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={rate_per_hour}
                    onChange={(e) => onRatePerHourChange(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
              {hours > 0 && rate_per_hour > 0 && (
                <div className="p-2 rounded-md bg-amber-50 border border-amber-200">
                  <div className="text-xs" style={{ color: theme.accentText }}>
                    <div>
                      OT Hours: {hours} hrs x ${rate_per_hour.toFixed(2)}
                    </div>
                    <div className="font-bold mt-1">Subtotal: ${hoursAmount.toFixed(2)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Weekend Work Days */}
          <div>
            <h6 className="font-medium text-foreground mb-3">Work Days (Full/Half Day)</h6>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Number of Days (0.5 = half day)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={days}
                  onChange={(e) => onDaysChange(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Daily Rate</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={rate_per_day}
                    onChange={(e) => onRatePerDayChange(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
              {days > 0 && rate_per_day > 0 && (
                <div className="p-2 rounded-md bg-amber-50 border border-amber-200">
                  <div className="text-xs" style={{ color: theme.accentText }}>
                    <div>
                      Work Days: {days} days x ${rate_per_day.toFixed(2)}
                    </div>
                    <div className="font-bold mt-1">Subtotal: ${daysAmount.toFixed(2)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {(hours > 0 || days > 0) && (
          <div className="mt-4 p-3 rounded-md bg-amber-50 border border-amber-300">
            <div className="text-sm" style={{ color: theme.accentText }}>
              <div className="font-bold mb-1">Weekend Total: ${totalAmount.toFixed(2)}</div>
              <div className="text-xs">
                {hours > 0 && `${hours} hrs ($${hoursAmount.toFixed(2)})`}
                {hours > 0 && days > 0 && " + "}
                {days > 0 && `${days} days ($${daysAmount.toFixed(2)})`}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
