import React, { useEffect, useState } from 'react'
import DataTable from '../../components/DataTable.jsx'
import Modal from '../../components/Modal.jsx'
import apiClient from '../../api/client.js'

const AdminAcademics = () => {
  const [classRows, setClassRows] = useState([])
  const [subjectRows, setSubjectRows] = useState([])
  const [teachers, setTeachers] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [classModalOpen, setClassModalOpen] = useState(false)
  const [classForm, setClassForm] = useState({ id: '', className: '', section: '', classTeacher: '' })
  const [classSaving, setClassSaving] = useState(false)
  const [classError, setClassError] = useState(null)

  const [subjectModalOpen, setSubjectModalOpen] = useState(false)
  const [subjectForm, setSubjectForm] = useState({ id: '', subjectName: '', classId: '', teacherId: '' })
  const [subjectSaving, setSubjectSaving] = useState(false)
  const [subjectError, setSubjectError] = useState(null)

  const classColumns = [
    { key: 'className', label: 'Class' },
    { key: 'section', label: 'Section' },
    { key: 'teacher', label: 'Class Teacher' },
    { key: 'studentsCount', label: 'Students' },
    { key: 'status', label: 'Status' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleEditClass(row)}
            className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleDisableClass(row._id)}
            className="rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700"
          >
            Disable
          </button>
        </div>
      ),
    },
  ]

  const subjectColumns = [
    { key: 'subjectName', label: 'Subject' },
    { key: 'className', label: 'Class' },
    { key: 'teacher', label: 'Assigned Teacher' },
    { key: 'status', label: 'Status' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleEditSubject(row)}
            className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleDisableSubject(row._id)}
            className="rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700"
          >
            Disable
          </button>
        </div>
      ),
    },
  ]

  const fetchTeachers = async () => {
    try {
      const { data } = await apiClient.get('/admin/users?role=teacher&limit=200')
      const res = data?.data ?? data
      setTeachers(Array.isArray(res?.items) ? res.items : [])
    } catch {
      setTeachers([])
    }
  }

  const fetchClasses = async () => {
    const { data } = await apiClient.get('/admin/classes?limit=200')
    const res = data?.data ?? data
    const items = Array.isArray(res?.items) ? res.items : []
    setClasses(items)
    setClassRows(
      items.map((cls) => ({
        ...cls,
        _id: cls._id,
        className: cls.className,
        section: cls.section || '-',
        teacher: cls.classTeacher?.fullName || '-',
        studentsCount: String(cls.studentsCount ?? 0),
        status: cls.isActive === false ? 'Disabled' : 'Active',
      })),
    )
  }

  const fetchSubjects = async () => {
    const { data } = await apiClient.get('/admin/subjects?limit=200')
    const res = data?.data ?? data
    const items = Array.isArray(res?.items) ? res.items : []
    setSubjectRows(
      items.map((subject) => ({
        ...subject,
        _id: subject._id,
        subjectName: subject.subjectName,
        className: subject.class?.className || '-',
        teacher: subject.teacher?.fullName || '-',
        status: subject.isActive === false ? 'Disabled' : 'Active',
      })),
    )
  }

  const fetchAll = async () => {
    try {
      setLoading(true)
      setError(null)
      await Promise.all([fetchTeachers(), fetchClasses(), fetchSubjects()])
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load academics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const handleEditClass = (row) => {
    setClassForm({
      id: row._id,
      className: row.className || '',
      section: row.section === '—' ? '' : row.section || '',
      classTeacher: row.classTeacher?._id || row.classTeacher || '',
    })
    setClassError(null)
    setClassModalOpen(true)
  }

  const handleClassSubmit = async (e) => {
    e.preventDefault()
    setClassSaving(true)
    setClassError(null)
    try {
      const payload = {
        className: classForm.className,
        section: classForm.section,
        classTeacher: classForm.classTeacher || undefined,
      }
      if (classForm.id) {
        await apiClient.put(`/admin/classes/${classForm.id}`, payload)
      } else {
        await apiClient.post('/admin/classes', payload)
      }
      setClassModalOpen(false)
      setClassForm({ id: '', className: '', section: '', classTeacher: '' })
      await fetchClasses()
    } catch (err) {
      setClassError(err.response?.data?.message || err.message || 'Failed to save class')
    } finally {
      setClassSaving(false)
    }
  }

  const handleDisableClass = async (id) => {
    if (!id) return
    try {
      await apiClient.patch(`/admin/classes/${id}/disable`)
      fetchClasses()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to disable class')
    }
  }

  const handleEditSubject = (row) => {
    setSubjectForm({
      id: row._id,
      subjectName: row.subjectName || '',
      classId: row.class?._id || row.class || '',
      teacherId: row.teacher?._id || row.teacher || '',
    })
    setSubjectError(null)
    setSubjectModalOpen(true)
  }

  const handleSubjectSubmit = async (e) => {
    e.preventDefault()
    setSubjectSaving(true)
    setSubjectError(null)
    try {
      const payload = {
        subjectName: subjectForm.subjectName,
        classId: subjectForm.classId,
        teacherId: subjectForm.teacherId || undefined,
      }
      if (subjectForm.id) {
        await apiClient.put(`/admin/subjects/${subjectForm.id}`, payload)
      } else {
        await apiClient.post('/admin/subjects', payload)
      }
      setSubjectModalOpen(false)
      setSubjectForm({ id: '', subjectName: '', classId: '', teacherId: '' })
      await fetchSubjects()
    } catch (err) {
      setSubjectError(err.response?.data?.message || err.message || 'Failed to save subject')
    } finally {
      setSubjectSaving(false)
    }
  }

  const handleDisableSubject = async (id) => {
    if (!id) return
    try {
      await apiClient.patch(`/admin/subjects/${id}/disable`)
      fetchSubjects()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to disable subject')
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Classes & Subjects</h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage class groups, sections, and subject assignments for the academic year.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setClassForm({ id: '', className: '', section: '', classTeacher: '' })
                setClassError(null)
                setClassModalOpen(true)
              }}
              className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700"
            >
              Add Class
            </button>
            <button
              onClick={() => {
                setSubjectForm({ id: '', subjectName: '', classId: '', teacherId: '' })
                setSubjectError(null)
                setSubjectModalOpen(true)
              }}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:bg-gray-50"
            >
              Add Subject
            </button>
          </div>
        </div>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      <div className="grid gap-6 lg:grid-cols-2">
        <DataTable columns={classColumns} rows={classRows} />
        <DataTable columns={subjectColumns} rows={subjectRows} />
      </div>

      <Modal title={classForm.id ? 'Edit Class' : 'Add Class'} isOpen={classModalOpen} onClose={() => setClassModalOpen(false)}>
        <form onSubmit={handleClassSubmit} className="space-y-4">
          {classError && (
            <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{classError}</p>
          )}
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Class Name</label>
            <input
              required
              value={classForm.className}
              onChange={(e) => setClassForm((f) => ({ ...f, className: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Section</label>
            <input
              value={classForm.section}
              onChange={(e) => setClassForm((f) => ({ ...f, section: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Class Teacher</label>
            <select
              value={classForm.classTeacher}
              onChange={(e) => setClassForm((f) => ({ ...f, classTeacher: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Unassigned</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>{t.fullName}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setClassModalOpen(false)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={classSaving}
              className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
            >
              {classSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal title={subjectForm.id ? 'Edit Subject' : 'Add Subject'} isOpen={subjectModalOpen} onClose={() => setSubjectModalOpen(false)}>
        <form onSubmit={handleSubjectSubmit} className="space-y-4">
          {subjectError && (
            <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{subjectError}</p>
          )}
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Subject Name</label>
            <input
              required
              value={subjectForm.subjectName}
              onChange={(e) => setSubjectForm((f) => ({ ...f, subjectName: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Class</label>
            <select
              required
              value={subjectForm.classId}
              onChange={(e) => setSubjectForm((f) => ({ ...f, classId: e.target.value }))}
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
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Assigned Teacher</label>
            <select
              value={subjectForm.teacherId}
              onChange={(e) => setSubjectForm((f) => ({ ...f, teacherId: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Unassigned</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>{t.fullName}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setSubjectModalOpen(false)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={subjectSaving}
              className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
            >
              {subjectSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AdminAcademics

