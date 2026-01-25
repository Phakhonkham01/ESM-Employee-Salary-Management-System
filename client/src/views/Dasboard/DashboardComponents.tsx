'use client'

import React from 'react'
import {
    Users,
    DollarSign,
    Calendar,
    Briefcase,
    Clock,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    XCircle,
    AlertCircle,
} from 'lucide-react'

// Stat Card Component
interface StatCardProps {
    title: string
    value: string | number
    icon: React.ElementType
    trend?: {
        value: number
        isPositive: boolean
        label: string
    }
    color: string
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon: Icon,
    trend,
    color,
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                    
                    {trend && (
                        <div className="flex items-center mt-2">
                            {trend.isPositive ? (
                                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                            )}
                            <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {trend.isPositive ? '+' : ''}{trend.value}%
                            </span>
                            <span className="text-sm text-gray-500 ml-2">{trend.label}</span>
                        </div>
                    )}
                </div>
                <div className={`w-12 h-12 ${color} bg-opacity-10 rounded-full flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
            </div>
        </div>
    )
}

// Activity Item Component
interface ActivityItemProps {
    type: 'salary' | 'request' | 'dayoff' | 'user'
    title: string
    description: string
    status: string
    timestamp: string
    icon: React.ElementType
}

export const ActivityItem: React.FC<ActivityItemProps> = ({
    type,
    title,
    description,
    status,
    timestamp,
    icon: Icon,
}) => {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'accepted':
            case 'approved':
            case 'paid':
                return 'bg-green-100 text-green-800'
            case 'rejected':
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'salary':
                return 'text-blue-600 bg-blue-50'
            case 'request':
                return 'text-orange-600 bg-orange-50'
            case 'dayoff':
                return 'text-purple-600 bg-purple-50'
            case 'user':
                return 'text-green-600 bg-green-50'
            default:
                return 'text-gray-600 bg-gray-50'
        }
    }

    return (
        <div className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors group">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(type)}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {title}
                    </p>
                    <span className="text-xs text-gray-500">{timestamp}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(status)}`}>
                        {status}
                    </span>
                    <span className="text-xs text-gray-600">{description}</span>
                </div>
            </div>
        </div>
    )
}

// Chart Container Component
interface ChartContainerProps {
    title: string
    subtitle?: string
    children: React.ReactNode
    action?: React.ReactNode
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
    title,
    subtitle,
    children,
    action,
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    {subtitle && (
                        <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                    )}
                </div>
                {action && <div>{action}</div>}
            </div>
            <div className="h-64">
                {children}
            </div>
        </div>
    )
}

// Progress Bar Component
interface ProgressBarProps {
    label: string
    value: number
    max: number
    color: string
    showValue?: boolean
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    label,
    value,
    max,
    color,
    showValue = true,
}) => {
    const percentage = max > 0 ? (value / max) * 100 : 0
    
    return (
        <div className="space-y-2">
            <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                {showValue && (
                    <span className="text-sm font-semibold text-gray-900">
                        {value} ({percentage.toFixed(1)}%)
                    </span>
                )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: color,
                    }}
                ></div>
            </div>
        </div>
    )
}

// Metric Comparison Component
interface MetricComparisonProps {
    current: number
    previous: number
    label: string
    format?: (value: number) => string
}

export const MetricComparison: React.FC<MetricComparisonProps> = ({
    current,
    previous,
    label,
    format = (val) => val.toString(),
}) => {
    const change = previous !== 0 ? ((current - previous) / previous) * 100 : 100
    const isPositive = change >= 0
    const changeAbs = Math.abs(change)

    return (
        <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600">{label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        {format(current)}
                    </p>
                </div>
                <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {isPositive ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {changeAbs.toFixed(1)}%
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Previous: {format(previous)}
                    </p>
                </div>
            </div>
        </div>
    )
}

// Quick Actions Component
interface QuickAction {
    icon: React.ElementType
    label: string
    onClick: () => void
    color: string
}

export const QuickActions: React.FC<{ actions: QuickAction[] }> = ({ actions }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actions.map((action, index) => {
                const Icon = action.icon
                return (
                    <button
                        key={index}
                        onClick={action.onClick}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-blue-200 group"
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${action.color} bg-opacity-10 mb-3 group-hover:scale-110 transition-transform`}>
                            <Icon className={`w-5 h-5 ${action.color}`} />
                        </div>
                        <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {action.label}
                        </span>
                    </button>
                )
            })}
        </div>
    )
}

// Status Indicator Component
interface StatusIndicatorProps {
    type: 'success' | 'warning' | 'error' | 'info'
    message: string
    details?: string
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
    type,
    message,
    details,
}) => {
    const config = {
        success: {
            icon: CheckCircle,
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            textColor: 'text-green-800',
            iconColor: 'text-green-500',
        },
        warning: {
            icon: AlertCircle,
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            textColor: 'text-yellow-800',
            iconColor: 'text-yellow-500',
        },
        error: {
            icon: XCircle,
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            textColor: 'text-red-800',
            iconColor: 'text-red-500',
        },
        info: {
            icon: AlertCircle,
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-800',
            iconColor: 'text-blue-500',
        },
    }

    const { icon: Icon, bgColor, borderColor, textColor, iconColor } = config[type]

    return (
        <div className={`${bgColor} border ${borderColor} rounded-lg p-4`}>
            <div className="flex">
                <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
                <div className="ml-3">
                    <p className={`text-sm font-medium ${textColor}`}>{message}</p>
                    {details && (
                        <p className="text-sm text-gray-600 mt-1">{details}</p>
                    )}
                </div>
            </div>
        </div>
    )
}

// Loading Skeleton Component
export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header Skeleton */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-96"></div>
                </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                        <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded w-24 mb-4"></div>
                            <div className="h-3 bg-gray-200 rounded w-48"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {[1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                        <div className="animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
                            <div className="h-64 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Activities Skeleton */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div className="ml-4 flex-1">
                                <div className="h-4 bg-gray-200 rounded w-64 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-48"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default {
    StatCard,
    ActivityItem,
    ChartContainer,
    ProgressBar,
    MetricComparison,
    QuickActions,
    StatusIndicator,
    DashboardSkeleton,
}