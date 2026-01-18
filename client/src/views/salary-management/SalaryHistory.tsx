"use client"

import React, { useState, useEffect } from "react"
import {
  Calendar,
  DollarSign,
  Download,
  Printer,
  Search,
  Trash2,
  User,
  AlertCircle,
  XCircle,
  FileText,
  Building,
  Briefcase,
  Shield,
} from "lucide-react"
import axios from "axios"
import moment from "moment"
import SalaryHistoryTable from "./SalaryHistoryTable"

// Interface for salary data
interface Salary {
  _id: string
  user_id: {
    _id: string
    first_name_en: string
    last_name_en: string
    email: string
    role?: string
    department_id?: {
      _id: string
      name: string
    }
    position_id?: {
      _id: string
      name: string
    }
  }
  month: number
  year: number
  base_salary: number
  ot_amount: number
  ot_hours?: number
  ot_details?: any[]
  weekday_ot_hours?: number
  weekend_ot_hours?: number
  weekday_ot_amount?: number
  weekend_ot_amount?: number
  bonus: number
  commission: number
  fuel_costs: number
  money_not_spent_on_holidays: number
  other_income: number
  office_expenses: number
  social_security: number
  working_days: number
  day_off_days: number
  remaining_vacation_days: number
  net_salary: number
  status: "pending" | "approved" | "paid" | "cancelled"
  created_by: {
    first_name_en: string
    last_name_en: string
  }
  notes?: string
  payment_date: string
  created_at: string
  updated_at: string
}

// Interface for Props
interface SalaryHistoryProps {
  user?: any
  onSelectSalary?: (salary: Salary) => void
}

