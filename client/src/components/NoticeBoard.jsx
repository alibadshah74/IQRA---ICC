import React, { useEffect, useState } from 'react'
import apiClient from '../api/client.js'

const NoticeBoard = ({ limit = 4 }) => {
  const [notices, setNotices] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const { data } = await apiClient.get(`/notices?limit=${limit}`)
        const payload = data?.data ?? data
        const items = Array.isArray(payload?.items) ? payload.items : []
        if (!cancelled) setNotices(items)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message || 'Failed to load notices')
      }
    }
    run()
    return () => { cancelled = true }
  }, [limit])

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-slate-900">Notice Board</h2>
        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Latest</span>
      </div>
      {error ? (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      ) : (
        <div className="mt-4 space-y-3">
          {!notices.length && (
            <p className="text-sm text-slate-500">No notices published yet.</p>
          )}
          {notices.map((notice) => (
            <div key={notice._id || notice.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{notice.title}</p>
                <p className="text-xs text-slate-500">
                  {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : 'Date TBA'}
                </p>
              </div>
              <a
                href={notice.fileUrl}
                download={notice.fileName || 'iqra-notice'}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NoticeBoard
