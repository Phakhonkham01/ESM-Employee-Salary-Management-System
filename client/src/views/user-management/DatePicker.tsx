'use client'

import type React from 'react'
import { useState } from 'react'

interface DatePickerProps {
    label: string
    value: string
    onChange: (date: string) => void
    required?: boolean
}

const DatePicker: React.FC<DatePickerProps> = ({
    label,
    value,
    onChange,
    required = false,
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [viewDate, setViewDate] = useState(() => {
        if (value) {
            const [year, month, day] = value.split('-').map(Number)
            return new Date(year, month - 1, day)
        }
        return new Date()
    })

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

    const years = Array.from(
        { length: 100 },
        (_, i) => new Date().getFullYear() - 80 + i,
    )

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1).getDay()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const days: (number | null)[] = []

        for (let i = 0; i < firstDay; i++) {
            days.push(null)
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i)
        }
        while (days.length < 42) {
            days.push(null)
        }
        return days
    }

    const handleSelectDate = (day: number) => {
        const year = viewDate.getFullYear()
        const month = viewDate.getMonth()
        const date = day

        const formatted = `${year}-${(month + 1).toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`
        onChange(formatted)
        setIsOpen(false)
    }

    const formatDisplayDate = (dateStr: string) => {
        if (!dateStr) return ''
        const [year, month, day] = dateStr.split('-').map(Number)
        const date = new Date(year, month - 1, day)

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    const selectedDate = value
        ? (() => {
              const [year, month, day] = value.split('-').map(Number)
              return new Date(year, month - 1, day)
          })()
        : null

    const handlePrevMonth = () => {
        setViewDate(
            new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1),
        )
    }

    const handleNextMonth = () => {
        setViewDate(
            new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1),
        )
    }

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const monthIndex = months.indexOf(e.target.value)
        setViewDate(new Date(viewDate.getFullYear(), monthIndex, 1))
    }

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setViewDate(new Date(parseInt(e.target.value), viewDate.getMonth(), 1))
    }

    const days = getDaysInMonth(viewDate)
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

    const isDateSelected = (day: number) => {
        if (!selectedDate || !day) return false
        return (
            day === selectedDate.getDate() &&
            viewDate.getMonth() === selectedDate.getMonth() &&
            viewDate.getFullYear() === selectedDate.getFullYear()
        )
    }

    const isToday = (day: number) => {
        const today = new Date()
        return (
            day === today.getDate() &&
            viewDate.getMonth() === today.getMonth() &&
            viewDate.getFullYear() === today.getFullYear()
        )
    }

    return (
        <div className="relative">
            <label className="block text-sm font-normal text-gray-700 mb-1">
                {label}
                {required && <span className="text-red-600 ml-1">*</span>}
            </label>
            <div
                className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F] cursor-pointer bg-white"
                onClick={() => setIsOpen(!isOpen)}
            >
                {value
                    ? formatDisplayDate(value)
                    : `Select ${label.toLowerCase()}`}
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg w-64">
                    <div className="p-3">
                        <div className="flex items-center justify-between mb-3">
                            <button
                                type="button"
                                onClick={handlePrevMonth}
                                className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900"
                            >
                                ‹
                            </button>

                            <div className="flex gap-2">
                                <select
                                    value={months[viewDate.getMonth()]}
                                    onChange={handleMonthChange}
                                    className="text-sm border-none focus:ring-0 focus:outline-none bg-transparent"
                                >
                                    {months.map((month) => (
                                        <option key={month} value={month}>
                                            {month}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={viewDate.getFullYear()}
                                    onChange={handleYearChange}
                                    className="text-sm border-none focus:ring-0 focus:outline-none bg-transparent"
                                >
                                    {years.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="button"
                                onClick={handleNextMonth}
                                className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900"
                            >
                                ›
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {dayNames.map((day) => (
                                <div
                                    key={day}
                                    className="text-center text-xs text-gray-500 font-medium"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {days.map((day, index) => {
                                const selected = isDateSelected(day || 0)
                                const today = isToday(day || 0)

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() =>
                                            day && handleSelectDate(day)
                                        }
                                        disabled={!day}
                                        className={`
                      h-8 w-8 text-sm rounded flex items-center justify-center
                      ${!day ? 'invisible' : ''}
                      ${
                          selected
                              ? 'bg-[#1F3A5F] text-white'
                              : today
                                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                : 'text-gray-700 hover:bg-gray-100'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                                    >
                                        {day}
                                    </button>
                                )
                            })}
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => {
                                    const today = new Date()
                                    const formatted = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`
                                    onChange(formatted)
                                    setIsOpen(false)
                                }}
                                className="w-full text-sm text-[#1F3A5F] hover:text-[#152642] font-medium py-1 hover:bg-gray-50 rounded"
                            >
                                Select Today
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DatePicker
