import React from 'react'

const testimonials = [
  {
    quote:
      'IQRA helped my daughter regain confidence in math. The structured plan and weekly feedback made the difference.',
    name: 'Razia Akter',
    role: 'Parent of Grade 9 student',
  },
  {
    quote:
      'The teachers explain concepts with clarity and patience. I now feel prepared for board exams without panic.',
    name: 'Shuvo Ahmed',
    role: 'Grade 10 student',
  },
  {
    quote:
      'The mentors track progress consistently and share updates. We feel involved and reassured throughout the term.',
    name: 'Mahmuda Begum',
    role: 'Parent of Grade 7 student',
  },
]

const Testimonial = () => {
  return (
    <section id="testimonials" className="py-16 lg:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Testimonials</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">
            Families trust IQRA for steady progress and care.
          </h2>
        </div>
        <p className="max-w-xl text-sm text-slate-500">
          Real experiences from students and parents who grew with IQRA.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {testimonials.map((item) => (
          <div key={item.name} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Testimonial</p>
            <p className="mt-4 text-base leading-relaxed text-slate-700">"{item.quote}"</p>
            <div className="mt-6 border-t border-gray-100 pt-4">
              <p className="text-sm font-semibold text-slate-900">{item.name}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Testimonial
