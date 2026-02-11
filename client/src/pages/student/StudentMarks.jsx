import React, { useEffect, useState } from 'react'
import Table from '../../components/Table.jsx'
import apiClient from '../../api/client.js'

const StudentMarks = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const columns = [
    { key: 'subject', label: 'Subject' },
    { key: 'exam', label: 'Exam' },
    { key: 'marks', label: 'Marks' },
    { key: 'grade', label: 'Grade' },
  ]

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        setError(null)
        const { data } = await apiClient.get('/student/results')
        const res = data?.data ?? data
        const items = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : [])
        if (!cancelled) setRows(items.map((r) => ({
          subject: typeof r.subject === 'object' ? r.subject?.subjectName ?? r.subject?.name : r.subject ?? '—',
          exam: typeof r.exam === 'object' ? r.exam?.examName ?? r.exam?.name : r.exam ?? '—',
          marks: r.marks ?? '—',
          grade: r.grade ?? '—',
        })))
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message || 'Failed to load results')
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
        <h2 className="text-lg font-semibold text-slate-900">Exam Marks</h2>
        <p className="mt-1 text-sm text-slate-500">Verified results released by your teachers.</p>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      <Table columns={columns} rows={rows} />
    </div>
  )
}

export default StudentMarks
