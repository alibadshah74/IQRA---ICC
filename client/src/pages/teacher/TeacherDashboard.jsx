import React, { useEffect, useState } from 'react'
import {
  Users,
  ClipboardCheck,
  FileText,
  CalendarClock,
  Layers,
} from 'lucide-react'
import DashboardCard from '../../components/DashboardCard.jsx'
import EventNotices from '../../components/EventNotices.jsx'
import apiClient from '../../api/client.js'

const TeacherDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const { data } = await apiClient.get('/teacher/dashboard')
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
    { title: 'Manage Students', icon: Users, to: '/teacher/students' },
    { title: 'Manage Exam Marks', icon: ClipboardCheck, to: '/teacher/marks' },
    { title: 'Upload Study Materials', icon: FileText, to: '/teacher/materials' },
    { title: 'Manage Classes & Subjects', icon: Layers, to: '/teacher/subjects' },
    { title: 'Manage Class Routine', icon: CalendarClock, to: '/teacher/routine' },
    { title: 'Manage Exams & Grades', icon: ClipboardCheck, to: '/teacher/exams' },
  ]

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}
      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Teacher Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">Manage classes, assessments, and learning materials.</p>
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

export default TeacherDashboard
