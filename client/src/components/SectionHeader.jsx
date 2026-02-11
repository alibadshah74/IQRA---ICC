import React from 'react'

const SectionHeader = ({ kicker, title, subtitle }) => {
  return (
    <div className="mb-6">
      {kicker ? (
        <p className="text-xs uppercase tracking-[0.32em] text-slate-500">{kicker}</p>
      ) : null}
      <h2 className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl">{title}</h2>
      {subtitle ? (
        <p className="mt-3 max-w-2xl text-sm text-slate-500 md:text-base">{subtitle}</p>
      ) : null}
    </div>
  )
}

export default SectionHeader
