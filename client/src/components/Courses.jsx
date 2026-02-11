import React from 'react'

const courses = [
  {
    title: 'Foundation Program',
    level: 'Grades 3-5',
    description: 'Core literacy, numeracy, and study habits that set strong academic roots.',
  },
  {
    title: 'Middle School Excellence',
    level: 'Grades 6-8',
    description: 'Concept clarity in science, mathematics, and language with weekly progress checks.',
  },
  {
    title: 'Secondary Board Prep',
    level: 'Grades 9-10',
    description: 'Structured revision, problem-solving practice, and exam strategy coaching.',
  },
  {
    title: 'Science & Commerce Track',
    level: 'Grades 11-12',
    description: 'Focused subject mastery aligned with board and entrance requirements.',
  },
  {
    title: 'English & Communication',
    level: 'All levels',
    description: 'Reading, writing, and speaking support to build confidence and fluency.',
  },
  {
    title: 'Career Readiness',
    level: 'Senior students',
    description: 'Time management, goal setting, and mentorship for higher education planning.',
  },
]

const Courses = () => {
  return (
    <section id="courses" className="py-16 lg:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Courses</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">
            Programs built for steady progress and measurable results.
          </h2>
        </div>
        <p className="max-w-xl text-sm text-slate-500">
          Each course blends structured teaching, practice sessions, and feedback loops so students
          stay confident and consistent throughout the year.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div key={course.title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
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
