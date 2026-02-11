import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-semibold">Page Not Found</h1>
        <p className="mt-3 text-sm text-slate-500">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-6 rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-gray-50"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound
