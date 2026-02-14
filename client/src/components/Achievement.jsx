import React, { useEffect, useState } from 'react'

const achievements = [
  {
    title: 'Consistent Exam Results',
    description: 'Students show steady improvement through structured revision plans.',
  },
  {
    title: 'Mentorship First',
    description: 'Dedicated mentors track progress and support every learning goal.',
  },
  {
    title: 'Community Trust',
    description: 'Families continue to recommend IQRA for reliable academic coaching.',
  },
  {
    title: 'Resource Rich Classes',
    description: 'Lecture notes, practice sets, and feedback loops built into every course.',
  },
  {
    title: 'Skill-Based Growth',
    description: 'Focus on communication, confidence, and long-term learning habits.',
  },
]

const Achievement = () => {
  const [showAll, setShowAll] = useState(false)
  const [isSmall, setIsSmall] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    const handle = () => setIsSmall(!media.matches)
    handle()
    media.addEventListener('change', handle)
    return () => media.removeEventListener('change', handle)
  }, [])

  const shouldLimit = isSmall && !showAll
  const visibleAchievements = shouldLimit ? achievements.slice(0, 4) : achievements
  const showToggle = isSmall && achievements.length > 4

  return (
    <section id="achievements" className="py-16 lg:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Achievements</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">
            Milestones.
          </h2>
        </div>
        <p className="max-w-xl text-sm text-slate-500">
          Every milestone is anchored in student progress.
        </p>
      </div>

      <div className={`mt-10 ${isSmall && showAll ? 'max-h-90 overflow-y-auto pr-1' : ''}`}>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {visibleAchievements.map((item) => (
            <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {showToggle && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:bg-gray-50"
          >
            {showAll ? 'Collapse' : 'View All'}
          </button>
        </div>
      )}
    </section>
  )
}

export default Achievement
