import React from 'react'

const Topbar = ({ title, subtitle, onLogout, onMenu }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center gap-3">
        {onMenu && (
          <button
            type="button"
            onClick={onMenu}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 lg:hidden"
          >
            ☰
          </button>
        )}
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{subtitle}</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h1>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700"
      >
        Logout
      </button>
    </div>
  )
}

export default Topbar
