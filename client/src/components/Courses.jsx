import React from 'react'

const courses = [
  {
    title: 'Math',
    level: 'Grades 9th',
    description: 'Core literacy, numeracy.',
  },
  {
    title: 'Physics',
    level: 'Grades 9th',
    description: 'Concept clarity in science, mathematics.',
  },
  {
    title: 'Geography',
    level: 'Grades 9th',
    description: 'Structured revision, problem-solving practice.',
  },
  {
    title: 'History',
    level: 'Grades 9th',
    description: 'Focused subject mastery aligned with board.',
  },
  {
    title: 'English',
    level: '9th',
    description: 'Reading, writing.',
  },
  {
    title: 'Life Science',
    level: '9th',
    description: 'Time management, goal setting.',
  },
]

const Courses = () => {
  return (
    <section id="courses" className="py-16 lg:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Courses</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">
            All Courses
          </h2>
        </div>
        <p className="max-w-xl text-sm text-slate-500">
          Each course blends structured teaching, practice sessions.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div key={course.title} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{course.level}</p>
            <h3 className="mt-3 text-xl font-semibold text-slate-900">{course.title}</h3>
            <p className="mt-3 text-sm text-slate-600">{course.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Courses
