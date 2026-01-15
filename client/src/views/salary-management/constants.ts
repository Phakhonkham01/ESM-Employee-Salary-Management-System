// constants.ts

export const steps = [
    'Basic Information',
    'Set OT Rates',
    'Additional Income',
    'Deductions',
    'Summary',
]

export const getMonthName = (monthNum: number) => {
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ]
    return months[monthNum - 1] || ''
}

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

export const getVacationTextColor = (color: string) => {
    switch (color) {
        case 'red':
            return 'text-red-600'
        case 'yellow':
            return 'text-yellow-600'
        case 'green':
            return 'text-green-600'
        default:
            return 'text-blue-600'
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

export const getOtTypeColor = (type: string) => {
    switch (type) {
        case 'weekday':
            return 'bg-blue-100 text-blue-800'
        case 'weekend':
            return 'bg-yellow-100 text-yellow-800'
        case 'holiday':
            return 'bg-red-100 text-red-800'
        default:
            return 'bg-gray-100 text-gray-800'
    }
}