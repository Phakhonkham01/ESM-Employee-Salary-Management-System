// HelperComponents.tsx - Add these components

import { ReactNode } from 'react'

// Stats Card Component
export const StatsCard = ({
    title,
    value,
    icon,
    change,
    trend,
    color = 'blue'
}: {
    title: string
    value: number
    icon: ReactNode
    change: string
    trend: 'up' | 'down'
    color: 'blue' | 'green' | 'amber' | 'purple'
}) => {
    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        amber: 'bg-amber-500',
        purple: 'bg-purple-500'
    }

    const textColorClasses = {
        blue: 'text-blue-700',
        green: 'text-green-700',
        amber: 'text-amber-700',
        purple: 'text-purple-700'
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[color]} bg-opacity-10`}>
                    <span className={`text-xl ${textColorClasses[color]}`}>{icon}</span>
                </div>
                <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {change}
                </span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{value}</div>
            <div className="text-sm text-slate-600 mt-1">{title}</div>
        </div>
    )
}

// Quick Actions Component
export const QuickActions = ({ actions }: { actions: any[] }) => {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
                {actions.map((action, index) => (
                    <button
                        key={index}
                        onClick={action.onClick}
                        className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                    >
                        <div className={`${action.color} text-white p-3 rounded-lg mb-3 group-hover:scale-110 transition-transform`}>
                            {action.icon}
                        </div>
                        <div className="font-medium text-slate-900">{action.label}</div>
                        <div className="text-xs text-slate-500 mt-1">{action.description}</div>
                    </button>
                ))}
            </div>
        </div>
    )
}

// Updated ActionButton with icon support
export const ActionButton = ({ 
    label, 
    onClick, 
    icon,
    variant = 'primary' 
}: { 
    label: string; 
    onClick: () => void;
    icon?: ReactNode;
    variant?: 'primary' | 'secondary';
}) => {
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                variant === 'primary' 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
        >
            {icon && <span>{icon}</span>}
            {label}
        </button>
    )
}

// Keep existing ProfileField and formatDate functions...


const formatDate = (dateString?: string) => {
  if (!dateString) return undefined
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
const ProfileField = ({
  label,
  value,
  icon,
}: {
  label: string
  value?: string
  icon: React.ReactNode
}) => (
  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
    <div className="text-3xl text-blue-600">{icon}</div>
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="text-base font-medium text-slate-900">
        {value || <span className="text-slate-400">Not specified</span>}
      </div>
    </div>
  </div>
)
 const toDecimalHour = (hour: number, minute: number) => {
    return hour + minute / 60
  }
export { ProfileField, formatDate, toDecimalHour }