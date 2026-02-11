import React from 'react'

const Modal = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed  inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

export default Modal
