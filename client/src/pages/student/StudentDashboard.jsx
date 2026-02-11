import React, { useEffect, useState } from 'react'
import {
  CalendarClock,
  FileText,
  CreditCard,
  Layers,
} from 'lucide-react'
import DashboardCard from '../../components/DashboardCard.jsx'
import EventNotices from '../../components/EventNotices.jsx'
import apiClient from '../../api/client.js'

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const { data } = await apiClient.get('/student/dashboard')
        if (!cancelled) setDashboardData(data?.data ?? data)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message || 'Failed to load dashboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  const cards = [
    { title: 'Class Routine', icon: CalendarClock, to: '/student/routine' },
    { title: 'Exam Marks', icon: FileText, to: '/student/marks' },
    { title: 'Study Materials / Files', icon: FileText, to: '/student/materials' },
    { title: 'Payment Invoices', icon: CreditCard, to: '/student/payments' },
    { title: 'Classes & Subjects', icon: Layers, to: '/student/subjects' },
  ]

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}
      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Student Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">View your academic updates and resources.</p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((card) => (
          <DashboardCard key={card.title} {...card} />
        ))}
      </div>

      <EventNotices />
    </div>
  )
}

export default StudentDashboard
