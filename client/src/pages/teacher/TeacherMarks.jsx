import React, { useEffect, useMemo, useState } from 'react'
import Table from '../../components/Table.jsx'
import Modal from '../../components/Modal.jsx'
import FormCard from '../../components/FormCard.jsx'
import apiClient from '../../api/client.js'

const TeacherMarks = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [rows, setRows] = useState([])
  const [students, setStudents] = useState([])
  const [exams, setExams] = useState([])
  const [subjects, setSubjects] = useState([])
  const [filters, setFilters] = useState({ examId: '', subjectId: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [formError, setFormError] = useState(null)
  const [form, setForm] = useState({
    id: '',
    studentId: '',
    examId: '',
    subjectId: '',
    marks: '',
    grade: '',
  })

  const columns = [
    { key: 'student', label: 'Student' },
    { key: 'exam', label: 'Exam' },
    { key: 'subject', label: 'Subject' },
    { key: 'marks', label: 'Marks' },
    { key: 'grade', label: 'Grade' },
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

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (filters.examId && row.examId !== filters.examId) return false
      if (filters.subjectId && row.subjectId !== filters.subjectId) return false
      return true
    })
  }, [rows, filters])

  const fetchData = async () => {
    const [studentsRes, examsRes, subjectsRes, resultsRes] = await Promise.all([
      apiClient.get('/teacher/students?limit=200'),
      apiClient.get('/teacher/exams?limit=200'),
      apiClient.get('/teacher/subjects'),
      apiClient.get('/teacher/results?limit=200'),
    ])

    const studentsData = studentsRes.data?.data ?? studentsRes.data
    const examsData = examsRes.data?.data ?? examsRes.data
    const subjectsData = subjectsRes.data?.data ?? subjectsRes.data
    const resultsData = resultsRes.data?.data ?? resultsRes.data

    setStudents(Array.isArray(studentsData?.items) ? studentsData.items : [])
    setExams(Array.isArray(examsData?.items) ? examsData.items : [])
    setSubjects(Array.isArray(subjectsData) ? subjectsData : [])

    const resultItems = Array.isArray(resultsData?.items) ? resultsData.items : []
    setRows(
      resultItems.map((r) => ({
        ...r,
        _id: r._id,
        student: r.student?.fullName || '-',
        studentId: r.student?._id || r.student,
        exam: r.exam?.examName || '-',
        subject: r.subject?.subjectName || '-',
        marks: typeof r.marks === 'number' ? String(r.marks) : '-',
        grade: r.grade || '-',
        status: r.isActive === false ? 'Disabled' : 'Active',
        examId: r.exam?._id || r.exam,
        subjectId: r.subject?._id || r.subject,
      })),
    )
  }

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        setError(null)
        await fetchData()
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message || 'Failed to load marks')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  const handleEdit = (row) => {
    setForm({
      id: row._id,
      studentId: row.student?._id || row.studentId || '',
      examId: row.examId || '',
      subjectId: row.subjectId || '',
      marks: row.marks && row.marks !== '-' ? row.marks : '',
      grade: row.grade && row.grade !== '-' ? row.grade : '',
    })
    setFormError(null)
    setIsOpen(true)
  }

  const handleDisable = async (id) => {
    if (!id) return
    try {
      await apiClient.patch(`/teacher/results/${id}/disable`)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to disable marks')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      const payload = {
        studentId: form.studentId,
        examId: form.examId,
        subjectId: form.subjectId,
        marks: Number(form.marks),
        grade: form.grade,
      }
      if (form.id) {
        await apiClient.put(`/teacher/results/${form.id}`, payload)
      } else {
        await apiClient.post('/teacher/results', payload)
      }
      setIsOpen(false)
      setForm({ id: '', studentId: '', examId: '', subjectId: '', marks: '', grade: '' })
      fetchData()
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to save marks')
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
        title="Manage Exam Marks"
        description="Create, update, and review student marks."
        actions={
          <button
            onClick={() => {
              setForm({ id: '', studentId: '', examId: '', subjectId: '', marks: '', grade: '' })
              setFormError(null)
              setIsOpen(true)
            }}
            className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700"
          >
            Add Marks
          </button>
        }
      >
        <div className="grid gap-3 md:grid-cols-3">
          <select
            value={filters.examId}
            onChange={(e) => setFilters((f) => ({ ...f, examId: e.target.value }))}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All Exams</option>
            {exams.map((exam) => (
              <option key={exam._id} value={exam._id}>{exam.examName}</option>
            ))}
          </select>
          <select
            value={filters.subjectId}
            onChange={(e) => setFilters((f) => ({ ...f, subjectId: e.target.value }))}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>{subject.subjectName}</option>
            ))}
          </select>
        </div>
      </FormCard>

      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      <Table columns={columns} rows={filteredRows} />

      <Modal title={form.id ? 'Edit Marks' : 'Add Marks'} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{formError}</p>
          )}
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Student</label>
            <select
              required
              value={form.studentId}
              onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>{student.fullName}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Exam</label>
              <select
                required
                value={form.examId}
                onChange={(e) => setForm((f) => ({ ...f, examId: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select exam</option>
                {exams.map((exam) => (
                  <option key={exam._id} value={exam._id}>{exam.examName}</option>
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
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Marks</label>
            <input
              required
              type="number"
              min="0"
              value={form.marks}
              onChange={(e) => setForm((f) => ({ ...f, marks: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Grade</label>
            <input
              type="text"
              value={form.grade}
              onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}
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

export default TeacherMarks
