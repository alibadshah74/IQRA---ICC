import React, { useEffect, useState } from 'react'
import apiClient from '../api/client.js'

const normalizeHex = (value) => {
  if (!value) return null
  const hex = value.trim()
  if (/^#([0-9a-fA-F]{3}){1,2}$/.test(hex)) {
    if (hex.length === 4) {
      return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    }
    return hex
  }
  return null
}

const formatRange = (startRaw, endRaw) => {
  const start = startRaw ? new Date(startRaw) : null
  const end = endRaw ? new Date(endRaw) : null
  if (start && end) {
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
  }
  if (start) return start.toLocaleDateString()
  return '-'
}

const EventNotices = () => {
  const [events, setEvents] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const { data } = await apiClient.get('/events/active?limit=5')
        const payload = data?.data ?? data
        const items = Array.isArray(payload?.items) ? payload.items : (Array.isArray(payload) ? payload : [])
        if (!cancelled) setEvents(items)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message || 'Failed to load notices')
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  if (!events.length && !error) {
    return null
  }

  return (
    <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-900">Notice Board</h3>
        <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Active events</span>
      </div>
      {error ? (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      ) : (
        <div className="mt-4 space-y-3">
          {events.map((event) => {
            const color = normalizeHex(event.colorTheme) || '#2563eb'
            const softColor = `${color}1A`
            return (
              <div
                key={event._id || event.id}
                className="rounded-xl border border-gray-200 px-4 py-3"
                style={{ borderLeftColor: color, borderLeftWidth: 4, backgroundColor: softColor }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                    <p className="text-xs text-slate-600">{formatRange(event.startDate, event.endDate)}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-600">{event.isActive === false ? 'Disabled' : 'Active'}</span>
                </div>
                {event.description && (
                  <p className="mt-2 text-sm text-slate-600">{event.description}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default EventNotices
