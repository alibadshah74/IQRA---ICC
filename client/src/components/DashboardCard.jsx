import React from 'react'
import { Link } from 'react-router-dom'

const DashboardCard = ({ title, icon: Icon, to, description }) => {
  const CardContent = (
    <div className="flex h-full w-full flex-col justify-between rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-slate-700 sm:h-11 sm:w-11">
        {Icon ? <Icon className="h-4 w-4 sm:h-5 sm:w-5" /> : null}
      </div>
      <div className="mt-4">
        <p className="text-sm font-semibold text-slate-900 wrap-break-word leading-snug">{title}</p>
        {description ? <p className="mt-2 text-xs text-slate-500">{description}</p> : null}
      </div>
    </div>
  )

  if (to) {
    return (
      <Link to={to} className="block aspect-square">
        {CardContent}
      </Link>
    )
  }

  return <div className="aspect-square">{CardContent}</div>
}

export default DashboardCard
