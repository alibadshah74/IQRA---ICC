import React, { useEffect, useState } from 'react'
import teacherImage from '../assets/iqrabg.avif'

const teachers = [
  {
    name: 'Ayesha Rahman',
    qualification: 'MSc Mathematics',
    description: 'Specializes in problem-solving strategies and board exam readiness.',
    image: teacherImage,
  },
  {
    name: 'Nusrat Jahan',
    qualification: 'MA English',
    description: 'Focuses on reading fluency, writing structure, and confidence building.',
    image: teacherImage,
  },
  {
    name: 'Tariq Mahmud',
    qualification: 'MSc Physics',
    description: 'Known for concept clarity sessions and hands-on scientific thinking.',
    image: teacherImage,
  },
  {
    name: 'Sadia Hasan',
    qualification: 'MBA Accounting',
    description: 'Guides commerce students through fundamentals and exam techniques.',
    image: teacherImage,
  },
  {
    name: 'Imran Hossain',
    qualification: 'MSc Chemistry',
    description: 'Builds strong foundations with structured theory and practice reviews.',
    image: teacherImage,
  },
  {
    name: 'Nabila Khan',
    qualification: 'BEd, Social Science',
    description: 'Supports learners with interactive lessons and consistent assessments.',
    image: teacherImage,
  },
  {
    name: 'Farhan Ahmed',
    qualification: 'MSc Biology',
    description: 'Helps students master core concepts with clean, exam-ready notes.',
    image: teacherImage,
  },
  {
    name: 'Sabina Chowdhury',
    qualification: 'MA History',
    description: 'Brings context and storytelling to help students retain key topics.',
    image: teacherImage,
  },
]

const Teachers = () => {
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    if (showAll) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showAll])

  const visibleTeachers = showAll ? teachers : teachers.slice(0, 6)

  const grid = (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {visibleTeachers.map((teacher) => (
        <div key={teacher.name} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="h-44 w-full overflow-hidden">
            <img src={teacher.image} alt={teacher.name} className="h-full w-full object-cover" loading="lazy" />
          </div>
          <div className="p-5">
            <h3 className="text-lg font-semibold text-slate-900">{teacher.name}</h3>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{teacher.qualification}</p>
            <p className="mt-3 text-sm text-slate-600">{teacher.description}</p>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <section id="teachers" className="py-16 lg:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Teachers</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">
            Experienced mentors who guide every learner with care.
          </h2>
        </div>
        <p className="max-w-xl text-sm text-slate-500">
          Each faculty member is selected for subject mastery, classroom clarity, and student-first
          coaching.
        </p>
      </div>

      <div className="mt-10">{grid}</div>

      {teachers.length > 6 && !showAll && (
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700"
          >
            Show All Teachers
          </button>
        </div>
      )}

      {showAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10">
          <button
            type="button"
            aria-label="Close teacher list"
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
            onClick={() => setShowAll(false)}
          />
          <div className="relative z-10 max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">All Teachers</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">Full Faculty List</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAll(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {teachers.map((teacher) => (
                <div key={`${teacher.name}-full`} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div className="h-44 w-full overflow-hidden">
                    <img src={teacher.image} alt={teacher.name} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-5">
                    <h4 className="text-lg font-semibold text-slate-900">{teacher.name}</h4>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{teacher.qualification}</p>
                    <p className="mt-3 text-sm text-slate-600">{teacher.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Teachers
