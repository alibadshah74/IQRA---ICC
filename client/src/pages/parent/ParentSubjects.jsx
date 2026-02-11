import React, { useEffect, useState } from 'react'
import Table from '../../components/Table.jsx'
import apiClient from '../../api/client.js'

const ParentSubjects = () => {
  const [children, setChildren] = useState([])
  const [childId, setChildId] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const columns = [
    { key: 'child', label: 'Child' },
    { key: 'className', label: 'Class' },
    { key: 'subject', label: 'Subject' },
    { key: 'teacher', label: 'Teacher' },
  ]

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        setError(null)
        const { data } = await apiClient.get('/parent/children')
        const res = data?.data ?? data
        const items = Array.isArray(res) ? res : (Array.isArray(res?.items) ? res.items : [])
        if (!cancelled) {
          setChildren(items)
          if (items.length && !childId) setChildId(items[0]._id ?? items[0].id ?? '')
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message || 'Failed to load children')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!childId) { setRows([]); return }
    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        const { data } = await apiClient.get(`/parent/children/${childId}/subjects`)
        const res = data?.data ?? data
        const subjects = Array.isArray(res?.subjects) ? res.subjects : []
        const classInfo = res?.classInfo
        const childName = children.find((c) => (c._id ?? c.id) === childId)?.fullName
          ?? children.find((c) => (c._id ?? c.id) === childId)?.name
          ?? '-'
        if (!cancelled) {
          setRows(
            subjects.map((subject) => ({
              child: childName,
              className: classInfo?.className ? `${classInfo.className}${classInfo.section ? ` - ${classInfo.section}` : ''}` : '-',
              subject: subject.subjectName || '-',
              teacher: subject.teacher?.fullName || '-',
            })),
          )
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message || 'Failed to load subjects')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [childId, children])

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Classes & Subjects</h2>
        <p className="mt-1 text-sm text-slate-500">Subjects assigned to each child.</p>
        {children.length > 0 && (
          <select
            value={childId}
            onChange={(e) => setChildId(e.target.value)}
            className="mt-3 rounded-xl border border-gray-300 px-4 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {children.map((c) => (
              <option key={c._id ?? c.id} value={c._id ?? c.id}>{c.fullName ?? c.name ?? c.email ?? '-'}</option>
            ))}
          </select>
        )}
      </div>

      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      <Table columns={columns} rows={rows} />
    </div>
  )
}

export default ParentSubjects
