import React from 'react'
import { useNavigate } from 'react-router-dom'

const SELECTED_ROLE_KEY = 'iqra_selected_role'

const roles = [
  {
    id: 'admin',
    label: 'Admin',
    description: 'Manage users, academics, finance, and operations.',
  },
  {
    id: 'teacher',
    label: 'Teacher',
    description: 'Handle classes, assessments, routines, and materials.',
  },
  {
    id: 'student',
    label: 'Student',
    description: 'View routines, marks, and study resources.',
  },
  {
    id: 'parent',
    label: 'Parent',
    description: 'Track child progress, routines, and payments.',
  },
]

const SelectRole = () => {
  const navigate = useNavigate()

  const handleSelect = (role) => {
    localStorage.setItem(SELECTED_ROLE_KEY, role)
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">IQRA</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Select Your Role</h1>
          <p className="mt-2 text-sm text-slate-500">
            Choose the dashboard you want to access to continue.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleSelect(role.id)}
                className="rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold text-slate-900">{role.label}</p>
                  <span className="rounded-full bg-linear-to-r from-blue-600 to-indigo-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm">
                    Continue
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-500">{role.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SelectRole
