import React, { useState } from 'react'
import { FaTimes} from 'react-icons/fa'

interface FilterProps {
  onFilterChange: (filters: FilterState) => void
}

interface FilterState {
  year: string
  month: string
  department: string
  type: string
  status: string
  searchTerm: string
}

const DayOffFilter: React.FC<FilterProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<FilterState>({
    year: '2026',
    month: 'January',
    department: 'All Departments',
    type: 'All Types',
    status: 'All Status',
    searchTerm: ''
  })

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      year: '2026',
      month: 'January',
      department: 'All Departments',
      type: 'All Types',
      status: 'All Status',
      searchTerm: ''
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  const activeFilterCount = Object.values(filters).filter(
    (v, i) => v !== '' && i !== 5 && !['2026', 'January', 'All Departments', 'All Types', 'All Status'].includes(v)
  ).length

  // Year options (current year and next few years)
  const yearOptions = ['2026', '2025', '2024', '2023']

  // Month options
  const monthOptions = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Department options (you can replace with actual departments)
  const departmentOptions = ['All Departments', 'Engineering', 'Marketing', 'Sales', 'HR', 'Finance']

  // Type options
  const typeOptions = ['All Types', 'FULL_DAY', 'HALF_DAY']

  // Status options
  const statusOptions = ['All Status', 'Pending', 'Accepted', 'Rejected']

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left side: Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Year Filter */}
          <div className="min-w-[120px]">
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="min-w-[140px]">
            <select
              value={filters.month}
              onChange={(e) => handleFilterChange('month', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="min-w-[160px]">
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="min-w-[120px]">
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="min-w-[140px]">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              <FaTimes className="text-xs" />
              Clear Filters ({activeFilterCount})
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default DayOffFilter