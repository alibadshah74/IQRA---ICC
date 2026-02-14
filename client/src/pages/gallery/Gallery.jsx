import React, { useEffect, useRef, useState } from 'react'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import apiClient from '../../api/client.js'

const PAGE_SIZE = 20

const Gallery = () => {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const sentinelRef = useRef(null)

  const fetchPage = async (nextPage) => {
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await apiClient.get(`/gallery?page=${nextPage}&limit=${PAGE_SIZE}`)
      const payload = data?.data ?? data
      const newItems = Array.isArray(payload?.items) ? payload.items : []
      const pages = payload?.pagination?.pages || 1

      setItems((prev) => (nextPage === 1 ? newItems : [...prev, ...newItems]))
      setPage(nextPage)
      setHasMore(nextPage < pages)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load gallery.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPage(1)
  }, [])

  useEffect(() => {
    if (!hasMore || loading) return
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchPage(page + 1)
        }
      },
      { rootMargin: '200px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loading, page])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 scroll-smooth">
      <div className="mx-auto max-w-6xl px-6">
        <Navbar />

        <section className="mt-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Gallery</p>
              <h1 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">
                Moments, achievements, and everyday learning.
              </h1>
            </div>
            <p className="max-w-xl text-sm text-slate-500">
              Browse photos and videos shared by the IQRA team. Download any media you need for study or
              community updates.
            </p>
          </div>

          {error && (
            <p className="mt-6 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
          )}

          <div className="mt-8 columns-2 gap-4 sm:columns-3 lg:columns-4">
            {items.map((item) => (
              <div key={item._id || item.id} className="mb-4 break-inside-avoid">
                <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  {item.mediaType === 'video' ? (
                    <video
                      controls
                      src={item.fileUrl}
                      className="w-full rounded-2xl"
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={item.fileUrl}
                      alt={item.fileName || 'Gallery media'}
                      className="w-full rounded-2xl object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                  <a
                    href={item.fileUrl}
                    download={item.fileName || 'iqra-media'}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-white"
                  >
                    Download
                  </a>
                  {(item.fileName || item.fileType) && (
                    <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-600">
                      {item.fileName || item.fileType}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {loading && (
            <p className="mt-6 text-sm text-slate-500">Loading gallery...</p>
          )}
          {!loading && !items.length && !error && (
            <p className="mt-6 text-sm text-slate-500">No media uploaded yet.</p>
          )}

          <div ref={sentinelRef} className="h-8" />
        </section>
      </div>
      <Footer />
    </div>
  )
}

export default Gallery
