import React, { useEffect, useState } from 'react'
import Table from '../../components/Table.jsx'
import Modal from '../../components/Modal.jsx'
import FormCard from '../../components/FormCard.jsx'
import apiClient from '../../api/client.js'

const TeacherMaterials = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [rows, setRows] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [formError, setFormError] = useState(null)
  const [form, setForm] = useState({ id: '', title: '', classId: '', subjectId: '', file: null })

  const columns = [
    { key: 'title', label: 'Material' },
    { key: 'className', label: 'Class' },
    { key: 'subjectName', label: 'Subject' },
    { key: 'uploaded', label: 'Uploaded' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <a
            href={row.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-gray-50"
          >
            View
          </a>
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

  const fetchMeta = async () => {
    const [{ data: classData }, { data: subjectData }] = await Promise.all([
      apiClient.get('/teacher/classes'),
      apiClient.get('/teacher/subjects'),
    ])
    const classRes = classData?.data ?? classData
    const subjectRes = subjectData?.data ?? subjectData
    setClasses(Array.isArray(classRes) ? classRes : [])
    setSubjects(Array.isArray(subjectRes) ? subjectRes : [])
  }

  const fetchMaterials = async () => {
    const { data } = await apiClient.get('/teacher/materials?limit=200')
    const res = data?.data ?? data
    const items = Array.isArray(res?.items) ? res.items : []
    setRows(
      items.map((m) => ({
        ...m,
        _id: m._id,
        title: m.title,
        className: m.class?.className ? `${m.class.className}${m.class.section ? ` - ${m.class.section}` : ''}` : '-',
        subjectName: m.subject?.subjectName || '-',
        uploaded: m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '-',
        fileUrl: m.fileUrl,
      })),
    )
  }

  const fetchAll = async () => {
    try {
      setLoading(true)
      setError(null)
      await Promise.all([fetchMeta(), fetchMaterials()])
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load materials')
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
      title: row.title || '',
      classId: row.class?._id || row.class || '',
      subjectId: row.subject?._id || row.subject || '',
      file: null,
    })
    setFormError(null)
    setIsOpen(true)
  }

  const handleDisable = async (id) => {
    if (!id) return
    try {
      await apiClient.patch(`/teacher/materials/${id}/disable`)
      fetchMaterials()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to disable material')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('classId', form.classId)
      if (form.subjectId) formData.append('subjectId', form.subjectId)
      if (form.file) formData.append('file', form.file)

      if (form.id) {
        await apiClient.put(`/teacher/materials/${form.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        await apiClient.post('/teacher/materials', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }

      setIsOpen(false)
      setForm({ id: '', title: '', classId: '', subjectId: '', file: null })
      fetchMaterials()
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to save material')
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
        title="Upload Study Materials"
        description="Share notes, worksheets, and resources with students."
        actions={
          <button
            onClick={() => {
              setForm({ id: '', title: '', classId: '', subjectId: '', file: null })
              setFormError(null)
              setIsOpen(true)
            }}
            className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700"
          >
            Upload Material
          </button>
        }
      >
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <p className="text-sm text-slate-500">Use the upload button to share files with your classes.</p>
        </div>
      </FormCard>

      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      <Table columns={columns} rows={rows} />

      <Modal title={form.id ? 'Edit Material' : 'Upload Material'} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{formError}</p>
          )}
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Title</label>
            <input
              required
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
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
            <select
              value={form.subjectId}
              onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Select subject</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>{subject.subjectName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">File</label>
            <input
              type="file"
              required={!form.id}
              onChange={(e) => setForm((f) => ({ ...f, file: e.target.files?.[0] || null }))}
              className="mt-2 w-full text-sm"
            />
            {form.id && (
              <p className="mt-2 text-xs text-slate-500">Leave empty to keep existing file.</p>
            )}
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

export default TeacherMaterials
