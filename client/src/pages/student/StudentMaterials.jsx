import React, { useEffect, useState } from 'react'
import Table from '../../components/Table.jsx'
import apiClient from '../../api/client.js'

const StudentMaterials = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const columns = [
    { key: 'title', label: 'Material' },
    { key: 'subject', label: 'Subject' },
    { key: 'uploaded', label: 'Uploaded' },
    {
      key: 'action',
      label: 'Action',
      render: (row) => (
        <a
          href={row.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700"
        >
          Download
        </a>
      ),
    },
  ]

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        setError(null)
        const { data } = await apiClient.get('/student/materials')
        const res = data?.data ?? data
        const items = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : [])
        if (!cancelled) {
          setRows(
            items.map((m) => ({
              title: m.title,
              subject: m.subject?.subjectName || '-',
              uploaded: m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '-',
              fileUrl: m.fileUrl,
            })),
          )
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message || 'Failed to load materials')
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
        <h2 className="text-lg font-semibold text-slate-900">Study Materials</h2>
        <p className="mt-1 text-sm text-slate-500">Download notes and files shared by your teachers.</p>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      <Table columns={columns} rows={rows} />
    </div>
  )
}

export default StudentMaterials
