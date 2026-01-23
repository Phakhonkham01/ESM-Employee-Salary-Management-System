import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { DayOffRequest } from '@/services/Day_off_api/api'
import type { UserData } from '@/services/Create_user/api'
import type { DepartmentData } from '@/services/departments/api'
import Swal from 'sweetalert2'

interface UseExportToPDFProps {
  requests: DayOffRequest[]
  users: UserData[]
}

export const useExportToPDF = ({ requests, users }: UseExportToPDFProps) => {
  const getUserName = (userRef: any) => {
    if (!userRef) return 'Unknown User'
    if (typeof userRef === 'object' && userRef.name) {
      return userRef.name
    }
    if (typeof userRef === 'object' && userRef.email) {
      return userRef.email
    }
    const userId = typeof userRef === 'string' ? userRef : userRef._id
    const user = users.find(u => u._id === userId)
    return user ? `${user.first_name_en} ${user.last_name_en}` : 'Unknown User'
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusLabel = (status: string) => {
    return status === 'Accept' ? 'Accepted' : status
  }

  const exportToPDF = async () => {
    // Create new PDF document
    const doc = new jsPDF('l', 'mm', 'a4') // landscape orientation for better table fit

    // Add title
    doc.setFontSize(18)
    doc.text('Day Off Requests Report', 14, 15)

    // Add date
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 14, 22)

    // Prepare table data
    const tableData = requests.map((request) => [
      getUserName(request.employee_id || request.user_id),
      getUserName(request.supervisor_id),
      request.day_off_type,
      formatDate(request.start_date_time),
      formatDate(request.end_date_time),
      request.date_off_number.toString(),
      request.title,
      getStatusLabel(request.status)
    ])

    // Add table using autoTable
    autoTable(doc, {
      head: [['Employee', 'Supervisor', 'Type', 'Start Date', 'End Date', 'Days', 'Reason', 'Status']],
      body: tableData,
      startY: 28,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [59, 130, 246], // blue-500
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251], // gray-50
      },
      columnStyles: {
        0: { cellWidth: 35 }, // Employee
        1: { cellWidth: 35 }, // Supervisor
        2: { cellWidth: 25 }, // Type
        3: { cellWidth: 30 }, // Start Date
        4: { cellWidth: 30 }, // End Date
        5: { cellWidth: 15 }, // Days
        6: { cellWidth: 50 }, // Reason
        7: { cellWidth: 25 }, // Status
      },
      margin: { top: 28, left: 14, right: 14 },
    })

    // Add summary statistics
    const totalRequests = requests.length
    const pendingRequests = requests.filter(r => r.status === 'Pending').length
    const acceptedRequests = requests.filter(r => r.status === 'Accepted').length
    const rejectedRequests = requests.filter(r => r.status === 'Rejected').length
    const totalDaysOff = requests
      .filter(r => r.status === 'Accepted')
      .reduce((sum, r) => sum + r.date_off_number, 0)

    const finalY = (doc as any).lastAutoTable.finalY || 100
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text('Summary Statistics', 14, finalY + 10)

    doc.setFontSize(10)
    doc.text(`Total Requests: ${totalRequests}`, 14, finalY + 18)
    doc.text(`Pending: ${pendingRequests}`, 14, finalY + 24)
    doc.text(`Accepted: ${acceptedRequests}`, 14, finalY + 30)
    doc.text(`Rejected: ${rejectedRequests}`, 14, finalY + 36)
    doc.text(`Total Days Off (Accepted): ${totalDaysOff}`, 14, finalY + 42)

    // Save the PDF
    const fileName = `Day_Off_Requests_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }

  return exportToPDF
}

interface OTDataItem {
  Type: string
  Date: string
  Time: string
  Reason: string
  Status: string
}

interface UserAttendanceStats {
  userId: string
  user: UserData
  year: number
  month: number
  otHours?: number
  leaveDays: number
  attendanceDays: number
}

interface UseExportAttendanceToPDFProps {
  users: UserData[]
  userStats: UserAttendanceStats[]
  summaryStats: {
    totalOT: number
    totalLeave: number
    totalAttendance: number
    workingDaysInMonth: number
  }
  otData: OTDataItem[]
  selectedYear: number
  selectedMonth: number
  selectedDepartment: string
  departments: DepartmentData[]
  getMonthName: (month: number) => string
}

export const useExportAttendanceToPDF = ({
  users,
  userStats,
  summaryStats,
  otData,
  selectedYear,
  selectedMonth,
  selectedDepartment,
  departments,
  getMonthName
}: UseExportAttendanceToPDFProps) => {
  const parseTimeToHours = (timeString: string): number => {
    const [startTime, endTime] = timeString.split(' - ')
    if (!startTime || !endTime) return 0

    const parseTime = (timeStr: string): number => {
      const [time, period] = timeStr.split(' ')
      const [hours, minutes] = time.split(':').map(Number)
      let hour24 = hours
      if (period === 'PM' && hours !== 12) hour24 += 12
      if (period === 'AM' && hours === 12) hour24 = 0
      return hour24 + minutes / 60
    }

    const start = parseTime(startTime.trim())
    const end = parseTime(endTime.trim())
    return Math.max(0, end - start)
  }

  const exportToPDF = async () => {
    // Create new PDF document
    const doc = new jsPDF('l', 'mm', 'a4') // landscape orientation

    // Add title
    doc.setFontSize(18)
    doc.text('Attendance Report', 14, 15)

    // Add filter information
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    const filterText = `Period: ${getMonthName(selectedMonth)} ${selectedYear}${selectedDepartment ? ` | Department: ${departments.find(d => d._id === selectedDepartment)?.department_name || 'All'}` : ' | All Departments'}`
    doc.text(filterText, 14, 22)
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 14, 28)

    // Add summary statistics box
    let startY = 35
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text('Summary Statistics', 14, startY)

    doc.setFontSize(10)
    startY += 8
    doc.text(`Total Attendance Days: ${summaryStats.totalAttendance}`, 14, startY)
    startY += 6
    doc.text(`Total OT Hours: ${summaryStats.totalOT.toFixed(1)}h`, 14, startY)
    startY += 6
    doc.text(`Total Leave Days: ${summaryStats.totalLeave.toFixed(1)}`, 14, startY)
    startY += 6
    doc.text(`Working Days in Month: ${summaryStats.workingDaysInMonth}`, 14, startY)

    startY += 10

    // Prepare user attendance table data
    const userTableData = userStats.map((stats) => [
      `${stats.user.first_name_en} ${stats.user.last_name_en}`,
      `${stats.user.first_name_la} ${stats.user.last_name_la}`,
      stats.user.email,
      stats.year.toString(),
      getMonthName(stats.month),
      stats.otHours !== undefined ? `${stats.otHours.toFixed(1)}h` : '0h',
      stats.leaveDays.toFixed(1),
      stats.attendanceDays.toString()
    ])

    // Add user attendance table
    const tableHeaders = otData.length > 0
      ? [['Name (EN)', 'Name (LA)', 'Email', 'Year', 'Month', 'OT Hours', 'Leave Days', 'Attendance Days']]
      : [['Name (EN)', 'Name (LA)', 'Email', 'Year', 'Month', 'Leave Days', 'Attendance Days']]

    const tableDataWithoutOT = otData.length === 0
      ? userStats.map((stats) => [
        `${stats.user.first_name_en} ${stats.user.last_name_en}`,
        `${stats.user.first_name_la} ${stats.user.last_name_la}`,
        stats.user.email,
        stats.year.toString(),
        getMonthName(stats.month),
        stats.leaveDays.toFixed(1),
        stats.attendanceDays.toString()
      ])
      : userTableData

    autoTable(doc, {
      head: tableHeaders,
      body: tableDataWithoutOT,
      startY: startY,
      styles: {
        fontSize: 7,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [59, 130, 246], // blue-500
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251], // gray-50
      },
      columnStyles: otData.length > 0 ? {
        0: { cellWidth: 30 }, // Name EN
        1: { cellWidth: 30 }, // Name LA
        2: { cellWidth: 40 }, // Email
        3: { cellWidth: 15 }, // Year
        4: { cellWidth: 25 }, // Month
        5: { cellWidth: 20 }, // OT Hours
        6: { cellWidth: 20 }, // Leave Days
        7: { cellWidth: 25 }, // Attendance Days
      } : {
        0: { cellWidth: 35 }, // Name EN
        1: { cellWidth: 35 }, // Name LA
        2: { cellWidth: 45 }, // Email
        3: { cellWidth: 18 }, // Year
        4: { cellWidth: 30 }, // Month
        5: { cellWidth: 25 }, // Leave Days
        6: { cellWidth: 30 }, // Attendance Days
      },
      margin: { top: startY, left: 14, right: 14 },
    })

    // Get final Y position after first table
    let finalY = (doc as any).lastAutoTable.finalY || startY + 50

    // Add OT Data table if there's data
    if (otData.length > 0) {
      finalY += 10
      doc.setFontSize(12)
      doc.text('Overtime Requests', 14, finalY)
      finalY += 8

      // Prepare OT table data
      const otTableData = otData.map((ot) => {
        const hours = parseTimeToHours(ot.Time)
        return [
          ot.Type,
          ot.Date,
          ot.Time,
          ot.Reason,
          ot.Status,
          `${hours.toFixed(1)}h`
        ]
      })

      // Add OT table
      autoTable(doc, {
        head: [['Type', 'Date', 'Time', 'Reason', 'Status', 'Hours']],
        body: otTableData,
        startY: finalY,
        styles: {
          fontSize: 7,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [59, 130, 246], // blue-500
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251], // gray-50
        },
        columnStyles: {
          0: { cellWidth: 25 }, // Type
          1: { cellWidth: 30 }, // Date
          2: { cellWidth: 35 }, // Time
          3: { cellWidth: 50 }, // Reason
          4: { cellWidth: 25 }, // Status
          5: { cellWidth: 20 }, // Hours
        },
        margin: { top: finalY, left: 14, right: 14 },
      })
    }

    // Save the PDF
    const fileName = `Attendance_Report_${getMonthName(selectedMonth)}_${selectedYear}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }

  return exportToPDF
}

