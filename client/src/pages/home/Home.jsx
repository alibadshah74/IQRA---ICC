import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import AboutIqra from '../../components/AboutIqra.jsx'
import Courses from '../../components/Courses.jsx'
import Teacher from '../../components/Teacher.jsx'
import Achievement from '../../components/Achievement.jsx'
import Testimonial from '../../components/Testimonial.jsx'
import Footer from '../../components/Footer.jsx'

const Home = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-6xl px-6">
        <Navbar />

        <section className="mt-10 grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Welcome to IQRA</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
              Knowledge with purpose and guidance with care.
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
              <a
                href="#about-iqra"
                className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-gray-50"
              >
                Learn More
              </a>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Learning Promise</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-500">
              <li>Focused lesson plans tailored to each grade and subject.</li>
              <li>Weekly feedback loops to keep students on track.</li>
              <li>Community-first culture that supports every learner.</li>
            </ul>
          </div>
        </section>

        <AboutIqra />
        <Courses />
        <Teacher />
        <Achievement />
        <Testimonial />

        <section id="why-iqra" className="py-16 lg:py-20">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Why IQRA</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">
              A learning environment built for steady growth.
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <h3 className="text-base font-semibold text-slate-900">Structured Learning</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Clear lesson plans, weekly assessments, and targeted revision sessions.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <h3 className="text-base font-semibold text-slate-900">Mentor Support</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Dedicated teachers who track progress and guide each student personally.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <h3 className="text-base font-semibold text-slate-900">Community Trust</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Families rely on IQRA for consistency, discipline, and measurable outcomes.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}

export default Home
