import React from "react"

/* =======================
   Dummy Data
======================= */

const dashboardData = {
  employees: {
    total: 120,
    active: 112,
    onLeaveToday: 5,
    newHiresThisMonth: 4,
    resigned: 3,
  },
  expense: {
    totalThisMonth: 125_000_000,
    baseSalary: 85_000_000,
    ot: 18_000_000,
    fieldWork: 12_000_000,
    allowance: 10_000_000,
    changePercent: 12.5, // + / -
  },
}

/* =======================
   Reusable KPI Card
======================= */

const KpiCard = ({
  title,
  value,
  sub,
}: {
  title: string
  value: string | number
  sub?: string
}) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
  </div>
)

/* =======================
   Helper
======================= */

const formatMoney = (value: number) =>
  value.toLocaleString("en-US") + " LAK"

/* =======================
   Dashboard Page
======================= */

const Dashboard: React.FC = () => {
  const { employees, expense } = dashboardData

  return (
    <div className="p-6 space-y-8">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard Overview
        </h1>
        <p className="text-sm text-gray-500">
          Company performance summary (dummy data)
        </p>
      </div>

      {/* ================= KPI ROW 1 ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Total Employees"
          value={employees.total}
        />
        <KpiCard
          title="Active Employees"
          value={employees.active}
        />
        <KpiCard
          title="On Leave Today"
          value={employees.onLeaveToday}
        />
        <KpiCard
          title="New Hires (This Month)"
          value={employees.newHiresThisMonth}
        />
      </div>

      {/* ================= KPI ROW 2 ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Resigned / Inactive Employees"
          value={employees.resigned}
        />
        <KpiCard
          title="Total Expense (This Month)"
          value={formatMoney(expense.totalThisMonth)}
        />
        <KpiCard
          title="Expense Change vs Last Month"
          value={`${expense.changePercent > 0 ? "+" : ""}${expense.changePercent}%`}
          sub="Compared to previous month"
        />
      </div>

      {/* ================= EXPENSE BREAKDOWN ================= */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Expense Breakdown (This Month)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <KpiCard
            title="Base Salary Expense"
            value={formatMoney(expense.baseSalary)}
          />
          <KpiCard
            title="OT Expense"
            value={formatMoney(expense.ot)}
          />
          <KpiCard
            title="Field Work Expense"
            value={formatMoney(expense.fieldWork)}
          />
          <KpiCard
            title="Allowance / Other Expense"
            value={formatMoney(expense.allowance)}
          />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
