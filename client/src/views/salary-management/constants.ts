// constants.ts



export const getVacationColorClass = (color: string) => {
    switch (color) {
        case 'red':
            return 'text-red-600 bg-red-50 border-red-200'
        case 'yellow':
            return 'text-yellow-600 bg-yellow-50 border-yellow-200'
        case 'green':
            return 'text-green-600 bg-green-50 border-green-200'
        default:
            return 'text-blue-600 bg-blue-50 border-blue-200'
    }
}


export const getOtTypeThai = (type: string) => {
    switch (type) {
        case 'weekday':
            return 'วันทำงานปกติ'
        case 'weekend':
            return 'วันหยุดสุดสัปดาห์'
        case 'holiday':
            return 'วันหยุดนักขัตฤกษ์'
        default:
            return type
    }
}



export const steps = [
  "Basic Information",
  "OT Rates",
  "Additional Income",
  "Deductions",
  "Summary",
]

export const getMonthName = (month: number): string => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  return months[month - 1] || ""
}

export const getVacationTextColor = (days: number): string => {
  if (days <= 0) return "text-red-600"
  if (days <= 5) return "text-amber-600"
  return "text-green-600"
}

export const getOtTypeColor = (type: string): string => {
  switch (type) {
    case "weekday":
      return "bg-blue-100 text-blue-800"
    case "weekend":
      return "bg-amber-100 text-amber-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export const getOtTypeEnglish = (type: string): string => {
  switch (type) {
    case "weekday":
      return "Weekday"
    case "weekend":
      return "Weekend"
    default:
      return type
  }
}

export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}
