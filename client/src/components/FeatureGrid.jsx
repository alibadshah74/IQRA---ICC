import React from 'react'

const FeatureGrid = ({ features }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {features.map((feature) => {
        const Icon = feature.icon
        return (
          <article
            key={feature.title}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 text-slate-700">
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{feature.description}</p>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default FeatureGrid
