import React from 'react'
import { NavLink } from 'react-router-dom'

const Sidebar = ({ brand, navItems, basePath, isOpen = false, onClose }) => {
  const buildPath = (path) => (path ? `${basePath}/${path}` : basePath)

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white px-6 py-8 transition lg:fixed lg:z-30 lg:h-screen lg:translate-x-0 lg:overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 flex items-center justify-between lg:mb-8">
          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{brand}</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">Dashboard</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 lg:hidden"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.label}
                to={buildPath(item.path)}
                end={item.path === ''}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-gray-100'
                  }`
                }
              >
                {Icon ? <Icon className="h-4 w-4" /> : null}
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-xs text-slate-500">
          IQRA School Suite
        </div>
      </aside>
    </>
  )
}

export default Sidebar
