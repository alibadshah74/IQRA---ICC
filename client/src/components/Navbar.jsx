import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <header className="flex items-center justify-between py-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Logo goes here */}
          <img src="iqra_logo.svg" alt="" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">ICC</p>
          <p className="text-lg font-semibold text-slate-900">IQRA COACHING CENTER</p>
        </div>
      </div>
      <Link
        to="/select-role"
        className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700"
      >
        Login
      </Link>
    </header>
  )
}

export default Navbar
