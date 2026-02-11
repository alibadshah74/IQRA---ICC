import React from 'react'

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
  return (
    <section id="achievements" className="py-16 lg:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Achievements</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">
            Milestones that reflect real learning outcomes.
          </h2>
        </div>
        <p className="max-w-xl text-sm text-slate-500">
          Every milestone is anchored in student progress, consistent mentoring, and transparent tracking.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((item) => (
          <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Achievement