const SalaryHistory: React.FC<SalaryHistoryProps> = ({ user, onSelectSalary }) => {
  const [salaries, setSalaries] = useState<Salary[]>([])
  const [filteredSalaries, setFilteredSalaries] = useState<Salary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [selectedPosition, setSelectedPosition] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Fetch salary data
  const fetchSalaries = async () => {
    try {
      setLoading(true)
      setError(null)

      const url = "/api/salaries"
      const params: any = {}

      if (user) {
        params.userId = user._id
      }

      const response = await axios.get(url, { params })

      if (response.data && response.data.salaries && response.data.salaries.length > 0) {
        console.log("First salary structure:", {
          user_id: response.data.salaries[0].user_id,
          department: response.data.salaries[0].user_id?.department_id,
          position: response.data.salaries[0].user_id?.position_id,
        })
      }

      if (response.data && response.data.salaries) {
        setSalaries(response.data.salaries)
        setFilteredSalaries(response.data.salaries)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load salary history")
      console.error("Error fetching salaries:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSalaries()
  }, [user])

  // Filter salaries
  useEffect(() => {
    let filtered = salaries

    // Filter by year
    if (selectedYear) {
      filtered = filtered.filter((salary) => salary.year === selectedYear)
    }

    // Filter by month
    if (selectedMonth !== "all") {
      filtered = filtered.filter((salary) => salary.month === selectedMonth)
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((salary) => salary.status === selectedStatus)
    }

    // Filter by department
    if (selectedDepartment !== "all") {
      filtered = filtered.filter((salary) => salary.user_id.department_id?.name === selectedDepartment)
    }

    // Filter by position
    if (selectedPosition !== "all") {
      filtered = filtered.filter((salary) => salary.user_id.position_id?.name === selectedPosition)
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (salary) =>
          salary.user_id.first_name_en.toLowerCase().includes(term) ||
          salary.user_id.last_name_en.toLowerCase().includes(term) ||
          salary.user_id.email.toLowerCase().includes(term) ||
          salary.user_id.role?.toLowerCase().includes(term) ||
          salary.user_id.department_id?.name?.toLowerCase().includes(term) ||
          salary.user_id.position_id?.name?.toLowerCase().includes(term) ||
          salary.notes?.toLowerCase().includes(term)
      )
    }

    setFilteredSalaries(filtered)
  }, [salaries, selectedYear, selectedMonth, selectedStatus, selectedDepartment, selectedPosition, searchTerm])

  // Get unique departments and positions for filters
  const getUniqueDepartments = () => {
    const departments = salaries.map((salary) => salary.user_id.department_id?.name).filter((name): name is string => !!name)
    return ["all", ...new Set(departments)]
  }

  const getUniquePositions = () => {
    const positions = salaries.map((salary) => salary.user_id.position_id?.name).filter((name): name is string => !!name)
    return ["all", ...new Set(positions)]
  }

  // Get month name
  const getMonthName = (monthNum: number) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    return months[monthNum - 1] || ""
  }

  // Delete salary
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/salaries/${id}`)
      fetchSalaries() // Refresh data
      setDeleteConfirm(null)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete salary")
    }
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "Employee",
      "Email",
      "Role",
      "Department",
      "Position",
      "Period",
      "Base Salary",
      "OT Amount",
      "Bonus",
      "Commission",
      "Fuel Costs",
      "Holiday Money",
      "Other Income",
      "Office Expenses",
      "Social Security",
      "Working Days",
      "Day Off Days",
      "Net Salary",
      "Status",
      "Created By",
      "Payment Date",
      "Notes",
    ]

    const csvData = filteredSalaries.map((salary) => [
      `${salary.user_id.first_name_en} ${salary.user_id.last_name_en}`,
      salary.user_id.email,
      salary.user_id.role || "",
      salary.user_id.department_id?.name || "",
      salary.user_id.position_id?.name || "",
      `${getMonthName(salary.month)} ${salary.year}`,
      salary.base_salary,
      salary.ot_amount,
      salary.bonus,
      salary.commission,
      salary.fuel_costs,
      salary.money_not_spent_on_holidays,
      salary.other_income,
      salary.office_expenses,
      salary.social_security,
      salary.working_days,
      salary.day_off_days,
      salary.net_salary,
      salary.status,
      `${salary.created_by.first_name_en} ${salary.created_by.last_name_en}`,
      moment(salary.payment_date).format("DD/MM/YYYY"),
      salary.notes || "",
    ])

    const csv = [headers, ...csvData].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `salaries_${moment().format("YYYYMMDD_HHmmss")}.csv`)
    link.click()
  }

  // Print function
  const handlePrint = () => {
    window.print()
  }

  // Get years for filter
  const getYears = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i)
    }
    return years
  }

  // Calculate total
  const calculateTotal = (field: keyof Salary) => {
    return filteredSalaries.reduce((sum, salary) => sum + ((salary[field] as number) || 0), 0)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <span className="text-gray-600 font-medium">Loading salary history...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Salary History</h2>
            <p className="text-sm text-gray-600">{user ? `${user.first_name_en} ${user.last_name_en}'s salary records` : "All salary records"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {getYears().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value === "all" ? "all" : parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Months</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {getMonthName(month)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {getUniqueDepartments().map(
                (dept, index) =>
                  dept !== "all" && (
                    <option key={index} value={dept}>
                      {dept}
                    </option>
                  )
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Positions</option>
              {getUniquePositions().map(
                (pos, index) =>
                  pos !== "all" && (
                    <option key={index} value={pos}>
                      {pos}
                    </option>
                  )
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search employee, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-r-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <FileText className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">Records</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{filteredSalaries.length}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <DollarSign className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">Total Net Salary</span>
            </div>
            <p className="text-2xl font-bold text-green-900">${calculateTotal("net_salary").toLocaleString()}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <DollarSign className="w-5 h-5 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-purple-800">Total Base Salary</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">${calculateTotal("base_salary").toLocaleString()}</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <DollarSign className="w-5 h-5 text-orange-600 mr-2" />
              <span className="text-sm font-medium text-orange-800">Total OT</span>
            </div>
            <p className="text-2xl font-bold text-orange-900">${calculateTotal("ot_amount").toLocaleString()}</p>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <DollarSign className="w-5 h-5 text-teal-600 mr-2" />
              <span className="text-sm font-medium text-teal-800">Total Bonus</span>
            </div>
            <p className="text-2xl font-bold text-teal-900">${calculateTotal("bonus").toLocaleString()}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <DollarSign className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-sm font-medium text-red-800">Total Deductions</span>
            </div>
            <p className="text-2xl font-bold text-red-900">
              ${(calculateTotal("office_expenses") + calculateTotal("social_security")).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <SalaryHistoryTable
        salaries={filteredSalaries}
        onSelectSalary={onSelectSalary}
        onDelete={handleDelete}
        getMonthName={getMonthName}
        deleteConfirm={deleteConfirm}
        setDeleteConfirm={setDeleteConfirm}
      />
    </div>
  )
}

export default SalaryHistory
