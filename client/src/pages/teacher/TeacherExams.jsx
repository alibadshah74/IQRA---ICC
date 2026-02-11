import React, { useEffect, useMemo, useState } from 'react'
import Table from '../../components/Table.jsx'
import Modal from '../../components/Modal.jsx'
import FormCard from '../../components/FormCard.jsx'
import apiClient from '../../api/client.js'

const TeacherExams = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [rows, setRows] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [formError, setFormError] = useState(null)
  const [form, setForm] = useState({
    id: '',
    examName: '',
    classId: '',
    subjectIds: [],
    examDate: '',
    totalMarks: '',
    gradeScale: '',
  })

  const columns = [
    { key: 'examName', label: 'Exam' },
    { key: 'className', label: 'Class' },
    { key: 'examDate', label: 'Date' },
    { key: 'totalMarks', label: 'Marks' },
    { key: 'gradeScale', label: 'Grade Scale' },
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

  const filteredSubjects = useMemo(() => {
    if (!form.classId) return subjects
    return subjects.filter((subject) => subject.class?._id === form.classId)
  }, [form.classId, subjects])

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

  const fetchExams = async () => {
    const { data } = await apiClient.get('/teacher/exams?limit=200')
    const res = data?.data ?? data
    const items = Array.isArray(res?.items) ? res.items : []
    setRows(
      items.map((exam) => ({
        ...exam,
        _id: exam._id,
        examName: exam.examName,
        className: exam.class?.className ? `${exam.class.className}${exam.class.section ? ` - ${exam.class.section}` : ''}` : '-',
        examDate: exam.examDate ? new Date(exam.examDate).toLocaleDateString() : '-',
        examDateValue: exam.examDate || '',
        totalMarks: typeof exam.totalMarks === 'number' ? String(exam.totalMarks) : '-',
        gradeScale: exam.gradeScale || '-',
        status: exam.isActive === false ? 'Disabled' : 'Active',
      })),
    )
  }

  const fetchAll = async () => {
    try {
      setLoading(true)
      setError(null)
      await Promise.all([fetchMeta(), fetchExams()])
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load exams')
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
      examName: row.examName || '',
      classId: row.class?._id || row.class || '',
      subjectIds: Array.isArray(row.subjects) ? row.subjects.map((s) => s._id || s) : [],
      examDate: row.examDateValue ? new Date(row.examDateValue).toISOString().slice(0, 10) : '',
      totalMarks: row.totalMarks && row.totalMarks !== '-' ? row.totalMarks : '',
      gradeScale: row.gradeScale && row.gradeScale !== '-' ? row.gradeScale : '',
    })
    setFormError(null)
    setIsOpen(true)
  }

  const handleDisable = async (id) => {
    if (!id) return
    try {
      await apiClient.patch(`/teacher/exams/${id}/disable`)
      fetchExams()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to disable exam')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      const payload = {
        examName: form.examName,
        classId: form.classId,
        subjectIds: form.subjectIds,
        examDate: form.examDate,
        totalMarks: form.totalMarks ? Number(form.totalMarks) : undefined,
        gradeScale: form.gradeScale,
      }
      if (form.id) {
        await apiClient.put(`/teacher/exams/${form.id}`, payload)
      } else {
        await apiClient.post('/teacher/exams', payload)
      }
      setIsOpen(false)
      setForm({ id: '', examName: '', classId: '', subjectIds: [], examDate: '', totalMarks: '', gradeScale: '' })
      fetchExams()
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to save exam')
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
        title="Manage Exams & Grades"
        description="Create exams and define grading structure."
        actions={
          <button
            onClick={() => {
              setForm({ id: '', examName: '', classId: '', subjectIds: [], examDate: '', totalMarks: '', gradeScale: '' })
              setFormError(null)
              setIsOpen(true)
            }}
            className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700"
          >
            Add Exam
          </button>
        }
      />

      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      <Table columns={columns} rows={rows} />

      <Modal title={form.id ? 'Edit Exam' : 'Add Exam'} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{formError}</p>
          )}
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Exam Name</label>
            <input
              required
              type="text"
              value={form.examName}
              onChange={(e) => setForm((f) => ({ ...f, examName: e.target.value }))}
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
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Subjects</label>
            <select
              multiple
              value={form.subjectIds}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  subjectIds: Array.from(e.target.selectedOptions).map((opt) => opt.value),
                }))
              }
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {filteredSubjects.map((subject) => (
                <option key={subject._id} value={subject._id}>{subject.subjectName}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Exam Date</label>
              <input
                type="date"
                value={form.examDate}
                onChange={(e) => setForm((f) => ({ ...f, examDate: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Total Marks</label>
              <input
                type="number"
                min="0"
                value={form.totalMarks}
                onChange={(e) => setForm((f) => ({ ...f, totalMarks: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Grade Scale</label>
            <input
              type="text"
              value={form.gradeScale}
              onChange={(e) => setForm((f) => ({ ...f, gradeScale: e.target.value }))}
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

export default TeacherExams
