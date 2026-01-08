const ActionButton = ({ label }: { label: string }) => (
  <button className="px-4 py-2 rounded-lg bg-green-500 text-white font-semibold shadow-sm hover:bg-green-600 hover:shadow-md transition">
    {label}
  </button>
)
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

export { ActionButton, ProfileField, formatDate }