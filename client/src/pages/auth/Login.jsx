import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { login } from '../../api/auth.js'

const SELECTED_ROLE_KEY = 'iqra_selected_role'

const roleLabels = {
  admin: 'Admin',
  teacher: 'Teacher',
  student: 'Student',
  parent: 'Parent',
}

const Login = () => {
  const navigate = useNavigate()
  const { setLogin } = useAuth()
  const [selectedRole, setSelectedRole] = useState(() =>
    localStorage.getItem(SELECTED_ROLE_KEY),
  )
  const [formValues, setFormValues] = useState({
    userId: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!selectedRole) {
      navigate('/select-role', { replace: true })
    }
  }, [navigate, selectedRole])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!selectedRole) return
    setLoading(true)
    setError(null)
    try {
      const res = await login(formValues.userId, formValues.password)
      const payload = res?.data ?? res
      const token = payload?.token
      const user = payload?.user ?? null
      const role = payload?.role ?? user?.role
      if (!token || !role) {
        setError('Invalid response from server.')
        setLoading(false)
        return
      }
      setLogin(token, user, role)
      navigate(`/${role}`, { replace: true })
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const roleLabel = roleLabels[selectedRole] || 'User'

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">IQRA</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Sign in</h1>
          <p className="mt-2 text-sm text-slate-500">
            Signing in as <span className="font-semibold text-slate-800">{roleLabel}</span>.
          </p>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="userId" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                User ID
              </label>
              <input
                id="userId"
                name="userId"
                type="text"
                placeholder="Email or ID"
                value={formValues.userId}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formValues.password}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Need a different role?{' '}
            <Link to="/select-role" className="font-semibold text-blue-600 hover:text-blue-700">
              Change role
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
