import React, { useEffect, useState } from 'react'
import Table from '../../components/Table.jsx'
import Modal from '../../components/Modal.jsx'
import FormCard from '../../components/FormCard.jsx'
import apiClient from '../../api/client.js'

const TeacherSubjects = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [rows, setRows] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [formError, setFormError] = useState(null)
  const [form, setForm] = useState({ id: '', classId: '', subjectName: '' })
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')

  const columns = [
    { key: 'className', label: 'Class' },
    { key: 'subjectName', label: 'Subject' },
    { key: 'teacher', label: 'Teacher' },
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

  const fetchSubjects = async () => {
    const { data } = await apiClient.get('/teacher/subjects')
    const res = data?.data ?? data
    const items = Array.isArray(res) ? res : []
    setRows(
      items.map((s) => ({
        ...s,
        _id: s._id,
        className: s.class?.className ? `${s.class.className}${s.class.section ? ` - ${s.class.section}` : ''}` : '-',
        subjectName: s.subjectName,
        teacher: s.teacher?.fullName || '-',
        status: s.isActive === false ? 'Disabled' : 'Active',
      })),
    )
  }

  const fetchAll = async () => {
    try {
      setLoading(true)
      setError(null)
      await Promise.all([fetchClasses(), fetchSubjects()])
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load subjects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const handleEdit = (row) => {
    setForm({
      id: row._id,
      classId: row.class?._id || row.class || '',
      subjectName: row.subjectName || '',
    })
    setFormError(null)
    setIsOpen(true)
  }

  const handleDisable = async (id) => {
    if (!id) return
    try {
      await apiClient.patch(`/teacher/subjects/${id}/disable`)
      fetchSubjects()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to disable subject')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      const payload = { classId: form.classId, subjectName: form.subjectName }
      if (form.id) {
        await apiClient.put(`/teacher/subjects/${form.id}`, payload)
      } else {
        await apiClient.post('/teacher/subjects', payload)
      }
      setIsOpen(false)
      setForm({ id: '', classId: '', subjectName: '' })
      fetchSubjects()
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to save subject')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}
      <FormCard
        title="Manage Classes & Subjects"
        description="Maintain subject assignments for your classes."
        actions={
          <button
            onClick={() => {
              setForm({ id: '', classId: '', subjectName: '' })
              setFormError(null)
              setIsOpen(true)
            }}
            className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700"
          >
            Add Subject
          </button>
        }
      >
        <div className="grid gap-3 md:grid-cols-2">
          <input
            type="text"
            placeholder="Search subject"
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

      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      <Table
        columns={columns}
        rows={rows.filter((row) => {
          const matchesSearch = search ? row.subjectName?.toLowerCase().includes(search.toLowerCase()) : true
          const matchesClass = classFilter ? row.class?._id === classFilter : true
          return matchesSearch && matchesClass
        })}
      />

      <Modal title={form.id ? 'Edit Subject' : 'Add Subject'} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{formError}</p>
          )}
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
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Subject</label>
            <input
              required
              type="text"
              value={form.subjectName}
              onChange={(e) => setForm((f) => ({ ...f, subjectName: e.target.value }))}
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

export default TeacherSubjects
