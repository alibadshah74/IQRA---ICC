import React, { useEffect, useMemo, useState } from 'react'
import Table from '../../components/Table.jsx'
import Modal from '../../components/Modal.jsx'
import FormCard from '../../components/FormCard.jsx'
import apiClient from '../../api/client.js'

const TeacherStudents = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [rows, setRows] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [formError, setFormError] = useState(null)
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [form, setForm] = useState({
    id: '',
    fullName: '',
    email: '',
    username: '',
    password: '',
    classId: '',
    rollNumber: '',
    guardianName: '',
  })

  const columns = [
    { key: 'name', label: 'Student' },
    { key: 'className', label: 'Class' },
    { key: 'roll', label: 'Roll' },
    { key: 'guardian', label: 'Guardian' },
    { key: 'status', label: 'Status' },
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
            onClick={() => handleDisable(row._id)}
            className="rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700"
          >
            Disable
          </button>
        </div>
      ),
    },
  ]

  const fetchClasses = async () => {
    const { data } = await apiClient.get('/teacher/classes')
    const res = data?.data ?? data
    setClasses(Array.isArray(res) ? res : [])
  }

  const fetchStudents = async (query = '') => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    params.set('limit', '200')
    const { data } = await apiClient.get(`/teacher/students?${params}`)
    const res = data?.data ?? data
    const items = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : [])
    setRows(
      items.map((s) => ({
        ...s,
        _id: s._id,
        name: s.fullName ?? s.name ?? s.email ?? '-',
        className: Array.isArray(s.assignedClasses) && s.assignedClasses.length
          ? `${s.assignedClasses[0].className}${s.assignedClasses[0].section ? ` - ${s.assignedClasses[0].section}` : ''}`
          : '-',
        roll: s.rollNumber || '-',
        guardian: s.guardianName || '-',
        status: s.isActive === false ? 'Disabled' : 'Active',
      })),
    )
  }

  const filteredRows = useMemo(() => {
    if (!classFilter) return rows
    return rows.filter((row) => {
      const classId = Array.isArray(row.assignedClasses) && row.assignedClasses.length
        ? row.assignedClasses[0]._id
        : ''
      return classId === classFilter
    })
  }, [rows, classFilter])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        await Promise.all([fetchClasses(), fetchStudents(search)])
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message || 'Failed to load students')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [search])

  const handleEdit = (row) => {
    const assigned = Array.isArray(row.assignedClasses) ? row.assignedClasses[0] : row.assignedClasses
    setForm({
      id: row._id,
      fullName: row.fullName ?? '',
      email: row.email ?? '',
      username: row.username ?? '',
      password: '',
      classId: assigned?._id ?? assigned ?? '',
      rollNumber: row.rollNumber ?? '',
      guardianName: row.guardianName ?? '',
    })
    setFormError(null)
    setIsOpen(true)
  }

  const handleDisable = async (id) => {
    if (!id) return
    try {
      await apiClient.patch(`/teacher/students/${id}/disable`)
      fetchStudents(search)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to disable student')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        username: form.username,
        password: form.password,
        classId: form.classId,
        rollNumber: form.rollNumber,
        guardianName: form.guardianName,
      }
      if (form.id) {
        if (!payload.password) delete payload.password
        await apiClient.put(`/teacher/students/${form.id}`, payload)
      } else {
        await apiClient.post('/teacher/students', payload)
      }
      setIsOpen(false)
      setForm({ id: '', fullName: '', email: '', username: '', password: '', classId: '', rollNumber: '', guardianName: '' })
      fetchStudents(search)
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to save student')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}
      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      <FormCard
        title="Manage Students"
        description="Add, edit, or disable student records."
        actions={
          <button
            onClick={() => {
              setForm({ id: '', fullName: '', email: '', username: '', password: '', classId: '', rollNumber: '', guardianName: '' })
              setFormError(null)
              setIsOpen(true)
            }}
            className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700"
          >
            Add Student
          </button>
        }
      >
        <div className="grid gap-3 md:grid-cols-2">
          <input
            type="text"
            placeholder="Search students"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.className} {cls.section ? `- ${cls.section}` : ''}
              </option>
            ))}
          </select>
        </div>
      </FormCard>

      <Table columns={columns} rows={filteredRows} />

      <Modal title={form.id ? 'Edit Student' : 'Add Student'} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{formError}</p>
          )}
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Student Name</label>
            <input
              required
              type="text"
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Username</label>
              <input
                required
                type="text"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
          {!form.id && (
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Password</label>
              <input
                required
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          )}
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Class</label>
              <select
                required
                value={form.classId}
                onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))}
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
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Roll</label>
              <input
                type="text"
                value={form.rollNumber}
                onChange={(e) => setForm((f) => ({ ...f, rollNumber: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Guardian</label>
            <input
              type="text"
              value={form.guardianName}
              onChange={(e) => setForm((f) => ({ ...f, guardianName: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default TeacherStudents
