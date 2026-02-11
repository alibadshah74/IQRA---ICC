import React, { useEffect, useState } from 'react'
import Table from '../../components/Table.jsx'
import apiClient from '../../api/client.js'

const StudentSubjects = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const columns = [
    { key: 'class', label: 'Class' },
    { key: 'subject', label: 'Subject' },
    { key: 'teacher', label: 'Teacher' },
  ]

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        setError(null)
        const { data } = await apiClient.get('/student/subjects')
        const res = data?.data ?? data
        const items = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : [])
        if (!cancelled) setRows(items.map((r) => ({
          class: typeof r.class === 'object' ? r.class?.className ?? r.class?.name : r.class ?? '—',
          subject: typeof r.subject === 'object' ? r.subject?.subjectName ?? r.subject?.name : r.subject ?? '—',
          teacher: typeof r.teacher === 'object' ? r.teacher?.fullName ?? r.teacher?.name : r.teacher ?? '—',
        })))
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message || 'Failed to load subjects')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Classes & Subjects</h2>
        <p className="mt-1 text-sm text-slate-500">Your class and subject assignments.</p>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      <Table columns={columns} rows={rows} />
    </div>
  )
}

export default StudentSubjects
