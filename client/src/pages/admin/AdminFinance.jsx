import React, { useEffect, useState } from 'react'
import StatCard from '../../components/StatCard.jsx'
import DataTable from '../../components/DataTable.jsx'
import apiClient from '../../api/client.js'

const AdminFinance = () => {
  const [stats, setStats] = useState([
    { label: 'Total Records', value: '—' },
    { label: 'Paid', value: '—' },
    { label: 'Pending', value: '—' },
  ])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const columns = [
    { key: 'student', label: 'Student' },
    { key: 'amount', label: 'Amount' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status' },
  ]

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        setError(null)
        const { data } = await apiClient.get('/admin/payments')
        const res = data?.data ?? data
        const items = Array.isArray(res?.items) ? res.items : []
        if (cancelled) return
        setRows(items.map((r) => ({
          student: typeof r.student === 'object' ? r.student?.fullName ?? r.student?.email : r.student ?? '—',
          amount: r.amount ?? r.total ?? '—',
          date: r.paymentDate ? new Date(r.paymentDate).toLocaleDateString() : (r.date ? new Date(r.date).toLocaleDateString() : '—'),
          status: r.status ?? '—',
        })))
        const paid = items.filter((i) => i.status === 'paid' || i.status === 'completed').length
        const pending = items.filter((i) => i.status === 'pending' || i.status === 'unpaid').length
        setStats([
          { label: 'Total Records', value: String(items.length) },
          { label: 'Paid', value: String(paid) },
          { label: 'Pending', value: String(pending) },
        ])
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message || 'Failed to load payments')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="space-y-8">
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Finance Summary</h2>
          <p className="mt-1 text-sm text-slate-500">Track income, expenses, and outstanding invoices.</p>
        </div>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      <DataTable columns={columns} rows={rows} />
    </div>
  )
}

export default AdminFinance
