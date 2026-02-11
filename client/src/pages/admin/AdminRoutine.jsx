import React, { useEffect, useState } from 'react'
import DataTable from '../../components/DataTable.jsx'
import Modal from '../../components/Modal.jsx'
import apiClient from '../../api/client.js'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const AdminRoutine = () => {
  const [rows, setRows] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [isOpen, setIsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)
  const [form, setForm] = useState({
    id: '',
    classId: '',
    subjectId: '',
    teacherId: '',
    day: 'Monday',
    startTime: '',
    endTime: '',
    room: '',
  })

  const columns = [
    { key: 'className', label: 'Class' },
    { key: 'day', label: 'Day' },
    { key: 'time', label: 'Time' },
    { key: 'subjectName', label: 'Subject' },
    { key: 'teacherName', label: 'Teacher' },
    { key: 'room', label: 'Room' },
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

  const fetchMeta = async () => {
    const [{ data: classData }, { data: subjectData }, { data: teacherData }] = await Promise.all([
      apiClient.get('/admin/classes?limit=200'),
      apiClient.get('/admin/subjects?limit=200'),
      apiClient.get('/admin/users?role=teacher&limit=200'),
    ])

    const classRes = classData?.data ?? classData
    const subjectRes = subjectData?.data ?? subjectData
    const teacherRes = teacherData?.data ?? teacherData

    setClasses(Array.isArray(classRes?.items) ? classRes.items : [])
    setSubjects(Array.isArray(subjectRes?.items) ? subjectRes.items : [])
    setTeachers(Array.isArray(teacherRes?.items) ? teacherRes.items : [])
  }

  const fetchRoutines = async () => {
    const { data } = await apiClient.get('/admin/routines?limit=200')
    const res = data?.data ?? data
    const items = Array.isArray(res?.items) ? res.items : []
    setRows(
      items.map((r) => ({
        ...r,
        _id: r._id,
        className: r.class?.className ? `${r.class.className}${r.class.section ? ` - ${r.class.section}` : ''}` : '-',
        subjectName: r.subject?.subjectName || '-',
        teacherName: r.teacher?.fullName || '-',
        time: `${r.startTime || '-'} - ${r.endTime || '-'}`,
        room: r.room || '-',
        status: r.isActive === false ? 'Disabled' : 'Active',
      })),
    )
  }

  const fetchAll = async () => {
    try {
      setLoading(true)
      setError(null)
      await Promise.all([fetchMeta(), fetchRoutines()])
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load routines')
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
      subjectId: row.subject?._id || row.subject || '',
      teacherId: row.teacher?._id || row.teacher || '',
      day: row.day || 'Monday',
      startTime: row.startTime || '',
      endTime: row.endTime || '',
      room: row.room || '',
    })
    setFormError(null)
    setIsOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      const payload = {
        classId: form.classId,
        subjectId: form.subjectId,
        teacherId: form.teacherId,
        day: form.day,
        startTime: form.startTime,
        endTime: form.endTime,
        room: form.room,
      }
      if (form.id) {
        await apiClient.put(`/admin/routines/${form.id}`, payload)
      } else {
        await apiClient.post('/admin/routines', payload)
      }
      setIsOpen(false)
      setForm({ id: '', classId: '', subjectId: '', teacherId: '', day: 'Monday', startTime: '', endTime: '', room: '' })
      await fetchRoutines()
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to save routine')
    } finally {
      setSaving(false)
    }
  }

  const handleDisable = async (id) => {
    if (!id) return
    try {
      await apiClient.patch(`/admin/routines/${id}/disable`)
      fetchRoutines()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to disable routine')
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
            <h2 className="text-lg font-semibold text-slate-900">Class Routine</h2>
            <p className="mt-1 text-sm text-slate-500">Maintain weekly schedules and publish to all roles.</p>
          </div>
          <button
            onClick={() => {
              setForm({ id: '', classId: '', subjectId: '', teacherId: '', day: 'Monday', startTime: '', endTime: '', room: '' })
              setFormError(null)
              setIsOpen(true)
            }}
            className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700"
          >
            Publish Routine
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      <DataTable columns={columns} rows={rows} />

      <Modal title={form.id ? 'Edit Routine Slot' : 'Publish Routine'} isOpen={isOpen} onClose={() => setIsOpen(false)}>
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
            <select
              required
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
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Teacher</label>
            <select
              required
              value={form.teacherId}
              onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Select teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>{teacher.fullName}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Day</label>
              <select
                value={form.day}
                onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                {DAYS.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Start Time</label>
              <input
                type="time"
                required
                value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-500">End Time</label>
              <input
                type="time"
                required
                value={form.endTime}
                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Room</label>
            <input
              value={form.room}
              onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))}
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

export default AdminRoutine
