import React, { useEffect, useState } from 'react'
import DataTable from '../../components/DataTable.jsx'
import StatCard from '../../components/StatCard.jsx'
import Modal from '../../components/Modal.jsx'
import apiClient from '../../api/client.js'

const AdminUsers = () => {
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({ q: '', role: '', isActive: '' })
  const [createOpen, setCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState(null)
  const [stats, setStats] = useState([
    { label: 'Total Users', value: '—' },
    { label: 'Active Teachers', value: '—' },
    { label: 'Guardians', value: '—' },
  ])
  const [metaStats, setMetaStats] = useState({ activeTeachers: '—', activeParents: '—' })
  const [classes, setClasses] = useState([])
  const [editOpen, setEditOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState(null)
  const [editForm, setEditForm] = useState({
    id: '',
    fullName: '',
    email: '',
    username: '',
    role: 'student',
    isActive: true,
    classId: '',
    rollNumber: '',
    guardianName: '',
  })
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    role: 'student',
  })

  const columns = [
    { key: 'fullName', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'email', label: 'Email' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-semibold text-slate-600">
          {row.isActive !== false ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleEdit(row)}
            className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleDeactivate(row._id)}
            className="rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700"
          >
            Disable
          </button>
        </div>
      ),
    },
  ]

  const fetchUsers = async () => {
    try {
      setError(null)
      const params = new URLSearchParams()
      if (filters.q) params.set('q', filters.q)
      if (filters.role) params.set('role', filters.role)
      if (filters.isActive !== '') params.set('isActive', filters.isActive)
      params.set('page', String(pagination.page))
      params.set('limit', String(pagination.limit))
      const { data } = await apiClient.get(`/admin/users?${params}`)
      const res = data?.data ?? data
      setItems(Array.isArray(res?.items) ? res.items : [])
      if (res?.pagination) setPagination((p) => ({ ...p, ...res.pagination }))
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const { data } = await apiClient.get('/admin/dashboard/stats')
      const res = data?.data ?? data
      setMetaStats({
        activeTeachers: res?.activeTeachers ?? '—',
        activeParents: res?.activeParents ?? '—',
      })
    } catch (err) {
      // Silent fail for stats; main table still loads.
    }
  }

  const fetchClasses = async () => {
    try {
      const { data } = await apiClient.get('/admin/classes?limit=200')
      const res = data?.data ?? data
      setClasses(Array.isArray(res?.items) ? res.items : [])
    } catch (err) {
      // ignore
    }
  }

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (filters.q) params.set('q', filters.q)
        if (filters.role) params.set('role', filters.role)
        if (filters.isActive !== '') params.set('isActive', filters.isActive)
        params.set('page', '1')
        params.set('limit', '20')
        const { data } = await apiClient.get(`/admin/users?${params}`)
        if (cancelled) return
        const res = data?.data ?? data
        setItems(Array.isArray(res?.items) ? res.items : [])
        if (res?.pagination) setPagination((p) => ({ ...p, ...res.pagination }))
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message || 'Failed to load users')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [filters.q, filters.role, filters.isActive])

  useEffect(() => {
    fetchStats()
    fetchClasses()
  }, [])

  useEffect(() => {
    setStats([
      { label: 'Total Users', value: String(pagination.total || '—') },
      { label: 'Active Teachers', value: String(metaStats.activeTeachers || '—') },
      { label: 'Guardians', value: String(metaStats.activeParents || '—') },
    ])
  }, [pagination.total, metaStats])

  const handleDeactivate = async (id) => {
    if (!id) return
    try {
      await apiClient.patch(`/admin/users/${id}/deactivate`)
      fetchUsers()
      fetchStats()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to deactivate')
    }
  }

  const handleEdit = (row) => {
    if (!row?._id) return
    const assigned = Array.isArray(row.assignedClasses) ? row.assignedClasses[0] : row.assignedClasses
    setEditForm({
      id: row._id,
      fullName: row.fullName ?? '',
      email: row.email ?? '',
      username: row.username ?? '',
      role: row.role ?? 'student',
      isActive: row.isActive !== false,
      classId: assigned?._id ?? assigned ?? '',
      rollNumber: row.rollNumber ?? '',
      guardianName: row.guardianName ?? '',
    })
    setEditError(null)
    setEditOpen(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setEditLoading(true)
    setEditError(null)
    try {
      const payload = {
        fullName: editForm.fullName,
        email: editForm.email,
        username: editForm.username,
        role: editForm.role,
        isActive: editForm.isActive,
      }
      if (editForm.role === 'teacher' || editForm.role === 'student') {
        if (editForm.classId) payload.classId = editForm.classId
      }
      if (editForm.role === 'student') {
        payload.rollNumber = editForm.rollNumber
        payload.guardianName = editForm.guardianName
      }
      await apiClient.put(`/admin/users/${editForm.id}`, payload)
      setEditOpen(false)
      fetchUsers()
      fetchStats()
    } catch (err) {
      setEditError(err.response?.data?.message || err.message || 'Failed to update user')
    } finally {
      setEditLoading(false)
    }
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    setCreateLoading(true)
    setCreateError(null)
    try {
      await apiClient.post('/admin/users', createForm)
      setCreateOpen(false)
      setCreateForm({ fullName: '', email: '', username: '', password: '', role: 'student' })
      fetchUsers()
    } catch (err) {
      setCreateError(err.response?.data?.message || err.message || 'Failed to create user')
    } finally {
      setCreateLoading(false)
    }
  }

  const rows = items.map((u) => ({
    ...u,
    _id: u._id,
    fullName: u.fullName ?? u.name,
    role: u.role,
    email: u.email,
    username: u.username,
    assignedClasses: u.assignedClasses,
    rollNumber: u.rollNumber,
    guardianName: u.guardianName,
    isActive: u.isActive,
  }))

  return (
    <div className="space-y-8">
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Users Management</h2>
            <p className="mt-1 text-sm text-slate-500">Create, review, and manage staff and learner profiles.</p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700"
          >
            Add User
          </button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-[1fr,0.6fr,0.6fr]">
          <input
            type="text"
            placeholder="Search by name or email"
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <select
            value={filters.role}
            onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
            <option value="parent">Parent</option>
          </select>
          <select
            value={filters.isActive}
            onChange={(e) => setFilters((f) => ({ ...f, isActive: e.target.value }))}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Status: All</option>
            <option value="true">Active</option>
            <option value="false">Disabled</option>
          </select>
        </div>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading users…</p>}
      <DataTable columns={columns} rows={rows} />

      <Modal title="Add User" isOpen={createOpen} onClose={() => setCreateOpen(false)}>
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {createError && (
            <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{createError}</p>
          )}
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Full Name</label>
            <input
              required
              value={createForm.fullName}
              onChange={(e) => setCreateForm((f) => ({ ...f, fullName: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Email</label>
            <input
              type="email"
              required
              value={createForm.email}
              onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Username</label>
            <input
              required
              value={createForm.username}
              onChange={(e) => setCreateForm((f) => ({ ...f, username: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Password</label>
            <input
              type="password"
              required
              value={createForm.password}
              onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Role</label>
            <select
              value={createForm.role}
              onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLoading}
              className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
            >
              {createLoading ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal title="Edit User" isOpen={editOpen} onClose={() => setEditOpen(false)}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {editError && (
            <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{editError}</p>
          )}
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Full Name</label>
            <input
              required
              value={editForm.fullName}
              onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Email</label>
            <input
              type="email"
              required
              value={editForm.email}
              onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Username</label>
            <input
              required
              value={editForm.username}
              onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Role</label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="parent">Parent</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</label>
              <select
                value={editForm.isActive ? 'active' : 'inactive'}
                onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.value === 'active' }))}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="active">Active</option>
                <option value="inactive">Disabled</option>
              </select>
            </div>
          </div>

          {(editForm.role === 'teacher' || editForm.role === 'student') && (
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Assigned Class</label>
              <select
                value={editForm.classId}
                onChange={(e) => setEditForm((f) => ({ ...f, classId: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select class</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.className} {cls.section ? `- ${cls.section}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {editForm.role === 'student' && (
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Roll Number</label>
                <input
                  value={editForm.rollNumber}
                  onChange={(e) => setEditForm((f) => ({ ...f, rollNumber: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Guardian Name</label>
                <input
                  value={editForm.guardianName}
                  onChange={(e) => setEditForm((f) => ({ ...f, guardianName: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editLoading}
              className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
            >
              {editLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AdminUsers
