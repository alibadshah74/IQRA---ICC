import React, { useEffect, useState } from 'react'
import Table from '../../components/Table.jsx'
import apiClient from '../../api/client.js'

const StudentPayments = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const columns = [
    { key: 'invoice', label: 'Invoice' },
    { key: 'amount', label: 'Amount' },
    { key: 'due', label: 'Due Date' },
    { key: 'status', label: 'Status' },
    {
      key: 'action',
      label: 'Action',
      render: (row) =>
        row.status === 'Pending' || row.status === 'pending' ? (
          <button type="button" className="rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700">
            Pay Online
          </button>
        ) : (
          <span className="text-xs font-semibold text-slate-500">Paid</span>
        ),
    },
  ]

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        setError(null)
        const { data } = await apiClient.get('/student/payments')
        const res = data?.data ?? data
        const items = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : [])
        if (!cancelled) setRows(items.map((r) => ({
          invoice: r.invoice ?? r.id ?? '—',
          amount: r.amount ?? r.total ?? '—',
          due: r.dueDate ? new Date(r.dueDate).toLocaleDateString() : (r.paymentDate ? new Date(r.paymentDate).toLocaleDateString() : '—'),
          status: r.status ?? '—',
        })))
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
    <div className="space-y-6">
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Payment Invoices</h2>
        <p className="mt-1 text-sm text-slate-500">View invoices and make payments (UI only).</p>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      <Table columns={columns} rows={rows} />
    </div>
  )
}

export default StudentPayments
