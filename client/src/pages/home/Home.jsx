import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import AboutIqra from '../../components/AboutIqra.jsx'
import Courses from '../../components/Courses.jsx'
import Teacher from '../../components/Teacher.jsx'
import Achievement from '../../components/Achievement.jsx'
import Testimonial from '../../components/Testimonial.jsx'
import Footer from '../../components/Footer.jsx'
import NoticeBoard from '../../components/NoticeBoard.jsx'

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-6">
        <Navbar />

        <section className="mt-10 grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Welcome to IQRA</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
              Addmission Open for 2026-2027
            </h1>
            <p className="mt-4 text-base text-slate-500 md:text-lg">
              IQRA Coaching Center builds confident learners through structured lessons, mentorship, and
              consistent progress tracking across every grade level.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/select-role"
                className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700"
              >
                Login
              </Link>
              <Link
                to="/gallery"
                className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-gray-50"
              >
                Gallery
              </Link>
            </div>
          </div>
          <NoticeBoard />
        </section>

        <AboutIqra />
        <Courses />
        <Teacher />
        <Achievement />
        <Testimonial />

        <section id="why-iqra" className="py-16 lg:py-20">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Why IQRA</p>
            <h3 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">
              A learning environment built.
            </h3>
            <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-6">
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-blue-600" />
                  <span>Structured lesson plans, weekly assessments, and targeted revision sessions.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-blue-600" />
                  <span>Dedicated mentors who track progress and guide each student personally.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-blue-600" />
                  <span>Community-first culture that keeps families connected and informed.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-blue-600" />
                  <span>Consistent practice routines that build confidence ahead of exams.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-blue-600" />
                  <span>Transparent progress tracking with measurable academic outcomes.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}

export default Home
