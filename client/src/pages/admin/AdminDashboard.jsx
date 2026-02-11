import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StatCard from '../../components/StatCard.jsx'
import DataTable from '../../components/DataTable.jsx'
import InfoCard from '../../components/InfoCard.jsx'
import EventNotices from '../../components/EventNotices.jsx'
import apiClient from '../../api/client.js'

const AdminDashboard = () => {
  const [stats, setStats] = useState([
    { label: 'Active Students', value: '-', helper: 'Updated daily' },
    { label: 'Active Teachers', value: '-', helper: 'On duty this term' },
    { label: 'Classes', value: '-', helper: 'Total classes' },
    { label: 'Payments', value: '-', helper: 'Recorded invoices' },
  ])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [meta, setMeta] = useState({
    activeStudents: '-',
    activeTeachers: '-',
    activeParents: '-',
  })
  const [settings, setSettings] = useState({
    schoolName: '',
    schoolMotto: '',
    academicYear: '',
    contactEmail: '',
    contactPhone: '',
  })

  const columns = [
    { key: 'task', label: 'Upcoming Event' },
    { key: 'owner', label: 'Coordinator' },
    { key: 'due', label: 'Date' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-semibold text-slate-600">
          {row.status}
        </span>
      ),
    },
  ]

  useEffect(() => {
    let cancelled = false
    const fetchStats = async () => {
      try {
        setError(null)
        const [statsRes, eventsRes, settingsRes] = await Promise.all([
          apiClient.get('/admin/dashboard/stats'),
          apiClient.get('/admin/events?limit=5'),
          apiClient.get('/admin/settings'),
        ])
        const d = statsRes.data?.data ?? statsRes.data
        const eventsPayload = eventsRes.data?.data ?? eventsRes.data
        const eventItems = Array.isArray(eventsPayload?.items) ? eventsPayload.items : []
        const settingsPayload = settingsRes.data?.data ?? settingsRes.data
        const now = new Date()
        if (cancelled) return
        setStats([
          { label: 'Active Students', value: String(d.activeStudents ?? '-'), helper: 'Updated daily' },
          { label: 'Active Teachers', value: String(d.activeTeachers ?? '-'), helper: 'On duty this term' },
          { label: 'Classes', value: String(d.totalClasses ?? '-'), helper: 'Total classes' },
          { label: 'Payments', value: String(d.totalPayments ?? '-'), helper: 'Recorded invoices' },
        ])
        setMeta({
          activeStudents: d.activeStudents ?? '-',
          activeTeachers: d.activeTeachers ?? '-',
          activeParents: d.activeParents ?? '-',
        })
        setSettings({
          schoolName: settingsPayload?.schoolName || '',
          schoolMotto: settingsPayload?.schoolMotto || '',
          academicYear: settingsPayload?.academicYear || '',
          contactEmail: settingsPayload?.contactEmail || '',
          contactPhone: settingsPayload?.contactPhone || '',
        })
        setRows(
          eventItems.map((event) => {
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
            const dateLabel = startDate && endDate
              ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
              : (startDate ? startDate.toLocaleDateString() : '-')
            return {
              task: event.title || 'Untitled event',
              owner: event.createdBy?.fullName || event.createdBy?.email || 'System',
              due: dateLabel,
              status,
            }
          }),
        )
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message || 'Failed to load stats')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchStats()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="space-y-8">
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}
      {loading && (
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr,0.6fr]">
        <DataTable columns={columns} rows={rows} />
        <div className="space-y-4">
          <InfoCard
            title="Communication & Notifications"
            description="Coordinate messaging preferences, broadcast notices, and academic reminders."
            action={
              <Link
                to="/admin/settings"
                className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700"
              >
                Configure
              </Link>
            }
          />
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Active Users Summary</h3>
            <div className="mt-4 grid gap-2 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Students</span>
                <span className="font-semibold text-slate-900">{meta.activeStudents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Teachers</span>
                <span className="font-semibold text-slate-900">{meta.activeTeachers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Parents</span>
                <span className="font-semibold text-slate-900">{meta.activeParents}</span>
              </div>
            </div>
            <div className="mt-4">
              <Link
                to="/admin/users"
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:bg-gray-50"
              >
                View Users
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">School Profile</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">School Name</span>
                <span className="font-semibold text-slate-900">{settings.schoolName || '-'}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Academic Year</span>
                <span className="font-semibold text-slate-900">{settings.academicYear || '-'}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">School Motto</span>
                <span className="font-semibold text-slate-900">{settings.schoolMotto || '-'}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Contact Email</span>
                <span className="font-semibold text-slate-900">{settings.contactEmail || '-'}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Contact Phone</span>
                <span className="font-semibold text-slate-900">{settings.contactPhone || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EventNotices />
    </div>
  )
}

export default AdminDashboard
