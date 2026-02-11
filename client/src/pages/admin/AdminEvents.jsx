import React, { useEffect, useState } from 'react'
import DataTable from '../../components/DataTable.jsx'
import Modal from '../../components/Modal.jsx'
import apiClient from '../../api/client.js'

const DEFAULT_COLOR = '#2563eb'

const AdminEvents = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)
  const [form, setForm] = useState({
    id: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    colorTheme: DEFAULT_COLOR,
    isActive: true,
  })

  const columns = [
    { key: 'title', label: 'Event' },
    { key: 'dateRange', label: 'Date Range' },
    {
      key: 'theme',
      label: 'Theme',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full border border-gray-200"
            style={{ backgroundColor: row.colorTheme || DEFAULT_COLOR }}
          />
          <span className="text-xs font-semibold text-slate-600">{row.colorTheme || DEFAULT_COLOR}</span>
        </div>
      ),
    },
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

  const fetchEvents = async () => {
    const { data } = await apiClient.get('/admin/events?limit=200')
    const res = data?.data ?? data
    const items = Array.isArray(res?.items) ? res.items : []
    const now = new Date()
    setRows(
      items.map((event) => {
        const startRaw = event.startDate || event.eventDate
        const endRaw = event.endDate || event.eventDate
        const startDate = startRaw ? new Date(startRaw) : null
        const endDate = endRaw ? new Date(endRaw) : null
        let status = 'TBD'
        if (event.isActive === false) {
          status = 'Disabled'
        } else if (endDate) {
          status = endDate >= now ? 'Active' : 'Ended'
        }
        const dateRange = startDate && endDate
          ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
          : (startDate ? startDate.toLocaleDateString() : '-')
        return {
          ...event,
          _id: event._id,
          title: event.title || '-',
          dateRange,
          colorTheme: event.colorTheme || DEFAULT_COLOR,
          status,
        }
      }),
    )
  }

  const fetchAll = async () => {
    try {
      setLoading(true)
      setError(null)
      await fetchEvents()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const handleEdit = (row) => {
    const startRaw = row.startDate || row.eventDate
    const endRaw = row.endDate || row.eventDate
    setForm({
      id: row._id,
      title: row.title || '',
      description: row.description || '',
      startDate: startRaw ? new Date(startRaw).toISOString().slice(0, 10) : '',
      endDate: endRaw ? new Date(endRaw).toISOString().slice(0, 10) : '',
      colorTheme: row.colorTheme || DEFAULT_COLOR,
      isActive: row.isActive !== false,
    })
    setFormError(null)
    setIsOpen(true)
  }

  const handleDisable = async (id) => {
    if (!id) return
    try {
      await apiClient.patch(`/admin/events/${id}/disable`)
      fetchEvents()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to disable event')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      const start = new Date(form.startDate)
      const end = new Date(form.endDate)
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        setFormError('Please provide valid start and end dates.')
        setSaving(false)
        return
      }
      if (end < start) {
        setFormError('End date must be on or after the start date.')
        setSaving(false)
        return
      }
      const payload = {
        title: form.title,
        description: form.description,
        startDate: form.startDate,
        endDate: form.endDate,
        colorTheme: form.colorTheme,
        isActive: form.isActive,
      }
      if (form.id) {
        await apiClient.put(`/admin/events/${form.id}`, payload)
      } else {
        await apiClient.post('/admin/events', payload)
      }
      setIsOpen(false)
      setForm({
        id: '',
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        colorTheme: DEFAULT_COLOR,
        isActive: true,
      })
      fetchEvents()
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to save event')
    } finally {
      setSaving(false)
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
            <h2 className="text-lg font-semibold text-slate-900">Events</h2>
            <p className="mt-1 text-sm text-slate-500">Create announcements for school-wide visibility.</p>
          </div>
          <button
            onClick={() => {
              setForm({
                id: '',
                title: '',
                description: '',
                startDate: '',
                endDate: '',
                colorTheme: DEFAULT_COLOR,
                isActive: true,
              })
              setFormError(null)
              setIsOpen(true)
            }}
            className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700"
          >
            Create Event
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      <DataTable columns={columns} rows={rows} />

      <Modal title={form.id ? 'Edit Event' : 'Create Event'} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4 ">
          {formError && (
            <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{formError}</p>
          )}
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Description</label>
            <textarea
              rows="4"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Start Date</label>
              <input
                required
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-500">End Date</label>
              <input
                required
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-[0.4fr,1fr]">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Color Theme</label>
              <input
                type="color"
                value={form.colorTheme}
                onChange={(e) => setForm((f) => ({ ...f, colorTheme: e.target.value }))}
                className="mt-2 h-12 w-full rounded-xl border border-gray-300 bg-white p-2"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Theme Hex</label>
              <input
                value={form.colorTheme}
                onChange={(e) => setForm((f) => ({ ...f, colorTheme: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              id="event-active"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="event-active" className="text-sm text-slate-700">Active</label>
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
              {saving ? 'Saving...' : 'Save Event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AdminEvents
