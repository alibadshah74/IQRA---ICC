import React from 'react'

const PanelTabs = ({ panels, activeId, onChange }) => {
  return (
    <div className="flex flex-wrap gap-3">
      {panels.map((panel) => {
        const isActive = panel.id === activeId
        return (
          <button
            key={panel.id}
            onClick={() => onChange(panel.id)}
            className={`rounded-xl border px-5 py-2 text-sm font-semibold transition ${
              isActive
                ? 'border-transparent bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                : 'border-gray-200 bg-white text-slate-700 hover:bg-gray-50'
            }`}
          >
            {panel.name}
          </button>
        )
      })}
    </div>
  )
}

export default PanelTabs
