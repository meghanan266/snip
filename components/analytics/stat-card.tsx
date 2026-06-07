interface StatCardProps {
  label: string
  value: string | number
  sublabel?: string
}

export function StatCard({ label, value, sublabel }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 space-y-1">
      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
        {label}
      </p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sublabel && (
        <p className="text-xs text-gray-500 truncate">{sublabel}</p>
      )}
    </div>
  )
}