interface OTDataForExport {
  Type: string
  Date: string
  Time: string
  Reason: string
  Status: string
}

interface UseExportOTToPDFProps {
  requests: OTDataForExport[]
  selectedYear: number
  selectedMonth: number
  selectedDepartment: string
  departments: DepartmentData[]
  getMonthName: (month: number) => string
}

export const useExportOTToPDF = ({
  requests,
  selectedYear,
  selectedMonth,
  selectedDepartment,
  departments,
  getMonthName
}: UseExportOTToPDFProps) => {
  const parseTimeToHours = (timeString: string): number => {
    const [startTime, endTime] = timeString.split(' - ')
    if (!startTime || !endTime) return 0

    const parseTime = (timeStr: string): number => {
      const [hours, minutes] = timeStr.split(':').map(Number)
      return hours + minutes / 60
    }

    const start = parseTime(startTime.trim())
    const end = parseTime(endTime.trim())
    return Math.max(0, end - start)
  }

  const exportToPDF = async () => {
    // Create new PDF document
    const doc = new jsPDF('l', 'mm', 'a4') // landscape orientation

    // Add title
    doc.setFontSize(18)
    doc.text('OT & Field Work Requests Report', 14, 15)

    // Add filter information
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    const filterText = `Period: ${getMonthName(selectedMonth)} ${selectedYear}${selectedDepartment ? ` | Department: ${departments.find(d => d._id === selectedDepartment)?.department_name || 'All'}` : ' | All Departments'}`
    doc.text(filterText, 14, 22)
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 14, 28)

    // Prepare table data
    const tableData = requests.map((request) => {
      const hours = parseTimeToHours(request.Time)
      return [
        request.Type,
        request.Date,
        request.Time,
        request.Reason,
        request.Status === 'Accept' ? 'Accepted' : request.Status,
        `${hours.toFixed(1)}h`
      ]
    })

    // Add table using autoTable
    autoTable(doc, {
      head: [['Type', 'Date', 'Time', 'Reason', 'Status', 'Hours']],
      body: tableData,
      startY: 35,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [59, 130, 246], // blue-500
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251], // gray-50
      },
      columnStyles: {
        0: { cellWidth: 30 }, // Type
        1: { cellWidth: 35 }, // Date
        2: { cellWidth: 40 }, // Time
        3: { cellWidth: 60 }, // Reason
        4: { cellWidth: 30 }, // Status
        5: { cellWidth: 25 }, // Hours
      },
      margin: { top: 35, left: 14, right: 14 },
    })

    // Add summary statistics
    const totalRequests = requests.length
    const pendingRequests = requests.filter(r => r.Status === 'Pending').length
    const acceptedRequests = requests.filter(r => r.Status === 'Accept').length
    const rejectedRequests = requests.filter(r => r.Status === 'Reject').length
    const totalHours = requests
      .filter(r => r.Status === 'Accept')
      .reduce((sum, r) => sum + parseTimeToHours(r.Time), 0)

    const finalY = (doc as any).lastAutoTable.finalY || 100
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text('Summary Statistics', 14, finalY + 10)

    doc.setFontSize(10)
    doc.text(`Total Requests: ${totalRequests}`, 14, finalY + 18)
    doc.text(`Pending: ${pendingRequests}`, 14, finalY + 24)
    doc.text(`Accepted: ${acceptedRequests}`, 14, finalY + 30)
    doc.text(`Rejected: ${rejectedRequests}`, 14, finalY + 36)
    doc.text(`Total Hours (Accepted): ${totalHours.toFixed(1)}h`, 14, finalY + 42)

    // Save the PDF
    const fileName = `OT_FieldWork_Requests_${getMonthName(selectedMonth)}_${selectedYear}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }

  return exportToPDF
}

export default useExportToPDF
