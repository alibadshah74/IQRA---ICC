import React from 'react'

const StatsStrip = ({ stats }) => {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}

export default StatsStrip
