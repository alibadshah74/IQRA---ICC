import React, { useEffect, useState } from 'react'
import Table from '../../components/Table.jsx'
import apiClient from '../../api/client.js'

const StudentRoutine = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const columns = [
    { key: 'day', label: 'Day' },
    { key: 'time', label: 'Time' },
    { key: 'subject', label: 'Subject' },
    { key: 'teacher', label: 'Teacher' },
    { key: 'room', label: 'Room' },
  ]

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        setError(null)
        const { data } = await apiClient.get('/student/routine')
        const res = data?.data ?? data
        const items = Array.isArray(res) ? res : (Array.isArray(res?.items) ? res.items : [])
        if (!cancelled) {
          setRows(
            items.map((r) => ({
              day: r.day || '-',
              time: `${r.startTime || '-'} - ${r.endTime || '-'}`,
              subject: r.subject?.subjectName || '-',
              teacher: r.teacher?.fullName || '-',
              room: r.room || '-',
            })),
          )
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message || 'Failed to load routine')
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
        <h2 className="text-lg font-semibold text-slate-900">Class Routine</h2>
        <p className="mt-1 text-sm text-slate-500">Your weekly timetable.</p>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      <Table columns={columns} rows={rows} />
    </div>
  )
}

export default StudentRoutine
