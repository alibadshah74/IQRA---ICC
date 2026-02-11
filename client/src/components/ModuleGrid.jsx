import React from 'react'

const ModuleGrid = ({ modules }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {modules.map((module) => {
        const Icon = module.icon
        return (
          <article
            key={module.title}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 text-slate-700">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-slate-900">{module.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{module.description}</p>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default ModuleGrid
